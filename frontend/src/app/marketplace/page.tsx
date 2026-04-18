"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { KaaMeNavbar } from "@/components/kaa-me/KaaMeNavbar";
import { api } from "@/lib/api-client";
import { ShieldCheck, Star, Briefcase, ArrowRight, Plus, Loader2 } from "lucide-react";

export default function MarketplacePage() {
  const [requirements, setRequirements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequirements = async () => {
      try {
        const data = await api.get('/marketplace/requirements/search');
        setRequirements(data);
      } catch (error) {
        console.error("Failed to fetch requirements:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRequirements();
  }, []);

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-slate-900 selection:bg-cyan-100">
      <KaaMeNavbar />
      
      <main className="max-w-7xl mx-auto px-6 py-16">
        {/* Header Section */}
        <div className="mb-16 text-center max-w-2xl mx-auto">
          <h1 className="font-display font-bold text-5xl mb-6 tracking-tight">
            Verified <span className="text-primary italic">Marketplace</span>
          </h1>
          <p className="text-slate-500 font-medium leading-relaxed">
            Acquire production-grade services and find high-impact collaborations. 
            Every request is backed by verified organization identity.
          </p>
        </div>

        {/* Global Action Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
          <div className="flex flex-wrap items-center gap-3">
            {["All", "Design", "Strategy", "Security", "Development", "Audit"].map((cat) => (
              <button key={cat} className="px-6 py-2.5 rounded-2xl bg-white border border-slate-100 text-xs font-bold text-slate-500 hover:border-primary hover:text-primary transition-all shadow-sm">
                {cat}
              </button>
            ))}
          </div>
          
          <Link href="/marketplace/post">
            <button className="flex items-center gap-2 px-8 py-3 kaame-gradient text-white rounded-2xl font-bold shadow-xl shadow-primary/20 hover:scale-105 transition-all">
              <Plus className="w-5 h-5" />
              Post Requirement
            </button>
          </Link>
        </div>

        {/* Requirements Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 grayscale opacity-50">
            <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
            <span className="font-display font-bold text-xl">Indexing the Marketplace...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {requirements.map((req, idx) => (
              <motion.div
                key={req._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -8 }}
                className="bg-white border border-slate-100 rounded-[2.5rem] p-6 flex flex-col relative group shadow-sm hover:shadow-xl hover:shadow-slate-200/40 transition-all overflow-hidden"
              >
                <div className="grain-filter absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity pointer-events-none" />
                
                {/* Category & Status */}
                <div className="flex items-center justify-between mb-6">
                  <span className="px-3 py-1 bg-primary/5 text-primary text-[10px] font-black uppercase tracking-widest rounded-lg">
                    {req.categories[0] || "General"}
                  </span>
                  {req.orgId?.verifiedStatus && (
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-accent">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Verified Request
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-grow">
                  <div className="flex items-center gap-2 mb-2">
                     <div className="w-5 h-5 kaame-gradient rounded-md flex items-center justify-center text-[8px] text-white font-bold">
                       {req.orgId?.name?.[0] || 'O'}
                     </div>
                     <span className="text-[11px] font-bold text-slate-400 capitalize">{req.orgId?.name || 'Organization'}</span>
                  </div>
                  <h3 className="font-display font-bold text-2xl mb-4 text-slate-900 group-hover:text-primary transition-colors leading-tight">
                    {req.title}
                  </h3>
                  <p className="text-sm text-slate-500 font-medium mb-6 line-clamp-3">
                    {req.description}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-8">
                    {req.skillsRequired.slice(0, 3).map((skill: string) => (
                      <span key={skill} className="px-3 py-1 bg-slate-50 border border-slate-100 rounded-full text-[10px] font-bold text-slate-400">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer Info */}
                <div className="border-t border-slate-50 pt-6 flex items-center justify-between">
                  <div>
                    <span className="block text-[10px] font-black text-slate-300 uppercase tracking-tighter mb-1">Budget Range</span>
                    <span className="text-xl font-display font-bold text-slate-900">
                      {req.budgetRange.min.toLocaleString()} - {req.budgetRange.max.toLocaleString()} {req.budgetRange.currency}
                    </span>
                  </div>
                  <Link href={`/marketplace/requirement/${req._id}`}>
                    <button className="p-3 bg-slate-900 text-white rounded-xl hover:bg-primary transition-colors shadow-lg shadow-black/5">
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </Link>
                </div>
              </motion.div>
            ))}

            {/* Empty State / Custom Request hook if no requirements */}
            {requirements.length === 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-primary/5 border-2 border-dashed border-primary/20 rounded-[2.5rem] p-10 flex flex-col items-center justify-center text-center group hover:bg-primary/10 transition-colors col-span-full md:col-span-1"
              >
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg mb-6 group-hover:rotate-12 transition-transform">
                  <Plus className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-display font-bold text-2xl mb-4 text-slate-900">Start the Pipeline</h3>
                <p className="text-sm text-slate-500 font-medium mb-8">
                  No active public requests in your niche yet. Be the first to post a verified B2B collaboration.
                </p>
                <Link href="/marketplace/post">
                  <button className="px-8 py-3 bg-primary text-white rounded-xl text-sm font-bold shadow-xl shadow-primary/20">
                    Get Started
                  </button>
                </Link>
              </motion.div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

