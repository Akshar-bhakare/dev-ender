"use client";

import { KaaMeNavbar } from "@/components/kaa-me/KaaMeNavbar";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { SparklesCore } from "@/components/ui/sparkles";
import { BackgroundBeams } from "@/components/ui/background-beams";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Home() {
  const words = `kaam + me. The ultimate trusted professional ecosystem for builders, founders, and verified experts.`;

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-[#FAFAFA]">
      <KaaMeNavbar />
      
      {/* Hero Section */}
      <section className="relative h-screen w-full flex flex-col items-center justify-center overflow-hidden">
        {/* Background Layer */}
        <div className="absolute inset-0 z-0">
          <BackgroundBeams className="opacity-40" />
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center px-4 max-w-5xl mx-auto">
          {/* Visual Accent: Sparkles & Lines */}
          <div className="w-[30rem] md:w-[60rem] h-64 relative mb-[-4rem]">
            {/* Horizontal Line Accents */}
            <div className="absolute inset-x-20 top-0 bg-gradient-to-r from-transparent via-primary to-transparent h-[2px] w-3/4 blur-sm mx-auto" />
            <div className="absolute inset-x-20 top-0 bg-gradient-to-r from-transparent via-cyan-400 to-transparent h-px w-3/4 mx-auto" />
            
            {/* Core Particles */}
            <SparklesCore
              background="transparent"
              minSize={0.6}
              maxSize={1.4}
              particleDensity={100}
              className="w-full h-full"
              particleColor="#0ea5e9"
            />

            {/* Subtle radial mask removed for better text legibility */}
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="text-center"
          >
            <h1 className="text-6xl md:text-[10rem] font-display font-bold text-slate-900 tracking-tighter leading-[0.8] mb-8">
              Kaa<span className="text-primary">Me</span>
            </h1>
            
            <div className="mt-4 max-w-2xl mx-auto">
              <TextGenerateEffect words={words} className="text-slate-900 font-medium text-xl leading-relaxed" />
            </div>

            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link href="/register">
                <button className="px-12 py-5 rounded-3xl kaame-gradient text-white font-display font-bold text-xl hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-primary/40">
                  Get Started
                </button>
              </Link>
              <Link href="/login">
                <button className="px-12 py-5 rounded-3xl border-2 border-slate-200 bg-white text-slate-500 font-display font-bold text-xl hover:bg-slate-50 hover:border-slate-300 transition-all">
                  Sign In
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Section */}
      <section className="relative h-[40rem] w-full bg-white flex flex-col items-center justify-center antialiased overflow-hidden border-t border-slate-100">
        <div className="max-w-2xl mx-auto p-4 z-10 text-center">
          <h2 className="text-4xl md:text-6xl font-display font-bold text-slate-900 mb-8 tracking-tight">
            Built for Verified Human Success.
          </h2>
          <p className="text-slate-500 font-medium max-w-lg mx-auto leading-relaxed">
            From direct founder-to-investor trust to company-wide service exchanges, 
            KaaMe is where the world's most capable professionals aggregate.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-slate-100 bg-[#FAFAFA] text-slate-400 text-center text-sm">
        <div className="grain-filter absolute inset-0 opacity-5" />
        <p className="relative z-10 font-bold tracking-widest uppercase text-[10px]">
          © 2026 KaaMe Ecosystem. Powered by Verified Trust.
        </p>
      </footer>
    </main>
  );
}
