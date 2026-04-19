"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { KaaMeNavbar } from "@/components/kaa-me/KaaMeNavbar";
import eventsData from "@/mock-data/events.json";

// Inlined Icons to bypass persistent Lucide resolution issues in this file
const IconProps = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const ShieldCheck = ({ className, strokeWidth = 2 }: { className?: string; strokeWidth?: number }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const CalendarIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" {...IconProps} className={className}>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

const MapPinIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" {...IconProps} className={className}>
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
);

const UsersIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" {...IconProps} className={className}>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

const TicketIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" {...IconProps} className={className}>
    <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><line x1="13" y1="5" x2="13" y2="19"/>
  </svg>
);

const ArrowRightIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" {...IconProps} className={className}>
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);

const ImageOff = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" {...IconProps} className={className}>
    <line x1="2" y1="2" x2="22" y2="22"/><path d="M10.41 4.41L12 3l8.13 8.13c.45.45.45 1.18 0 1.63L15.41 17.5"/><path d="M21 21H3.88a1 1 0 0 1-.88-1.45l1.6-3.2A11.1 11.1 0 0 0 4 12c0-3.31 2.69-6 6-6 1.3 0 2.5.41 3.47 1.11"/>
  </svg>
);

const VerifiedBadge = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

export default function EventsPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] text-slate-900 selection:bg-cyan-100">
      <KaaMeNavbar />
      
      <main className="max-w-7xl mx-auto px-6 py-16">
        {/* Header Section */}
        <div className="mb-20 text-center max-w-3xl mx-auto">
          <h1 className="font-display font-bold text-7xl mb-6 tracking-tighter leading-tight">
            Professional <span className="text-primary italic">Synchronicity</span>
          </h1>
          <p className="text-slate-500 font-medium text-lg leading-relaxed">
            Exclusive industry syncs, roundtables, and global conferences. 
            Connect with verified humans in high-signal environments.
          </p>
        </div>

        {/* Featured Event Hook */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-20 rounded-[3rem] overflow-hidden relative group shadow-2xl shadow-primary/10"
        >
          <div className="absolute inset-0 z-0">
            <img 
              src={eventsData[2].image} 
              alt="Featured" 
              className="w-full h-[500px] object-cover group-hover:scale-110 transition-transform duration-[2000ms]" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
          </div>
          
          <div className="relative z-10 p-12 md:p-20 flex flex-col justify-end min-h-[500px]">
            <div className="flex items-center gap-3 mb-6">
              <span className="bg-primary text-white px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-[0.2em]">Featured</span>
              <span className="text-white/60 text-xs font-bold font-display uppercase tracking-widest">{eventsData[2].date}</span>
            </div>
            <h2 className="text-5xl md:text-7xl font-display font-bold text-white mb-8 tracking-tighter max-w-2xl leading-[0.9]">
              {eventsData[2].title}
            </h2>
            <div className="flex flex-wrap items-center gap-8 mb-10 text-white/80">
              <div className="flex items-center gap-2 font-bold text-sm">
                <MapPinIcon className="w-5 h-5 text-primary" />
                {eventsData[2].type}
              </div>
              <div className="flex items-center gap-2 font-bold text-sm">
                <UsersIcon className="w-5 h-5 text-primary" />
                Limited to 500 Verified Professionals
              </div>
            </div>
            <button className="w-full md:w-auto px-12 py-5 bg-white text-slate-900 rounded-2xl font-display font-bold text-xl hover:bg-primary hover:text-white transition-all shadow-xl shadow-black/20 flex items-center justify-center gap-3 group/btn">
              Secure Private Pass
              <ArrowRightIcon className="w-6 h-6 group-hover/btn:translate-x-2 transition-transform" />
            </button>
          </div>
        </motion.div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {eventsData.map((event, idx) => (
            <Link key={event.id} href={`/events/${event.id}`}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -10 }}
                className="bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden group shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all flex flex-col md:flex-row h-full cursor-pointer"
              >
                <div className="w-full md:w-2/5 h-64 md:h-auto overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                  {event.image ? (
                    <img src={event.image} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  ) : (
                    <div className="flex flex-col items-center gap-2 opacity-20">
                      <ImageOff className="w-8 h-8" />
                      <span className="text-[10px] font-black uppercase tracking-widest">No Image</span>
                    </div>
                  )}
                </div>
                <div className="p-10 flex flex-col justify-between flex-1">
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{event.date}</span>
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-accent">
                        <VerifiedBadge className="w-3 h-3" />
                        {event.verified ? "Verified Org" : ""}
                      </div>
                    </div>
                    <h3 className="font-display font-bold text-3xl mb-4 text-slate-900 group-hover:text-primary transition-colors leading-tight tracking-tight">
                      {event.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-8">
                      <MapPinIcon className="w-4 h-4" />
                      {event.type}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Organized by</span>
                      <span className="text-sm font-bold text-slate-900">{event.organizer}</span>
                    </div>
                    <div className="p-4 bg-slate-50 text-slate-900 rounded-2xl group-hover:bg-primary group-hover:text-white transition-all">
                      <TicketIcon className="w-6 h-6" />
                    </div>
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>

        {/* Community Section */}
        <div className="mt-32 text-center">
          <div className="kaame-gradient w-24 h-24 rounded-3xl mx-auto mb-8 flex items-center justify-center text-white shadow-2xl shadow-primary/40 rotate-12">
            <ShieldCheck className="w-12 h-12" strokeWidth={1.5} />
          </div>
          <h2 className="font-display font-bold text-4xl mb-6">Host your own sync.</h2>
          <p className="text-slate-500 font-medium mb-12 max-w-lg mx-auto">
            Authorized representatives and verified professionals can host events. 
            Paid events require full identity verification and a trust score of 60+.
          </p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            <Link href="/dashboard/hosting">
                <button className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-display font-bold text-lg hover:bg-primary transition-all shadow-xl shadow-black/10">
                    Manage Hosting Team
                </button>
            </Link>
            <Link href="/register">
                <button className="px-10 py-4 border-2 border-slate-900 text-slate-900 rounded-2xl font-display font-bold text-lg hover:bg-slate-900 hover:text-white transition-all">
                    Verify Identity
                </button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
