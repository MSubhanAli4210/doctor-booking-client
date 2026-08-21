import { Link } from "react-router-dom";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h2 className="text-xl font-bold text-blue-600">
              Doctor Booking
            </h2>

            <p className="mt-3 max-w-sm text-sm leading-6 text-slate-500">
              Find trusted doctors, book appointments, manage your schedule,
              and communicate with healthcare professionals online.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Quick Links
            </h3>

            <div className="mt-4 flex flex-col gap-3 text-sm text-slate-500">
              <Link
                to="/"
                className="transition hover:text-blue-600"
              >
                Home
              </Link>

              <Link
                to="/doctors"
                className="transition hover:text-blue-600"
              >
                Find Doctors
              </Link>

              <Link
                to="/login"
                className="transition hover:text-blue-600"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="transition hover:text-blue-600"
              >
                Register
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Services
            </h3>

            <div className="mt-4 flex flex-col gap-3 text-sm text-slate-500">
              <span>Online Appointments</span>
              <span>Doctor Profiles</span>
              <span>Patient Management</span>
              <span>Doctor Chat</span>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Contact
            </h3>

            <div className="mt-4 flex flex-col gap-3 text-sm text-slate-500">
              <span>Pakistan</span>
              <span>support@doctorbooking.com</span>
              <span>Available 24/7</span>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-slate-200 pt-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
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