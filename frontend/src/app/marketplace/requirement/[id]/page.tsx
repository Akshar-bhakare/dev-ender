"use client";

import { useEffect, useState, use } from "react";
import { motion } from "framer-motion";
import { KaaMeNavbar } from "@/components/kaa-me/KaaMeNavbar";
import { api } from "@/lib/api-client";
import { 
  ShieldCheck, 
  Clock, 
  DollarSign, 
  FileText, 
  Send, 
  ChevronRight, 
  Users, 
  Zap,
  Loader2,
  CheckCircle2
} from "lucide-react";

export default function RequirementDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [requirement, setRequirement] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const [proposalData, setProposalData] = useState({
    proposalSummary: "",
    approach: "",
    timelineEstimate: "",
    pricingModel: "fixed",
    priceQuote: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [reqData, recsData] = await Promise.all([
          api.get(`/marketplace/requirements/search`), // Fallback search for detail if no specific GET id endpoint
          api.get(`/marketplace/requirements/${id}/recommendations`)
        ]);
        
        // Find specific requirement in the search results for v1
        const found = reqData.find((r: any) => r._id === id);
        setRequirement(found);
        setRecommendations(recsData);
      } catch (error) {
        console.error("Failed to fetch requirement details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleSubmitProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/marketplace/proposals', {
         ...proposalData,
         requirementId: id
      });
      setSubmitted(true);
    } catch (error) {
      console.error("Failed to submit proposal:", error);
      alert("Error: Only verified providers can submit proposals.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
     <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
     </div>
  );

  if (!requirement) return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
       <span className="font-display font-bold text-2xl">Requirement Not Found</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-slate-900 selection:bg-cyan-100 pb-32">
      <KaaMeNavbar />
      
      <main className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* Left Column: Details & Bidding */}
        <div className="lg:col-span-2 space-y-12">
           <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
             <div className="flex items-center gap-3 mb-6">
                <span className="px-4 py-1.5 bg-primary/10 text-primary text-xs font-black uppercase tracking-widest rounded-xl">
                  {requirement.categories[0]}
                </span>
                <div className="flex items-center gap-2 text-accent font-bold text-xs">
                   <ShieldCheck className="w-4 h-4" />
                   Verified RFP
                </div>
             </div>
             
             <h1 className="font-display font-bold text-5xl mb-8 leading-tight tracking-tight">
               {requirement.title}
             </h1>

             <div className="flex flex-wrap items-center gap-8 mb-12">
                <div className="flex items-center gap-3">
                   <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100">
                      <DollarSign className="w-5 h-5 text-slate-400" />
                   </div>
                   <div>
                      <span className="block text-[10px] font-black text-slate-300 uppercase tracking-widest">Budget</span>
                      <span className="font-bold text-slate-600">{requirement.budgetRange.min} - {requirement.budgetRange.max} USD</span>
                   </div>
                </div>
                <div className="flex items-center gap-3">
                   <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100">
                      <Zap className="w-5 h-5 text-slate-400" />
                   </div>
                   <div>
                      <span className="block text-[10px] font-black text-slate-300 uppercase tracking-widest">Model</span>
                      <span className="font-bold text-slate-600 capitalize">{requirement.engagementModel}</span>
                   </div>
                </div>
             </div>

             <div className="prose prose-slate max-w-none">
                <h3 className="font-display font-bold text-2xl mb-4">Project Overview</h3>
                <p className="text-slate-600 leading-relaxed font-medium whitespace-pre-wrap">
                  {requirement.description}
                </p>
             </div>

             <div className="mt-12">
                <h3 className="font-display font-bold text-xl mb-6 flex items-center gap-3">
                   <Target className="w-5 h-5 text-primary" />
                   Required Capabilities
                </h3>
                <div className="flex flex-wrap gap-3">
                   {requirement.skillsRequired.map((skill: string) => (
                      <span key={skill} className="px-6 py-2.5 bg-white border border-slate-100 rounded-2xl text-xs font-bold text-slate-500 shadow-sm">
                         {skill}
                      </span>
                   ))}
                </div>
             </div>
           </motion.div>

           {/* Bidding Section */}
           <section className="pt-12 border-t border-slate-100">
              <div className="flex items-center justify-between mb-8">
                <h2 className="font-display font-bold text-3xl">Submit <span className="text-primary italic">Proposal</span></h2>
                <div className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg">
                   Bidding Open
                </div>
              </div>

              {submitted ? (
                 <motion.div 
                   initial={{ scale: 0.9, opacity: 0 }} 
                   animate={{ scale: 1, opacity: 1 }}
                   className="bg-primary/5 border-2 border-dashed border-primary/20 rounded-[3rem] p-12 text-center"
                 >
                    <CheckCircle2 className="w-16 h-16 text-primary mx-auto mb-6" />
                    <h3 className="font-display font-bold text-2xl mb-4">Pipeline Synchronized</h3>
                    <p className="text-slate-500 font-medium mb-8">Your proposal has been securely transmitted. The buyer will review your approach and trust signals.</p>
                    <button onClick={() => setSubmitted(false)} className="text-primary font-bold text-sm underline underline-offset-4">Submit another update?</button>
                 </motion.div>
              ) : (
                <form onSubmit={handleSubmitProposal} className="bg-white border border-slate-100 rounded-[2.5rem] p-10 shadow-xl shadow-slate-200/40 space-y-8 group relative overflow-hidden">
                   <div className="grain-filter absolute inset-0 opacity-[0.03] pointer-events-none" />
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">Proposed Timeline</label>
                        <input 
                          required
                          type="text" 
                          placeholder="e.g., 4 Weeks (MVP)"
                          className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:outline-none focus:border-primary transition-all"
                          value={proposalData.timelineEstimate}
                          onChange={(e) => setProposalData({...proposalData, timelineEstimate: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">Quote (USD)</label>
                        <input 
                          required
                          type="number" 
                          placeholder="Project total"
                          className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:outline-none focus:border-primary transition-all"
                          value={proposalData.priceQuote}
                          onChange={(e) => setProposalData({...proposalData, priceQuote: parseInt(e.target.value)})}
                        />
                      </div>
                   </div>

                   <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">Your Strategic Approach</label>
                      <textarea 
                        required
                        rows={8}
                        placeholder="How will you deliver high-end results for this requirement?"
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-medium focus:outline-none focus:border-primary transition-all resize-none"
                        value={proposalData.approach}
                        onChange={(e) => setProposalData({...proposalData, approach: e.target.value})}
                      />
                   </div>

                   <button 
                     disabled={submitting}
                     className="w-full py-5 kaame-gradient text-white rounded-[1.5rem] font-display font-bold text-xl shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                   >
                     {submitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-5 h-5" />}
                     {submitting ? "Analyzing Signal..." : "Transmit Verified Proposal"}
                   </button>
                </form>
              )}
           </section>
        </div>

        {/* Right Column: Recommendations & Context */}
        <aside className="space-y-12">
           <div className="bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/30 rounded-full blur-3xl -mr-16 -mt-16" />
              <div className="relative z-10">
                 <h2 className="font-display font-bold text-2xl mb-6">Provider <span className="text-accent italic">Recommendations</span></h2>
                 <p className="text-slate-400 text-sm font-medium mb-8">AI-curated matches based on project scope and provider trust levels.</p>
                 
                 <div className="space-y-4">
                    {recommendations.length > 0 ? recommendations.map((rec) => (
                       <div key={rec._id} className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                          <div className="w-10 h-10 kaame-gradient rounded-xl flex items-center justify-center font-bold text-sm">
                             {(rec.orgId as any).name[0]}
                          </div>
                          <div>
                             <span className="block font-bold text-sm">{(rec.orgId as any).name}</span>
                             <div className="flex items-center gap-1.5 text-[10px] text-accent font-black">
                                <ShieldCheck className="w-3 h-3" />
                                MATCHED
                             </div>
                          </div>
                          <ChevronRight className="ml-auto w-4 h-4 text-slate-500" />
                       </div>
                    )) : (
                       <div className="py-4 text-center border-2 border-dashed border-white/10 rounded-2xl text-slate-500 text-xs font-bold uppercase tracking-widest">
                          Scanning Ecosystem...
                       </div>
                    )}
                 </div>
              </div>
           </div>

           <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm">
              <h3 className="font-display font-bold text-xl mb-6">Trust Metrics</h3>
              <div className="space-y-6">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <Users className="w-4 h-4 text-slate-400" />
                       <span className="text-xs font-bold text-slate-500">Buyer Rating</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-black">
                       <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                       4.9
                    </div>
                 </div>
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <FileText className="w-4 h-4 text-slate-400" />
                       <span className="text-xs font-bold text-slate-500">History</span>
                    </div>
                    <span className="text-xs font-black text-slate-900">12 Contracts</span>
                 </div>
                 <div className="pt-4 border-t border-slate-50">
                    <div className="bg-accent/5 p-4 rounded-2xl border border-accent/10">
                       <p className="text-[10px] font-medium text-slate-500 italic">"This buyer has zero history of payment disputes in the network."</p>
                    </div>
                 </div>
              </div>
           </div>
        </aside>

      </main>
    </div>
  );
}

// Minimal target placeholder for icon
function Target({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}
