"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { UserSteps } from "./UserSteps";
import { CompanySteps } from "./CompanySteps";
import { useRouter } from "next/navigation";

export const RegisterWizard = () => {
  const [accountType, setAccountType] = useState<"user" | "company" | null>(null);

  // If user hits 'back' to completely clear choice
  const handleReset = () => {
    setAccountType(null);
  };

  return (
    <div className="w-full h-full min-h-screen p-8 sm:p-12 lg:p-20 relative flex flex-col justify-center">
      <AnimatePresence mode="wait">
        {!accountType && (
          <motion.div
            key="selector"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="max-w-md mx-auto w-full"
          >
            <h1 className="text-3xl font-display font-bold text-slate-900 mb-2">Create an account</h1>
            <p className="text-slate-500 mb-8 font-medium">How would you like to join SyncUp?</p>

            <div className="space-y-4">
              <button
                onClick={() => setAccountType("user")}
                className="w-full text-left p-6 rounded-2xl border-2 border-slate-100 hover:border-primary hover:bg-slate-50 transition-all group flex items-start gap-4"
              >
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">Professional</h3>
                  <p className="text-slate-500 text-sm mt-1">I want to apply for jobs, attend events, and network.</p>
                </div>
              </button>

              <button
                onClick={() => setAccountType("company")}
                className="w-full text-left p-6 rounded-2xl border-2 border-slate-100 hover:border-accent hover:bg-slate-50 transition-all group flex items-start gap-4"
              >
                <div className="w-12 h-12 bg-accent/10 text-accent-foreground rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">Company</h3>
                  <p className="text-slate-500 text-sm mt-1">We want to hire top talent, host events, and offer services.</p>
                </div>
              </button>
            </div>
            
            <p className="mt-8 text-center text-slate-500 text-sm">
              Already have an account? <a href="/login" className="text-primary font-bold hover:underline">Sign In</a>
            </p>
          </motion.div>
        )}

        {accountType === "user" && <UserSteps key="user" onBack={handleReset} />}
        {accountType === "company" && <CompanySteps key="company" onBack={handleReset} />}
      </AnimatePresence>
    </div>
  );
};
