import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../api/authApi";
import { useAuth } from "../context/AuthContext";
import type { UserRole } from "../types";

const roleTabs: { label: string; value: UserRole }[] = [
  { label: "Patient", value: "patient" },
  { label: "Doctor", value: "doctor" },
  { label: "Admin", value: "admin" },
];

const Login = () => {
  const [selectedRole, setSelectedRole] = useState<UserRole>("patient");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    setError("");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    setIsSubmitting(true);

    try {
      const { user, token } = await login(email, password);

      if (user.role !== selectedRole) {
        setError(
          `This account is registered as a ${user.role}, not a ${selectedRole}. Select "${
            roleTabs.find((r) => r.value === user.role)?.label
          }" above to continue.`,
        );
        setIsSubmitting(false);
        return;
      }

      loginUser(user, token);

      if (user.role === "admin") navigate("/admin");
      else if (user.role === "doctor") navigate("/doctor/appointments");
      else navigate("/");
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Login failed. Please try again.",
      );
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-6">
          <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center mb-3">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 12h4l2-7 4 14 2-7h6"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">Welcome back</h1>
          <p className="text-sm text-gray-500 mt-1">
            Log in to manage your appointments
          </p>
        </div>

        <div className="bg-white shadow-sm border border-gray-100 rounded-2xl p-7">
          <div className="flex bg-gray-100 rounded-lg p-1 mb-5">
            {roleTabs.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => handleRoleChange(tab.value)}
                className={`flex-1 text-sm font-medium py-2 rounded-md transition ${
                  selectedRole === tab.value
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {error && (
            <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2.5">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white text-sm font-medium rounded-lg py-2.5 hover:bg-blue-700 disabled:opacity-50 transition mt-2"
            >
              {isSubmitting
                ? "Logging in..."
                : `Log in as ${roleTabs.find((r) => r.value === selectedRole)?.label}`}
            </button>
          </form>
        </div>

        {selectedRole === "patient" && (
          <p className="text-sm text-gray-500 text-center mt-6">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-blue-600 font-medium hover:text-blue-700"
            >
              Sign up
            </Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default Login;
