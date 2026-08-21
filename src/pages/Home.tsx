import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import DoctorCard, {
  type DoctorCardDoctor,
} from "../components/DoctorCard";

const specialties = [
  "All",
  "Cardiology",
  "Dermatology",
  "Neurology",
  "Pediatrics",
  "Orthopedics",
  "Gynecology",
  "Dentistry",
];

const SearchIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className="h-5 w-5"
    stroke="currentColor"
    strokeWidth="2"
  >
    <circle cx="11" cy="11" r="7" />
    <path strokeLinecap="round" d="m20 20-3.2-3.2" />
  </svg>
);

const CalendarIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className="h-6 w-6"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    <rect x="3" y="5" width="18" height="16" rx="3" />
    <path d="M8 3v4M16 3v4M3 10h18" />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m8 15 2.2 2.2L16 13"
    />
  </svg>
);

const ShieldIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className="h-6 w-6"
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

const ClockIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className="h-6 w-6"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    <circle cx="12" cy="12" r="9" />
    <path strokeLinecap="round" d="M12 7v5l3 2" />
  </svg>
);

const ArrowIcon = () => (
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
      d="M5 12h14m-6-6 6 6-6 6"
    />
  </svg>
);

const HeartIcon = () => (
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
      d="M20.8 5.8a5.5 5.5 0 0 0-7.8 0L12 6.9l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 22l8.8-8.4a5.5 5.5 0 0 0 0-7.8Z"
    />
  </svg>
);

const UsersIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className="h-6 w-6"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
    />
    <circle cx="9" cy="7" r="4" />
    <path
      strokeLinecap="round"
      d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
    />
  </svg>
);

const DoctorSkeleton = () => (
  <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white">
    <div className="h-64 animate-pulse bg-slate-100" />

    <div className="space-y-4 p-6">
      <div className="h-3 w-24 animate-pulse rounded bg-slate-100" />
      <div className="h-6 w-3/5 animate-pulse rounded bg-slate-100" />
      <div className="h-4 w-2/5 animate-pulse rounded bg-slate-100" />

      <div className="grid grid-cols-2 gap-3">
        <div className="h-16 animate-pulse rounded-2xl bg-slate-100" />
        <div className="h-16 animate-pulse rounded-2xl bg-slate-100" />
      </div>

      <div className="h-12 animate-pulse rounded-xl bg-slate-100" />
    </div>
  </div>
);

