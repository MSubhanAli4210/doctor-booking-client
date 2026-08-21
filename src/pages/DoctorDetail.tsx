import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { bookAppointment } from "../api/appointmentApi";
import { getDoctorById } from "../api/doctorApi";

interface AvailabilitySlot {
  day: string;
  startTime: string;
  endTime: string;
}

interface Doctor {
  _id: string;

  user: {
    name: string;
    email: string;
    profilePicture?: string;
  };

  specialty: string;
  degree: string;
  experienceYears: number;
  fees: number;
  about?: string;
  availability: AvailabilitySlot[];
}

const ArrowLeftIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className="h-5 w-5"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19 12H5m6-6-6 6 6 6"
    />
  </svg>
);

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
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 7v5l3 2"
    />
  </svg>
);

const DegreeIcon = () => (
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
      d="m3 9 9-5 9 5-9 5-9-5Z"
    />

    <path
      strokeLinecap="round"
      d="M7 12v4.5c3 2 7 2 10 0V12"
    />
  </svg>
);

const ExperienceIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className="h-5 w-5"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    <rect
      x="3"
      y="7"
      width="18"
      height="13"
      rx="3"
    />

    <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <path d="M3 12h18" />
  </svg>
);

const ShieldIcon = () => (
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
      d="M12 3 5 6v5c0 4.8 2.8 8.1 7 10 4.2-1.9 7-5.2 7-10V6l-7-3Z"
    />

    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m9 12 2 2 4-4"
    />
  </svg>
);

const CheckIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className="h-4 w-4"
    stroke="currentColor"
    strokeWidth="2.2"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m5 12 4 4L19 6"
    />
  </svg>
);

const getTodayString = () => {
  const today = new Date();

  const year =
    today.getFullYear();

  const month =
    String(
      today.getMonth() + 1,
    ).padStart(
      2,
      "0",
    );

  const day =
    String(
      today.getDate(),
    ).padStart(
      2,
      "0",
    );

  return `${year}-${month}-${day}`;
};

const getDayFromDate = (
  dateString: string,
) => {
  if (!dateString) {
    return "";
  }

  const date =
    new Date(
      `${dateString}T12:00:00`,
    );

  return new Intl.DateTimeFormat(
    "en-US",
    {
      weekday: "long",
    },
  )
    .format(date)
    .toLowerCase();
};

const capitalize = (
  value: string,
) =>
  value
    ? value
        .charAt(0)
        .toUpperCase() +
      value.slice(1)
    : "";

const formatDoctorName = (
  name: string,
) => {
  const cleanName =
    name
      .trim()
      .replace(
        /^(?:dr\b\s*\.?\s*)+/i,
        "",
      )
      .trim();

  return `Dr. ${cleanName}`;
};

const DoctorDetailSkeleton =
  () => (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 h-10 w-40 animate-pulse rounded-xl bg-slate-200" />

      <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_390px]">
        <div className="space-y-6">
          <div className="rounded-[32px] border border-slate-200 bg-white p-6 sm:p-8">
            <div className="flex flex-col gap-6 sm:flex-row">
              <div className="h-36 w-36 animate-pulse rounded-[28px] bg-slate-200" />

              <div className="flex-1 space-y-4">
                <div className="h-4 w-28 animate-pulse rounded bg-slate-200" />

                <div className="h-8 w-64 animate-pulse rounded bg-slate-200" />

                <div className="h-4 w-48 animate-pulse rounded bg-slate-200" />

                <div className="grid grid-cols-2 gap-3 pt-3">
                  <div className="h-20 animate-pulse rounded-2xl bg-slate-100" />

                  <div className="h-20 animate-pulse rounded-2xl bg-slate-100" />
                </div>
              </div>
            </div>
          </div>

          <div className="h-60 animate-pulse rounded-[32px] bg-white" />
        </div>

        <div className="h-[520px] animate-pulse rounded-[32px] bg-white" />
      </div>
    </div>
  );

