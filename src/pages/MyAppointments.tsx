import {
  useEffect,
  useMemo,
  useState,
} from "react";

import axios from "axios";

import {
  cancelAppointment,
  getMyAppointments,
} from "../api/appointmentApi";

import type {
  PatientAppointment,
} from "../api/appointmentApi";

import PaymentModal from "../components/PaymentModal";

type FilterType =
  | "all"
  | "pending"
  | "confirmed"
  | "cancelled"
  | "completed";

const formatDate = (
  value: string,
) => {
  if (!value) {
    return "Date unavailable";
  }

  const cleanDate =
    value.includes("T")
      ? value.split("T")[0]
      : value;

  const date =
    new Date(
      `${cleanDate}T12:00:00`,
    );

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return value;
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    },
  ).format(date);
};

const formatTime = (
  value: string,
) => {
  if (!value) {
    return "Time unavailable";
  }

  const match =
    value.match(
      /^(\d{1,2}):(\d{2})$/,
    );

  if (!match) {
    return value;
  }

  const hours =
    Number(match[1]);

  const minutes =
    match[2];

  const period =
    hours >= 12
      ? "PM"
      : "AM";

  const displayHour =
    hours % 12 || 12;

  return `${displayHour}:${minutes} ${period}`;
};

const getStatusStyle = (
  status: PatientAppointment["status"],
) => {
  switch (status) {
    case "confirmed":
      return {
        badge:
          "border-emerald-200 bg-emerald-50 text-emerald-700",
        dot:
          "bg-emerald-500",
      };

    case "completed":
      return {
        badge:
          "border-blue-200 bg-blue-50 text-blue-700",
        dot:
          "bg-blue-500",
      };

    case "cancelled":
      return {
        badge:
          "border-red-200 bg-red-50 text-red-700",
        dot:
          "bg-red-500",
      };

    default:
      return {
        badge:
          "border-amber-200 bg-amber-50 text-amber-700",
        dot:
          "bg-amber-500",
      };
  }
};

const getErrorMessage = (
  error: unknown,
  fallback: string,
) => {
  if (
    axios.isAxiosError(
      error,
    )
  ) {
    return (
      error.response?.data
        ?.message ||
      error.response?.data
        ?.error ||
      fallback
    );
  }

  return fallback;
};

const CalendarIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    className="h-5 w-5"
  >
    <rect
      x="3"
      y="5"
      width="18"
      height="16"
      rx="3"
    />

    <path d="M8 3v4M16 3v4M3 10h18" />
  </svg>
);

const ClockIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    className="h-5 w-5"
  >
    <circle
      cx="12"
      cy="12"
      r="9"
    />

    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 7v5l3 2"
    />
  </svg>
);

const RefreshIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    className="h-5 w-5"
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

const AppointmentSkeleton = () => (
  <div className="animate-pulse rounded-[28px] border border-slate-200 bg-white p-5 sm:p-6">
    <div className="flex gap-4">
      <div className="h-14 w-14 shrink-0 rounded-2xl bg-slate-100" />

      <div className="flex-1">
        <div className="h-5 w-40 rounded bg-slate-100" />

        <div className="mt-2 h-4 w-28 rounded bg-slate-100" />

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="h-16 rounded-2xl bg-slate-50" />

          <div className="h-16 rounded-2xl bg-slate-50" />
        </div>
      </div>
    </div>
  </div>
);

