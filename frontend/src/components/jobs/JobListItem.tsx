"use client";

import { motion } from "framer-motion";
import { ShieldCheck, MapPin, DollarSign, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface JobListItemProps {
  job: any;
  isSelected: boolean;
  onClick: () => void;
}

export function JobListItem({ job, isSelected, onClick }: JobListItemProps) {
  return (
    <motion.div
      onClick={onClick}
      whileHover={{ y: -2 }}
      className={cn(
        "cursor-pointer p-6 border-b border-slate-100 transition-all relative overflow-hidden group mb-[1px]",
        isSelected ? "bg-primary/[0.03] z-10" : "bg-white hover:bg-slate-50"
      )}
    >
      <div className="flex gap-4">
        <div className="w-14 h-14 rounded-xl overflow-hidden border border-slate-100 flex-shrink-0 bg-white">
          <img src={job.logo} alt={job.company} className="w-full h-full object-cover" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className={cn(
              "font-display font-bold text-lg leading-tight truncate transition-colors",
              isSelected ? "text-primary" : "text-slate-900 group-hover:text-primary"
            )}>
              {job.title}
            </h3>
          </div>
          
          <div className="text-sm font-medium text-slate-600 mb-2">
            {job.company}
          </div>
          
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] font-bold text-slate-400">
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {job.type}
            </div>
            <div className="flex items-center gap-1 text-primary">
              <DollarSign className="w-3 h-3" />
              {job.salary}
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {job.applicants} applicants
            </div>
          </div>
          
          <div className="mt-3 flex items-center gap-2">
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-wider">
              {job.postedAt}
            </span>
            {job.verified && (
              <div className="flex items-center gap-1 px-2 py-0.5 bg-accent/10 border border-accent/20 rounded-full">
                <ShieldCheck className="w-2.5 h-2.5 text-accent" />
                <span className="text-[10px] font-black text-accent uppercase tracking-tighter">Verified</span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Selection Indicator */}
      {isSelected && (
        <motion.div 
          layoutId="active-job-indicator"
          className="absolute left-0 top-0 bottom-0 w-1 bg-primary"
        />
      )}
    </motion.div>
  );
}