export default function DoctorDetail() {
  const {
    id,
  } = useParams();

  const {
    user,
  } = useAuth();

  const navigate =
    useNavigate();

  const [
    doctor,
    setDoctor,
  ] =
    useState<Doctor | null>(
      null,
    );

  const [
    selectedDay,
    setSelectedDay,
  ] =
    useState("");

  const [
    selectedTime,
    setSelectedTime,
  ] =
    useState("");

  const [
    date,
    setDate,
  ] =
    useState("");

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    booking,
    setBooking,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState("");

  useEffect(() => {
    const fetchDoctor =
      async () => {
        if (!id) {
          setError(
            "Doctor ID is missing.",
          );

          setLoading(
            false,
          );

          return;
        }

        try {
          setLoading(
            true,
          );

          setError("");

          const doctorData =
            await getDoctorById(
              id,
            );

          setDoctor(
            doctorData,
          );
        } catch (
          err: any
        ) {
          setError(
            err.response?.data
              ?.message ||
              "Failed to load doctor details. Please try again.",
          );

          setDoctor(
            null,
          );
        } finally {
          setLoading(
            false,
          );
        }
      };

    fetchDoctor();
  }, [id]);

  const selectAvailability = (
    slot: AvailabilitySlot,
  ) => {
    setSelectedDay(
      slot.day,
    );

    setSelectedTime(
      `${slot.startTime}-${slot.endTime}`,
    );

    setDate("");

    setError("");
  };

  const handleDateChange = (
    selectedDate: string,
  ) => {
    setDate(
      selectedDate,
    );

    setError("");

    if (
      !selectedDate ||
      !selectedDay
    ) {
      return;
    }

    const actualDay =
      getDayFromDate(
        selectedDate,
      );

    if (
      actualDay !==
      selectedDay.toLowerCase()
    ) {
      setError(
        `Please choose a ${capitalize(
          selectedDay,
        )}, because that is the availability you selected.`,
      );
    }
  };

  const handleBook =
    async () => {
      if (!user) {
        navigate(
          "/login",
        );

        return;
      }

      if (
        user.role !==
        "patient"
      ) {
        setError(
          "Only patients can book appointments.",
        );

        return;
      }

      if (!doctor) {
        setError(
          "Doctor information is unavailable.",
        );

        return;
      }

      if (
        !selectedDay ||
        !selectedTime
      ) {
        setError(
          "Please select an available time first.",
        );

        return;
      }

      if (!date) {
        setError(
          "Please select an appointment date.",
        );

        return;
      }

      const actualDay =
        getDayFromDate(
          date,
        );

      if (
        actualDay !==
        selectedDay.toLowerCase()
      ) {
        setError(
          `The selected doctor is available on ${capitalize(
            selectedDay,
          )}. Please choose a matching date.`,
        );

        return;
      }

      const appointmentTime =
        selectedTime
          .split("-")[0]
          ?.trim();

      if (
        !appointmentTime ||
        !/^\d{1,2}:\d{2}$/.test(
          appointmentTime,
        )
      ) {
        setError(
          "Invalid appointment time.",
        );

        return;
      }

      setBooking(
        true,
      );

      setError("");

      try {
        await bookAppointment(
          {
            doctorId:
              doctor._id,

            date,

            time:
              appointmentTime,
          },
        );

        navigate(
          "/my-appointments",
        );
      } catch (
        err: any
      ) {
        setError(
          err.response?.data
            ?.message ||
            "Failed to book appointment.",
        );
      } finally {
        setBooking(
          false,
        );
      }
    };

  if (loading) {
    return (
      <DoctorDetailSkeleton />
    );
  }

  if (!doctor) {
    return (
      <main className="min-h-[70vh] px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-lg rounded-[32px] border border-slate-200 bg-white p-8 text-center shadow-[0_15px_50px_rgba(15,23,42,0.06)]">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-2xl">
            🩺
          </div>

          <h1 className="mt-5 text-2xl font-black text-slate-900">
            Doctor not found
          </h1>

          <p className="mt-3 leading-7 text-slate-500">
            {error ||
              "We couldn't find the doctor you're looking for."}
          </p>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/",
              )
            }
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-600"
          >
            <ArrowLeftIcon />

            Back to doctors
          </button>
        </div>
      </main>
    );
  }

  const hasAvailability =
    Array.isArray(
      doctor.availability,
    ) &&
    doctor.availability
      .length >
      0;

  const selectedDateMatchesDay =
    Boolean(
      date,
    ) &&
    Boolean(
      selectedDay,
    ) &&
    getDayFromDate(
      date,
    ) ===
      selectedDay.toLowerCase();

  const doctorDisplayName =
    formatDoctorName(
      doctor.user.name,
    );

  return (
    <main className="min-h-screen bg-slate-50/70">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <button
          type="button"
          onClick={() =>
            navigate(
              -1,
            )
          }
          className="mb-6 inline-flex items-center gap-2 rounded-xl px-2 py-2 text-sm font-semibold text-slate-500 transition hover:text-slate-950"
        >
          <ArrowLeftIcon />

          Back to doctors
        </button>

        <div className="grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_400px]">
          <div className="space-y-6">
            <section className="overflow-hidden rounded-[32px] border border-slate-200/80 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.05)]">
              <div className="h-24 bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-400 sm:h-28" />

              <div className="px-5 pb-6 sm:px-8 sm:pb-8">
                <div className="-mt-14 flex flex-col gap-5 sm:-mt-16 sm:flex-row sm:items-end">
                  <div className="h-28 w-28 shrink-0 overflow-hidden rounded-[28px] border-[5px] border-white bg-blue-50 shadow-lg sm:h-32 sm:w-32">
                    {doctor.user
                      .profilePicture ? (
                      <img
                        src={
                          doctor
                            .user
                            .profilePicture
                        }
                        alt={
                          doctorDisplayName
                        }
                        className="h-full w-full object-cover object-top"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-100 to-cyan-50 text-4xl font-black text-blue-600">
                        {doctor.user.name
                          ?.charAt(
                            0,
                          )
                          ?.toUpperCase() ||
                          "?"}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 pb-1">
                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                      <div>
                        <div
                          className={`mb-2 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold ${
                            hasAvailability
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          <span
                            className={`h-2 w-2 rounded-full ${
                              hasAvailability
                                ? "bg-emerald-500"
                                : "bg-slate-400"
                            }`}
                          />

                          {hasAvailability
                            ? "Accepting appointments"
                            : "No availability"}
                        </div>

                        <h1 className="text-2xl font-black tracking-[-0.03em] text-slate-950 sm:text-3xl">
                          {
                            doctorDisplayName
                          }
                        </h1>

                        <p className="mt-2 font-semibold text-blue-600">
                          {
                            doctor.specialty
                          }
                        </p>
                      </div>

                      <div className="inline-flex w-fit items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600">
                        <ShieldIcon />

                        Verified profile
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-7 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <div className="flex items-center gap-2 text-slate-400">
                      <DegreeIcon />

                      <span className="text-xs font-semibold uppercase tracking-wider">
                        Degree
                      </span>
                    </div>

                    <p className="mt-2 font-bold text-slate-900">
                      {
                        doctor.degree
                      }
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <div className="flex items-center gap-2 text-slate-400">
                      <ExperienceIcon />

                      <span className="text-xs font-semibold uppercase tracking-wider">
                        Experience
                      </span>
                    </div>

                    <p className="mt-2 font-bold text-slate-900">
                      {
                        doctor.experienceYears
                      }{" "}
                      {doctor.experienceYears ===
                      1
                        ? "year"
                        : "years"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <div className="flex items-center gap-2 text-slate-400">
                      <CalendarIcon />

                      <span className="text-xs font-semibold uppercase tracking-wider">
                        Availability
                      </span>
                    </div>

                    <p className="mt-2 font-bold text-slate-900">
                      {doctor
                        .availability
                        ?.length ||
                        0}{" "}
                      schedule
                      {doctor
                        .availability
                        ?.length ===
                      1
                        ? ""
                        : "s"}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)] sm:p-7">
              <div className="mb-5">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-600">
                  Doctor profile
                </p>

                <h2 className="mt-2 text-xl font-black tracking-tight text-slate-900">
                  About{" "}
                  {
                    doctorDisplayName
                  }
                </h2>
              </div>

              {doctor.about ? (
                <p className="max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
                  {
                    doctor.about
                  }
                </p>
              ) : (
                <p className="text-sm leading-7 text-slate-500">
                  No additional
                  information has
                  been provided by
                  this doctor yet.
                </p>
              )}

              <div className="mt-7 border-t border-slate-100 pt-6">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Specialty
                    </p>

                    <p className="mt-2 font-bold text-slate-900">
                      {
                        doctor.specialty
                      }
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Qualification
                    </p>

                    <p className="mt-2 font-bold text-slate-900">
                      {
                        doctor.degree
                      }
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Experience
                    </p>

                    <p className="mt-2 font-bold text-slate-900">
                      {
                        doctor.experienceYears
                      }{" "}
                      {doctor.experienceYears ===
                      1
                        ? "year"
                        : "years"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Consultation
                      fee
                    </p>

                    <p className="mt-2 text-xl font-black text-slate-900">
                      $
                      {
                        doctor.fees
                      }
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-[28px] border border-slate-200/80 bg-white p-5 sm:p-7">
              <h2 className="text-xl font-black tracking-tight text-slate-900">
                Booking made simple
              </h2>

              <div className="mt-6 grid gap-5 sm:grid-cols-3">
                <div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-sm font-black text-blue-600">
                    1
                  </div>

                  <p className="mt-3 font-bold text-slate-900">
                    Choose availability
                  </p>

                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Select one of
                    the doctor's
                    available time
                    windows.
                  </p>
                </div>

                <div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-sm font-black text-blue-600">
                    2
                  </div>

                  <p className="mt-3 font-bold text-slate-900">
                    Pick your date
                  </p>

                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Choose a date
                    that matches
                    the selected
                    weekday.
                  </p>
                </div>

                <div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-sm font-black text-blue-600">
                    3
                  </div>

                  <p className="mt-3 font-bold text-slate-900">
                    Confirm appointment
                  </p>

                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Review the
                    appointment and
                    confirm your
                    booking.
                  </p>
                </div>
              </div>
            </section>
          </div>

          <aside className="lg:sticky lg:top-24">
            <div className="overflow-hidden rounded-[32px] border border-slate-200/80 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
              <div className="border-b border-slate-100 p-5 sm:p-6">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-sm text-slate-500">
                      Consultation fee
                    </p>

                    <div className="mt-1 flex items-baseline gap-1">
                      <span className="text-3xl font-black tracking-tight text-slate-950">
                        $
                        {
                          doctor.fees
                        }
                      </span>

                      <span className="text-sm text-slate-400">
                        / appointment
                      </span>
                    </div>
                  </div>

                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                    <CalendarIcon />
                  </div>
                </div>
              </div>

              <div className="p-5 sm:p-6">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-600">
                    Book appointment
                  </p>

                  <h2 className="mt-2 text-xl font-black text-slate-900">
                    Select your schedule
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Choose an
                    available schedule
                    and a matching
                    appointment date.
                  </p>
                </div>

                <div className="mt-7">
                  <div className="mb-3 flex items-center justify-between">
                    <label className="text-sm font-bold text-slate-800">
                      Available times
                    </label>

                    <span className="text-xs text-slate-400">
                      Step 1 of 2
                    </span>
                  </div>

                  {!hasAvailability ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-7 text-center">
                      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-white text-slate-400 shadow-sm">
                        <ClockIcon />
                      </div>

                      <p className="mt-3 text-sm font-bold text-slate-700">
                        No availability
                        set
                      </p>

                      <p className="mt-1 text-xs leading-5 text-slate-400">
                        This doctor
                        hasn't added
                        appointment
                        availability yet.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {doctor.availability.map(
                        (
                          slot,
                        ) => {
                          const timeRange =
                            `${slot.startTime}-${slot.endTime}`;

                          const isSelected =
                            selectedDay ===
                              slot.day &&
                            selectedTime ===
                              timeRange;

                          return (
                            <button
                              key={`${slot.day}-${slot.startTime}-${slot.endTime}`}
                              type="button"
                              onClick={() =>
                                selectAvailability(
                                  slot,
                                )
                              }
                              className={`flex w-full items-center justify-between rounded-2xl border p-3.5 text-left transition-all ${
                                isSelected
                                  ? "border-blue-600 bg-blue-50 shadow-[0_5px_20px_rgba(37,99,235,0.10)]"
                                  : "border-slate-200 bg-white hover:border-blue-200 hover:bg-blue-50/50"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                                    isSelected
                                      ? "bg-blue-600 text-white"
                                      : "bg-slate-100 text-slate-500"
                                  }`}
                                >
                                  <ClockIcon />
                                </div>

                                <div>
                                  <p
                                    className={`text-sm font-bold capitalize ${
                                      isSelected
                                        ? "text-blue-700"
                                        : "text-slate-800"
                                    }`}
                                  >
                                    {
                                      slot.day
                                    }
                                  </p>

                                  <p className="mt-0.5 text-xs text-slate-500">
                                    {
                                      slot.startTime
                                    }{" "}
                                    –{" "}
                                    {
                                      slot.endTime
                                    }
                                  </p>
                                </div>
                              </div>

                              <div
                                className={`flex h-6 w-6 items-center justify-center rounded-full border ${
                                  isSelected
                                    ? "border-blue-600 bg-blue-600 text-white"
                                    : "border-slate-300 text-transparent"
                                }`}
                              >
                                <CheckIcon />
                              </div>
                            </button>
                          );
                        },
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-7">
                  <div className="mb-3 flex items-center justify-between">
                    <label
                      htmlFor="appointment-date"
                      className="text-sm font-bold text-slate-800"
                    >
                      Appointment date
                    </label>

                    <span className="text-xs text-slate-400">
                      Step 2 of 2
                    </span>
                  </div>

                  {!selectedDay ? (
                    <div className="rounded-2xl bg-slate-50 px-4 py-4 text-sm text-slate-400">
                      Select an
                      available time
                      first.
                    </div>
                  ) : (
                    <>
                      <div className="relative">
                        <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                          <CalendarIcon />
                        </div>

                        <input
                          id="appointment-date"
                          type="date"
                          min={
                            getTodayString()
                          }
                          value={
                            date
                          }
                          onChange={(
                            e,
                          ) =>
                            handleDateChange(
                              e.target
                                .value,
                            )
                          }
                          className={`h-14 w-full rounded-2xl border bg-white pl-12 pr-4 text-sm font-semibold text-slate-800 outline-none transition focus:ring-4 ${
                            date &&
                            !selectedDateMatchesDay
                              ? "border-red-300 focus:border-red-400 focus:ring-red-50"
                              : "border-slate-200 focus:border-blue-400 focus:ring-blue-50"
                          }`}
                        />
                      </div>

                      <p className="mt-2.5 text-xs leading-5 text-slate-400">
                        Please choose
                        a{" "}
                        <span className="font-bold capitalize text-slate-600">
                          {
                            selectedDay
                          }
                        </span>{" "}
                        because that
                        matches the
                        selected
                        availability.
                      </p>
                    </>
                  )}
                </div>

                {error && (
                  <div className="mt-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3.5">
                    <p className="text-sm font-medium leading-6 text-red-700">
                      {
                        error
                      }
                    </p>
                  </div>
                )}

                {selectedDay &&
                  selectedTime &&
                  date &&
                  selectedDateMatchesDay && (
                    <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                        Appointment summary
                      </p>

                      <div className="mt-3 space-y-2">
                        <div className="flex items-center justify-between gap-3 text-sm">
                          <span className="text-slate-500">
                            Doctor
                          </span>

                          <span className="text-right font-bold text-slate-900">
                            {
                              doctorDisplayName
                            }
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-3 text-sm">
                          <span className="text-slate-500">
                            Day
                          </span>

                          <span className="font-bold capitalize text-slate-900">
                            {
                              selectedDay
                            }
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-3 text-sm">
                          <span className="text-slate-500">
                            Date
                          </span>

                          <span className="font-bold text-slate-900">
                            {
                              date
                            }
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-3 text-sm">
                          <span className="text-slate-500">
                            Time
                          </span>

                          <span className="font-bold text-slate-900">
                            {selectedTime.replace(
                              "-",
                              " – ",
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                <button
                  type="button"
                  onClick={
                    handleBook
                  }
                  disabled={
                    booking ||
                    !hasAvailability
                  }
                  className="mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-xl active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                >
                  {booking ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                      Booking
                      appointment...
                    </>
                  ) : (
                    <>
                      <CalendarIcon />

                      {user
                        ? "Book appointment"
                        : "Login to book"}
                    </>
                  )}
                </button>

                <div className="mt-4 flex items-start gap-2.5">
                  <span className="mt-0.5 text-emerald-600">
                    <ShieldIcon />
                  </span>

                  <p className="text-xs leading-5 text-slate-400">
                    Your appointment
                    is only created
                    after you confirm
                    the booking.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}