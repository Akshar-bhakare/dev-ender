"use client";

import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Mail, Lock, ArrowRight, AlertCircle, Building2, User } from "lucide-react";

export const LoginForm = () => {
  const { login } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accountType, setAccountType] = useState<"user" | "company">("user");
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response: any = await api.post("/auth/login", {
        ...credentials,
        accountType,
      });

      if (response && response.success) {
        login(response);
        router.push("/dashboard");
      }
    } catch (err: any) {
      console.error("Login failed:", err);
      setError(err.response?.data?.error?.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 md:p-8">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-display font-bold text-slate-900 mb-2">Welcome Back</h1>
        <p className="text-slate-500 font-medium">Please enter your details to sign in.</p>
      </div>

      {/* Account Type Toggle */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-8">
        <button
          onClick={() => setAccountType("user")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-display font-bold text-sm transition-all ${
            accountType === "user"
              ? "bg-white text-primary shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <User className="w-4 h-4" />
          Professional
        </button>
        <button
          onClick={() => setAccountType("company")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-display font-bold text-sm transition-all ${
            accountType === "company"
              ? "bg-white text-primary shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <Building2 className="w-4 h-4" />
          Company
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3 text-red-600"
            >
              <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <p className="text-sm font-medium leading-relaxed">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-display font-bold text-slate-700 ml-1">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
              <input
                type="email"
                name="email"
                value={credentials.email}
                onChange={handleChange}
                required
                placeholder="name@company.com"
                className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-100 focus:border-primary focus:ring-0 transition-all font-medium text-slate-900 bg-slate-50/50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center ml-1">
              <label className="text-sm font-display font-bold text-slate-700">Password</label>
              <button type="button" className="text-xs font-bold text-primary hover:underline">Forgot password?</button>
            </div>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
              <input
                type="password"
                name="password"
                value={credentials.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
                className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-100 focus:border-primary focus:ring-0 transition-all font-medium text-slate-900 bg-slate-50/50"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 px-6 rounded-2xl kaame-gradient text-white font-display font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-primary/25 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:hover:scale-100"
        >
          {loading ? (
            <Loader2 className="w-6 h-6 animate-spin text-white" />
          ) : (
            <>
              Sign In
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </form>

      <div className="mt-10 text-center">
        <p className="text-slate-500 font-medium">
          Don't have an account?{" "}
          <button 
            type="button" 
            onClick={() => router.push("/register")}
            className="text-primary font-bold hover:underline"
          >
            Create one for free
          </button>
        </p>
      </div>
    </div>
  );
};
