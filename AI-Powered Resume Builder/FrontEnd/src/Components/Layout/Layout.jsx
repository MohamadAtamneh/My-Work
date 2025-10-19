// Layout.jsx
import { useMemo, useState, useRef, useEffect, useContext } from 'react';
import PillNav from '../DashboardComp/PillNav';
import logo from '../../assets/Logo.png';
import { UserContext } from '../../Context/UserContext';
import manAvatar from '../../assets/man.png';
import womanAvatar from '../../assets/woman.png';

export default function Layout({ children }) {
  const navItems = useMemo(() => [
    { label: "Dashboard", href: "/Dashboard" },
    { label: "Job Tracker", href: "/JobTracker" },
    { label: "Create Resume", href: "/create-resume" },
    { label: "Resume Examples", href: "/resume-examples" },
  ], []);

  return (
    <div className="pt-4 pb-8 px-4 sm:px-6 max-w-full mx-auto relative">
      {/* User dropdown */}
      <UserDropdown />
      <div className="flex justify-center mb-6">
        <PillNav
          logo={logo}
          logoAlt="ResuAI Logo"
          items={navItems}
          baseColor="#1f2937"
          pillColor="#6b21a8"
          hoveredPillTextColor="#ffffff"
          pillTextColor="#ffffff"
        />
      </div>
      {children}
    </div>
  );
}

function UserDropdown() {
  const { user, setUser } = useContext(UserContext);
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const btnRef = useRef(null);

  useEffect(() => {
    const onDocClick = (e) => {
      if (!open) return;
      if (menuRef.current && !menuRef.current.contains(e.target) && btnRef.current && !btnRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  const logout = () => {
    try {
      localStorage.removeItem('token');
      setUser?.(null);
    } finally {
      window.location.assign('/login');
    }
  };

  const initials = (user?.fullName || user?.email || 'U').slice(0, 1).toUpperCase();
  const genderNorm = (user?.gender || "").toString().trim().toLowerCase();
  const defaultAvatar = genderNorm === "female" ? womanAvatar : manAvatar;

  const formatPhoto = (photo) => {
    if (!photo) return null;
    // If already prefixed, just return it
    return photo.startsWith("data:")
      ? photo
      : `data:image/png;base64,${photo}`;
  };

  // Final avatar source logic
  let avatarSrc;
  if (!user?.photo || user.photo.trim() === "") {
    // No photo → default avatar by gender
    avatarSrc = defaultAvatar;
  } else {
    // Base64 photo from DB
    avatarSrc = formatPhoto(user.photo);
  }


  return (
    <div className="absolute right-4 top-2 z-[1100]">
      <div className="relative">
        <button
          ref={btnRef}
          onClick={() => setOpen(v => !v)}
          className="flex items-center space-x-2 h-10 px-3 rounded-lg bg-white/10 border border-white/15 text-white shadow hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-purple-500"
          aria-haspopup="menu"
          aria-expanded={open}
        >
          {/* Avatar */}
          <div className="h-8 w-8 rounded-full overflow-hidden bg-gray-200">
            {avatarSrc ? (
              <img
                src={avatarSrc}
                alt="User avatar"
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.target.src = defaultAvatar; // fallback if broken
                }}
              />
            ) : (
              <span className="text-xs font-semibold text-gray-600 flex items-center justify-center h-full w-full">
                {initials}
              </span>
            )}
          </div>

          {/* Dropdown Arrow */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-4 w-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {open && (
          <div
            ref={menuRef}
            role="menu"
            className="absolute right-0 mt-2 w-60 rounded-xl border border-white/10 bg-gray-900/80 backdrop-blur shadow-xl p-1"
          >
            <div className="px-3 py-2 text-xs text-gray-400">Account</div>
            <a href="/Dashboard/settings" className="block px-3 py-2 rounded-lg text-sm text-gray-200 hover:bg-white/10" role="menuitem">Settings</a>
            <div className="my-1 h-px bg-white/10" />
            <button onClick={logout} className="w-full text-left px-3 py-2 rounded-lg text-sm text-red-300 hover:bg-red-500/10" role="menuitem">Logout</button>
          </div>
        )}
      </div>
    </div>
  );
}
