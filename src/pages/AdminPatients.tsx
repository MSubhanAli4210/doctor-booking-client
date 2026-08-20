import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getAdminPatients,
} from "../api/adminApi";

import type {
  AdminPatient,
} from "../api/adminApi";

export default function AdminPatients() {
  const [patients, setPatients] =
    useState<AdminPatient[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const fetchPatients = async () => {
    try {
      setLoading(true);
      setError("");

      const data =
        await getAdminPatients();

      setPatients(data);
    } catch (error) {
      console.error(
        "Failed to load patients:",
        error,
      );

      setError(
        "Unable to load patients.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const filteredPatients =
    useMemo(() => {
      const query = search
        .trim()
        .toLowerCase();

      if (!query) {
        return patients;
      }

      return patients.filter(
        (patient) => {
          return (
            patient.name
              ?.toLowerCase()
              .includes(query) ||
            patient.email
              ?.toLowerCase()
              .includes(query) ||
            patient.phone
              ?.toLowerCase()
              .includes(query) ||
            patient.address
              ?.toLowerCase()
              .includes(query)
          );
        },
      );
    }, [patients, search]);

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

  const formatDate = (
    date?: string,
  ) => {
    if (!date) {
      return "Not available";
    }

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return "Not available";
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

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />

          <p className="text-sm text-slate-500">
            Loading patients...
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
              Patients
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              View and search registered
              patient accounts.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchPatients}
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

        {/* Stats */}

        <div className="mb-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-sm font-medium text-slate-500">
              Total Patients
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {patients.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-sm font-medium text-slate-500">
              Search Results
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {
                filteredPatients.length
              }
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-red-600">
              {error}
            </p>

            <button
              type="button"
              onClick={fetchPatients}
              className="text-sm font-semibold text-red-700 hover:underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Patients */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="font-semibold text-slate-900">
                  Registered Patients
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Patient information across
                  the platform.
                </p>
              </div>

              <div className="relative w-full md:max-w-sm">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                >
                  <circle
                    cx="11"
                    cy="11"
                    r="8"
                  />

                  <path d="m21 21-4.35-4.35" />
                </svg>

                <input
                  type="search"
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value,
                    )
                  }
                  placeholder="Search name, email, phone..."
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                />
              </div>
            </div>
          </div>

          {filteredPatients.length ===
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
                    d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm13 10v-2a4 4 0 0 0-3-3.87"
                  />
                </svg>
              </div>

              <p className="mt-4 font-semibold text-slate-800">
                No patients found
              </p>

              <p className="mt-1 text-sm text-slate-500">
                {search
                  ? "Try a different search."
                  : "No patients have registered yet."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredPatients.map(
                (patient) => (
                  <div
                    key={patient._id}
                    className="px-5 py-5 transition hover:bg-slate-50/70 sm:px-6"
                  >
                    <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                      <div className="flex min-w-0 items-center gap-4">
                        {patient.profilePicture ? (
                          <img
                            src={
                              patient.profilePicture
                            }
                            alt={patient.name}
                            className="h-12 w-12 shrink-0 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                            {getInitials(
                              patient.name ||
                                "Patient",
                            )}
                          </div>
                        )}

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="truncate font-semibold text-slate-900">
                              {
                                patient.name
                              }
                            </p>

                            <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
                              Patient
                            </span>
                          </div>

                          <p className="mt-1 truncate text-sm text-slate-500">
                            {
                              patient.email
                            }
                          </p>
                        </div>
                      </div>

                      <div className="grid gap-3 text-sm sm:grid-cols-3 md:min-w-[480px]">
                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                            Phone
                          </p>

                          <p className="mt-1 text-slate-700">
                            {patient.phone ||
                              "Not provided"}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                            Gender
                          </p>

                          <p className="mt-1 capitalize text-slate-700">
                            {patient.gender ||
                              "Not provided"}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                            Joined
                          </p>

                          <p className="mt-1 text-slate-700">
                            {formatDate(
                              patient.createdAt,
                            )}
                          </p>
                        </div>
                      </div>
                    </div>

                    {patient.address && (
                      <div className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                        <span className="font-medium text-slate-700">
                          Address:
                        </span>{" "}
                        {patient.address}
                      </div>
                    )}
                  </div>
                ),
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}