"use client";

import { motion } from "framer-motion";
import { KaaMeNavbar } from "@/components/kaa-me/KaaMeNavbar";
import marketplaceData from "@/mock-data/marketplace.json";
import { ShieldCheck, Star, ShoppingBag, ArrowRight } from "lucide-react";

export default function MarketplacePage() {
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
            Acquire production-grade services and assets from verified professionals. 
            Every transaction is backed by the KaaMe Trust Protocol.
          </p>
        </div>

        {/* Categories Bar */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
          {["All", "Design", "Strategy", "Security", "Development", "Audit"].map((cat) => (
            <button key={cat} className="px-6 py-2.5 rounded-2xl bg-white border border-slate-100 text-xs font-bold text-slate-500 hover:border-primary hover:text-primary transition-all shadow-sm">
              {cat}
            </button>
          ))}
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {marketplaceData.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -8 }}
              className="bg-white border border-slate-100 rounded-[2.5rem] p-4 flex flex-col relative group shadow-sm hover:shadow-xl hover:shadow-slate-200/40 transition-all overflow-hidden"
            >
              <div className="grain-filter absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none" />
              
              {/* Image Container */}
              <div className="w-full h-56 rounded-[2rem] overflow-hidden mb-6 relative">
                <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20 flex items-center gap-1.5 shadow-lg">
                  <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                  <span className="text-[10px] font-black">{item.rating}</span>
                </div>
              </div>

              {/* Content */}
              <div className="px-2 flex-grow">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary/60">{item.category}</span>
                  {item.verified && (
                    <div className="flex items-center gap-1 text-[10px] font-bold text-accent">
                      <ShieldCheck className="w-3 h-3" />
                      Verified
                    </div>
                  )}
                </div>
                
                <h3 className="font-display font-bold text-xl mb-3 text-slate-900 group-hover:text-primary transition-colors leading-tight">
                  {item.title}
                </h3>
                
                <p className="text-sm text-slate-500 font-medium mb-6 line-clamp-2">
                  {item.description}
                </p>

                <div className="flex items-center gap-2 mb-6">
                  <div className="w-6 h-6 rounded-full kaame-gradient flex items-center justify-center text-[10px] text-white font-bold">
                    {item.provider[0]}
                  </div>
                  <span className="text-[11px] font-bold text-slate-400">by {item.provider}</span>
                </div>
              </div>

              {/* Action */}
              <div className="border-t border-slate-50 pt-4 flex items-center justify-between px-2">
                <span className="text-2xl font-display font-bold text-slate-900 group-hover:scale-110 transition-transform origin-left">{item.price}</span>
                <button className="p-4 bg-slate-900 text-white rounded-2xl group-hover:bg-primary transition-colors shadow-lg shadow-black/5">
                  <ShoppingBag className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          ))}

          {/* Special Custom Request Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-primary/5 border-2 border-dashed border-primary/20 rounded-[2.5rem] p-10 flex flex-col items-center justify-center text-center group hover:bg-primary/10 transition-colors"
          >
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg mb-6 group-hover:rotate-12 transition-transform">
              <ArrowRight className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-display font-bold text-2xl mb-4">Custom Pipeline?</h3>
            <p className="text-sm text-slate-500 font-medium mb-8">
              Need a tailored professional solution? Request a private verified RFP.
            </p>
            <button className="px-8 py-3 bg-primary text-white rounded-xl text-sm font-bold shadow-xl shadow-primary/20">
              Start Request
            </button>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
