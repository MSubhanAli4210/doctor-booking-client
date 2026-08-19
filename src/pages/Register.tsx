import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerPatient } from "../api/authApi";
import { useAuth } from "../context/AuthContext";

/* =========================================================
   ICONS
========================================================= */

const LogoIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className="h-6 w-6"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 21s-7-4.35-7-11A4 4 0 0 1 12 7.3 4 4 0 0 1 19 10c0 6.65-7 11-7 11Z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 12h6M12 9v6"
    />
  </svg>
);

const UserIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className="h-5 w-5"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    <circle cx="12" cy="8" r="4" />
    <path
      strokeLinecap="round"
      d="M4 21a8 8 0 0 1 16 0"
    />
  </svg>
);

const MailIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className="h-5 w-5"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    <rect x="3" y="5" width="18" height="14" rx="3" />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m4 7 8 6 8-6"
    />
  </svg>
);

const PhoneIcon = () => (
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
      d="M6.6 3H4.5A1.5 1.5 0 0 0 3 4.5C3 13.6 10.4 21 19.5 21a1.5 1.5 0 0 0 1.5-1.5v-2.1a1.5 1.5 0 0 0-1.2-1.47l-3.1-.62a1.5 1.5 0 0 0-1.52.62l-.68.95a13 13 0 0 1-5.38-5.38l.95-.68a1.5 1.5 0 0 0 .62-1.52l-.62-3.1A1.5 1.5 0 0 0 6.6 3Z"
    />
  </svg>
);

const LockIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className="h-5 w-5"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    <rect x="4" y="10" width="16" height="11" rx="3" />
    <path
      strokeLinecap="round"
      d="M8 10V7a4 4 0 0 1 8 0v3"
    />
  </svg>
);

const EyeIcon = () => (
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
      d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"
    />
    <circle cx="12" cy="12" r="2.5" />
  </svg>
);

const EyeOffIcon = () => (
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
      d="m3 3 18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 4.2A10.9 10.9 0 0 1 12 4c6 0 9.5 8 9.5 8a16 16 0 0 1-2.3 3.2M6.2 6.2C3.7 8.2 2.5 12 2.5 12S6 20 12 20a10.3 10.3 0 0 0 4-.8"
    />
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
    className="h-5 w-5"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m5 12 4 4L19 6"
    />
  </svg>
);

const getTodayString = () => {
  const now = new Date();

  const year = now.getFullYear();

  const month = String(
    now.getMonth() + 1,
  ).padStart(2, "0");

  const day = String(now.getDate()).padStart(
    2,
    "0",
  );

  return `${year}-${month}-${day}`;
};

/* =========================================================
   REGISTER
========================================================= */

