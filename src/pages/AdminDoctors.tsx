import { useEffect, useState } from "react";

import type { ChangeEvent, SubmitEvent } from "react";

import {
  getAdminDoctors,
  createDoctor,
  deactivateDoctor,
} from "../api/adminApi";

interface Doctor {
  _id: string;

  user: {
    name: string;
    email: string;
  };

  specialty: string;
  fees: number;
}

const initialFormData = {
  name: "",
  email: "",
  password: "",
  specialty: "",
  degree: "",
  experience: "",
  fees: "",
  address: "",
};

export default function AdminDoctors() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);

  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState(initialFormData);

  const [error, setError] = useState("");

  const [creating, setCreating] = useState(false);

  const [deactivatingId, setDeactivatingId] = useState<string | null>(null);

  const fetchDoctors = async () => {
    try {
      setLoading(true);

      const data = await getAdminDoctors();

      console.log("Doctors for admin page:", data);

      const doctorList = Array.isArray(data)
        ? data
        : Array.isArray(data?.doctors)
          ? data.doctors
          : [];

      setDoctors(doctorList);
    } catch (error) {
      console.error("Failed to load doctors:", error);

      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreate = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");
    setCreating(true);

    try {
      await createDoctor({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        specialty: formData.specialty,
        degree: formData.degree,
        experience: Number(formData.experience),
        fees: Number(formData.fees),
        address: formData.address,
      });

      setFormData(initialFormData);
      setShowForm(false);

      await fetchDoctors();
    } catch (err: any) {
      console.error("Create doctor error:", err.response?.data);

      setError(err.response?.data?.message || "Failed to create doctor");
    } finally {
      setCreating(false);
    }
  };

  const handleDeactivate = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to deactivate this doctor?",
    );

    if (!confirmed) return;

    try {
      setDeactivatingId(id);

      await deactivateDoctor(id);

      await fetchDoctors();
    } catch (error) {
      console.error("Failed to deactivate doctor:", error);

      alert("Failed to deactivate doctor");
    } finally {
      setDeactivatingId(null);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />

          <p className="text-sm text-slate-500">Loading doctors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-1 text-sm font-medium text-blue-600">
              Admin Management
            </p>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Doctors
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Add, view and manage doctors registered on the platform.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setShowForm((prev) => !prev);

              setError("");
            }}
            className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition ${
              showForm
                ? "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                : "bg-blue-600 text-white shadow-sm hover:bg-blue-700"
            }`}
          >
            <span className="text-lg leading-none">{showForm ? "×" : "+"}</span>

            {showForm ? "Cancel" : "Add Doctor"}
          </button>
        </div>

        {/* Stats */}

        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Total Doctors</p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {doctors.length}
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-2xl">
                🩺
              </div>
            </div>
          </div>
        </div>

        {/* Create Doctor */}

        {showForm && (
          <div className="mb-8 overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
              <h2 className="text-lg font-semibold text-slate-900">
                Add New Doctor
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Enter the doctor's account and professional information.
              </p>
            </div>

            <form onSubmit={handleCreate} className="p-5 sm:p-6">
              {error && (
                <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <div className="grid gap-5 sm:grid-cols-2">
                {/* Name */}

                <div>
                  <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Full Name
                  </label>

                  <input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="e.g. Ahmed Khan"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                  />
                </div>

                {/* Email */}

                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Email Address
                  </label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="doctor@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                  />
                </div>
                {/* Address */}
                <div className="sm:col-span-2">
                  <label
                    htmlFor="address"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Clinic Address
                  </label>

                  <input
                    id="address"
                    name="address"
                    type="text"
                    placeholder="e.g. 123 Main Street, Lahore"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                  />
                </div>

                {/* Password */}

                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Password
                  </label>

                  <input
                    id="password"
                    name="password"
                    type="password"
                    minLength={6}
                    placeholder="Minimum 6 characters"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                  />
                </div>

                {/* Specialty */}

                <div>
                  <label
                    htmlFor="specialty"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Specialization
                  </label>

                  <input
                    id="specialty"
                    name="specialty"
                    type="text"
                    placeholder="e.g. Cardiologist"
                    value={formData.specialty}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                  />
                </div>

                {/* Degree */}

                <div>
                  <label
                    htmlFor="degree"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Degree
                  </label>

                  <input
                    id="degree"
                    name="degree"
                    type="text"
                    placeholder="e.g. MBBS, FCPS"
                    value={formData.degree}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                  />
                </div>

                {/* Experience */}

                <div>
                  <label
                    htmlFor="experience"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Experience
                  </label>

                  <div className="relative">
                    <input
                      id="experience"
                      name="experience"
                      type="number"
                      min="0"
                      placeholder="5"
                      value={formData.experience}
                      onChange={handleChange}
                      required
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-16 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                    />

                    <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                      years
                    </span>
                  </div>
                </div>

                {/* Fees */}

                <div>
                  <label
                    htmlFor="fees"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Consultation Fee
                  </label>

                  <div className="relative">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                      $
                    </span>

                    <input
                      id="fees"
                      name="fees"
                      type="number"
                      min="0"
                      placeholder="100"
                      value={formData.fees}
                      onChange={handleChange}
                      required
                      className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-8 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setError("");
                    setFormData(initialFormData);
                  }}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={creating}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {creating && (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  )}

                  {creating ? "Creating..." : "Create Doctor"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Doctors List */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
            <div>
              <h2 className="font-semibold text-slate-900">All Doctors</h2>

              <p className="mt-1 text-sm text-slate-500">
                {doctors.length} {doctors.length === 1 ? "doctor" : "doctors"}{" "}
                registered
              </p>
            </div>
          </div>

          {doctors.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-3xl">
                🩺
              </div>

              <h3 className="font-semibold text-slate-900">No doctors yet</h3>

              <p className="mt-1 max-w-sm text-sm text-slate-500">
                Add your first doctor to start managing appointments.
              </p>

              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="mt-5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                + Add Doctor
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {doctors.map((doc) => (
                <div
                  key={doc._id}
                  className="flex flex-col gap-4 px-5 py-5 transition hover:bg-slate-50/70 sm:flex-row sm:items-center sm:justify-between sm:px-6"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    {/* Avatar */}

                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700">
                      {getInitials(doc.user.name)}
                    </div>

                    {/* Details */}

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate font-semibold text-slate-900">
                          Dr. {doc.user.name}
                        </p>

                        <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
                          Active
                        </span>
                      </div>

                      <p className="mt-1 truncate text-sm text-slate-500">
                        {doc.user.email}
                      </p>

                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                        <span className="rounded-lg bg-blue-50 px-2.5 py-1 font-medium text-blue-700">
                          {doc.specialty}
                        </span>

                        <span className="rounded-lg bg-slate-100 px-2.5 py-1 font-medium text-slate-600">
                          ${doc.fees} consultation
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Deactivate */}

                  <button
                    type="button"
                    disabled={deactivatingId === doc._id}
                    onClick={() => handleDeactivate(doc._id)}
                    className="self-start rounded-lg border border-red-100 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition hover:border-red-200 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50 sm:self-auto"
                  >
                    {deactivatingId === doc._id
                      ? "Deactivating..."
                      : "Deactivate"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
