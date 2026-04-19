"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
  Building2, 
  Users, 
  Calendar, 
  Sparkles, 
  ArrowRight, 
  MapPin, 
  DollarSign, 
  ExternalLink,
  Briefcase
} from "lucide-react";
import { useState, useEffect } from "react";
import { calculateJobMatch } from "@/lib/gemini";

interface JobDetailsPaneProps {
  job: any;
}

export function JobDetailsPane({ job }: JobDetailsPaneProps) {
  const [matchData, setMatchData] = useState<any>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  useEffect(() => {
    if (job) {
      setIsCalculating(true);
      // In a real app, you'd pass the actual user profile here
      const mockProfile = {
        skills: ["React", "Typescript", "Design Systems"],
        experience: [1, 2],
        headline: "Frontend Engineer"
      };

      calculateJobMatch(mockProfile, job).then((res: any) => {
        setMatchData(res);
        setIsCalculating(false);
      });
    }
  }, [job]);

  if (!job) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-white/50 backdrop-blur-md border border-slate-100 rounded-[2.5rem]">
        <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6">
          <Briefcase className="w-10 h-10 text-slate-300" />
        </div>
        <h3 className="font-display font-bold text-2xl text-slate-800 mb-2">Select a job</h3>
        <p className="text-slate-500 max-w-xs">
          Choose an opportunity from the list to view full details and AI matching insights.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full bg-white border border-slate-100 rounded-xl overflow-hidden flex flex-col shadow-2xl shadow-slate-200/50 sticky top-[144px]">
      {/* Header */}
      <div className="p-8 border-b border-slate-50">
        <div className="flex items-start justify-between mb-6">
          <div className="w-20 h-20 rounded-2xl overflow-hidden border border-slate-100 shadow-sm">
            <img src={job.logo} alt={job.company} className="w-full h-full object-cover" />
          </div>
          <div className="flex gap-3">
            <button className="px-6 py-2.5 bg-slate-100 text-slate-600 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-colors">
              Save
            </button>
            <button className="px-8 py-2.5 kaame-gradient text-white rounded-lg text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 transition-transform flex items-center gap-2">
              Apply Now <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <h1 className="font-display font-bold text-3xl text-slate-900 mb-2 tracking-tight">
          {job.title}
        </h1>
        
        <div className="flex flex-wrap items-center gap-6 mb-8 text-sm font-bold text-slate-500">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-primary" />
            <span className="text-slate-900">{job.company}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            {job.type}
          </div>
          <div className="flex items-center gap-2 text-primary">
            <DollarSign className="w-4 h-4" />
            {job.salary}
          </div>
        </div>

        {/* AI Match Card */}
        <div className="kaame-gradient-alt p-6 rounded-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-white/20 transition-all duration-700" />
          
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-white/80 text-[10px] font-black uppercase tracking-[0.2em] mb-1">
                <Sparkles className="w-3 h-3" />
                AI Analysis Engine
              </div>
              <h4 className="text-white font-display font-bold text-xl">
                {isCalculating ? "Calculating Match..." : "Strong Candidate Match"}
              </h4>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="relative w-16 h-16 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90">
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="4"
                    fill="transparent"
                  />
                  <motion.circle
                    cx="32"
                    cy="32"
                    r="28"
                    stroke="white"
                    strokeWidth="4"
                    fill="transparent"
                    strokeDasharray="175.929"
                    initial={{ strokeDashoffset: 175.929 }}
                    animate={{ strokeDashoffset: isCalculating ? 175.929 : 175.929 - (175.929 * (typeof matchData === 'number' ? matchData : matchData?.score || 0)) / 100 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </svg>
                <span className="absolute text-white font-black text-xs">
                  {isCalculating ? "..." : `${typeof matchData === 'number' ? matchData : matchData?.score || 0}%`}
                </span>
              </div>
            </div>
          </div>

          {matchData?.reasoning && !isCalculating && (
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 text-[11px] font-medium text-white/70 italic leading-relaxed"
            >
              "AI Insight: {matchData.reasoning}"
            </motion.p>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        {matchData?.missing_skills?.length > 0 && (
          <section className="mb-10 p-4 bg-amber-50 border border-amber-100 rounded-xl">
            <h5 className="text-[10px] font-black text-amber-600 uppercase mb-2">Recommended for you</h5>
            <p className="text-xs font-medium text-amber-700 mb-3">
              To increase your match score, consider adding these skills to your profile:
            </p>
            <div className="flex flex-wrap gap-2">
              {matchData.missing_skills.map((skill: string) => (
                <span key={skill} className="px-3 py-1 bg-amber-100 text-amber-700 rounded-lg text-[10px] font-bold">
                  {skill}
                </span>
              ))}
            </div>
          </section>
        )}

        <section className="mb-10">
          <h4 className="font-display font-bold text-xl text-slate-900 mb-4">About the role</h4>
          <p className="text-slate-600 leading-relaxed font-medium">
            {job.description}
          </p>
        </section>

        <section className="mb-10">
          <h4 className="font-display font-bold text-xl text-slate-900 mb-4">Core Skills Required</h4>
          <div className="flex flex-wrap gap-2">
            {job.skills?.map((skill: string) => (
              <span key={skill} className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-600 hover:border-primary/30 transition-colors">
                {skill}
              </span>
            ))}
          </div>
        </section>

        <section className="mb-10">
          <h4 className="font-display font-bold text-xl text-slate-900 mb-4">About the Company</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
              <div className="text-[10px] font-black text-slate-400 uppercase mb-1">Size</div>
              <div className="text-sm font-bold text-slate-800">{job.companyInsights?.employees} Employees</div>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
              <div className="text-[10px] font-black text-slate-400 uppercase mb-1">Industry</div>
              <div className="text-sm font-bold text-slate-800">{job.companyInsights?.industry}</div>
            </div>
          </div>
        </section>

        {/* Hiring Manager Insights */}
        <div className="p-6 bg-slate-900 rounded-xl text-white">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary/50">
              <img src={job.hiringTeam?.avatar} alt={job.hiringTeam?.name} className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="text-xs font-black text-primary uppercase">Hiring Manager</div>
              <div className="font-bold">{job.hiringTeam?.name}</div>
            </div>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed mb-6">
            "{job.hiringTeam?.name} is looking for a {job.title.toLowerCase()} who can bring fresh energy to the {job.company} core team."
          </p>
          <button className="w-full px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all border border-white/5 flex items-center justify-center gap-2">
            Send Personalized Connection <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
