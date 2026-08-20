import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getAdminAppointments,
} from "../api/adminApi";

import type {
  AdminAppointment,
} from "../api/adminApi";

type StatusFilter =
  | "all"
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled";

export default function AdminAppointments() {
  const [
    appointments,
    setAppointments,
  ] = useState<AdminAppointment[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState<StatusFilter>("all");

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError("");

      const data =
        await getAdminAppointments();

      setAppointments(data);
    } catch (error) {
      console.error(
        "Failed to load appointments:",
        error,
      );

      setError(
        "Unable to load appointments.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const getPatientName = (
    appointment: AdminAppointment,
  ) => {
    return (
      appointment.patient?.name ||
      "Unknown patient"
    );
  };

  const getDoctorName = (
    appointment: AdminAppointment,
  ) => {
    return (
      appointment.doctor?.user?.name ||
      "Unknown doctor"
    );
  };

  const getAppointmentDate = (
    appointment: AdminAppointment,
  ) => {
    return (
      appointment.date ||
      appointment.appointmentDate
    );
  };

  const formatDate = (
    date?: string,
  ) => {
    if (!date) {
      return "Not available";
    }

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return date;
    }

    return parsed.toLocaleDateString(
      undefined,
      {
        year: "numeric",
        month: "short",
        day: "numeric",
      },
    );
  };

  const getStatusClasses = (
    status: string,
  ) => {
    switch (status.toLowerCase()) {
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

  const filteredAppointments =
    useMemo(() => {
      const query = search
        .trim()
        .toLowerCase();

      return appointments.filter(
        (appointment) => {
          const matchesStatus =
            statusFilter === "all" ||
            appointment.status
              ?.toLowerCase() ===
              statusFilter;

          const matchesSearch =
            !query ||
            getPatientName(appointment)
              .toLowerCase()
              .includes(query) ||
            getDoctorName(appointment)
              .toLowerCase()
              .includes(query) ||
            appointment.patient?.email
              ?.toLowerCase()
              .includes(query) ||
            appointment.doctor?.user?.email
              ?.toLowerCase()
              .includes(query);

          return (
            matchesStatus &&
            matchesSearch
          );
        },
      );
    }, [
      appointments,
      search,
      statusFilter,
    ]);

  const statusCount = (
    status: string,
  ) => {
    return appointments.filter(
      (appointment) =>
        appointment.status
          ?.toLowerCase() === status,
    ).length;
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />

          <p className="text-sm text-slate-500">
            Loading appointments...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-1 text-sm font-medium text-blue-600">
              Admin Management
            </p>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Appointments
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Monitor appointments across
              the platform.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchAppointments}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Refresh
          </button>
        </div>

        {/* Statistics */}

        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <AppointmentStat
            label="Total"
            value={appointments.length}
          />

          <AppointmentStat
            label="Pending"
            value={statusCount(
              "pending",
            )}
          />

          <AppointmentStat
            label="Confirmed"
            value={statusCount(
              "confirmed",
            )}
          />

          <AppointmentStat
            label="Completed"
            value={statusCount(
              "completed",
            )}
          />

          <AppointmentStat
            label="Cancelled"
            value={statusCount(
              "cancelled",
            )}
          />
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Main Card */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="border-b border-slate-100 p-5 sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 className="font-semibold text-slate-900">
                  All Appointments
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Search patients or doctors
                  and filter by status.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  type="search"
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value,
                    )
                  }
                  placeholder="Search patient or doctor..."
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 sm:w-72"
                />

                <select
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(
                      event.target
                        .value as StatusFilter,
                    )
                  }
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                >
                  <option value="all">
                    All statuses
                  </option>

                  <option value="pending">
                    Pending
                  </option>

                  <option value="confirmed">
                    Confirmed
                  </option>

                  <option value="completed">
                    Completed
                  </option>

                  <option value="cancelled">
                    Cancelled
                  </option>
                </select>
              </div>
            </div>
          </div>

          {filteredAppointments.length ===
          0 ? (
            <div className="px-6 py-16 text-center">
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
                No appointments found
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Try changing your search or
                status filter.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredAppointments.map(
                (appointment) => {
                  const fee =
                    appointment.fees ??
                    appointment.fee;

                  return (
                    <div
                      key={
                        appointment._id
                      }
                      className="px-5 py-5 transition hover:bg-slate-50/70 sm:px-6"
                    >
                      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                        {/* Patient / Doctor */}

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-semibold text-slate-900">
                              {getPatientName(
                                appointment,
                              )}
                            </p>

                            <span className="text-sm text-slate-400">
                              →
                            </span>

                            <p className="font-medium text-slate-700">
                              Dr.{" "}
                              {getDoctorName(
                                appointment,
                              )}
                            </p>
                          </div>

                          <p className="mt-1 text-sm text-slate-500">
                            {appointment
                              .doctor
                              ?.specialty ||
                              "Doctor appointment"}
                          </p>
                        </div>

                        {/* Details */}

                        <div className="flex flex-wrap items-center gap-3 lg:justify-end">
                          <div className="rounded-xl bg-slate-50 px-3 py-2">
                            <p className="text-xs text-slate-400">
                              Date
                            </p>

                            <p className="mt-0.5 text-sm font-medium text-slate-700">
                              {formatDate(
                                getAppointmentDate(
                                  appointment,
                                ),
                              )}
                            </p>
                          </div>

                          {appointment.time && (
                            <div className="rounded-xl bg-slate-50 px-3 py-2">
                              <p className="text-xs text-slate-400">
                                Time
                              </p>

                              <p className="mt-0.5 text-sm font-medium text-slate-700">
                                {
                                  appointment.time
                                }
                              </p>
                            </div>
                          )}

                          {fee !==
                            undefined && (
                            <div className="rounded-xl bg-slate-50 px-3 py-2">
                              <p className="text-xs text-slate-400">
                                Fee
                              </p>

                              <p className="mt-0.5 text-sm font-medium text-slate-700">
                                {fee}
                              </p>
                            </div>
                          )}

                          <span
                            className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${getStatusClasses(
                              appointment.status,
                            )}`}
                          >
                            {
                              appointment.status
                            }
                          </span>
                        </div>
                      </div>

                      {appointment.paymentStatus && (
                        <div className="mt-4 border-t border-slate-100 pt-3">
                          <span className="text-xs text-slate-500">
                            Payment:{" "}
                            <span className="font-medium capitalize text-slate-700">
                              {
                                appointment.paymentStatus
                              }
                            </span>
                          </span>
                        </div>
                      )}
                    </div>
                  );
                },
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AppointmentStat({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <p className="text-sm text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-2xl font-bold text-slate-900">
        {value}
      </p>
    </div>
  );
}