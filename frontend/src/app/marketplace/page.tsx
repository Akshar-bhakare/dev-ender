"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { KaaMeNavbar } from "@/components/kaa-me/KaaMeNavbar";
import { api } from "@/lib/api-client";
import { ShieldCheck, Star, Briefcase, ArrowRight, Plus, Loader2, Coins, Handshake, Users } from "lucide-react";
import { FundingListingCard } from "@/components/marketplace/FundingListingCard";
import { PermissionGateModal } from "@/components/marketplace/PermissionGateModal";

export default function MarketplacePage() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"b2b" | "funding">("funding");
  const [requirements, setRequirements] = useState<any[]>([]);
  const [fundingRounds, setFundingRounds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [userProfile, setUserProfile] = useState<any>(null);
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    const fetchData = async () => {
      setLoading(true);
      try {
        const [reqData, fundData, profileData] = await Promise.all([
          api.get('/marketplace/requirements/search'),
          api.get('/funding'),
          api.get('/auth/me').catch(() => null) // Fetch profile if logged in
        ]);
        setRequirements(reqData || []);
        setFundingRounds(fundData.rounds || []);
        if (profileData?.success) {
            setUserProfile(profileData);
        }
      } catch (error) {
        console.error("Failed to fetch marketplace data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const isVerifiedCompany = userProfile?.accountType === 'company' && userProfile?.user?.verificationStatus === 'verified';

  const handleRaiseCapitalAction = (e: React.MouseEvent) => {
    if (!isVerifiedCompany) {
        e.preventDefault();
        setIsPermissionModalOpen(true);
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#FAFAFA]">
        <KaaMeNavbar />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-slate-900 selection:bg-cyan-100">
      <KaaMeNavbar />
      
      <main className="max-w-7xl mx-auto px-6 py-32">

        {/* Global Action Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
          <div className="flex bg-white p-1.5 rounded-[1.5rem] border border-slate-100 shadow-sm">
            <button 
              onClick={() => setActiveTab("funding")}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl text-xs font-bold transition-all ${activeTab === 'funding' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              <Coins className="w-4 h-4" />
              Investment Rounds
            </button>
            <button 
              onClick={() => setActiveTab("b2b")}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl text-xs font-bold transition-all ${activeTab === 'b2b' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              <Handshake className="w-4 h-4" />
              B2B Services
            </button>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="hidden md:flex flex-wrap items-center gap-3">
                {["All", "Fintech", "Health", "AI", "SaaS"].map((cat) => (
                <button key={cat} className="px-5 py-2.5 rounded-2xl bg-white border border-slate-100 text-[10px] font-black uppercase tracking-tighter text-slate-400 hover:border-primary hover:text-primary transition-all">
                    {cat}
                </button>
                ))}
            </div>

            <Link 
              href={activeTab === 'funding' ? "/marketplace/funding/create" : "/marketplace/post"}
              onClick={handleRaiseCapitalAction}
            >
                <button className={`flex items-center gap-2 px-8 py-3 rounded-2xl font-bold transition-all shadow-xl hover:scale-105 active:scale-95 ${activeTab === 'funding' && !isVerifiedCompany ? 'bg-slate-100 text-slate-400 border border-slate-200' : 'kaame-gradient text-white shadow-primary/20'}`}>
                <Plus className="w-5 h-5" />
                {activeTab === 'funding' ? (isVerifiedCompany ? 'Raise Capital' : 'Verify Company to Raise') : 'Post Requirement'}
                </button>
            </Link>
          </div>
        </div>

        {/* Company Admin Tools - Only for Company Owners */}
        {userProfile?.accountType === 'company' && userProfile?.user?.status === 'active' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 mb-8 p-4 bg-white border border-slate-100 rounded-3xl shadow-sm"
          >
             <div className="p-2 bg-primary/10 rounded-xl text-primary">
                <Users className="w-5 h-5" />
             </div>
             <div>
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Company Operations</h4>
                <div className="flex items-center gap-4">
                  <Link href="/dashboard/hosting" className="text-sm font-bold text-slate-900 hover:text-primary transition-colors underline decoration-primary/30 decoration-2 underline-offset-4">
                    Manage Event Hosts
                  </Link>
                  <Link href="/marketplace/profile/setup" className="text-sm font-bold text-slate-900 hover:text-primary transition-colors underline decoration-primary/30 decoration-2 underline-offset-4">
                    Update Service Profile
                  </Link>
                </div>
             </div>
          </motion.div>
        )}

        {/* Content Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 grayscale opacity-50">
            <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
            <span className="font-display font-bold text-xl">Indexing the Marketplace...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {activeTab === 'funding' ? (
                fundingRounds.map((round, idx) => (
                    <FundingListingCard key={round._id} round={round} idx={idx} />
                ))
            ) : (
                requirements.map((req, idx) => (
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
                        {req.categories?.[0] || "General"}
                    </span>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-accent">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Verified Request
                    </div>
                    </div>

                    {/* Content */}
                    <div className="flex-grow">
                    <h3 className="font-display font-bold text-2xl mb-4 text-slate-900 group-hover:text-primary transition-colors leading-tight">
                        {req.title}
                    </h3>
                    <p className="text-sm text-slate-500 font-medium mb-6 line-clamp-3">
                        {req.description}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-8">
                        {req.skillsRequired?.slice(0, 3).map((skill: string) => (
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
                        {req.budgetRange?.min?.toLocaleString()} - {req.budgetRange?.max?.toLocaleString()} {req.budgetRange?.currency}
                        </span>
                    </div>
                    <Link href={`/marketplace/requirement/${req._id}`}>
                        <button className="p-3 bg-slate-900 text-white rounded-xl hover:bg-primary transition-colors shadow-lg shadow-black/5">
                        <ArrowRight className="w-5 h-5" />
                        </button>
                    </Link>
                    </div>
                </motion.div>
                ))
            )}

            {/* Empty State */}
            {((activeTab === 'b2b' && requirements.length === 0) || (activeTab === 'funding' && fundingRounds.length === 0)) && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-primary/5 border-2 border-dashed border-primary/20 rounded-[2.5rem] p-10 flex flex-col items-center justify-center text-center group hover:bg-primary/10 transition-colors col-span-full"
              >
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg mb-6 group-hover:rotate-12 transition-transform">
                  <Plus className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-display font-bold text-2xl mb-4 text-slate-900">Start the Pipeline</h3>
                <p className="text-sm text-slate-500 font-medium mb-8 max-w-sm">
                  {activeTab === 'funding' 
                    ? "Be the first to list a verified funding round and reach premium investors." 
                    : "No active public requests in your niche yet. Be the first to post a verified B2B collaboration."}
                </p>
                <Link href={activeTab === 'funding' ? "/marketplace/funding/create" : "/marketplace/post"}>
                  <button className="px-8 py-3 bg-primary text-white rounded-xl text-sm font-bold shadow-xl shadow-primary/20">
                    Get Started
                  </button>
                </Link>
              </motion.div>
            )}
          </div>
        )}
      </main>

      <PermissionGateModal 
        isOpen={isPermissionModalOpen}
        onClose={() => setIsPermissionModalOpen(false)}
        title="Verified Company Required"
        description="To maintain the integrity of our marketplace, only verified organizations can initiate funding rounds. This ensures investor confidence and legal compliance."
        requirements={[
            "Registered Company Profile",
            "Business Registration Documents",
            "Identity Verification of Owner",
            "Trust Score ≥ 60"
        ]}
        actionText="Verify my Company"
        actionLink="/marketplace/profile/setup"
      />
    </div>
  );
}

