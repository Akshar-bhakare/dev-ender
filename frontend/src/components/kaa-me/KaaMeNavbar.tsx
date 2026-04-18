"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";

export const KaaMeNavbar = () => {
  return (
    <nav className="sticky top-0 z-50 w-full bg-[var(--glass-bg)] backdrop-blur-xl border-b border-[var(--glass-border)] px-6 py-4 flex items-center justify-between overflow-hidden">
      {/* Funky Background Shape */}
      <div className="absolute -top-10 -left-10 w-40 h-40 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="flex items-center gap-8 relative">
        <Link href="/feed" className="group">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 kaame-gradient rounded-xl flex items-center justify-center text-white font-display font-bold text-xl shadow-lg shadow-primary/20 group-hover:rotate-12 transition-transform">
              K
            </div>
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

      <div className="flex items-center gap-4 relative">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900"
        >
          Sign In
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-6 py-2.5 kaame-gradient text-white text-sm font-bold rounded-full shadow-lg shadow-primary/20"
        >
          Get Verified
        </motion.button>
      </div>
    </nav>
  );
};
