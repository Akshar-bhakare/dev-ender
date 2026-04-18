"use client";

import { motion } from "framer-motion";
import { KaaMeNavbar } from "@/components/kaa-me/KaaMeNavbar";
import jobsData from "@/mock-data/jobs.json";
import { Briefcase, MapPin, DollarSign, ShieldCheck, Search, Filter } from "lucide-react";

export default function JobsPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] text-slate-900 selection:bg-cyan-100">
      <KaaMeNavbar />
      
      <main className="max-w-5xl mx-auto px-6 py-16">
        {/* Header Area */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="max-w-xl">
            <h1 className="font-display font-bold text-6xl mb-6 tracking-tighter">
              Experienced <span className="text-primary italic">Roles</span>
            </h1>
            <p className="text-slate-500 font-medium leading-relaxed">
              Curated opportunities for high-impact professionals. 
              Only verified companies and verified human candidates.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-100 rounded-2xl text-xs font-bold text-slate-500 shadow-sm hover:border-primary transition-all">
              <Filter className="w-4 h-4" />
              Filter
            </button>
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />
              <input 
                type="text" 
                placeholder="Search experienced roles..." 
                className="pl-12 pr-6 py-3 bg-white border border-slate-100 rounded-2xl text-xs font-bold w-full md:w-64 focus:outline-none focus:border-primary transition-all shadow-sm" 
              />
            </div>
          </div>
        </div>

        {/* Jobs Feed */}
        <div className="space-y-6">
          {jobsData.map((job, idx) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ x: 10 }}
              className="bg-white border border-slate-100 rounded-[2rem] p-8 flex flex-col md:flex-row md:items-center justify-between gap-8 relative overflow-hidden group shadow-sm hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20 transition-all"
            >
              <div className="grain-filter absolute inset-0 opacity-0 group-hover:opacity-[0.03] transition-opacity pointer-events-none" />
              
              <div className="flex items-start md:items-center gap-6 relative z-10">
                <div className="w-16 h-16 rounded-[1.25rem] overflow-hidden border border-slate-50 shadow-sm flex-shrink-0">
                  <img src={job.logo} alt={job.company} className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-display font-bold text-2xl group-hover:text-primary transition-colors">{job.title}</h3>
                    {job.verified && (
                      <div className="bg-accent/10 p-1 rounded-lg">
                        <ShieldCheck className="w-4 h-4 text-accent" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-400">
                    <span className="text-slate-900">{job.company}</span>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" />
                      {job.type}
                    </div>
                    <div className="flex items-center gap-1.5 text-primary">
                      <DollarSign className="w-3.5 h-3.5" />
                      {job.salary}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 relative z-10">
                <button className="px-8 py-3.5 bg-slate-100 text-slate-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-colors">
                  Details
                </button>
                <button className="px-8 py-3.5 kaame-gradient text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
                  Apply Now
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Growth Sidebar Hook */}
        <div className="mt-20 p-12 bg-slate-900 rounded-[3rem] relative overflow-hidden text-center">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px] -mr-32 -mt-32" />
          <div className="relative z-10">
            <h2 className="font-display font-bold text-3xl text-white mb-4">Want to hire verified experts?</h2>
            <p className="text-slate-400 font-medium mb-8 max-w-lg mx-auto">
              Skip the noise of automated platforms. Connect directly with professionals who own their identity.
            </p>
            <button className="px-12 py-4 bg-white text-slate-900 rounded-2xl font-display font-bold text-lg hover:bg-primary hover:text-white transition-all shadow-xl">
              Post a Global Opportunity
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
