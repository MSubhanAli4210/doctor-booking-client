import { useEffect, useState } from "react";

import { Link } from "react-router-dom";

import { getAdminStats, getRecentAppointments } from "../api/adminApi";

import type { AdminStats, AdminAppointment } from "../api/adminApi";

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);

  const [recentAppointments, setRecentAppointments] = useState<
    AdminAppointment[]
  >([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const [statsData, appointmentsData] = await Promise.all([
        getAdminStats(),
        getRecentAppointments(),
      ]);

      setStats(statsData);

      setRecentAppointments(appointmentsData);
    } catch (error) {
      console.error("Dashboard error:", error);

      setError("Unable to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const getStatusClass = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-50 text-green-700";

      case "confirmed":
        return "bg-blue-50 text-blue-700";

      case "cancelled":
        return "bg-red-50 text-red-700";

      default:
        return "bg-amber-50 text-amber-700";
    }
  };

  const formatAppointmentDate = (appointment: AdminAppointment) => {
    const date = appointment.date ?? appointment.appointmentDate;

    if (!date) {
      return "Date unavailable";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Invalid date";
    }

    return parsedDate.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />

          <p className="text-sm text-slate-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* HEADER */}

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-1 text-sm font-medium text-blue-600">
              Admin Overview
            </p>

            <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>

            <p className="mt-2 text-sm text-slate-500">
              Monitor doctors, patients and appointments across the platform.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchDashboard}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Refresh
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* MAIN STATS */}

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title="Total Patients"
            value={stats?.totalPatients ?? 0}
            description="Registered patients"
            icon="👥"
          />

          <StatCard
            title="Total Doctors"
            value={stats?.totalDoctors ?? 0}
            description="Registered doctors"
            icon="🩺"
          />

          <StatCard
            title="Appointments"
            value={stats?.totalAppointments ?? 0}
            description="Total bookings"
            icon="📅"
          />
        </div>

        {/* APPOINTMENT STATUS */}

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatusCard
            title="Pending"
            value={stats?.pendingAppointments ?? 0}
            className="bg-amber-50 text-amber-700"
          />

          <StatusCard
            title="Confirmed"
            value={stats?.confirmedAppointments ?? 0}
            className="bg-blue-50 text-blue-700"
          />

          <StatusCard
            title="Completed"
            value={stats?.completedAppointments ?? 0}
            className="bg-green-50 text-green-700"
          />

          <StatusCard
            title="Cancelled"
            value={stats?.cancelledAppointments ?? 0}
            className="bg-red-50 text-red-700"
          />
        </div>

        {/* MANAGEMENT */}

        <div className="mt-8">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Management</h2>

            <p className="text-sm text-slate-500">Manage platform resources.</p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <ManagementCard
              to="/admin/doctors"
              title="Doctors"
              description="Add, update and deactivate doctors"
              icon="🩺"
            />

            <ManagementCard
              to="/admin/patients"
              title="Patients"
              description="View registered patients"
              icon="👥"
            />

            <ManagementCard
              to="/admin/appointments"
              title="Appointments"
              description="Monitor all appointments"
              icon="📅"
            />
          </div>
        </div>

        {/* RECENT APPOINTMENTS */}

        <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
            <div>
              <h2 className="font-semibold text-slate-900">
                Recent Appointments
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Latest bookings on the platform
              </p>
            </div>

            <Link
              to="/admin/appointments"
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              View all
            </Link>
          </div>

          {recentAppointments.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-slate-500">
              No appointments found.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentAppointments.map((appointment) => (
                <div
                  key={appointment._id}
                  className="flex flex-col gap-4 px-6 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium text-slate-900">
                      {appointment.patient?.name}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      with Dr. {appointment.doctor?.user?.name}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <div className="text-sm text-slate-500">
                      {formatAppointmentDate(appointment)}

                      {appointment.time && ` • ${appointment.time}`}
                    </div>

                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClass(
                        appointment.status,
                      )}`}
                    >
                      {appointment.status}
                    </span>
                  </div>
                </div>
              ))}
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
  icon,
}: {
  title: string;
  value: number;
  description: string;
  icon: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>

          <p className="mt-3 text-3xl font-bold text-slate-900">{value}</p>

          <p className="mt-2 text-xs text-slate-400">{description}</p>
        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-xl">
          {icon}
        </div>
      </div>
    </div>
  );
}

function StatusCard({
  title,
  value,
  className,
}: {
  title: string;
  value: number;
  className: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <p className="text-sm text-slate-500">{title}</p>

      <div className="mt-3 flex items-center justify-between">
        <p className="text-2xl font-bold text-slate-900">{value}</p>

        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${className}`}
        >
          {title}
        </span>
      </div>
    </div>
  );
}

function ManagementCard({
  to,
  title,
  description,
  icon,
}: {
  to: string;
  title: string;
  description: string;
  icon: string;
}) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-blue-200 hover:bg-blue-50/30"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-xl">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="font-semibold text-slate-900 group-hover:text-blue-600">
          {title}
        </p>

        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
    </Link>
  );
}
