"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export const KaaMeNavbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
      setIsLoggedIn(true);
      setCurrentUser(JSON.parse(user));
    }
  }, []);

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
              className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors relative group"
            >
              {item.label}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-cyan-500 transition-all group-hover:w-full" />
            </Link>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4 relative">
        {isLoggedIn ? (
          <Link href={`/profile/${currentUser?.uid || currentUser?.id}`}>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100 cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg overflow-hidden bg-white border border-slate-100">
                <img src={currentUser?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.name}`} alt="me" className="w-full h-full object-cover" />
              </div>
              <span className="text-sm font-bold text-slate-900">{currentUser?.name?.split(' ')[0]}</span>
            </motion.div>
          </Link>
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
                Create Account
              </motion.button>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};
