"use client";

import { motion } from "framer-motion";
import { ExternalLink, Sparkles } from "lucide-react";

export const SponsoredCard = ({ ad }: { ad: any }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-slate-900 text-white rounded-[2rem] p-8 mb-6 relative overflow-hidden group shadow-xl shadow-primary/10"
    >
      {/* Animated Accents */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[80px] -mr-32 -mt-32 group-hover:bg-primary/30 transition-colors" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/10 rounded-full blur-[60px] -ml-24 -mb-24" />

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-6">
          <div className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1.5 border border-white/10">
            <Sparkles className="w-3 h-3 text-accent" />
            <span className="text-[10px] font-bold tracking-widest uppercase">Sponsored</span>
          </div>
          <span className="text-[10px] font-medium text-slate-400">by {ad.brand}</span>
        </div>

        <h2 className="font-display font-bold text-3xl mb-4 leading-tight tracking-tight">
          {ad.headline}
        </h2>
        
        <p className="text-slate-300 text-sm leading-relaxed mb-6 max-w-md">
          {ad.content}
        </p>

        <div className="mb-8 rounded-2xl overflow-hidden border border-white/10">
          <img 
            src={ad.image} 
            alt="Ad display" 
            className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-1000" 
          />
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full sm:w-auto bg-white text-slate-900 px-8 py-3 rounded-xl font-display font-bold flex items-center justify-center gap-2 hover:bg-slate-100 transition-colors shadow-lg"
        >
          {ad.cta}
          <ExternalLink className="w-4 h-4" />
        </motion.button>
      </div>
    </motion.div>
  );
};
