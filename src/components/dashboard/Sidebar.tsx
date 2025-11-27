import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../firebase/auth";
import defaultAvatar from "../../assets/default_user.png";
import { Plus, Settings, Heart, Map, User, Menu, X } from "lucide-react";

const links = [
  { to: "/dashboard", label: "My Profile", icon: User },
  { to: "/dashboard/hikes", label: "My Hikes", icon: Map },
  { to: "/dashboard/favorites", label: "My Favorites", icon: Heart },
  { to: "/dashboard/preferences", label: "Preferences", icon: Settings },
];

interface Props {
  className?: string;
}

export default function Sidebar({ className = "" }: Props) {
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* OVERLAY MOBILE */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-72 bg-white shadow-xl border border-gray-100
          flex flex-col p-6 rounded-2xl z-50
          transform transition-transform duration-300 ease-in-out
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          md:relative md:translate-x-0 md:h-auto md:w-72 md:sticky md:top-[120px]
          ${className}
        `}
        style={{
          '--sage': '#7A9B76',
          '--forest-dark': '#2C3E2E',
        } as React.CSSProperties}
      >
        {/* Profil Utilisateur */}
        <div className="flex flex-col items-center gap-3 mb-10 relative">
          <div className="relative">
            <img
              src={user?.photoURL || defaultAvatar}
              alt="avatar"
              className="w-24 h-24 rounded-full object-cover shadow-md border-4 border-white"
            />
            <NavLink
              to="/dashboard/preferences"
              className="absolute bottom-1 right-1 bg-[var(--sage)] text-white w-7 h-7 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition"
            >
              <Plus size={18} strokeWidth={2.5} />
            </NavLink>
          </div>
          <span className="font-semibold text-xl text-gray-800 text-center">
            {user?.displayName || user?.email?.split("@")[0]}
          </span>
        </div>

        {/* NAVIGATION MODERNE */}
        <nav className="flex flex-col gap-1 flex-grow">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} end>
              {({ isActive }) => (
                <div
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition duration-200
                    text-[var(--forest-dark)] hover:bg-gray-100
                    ${
                    isActive
                      ? "bg-[var(--sage)]/[0.1] text-[var(--sage)] border-l-4 border-[var(--sage)]"
                      : "text-gray-700"
                  }
                  `}
                >
                  <link.icon
                    className={`w-5 h-5 ${isActive ? "text-[var(--sage)]" : "text-gray-500"}`}
                  />
                  <span>{link.label}</span>
                </div>
              )}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
