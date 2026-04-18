"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";

export const KaaMeNavbar = () => {
  const { isAuthenticated, logout, isLoading } = useAuth();

  return (
    <nav className="sticky top-0 z-50 w-full bg-[var(--glass-bg)] backdrop-blur-xl border-b border-[var(--glass-border)] px-6 py-4 flex items-center justify-between overflow-hidden">
      <div className="absolute -top-10 -left-10 w-40 h-40 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="flex items-center gap-8 relative">
        <Link href="/feed" className="group">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-2xl tracking-tighter text-slate-900 group-hover:translate-x-1 transition-transform">
              Kaa<span className="text-primary">Me</span>
            </span>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-6 ml-4">
          {["Feed", "Marketplace", "Jobs", "Events"].map((item) => (
            <Link
              key={item}
              href={`/${item.toLowerCase()}`}
              className="text-sm font-medium text-slate-500 hover:text-primary transition-colors relative group"
            >
              {item}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
            </Link>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3 relative">
        {!isLoading && (
          isAuthenticated ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={logout}
              className="px-4 py-2 text-sm font-semibold text-slate-500 hover:text-red-500 transition-colors flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              Sign Out
            </motion.button>
          ) : (
            <><Link href="/login">
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900">
                  Sign In
                </motion.button>
              </Link>
              <Link href="/register">
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-6 py-2.5 kaame-gradient text-white text-sm font-bold rounded-full shadow-lg shadow-primary/20">
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