const Home = () => {
  const [doctors, setDoctors] = useState<DoctorCardDoctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] =
    useState("All");

  useEffect(() => {
    const loadDoctors = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/doctors");

        /*
          Supports common API response formats:

          [
            {...doctor}
          ]

          OR

          {
            doctors: [...]
          }

          OR

          {
            data: [...]
          }
        */

        const result =
          response.data?.doctors ??
          response.data?.data ??
          response.data ??
          [];

        setDoctors(Array.isArray(result) ? result : []);
      } catch (err) {
        console.error("Failed to load doctors", err);

        setError(
          "We couldn't load the doctors right now. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadDoctors();
  }, []);

  const filteredDoctors = useMemo(() => {
    const normalizedSearch = search.toLowerCase().trim();

    return doctors.filter((doctor) => {
      const doctorName =
        doctor.user?.name || doctor.name || "";

      const doctorSpecialty =
        doctor.specialty || doctor.specialization || "";

      const matchesSearch =
        !normalizedSearch ||
        doctorName.toLowerCase().includes(normalizedSearch) ||
        doctorSpecialty
          .toLowerCase()
          .includes(normalizedSearch);

      const matchesSpecialty =
        selectedSpecialty === "All" ||
        doctorSpecialty.toLowerCase() ===
          selectedSpecialty.toLowerCase();

      return matchesSearch && matchesSpecialty;
    });
  }, [doctors, search, selectedSpecialty]);

  const scrollToDoctors = () => {
    document
      .getElementById("doctors")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <main className="overflow-hidden">
      {/* =========================
          HERO
      ========================== */}
      <section className="px-4 pb-12 pt-6 sm:px-6 lg:px-8">
        <div className="hero-grid relative mx-auto max-w-7xl overflow-hidden rounded-[32px] bg-slate-950 px-6 py-14 shadow-[0_30px_100px_rgba(15,23,42,0.18)] sm:px-10 sm:py-16 lg:min-h-[560px] lg:px-16 lg:py-20">
          {/* Background glow */}
          <div className="pointer-events-none absolute -right-20 -top-32 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-40 left-1/3 h-96 w-96 rounded-full bg-cyan-400/10 blur-3xl" />

          <div className="relative z-10 grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
            {/* Hero copy */}
            <div className="max-w-3xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3.5 py-2 text-sm font-medium text-blue-100 backdrop-blur-sm">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-500 text-white">
                  <HeartIcon />
                </span>

                Healthcare made simple
              </div>

              <h1 className="max-w-3xl text-4xl font-black leading-[1.08] tracking-[-0.04em] text-white sm:text-5xl lg:text-6xl">
                The right doctor,
                <span className="block bg-gradient-to-r from-blue-400 via-sky-300 to-cyan-300 bg-clip-text text-transparent">
                  right when you need one.
                </span>
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
                Find trusted doctors, compare specialists, choose a
                convenient time and book your appointment in just a few
                steps.
              </p>

              {/* Search */}
              <div className="mt-8 max-w-2xl">
                <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white p-2 shadow-2xl sm:flex-row">
                  <div className="flex min-h-14 flex-1 items-center gap-3 px-3">
                    <span className="text-slate-400">
                      <SearchIcon />
                    </span>

                    <input
                      type="text"
                      value={search}
                      onChange={(event) =>
                        setSearch(event.target.value)
                      }
                      onFocus={scrollToDoctors}
                      placeholder="Search doctor or specialty..."
                      className="h-full w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 sm:text-base"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={scrollToDoctors}
                    className="min-h-14 rounded-xl bg-blue-600 px-6 text-sm font-bold text-white transition-all hover:bg-blue-700 active:scale-[0.98]"
                  >
                    Find a doctor
                  </button>
                </div>

                <p className="mt-3 text-xs text-slate-400">
                  Search by doctor name or medical specialty
                </p>
              </div>

              {/* Trust row */}
              <div className="mt-9 flex flex-wrap gap-x-7 gap-y-3 text-sm text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  Easy booking
                </div>

                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  Trusted specialists
                </div>

                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  Secure experience
                </div>
              </div>
            </div>

            {/* Hero visual */}
            <div className="relative hidden min-h-[390px] lg:block">
              <div className="absolute right-0 top-4 w-[88%] rounded-[32px] border border-white/10 bg-white/10 p-5 shadow-2xl backdrop-blur-xl">
                <div className="rounded-[24px] bg-white p-5">
                  <div className="mb-5 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-blue-600">
                        NEXT APPOINTMENT
                      </p>

                      <p className="mt-1 text-lg font-extrabold text-slate-900">
                        Your health, organized
                      </p>
                    </div>

                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                      <CalendarIcon />
                    </div>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 font-bold text-white">
                        MD
                      </div>

                      <div className="min-w-0">
                        <p className="font-bold text-slate-900">
                          Specialist consultation
                        </p>

                        <p className="mt-0.5 text-sm text-slate-500">
                          Choose a doctor that fits your needs
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2">
                    {["09:00", "10:30", "12:00"].map(
                      (time, index) => (
                        <div
                          key={time}
                          className={`rounded-xl px-3 py-2.5 text-center text-xs font-bold ${
                            index === 1
                              ? "bg-blue-600 text-white"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {time}
                        </div>
                      ),
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={scrollToDoctors}
                    className="mt-4 w-full rounded-xl bg-slate-900 py-3.5 text-sm font-bold text-white"
                  >
                    Browse available doctors
                  </button>
                </div>
              </div>

              {/* Floating badge */}
              <div className="absolute bottom-4 left-0 rounded-2xl border border-white/20 bg-white/95 p-4 shadow-xl backdrop-blur">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <ShieldIcon />
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">
                      Booking process
                    </p>
                    <p className="font-bold text-slate-900">
                      Simple & secure
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================
          BENEFITS
      ========================== */}
      <section className="px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-3">
          <div className="flex gap-4 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-[0_6px_25px_rgba(15,23,42,0.04)]">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <UsersIcon />
            </div>

            <div>
              <h3 className="font-bold text-slate-900">
                Find your specialist
              </h3>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                Browse doctors based on the care you need.
              </p>
            </div>
          </div>

          <div className="flex gap-4 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-[0_6px_25px_rgba(15,23,42,0.04)]">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
              <ClockIcon />
            </div>

            <div>
              <h3 className="font-bold text-slate-900">
                Book in minutes
              </h3>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                Choose an available time that works for you.
              </p>
            </div>
          </div>

          <div className="flex gap-4 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-[0_6px_25px_rgba(15,23,42,0.04)]">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <ShieldIcon />
            </div>

            <div>
              <h3 className="font-bold text-slate-900">
                Manage your care
              </h3>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                Keep appointments and communication in one place.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================
          SPECIALTIES
      ========================== */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-blue-600">
              Explore care
            </p>

            <h2 className="mt-3 text-3xl font-black tracking-[-0.03em] text-slate-900 sm:text-4xl">
              Find care by specialty
            </h2>

            <p className="mt-3 leading-7 text-slate-500">
              Quickly narrow your search and find the right specialist
              for your needs.
            </p>
          </div>

          <div className="no-scrollbar mt-8 flex gap-3 overflow-x-auto pb-2">
            {specialties.map((specialty) => {
              const active =
                selectedSpecialty === specialty;

              return (
                <button
                  key={specialty}
                  type="button"
                  onClick={() => {
                    setSelectedSpecialty(specialty);

                    setTimeout(() => {
                      scrollToDoctors();
                    }, 50);
                  }}
                  className={`shrink-0 rounded-full border px-5 py-3 text-sm font-semibold transition-all ${
                    active
                      ? "border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                      : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                  }`}
                >
                  {specialty}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================
          DOCTORS
      ========================== */}
      <section
        id="doctors"
        className="scroll-mt-24 bg-white/60 px-4 py-16 sm:px-6 lg:px-8"
      >
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.14em] text-blue-600">
                Our doctors
              </p>

              <h2 className="mt-3 text-3xl font-black tracking-[-0.03em] text-slate-900 sm:text-4xl">
                Meet trusted specialists
              </h2>

              <p className="mt-3 max-w-2xl leading-7 text-slate-500">
                Compare doctors and choose the one that feels right
                for you.
              </p>
            </div>

            {!loading && (
              <p className="text-sm font-medium text-slate-500">
                {filteredDoctors.length}{" "}
                {filteredDoctors.length === 1
                  ? "doctor"
                  : "doctors"}{" "}
                found
              </p>
            )}
          </div>

          {/* Search inside doctors section */}
          <div className="mt-8 flex max-w-xl items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 shadow-sm transition focus-within:border-blue-300 focus-within:ring-4 focus-within:ring-blue-50">
            <span className="text-slate-400">
              <SearchIcon />
            </span>

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search by doctor or specialty..."
              className="h-14 w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="text-xs font-semibold text-slate-400 hover:text-slate-700"
              >
                Clear
              </button>
            )}
          </div>

          {/* Loading */}
          {loading && (
            <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <DoctorSkeleton key={index} />
              ))}
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="mt-10 rounded-3xl border border-red-100 bg-red-50 p-8 text-center">
              <p className="font-bold text-red-800">
                Unable to load doctors
              </p>

              <p className="mt-2 text-sm text-red-600">
                {error}
              </p>

              <button
                type="button"
                onClick={() => window.location.reload()}
                className="mt-5 rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white"
              >
                Try again
              </button>
            </div>
          )}

          {/* Doctors */}
          {!loading &&
            !error &&
            filteredDoctors.length > 0 && (
              <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {filteredDoctors.map((doctor) => (
                  <DoctorCard
                    key={doctor._id}
                    doctor={doctor}
                  />
                ))}
              </div>
            )}

          {/* Empty state */}
          {!loading &&
            !error &&
            filteredDoctors.length === 0 && (
              <div className="mt-10 rounded-[32px] border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm">
                  <SearchIcon />
                </div>

                <h3 className="mt-5 text-lg font-bold text-slate-900">
                  No doctors found
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                  Try another doctor name or choose a different
                  specialty.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setSelectedSpecialty("All");
                  }}
                  className="mt-5 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white"
                >
                  Reset filters
                </button>
              </div>
            )}
        </div>
      </section>

      {/* =========================
          CTA
      ========================== */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[32px] bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 px-6 py-12 sm:px-10 lg:flex lg:items-center lg:justify-between lg:px-14">
          <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-cyan-300/20 blur-3xl" />

          <div className="relative max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-blue-200">
              Better healthcare starts here
            </p>

            <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
              Ready to book your next appointment?
            </h2>

            <p className="mt-4 leading-7 text-blue-100">
              Find a specialist and choose an appointment time that
              works for you.
            </p>
          </div>

          <div className="relative mt-8 lg:mt-0">
            <button
              type="button"
              onClick={scrollToDoctors}
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-4 text-sm font-bold text-blue-700 shadow-xl transition hover:-translate-y-0.5 hover:bg-blue-50"
            >
              Find a doctor
              <ArrowIcon />
            </button>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;