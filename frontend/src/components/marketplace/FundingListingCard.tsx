"use client";

import { motion } from "framer-motion";
import { CompanyLogo } from "./CompanyLogo";
import { ShieldCheck, TrendingUp, Users, Target, ArrowRight } from "lucide-react";
import Link from "next/link";

interface FundingListingCardProps {
  round: any;
  idx: number;
}

export function FundingListingCard({ round, idx }: FundingListingCardProps) {
  const progress = (round.raisedAmount / round.targetAmount) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.1 }}
      className="group relative bg-white border border-slate-100 rounded-[2.5rem] p-6 shadow-sm hover:shadow-2xl hover:shadow-primary/10 transition-all overflow-hidden"
    >
      <div className="absolute top-0 right-0 p-6">
        <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-bold border border-emerald-100">
          <ShieldCheck className="w-3.5 h-3.5" />
          Verified Round
        </div>
      </div>

      <div className="mb-6">
        <CompanyLogo 
          src={round.companyId.logoUrl} 
          name={round.companyId.displayName} 
          className="w-16 h-16 rounded-2xl mb-4 border border-slate-100 shadow-sm"
        />
        <h3 className="font-display font-bold text-xl text-slate-900 group-hover:text-primary transition-colors leading-tight mb-1">
          {round.companyId.displayName}
        </h3>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{round.companyId.industry}</p>
      </div>

      <p className="text-sm text-slate-500 font-medium mb-8 line-clamp-2 min-h-[2.5rem]">
        {round.pitch}
      </p>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <span className="block text-[10px] font-black text-slate-300 uppercase tracking-tighter mb-1">Valuation</span>
          <span className="text-base font-display font-bold text-slate-900">₹{(round.valuation / 10000000).toFixed(1)} Cr</span>
        </div>
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <span className="block text-[10px] font-black text-slate-300 uppercase tracking-tighter mb-1">Min Ticket</span>
          <span className="text-base font-display font-bold text-slate-900">₹{(round.minimumInvestment / 1000).toFixed(0)}k</span>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Progress</span>
          <span className="text-sm font-display font-bold text-primary">{progress.toFixed(1)}%</span>
        </div>
        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full kaame-gradient"
          />
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-[10px] font-bold text-slate-500">₹{(round.raisedAmount / 100000).toFixed(1)}L raised</span>
          <span className="text-[10px] font-bold text-slate-500">Target ₹{(round.targetAmount / 100000).toFixed(1)}L</span>
        </div>
      </div>

      <div className="border-t border-slate-50 pt-6 flex items-center justify-between gap-4">
        <div className="flex -space-x-2">
            {[1,2,3].map(i => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 overflow-hidden shadow-sm">
                    <img src={`https://i.pravatar.cc/100?u=investor${i}`} className="w-full h-full object-cover" />
                </div>
            ))}
            <div className="w-8 h-8 rounded-full border-2 border-white bg-primary text-white text-[10px] font-bold flex items-center justify-center shadow-lg">
                +42
            </div>
        </div>
        
        <Link href={`/marketplace/funding/${round._id}`}>
          <button className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl text-xs font-bold hover:bg-primary transition-all shadow-xl shadow-black/5 active:scale-95">
            Details
            <ArrowRight className="w-4 h-4" />
          </button>
        </Link>
      </div>
    </motion.div>
  );
}
