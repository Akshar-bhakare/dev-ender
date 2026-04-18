"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { KaaMeNavbar } from "@/components/kaa-me/KaaMeNavbar";
import { api } from "@/lib/api-client";
import { Send, Layout, Target, Wallet, Globe, Loader2, Sparkles } from "lucide-react";

export default function PostRequirementPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    categories: ["Development"],
    skillsRequired: [] as string[],
    budgetRange: { min: 1000, max: 10000, currency: "USD" },
    engagementModel: "fixed",
    visibility: "public"
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/marketplace/requirements', formData);
      router.push('/marketplace');
    } catch (error) {
      console.error("Failed to post requirement:", error);
      alert("Verification Error: Only verified organizations can post requirements.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-slate-900 selection:bg-cyan-100 pb-20">
      <KaaMeNavbar />
      
      <main className="max-w-3xl mx-auto px-6 py-16">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="mb-12"
        >
          <div className="flex items-center gap-3 mb-4">
             <div className="p-3 bg-primary/10 rounded-2xl">
                <Sparkles className="w-6 h-6 text-primary" />
             </div>
             <span className="text-sm font-black uppercase tracking-widest text-primary">Demand Pipeline</span>
          </div>
          <h1 className="font-display font-bold text-5xl tracking-tight mb-4">
            Post a <span className="text-primary italic">Verified RFP</span>
          </h1>
          <p className="text-slate-500 font-medium">
            Describe your project needs. Our matching engine will connect you with verified service providers.
          </p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: Basic Info */}
          <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm relative overflow-hidden group">
            <div className="grain-filter absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity pointer-events-none" />
            <div className="flex items-center gap-3 mb-8">
               <Layout className="w-5 h-5 text-primary" />
               <h3 className="font-display font-bold text-xl uppercase tracking-tight">Project Identity</h3>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Project Title</label>
                <input 
                  required
                  type="text" 
                  placeholder="e.g., Build a production-grade Logistics MVP"
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:outline-none focus:border-primary transition-all shadow-inner"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Scope of Work</label>
                <textarea 
                  required
                  rows={6}
                  placeholder="Detail the deliverables, technical requirements, and objectives..."
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-medium focus:outline-none focus:border-primary transition-all shadow-inner resize-none"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Budget & Model */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-8">
                   <Wallet className="w-5 h-5 text-primary" />
                   <h3 className="font-display font-bold text-xl uppercase tracking-tight">Financials</h3>
                </div>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Min Budget (USD)</label>
                      <input 
                        type="number" 
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:outline-none focus:border-primary transition-all shadow-inner"
                        value={formData.budgetRange.min}
                        onChange={(e) => setFormData({...formData, budgetRange: {...formData.budgetRange, min: parseInt(e.target.value)}})}
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Max Budget</label>
                      <input 
                        type="number" 
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:outline-none focus:border-primary transition-all shadow-inner"
                        value={formData.budgetRange.max}
                        onChange={(e) => setFormData({...formData, budgetRange: {...formData.budgetRange, max: parseInt(e.target.value)}})}
                      />
                    </div>
                  </div>
                </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-8">
                   <Globe className="w-5 h-5 text-primary" />
                   <h3 className="font-display font-bold text-xl uppercase tracking-tight">Visibility</h3>
                </div>
                <div className="space-y-4">
                  {['public', 'invite-only'].map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setFormData({...formData, visibility: v as any})}
                      className={`w-full px-6 py-4 rounded-2xl font-bold text-sm flex items-center justify-between border transition-all ${
                        formData.visibility === v ? 'border-primary bg-primary/5 text-primary shadow-lg shadow-primary/5' : 'border-slate-100 text-slate-400 hover:border-slate-200'
                      }`}
                    >
                      <span className="capitalize">{v}</span>
                      <div className={`w-4 h-4 rounded-full border-2 ${formData.visibility === v ? 'border-primary bg-primary' : 'border-slate-200'}`} />
                    </button>
                  ))}
                </div>
            </div>
          </div>

          <div className="flex items-center justify-center pt-8">
            <button 
              disabled={loading}
              className="px-16 py-5 kaame-gradient text-white rounded-[2rem] font-display font-bold text-xl shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-3"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
              {loading ? "Verifying Pipeline..." : "Publish to Marketplace"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
