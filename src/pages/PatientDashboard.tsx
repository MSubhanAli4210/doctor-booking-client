import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import {
  getMyAppointments,
} from "../api/appointmentApi";

import type {
  PatientAppointment,
  AppointmentStatus,
} from "../api/appointmentApi";

const getAppointmentTime = (
  appointment: PatientAppointment,
) => {
  return (
    appointment.timeSlot ||
    appointment.time ||
    ""
  );
};

const formatDate = (
  value?: string,
) => {
  if (!value) {
    return "Date unavailable";
  }

  const cleanDate = value.includes("T")
    ? value.split("T")[0]
    : value;

  const date = new Date(
    `${cleanDate}T12:00:00`,
  );

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return value;
  }

  return date.toLocaleDateString(
    undefined,
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    },
  );
};

const formatTime = (
  value?: string,
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

const getStatusClass = (
  status: AppointmentStatus,
) => {
  switch (status) {
    case "confirmed":
      return "bg-emerald-50 text-emerald-700";

    case "completed":
      return "bg-blue-50 text-blue-700";

    case "cancelled":
      return "bg-red-50 text-red-700";

    default:
      return "bg-amber-50 text-amber-700";
  }
};

const getAppointmentTimestamp = (
  appointment: PatientAppointment,
) => {
  if (!appointment.date) {
    return 0;
  }

  const cleanDate =
    appointment.date.includes("T")
      ? appointment.date.split("T")[0]
      : appointment.date;

  const time =
    getAppointmentTime(
      appointment,
    );

  const value = time
    ? `${cleanDate}T${time}:00`
    : `${cleanDate}T00:00:00`;

  const timestamp =
    new Date(value).getTime();

  return Number.isNaN(timestamp)
    ? 0
    : timestamp;
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

const ChatIcon = () => (
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
      d="M21 11.5a8.4 8.4 0 0 1-9 8.5 9.5 9.5 0 0 1-4-.9L3 21l1.7-4.3A8.5 8.5 0 1 1 21 11.5Z"
    />
  </svg>
);

const UserIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    className="h-5 w-5"
  >
    <circle
      cx="12"
      cy="8"
      r="4"
    />

    <path
      strokeLinecap="round"
      d="M4 21a8 8 0 0 1 16 0"
    />
  </svg>
);

const DoctorIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    className="h-5 w-5"
  >
    <circle
      cx="9"
      cy="8"
      r="4"
    />

    <path
      strokeLinecap="round"
      d="M2.5 21a6.5 6.5 0 0 1 13 0"
    />

    <path
      strokeLinecap="round"
      d="M19 8v6M16 11h6"
    />
  </svg>
);

const RefreshIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    className="h-4 w-4"
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

