import { useEffect, useMemo, useState } from "react";
import {
  getDoctorAppointments,
  updateAppointmentStatus,
} from "../api/appointmentApi";

type AppointmentStatus = "pending" | "confirmed" | "cancelled" | "completed";

interface Appointment {
  _id: string;

  patient: {
    name: string;
    email: string;
    profilePicture?: string;
  };

  timeSlot: string;

  // If backend returns date, it will automatically show.
  date?: string;

  status: AppointmentStatus;
}

type FilterType = "all" | "pending" | "confirmed" | "completed" | "cancelled";

interface PendingAction {
  appointment: Appointment;
  status: AppointmentStatus;
}

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

const MailIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className="h-5 w-5"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    <rect x="3" y="5" width="18" height="14" rx="3" />
    <path strokeLinecap="round" strokeLinejoin="round" d="m4 7 8 6 8-6" />
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

/* =========================================================
   HELPERS
========================================================= */

const formatDate = (date?: string) => {
  if (!date) return "";

  try {
    const parsed = date.includes("T")
      ? new Date(date)
      : new Date(`${date}T12:00:00`);

    return new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(parsed);
  } catch {
    return date;
  }
};

const getStatusStyle = (status: AppointmentStatus) => {
  switch (status) {
    case "confirmed":
      return {
        badge: "border-emerald-100 bg-emerald-50 text-emerald-700",
        dot: "bg-emerald-500",
      };

    case "completed":
      return {
        badge: "border-blue-100 bg-blue-50 text-blue-700",
        dot: "bg-blue-500",
      };

    case "cancelled":
      return {
        badge: "border-red-100 bg-red-50 text-red-700",
        dot: "bg-red-500",
      };

    default:
      return {
        badge: "border-amber-100 bg-amber-50 text-amber-700",
        dot: "bg-amber-500",
      };
  }
};

/* =========================================================
   SKELETON
========================================================= */

