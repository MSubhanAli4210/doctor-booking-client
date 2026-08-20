import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../api/authApi";
import { useAuth } from "../context/AuthContext";
import type { UserRole } from "../types";

const roleTabs: {
  label: string;
  value: UserRole;
  description: string;
}[] = [
  {
    label: "Patient",
    value: "patient",
    description: "Book and manage appointments",
  },
  {
    label: "Doctor",
    value: "doctor",
    description: "Manage patients and schedules",
  },
  {
    label: "Admin",
    value: "admin",
    description: "Manage the platform",
  },
];

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
  </svg>
);

const MessageIcon = () => (
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
      d="M21 11.5a8.4 8.4 0 0 1-9 8.5 9.5 9.5 0 0 1-4-.9L3 21l1.7-4.3A8.5 8.5 0 1 1 21 11.5Z"
    />
  </svg>
);

/* =========================================================
   LOGIN
========================================================= */

const Login = () => {
  const [selectedRole, setSelectedRole] =
    useState<UserRole>("patient");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [error, setError] = useState("");

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const { loginUser } = useAuth();

  const navigate = useNavigate();

  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    setError("");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    setError("");

    if (!email.trim() || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setIsSubmitting(true);

    try {
      const { user, token } = await login(
        email.trim(),
        password,
      );

      if (user.role !== selectedRole) {
        const actualRole =
          roleTabs.find(
            (role) => role.value === user.role,
          )?.label || user.role;

        const selectedRoleLabel =
          roleTabs.find(
            (role) =>
              role.value === selectedRole,
          )?.label || selectedRole;

        setError(
          `This account is registered as a ${actualRole}, not a ${selectedRoleLabel}. Please select "${actualRole}" above to continue.`,
        );

        return;
      }

      loginUser(user, token);

      if (user.role === "admin") {
        navigate("/admin/dashboard");
      } else if (user.role === "doctor") {
        navigate("/doctor/appointments");
      } else {
        navigate("/");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Login failed. Please check your credentials and try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedRoleInfo = roleTabs.find(
    (role) => role.value === selectedRole,
  );

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
              Welcome back
            </p>

            <h1 className="mt-5 text-4xl font-black leading-tight tracking-[-0.04em] text-white xl:text-5xl">
              Your healthcare,
              <span className="block text-blue-400">
                connected in one place.
              </span>
            </h1>

            <p className="mt-6 max-w-lg text-base leading-7 text-slate-300">
              Manage appointments, communicate
              with your care team and stay on top
              of your healthcare journey.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-blue-300">
                  <CalendarIcon />
                </div>

                <p className="mt-4 font-bold text-white">
                  Simple appointments
                </p>

                <p className="mt-1 text-sm leading-6 text-slate-400">
                  Book and manage your visits from
                  one dashboard.
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-cyan-300">
                  <MessageIcon />
                </div>

                <p className="mt-4 font-bold text-white">
                  Stay connected
                </p>

                <p className="mt-1 text-sm leading-6 text-slate-400">
                  Keep important communication
                  close at hand.
                </p>
              </div>
            </div>
          </div>

          <div className="relative z-10 flex items-center gap-2 text-xs text-slate-500">
            <ShieldIcon />
            Secure access to your MediBook account
          </div>
        </section>

        {/* =====================================================
            FORM
        ====================================================== */}

        <section className="flex items-center justify-center px-4 py-10 sm:px-6 lg:px-10">
          <div className="w-full max-w-md">
            {/* Mobile logo */}

            <Link
              to="/"
              className="mb-10 flex items-center justify-center gap-2.5 lg:hidden"
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
                Sign in
              </p>

              <h1 className="mt-3 text-3xl font-black tracking-[-0.04em] text-slate-950 sm:text-4xl">
                Welcome back
              </h1>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                Enter your credentials to access
                your MediBook account.
              </p>
            </div>

            {/* Role tabs */}

            <div className="mt-8 rounded-2xl bg-slate-100 p-1.5">
              <div className="grid grid-cols-3 gap-1">
                {roleTabs.map((tab) => {
                  const active =
                    selectedRole === tab.value;

                  return (
                    <button
                      key={tab.value}
                      type="button"
                      onClick={() =>
                        handleRoleChange(tab.value)
                      }
                      className={`rounded-xl px-2 py-2.5 text-xs font-bold transition-all sm:text-sm ${
                        active
                          ? "bg-white text-blue-600 shadow-sm"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <p className="mt-3 text-xs text-slate-400">
              {selectedRoleInfo?.description}
            </p>

            {/* Error */}

            {error && (
              <div className="mt-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3.5">
                <p className="text-sm font-medium leading-6 text-red-700">
                  {error}
                </p>
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="mt-7 space-y-5"
            >
              {/* Email */}

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-bold text-slate-700"
                >
                  Email address
                </label>

                <div className="relative">
                  <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <MailIcon />
                  </div>

                  <input
                    id="email"
                    type="email"
                    value={email}
                    autoComplete="email"
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError("");
                    }}
                    placeholder="you@example.com"
                    className="h-14 w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
                  />
                </div>
              </div>

              {/* Password */}

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-bold text-slate-700"
                >
                  Password
                </label>

                <div className="relative">
                  <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <LockIcon />
                  </div>

                  <input
                    id="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={password}
                    autoComplete="current-password"
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError("");
                    }}
                    placeholder="Enter your password"
                    className="h-14 w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
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
                    Signing in...
                  </>
                ) : (
                  `Log in as ${selectedRoleInfo?.label}`
                )}
              </button>
            </form>

            {/* Patient signup */}

            {selectedRole === "patient" && (
              <div className="mt-7 text-center">
                <p className="text-sm text-slate-500">
                  Don't have an account?{" "}
                  <Link
                    to="/register"
                    className="font-bold text-blue-600 transition hover:text-blue-700"
                  >
                    Create one
                  </Link>
                </p>
              </div>
            )}

            {selectedRole !== "patient" && (
              <div className="mt-7 rounded-2xl bg-slate-100 px-4 py-3 text-center">
                <p className="text-xs leading-5 text-slate-500">
                  {selectedRole === "doctor"
                    ? "Doctor accounts are managed by the platform administrator."
                    : "Administrator access is restricted to authorized accounts."}
                </p>
              </div>
            )}

            <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-400">
              <ShieldIcon />
              Secure account authentication
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default Login;