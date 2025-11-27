import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../firebase/auth";
import { useRole } from "../hooks/useRole";
import { motion, AnimatePresence } from "framer-motion";

export default function Menu() {
  const { user, signOutUser } = useAuth();
  const { isAdmin } = useRole();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await signOutUser();
    navigate("/login");
    setMobileOpen(false);
  };

  const navLinks = [
    { label: "home", to: "/" },
    { label: "hikes", to: "/hikes/list" },
    ...(user
      ? [
        { label: "profile", to: "/dashboard" },
        ...(isAdmin ? [{ label: "admin", to: "/admin" }] : []),
      ]
      : []),
  ];

  const authLink = user ? null : { label: "sign in", to: "/login" };
  const allDesktopLinks = authLink ? [...navLinks, authLink] : navLinks;
  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
        className="fixed top-0 left-0 right-0 z-50"
      >
        <div className="relative px-5 md:px-10 lg:px-16 py-4 flex items-center justify-between">
          <Link to="/" className="relative z-50">
            <p className="text-2xl lg:text-3xl font-medium tracking-tight text-[#1A1A1A]">
              hikee.
            </p>
          </Link>

          <div className="hidden lg:flex items-center">
            <nav className="flex items-center gap-1 rounded-full px-2 py-1.5 bg-[#1A1A1A]/90 backdrop-blur-xl border border-white/10">
              {allDesktopLinks.map((link) => (
                <div key={link.to} className="relative">
                  {isActive(link.to) && (
                    <motion.div
                      layoutId="activePill"
                      className="absolute inset-0 rounded-full bg-[#F5F3EF] shadow-lg"
                      transition={{ type: "spring", stiffness: 600, damping: 30 }}
                    />
                  )}
                  <Link
                    to={link.to}
                    className="relative px-5 py-2 text-sm font-medium tracking-tight transition-all z-10"
                    style={{
                      color: isActive(link.to) ? "#000" : "#F5F3EF",
                      fontWeight: isActive(link.to) ? 600 : 500,
                    }}
                  >
                    {link.label}
                  </Link>
                </div>
              ))}

              {user && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                  className="relative px-5 py-2 text-sm font-medium text-white/70 hover:text-white transition-all z-10 ml-4"
                >
                  Logout
                </motion.button>
              )}
            </nav>
          </div>

          {/* BURGER */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden relative z-50 w-12 h-12 flex items-center justify-center"
            aria-label="Toggle menu"
          >
            <motion.div className="relative w-6 h-5">
              <motion.span
                className="absolute top-0 left-0 w-full h-0.5 bg-white rounded-full"
                animate={{
                  rotate: mobileOpen ? 45 : 0,
                  y: mobileOpen ? 9.5 : 1,
                  opacity: mobileOpen ? 1 : 1,
                }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              />

              <motion.span
                className="absolute top-1/2 left-0 w-full h-0.5 bg-white rounded-full -translate-y-1/2"
                animate={{
                  opacity: mobileOpen ? 0 : 1,
                }}
                transition={{ duration: 0.2 }}
              />

              <motion.span
                className="absolute bottom-0 left-0 w-full h-0.5 bg-white rounded-full"
                animate={{
                  rotate: mobileOpen ? -45 : 0,
                  y: mobileOpen ? -8 : 0,
                }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              />
            </motion.div>
          </button>
        </div>
      </motion.header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-40 bg-black/95 backdrop-blur-2xl"
          >
            <div className="flex flex-col items-center justify-center h-full gap-12">
              {[...navLinks, ...(authLink ? [authLink] : [])].map((link, i) => (
                <motion.div
                  key={link.to}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link
                    to={link.to}
                    onClick={() => setMobileOpen(false)}
                    className="text-6xl md:text-7xl font-light tracking-tight text-white hover:text-white/70 transition-all"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}

              {user && (
                <motion.button
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: navLinks.length * 0.1 }}
                  onClick={handleLogout}
                  className="mt-20 px-12 py-4 bg-white text-black rounded-full text-lg font-medium hover:bg-white/90"
                >
                  Logout
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}