const AppointmentSkeleton = () => (
  <div className="rounded-[28px] border border-slate-200 bg-white p-5 sm:p-6">
    <div className="flex gap-4">
      <div className="h-14 w-14 shrink-0 animate-pulse rounded-2xl bg-slate-100" />

      <div className="flex-1">
        <div className="h-5 w-40 animate-pulse rounded bg-slate-100" />

        <div className="mt-2 h-4 w-56 animate-pulse rounded bg-slate-100" />

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

export default function DoctorAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [activeFilter, setActiveFilter] = useState<FilterType>("all");

  const [pendingAction, setPendingAction] = useState<PendingAction | null>(
    null,
  );

  const [updatingId, setUpdatingId] = useState<string | null>(null);

  /* =========================================================
     FETCH
  ========================================================= */

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getDoctorAppointments();

      setAppointments(
        Array.isArray(data?.appointments) ? data.appointments : [],
      );

      setAppointments(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error(
        "Failed to load doctor appointments:",
        err.response?.status,
        err.response?.data,
      );

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
     UPDATE STATUS
  ========================================================= */

  const updateStatus = async () => {
    if (!pendingAction) return;

    const { appointment, status } = pendingAction;

    try {
      setUpdatingId(appointment._id);
      setError("");

      /*
        If your backend still expects PUT,
        change api.patch to api.put here.
      */

      await updateAppointmentStatus(appointment._id, status);

      /*
        Update UI immediately rather than
        refetching the whole page.
      */

      setAppointments((current) =>
        current.map((item) =>
          item._id === appointment._id
            ? {
                ...item,
                status,
              }
            : item,
        ),
      );

      setPendingAction(null);
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Failed to update appointment status.",
      );

      setPendingAction(null);
    } finally {
      setUpdatingId(null);
    }
  };

  /* =========================================================
     COUNTS
  ========================================================= */

  const counts = useMemo(() => {
    return {
      total: appointments.length,

      pending: appointments.filter(
        (appointment) => appointment.status === "pending",
      ).length,

      confirmed: appointments.filter(
        (appointment) => appointment.status === "confirmed",
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

    return appointments.filter(
      (appointment) => appointment.status === activeFilter,
    );
  }, [appointments, activeFilter]);

  const filters: {
    key: FilterType;
    label: string;
    count: number;
  }[] = [
    {
      key: "all",
      label: "All",
      count: counts.total,
    },
    {
      key: "pending",
      label: "Pending",
      count: counts.pending,
    },
    {
      key: "confirmed",
      label: "Confirmed",
      count: counts.confirmed,
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

  /* =========================================================
     ACTION MODAL TEXT
  ========================================================= */

  const getActionDetails = () => {
    if (!pendingAction) return null;

    switch (pendingAction.status) {
      case "confirmed":
        return {
          title: "Confirm appointment?",
          description: "The patient will see this appointment as confirmed.",
          button: "Confirm appointment",
          buttonClass: "bg-blue-600 hover:bg-blue-700",
          iconClass: "bg-blue-50 text-blue-600",
          icon: <CheckIcon />,
        };

      case "completed":
        return {
          title: "Mark as completed?",
          description: "This indicates that the appointment has taken place.",
          button: "Mark completed",
          buttonClass: "bg-slate-900 hover:bg-slate-800",
          iconClass: "bg-emerald-50 text-emerald-600",
          icon: <CheckIcon />,
        };

      case "cancelled":
        return {
          title: "Cancel appointment?",
          description: "This appointment will be cancelled for the patient.",
          button: "Cancel appointment",
          buttonClass: "bg-red-600 hover:bg-red-700",
          iconClass: "bg-red-50 text-red-600",
          icon: <CloseIcon />,
        };

      default:
        return null;
    }
  };

  const actionDetails = getActionDetails();

  return (
    <main className="min-h-screen bg-slate-50/70">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        {/* =====================================================
            HEADER
        ====================================================== */}

        <div>
          <p className="text-sm font-bold uppercase tracking-[0.14em] text-blue-600">
            Doctor dashboard
          </p>

          <h1 className="mt-3 text-3xl font-black tracking-[-0.04em] text-slate-950 sm:text-4xl">
            Appointments
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
            Review patient requests, confirm upcoming visits and keep your
            appointment history organized.
          </p>
        </div>

        {/* =====================================================
            SUMMARY
        ====================================================== */}

        {!loading && !error && (
          <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                <CalendarIcon />
              </div>

              <p className="mt-4 text-2xl font-black text-slate-950">
                {counts.total}
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
                {counts.pending}
              </p>

              <p className="mt-1 text-xs font-medium text-slate-500 sm:text-sm">
                Waiting approval
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <CheckIcon />
              </div>

              <p className="mt-4 text-2xl font-black text-slate-950">
                {counts.confirmed}
              </p>

              <p className="mt-1 text-xs font-medium text-slate-500 sm:text-sm">
                Confirmed
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
          </div>
        )}

        {/* =====================================================
            FILTERS
        ====================================================== */}

        {!loading && !error && appointments.length > 0 && (
          <div className="no-scrollbar mt-8 flex gap-2 overflow-x-auto border-b border-slate-200 pb-3">
            {filters.map((filter) => {
              const active = activeFilter === filter.key;

              return (
                <button
                  key={filter.key}
                  type="button"
                  onClick={() => setActiveFilter(filter.key)}
                  className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                    active
                      ? "bg-slate-900 text-white"
                      : "bg-white text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  {filter.label}

                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] ${
                      active
                        ? "bg-white/15 text-white"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {filter.count}
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
            {Array.from({
              length: 4,
            }).map((_, index) => (
              <AppointmentSkeleton key={index} />
            ))}
          </div>
        )}

        {/* =====================================================
            ERROR
        ====================================================== */}

        {!loading && error && (
          <div className="mt-8 rounded-[28px] border border-red-100 bg-red-50 p-6 sm:p-8">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
              <div>
                <h2 className="font-bold text-red-800">Something went wrong</h2>

                <p className="mt-1 text-sm leading-6 text-red-600">{error}</p>
              </div>

              <button
                type="button"
                onClick={fetchAppointments}
                className="inline-flex h-11 w-fit items-center gap-2 rounded-xl bg-white px-4 text-sm font-bold text-red-700 shadow-sm"
              >
                <RefreshIcon />
                Try again
              </button>
            </div>
          </div>
        )}

        {/* =====================================================
            EMPTY
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
              New patient appointment requests will appear here when they are
              booked.
            </p>
          </div>
        )}

        {/* =====================================================
            FILTER EMPTY
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
                There are no appointments in this category.
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
            APPOINTMENT LIST
        ====================================================== */}

        {!loading && !error && filteredAppointments.length > 0 && (
          <div className="mt-8 space-y-4">
            {filteredAppointments.map((appointment) => {
              const statusStyle = getStatusStyle(appointment.status);

              const patientName = appointment.patient?.name || "Patient";

              const patientEmail = appointment.patient?.email || "";

              const initial = patientName.charAt(0).toUpperCase();

              return (
                <article
                  key={appointment._id}
                  className="overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.04)] transition hover:border-blue-100 hover:shadow-[0_16px_45px_rgba(15,23,42,0.07)]"
                >
                  <div className="p-5 sm:p-6">
                    {/* Patient */}

                    <div className="flex flex-col justify-between gap-5 md:flex-row md:items-start">
                      <div className="flex min-w-0 gap-4">
                        {appointment.patient?.profilePicture ? (
                          <img
                            src={appointment.patient.profilePicture}
                            alt={patientName}
                            className="h-14 w-14 shrink-0 rounded-2xl object-cover"
                          />
                        ) : (
                          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-cyan-50 text-lg font-black text-blue-600">
                            {initial}
                          </div>
                        )}

                        <div className="min-w-0">
                          <p className="text-xs font-bold uppercase tracking-[0.12em] text-blue-600">
                            Patient
                          </p>

                          <h2 className="mt-1 truncate text-lg font-black text-slate-950">
                            {patientName}
                          </h2>

                          {patientEmail && (
                            <div className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                              <MailIcon />

                              <span className="truncate">{patientEmail}</span>
                            </div>
                          )}

                          <div className="mt-3">
                            <span
                              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold capitalize ${statusStyle.badge}`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${statusStyle.dot}`}
                              />

                              {appointment.status}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Desktop actions */}

                      <div className="hidden shrink-0 gap-2 sm:flex">
                        {appointment.status === "pending" && (
                          <>
                            <button
                              type="button"
                              onClick={() =>
                                setPendingAction({
                                  appointment,
                                  status: "confirmed",
                                })
                              }
                              disabled={updatingId === appointment._id}
                              className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700 disabled:opacity-50"
                            >
                              Confirm
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                setPendingAction({
                                  appointment,
                                  status: "cancelled",
                                })
                              }
                              disabled={updatingId === appointment._id}
                              className="rounded-xl border border-red-100 bg-red-50 px-4 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-100"
                            >
                              Cancel
                            </button>
                          </>
                        )}

                        {appointment.status === "confirmed" && (
                          <button
                            type="button"
                            onClick={() =>
                              setPendingAction({
                                appointment,
                                status: "completed",
                              })
                            }
                            disabled={updatingId === appointment._id}
                            className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800"
                          >
                            Mark completed
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Details */}

                    <div
                      className={`mt-6 grid gap-3 ${
                        appointment.date ? "sm:grid-cols-2" : ""
                      }`}
                    >
                      {appointment.date && (
                        <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                            <CalendarIcon />
                          </div>

                          <div>
                            <p className="text-xs text-slate-400">
                              Appointment date
                            </p>

                            <p className="mt-0.5 text-sm font-bold text-slate-800">
                              {formatDate(appointment.date)}
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                          <ClockIcon />
                        </div>

                        <div>
                          <p className="text-xs text-slate-400">
                            Appointment time
                          </p>

                          <p className="mt-0.5 text-sm font-bold text-slate-800">
                            {appointment.timeSlot}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Mobile actions */}

                    <div className="mt-4 grid gap-2 sm:hidden">
                      {appointment.status === "pending" && (
                        <>
                          <button
                            type="button"
                            onClick={() =>
                              setPendingAction({
                                appointment,
                                status: "confirmed",
                              })
                            }
                            className="h-12 rounded-xl bg-blue-600 text-sm font-bold text-white"
                          >
                            Confirm appointment
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              setPendingAction({
                                appointment,
                                status: "cancelled",
                              })
                            }
                            className="h-12 rounded-xl border border-red-100 bg-red-50 text-sm font-bold text-red-600"
                          >
                            Cancel appointment
                          </button>
                        </>
                      )}

                      {appointment.status === "confirmed" && (
                        <button
                          type="button"
                          onClick={() =>
                            setPendingAction({
                              appointment,
                              status: "completed",
                            })
                          }
                          className="h-12 rounded-xl bg-slate-900 text-sm font-bold text-white"
                        >
                          Mark as completed
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Status footer */}

                  {appointment.status === "pending" && (
                    <div className="border-t border-amber-100 bg-amber-50/60 px-5 py-3 sm:px-6">
                      <p className="text-xs font-medium text-amber-700">
                        This appointment is waiting for your confirmation.
                      </p>
                    </div>
                  )}

                  {appointment.status === "confirmed" && (
                    <div className="border-t border-emerald-100 bg-emerald-50/60 px-5 py-3 sm:px-6">
                      <p className="text-xs font-medium text-emerald-700">
                        Appointment confirmed with the patient.
                      </p>
                    </div>
                  )}

                  {appointment.status === "completed" && (
                    <div className="border-t border-blue-100 bg-blue-50/60 px-5 py-3 sm:px-6">
                      <p className="text-xs font-medium text-blue-700">
                        Appointment completed.
                      </p>
                    </div>
                  )}

                  {appointment.status === "cancelled" && (
                    <div className="border-t border-red-100 bg-red-50/60 px-5 py-3 sm:px-6">
                      <p className="text-xs font-medium text-red-700">
                        This appointment was cancelled.
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
          ACTION MODAL
      ====================================================== */}

      {pendingAction && actionDetails && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 px-4 backdrop-blur-sm">
          <button
            type="button"
            aria-label="Close dialog"
            onClick={() => setPendingAction(null)}
            className="absolute inset-0"
          />

          <div className="relative z-10 w-full max-w-md rounded-[28px] bg-white p-6 shadow-[0_30px_100px_rgba(15,23,42,0.25)] sm:p-7">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-2xl ${actionDetails.iconClass}`}
            >
              {actionDetails.icon}
            </div>

            <h2 className="mt-5 text-xl font-black text-slate-950">
              {actionDetails.title}
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              {actionDetails.description}
            </p>

            <div className="mt-4 rounded-2xl bg-slate-50 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                  <UserIcon />
                </div>

                <div>
                  <p className="text-xs text-slate-400">Patient</p>

                  <p className="font-bold text-slate-900">
                    {pendingAction.appointment.patient.name}
                  </p>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-2 text-sm text-slate-600">
                <ClockIcon />

                <span className="font-semibold">
                  {pendingAction.appointment.timeSlot}
                </span>
              </div>

              {pendingAction.appointment.date && (
                <div className="mt-2 flex items-center gap-2 text-sm text-slate-600">
                  <CalendarIcon />

                  <span className="font-semibold">
                    {formatDate(pendingAction.appointment.date)}
                  </span>
                </div>
              )}
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPendingAction(null)}
                disabled={updatingId !== null}
                className="h-12 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              >
                Go back
              </button>

              <button
                type="button"
                onClick={updateStatus}
                disabled={updatingId !== null}
                className={`flex h-12 items-center justify-center gap-2 rounded-xl text-sm font-bold text-white transition disabled:opacity-60 ${actionDetails.buttonClass}`}
              >
                {updatingId ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Updating...
                  </>
                ) : (
                  actionDetails.button
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