export default function PatientDashboard() {
  const { user } =
    useAuth();

  const currentUser =
    user as {
      name?: string;
      email?: string;
    } | null;

  const [
    appointments,
    setAppointments,
  ] = useState<
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

  const fetchAppointments =
    async () => {
      try {
        setLoading(true);
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
        console.error(
          "Failed to load patient dashboard:",
          error,
        );

        setError(
          "Unable to load dashboard data.",
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    void fetchAppointments();
  }, []);

  const counts =
    useMemo(() => {
      const now =
        Date.now();

      return {
        total:
          appointments.length,

        upcoming:
          appointments.filter(
            (appointment) => {
              if (
                appointment.status !==
                  "confirmed" &&
                appointment.status !==
                  "pending"
              ) {
                return false;
              }

              return (
                getAppointmentTimestamp(
                  appointment,
                ) >= now
              );
            },
          ).length,

        completed:
          appointments.filter(
            (appointment) =>
              appointment.status ===
              "completed",
          ).length,

        refunded:
          appointments.filter(
            (appointment) =>
              appointment.payment
                ?.status ===
              "refunded",
          ).length,
      };
    }, [appointments]);

  const upcomingAppointments =
    useMemo(() => {
      const now =
        Date.now();

      return appointments
        .filter(
          (appointment) => {
            if (
              appointment.status ===
                "cancelled" ||
              appointment.status ===
                "completed"
            ) {
              return false;
            }

            const timestamp =
              getAppointmentTimestamp(
                appointment,
              );

            return (
              timestamp >= now
            );
          },
        )
        .sort(
          (a, b) =>
            getAppointmentTimestamp(
              a,
            ) -
            getAppointmentTimestamp(
              b,
            ),
        )
        .slice(0, 3);
    }, [appointments]);

  const recentAppointments =
    useMemo(() => {
      return [
        ...appointments,
      ]
        .sort(
          (a, b) =>
            getAppointmentTimestamp(
              b,
            ) -
            getAppointmentTimestamp(
              a,
            ),
        )
        .slice(0, 5);
    }, [appointments]);

  const firstName =
    currentUser?.name
      ?.trim()
      .split(" ")[0] ||
    "Patient";

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />

          <p className="text-sm text-slate-500">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50/70">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-blue-600">
              Patient dashboard
            </p>

            <h1 className="mt-3 text-3xl font-black tracking-[-0.04em] text-slate-950 sm:text-4xl">
              Welcome back,{" "}
              {firstName}
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
              Manage your appointments,
              messages and healthcare
              activity from one place.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              void fetchAppointments()
            }
            className="inline-flex h-11 w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
          >
            <RefreshIcon />

            Refresh
          </button>
        </div>

        {error && (
          <div className="mt-6 flex items-center justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm font-medium text-red-700">
              {error}
            </p>

            <button
              type="button"
              onClick={() =>
                void fetchAppointments()
              }
              className="shrink-0 text-sm font-bold text-red-700 hover:underline"
            >
              Try again
            </button>
          </div>
        )}

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Appointments"
            value={counts.total}
            description="All your bookings"
          />

          <StatCard
            title="Upcoming"
            value={counts.upcoming}
            description="Appointments ahead"
          />

          <StatCard
            title="Completed"
            value={counts.completed}
            description="Finished visits"
          />

          <StatCard
            title="Refunded"
            value={counts.refunded}
            description="Refunded payments"
          />
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <QuickAction
            to="/"
            title="Find doctors"
            description="Browse available doctors"
            icon={
              <DoctorIcon />
            }
          />

          <QuickAction
            to="/my-appointments"
            title="My appointments"
            description="View and manage bookings"
            icon={
              <CalendarIcon />
            }
          />

          <QuickAction
            to="/chat"
            title="Messages"
            description="Chat with your doctors"
            icon={
              <ChatIcon />
            }
          />

          <QuickAction
            to="/profile"
            title="My profile"
            description="Manage account details"
            icon={
              <UserIcon />
            }
          />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)] sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-600">
                  Schedule
                </p>

                <h2 className="mt-1 text-xl font-black text-slate-950">
                  Upcoming appointments
                </h2>
              </div>

              <Link
                to="/my-appointments"
                className="text-sm font-bold text-blue-600 hover:text-blue-700"
              >
                View all
              </Link>
            </div>

            {upcomingAppointments.length ===
            0 ? (
              <div className="mt-6 rounded-2xl bg-slate-50 px-5 py-10 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <CalendarIcon />
                </div>

                <p className="mt-4 font-bold text-slate-900">
                  No upcoming
                  appointments
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Find a doctor and book
                  your next appointment.
                </p>

                <Link
                  to="/"
                  className="mt-4 inline-flex rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700"
                >
                  Find doctors
                </Link>
              </div>
            ) : (
              <div className="mt-5 space-y-3">
                {upcomingAppointments.map(
                  (
                    appointment,
                  ) => {
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

                    return (
                      <div
                        key={
                          appointment._id
                        }
                        className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-slate-50/60 p-4 sm:flex-row sm:items-center"
                      >
                        <div className="flex min-w-0 flex-1 items-center gap-3">
                          {image ? (
                            <img
                              src={image}
                              alt={
                                doctorName
                              }
                              className="h-12 w-12 shrink-0 rounded-xl object-cover"
                            />
                          ) : (
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600 font-black text-white">
                              {doctorName
                                .charAt(
                                  0,
                                )
                                .toUpperCase()}
                            </div>
                          )}

                          <div className="min-w-0">
                            <p className="truncate font-bold text-slate-900">
                              Dr.{" "}
                              {
                                doctorName
                              }
                            </p>

                            <p className="truncate text-sm text-slate-500">
                              {
                                specialty
                              }
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-5 sm:text-right">
                          <div>
                            <p className="text-sm font-bold text-slate-800">
                              {formatDate(
                                appointment.date,
                              )}
                            </p>

                            <p className="mt-0.5 text-xs text-slate-500">
                              {formatTime(
                                getAppointmentTime(
                                  appointment,
                                ),
                              )}
                            </p>
                          </div>

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${getStatusClass(
                              appointment.status,
                            )}`}
                          >
                            {
                              appointment.status
                            }
                          </span>
                        </div>
                      </div>
                    );
                  },
                )}
              </div>
            )}
          </section>

          <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)] sm:p-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-600">
                History
              </p>

              <h2 className="mt-1 text-xl font-black text-slate-950">
                Recent activity
              </h2>
            </div>

            {recentAppointments.length ===
            0 ? (
              <div className="mt-6 rounded-2xl bg-slate-50 px-4 py-10 text-center">
                <p className="font-bold text-slate-800">
                  No activity yet
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Your appointment
                  activity will appear
                  here.
                </p>
              </div>
            ) : (
              <div className="mt-5 divide-y divide-slate-100">
                {recentAppointments.map(
                  (
                    appointment,
                  ) => {
                    const doctorName =
                      appointment.doctor
                        ?.user?.name ||
                      "Doctor";

                    return (
                      <Link
                        key={
                          appointment._id
                        }
                        to="/my-appointments"
                        className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-slate-900">
                            Dr.{" "}
                            {
                              doctorName
                            }
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {formatDate(
                              appointment.date,
                            )}{" "}
                            ·{" "}
                            {formatTime(
                              getAppointmentTime(
                                appointment,
                              ),
                            )}
                          </p>
                        </div>

                        <div className="flex shrink-0 flex-col items-end gap-1">
                          <span
                            className={`rounded-full px-2.5 py-1 text-[11px] font-bold capitalize ${getStatusClass(
                              appointment.status,
                            )}`}
                          >
                            {
                              appointment.status
                            }
                          </span>

                          {appointment.payment
                            ?.status ===
                            "refunded" && (
                            <span className="text-[11px] font-bold text-blue-600">
                              Refunded
                            </span>
                          )}
                        </div>
                      </Link>
                    );
                  },
                )}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

const StatCard = ({
  title,
  value,
  description,
}: {
  title: string;
  value: number;
  description: string;
}) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.035)]">
      <p className="text-sm font-bold text-slate-500">
        {title}
      </p>

      <p className="mt-3 text-3xl font-black tracking-[-0.04em] text-slate-950">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-400">
        {description}
      </p>
    </div>
  );
};

const QuickAction = ({
  to,
  title,
  description,
  icon,
}: {
  to: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}) => {
  return (
    <Link
      to={to}
      className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-blue-200 hover:bg-blue-50/30"
    >
      <div className="flex items-center justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          {icon}
        </div>

        <span className="text-xl text-slate-300 transition group-hover:translate-x-1 group-hover:text-blue-600">
          →
        </span>
      </div>

      <h2 className="mt-4 font-bold text-slate-900 transition group-hover:text-blue-600">
        {title}
      </h2>

      <p className="mt-1 text-sm text-slate-500">
        {description}
      </p>
    </Link>
  );
};