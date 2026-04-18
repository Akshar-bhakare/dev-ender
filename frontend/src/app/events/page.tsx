"use client";

import { motion } from "framer-motion";
import { KaaMeNavbar } from "@/components/kaa-me/KaaMeNavbar";
import eventsData from "@/mock-data/events.json";
import { Calendar, MapPin, Users, Ticket, ArrowRight, ShieldCheck } from "lucide-react";

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
                <MapPin className="w-5 h-5 text-primary" />
                {eventsData[2].type}
              </div>
              <div className="flex items-center gap-2 font-bold text-sm">
                <Users className="w-5 h-5 text-primary" />
                Limited to 500 Verified Professionals
              </div>
            </div>
            <button className="w-full md:w-auto px-12 py-5 bg-white text-slate-900 rounded-2xl font-display font-bold text-xl hover:bg-primary hover:text-white transition-all shadow-xl shadow-black/20 flex items-center justify-center gap-3 group/btn">
              Secure Private Pass
              <ArrowRight className="w-6 h-6 group-hover/btn:translate-x-2 transition-transform" />
            </button>
          </div>
        </motion.div>

        {/* Secondary Events Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {eventsData.slice(0, 2).map((event, idx) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 30 }}
              transition={{ delay: idx * 0.2 }}
              whileHover={{ y: 20 }}
              className="bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden group shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all flex flex-col md:flex-row h-full"
            >
              <div className="w-full md:w-2/5 h-64 md:h-auto overflow-hidden">
                <img src={event.image} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              </div>
              <div className="p-10 flex flex-col justify-between flex-1">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{event.date}</span>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-accent">
                      <ShieldCheck className="w-3 h-3" />
                      {event.verified ? "Verified Org" : ""}
                    </div>
                  </div>
                  <h3 className="font-display font-bold text-3xl mb-4 text-slate-900 group-hover:text-primary transition-colors leading-tight tracking-tight">
                    {event.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-8">
                    <MapPin className="w-4 h-4" />
                    {event.type}
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Organized by</span>
                    <span className="text-sm font-bold text-slate-900">{event.organizer}</span>
                  </div>
                  <button className="p-4 bg-slate-50 text-slate-900 rounded-2xl hover:bg-primary hover:text-white transition-all">
                    <Ticket className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Community Section */}
        <div className="mt-32 text-center">
          <div className="kaame-gradient w-24 h-24 rounded-3xl mx-auto mb-8 flex items-center justify-center text-white shadow-2xl shadow-primary/40 rotate-12">
            <Calendar className="w-12 h-12" />
          </div>
          <h2 className="font-display font-bold text-4xl mb-6">Host your own sync.</h2>
          <p className="text-slate-500 font-medium mb-12 max-w-lg mx-auto">
            Authorized Tier-3 professionals can host verified events within the KaaMe ecosystem.
          </p>
          <button className="px-10 py-4 border-2 border-slate-900 text-slate-900 rounded-2xl font-display font-bold text-lg hover:bg-slate-900 hover:text-white transition-all">
            Apply for Event Host Status
          </button>
        </div>
      </main>
    </div>
  );
}
