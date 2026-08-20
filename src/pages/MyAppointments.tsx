import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getMyAppointments, cancelAppointment } from "../api/appointmentApi";

import PaymentModal from "../components/PaymentModal";

import type { PatientAppointment } from "../api/appointmentApi";

type AppointmentStatus = "pending" | "confirmed" | "cancelled" | "completed";

type PaymentStatus = "unpaid" | "paid";

interface Appointment {
  _id: string;

  doctor: {
    user: {
      name: string;
      profilePicture?: string;
    };

    /*
      Supporting both names while we standardize
      frontend/backend types later.
    */
    specialization?: string;
    specialty?: string;
  };

  timeSlot: string;
  date: string;

  status: AppointmentStatus;

  payment?: {
    status: PaymentStatus;
  };
}

type FilterType = "all" | "upcoming" | "completed" | "cancelled";

/* =========================================================
   ICONS
========================================================= */

const CalendarIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className="h-5 w-5"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    <rect x="3" y="5" width="18" height="16" rx="3" />
    <path d="M8 3v4M16 3v4M3 10h18" />
  </svg>
);

const ClockIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className="h-5 w-5"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    <circle cx="12" cy="12" r="9" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 2" />
  </svg>
);

const UserIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className="h-5 w-5"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    <circle cx="12" cy="8" r="4" />
    <path strokeLinecap="round" d="M4 21a8 8 0 0 1 16 0" />
  </svg>
);

const WalletIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className="h-5 w-5"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    <rect x="3" y="5" width="18" height="15" rx="3" />
    <path d="M3 9h18" />
    <circle cx="17" cy="14" r="1" />
  </svg>
);

const PlusIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className="h-5 w-5"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path strokeLinecap="round" d="M12 5v14M5 12h14" />
  </svg>
);

const RefreshIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className="h-5 w-5"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M20 7v5h-5M4 17v-5h5"
    />
    <path
      strokeLinecap="round"
      d="M6.1 8A7 7 0 0 1 18.7 7M17.9 16A7 7 0 0 1 5.3 17"
    />
  </svg>
);

const CheckIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className="h-5 w-5"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="m5 12 4 4L19 6" />
  </svg>
);

const CloseIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className="h-5 w-5"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path strokeLinecap="round" d="m6 6 12 12M18 6 6 18" />
  </svg>
);

/* =========================================================
   HELPERS
========================================================= */

const formatDate = (date: string) => {
  if (!date) return "Date unavailable";

  try {
    /*
      Adding midday avoids some timezone-related
      date shifting for YYYY-MM-DD strings.
    */
    const parsedDate = date.includes("T")
      ? new Date(date)
      : new Date(`${date}T12:00:00`);

    return new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(parsedDate);
  } catch {
    return date;
  }
};

const capitalize = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1);

const getStatusStyles = (status: AppointmentStatus) => {
  switch (status) {
    case "confirmed":
      return {
        wrapper: "border-emerald-100 bg-emerald-50 text-emerald-700",
        dot: "bg-emerald-500",
      };

    case "cancelled":
      return {
        wrapper: "border-red-100 bg-red-50 text-red-700",
        dot: "bg-red-500",
      };

    case "completed":
      return {
        wrapper: "border-blue-100 bg-blue-50 text-blue-700",
        dot: "bg-blue-500",
      };

    default:
      return {
        wrapper: "border-amber-100 bg-amber-50 text-amber-700",
        dot: "bg-amber-500",
      };
  }
};

/* =========================================================
   LOADING SKELETON
========================================================= */

const AppointmentSkeleton = () => (
  <div className="rounded-[28px] border border-slate-200 bg-white p-5 sm:p-6">
    <div className="flex gap-4">
      <div className="h-14 w-14 shrink-0 animate-pulse rounded-2xl bg-slate-100" />

      <div className="flex-1">
        <div className="h-5 w-40 animate-pulse rounded bg-slate-100" />

        <div className="mt-2 h-4 w-28 animate-pulse rounded bg-slate-100" />

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="h-14 animate-pulse rounded-2xl bg-slate-50" />
          <div className="h-14 animate-pulse rounded-2xl bg-slate-50" />
        </div>
      </div>
    </div>
  </div>
);

/* =========================================================
   COMPONENT
========================================================= */

