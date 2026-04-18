"use client";
import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function Navbar() {
  return (
    <div className="fixed top-10 inset-x-0 max-w-2xl mx-auto z-50">
      <nav className="relative rounded-full border border-white/[0.1] bg-black/50 backdrop-blur-md shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)] px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-white font-bold text-xl">
            DevClash
          </Link>
          <div className="hidden md:flex items-center gap-4 text-sm text-neutral-300">
            <Link href="#about" className="hover:text-white transition-colors">
              About
            </Link>
            <Link href="#rules" className="hover:text-white transition-colors">
              Rules
            </Link>
            <Link href="#prizes" className="hover:text-white transition-colors">
              Prizes
            </Link>
          </div>
        </div>
        <Link 
          href="/register"
          className="px-4 py-2 rounded-full bg-white text-black text-sm font-semibold hover:bg-neutral-200 transition-colors"
        >
          Register
        </Link>
      </nav>
    </div>
  );
}
