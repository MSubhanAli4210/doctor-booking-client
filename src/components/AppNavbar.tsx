import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  return (
    <nav className="border-b border-gray-100 bg-white sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <svg
              className="w-4.5 h-4.5 text-white"
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
          <span className="font-semibold text-gray-900">MediBook</span>
        </Link>

        {user ? (
          <div className="flex items-center gap-6">
            {user.role === "patient" && (
              <>
                <Link to="/" className="text-sm text-gray-600 hover:text-gray-900">
                  Find doctors
                </Link>
                <Link to="/my-appointments" className="text-sm text-gray-600 hover:text-gray-900">
                  My appointments
                </Link>
                <Link to="/chat" className="text-sm text-gray-600 hover:text-gray-900">
                  Messages
                </Link>
              </>
            )}

            {user.role === "doctor" && (
              <>
                <Link to="/doctor/appointments" className="text-sm text-gray-600 hover:text-gray-900">
                  Appointments
                </Link>
                <Link to="/doctor/profile" className="text-sm text-gray-600 hover:text-gray-900">
                  My profile
                </Link>
                <Link to="/chat" className="text-sm text-gray-600 hover:text-gray-900">
                  Messages
                </Link>
              </>
            )}

            {user.role === "admin" && (
              <>
                <Link to="/admin" className="text-sm text-gray-600 hover:text-gray-900">
                  Dashboard
                </Link>
                <Link to="/admin/doctors" className="text-sm text-gray-600 hover:text-gray-900">
                  Doctors
                </Link>
              </>
            )}

            <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-medium text-blue-700 overflow-hidden">
                {user.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  user.name?.charAt(0)?.toUpperCase() || "?"
                )}
              </div>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Log out
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Log in
            </Link>
            <Link
              to="/register"
              className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Create account
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;