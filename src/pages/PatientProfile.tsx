import {
  useEffect,
  useState,
} from "react";

import type {
  ChangeEvent,
  SubmitEvent,
} from "react";

import axios from "axios";

import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

interface PatientUser {
  id?: string;
  _id?: string;
  name?: string;
  email?: string;
  role?: string;
  phone?: string;
  address?: string;
  gender?: "male" | "female" | "other";
  dateOfBirth?: string;
  profilePicture?: string;
}

interface PatientFormData {
  name: string;
  phone: string;
  address: string;
  gender: string;
  dateOfBirth: string;
}

const getStoredUser = (): PatientUser | null => {
  const storedUser =
    localStorage.getItem("user");

  if (!storedUser) {
    return null;
  }

  try {
    return JSON.parse(
      storedUser,
    ) as PatientUser;
  } catch {
    return null;
  }
};

const formatDateForInput = (
  value?: string,
) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (
    Number.isNaN(date.getTime())
  ) {
    return "";
  }

  return date
    .toISOString()
    .split("T")[0];
};

export default function PatientProfile() {
  const { user } = useAuth();

  const authUser =
    user as PatientUser | null;

  const storedUser =
    getStoredUser();

  const initialUser: PatientUser = {
    ...storedUser,
    ...authUser,

    profilePicture:
      authUser?.profilePicture ||
      storedUser?.profilePicture ||
      "",
  };

  const [
    patient,
    setPatient,
  ] = useState<PatientUser>(
    initialUser,
  );

  const [
    formData,
    setFormData,
  ] = useState<PatientFormData>({
    name:
      initialUser.name || "",
    phone:
      initialUser.phone || "",
    address:
      initialUser.address || "",
    gender:
      initialUser.gender || "",
    dateOfBirth:
      formatDateForInput(
        initialUser.dateOfBirth,
      ),
  });

  const [
    selectedImage,
    setSelectedImage,
  ] = useState<File | null>(
    null,
  );

  const [
    imagePreview,
    setImagePreview,
  ] = useState(
    initialUser.profilePicture ||
      "",
  );

  const [
    editing,
    setEditing,
  ] = useState(false);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    success,
    setSuccess,
  ] = useState("");

  useEffect(() => {
    const stored =
      getStoredUser();

    const nextUser = {
      ...stored,
      ...authUser,

      profilePicture:
        authUser?.profilePicture ||
        stored?.profilePicture ||
        "",
    };

    setPatient(nextUser);

    setFormData({
      name:
        nextUser.name || "",

      phone:
        nextUser.phone || "",

      address:
        nextUser.address || "",

      gender:
        nextUser.gender || "",

      dateOfBirth:
        formatDateForInput(
          nextUser.dateOfBirth,
        ),
    });

    setImagePreview(
      nextUser.profilePicture ||
        "",
    );
  }, [user]);

  const saveUserLocally = (
    updatedUser: PatientUser,
  ) => {
    const stored =
      getStoredUser();

    const nextUser = {
      ...stored,
      ...updatedUser,
    };

    localStorage.setItem(
      "user",
      JSON.stringify(nextUser),
    );

    setPatient(nextUser);

    return nextUser;
  };

  const handleChange = (
    event:
      ChangeEvent<
        HTMLInputElement |
          HTMLSelectElement
      >,
  ) => {
    const {
      name,
      value,
    } = event.target;

    setFormData(
      (previous) => ({
        ...previous,
        [name]: value,
      }),
    );

    setError("");
    setSuccess("");
  };

  const handleImageChange = (
    event:
      ChangeEvent<HTMLInputElement>,
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    if (
      !file.type.startsWith(
        "image/",
      )
    ) {
      setError(
        "Please select a valid image file.",
      );

      return;
    }

    if (
      file.size >
      5 * 1024 * 1024
    ) {
      setError(
        "Profile picture must be smaller than 5MB.",
      );

      return;
    }

    setSelectedImage(file);
    setError("");
    setSuccess("");

    const reader =
      new FileReader();

    reader.onloadend = () => {
      if (
        typeof reader.result ===
        "string"
      ) {
        setImagePreview(
          reader.result,
        );
      }
    };

    reader.readAsDataURL(
      file,
    );
  };

  const uploadImage =
    async () => {
      if (!selectedImage) {
        return (
          patient.profilePicture ||
          ""
        );
      }

      const form =
        new FormData();

      form.append(
        "image",
        selectedImage,
      );

      const response =
        await api.post(
          "/upload/profile-picture",
          form,
        );

      return (
        response.data
          ?.profilePicture || ""
      );
    };

  const handleCancel = () => {
    setFormData({
      name:
        patient.name || "",

      phone:
        patient.phone || "",

      address:
        patient.address || "",

      gender:
        patient.gender || "",

      dateOfBirth:
        formatDateForInput(
          patient.dateOfBirth,
        ),
    });

    setImagePreview(
      patient.profilePicture ||
        "",
    );

    setSelectedImage(null);
    setEditing(false);
    setError("");
    setSuccess("");
  };

  const handleSave = async (
    event:
      SubmitEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (
      !formData.name.trim()
    ) {
      setError(
        "Name is required.",
      );

      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      let profilePicture =
        patient.profilePicture ||
        "";

      if (selectedImage) {
        profilePicture =
          await uploadImage();
      }

      const response =
        await api.put(
          "/auth/profile",
          {
            name:
              formData.name.trim(),

            phone:
              formData.phone.trim(),

            address:
              formData.address.trim(),

            gender:
              formData.gender ||
              undefined,

            dateOfBirth:
              formData.dateOfBirth ||
              undefined,
          },
        );

      const updatedUser =
        response.data?.user ||
        {};

      const nextUser =
        saveUserLocally({
          ...patient,
          ...updatedUser,
          profilePicture:
            profilePicture ||
            updatedUser
              ?.profilePicture ||
            patient.profilePicture,
        });

      setImagePreview(
        nextUser.profilePicture ||
          "",
      );

      if (
        nextUser.profilePicture
      ) {
        window.dispatchEvent(
          new CustomEvent(
            "profile-picture-updated",
            {
              detail:
                nextUser.profilePicture,
            },
          ),
        );
      }

      setSelectedImage(null);
      setEditing(false);

      setSuccess(
        "Profile updated successfully.",
      );
    } catch (error) {
      console.error(
        "Failed to update patient profile:",
        error,
      );

      if (
        axios.isAxiosError(
          error,
        )
      ) {
        setError(
          error.response?.data
            ?.error ||
            error.response?.data
              ?.message ||
            "Unable to update your profile.",
        );
      } else {
        setError(
          "Unable to update your profile.",
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (
    name?: string,
  ) => {
    return (
      name || "Patient"
    )
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map(
        (part) => part[0],
      )
      .join("")
      .toUpperCase();
  };

  const formattedBirthday =
    patient.dateOfBirth
      ? new Date(
          patient.dateOfBirth,
        ).toLocaleDateString(
          undefined,
          {
            year: "numeric",
            month: "long",
            day: "numeric",
          },
        )
      : "Not provided";

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-1 text-sm font-medium text-blue-600">
              Patient Account
            </p>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              My Profile
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              View and manage your
              personal information.
            </p>
          </div>

          {!editing && (
            <button
              type="button"
              onClick={() => {
                setEditing(true);
                setError("");
                setSuccess("");
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-4 w-4"
              >
                <path
                  strokeLinecap="round"
                  d="M12 20h9"
                />

                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z"
                />
              </svg>

              Edit Profile
            </button>
          )}
        </div>

        {success && (
          <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
            {success}
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            {error}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <div className="h-fit rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex flex-col items-center text-center">
              {imagePreview ? (
                <img
                  src={
                    imagePreview
                  }
                  alt={
                    patient.name ||
                    "Patient"
                  }
                  className="h-28 w-28 rounded-2xl object-cover"
                />
              ) : (
                <div className="flex h-28 w-28 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 text-2xl font-bold text-white">
                  {getInitials(
                    patient.name,
                  )}
                </div>
              )}

              {editing && (
                <div className="mt-4">
                  <label
                    htmlFor="profilePicture"
                    className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
                  >
                    {imagePreview
                      ? "Change Picture"
                      : "Upload Picture"}
                  </label>

                  <input
                    id="profilePicture"
                    type="file"
                    accept="image/*"
                    onChange={
                      handleImageChange
                    }
                    className="hidden"
                  />

                  {selectedImage && (
                    <p className="mt-2 max-w-[220px] truncate text-xs text-slate-400">
                      {
                        selectedImage.name
                      }
                    </p>
                  )}
                </div>
              )}

              <h2 className="mt-5 text-lg font-bold text-slate-900">
                {patient.name ||
                  "Patient"}
              </h2>

              <p className="mt-1 break-all text-sm text-slate-500">
                {patient.email ||
                  "No email available"}
              </p>

              <span className="mt-4 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                Patient
              </span>
            </div>
          </div>

          <form
            onSubmit={
              handleSave
            }
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5 sm:px-6">
              <div>
                <h2 className="font-semibold text-slate-900">
                  Personal Information
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Your account and
                  personal details.
                </p>
              </div>

              {editing && (
                <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                  Editing
                </span>
              )}
            </div>

            <div className="grid gap-6 p-5 sm:grid-cols-2 sm:p-6">
              {editing ? (
                <InputField
                  label="Full Name"
                  name="name"
                  value={
                    formData.name
                  }
                  onChange={
                    handleChange
                  }
                />
              ) : (
                <ProfileField
                  label="Full Name"
                  value={
                    patient.name ||
                    "Not provided"
                  }
                />
              )}

              <ProfileField
                label="Email"
                value={
                  patient.email ||
                  "Not available"
                }
              />

              {editing ? (
                <InputField
                  label="Phone"
                  name="phone"
                  type="tel"
                  value={
                    formData.phone
                  }
                  onChange={
                    handleChange
                  }
                  required={false}
                />
              ) : (
                <ProfileField
                  label="Phone"
                  value={
                    patient.phone ||
                    "Not provided"
                  }
                />
              )}

              {editing ? (
                <div>
                  <label
                    htmlFor="gender"
                    className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400"
                  >
                    Gender
                  </label>

                  <select
                    id="gender"
                    name="gender"
                    value={
                      formData.gender
                    }
                    onChange={
                      handleChange
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                  >
                    <option value="">
                      Select gender
                    </option>

                    <option value="male">
                      Male
                    </option>

                    <option value="female">
                      Female
                    </option>

                    <option value="other">
                      Other
                    </option>
                  </select>
                </div>
              ) : (
                <ProfileField
                  label="Gender"
                  value={
                    patient.gender
                      ? patient.gender
                          .charAt(0)
                          .toUpperCase() +
                        patient.gender.slice(
                          1,
                        )
                      : "Not provided"
                  }
                />
              )}

              {editing ? (
                <InputField
                  label="Date of Birth"
                  name="dateOfBirth"
                  type="date"
                  value={
                    formData.dateOfBirth
                  }
                  onChange={
                    handleChange
                  }
                  required={false}
                />
              ) : (
                <ProfileField
                  label="Date of Birth"
                  value={
                    formattedBirthday
                  }
                />
              )}

              <div className="sm:col-span-2">
                {editing ? (
                  <InputField
                    label="Address"
                    name="address"
                    value={
                      formData.address
                    }
                    onChange={
                      handleChange
                    }
                    required={false}
                  />
                ) : (
                  <ProfileField
                    label="Address"
                    value={
                      patient.address ||
                      "Not provided"
                    }
                  />
                )}
              </div>
            </div>

            {editing && (
              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/50 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
                <button
                  type="button"
                  onClick={
                    handleCancel
                  }
                  disabled={saving}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                    ? "Saving..."
                    : "Save Changes"}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

function ProfileField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-2 text-sm font-medium text-slate-800">
        {value}
      </p>
    </div>
  );
}

function InputField({
  label,
  name,
  value,
  onChange,
  type = "text",
  required = true,
}: {
  label: string;
  name: string;
  value: string;
  type?: string;
  required?: boolean;

  onChange: (
    event:
      ChangeEvent<
        HTMLInputElement
      >,
  ) => void;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400"
      >
        {label}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={
          onChange
        }
        required={required}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
      />
    </div>
  );
}