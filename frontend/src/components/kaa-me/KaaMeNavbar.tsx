"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export const KaaMeNavbar = () => {
  const { isAuthenticated, logout, isLoading, user } = useAuth();
  const pathname = usePathname();

  // Hide navbar on auth pages
  if (pathname === "/login" || pathname === "/register") {
    return null;
  }

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex items-center justify-between overflow-hidden">
      {/* Funky Background Shape */}
      <div className="absolute -top-10 -left-10 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="flex items-center gap-8 relative">
        <Link href="/" className="group">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white font-display font-bold text-xl shadow-lg shadow-slate-900/10 group-hover:rotate-12 transition-transform">
              K
            </div>
            <span className="font-display font-bold text-2xl tracking-tighter text-slate-900 group-hover:translate-x-1 transition-transform">
              Kaa<span className="text-cyan-500">Me</span>
            </span>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-6 ml-4">
          {[
            { label: "Feed", href: "/feed" },
            { label: "Marketplace", href: "/marketplace" },
            { label: "Jobs", href: "/jobs" },
            { label: "Events", href: "/events" }
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`text-sm font-bold transition-colors relative group ${pathname === item.href ? 'text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}
            >
              {item.label}
              <span className={`absolute -bottom-1 left-0 h-0.5 bg-cyan-500 transition-all ${pathname === item.href ? 'w-full' : 'w-0 group-hover:w-full'}`} />
            </Link>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4 relative">
        {!isLoading && (
          isAuthenticated ? (
            <div className="flex items-center gap-4">
               <Link href={`/profile/${user?._id}`}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-3 px-3 py-1.5 bg-slate-50 rounded-2xl border border-slate-100 cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-lg overflow-hidden bg-white border border-slate-100">
                    <img src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.fullName || 'User'}`} alt="me" className="w-full h-full object-cover" />
                  </div>
                  <span className="text-sm font-bold text-slate-900 hidden sm:inline">{user?.fullName?.split(' ')[0]}</span>
                </motion.div>
              </Link>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={logout}
                className="px-3 py-2 text-sm font-semibold text-slate-500 hover:text-red-500 transition-colors flex items-center gap-1.5"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                <span className="hidden sm:inline">Sign Out</span>
              </motion.button>
            </div>
          ) : (
            <>
              <Link href="/login">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-slate-900"
                >
                  Sign In
                </motion.button>
              </Link>
              <Link href="/register">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-2xl shadow-xl shadow-slate-900/10 hover:bg-slate-800 transition-all"
                >
                  Get Verified
                </motion.button>
              </Link>
            </>
          )
        )}
      </div>
    </nav>
  );
};
