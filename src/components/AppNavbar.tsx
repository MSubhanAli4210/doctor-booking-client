import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/* =========================================================
   ROUTES

   If your App.tsx uses a slightly different URL,
   change it HERE only.
========================================================= */

const ROUTES = {
  home: "/",

  login: "/login",
  register: "/register",

  // CHANGE THIS
  patientAppointments: "/my-appointments",

  patientChat: "/chat",

  doctorDashboard: "/doctor/dashboard",
  doctorAppointments: "/doctor/appointments",
  doctorChat: "/chat",

  adminDashboard: "/admin/dashboard",
  adminDoctors: "/admin/doctors",

  profile: "/profile",
};

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

    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6M12 9v6" />
  </svg>
);

const MenuIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className="h-6 w-6"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
  </svg>
);

const CloseIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className="h-6 w-6"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path strokeLinecap="round" d="m6 6 12 12M18 6 6 18" />
  </svg>
);

const ChevronIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className="h-4 w-4"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="m7 9 5 5 5-5" />
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

const ChatIcon = () => (
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
      d="M21 11.5a8.4 8.4 0 0 1-9 8.5 9.5 9.5 0 0 1-4-.9L3 21l1.7-4.3A8.5 8.5 0 1 1 21 11.5Z"
    />
  </svg>
);

const DashboardIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className="h-5 w-5"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    <rect x="3" y="3" width="7" height="7" rx="2" />
    <rect x="14" y="3" width="7" height="7" rx="2" />
    <rect x="3" y="14" width="7" height="7" rx="2" />
    <rect x="14" y="14" width="7" height="7" rx="2" />
  </svg>
);

const DoctorsIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className="h-5 w-5"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    <circle cx="9" cy="8" r="4" />

    <path strokeLinecap="round" d="M2.5 21a6.5 6.5 0 0 1 13 0" />

    <path strokeLinecap="round" d="M19 8v6M16 11h6" />
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

    <path strokeLinecap="round" d="M4 21a8 8 0 0 1 16 0" />
  </svg>
);

const LogoutIcon = () => (
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
      d="M10 17l5-5-5-5M15 12H3M14 4h4a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3h-4"
    />
  </svg>
);

/* =========================================================
   NAVBAR
========================================================= */