export default function MyAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [activeFilter, setActiveFilter] = useState<FilterType>("all");

  const [appointmentToCancel, setAppointmentToCancel] =
    useState<Appointment | null>(null);

  const [cancellingId, setCancellingId] = useState<string | null>(null);

  /* =========================================================
     FETCH
  ========================================================= */

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getMyAppointments();

      setAppointments(
        Array.isArray(data?.appointments) ? data.appointments : [],
      );

      setAppointments(data?.appointments || []);
    } catch (err: any) {
      console.error("Failed to load appointments", err);

      setError(
        err.response?.data?.message ||
          "We couldn't load your appointments. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  /* =========================================================
     CANCEL
  ========================================================= */

  const handleCancel = async () => {
    if (!appointmentToCancel) return;

    try {
      setCancellingId(appointmentToCancel._id);

      setError("");

      await cancelAppointment(appointmentToCancel._id);

      /*
        Update locally immediately so we don't
        need to flash the whole page loading again.
      */

      setAppointments((current) =>
        current.map((appointment) =>
          appointment._id === appointmentToCancel._id
            ? {
                ...appointment,
                status: "cancelled",
              }
            : appointment,
        ),
      );

      setAppointmentToCancel(null);
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Failed to cancel the appointment.",
      );
    } finally {
      setCancellingId(null);
    }
  };

  /* =========================================================
     COUNTS
  ========================================================= */

  const counts = useMemo(() => {
    return {
      all: appointments.length,

      upcoming: appointments.filter(
        (appointment) =>
          appointment.status === "pending" ||
          appointment.status === "confirmed",
      ).length,

      completed: appointments.filter(
        (appointment) => appointment.status === "completed",
      ).length,

      cancelled: appointments.filter(
        (appointment) => appointment.status === "cancelled",
      ).length,
    };
  }, [appointments]);

  /* =========================================================
     FILTER
  ========================================================= */

  const filteredAppointments = useMemo(() => {
    if (activeFilter === "all") {
      return appointments;
    }

    if (activeFilter === "upcoming") {
      return appointments.filter(
        (appointment) =>
          appointment.status === "pending" ||
          appointment.status === "confirmed",
      );
    }

    return appointments.filter(
      (appointment) => appointment.status === activeFilter,
    );
  }, [appointments, activeFilter]);

  const filterTabs: {
    key: FilterType;
    label: string;
    count: number;
  }[] = [
    {
      key: "all",
      label: "All",
      count: counts.all,
    },

    {
      key: "upcoming",
      label: "Upcoming",
      count: counts.upcoming,
    },

    {
      key: "completed",
      label: "Completed",
      count: counts.completed,
    },

    {
      key: "cancelled",
      label: "Cancelled",
      count: counts.cancelled,
    },
  ];

  return (
    <main className="min-h-screen bg-slate-50/70">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        {/* =====================================================
            HEADER
        ====================================================== */}

        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-blue-600">
              Patient dashboard
            </p>

            <h1 className="mt-3 text-3xl font-black tracking-[-0.04em] text-slate-950 sm:text-4xl">
              My appointments
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">
              View and manage your upcoming and previous appointments.
            </p>
          </div>

          <Link
            to="/"
            className="inline-flex h-12 w-fit items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5 hover:bg-blue-700"
          >
            <PlusIcon />
            Book appointment
          </Link>
        </div>

        {/* =====================================================
            SUMMARY CARDS
        ====================================================== */}

        {!loading && !error && (
          <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                <CalendarIcon />
              </div>

              <p className="mt-4 text-2xl font-black text-slate-950">
                {counts.all}
              </p>

              <p className="mt-1 text-xs font-medium text-slate-500 sm:text-sm">
                Total appointments
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <ClockIcon />
              </div>

              <p className="mt-4 text-2xl font-black text-slate-950">
                {counts.upcoming}
              </p>

              <p className="mt-1 text-xs font-medium text-slate-500 sm:text-sm">
                Upcoming
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <CheckIcon />
              </div>

              <p className="mt-4 text-2xl font-black text-slate-950">
                {counts.completed}
              </p>

              <p className="mt-1 text-xs font-medium text-slate-500 sm:text-sm">
                Completed
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
                <CloseIcon />
              </div>

              <p className="mt-4 text-2xl font-black text-slate-950">
                {counts.cancelled}
              </p>

              <p className="mt-1 text-xs font-medium text-slate-500 sm:text-sm">
                Cancelled
              </p>
            </div>
          </div>
        )}

        {/* =====================================================
            FILTERS
        ====================================================== */}

        {!loading && !error && appointments.length > 0 && (
          <div className="no-scrollbar mt-8 flex gap-2 overflow-x-auto border-b border-slate-200 pb-3">
            {filterTabs.map((tab) => {
              const active = activeFilter === tab.key;

              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveFilter(tab.key)}
                  className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                    active
                      ? "bg-slate-900 text-white"
                      : "bg-white text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  {tab.label}

                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] ${
                      active
                        ? "bg-white/15 text-white"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* =====================================================
            LOADING
        ====================================================== */}

        {loading && (
          <div className="mt-8 space-y-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <AppointmentSkeleton key={index} />
            ))}
          </div>
        )}

        {/* =====================================================
            ERROR
        ====================================================== */}

        {!loading && error && (
          <div className="mt-8 rounded-[28px] border border-red-100 bg-red-50 p-6 sm:p-8">
            <div className="flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
              <div>
                <h2 className="font-bold text-red-800">Something went wrong</h2>

                <p className="mt-1 text-sm leading-6 text-red-600">{error}</p>
              </div>

              <button
                type="button"
                onClick={fetchAppointments}
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-white px-4 text-sm font-bold text-red-700 shadow-sm transition hover:bg-red-100"
              >
                <RefreshIcon />
                Try again
              </button>
            </div>
          </div>
        )}

        {/* =====================================================
            EMPTY STATE
        ====================================================== */}

        {!loading && !error && appointments.length === 0 && (
          <div className="mt-8 rounded-[32px] border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <CalendarIcon />
            </div>

            <h2 className="mt-5 text-xl font-black text-slate-900">
              No appointments yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              When you book an appointment with a doctor, you'll be able to
              track it here.
            </p>

            <Link
              to="/"
              className="mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-bold text-white shadow-lg shadow-blue-600/20"
            >
              <PlusIcon />
              Find a doctor
            </Link>
          </div>
        )}

        {/* =====================================================
            FILTER EMPTY STATE
        ====================================================== */}

        {!loading &&
          !error &&
          appointments.length > 0 &&
          filteredAppointments.length === 0 && (
            <div className="mt-8 rounded-[28px] border border-slate-200 bg-white px-6 py-12 text-center">
              <p className="font-bold text-slate-900">
                No {activeFilter} appointments
              </p>

              <p className="mt-2 text-sm text-slate-500">
                There are currently no appointments in this category.
              </p>

              <button
                type="button"
                onClick={() => setActiveFilter("all")}
                className="mt-5 text-sm font-bold text-blue-600"
              >
                View all appointments
              </button>
            </div>
          )}

        {/* =====================================================
            APPOINTMENTS
        ====================================================== */}

        {!loading && !error && filteredAppointments.length > 0 && (
          <div className="mt-8 space-y-4">
            {filteredAppointments.map((appointment) => {
              const statusStyle = getStatusStyles(appointment.status);

              const specialty =
                appointment.doctor?.specialty ||
                appointment.doctor?.specialization ||
                "Doctor";

              const doctorName = appointment.doctor?.user?.name || "Doctor";

              const profilePicture = appointment.doctor?.user?.profilePicture;

              const paymentStatus = appointment.payment?.status;

              return (
                <article
                  key={appointment._id}
                  className="group overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.04)] transition hover:border-blue-100 hover:shadow-[0_16px_45px_rgba(15,23,42,0.07)]"
                >
                  <div className="p-5 sm:p-6">
                    {/* ===========================
                            TOP
                        ============================ */}

                    <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
                      <div className="flex min-w-0 gap-4">
                        {/* Doctor avatar */}

                        {profilePicture ? (
                          <img
                            src={profilePicture}
                            alt={doctorName}
                            className="h-14 w-14 shrink-0 rounded-2xl object-cover object-top"
                          />
                        ) : (
                          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-cyan-50 text-lg font-black text-blue-600">
                            {doctorName.charAt(0).toUpperCase()}
                          </div>
                        )}

                        <div className="min-w-0">
                          <p className="text-xs font-bold uppercase tracking-[0.12em] text-blue-600">
                            {specialty}
                          </p>

                          <h2 className="mt-1 truncate text-lg font-black text-slate-950">
                            Dr. {doctorName}
                          </h2>

                          <div className="mt-2 flex flex-wrap gap-2">
                            {/* Status */}

                            <span
                              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold capitalize ${statusStyle.wrapper}`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${statusStyle.dot}`}
                              />

                              {appointment.status}
                            </span>

                            {/* Payment */}

                            {paymentStatus && (
                              <span
                                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold capitalize ${
                                  paymentStatus === "paid"
                                    ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                                    : "border-amber-100 bg-amber-50 text-amber-700"
                                }`}
                              >
                                <WalletIcon />

                                {paymentStatus}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Cancel desktop */}

                      {appointment.status === "pending" && (
                        <button
                          type="button"
                          onClick={() => setAppointmentToCancel(appointment)}
                          disabled={cancellingId === appointment._id}
                          className="hidden rounded-xl border border-red-100 bg-red-50 px-4 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-100 disabled:opacity-50 sm:inline-flex"
                        >
                          Cancel
                        </button>
                      )}
                    </div>

                    {/* ===========================
                            APPOINTMENT DETAILS
                        ============================ */}

                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                      <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                          <CalendarIcon />
                        </div>

                        <div>
                          <p className="text-xs font-medium text-slate-400">
                            Appointment date
                          </p>

                          <p className="mt-0.5 text-sm font-bold text-slate-800">
                            {formatDate(appointment.date)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                          <ClockIcon />
                        </div>

                        <div>
                          <p className="text-xs font-medium text-slate-400">
                            Appointment time
                          </p>

                          <p className="mt-0.5 text-sm font-bold text-slate-800">
                            {appointment.timeSlot}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Mobile cancel */}

                    {appointment.status === "pending" && (
                      <button
                        type="button"
                        onClick={() => setAppointmentToCancel(appointment)}
                        disabled={cancellingId === appointment._id}
                        className="mt-4 flex h-11 w-full items-center justify-center rounded-xl border border-red-100 bg-red-50 text-sm font-bold text-red-600 transition hover:bg-red-100 disabled:opacity-50 sm:hidden"
                      >
                        Cancel appointment
                      </button>
                    )}
                  </div>

                  {/* ===========================
                          FOOTER STATUS MESSAGE
                      ============================ */}

                  {appointment.status === "pending" && (
                    <div className="border-t border-amber-100 bg-amber-50/60 px-5 py-3 sm:px-6">
                      <p className="text-xs font-medium text-amber-700">
                        Waiting for doctor confirmation.
                      </p>
                    </div>
                  )}

                  {appointment.status === "confirmed" && (
                    <div className="border-t border-emerald-100 bg-emerald-50/60 px-5 py-3 sm:px-6">
                      <p className="text-xs font-medium text-emerald-700">
                        Your appointment has been confirmed.
                      </p>
                    </div>
                  )}

                  {appointment.status === "completed" && (
                    <div className="border-t border-blue-100 bg-blue-50/60 px-5 py-3 sm:px-6">
                      <p className="text-xs font-medium text-blue-700">
                        This appointment has been completed.
                      </p>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* =====================================================
          CANCEL MODAL
      ====================================================== */}

      {appointmentToCancel && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 px-4 backdrop-blur-sm">
          <button
            type="button"
            aria-label="Close cancel dialog"
            onClick={() => setAppointmentToCancel(null)}
            className="absolute inset-0"
          />

          <div className="relative z-10 w-full max-w-md rounded-[28px] bg-white p-6 shadow-[0_30px_100px_rgba(15,23,42,0.25)] sm:p-7">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <CloseIcon />
            </div>

            <h2 className="mt-5 text-xl font-black text-slate-950">
              Cancel appointment?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Are you sure you want to cancel your appointment with{" "}
              <span className="font-bold text-slate-700">
                Dr. {appointmentToCancel.doctor.user.name}
              </span>
              ?
            </p>

            <div className="mt-4 rounded-2xl bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-sm">
                <CalendarIcon />

                <span className="font-semibold text-slate-700">
                  {formatDate(appointmentToCancel.date)}
                </span>
              </div>

              <div className="mt-2 flex items-center gap-2 text-sm">
                <ClockIcon />

                <span className="font-semibold text-slate-700">
                  {appointmentToCancel.timeSlot}
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setAppointmentToCancel(null)}
                disabled={cancellingId !== null}
                className="h-12 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              >
                Keep appointment
              </button>

              <button
                type="button"
                onClick={handleCancel}
                disabled={cancellingId !== null}
                className="flex h-12 items-center justify-center gap-2 rounded-xl bg-red-600 text-sm font-bold text-white transition hover:bg-red-700 disabled:opacity-60"
              >
                {cancellingId ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Cancelling...
                  </>
                ) : (
                  "Yes, cancel"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