const Register = () => {
  const [name, setName] = useState("");

  const [email, setEmail] = useState("");

  const [password, setPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [phone, setPhone] = useState("");

  const [gender, setGender] = useState("");

  const [dateOfBirth, setDateOfBirth] =
    useState("");

  const [error, setError] = useState("");

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const { loginUser } = useAuth();

  const navigate = useNavigate();

  const handleSubmit = async (
    e: FormEvent,
  ) => {
    e.preventDefault();

    setError("");

    if (
      !name.trim() ||
      !email.trim() ||
      !password ||
      !phone.trim() ||
      !gender ||
      !dateOfBirth
    ) {
      setError("All fields are required.");
      return;
    }

    if (password.length < 6) {
      setError(
        "Password must be at least 6 characters.",
      );

      return;
    }

    setIsSubmitting(true);

    try {
      const { user, token } =
        await registerPatient({
          name: name.trim(),
          email: email.trim(),
          password,
          phone: phone.trim(),
          gender,
          dateOfBirth,
        });

      loginUser(user, token);

      navigate("/");
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Registration failed. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const fieldClass =
    "h-14 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-50";

  return (
    <main className="min-h-[calc(100vh-72px)] bg-slate-50">
      <div className="grid min-h-[calc(100vh-72px)] lg:grid-cols-[0.9fr_1.1fr]">
        {/* =====================================================
            LEFT VISUAL
        ====================================================== */}

        <section className="relative hidden overflow-hidden bg-slate-950 lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-16">
          <div className="hero-grid absolute inset-0 opacity-60" />

          <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-blue-600/30 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-32 right-0 h-96 w-96 rounded-full bg-cyan-500/20 blur-3xl" />

          <div className="relative z-10">
            <Link
              to="/"
              className="inline-flex items-center gap-3"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/30">
                <LogoIcon />
              </div>

              <div className="text-2xl font-black tracking-[-0.04em] text-white">
                Medi
                <span className="text-blue-400">
                  Book
                </span>
              </div>
            </Link>
          </div>

          <div className="relative z-10 max-w-xl">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-blue-300">
              Join MediBook
            </p>

            <h1 className="mt-5 text-4xl font-black leading-tight tracking-[-0.04em] text-white xl:text-5xl">
              Better access to care
              <span className="block text-blue-400">
                starts with one account.
              </span>
            </h1>

            <p className="mt-6 max-w-lg text-base leading-7 text-slate-300">
              Create your patient account to
              discover doctors, book appointments
              and keep your healthcare organized.
            </p>

            <div className="mt-10 space-y-4">
              {[
                "Discover doctors by specialty",
                "Choose appointments that fit your schedule",
                "Manage your bookings from one place",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 text-sm font-medium text-slate-200"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-400/10 text-emerald-300">
                    <CheckIcon />
                  </div>

                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 flex items-center gap-2 text-xs text-slate-500">
            <ShieldIcon />
            Your account information is protected
          </div>
        </section>

        {/* =====================================================
            FORM
        ====================================================== */}

        <section className="flex items-center justify-center px-4 py-10 sm:px-6 lg:px-10">
          <div className="w-full max-w-lg">
            {/* Mobile logo */}

            <Link
              to="/"
              className="mb-9 flex items-center justify-center gap-2.5 lg:hidden"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-500/20">
                <LogoIcon />
              </div>

              <span className="text-xl font-black tracking-[-0.04em] text-slate-950">
                Medi
                <span className="text-blue-600">
                  Book
                </span>
              </span>
            </Link>

            <div>
              <p className="text-sm font-bold uppercase tracking-[0.14em] text-blue-600">
                Patient registration
              </p>

              <h1 className="mt-3 text-3xl font-black tracking-[-0.04em] text-slate-950 sm:text-4xl">
                Create your account
              </h1>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                Enter your details below to start
                booking appointments with trusted
                doctors.
              </p>
            </div>

            {/* Error */}

            {error && (
              <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 px-4 py-3.5">
                <p className="text-sm font-medium leading-6 text-red-700">
                  {error}
                </p>
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="mt-7 space-y-5"
            >
              {/* Name */}

              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-bold text-slate-700"
                >
                  Full name
                </label>

                <div className="relative">
                  <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <UserIcon />
                  </div>

                  <input
                    id="name"
                    type="text"
                    value={name}
                    autoComplete="name"
                    onChange={(e) => {
                      setName(e.target.value);
                      setError("");
                    }}
                    placeholder="Your full name"
                    className={`${fieldClass} pl-12`}
                  />
                </div>
              </div>

              {/* Email */}

              <div>
                <label
                  htmlFor="register-email"
                  className="mb-2 block text-sm font-bold text-slate-700"
                >
                  Email address
                </label>

                <div className="relative">
                  <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <MailIcon />
                  </div>

                  <input
                    id="register-email"
                    type="email"
                    value={email}
                    autoComplete="email"
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError("");
                    }}
                    placeholder="you@example.com"
                    className={`${fieldClass} pl-12`}
                  />
                </div>
              </div>

              {/* Phone + Gender */}

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="phone"
                    className="mb-2 block text-sm font-bold text-slate-700"
                  >
                    Phone number
                  </label>

                  <div className="relative">
                    <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <PhoneIcon />
                    </div>

                    <input
                      id="phone"
                      type="tel"
                      value={phone}
                      autoComplete="tel"
                      onChange={(e) => {
                        setPhone(e.target.value);
                        setError("");
                      }}
                      placeholder="03XX XXXXXXX"
                      className={`${fieldClass} pl-12`}
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="gender"
                    className="mb-2 block text-sm font-bold text-slate-700"
                  >
                    Gender
                  </label>

                  <select
                    id="gender"
                    value={gender}
                    onChange={(e) => {
                      setGender(e.target.value);
                      setError("");
                    }}
                    className={`${fieldClass} cursor-pointer`}
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
              </div>

              {/* DOB */}

              <div>
                <label
                  htmlFor="dateOfBirth"
                  className="mb-2 block text-sm font-bold text-slate-700"
                >
                  Date of birth
                </label>

                <input
                  id="dateOfBirth"
                  type="date"
                  max={getTodayString()}
                  value={dateOfBirth}
                  onChange={(e) => {
                    setDateOfBirth(
                      e.target.value,
                    );
                    setError("");
                  }}
                  className={fieldClass}
                />
              </div>

              {/* Password */}

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label
                    htmlFor="register-password"
                    className="block text-sm font-bold text-slate-700"
                  >
                    Password
                  </label>

                  <span className="text-xs text-slate-400">
                    Minimum 6 characters
                  </span>
                </div>

                <div className="relative">
                  <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <LockIcon />
                  </div>

                  <input
                    id="register-password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={password}
                    autoComplete="new-password"
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError("");
                    }}
                    placeholder="Create a secure password"
                    className={`${fieldClass} pl-12 pr-12`}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        !showPassword,
                      )
                    }
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
                  >
                    {showPassword ? (
                      <EyeOffIcon />
                    ) : (
                      <EyeIcon />
                    )}
                  </button>
                </div>

                {/* Password strength hint */}

                {password && (
                  <div className="mt-2 flex gap-1">
                    {[1, 2, 3].map((level) => {
                      const strength =
                        password.length >= 10
                          ? 3
                          : password.length >= 6
                            ? 2
                            : 1;

                      return (
                        <div
                          key={level}
                          className={`h-1 flex-1 rounded-full ${
                            level <= strength
                              ? strength === 1
                                ? "bg-red-400"
                                : strength === 2
                                  ? "bg-amber-400"
                                  : "bg-emerald-500"
                              : "bg-slate-200"
                          }`}
                        />
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Submit */}

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-xl active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              >
                {isSubmitting ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                    Creating your account...
                  </>
                ) : (
                  "Create patient account"
                )}
              </button>
            </form>

            <p className="mt-7 text-center text-sm text-slate-500">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-bold text-blue-600 transition hover:text-blue-700"
              >
                Log in
              </Link>
            </p>

            <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-400">
              <ShieldIcon />
              Your information is securely stored
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default Register;