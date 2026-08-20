import { useEffect, useState } from "react";

import type { ChangeEvent, SubmitEvent } from "react";

import axios from "axios";

import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

type DayName =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

type Availability = Record<DayName, string[]>;

interface AvailabilityRange {
  day: string;
  startTime: string;
  endTime: string;
}

interface Doctor {
  _id: string;

  user: {
    _id?: string;
    name: string;
    email: string;
    profilePicture?: string;
  };

  specialty: string;
  degree: string;
  experienceYears: number;
  fees: number;
  address: string;
  about?: string;
  availability?: AvailabilityRange[];
}

interface DoctorFormData {
  specialty: string;
  degree: string;
  experience: string;
  fees: string;
  address: string;
}

const DAYS: {
  key: DayName;
  short: string;
  label: string;
}[] = [
  {
    key: "monday",
    short: "Mon",
    label: "Monday",
  },
  {
    key: "tuesday",
    short: "Tue",
    label: "Tuesday",
  },
  {
    key: "wednesday",
    short: "Wed",
    label: "Wednesday",
  },
  {
    key: "thursday",
    short: "Thu",
    label: "Thursday",
  },
  {
    key: "friday",
    short: "Fri",
    label: "Friday",
  },
  {
    key: "saturday",
    short: "Sat",
    label: "Saturday",
  },
  {
    key: "sunday",
    short: "Sun",
    label: "Sunday",
  },
];

const TIME_SLOTS = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
];

const createEmptyAvailability = (): Availability => ({
  monday: [],
  tuesday: [],
  wednesday: [],
  thursday: [],
  friday: [],
  saturday: [],
  sunday: [],
});

const normalizeDay = (day?: string): DayName | null => {
  if (!day) {
    return null;
  }

  const value = day.trim().toLowerCase();

  const match = DAYS.find(
    (item) => item.key === value || item.label.toLowerCase() === value,
  );

  return match?.key || null;
};

const timeToMinutes = (value: string): number | null => {
  const cleanValue = value.trim().toUpperCase();

  const match = cleanValue.match(/^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/);

  if (!match) {
    return null;
  }

  let hours = Number(match[1]);

  const minutes = Number(match[2]);

  const period = match[3];

  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes) ||
    minutes < 0 ||
    minutes > 59
  ) {
    return null;
  }

  if (period) {
    if (hours < 1 || hours > 12) {
      return null;
    }

    if (period === "AM" && hours === 12) {
      hours = 0;
    }

    if (period === "PM" && hours !== 12) {
      hours += 12;
    }
  } else if (hours < 0 || hours > 23) {
    return null;
  }

  return hours * 60 + minutes;
};

