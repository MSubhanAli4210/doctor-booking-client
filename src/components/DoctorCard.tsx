import { Link } from "react-router-dom";

export type DoctorCardDoctor = {
  _id: string;

  name?: string;

  user?: {
    _id?: string;
    name?: string;
    email?: string;
    profilePicture?: string;
    profileImage?: string;
  };

  specialty?: string;
  specialization?: string;

  experienceYears?: number;
  experience?: number;

  fees?: number;
  fee?: number;

  rating?: number;
  averageRating?: number;
  totalReviews?: number;
  reviewCount?: number;

  profilePicture?: string;
  profileImage?: string;
  image?: string;

  city?: string;
  location?: string;
  address?: string;

  isAvailable?: boolean;
};

interface DoctorCardProps {
  doctor: DoctorCardDoctor;
}

const UserIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className="h-12 w-12 text-slate-300"
    stroke="currentColor"
    strokeWidth="1.6"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.5 20.1a7.5 7.5 0 0 1 15 0"
    />
  </svg>
);

const StarIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className="h-4 w-4 text-amber-400"
  >
    <path d="M12 2.75l2.82 5.72 6.31.92-4.57 4.45 1.08 6.29L12 17.16l-5.64 2.97 1.08-6.29-4.57-4.45 6.31-.92L12 2.75Z" />
  </svg>
);

const ArrowIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className="h-4 w-4"
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

const LocationIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className="h-4 w-4"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 21s6-5.1 6-11a6 6 0 1 0-12 0c0 5.9 6 11 6 11Z"
    />

    <circle
      cx="12"
      cy="10"
      r="2"
    />
  </svg>
);

const getInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

const DoctorCard = ({
  doctor,
}: DoctorCardProps) => {
  const name =
    doctor.user?.name ||
    doctor.name ||
    "Doctor";

  const specialty =
    doctor.specialty ||
    doctor.specialization ||
    "General Physician";

  const experience =
    doctor.experienceYears ??
    doctor.experience ??
    0;

  const fee =
    doctor.fees ??
    doctor.fee ??
    0;

  const rating =
    doctor.averageRating ??
    doctor.rating ??
    4.8;

  const reviews =
    doctor.totalReviews ??
    doctor.reviewCount ??
    0;

  const image =
    doctor.user?.profilePicture ||
    doctor.profilePicture ||
    doctor.user?.profileImage ||
    doctor.profileImage ||
    doctor.image ||
    "";

  const location =
    doctor.city ||
    doctor.location ||
    doctor.address ||
    "Medical Center";

  const initials =
    getInitials(name);

  return (
    <article className="group overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.05)] transition-all duration-300 hover:-translate-y-1.5 hover:border-blue-200 hover:shadow-[0_20px_50px_rgba(37,99,235,0.12)]">
      <div className="relative h-64 overflow-hidden bg-gradient-to-br from-blue-50 via-sky-50 to-indigo-50">
        {image ? (
          <img
            src={image}
            alt={`Dr. ${name}`}
            loading="lazy"
            className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.035]"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-white bg-white shadow-lg">
              {initials ? (
                <span className="text-2xl font-black text-blue-600">
                  {initials}
                </span>
              ) : (
                <UserIcon />
              )}
            </div>
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-950/25 to-transparent" />

        <div className="absolute left-4 top-4">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/90 px-3 py-1.5 text-xs font-semibold text-emerald-700 shadow-sm backdrop-blur-md">
            <span
              className={`h-2 w-2 rounded-full ${
                doctor.isAvailable ===
                false
                  ? "bg-amber-500"
                  : "bg-emerald-500"
              }`}
            />

            {doctor.isAvailable ===
            false
              ? "Limited availability"
              : "Available today"}
          </span>
        </div>

        <div className="absolute bottom-4 right-4 flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-sm font-bold text-slate-800 shadow-sm backdrop-blur">
          <StarIcon />

          {Number(
            rating,
          ).toFixed(1)}
        </div>
      </div>

      <div className="p-5 sm:p-6">
        <div className="mb-4">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-blue-600">
            {specialty}
          </p>

          <h3 className="text-xl font-bold tracking-tight text-slate-900">
            Dr. {name}
          </h3>

          <div className="mt-2 flex items-center gap-1.5 text-sm text-slate-500">
            <LocationIcon />

            <span className="truncate">
              {location}
            </span>
          </div>
        </div>

        <div className="mb-5 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-slate-50 px-3.5 py-3">
            <p className="text-xs text-slate-500">
              Experience
            </p>

            <p className="mt-1 text-sm font-bold text-slate-900">
              {experience > 0
                ? `${experience}+ years`
                : "Experienced"}
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 px-3.5 py-3">
            <p className="text-xs text-slate-500">
              Patient reviews
            </p>

            <p className="mt-1 text-sm font-bold text-slate-900">
              {reviews > 0
                ? `${reviews} reviews`
                : "Highly rated"}
            </p>
          </div>
        </div>

        <div className="flex items-end justify-between gap-3 border-t border-slate-100 pt-5">
          <div>
            <p className="text-xs text-slate-500">
              Consultation fee
            </p>

            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-xl font-extrabold text-slate-900">
                {fee > 0
                  ? `Rs. ${fee.toLocaleString()}`
                  : "Contact"}
              </span>

              {fee > 0 && (
                <span className="text-xs text-slate-400">
                  / visit
                </span>
              )}
            </div>
          </div>

          <Link
            to={`/doctors/${doctor._id}`}
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-bold text-white transition-all duration-200 hover:bg-blue-600 active:scale-95"
          >
            View profile
            <ArrowIcon />
          </Link>
        </div>
      </div>
    </article>
  );
};

export default DoctorCard;