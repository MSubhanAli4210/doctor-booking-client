import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import {
  getDoctorAppointments,
} from "../api/appointmentApi";

import type {
  DoctorAppointment,
  AppointmentStatus,
} from "../api/appointmentApi";

export default function DoctorDashboard() {
  const [
    appointments,
    setAppointments,
  ] = useState<DoctorAppointment[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError("");

      const data =
        await getDoctorAppointments();

      setAppointments(
        data.appointments || [],
      );
    } catch (error) {
      console.error(
        "Failed to load doctor dashboard:",
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
    fetchAppointments();
  }, []);

  const counts = useMemo(() => {
    return {
      total: appointments.length,

      pending: appointments.filter(
        (appointment) =>
          appointment.status === "pending",
      ).length,

      confirmed: appointments.filter(
        (appointment) =>
          appointment.status ===
          "confirmed",
      ).length,

      completed: appointments.filter(
        (appointment) =>
          appointment.status ===
          "completed",
      ).length,

      cancelled: appointments.filter(
        (appointment) =>
          appointment.status ===
          "cancelled",
      ).length,
    };
  }, [appointments]);

  const upcomingAppointments =
    useMemo(() => {
      const today = new Date();

      today.setHours(0, 0, 0, 0);

      return appointments
        .filter((appointment) => {
          if (
            !appointment.date ||
            appointment.status ===
              "cancelled" ||
            appointment.status ===
              "completed"
          ) {
            return false;
          }

          const appointmentDate =
            new Date(
              appointment.date,
            );

          if (
            Number.isNaN(
              appointmentDate.getTime(),
            )
          ) {
            return false;
          }

          appointmentDate.setHours(
            0,
            0,
            0,
            0,
          );

          return appointmentDate >= today;
        })
        .sort((a, b) => {
          const firstDate = a.date
            ? new Date(a.date).getTime()
            : 0;

          const secondDate = b.date
            ? new Date(b.date).getTime()
            : 0;

          return (
            firstDate - secondDate
          );
        })
        .slice(0, 5);
    }, [appointments]);

  const recentAppointments =
    useMemo(() => {
      return [...appointments]
        .sort((a, b) => {
          const firstDate = a.date
            ? new Date(a.date).getTime()
            : 0;

          const secondDate = b.date
            ? new Date(b.date).getTime()
            : 0;

          return (
            secondDate - firstDate
          );
        })
        .slice(0, 5);
    }, [appointments]);

  const formatDate = (
    date?: string,
  ) => {
    if (!date) {
      return "Date unavailable";
    }

    const parsedDate = new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime(),
      )
    ) {
      return date;
    }

    return parsedDate.toLocaleDateString(
      undefined,
      {
        year: "numeric",
        month: "short",
        day: "numeric",
      },
    );
  };

  const getInitials = (
    name: string,
  ) => {
    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  };

  const getStatusClass = (
    status: AppointmentStatus,
  ) => {
    switch (status) {
      case "confirmed":
        return "bg-blue-50 text-blue-700";

      case "completed":
        return "bg-green-50 text-green-700";

      case "cancelled":
        return "bg-red-50 text-red-700";

      default:
        return "bg-amber-50 text-amber-700";
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-slate-50">
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
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-1 text-sm font-medium text-blue-600">
              Doctor Overview
            </p>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Dashboard
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Manage appointments and stay
              updated with your patients.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchAppointments}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-4 w-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M20 11a8.1 8.1 0 0 0-15.5-2M4 5v4h4m-4 4a8.1 8.1 0 0 0 15.5 2M20 19v-4h-4"
              />
            </svg>

            Refresh
          </button>
        </div>

        {error && (
          <div className="mb-6 flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-red-600">
              {error}
            </p>

            <button
              type="button"
              onClick={fetchAppointments}
              className="text-sm font-semibold text-red-700 hover:underline"
            >
              Try again
            </button>
          </div>
        )}

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Appointments"
            value={counts.total}
            description="All appointments"
          />

          <StatCard
            title="Pending"
            value={counts.pending}
            description="Waiting for action"
          />

          <StatCard
            title="Confirmed"
            value={counts.confirmed}
            description="Upcoming confirmed"
          />

          <StatCard
            title="Completed"
            value={counts.completed}
            description="Finished appointments"
          />
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-3">
          <Link
            to="/doctor/appointments"
            className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-blue-200 hover:bg-blue-50/30"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-5 w-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 2v4m12-4v4M3 9h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"
                  />
                </svg>
              </div>

              <span className="text-xl text-slate-300 transition group-hover:translate-x-1 group-hover:text-blue-600">
                →
              </span>
            </div>

            <h2 className="mt-4 font-semibold text-slate-900 group-hover:text-blue-600">
              Appointments
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              View and manage patient
              appointments.
            </p>
          </Link>

          <Link
            to="/doctor/profile"
            className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-blue-200 hover:bg-blue-50/30"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
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
              </div>

              <span className="text-xl text-slate-300 transition group-hover:translate-x-1 group-hover:text-blue-600">
                →
              </span>
            </div>

            <h2 className="mt-4 font-semibold text-slate-900 group-hover:text-blue-600">
              My Profile
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Update your professional
              information.
            </p>
          </Link>

          <Link
            to="/chat"
            className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-blue-200 hover:bg-blue-50/30"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
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
              </div>

              <span className="text-xl text-slate-300 transition group-hover:translate-x-1 group-hover:text-blue-600">
                →
              </span>
            </div>

            <h2 className="mt-4 font-semibold text-slate-900 group-hover:text-blue-600">
              Messages
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Chat directly with your
              patients.
            </p>
          </Link>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5 sm:px-6">
              <div>
                <h2 className="font-semibold text-slate-900">
                  Upcoming Appointments
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Your next scheduled patient
                  visits.
                </p>
              </div>

              <Link
                to="/doctor/appointments"
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                View all
              </Link>
            </div>

            {upcomingAppointments.length ===
            0 ? (
              <div className="px-6 py-14 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-7 w-7"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 2v4m12-4v4M3 9h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"
                    />
                  </svg>
                </div>

                <p className="mt-4 font-semibold text-slate-800">
                  No upcoming appointments
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  New confirmed appointments
                  will appear here.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {upcomingAppointments.map(
                  (appointment) => (
                    <AppointmentRow
                      key={
                        appointment._id
                      }
                      appointment={
                        appointment
                      }
                      formatDate={
                        formatDate
                      }
                      getInitials={
                        getInitials
                      }
                      getStatusClass={
                        getStatusClass
                      }
                    />
                  ),
                )}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white">
            <div className="border-b border-slate-100 px-5 py-5">
              <h2 className="font-semibold text-slate-900">
                Appointment Summary
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Current appointment status.
              </p>
            </div>

            <div className="space-y-4 p-5">
              <SummaryRow
                label="Pending"
                value={counts.pending}
                className="bg-amber-500"
              />

              <SummaryRow
                label="Confirmed"
                value={counts.confirmed}
                className="bg-blue-500"
              />

              <SummaryRow
                label="Completed"
                value={counts.completed}
                className="bg-green-500"
              />

              <SummaryRow
                label="Cancelled"
                value={counts.cancelled}
                className="bg-red-500"
              />
            </div>
          </div>
        </div>

        <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5 sm:px-6">
            <div>
              <h2 className="font-semibold text-slate-900">
                Recent Appointments
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Your latest patient
                appointments.
              </p>
            </div>

            <Link
              to="/doctor/appointments"
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Manage
            </Link>
          </div>

          {recentAppointments.length ===
          0 ? (
            <div className="px-6 py-12 text-center text-sm text-slate-500">
              No appointments found.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentAppointments.map(
                (appointment) => (
                  <AppointmentRow
                    key={appointment._id}
                    appointment={
                      appointment
                    }
                    formatDate={
                      formatDate
                    }
                    getInitials={
                      getInitials
                    }
                    getStatusClass={
                      getStatusClass
                    }
                  />
                ),
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  description,
}: {
  title: string;
  value: number;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
      <p className="text-sm font-medium text-slate-500">
        {title}
      </p>

      <p className="mt-3 text-3xl font-bold text-slate-900">
        {value}
      </p>

      <p className="mt-2 text-xs text-slate-400">
        {description}
      </p>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  className,
}: {
  label: string;
  value: number;
  className: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
      <div className="flex items-center gap-3">
        <span
          className={`h-2.5 w-2.5 rounded-full ${className}`}
        />

        <span className="text-sm font-medium text-slate-700">
          {label}
        </span>
      </div>

      <span className="font-bold text-slate-900">
        {value}
      </span>
    </div>
  );
}

function AppointmentRow({
  appointment,
  formatDate,
  getInitials,
  getStatusClass,
}: {
  appointment: DoctorAppointment;

  formatDate: (
    date?: string,
  ) => string;

  getInitials: (
    name: string,
  ) => string;

  getStatusClass: (
    status: AppointmentStatus,
  ) => string;
}) {
  const patientName =
    appointment.patient?.name ||
    "Patient";

  return (
    <div className="flex flex-col gap-4 px-5 py-5 transition hover:bg-slate-50/70 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <div className="flex min-w-0 items-center gap-4">
        {appointment.patient
          ?.profilePicture ? (
          <img
            src={
              appointment.patient
                .profilePicture
            }
            alt={patientName}
            className="h-11 w-11 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
            {getInitials(patientName)}
          </div>
        )}

        <div className="min-w-0">
          <p className="truncate font-semibold text-slate-900">
            {patientName}
          </p>

          <p className="mt-1 truncate text-sm text-slate-500">
            {appointment.patient?.email}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 sm:justify-end">
        <div className="text-sm text-slate-500">
          {formatDate(
            appointment.date,
          )}

          {appointment.timeSlot &&
            ` • ${appointment.timeSlot}`}
        </div>

        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${getStatusClass(
            appointment.status,
          )}`}
        >
          {appointment.status}
        </span>
      </div>
    </div>
  );
}