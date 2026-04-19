"use client";

import { useEffect, useState, use } from "react";
import { motion } from "framer-motion";
import { 
  ShieldCheck, ArrowLeft, TrendingUp, Users, Target, 
  ChevronRight, Building2, Globe, FileText, CheckCircle2,
  AlertCircle, Info, Lock, Wallet
} from "lucide-react";
import Link from "next/link";
import { KaaMeNavbar } from "@/components/kaa-me/KaaMeNavbar";
import { api } from "@/lib/api-client";
import { CompanyLogo } from "@/components/marketplace/CompanyLogo";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';

export default function FundingRoundPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [round, setRound] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [investAmount, setInvestAmount] = useState<number>(0);
  const [investing, setInvesting] = useState(false);

  useEffect(() => {
    const fetchRound = async () => {
      try {
        const data = await api.get(`/funding/${id}`);
        setRound(data);
        setInvestAmount(data.minimumInvestment);
      } catch (error) {
        console.error("Failed to fetch funding round:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRound();
  }, [id]);

  const handleInvest = async () => {
    setInvesting(true);
    try {
      const { url } = await api.post('/funding/invest', { fundingRoundId: id, amount: investAmount });
      window.location.href = url;
    } catch (error: any) {
      alert(error.response?.data?.error || "Investment failed to initialize");
    } finally {
      setInvesting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="font-display font-bold text-slate-400">Loading Investment Data...</p>
      </div>
    </div>
  );

  if (!round) return <div>Round not found</div>;

  const progress = (round.raisedAmount / round.targetAmount) * 100;

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-slate-900 pb-20">
      <KaaMeNavbar />
      
      {/* Hero Header */}
      <div className="bg-white border-b border-slate-100 pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-6">
          <Link href="/marketplace" className="inline-flex items-center gap-2 text-slate-400 hover:text-primary transition-colors mb-8 font-bold text-xs uppercase tracking-widest">
            <ArrowLeft className="w-4 h-4" />
            Back to Marketplace
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div className="flex items-start gap-6">
              <CompanyLogo 
                src={round.companyId.logoUrl} 
                name={round.companyId.displayName} 
                className="w-24 h-24 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50"
              />
              <div>
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <h1 className="font-display font-bold text-4xl tracking-tight">{round.companyId.displayName}</h1>
                  {round.adminApproved && (
                    <div className="px-3 py-1 bg-primary/5 text-primary text-[10px] font-black uppercase tracking-widest rounded-lg border border-primary/10 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Verified Listing
                    </div>
                  )}
                  <span className="px-3 py-1 bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-lg border border-slate-100">
                    {round.companyId.industry}
                  </span>
                </div>
                <div className="flex items-center gap-6 text-sm text-slate-500 font-medium">
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-slate-300" />
                    {round.companyId.legalName}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-slate-300" />
                    {round.companyId.website?.replace('https://', '')}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
               <button className="px-8 py-3 bg-white border border-slate-200 text-slate-900 rounded-2xl font-bold text-sm shadow-sm hover:border-primary transition-all">
                  Follow Updates
               </button>
               <button className="px-8 py-3 kaame-gradient text-white rounded-2xl font-bold text-sm shadow-xl shadow-primary/20 hover:scale-105 transition-all">
                  Contact Founder
               </button>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Main Content (Left) */}
          <div className="lg:col-span-2 space-y-12">
            
            {/* Investment Overview */}
            <section>
              <h2 className="font-display font-bold text-2xl mb-6">Investment Pitch</h2>
              <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm leading-relaxed text-slate-600 font-medium whitespace-pre-wrap">
                {round.pitch}
              </div>
            </section>

            {/* Performance Charts */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display font-bold text-2xl">Financial Traction</h2>
                <div className="flex gap-2">
                   <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black uppercase">Revenue</span>
                   <span className="px-3 py-1 bg-primary/5 text-primary rounded-lg text-[10px] font-black uppercase">Valuation</span>
                </div>
              </div>
              <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={round.metrics?.length ? round.metrics : [
                    { month: 'Jan', revenue: 20, valuation: 100 },
                    { month: 'Feb', revenue: 35, valuation: 110 },
                    { month: 'Mar', revenue: 47, valuation: 130 },
                    { month: 'Apr', revenue: 62, valuation: 155 },
                    { month: 'May', revenue: 88, valuation: 190 },
                    { month: 'Jun', revenue: 105, valuation: 220 },
                  ]}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12}} />
                    <Tooltip 
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#0EA5E9" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                    <Line type="monotone" dataKey="valuation" stroke="#8B5CF6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </section>

            {/* Traction Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-150 transition-transform">
                        <TrendingUp className="w-24 h-24" />
                    </div>
                    <span className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Monthly Revenue</span>
                    <h3 className="text-4xl font-display font-bold mb-4">₹{round.traction?.monthlyRevenue.toLocaleString()}</h3>
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                        <TrendingUp className="w-4 h-4" />
                        +{round.traction?.revenueGrowthPercent}% Growth
                    </div>
                </div>
                <div className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm">
                    <span className="block text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2">Monthly Active Users</span>
                    <h3 className="text-4xl font-display font-bold mb-4 text-slate-900">{round.traction?.monthlyActiveUsers.toLocaleString()}</h3>
                    <div className="flex items-center gap-2 text-slate-400 font-bold text-sm">
                        <Users className="w-4 h-4" />
                        Verified Active Base
                    </div>
                </div>
            </div>

            {/* Trust Indicators */}
            <section>
              <h2 className="font-display font-bold text-2xl mb-6">Trust & Verification</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {[
                   { label: "Founder Verified", status: round.founderVerified, icon: <User className="w-5 h-5" />, desc: "Identity matched with national ID" },
                   { label: "Financial Documents", status: round.financialDocsUploaded, icon: <FileText className="w-5 h-5" />, desc: "P&L and Balance Sheet uploaded" },
                   { label: "Registry Matched", status: round.registryMatched, icon: <ShieldCheck className="w-5 h-5" />, desc: "Business registration confirmed" },
                   { label: "Escrow Protected", status: round.escrowEnabled, icon: <Lock className="w-5 h-5" />, desc: "Capital released on milestones" },
                 ].map((item, i) => (
                   <div key={i} className="flex items-start gap-4 p-6 bg-white border border-slate-100 rounded-3xl">
                      <div className={`p-3 rounded-2xl ${item.status ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-300'}`}>
                        {item.icon}
                      </div>
                      <div>
                         <h4 className="font-bold text-slate-900 text-sm mb-1">{item.label}</h4>
                         <p className="text-xs text-slate-500 font-medium mb-2">{item.desc}</p>
                         <div className="flex items-center gap-1.5">
                            {item.status ? (
                              <span className="text-[10px] font-black text-emerald-600 uppercase flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Verified
                              </span>
                            ) : (
                              <span className="text-[10px] font-black text-slate-400 uppercase">Pending</span>
                            )}
                         </div>
                      </div>
                   </div>
                 ))}
              </div>
            </section>
          </div>

          {/* Sticky Sidebar (Right) */}
          <div className="space-y-8">
            <div className="sticky top-32 bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50">
               <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Progress</span>
                    <span className="text-xl font-display font-bold text-primary">{progress.toFixed(1)}%</span>
                  </div>
                  <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden mb-4">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full kaame-gradient"
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-xs font-bold text-slate-900">₹{round.raisedAmount.toLocaleString()}</span>
                      <span className="text-xs font-bold text-slate-400">of ₹{round.targetAmount.toLocaleString()}</span>
                    </div>
                  </div>
               </div>

               <div className="space-y-6 mb-8 pt-6 border-t border-slate-50">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500">Valuation</span>
                    <span className="text-sm font-bold text-slate-900">₹{(round.valuation / 10000000).toFixed(1)} Cr</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500">Equity Offered</span>
                    <span className="text-sm font-bold text-slate-900 text-primary">{round.equityOffered}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500">Min Investment</span>
                    <span className="text-sm font-bold text-slate-900">₹{round.minimumInvestment.toLocaleString()}</span>
                  </div>
               </div>

               <div className="space-y-4">
                  <div className="relative">
                    <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                       type="number"
                       value={investAmount}
                       onChange={(e) => setInvestAmount(Number(e.target.value))}
                       placeholder="Amount to Invest"
                       className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:border-primary transition-all"
                    />
                  </div>
                  
                  <button 
                    onClick={handleInvest}
                    disabled={investing || progress >= 100}
                    className="w-full py-4 kaame-gradient text-white rounded-2xl font-bold shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:grayscale disabled:opacity-50"
                  >
                    {investing ? "Initializing..." : progress >= 100 ? "Round Closed" : "Invest via Stripe Sandbox"}
                  </button>

                  <div className="flex items-center gap-2 justify-center py-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-[10px] uppercase font-black text-slate-400 tracking-tighter">Secure Sandbox Checkout</span>
                  </div>
               </div>

               {/* Trust Score circular gauge or similar */}
               <div className="mt-8 pt-8 border-t border-slate-50 text-center">
                  <div className="inline-block p-4 bg-primary/5 rounded-3xl mb-4">
                    <span className="block text-[10px] font-black text-primary uppercase tracking-widest mb-1">Company Trust Score</span>
                    <span className="text-4xl font-display font-bold text-primary">{round.trustScore}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium max-w-[200px] mx-auto">
                    Aggregated score based on historical performance and verified signals.
                  </p>
               </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function User(props: any) {
  return <Users {...props} />;
}
