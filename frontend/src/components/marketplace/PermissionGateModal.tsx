"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, X, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";
import Link from "next/link";

interface PermissionGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  requirements: string[];
  actionLink?: string;
  actionText?: string;
  type?: 'error' | 'warning' | 'info';
}

export function PermissionGateModal({
  isOpen,
  onClose,
  title,
  description,
  requirements,
  actionLink = "/marketplace/profile/setup",
  actionText = "Get Verified Now",
  type = 'warning'
}: PermissionGateModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100"
          >
            <div className={`p-8 ${type === 'error' ? 'bg-red-50' : type === 'warning' ? 'bg-amber-50' : 'bg-blue-50'}`}>
              <div className="flex items-center justify-between mb-6">
                <div className={`p-3 rounded-2xl ${type === 'error' ? 'bg-red-500/10 text-red-600' : type === 'warning' ? 'bg-amber-500/10 text-amber-600' : 'bg-blue-500/10 text-blue-600'}`}>
                   {type === 'error' ? <ShieldAlert className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
                </div>
                <button 
                  onClick={onClose}
                  className="p-2 hover:bg-black/5 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              
              <h2 className="font-display font-bold text-3xl mb-3 text-slate-900 leading-tight lowercase">
                {title}
              </h2>
              <p className="text-slate-500 font-medium">
                {description}
              </p>
            </div>

            <div className="p-8">
              <div className="space-y-4 mb-8">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Requirements</span>
                {requirements.map((req, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-sm font-bold text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-slate-300" />
                    {req}
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-3">
                <Link href={actionLink}>
                  <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-primary transition-all shadow-xl shadow-black/5">
                    {actionText}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
                <button 
                  onClick={onClose}
                  className="w-full py-4 text-slate-400 font-bold hover:text-slate-900 transition-colors"
                >
                  I'll do it later
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