export default function MyAppointments() {
  const [
    appointments,
    setAppointments,
  ] =
    useState<
      PatientAppointment[]
    >([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    activeFilter,
    setActiveFilter,
  ] =
    useState<FilterType>(
      "all",
    );

  const [
    paymentAppointment,
    setPaymentAppointment,
  ] =
    useState<
      PatientAppointment | null
    >(null);

  const [
    cancellingAppointment,
    setCancellingAppointment,
  ] =
    useState<
      PatientAppointment | null
    >(null);

  const [
    cancellingId,
    setCancellingId,
  ] =
    useState<string | null>(
      null,
    );

  const fetchAppointments =
    async (
      showLoading = true,
    ) => {
      try {
        if (showLoading) {
          setLoading(true);
        }

        setError("");

        const data =
          await getMyAppointments();

        setAppointments(
          Array.isArray(
            data.appointments,
          )
            ? data.appointments
            : [],
        );
      } catch (error) {
        setError(
          getErrorMessage(
            error,
            "Failed to load appointments.",
          ),
        );
      } finally {
        if (showLoading) {
          setLoading(false);
        }
      }
    };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handlePaymentSuccess = (
    updatedAppointment:
      PatientAppointment,
  ) => {
    setAppointments(
      (current) =>
        current.map(
          (appointment) =>
            appointment._id ===
            updatedAppointment._id
              ? updatedAppointment
              : appointment,
        ),
    );

    setPaymentAppointment(
      null,
    );

    setError("");
  };

  const handleCancel =
    async () => {
      if (
        !cancellingAppointment
      ) {
        return;
      }

      try {
        setCancellingId(
          cancellingAppointment._id,
        );

        setError("");

        const data =
          await cancelAppointment(
            cancellingAppointment._id,
          );

        const updatedAppointment =
          data?.appointment as
            | PatientAppointment
            | undefined;

        if (
          updatedAppointment
        ) {
          setAppointments(
            (current) =>
              current.map(
                (
                  appointment,
                ) =>
                  appointment._id ===
                  updatedAppointment._id
                    ? updatedAppointment
                    : appointment,
              ),
          );
        } else {
          setAppointments(
            (current) =>
              current.map(
                (
                  appointment,
                ) =>
                  appointment._id ===
                  cancellingAppointment._id
                    ? {
                        ...appointment,
                        status:
                          "cancelled",
                      }
                    : appointment,
              ),
          );
        }

        setCancellingAppointment(
          null,
        );
      } catch (error) {
        setError(
          getErrorMessage(
            error,
            "Failed to cancel appointment.",
          ),
        );

        setCancellingAppointment(
          null,
        );
      } finally {
        setCancellingId(
          null,
        );
      }
    };

  const counts =
    useMemo(() => {
      return {
        all:
          appointments.length,

        pending:
          appointments.filter(
            (appointment) =>
              appointment.status ===
              "pending",
          ).length,

        confirmed:
          appointments.filter(
            (appointment) =>
              appointment.status ===
              "confirmed",
          ).length,

        completed:
          appointments.filter(
            (appointment) =>
              appointment.status ===
              "completed",
          ).length,

        cancelled:
          appointments.filter(
            (appointment) =>
              appointment.status ===
              "cancelled",
          ).length,
      };
    }, [appointments]);

  const filteredAppointments =
    useMemo(() => {
      if (
        activeFilter ===
        "all"
      ) {
        return appointments;
      }

      return appointments.filter(
        (appointment) =>
          appointment.status ===
          activeFilter,
      );
    }, [
      appointments,
      activeFilter,
    ]);

  const filters: {
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

  return (
    <main className="min-h-screen bg-slate-50/70">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-blue-600">
              Patient dashboard
            </p>

            <h1 className="mt-3 text-3xl font-black tracking-[-0.04em] text-slate-950 sm:text-4xl">
              My Appointments
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
              View your appointments,
              complete payments and
              manage upcoming bookings.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              fetchAppointments(
                false,
              )
            }
            className="inline-flex h-11 w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
          >
            <RefreshIcon />

            Refresh
          </button>
        </div>

        {!loading &&
          appointments.length >
            0 && (
            <div className="mt-8 flex gap-2 overflow-x-auto border-b border-slate-200 pb-3">
              {filters.map(
                (filter) => {
                  const active =
                    activeFilter ===
                    filter.key;

                  return (
                    <button
                      key={
                        filter.key
                      }
                      type="button"
                      onClick={() =>
                        setActiveFilter(
                          filter.key,
                        )
                      }
                      className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                        active
                          ? "bg-slate-900 text-white"
                          : "bg-white text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                      }`}
                    >
                      {
                        filter.label
                      }

                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] ${
                          active
                            ? "bg-white/15 text-white"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {
                          filter.count
                        }
                      </span>
                    </button>
                  );
                },
              )}
            </div>
          )}

        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {loading && (
          <div className="mt-8 space-y-4">
            {Array.from({
              length: 3,
            }).map(
              (
                _,
                index,
              ) => (
                <AppointmentSkeleton
                  key={
                    index
                  }
                />
              ),
            )}
          </div>
        )}

        {!loading &&
          appointments.length ===
            0 && (
            <div className="mt-8 rounded-[32px] border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <CalendarIcon />
              </div>

              <h2 className="mt-5 text-xl font-black text-slate-900">
                No appointments yet
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Your booked
                appointments will
                appear here.
              </p>
            </div>
          )}

        {!loading &&
          appointments.length >
            0 &&
          filteredAppointments.length ===
            0 && (
            <div className="mt-8 rounded-[28px] border border-slate-200 bg-white px-6 py-12 text-center">
              <p className="font-bold text-slate-900">
                No{" "}
                {activeFilter}{" "}
                appointments
              </p>

              <button
                type="button"
                onClick={() =>
                  setActiveFilter(
                    "all",
                  )
                }
                className="mt-4 text-sm font-bold text-blue-600"
              >
                View all
              </button>
            </div>
          )}

        {!loading &&
          filteredAppointments.length >
            0 && (
            <div className="mt-8 space-y-4">
              {filteredAppointments.map(
                (
                  appointment,
                ) => {
                  const statusStyle =
                    getStatusStyle(
                      appointment.status,
                    );

                  const doctorName =
                    appointment.doctor
                      ?.user?.name ||
                    "Doctor";

                  const specialty =
                    appointment.doctor
                      ?.specialty ||
                    appointment.doctor
                      ?.specialization ||
                    "General";

                  const image =
                    appointment.doctor
                      ?.user
                      ?.profilePicture;

                  const fee =
                    appointment.fees;

                  const paymentStatus =
                    appointment.payment
                      ?.status ||
                    "unpaid";

                  const canPay =
                    appointment.status ===
                      "pending" &&
                    paymentStatus !==
                      "paid";

                  const canCancel =
                    appointment.status ===
                      "pending" ||
                    appointment.status ===
                      "confirmed";

                  return (
                    <article
                      key={
                        appointment._id
                      }
                      className="overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.04)]"
                    >
                      <div className="p-5 sm:p-6">
                        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-start">
                          <div className="flex min-w-0 gap-4">
                            {image ? (
                              <img
                                src={
                                  image
                                }
                                alt={
                                  doctorName
                                }
                                className="h-14 w-14 shrink-0 rounded-2xl object-cover"
                              />
                            ) : (
                              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-lg font-black text-blue-600">
                                {doctorName
                                  .charAt(
                                    0,
                                  )
                                  .toUpperCase()}
                              </div>
                            )}

                            <div className="min-w-0">
                              <p className="text-xs font-bold uppercase tracking-[0.12em] text-blue-600">
                                Doctor
                              </p>

                              <h2 className="mt-1 truncate text-lg font-black text-slate-950">
                                Dr.{" "}
                                {
                                  doctorName
                                }
                              </h2>

                              <p className="mt-1 text-sm text-slate-500">
                                {
                                  specialty
                                }
                              </p>

                              <div className="mt-3 flex flex-wrap gap-2">
                                <span
                                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold capitalize ${statusStyle.badge}`}
                                >
                                  <span
                                    className={`h-1.5 w-1.5 rounded-full ${statusStyle.dot}`}
                                  />

                                  {
                                    appointment.status
                                  }
                                </span>

                                <span
                                  className={`rounded-full border px-3 py-1 text-xs font-bold capitalize ${
                                    paymentStatus ===
                                    "paid"
                                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                      : "border-slate-200 bg-slate-50 text-slate-600"
                                  }`}
                                >
                                  Payment:{" "}
                                  {
                                    paymentStatus
                                  }
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {canPay && (
                              <button
                                type="button"
                                onClick={() =>
                                  setPaymentAppointment(
                                    appointment,
                                  )
                                }
                                className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700"
                              >
                                Pay now
                              </button>
                            )}

                            {canCancel && (
                              <button
                                type="button"
                                onClick={() =>
                                  setCancellingAppointment(
                                    appointment,
                                  )
                                }
                                disabled={
                                  cancellingId ===
                                  appointment._id
                                }
                                className="rounded-xl border border-red-100 bg-red-50 px-4 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="mt-6 grid gap-3 sm:grid-cols-2">
                          <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                              <CalendarIcon />
                            </div>

                            <div>
                              <p className="text-xs text-slate-400">
                                Appointment
                                date
                              </p>

                              <p className="mt-0.5 text-sm font-bold text-slate-800">
                                {formatDate(
                                  appointment.date,
                                )}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                              <ClockIcon />
                            </div>

                            <div>
                              <p className="text-xs text-slate-400">
                                Appointment
                                time
                              </p>

                              <p className="mt-0.5 text-sm font-bold text-slate-800">
                                {formatTime(
                                  appointment.timeSlot,
                                )}
                              </p>
                            </div>
                          </div>
                        </div>

                        {fee !==
                          undefined && (
                          <div className="mt-3 rounded-2xl bg-slate-50 px-4 py-3">
                            <p className="text-xs text-slate-400">
                              Consultation fee
                            </p>

                            <p className="mt-1 text-sm font-bold text-slate-800">
                              $
                              {fee}
                            </p>
                          </div>
                        )}
                      </div>

                      {appointment.status ===
                        "pending" &&
                        paymentStatus !==
                          "paid" && (
                          <div className="border-t border-amber-100 bg-amber-50/60 px-5 py-3 sm:px-6">
                            <p className="text-xs font-medium text-amber-700">
                              Complete
                              payment to
                              confirm your
                              appointment.
                            </p>
                          </div>
                        )}

                      {appointment.status ===
                        "confirmed" && (
                        <div className="border-t border-emerald-100 bg-emerald-50/60 px-5 py-3 sm:px-6">
                          <p className="text-xs font-medium text-emerald-700">
                            Your
                            appointment is
                            confirmed.
                          </p>
                        </div>
                      )}

                      {appointment.status ===
                        "completed" && (
                        <div className="border-t border-blue-100 bg-blue-50/60 px-5 py-3 sm:px-6">
                          <p className="text-xs font-medium text-blue-700">
                            This
                            appointment
                            has been
                            completed.
                          </p>
                        </div>
                      )}

                      {appointment.status ===
                        "cancelled" && (
                        <div className="border-t border-red-100 bg-red-50/60 px-5 py-3 sm:px-6">
                          <p className="text-xs font-medium text-red-700">
                            This
                            appointment
                            was cancelled.
                          </p>
                        </div>
                      )}
                    </article>
                  );
                },
              )}
            </div>
          )}
      </div>

      {paymentAppointment && (
        <PaymentModal
          appointment={
            paymentAppointment
          }
          onClose={() =>
            setPaymentAppointment(
              null,
            )
          }
          onSuccess={
            handlePaymentSuccess
          }
        />
      )}

      {cancellingAppointment && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/40 px-4 backdrop-blur-sm">
          <button
            type="button"
            aria-label="Close"
            onClick={() =>
              setCancellingAppointment(
                null,
              )
            }
            className="absolute inset-0"
          />

          <div className="relative z-10 w-full max-w-md rounded-[28px] bg-white p-6 shadow-[0_30px_100px_rgba(15,23,42,0.25)]">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-xl font-black text-red-600">
              ×
            </div>

            <h2 className="mt-5 text-xl font-black text-slate-950">
              Cancel appointment?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Are you sure you
              want to cancel your
              appointment with Dr.{" "}
              {
                cancellingAppointment
                  .doctor?.user
                  ?.name
              }
              ?
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() =>
                  setCancellingAppointment(
                    null,
                  )
                }
                disabled={
                  cancellingId !==
                  null
                }
                className="h-12 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Go back
              </button>

              <button
                type="button"
                onClick={
                  handleCancel
                }
                disabled={
                  cancellingId !==
                  null
                }
                className="flex h-12 items-center justify-center rounded-xl bg-red-600 text-sm font-bold text-white transition hover:bg-red-700 disabled:opacity-50"
              >
                {cancellingId
                  ? "Cancelling..."
                  : "Cancel appointment"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}