const Navbar = () => {
  const { user, logoutUser } = useAuth();

  const navigate = useNavigate();

  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  /*
    This keeps Navbar flexible even if your User
    TypeScript interface changes later.
  */

  const currentUser = user as {
    name?: string;
    email?: string;
    role?: string;
    profileImage?: string;
  } | null;

  const role = currentUser?.role?.toLowerCase();

  const userName =
    currentUser?.name || currentUser?.email?.split("@")[0] || "User";

  const initials = userName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  /* Close menus when page changes */

  useEffect(() => {
    setMobileMenuOpen(false);
    setProfileMenuOpen(false);
  }, [location.pathname]);

  /* Lock body scroll on mobile */

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const handleLogout = () => {
    logoutUser();

    setProfileMenuOpen(false);
    setMobileMenuOpen(false);

    navigate("/");
  };

  const scrollToDoctors = () => {
    if (location.pathname === "/") {
      document.getElementById("doctors")?.scrollIntoView({
        behavior: "smooth",
      });

      setMobileMenuOpen(false);

      return;
    }

    navigate("/");

    setTimeout(() => {
      document.getElementById("doctors")?.scrollIntoView({
        behavior: "smooth",
      });
    }, 150);
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `relative px-1 py-2 text-sm font-semibold transition-colors ${
      isActive ? "text-blue-600" : "text-slate-600 hover:text-slate-950"
    }`;

  /* =========================================================
     ROLE LINKS
  ========================================================= */

  const getRoleLinks = () => {
    if (role === "admin") {
      return [
        {
          title: "Dashboard",
          path: ROUTES.adminDashboard,
          icon: <DashboardIcon />,
        },

        {
          title: "Doctors",
          path: ROUTES.adminDoctors,
          icon: <DoctorsIcon />,
        },
      ];
    }

    if (role === "doctor") {
      return [
        {
          title: "Dashboard",
          path: ROUTES.doctorDashboard,
          icon: <DashboardIcon />,
        },

        {
          title: "Appointments",
          path: ROUTES.doctorAppointments,
          icon: <CalendarIcon />,
        },

        {
          title: "Messages",
          path: ROUTES.doctorChat,
          icon: <ChatIcon />,
        },
      ];
    }

    /*
      Default authenticated user = patient
    */

    return [
      {
        title: "My appointments",
        path: ROUTES.patientAppointments,
        icon: <CalendarIcon />,
      },

      {
        title: "Messages",
        path: ROUTES.patientChat,
        icon: <ChatIcon />,
      },
    ];
  };

  const roleLinks = currentUser ? getRoleLinks() : [];

  return (
    <>
      {/* =====================================================
          HEADER
      ====================================================== */}

      <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* =====================
              LOGO
          ====================== */}

          <Link to="/" className="group flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/20 transition-transform duration-200 group-hover:scale-105">
              <LogoIcon />
            </div>

            <div>
              <div className="flex items-center">
                <span className="text-xl font-black tracking-[-0.04em] text-slate-950">
                  Medi
                </span>

                <span className="text-xl font-black tracking-[-0.04em] text-blue-600">
                  Book
                </span>
              </div>

              <p className="-mt-1 hidden text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-400 sm:block">
                Healthcare simplified
              </p>
            </div>
          </Link>

          {/* =====================
              DESKTOP NAVIGATION
          ====================== */}

          <nav className="hidden items-center gap-7 lg:flex">
            <NavLink to={ROUTES.home} end className={navLinkClass}>
              {({ isActive }) => (
                <>
                  Home
                  {isActive && (
                    <span className="absolute -bottom-[19px] left-0 right-0 mx-auto h-[2px] rounded-full bg-blue-600" />
                  )}
                </>
              )}
            </NavLink>

            {!currentUser && (
              <button
                type="button"
                onClick={scrollToDoctors}
                className="text-sm font-semibold text-slate-600 transition hover:text-slate-950"
              >
                Find doctors
              </button>
            )}

            {roleLinks.map((link) => (
              <NavLink key={link.path} to={link.path} className={navLinkClass}>
                {({ isActive }) => (
                  <>
                    {link.title}

                    {isActive && (
                      <span className="absolute -bottom-[19px] left-0 right-0 mx-auto h-[2px] rounded-full bg-blue-600" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* =====================
              DESKTOP ACTIONS
          ====================== */}

          <div className="hidden items-center gap-3 lg:flex">
            {!currentUser ? (
              <>
                <Link
                  to={ROUTES.login}
                  className="rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-100 hover:text-slate-950"
                >
                  Log in
                </Link>

                <Link
                  to={ROUTES.register}
                  className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-xl active:translate-y-0"
                >
                  Create account
                </Link>
              </>
            ) : (
              /* =====================
                  USER DROPDOWN
              ====================== */

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-2 py-1.5 pr-3 transition hover:border-slate-300 hover:bg-slate-50"
                >
                  {currentUser.profileImage ? (
                    <img
                      src={currentUser.profileImage}
                      alt={userName}
                      className="h-9 w-9 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 text-xs font-extrabold text-white">
                      {initials}
                    </div>
                  )}

                  <div className="max-w-[130px] text-left">
                    <p className="truncate text-sm font-bold text-slate-900">
                      {userName}
                    </p>

                    <p className="text-[11px] font-medium capitalize text-slate-400">
                      {role || "patient"}
                    </p>
                  </div>

                  <span
                    className={`text-slate-400 transition-transform duration-200 ${
                      profileMenuOpen ? "rotate-180" : ""
                    }`}
                  >
                    <ChevronIcon />
                  </span>
                </button>

                {/* Dropdown */}

                {profileMenuOpen && (
                  <>
                    {/* Click outside layer */}

                    <button
                      type="button"
                      aria-label="Close profile menu"
                      onClick={() => setProfileMenuOpen(false)}
                      className="fixed inset-0 z-40 cursor-default"
                    />

                    <div className="absolute right-0 top-[calc(100%+12px)] z-50 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_20px_60px_rgba(15,23,42,0.14)]">
                      <div className="border-b border-slate-100 px-3 pb-3 pt-2">
                        <p className="truncate text-sm font-bold text-slate-900">
                          {userName}
                        </p>

                        {currentUser.email && (
                          <p className="mt-0.5 truncate text-xs text-slate-400">
                            {currentUser.email}
                          </p>
                        )}

                        <span className="mt-2 inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-600">
                          {role || "patient"}
                        </span>
                      </div>

                      <div className="py-2">
                        {roleLinks.map((link) => (
                          <Link
                            key={link.path}
                            to={link.path}
                            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-950"
                          >
                            <span className="text-slate-400">{link.icon}</span>

                            {link.title}
                          </Link>
                        ))}

                        <Link
                          to={ROUTES.profile}
                          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-950"
                        >
                          <span className="text-slate-400">
                            <UserIcon />
                          </span>
                          Profile
                        </Link>
                      </div>

                      <div className="border-t border-slate-100 pt-2">
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50"
                        >
                          <LogoutIcon />
                          Log out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* =====================
              MOBILE MENU BUTTON
          ====================== */}

          <button
            type="button"
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50 lg:hidden"
          >
            {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </header>

      {/* =====================================================
          MOBILE NAVIGATION
      ====================================================== */}

      {mobileMenuOpen && (
        <div className="fixed inset-0 top-[72px] z-40 bg-white lg:hidden">
          <div className="flex h-full flex-col overflow-y-auto px-4 py-5 sm:px-6">
            {/* Logged in mobile user */}

            {currentUser && (
              <div className="mb-5 flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
                {currentUser.profileImage ? (
                  <img
                    src={currentUser.profileImage}
                    alt={userName}
                    className="h-12 w-12 rounded-2xl object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 text-sm font-black text-white">
                    {initials}
                  </div>
                )}

                <div className="min-w-0">
                  <p className="truncate font-bold text-slate-900">
                    {userName}
                  </p>

                  <p className="truncate text-sm text-slate-400">
                    {currentUser.email || `${role || "Patient"} account`}
                  </p>
                </div>
              </div>
            )}

            {/* Navigation */}

            <nav className="space-y-1">
              <Link
                to="/"
                className="flex items-center justify-between rounded-2xl px-4 py-3.5 font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Home
                <span className="text-slate-300">→</span>
              </Link>

              {!currentUser && (
                <button
                  type="button"
                  onClick={scrollToDoctors}
                  className="flex w-full items-center justify-between rounded-2xl px-4 py-3.5 text-left font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Find doctors
                  <span className="text-slate-300">→</span>
                </button>
              )}

              {roleLinks.map((link) => {
                const active = location.pathname === link.path;

                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center gap-3 rounded-2xl px-4 py-3.5 font-semibold transition ${
                      active
                        ? "bg-blue-50 text-blue-700"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span
                      className={active ? "text-blue-600" : "text-slate-400"}
                    >
                      {link.icon}
                    </span>

                    {link.title}
                  </Link>
                );
              })}

              {currentUser && (
                <Link
                  to={ROUTES.profile}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3.5 font-semibold transition ${
                    location.pathname === ROUTES.profile
                      ? "bg-blue-50 text-blue-700"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span className="text-slate-400">
                    <UserIcon />
                  </span>
                  Profile
                </Link>
              )}
            </nav>

            {/* Bottom actions */}

            <div className="mt-auto border-t border-slate-100 pt-5">
              {!currentUser ? (
                <div className="grid gap-3">
                  <Link
                    to={ROUTES.login}
                    className="flex h-12 items-center justify-center rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-700"
                  >
                    Log in
                  </Link>

                  <Link
                    to={ROUTES.register}
                    className="flex h-12 items-center justify-center rounded-xl bg-blue-600 text-sm font-bold text-white shadow-lg shadow-blue-600/20"
                  >
                    Create account
                  </Link>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-red-50 text-sm font-bold text-red-600 transition hover:bg-red-100"
                >
                  <LogoutIcon />
                  Log out
                </button>
              )}

              <p className="mt-5 text-center text-xs text-slate-400">
                MediBook · Healthcare simplified
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