const minutesToTime = (value: number) => {
  const hours = Math.floor(value / 60);

  const minutes = value % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0",
  )}`;
};

const formatTime = (value: string) => {
  const totalMinutes = timeToMinutes(value);

  if (totalMinutes === null) {
    return value;
  }

  const hours = Math.floor(totalMinutes / 60);

  const minutes = totalMinutes % 60;

  const period = hours >= 12 ? "PM" : "AM";

  const displayHours = hours % 12 || 12;

  return `${displayHours}:${String(minutes).padStart(2, "0")} ${period}`;
};

const normalizeAvailability = (ranges?: AvailabilityRange[]): Availability => {
  const result = createEmptyAvailability();

  if (!Array.isArray(ranges)) {
    return result;
  }

  ranges.forEach((range) => {
    const day = normalizeDay(range?.day);

    if (!day) {
      return;
    }

    const start = timeToMinutes(range.startTime);

    const end = timeToMinutes(range.endTime);

    if (start === null || end === null || end <= start) {
      return;
    }

    for (let current = start; current < end; current += 30) {
      const time = minutesToTime(current);

      if (TIME_SLOTS.includes(time) && !result[day].includes(time)) {
        result[day].push(time);
      }
    }
  });

  DAYS.forEach(({ key }) => {
    result[key].sort((first, second) => first.localeCompare(second));
  });

  return result;
};

const getDayLabel = (day: DayName) => {
  return DAYS.find((item) => item.key === day)?.label || day;
};

const availabilityToRanges = (
  availability: Availability,
): AvailabilityRange[] => {
  const ranges: AvailabilityRange[] = [];

  DAYS.forEach(({ key, label }) => {
    const times = [...availability[key]].sort((first, second) =>
      first.localeCompare(second),
    );

    if (times.length === 0) {
      return;
    }

    const firstTime = timeToMinutes(times[0]);

    if (firstTime === null) {
      return;
    }

    let rangeStart = firstTime;

    let previousTime = firstTime;

    for (let index = 1; index < times.length; index += 1) {
      const currentTime = timeToMinutes(times[index]);

      if (currentTime === null) {
        continue;
      }

      if (currentTime !== previousTime + 30) {
        ranges.push({
          day: key,
          startTime: minutesToTime(rangeStart),
          endTime: minutesToTime(previousTime + 30),
        });
        rangeStart = currentTime;
      }

      previousTime = currentTime;
    }

    ranges.push({
      day: key,
      startTime: minutesToTime(rangeStart),
      endTime: minutesToTime(previousTime + 30),
    });
  });

  return ranges;
};

export default function DoctorProfile() {
  const { user } = useAuth();

  const currentUser = user as {
    id?: string;
    _id?: string;
    name?: string;
    email?: string;
    profilePicture?: string;
  } | null;

  const [doctor, setDoctor] = useState<Doctor | null>(null);

  const [formData, setFormData] = useState<DoctorFormData>({
    specialty: "",
    degree: "",
    experience: "",
    fees: "",
    address: "",
  });

  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const [imagePreview, setImagePreview] = useState("");

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [editing, setEditing] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const [selectedDay, setSelectedDay] = useState<DayName>("monday");

  const [availability, setAvailability] = useState<Availability>(
    createEmptyAvailability,
  );

  const [availabilityDirty, setAvailabilityDirty] = useState(false);

  const [availabilitySaving, setAvailabilitySaving] = useState(false);

  const [availabilityError, setAvailabilityError] = useState("");

  const [availabilitySuccess, setAvailabilitySuccess] = useState("");

  const getStoredProfilePicture = () => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      return "";
    }

    try {
      const parsedUser = JSON.parse(storedUser);

      return parsedUser.profilePicture || "";
    } catch {
      return "";
    }
  };

  const saveProfilePictureLocally = (profilePicture: string) => {
    if (!profilePicture) {
      return;
    }

    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);

        localStorage.setItem(
          "user",
          JSON.stringify({
            ...parsedUser,
            profilePicture,
          }),
        );
      } catch (error) {
        console.error("Failed to update stored user:", error);
      }
    }

    window.dispatchEvent(
      new CustomEvent("profile-picture-updated", {
        detail: profilePicture,
      }),
    );
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/doctors");

      const data = response.data;

      const doctors: Doctor[] = Array.isArray(data)
        ? data
        : Array.isArray(data?.doctors)
          ? data.doctors
          : [];

      const userId = currentUser?.id || currentUser?._id;

      const profile =
        doctors.find((item) => item.user?._id === userId) ||
        doctors.find((item) => item.user?.email === currentUser?.email);

      if (!profile) {
        setDoctor(null);

        setError("Doctor profile could not be found.");

        return;
      }

      const storedProfilePicture = getStoredProfilePicture();

      const profilePicture =
        profile.user?.profilePicture ||
        currentUser?.profilePicture ||
        storedProfilePicture ||
        "";

      const normalizedAvailability = normalizeAvailability(
        profile.availability,
      );

      const normalizedDoctor: Doctor = {
        ...profile,

        user: {
          ...profile.user,
          profilePicture,
        },

        experienceYears: profile.experienceYears ?? 0,

        availability: Array.isArray(profile.availability)
          ? profile.availability
          : [],
      };

      setDoctor(normalizedDoctor);

      setFormData({
        specialty: profile.specialty || "",

        degree: profile.degree || "",

        experience: String(profile.experienceYears ?? 0),

        fees: String(profile.fees ?? 0),

        address: profile.address || "",
      });

      setAvailability(normalizedAvailability);

      setAvailabilityDirty(false);

      setImagePreview(profilePicture);

      if (profilePicture) {
        saveProfilePictureLocally(profilePicture);
      }
    } catch (error) {
      console.error("Failed to load doctor profile:", error);

      setError("Unable to load your profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");

      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Profile picture must be smaller than 5MB.");

      return;
    }

    setSelectedImage(file);
    setError("");
    setSuccess("");

    const reader = new FileReader();

    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        setImagePreview(reader.result);
      }
    };

    reader.readAsDataURL(file);
  };

  const resetForm = () => {
    if (!doctor) {
      return;
    }

    setFormData({
      specialty: doctor.specialty || "",

      degree: doctor.degree || "",

      experience: String(doctor.experienceYears ?? 0),

      fees: String(doctor.fees ?? 0),

      address: doctor.address || "",
    });

    setSelectedImage(null);

    setImagePreview(
      doctor.user?.profilePicture || getStoredProfilePicture() || "",
    );
  };

  const handleCancel = () => {
    resetForm();

    setEditing(false);
    setError("");
    setSuccess("");
  };

  const uploadImage = async () => {
    if (!selectedImage) {
      return doctor?.user?.profilePicture || "";
    }

    const imageData = new FormData();

    imageData.append("image", selectedImage);

    const response = await api.post("/upload/profile-picture", imageData);

    return response.data?.profilePicture || "";
  };

  const handleSave = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!doctor) {
      return;
    }

    const experienceYears = Number(formData.experience);

    const fees = Number(formData.fees);

    if (Number.isNaN(experienceYears) || experienceYears < 0) {
      setError("Please enter valid experience.");

      return;
    }

    if (Number.isNaN(fees) || fees < 0) {
      setError("Please enter a valid consultation fee.");

      return;
    }

    if (!formData.specialty.trim()) {
      setError("Specialty is required.");

      return;
    }

    if (!formData.degree.trim()) {
      setError("Degree is required.");

      return;
    }

    if (!formData.address.trim()) {
      setError("Clinic address is required.");

      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      let profilePicture =
        doctor.user?.profilePicture || getStoredProfilePicture() || "";

      if (selectedImage) {
        profilePicture = await uploadImage();

        if (profilePicture) {
          saveProfilePictureLocally(profilePicture);
        }
      }

      const response = await api.put(`/doctors/${doctor._id}`, {
        specialty: formData.specialty.trim(),

        degree: formData.degree.trim(),

        experienceYears,

        fees,

        address: formData.address.trim(),
      });

      const updatedDoctor = response.data?.doctor || response.data;

      setDoctor((previous) => {
        if (!previous) {
          return previous;
        }

        return {
          ...previous,

          specialty: updatedDoctor?.specialty ?? formData.specialty.trim(),

          degree: updatedDoctor?.degree ?? formData.degree.trim(),

          experienceYears: updatedDoctor?.experienceYears ?? experienceYears,

          fees: updatedDoctor?.fees ?? fees,

          address: updatedDoctor?.address ?? formData.address.trim(),

          user: {
            ...previous.user,

            ...(updatedDoctor?.user && typeof updatedDoctor.user === "object"
              ? updatedDoctor.user
              : {}),

            profilePicture:
              profilePicture ||
              updatedDoctor?.user?.profilePicture ||
              previous.user.profilePicture,
          },
        };
      });

      setFormData({
        specialty: updatedDoctor?.specialty ?? formData.specialty.trim(),

        degree: updatedDoctor?.degree ?? formData.degree.trim(),

        experience: String(updatedDoctor?.experienceYears ?? experienceYears),

        fees: String(updatedDoctor?.fees ?? fees),

        address: updatedDoctor?.address ?? formData.address.trim(),
      });

      if (profilePicture) {
        saveProfilePictureLocally(profilePicture);

        setImagePreview(profilePicture);
      }

      setSelectedImage(null);
      setEditing(false);

      setSuccess("Profile updated successfully.");
    } catch (error) {
      console.error("Failed to update doctor profile:", error);

      if (axios.isAxiosError(error)) {
        setError(
          error.response?.data?.error ||
            error.response?.data?.message ||
            "Unable to update your profile.",
        );
      } else {
        setError("Unable to update your profile.");
      }
    } finally {
      setSaving(false);
    }
  };

  const toggleTimeSlot = (time: string) => {
    setAvailability((previous) => {
      const currentTimes = previous[selectedDay];

      const selected = currentTimes.includes(time);

      const nextTimes = selected
        ? currentTimes.filter((item) => item !== time)
        : [...currentTimes, time].sort((first, second) =>
            first.localeCompare(second),
          );

      return {
        ...previous,
        [selectedDay]: nextTimes,
      };
    });

    setAvailabilityDirty(true);

    setAvailabilityError("");

    setAvailabilitySuccess("");
  };

  const clearSelectedDay = () => {
    setAvailability((previous) => ({
      ...previous,
      [selectedDay]: [],
    }));

    setAvailabilityDirty(true);

    setAvailabilityError("");

    setAvailabilitySuccess("");
  };

  const selectAllForDay = () => {
    setAvailability((previous) => ({
      ...previous,

      [selectedDay]: [...TIME_SLOTS],
    }));

    setAvailabilityDirty(true);

    setAvailabilityError("");

    setAvailabilitySuccess("");
  };

  const handleAvailabilitySave = async () => {
    if (!doctor) {
      return;
    }

    try {
      setAvailabilitySaving(true);

      setAvailabilityError("");

      setAvailabilitySuccess("");

      const availabilityPayload = availabilityToRanges(availability);

      const response = await api.put(`/doctors/${doctor._id}`, {
        availability: availabilityPayload,
      });

      const updatedDoctor = response.data?.doctor || response.data;

      const returnedAvailability = Array.isArray(updatedDoctor?.availability)
        ? updatedDoctor.availability
        : availabilityPayload;

      const normalizedAvailability =
        normalizeAvailability(returnedAvailability);

      setAvailability(normalizedAvailability);

      setDoctor((previous) => {
        if (!previous) {
          return previous;
        }

        return {
          ...previous,

          availability: returnedAvailability,
        };
      });

      setAvailabilityDirty(false);

      setAvailabilitySuccess("Availability saved successfully.");
    } catch (error) {
      console.error("Failed to save availability:", error);

      if (axios.isAxiosError(error)) {
        setAvailabilityError(
          error.response?.data?.error ||
            error.response?.data?.message ||
            "Unable to save availability.",
        );
      } else {
        setAvailabilityError("Unable to save availability.");
      }
    } finally {
      setAvailabilitySaving(false);
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
      <div className="flex min-h-[60vh] items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />

          <p className="text-sm text-slate-500">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-12">
        <div className="mx-auto max-w-lg rounded-2xl border border-red-200 bg-white p-8 text-center">
          <p className="font-semibold text-slate-900">Profile not found</p>

          <p className="mt-2 text-sm text-slate-500">
            {error || "Your doctor profile could not be loaded."}
          </p>

          <button
            type="button"
            onClick={fetchProfile}
            className="mt-5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const doctorName = doctor.user?.name || "Doctor";

  const selectedTimes = availability[selectedDay];

  const totalSelectedSlots = DAYS.reduce(
    (total, day) => total + availability[day.key].length,
    0,
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-1 text-sm font-medium text-blue-600">
              Doctor Account
            </p>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              My Profile
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              View and manage your professional information and schedule.
            </p>
          </div>

          {!editing && (
            <button
              type="button"
              onClick={() => {
                setEditing(true);

                setSuccess("");
                setError("");
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
                <path strokeLinecap="round" d="M12 20h9" />

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
                  src={imagePreview}
                  alt={doctorName}
                  className="h-28 w-28 rounded-2xl object-cover"
                />
              ) : (
                <div className="flex h-28 w-28 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 text-2xl font-bold text-white">
                  {getInitials(doctorName)}
                </div>
              )}

              {editing && (
                <div className="mt-4">
                  <label
                    htmlFor="profilePicture"
                    className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
                  >
                    {imagePreview ? "Change Picture" : "Upload Picture"}
                  </label>

                  <input
                    id="profilePicture"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />

                  {selectedImage && (
                    <p className="mt-2 max-w-[220px] truncate text-xs text-slate-400">
                      {selectedImage.name}
                    </p>
                  )}
                </div>
              )}

              <h2 className="mt-5 text-lg font-bold text-slate-900">
                {doctorName}
              </h2>

              <p className="mt-1 break-all text-sm text-slate-500">
                {doctor.user?.email}
              </p>

              <span className="mt-4 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                {doctor.specialty || "Doctor"}
              </span>
            </div>
          </div>

          <form
            onSubmit={handleSave}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5 sm:px-6">
              <div>
                <h2 className="font-semibold text-slate-900">
                  Professional Information
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Your doctor profile information.
                </p>
              </div>

              {editing && (
                <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                  Editing
                </span>
              )}
            </div>

            <div className="grid gap-6 p-5 sm:grid-cols-2 sm:p-6">
              <ProfileField label="Full Name" value={doctorName} />

              <ProfileField
                label="Email"
                value={doctor.user?.email || "Not available"}
              />

              <EditableField
                label="Specialty"
                name="specialty"
                value={formData.specialty}
                editing={editing}
                onChange={handleChange}
              />

              <EditableField
                label="Degree"
                name="degree"
                value={formData.degree}
                editing={editing}
                onChange={handleChange}
              />

              <EditableField
                label="Experience"
                name="experience"
                type="number"
                value={formData.experience}
                editing={editing}
                onChange={handleChange}
                suffix="years"
              />

              <EditableField
                label="Consultation Fee"
                name="fees"
                type="number"
                value={formData.fees}
                editing={editing}
                onChange={handleChange}
              />

              <div className="sm:col-span-2">
                <EditableField
                  label="Clinic Address"
                  name="address"
                  value={formData.address}
                  editing={editing}
                  onChange={handleChange}
                />
              </div>
            </div>

            {editing && (
              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/50 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
                <button
                  type="button"
                  onClick={handleCancel}
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
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            )}
          </form>
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-5 w-5"
                >
                  <rect x="3" y="5" width="18" height="16" rx="3" />

                  <path d="M8 3v4M16 3v4M3 10h18" />
                </svg>
              </div>

              <div>
                <h2 className="font-semibold text-slate-900">
                  Availability & Schedule
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Select a day, then choose the appointment times.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                {totalSelectedSlots} available slots
              </span>

              {availabilityDirty && (
                <span className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">
                  Unsaved
                </span>
              )}
            </div>
          </div>

          <div className="p-5 sm:p-6">
            {availabilitySuccess && (
              <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                {availabilitySuccess}
              </div>
            )}

            {availabilityError && (
              <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                {availabilityError}
              </div>
            )}

            <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
              {DAYS.map((day) => {
                const active = selectedDay === day.key;

                const count = availability[day.key].length;

                return (
                  <button
                    key={day.key}
                    type="button"
                    onClick={() => {
                      setSelectedDay(day.key);

                      setAvailabilityError("");

                      setAvailabilitySuccess("");
                    }}
                    className={`rounded-xl border px-3 py-3 text-center transition ${
                      active
                        ? "border-blue-600 bg-blue-600 text-white shadow-sm shadow-blue-600/20"
                        : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50"
                    }`}
                  >
                    <span className="block text-sm font-bold">{day.short}</span>

                    <span
                      className={`mt-1 block text-[10px] font-medium ${
                        active
                          ? "text-blue-100"
                          : count > 0
                            ? "text-emerald-600"
                            : "text-slate-400"
                      }`}
                    >
                      {count > 0 ? `${count} slots` : "No slots"}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {getDayLabel(selectedDay)}
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Click a time to make it available. Click again to remove it.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={clearSelectedDay}
                  disabled={selectedTimes.length === 0}
                  className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Clear day
                </button>

                <button
                  type="button"
                  onClick={selectAllForDay}
                  disabled={selectedTimes.length === TIME_SLOTS.length}
                  className="rounded-xl border border-blue-200 bg-blue-50 px-3.5 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Select all
                </button>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {TIME_SLOTS.map((time) => {
                const selected = selectedTimes.includes(time);

                return (
                  <button
                    key={time}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => toggleTimeSlot(time)}
                    className={`relative rounded-xl border px-3 py-3 text-sm font-semibold transition ${
                      selected
                        ? "border-blue-600 bg-blue-600 text-white shadow-sm shadow-blue-600/20"
                        : "border-slate-200 bg-slate-50 text-slate-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                    }`}
                  >
                    {formatTime(time)}

                    {selected && (
                      <span className="absolute right-2 top-2 text-[10px]">
                        ✓
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {selectedTimes.length === 0 && (
              <div className="mt-5 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-4 text-center text-sm text-slate-500">
                No availability selected for {getDayLabel(selectedDay)}.
              </div>
            )}

            <div className="mt-7 flex flex-col gap-4 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-700">
                  {selectedTimes.length} slots selected for{" "}
                  {getDayLabel(selectedDay)}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Save after changing your weekly schedule.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAvailabilitySave}
                disabled={availabilitySaving || !availabilityDirty}
                className="inline-flex min-w-[180px] items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {availabilitySaving
                  ? "Saving..."
                  : availabilityDirty
                    ? "Save Availability"
                    : "Availability Saved"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-2 text-sm font-medium text-slate-800">{value}</p>
    </div>
  );
}

function EditableField({
  label,
  name,
  value,
  editing,
  onChange,
  type = "text",
  suffix,
}: {
  label: string;
  name: string;
  value: string;
  editing: boolean;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  suffix?: string;
}) {
  if (!editing) {
    return (
      <ProfileField
        label={label}
        value={value ? (suffix ? `${value} ${suffix}` : value) : "Not provided"}
      />
    );
  }

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
        onChange={onChange}
        required
        min={type === "number" ? 0 : undefined}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
      />
    </div>
  );
}
