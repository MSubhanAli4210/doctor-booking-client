import { Link } from "react-router-dom";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-blue-900/20 bg-slate-900 text-slate-200">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h2 className="text-xl font-bold text-white">
              Doctor Booking
            </h2>

            <p className="mt-3 max-w-sm text-sm leading-6 text-slate-400">
              Find trusted doctors, book appointments, manage your schedule,
              and communicate with healthcare professionals online.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white">
              Quick Links
            </h3>

            <div className="mt-4 flex flex-col gap-3 text-sm text-slate-400">
              <Link
                to="/"
                className="transition hover:text-blue-400"
              >
                Home
              </Link>

              <Link
                to="/doctors"
                className="transition hover:text-blue-400"
              >
                Find Doctors
              </Link>

              <Link
                to="/login"
                className="transition hover:text-blue-400"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="transition hover:text-blue-400"
              >
                Register
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white">
              Services
            </h3>

            <div className="mt-4 flex flex-col gap-3 text-sm text-slate-400">
              <span>Online Appointments</span>
              <span>Doctor Profiles</span>
              <span>Patient Management</span>
              <span>Doctor Chat</span>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white">
              Contact
            </h3>

            <div className="mt-4 flex flex-col gap-3 text-sm text-slate-400">
              <span>Pakistan</span>
              <span>support@doctorbooking.com</span>
              <span>Available 24/7</span>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-slate-700 pt-6 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {currentYear} Doctor Booking. All rights reserved.
          </p>

          <p>
            Built for easier healthcare access.
          </p>
        </div>
      </div>
    </footer>
  );
}