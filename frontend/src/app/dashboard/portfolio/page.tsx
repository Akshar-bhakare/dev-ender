"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  ShieldCheck, TrendingUp, Wallet, ArrowUpRight, 
  Clock, PieChart, Briefcase, ChevronRight, Activity,
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import { KaaMeNavbar } from "@/components/kaa-me/KaaMeNavbar";
import { api } from "@/lib/api-client";
import { CompanyLogo } from "@/components/marketplace/CompanyLogo";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Cell
} from 'recharts';

export default function PortfolioPage() {
  const [portfolio, setPortfolio] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const data = await api.get('/funding/portfolio/me');
        setPortfolio(data);
      } catch (error) {
        console.error("Failed to fetch portfolio:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPortfolio();
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const COLORS = ['#0EA5E9', '#8B5CF6', '#F59E0B', '#10B981', '#EC4899'];

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-slate-900 pb-20">
      <KaaMeNavbar />
      
      <main className="max-w-7xl mx-auto px-6 pt-32">
        <div className="mb-12">
           <h1 className="font-display font-bold text-4xl mb-2 tracking-tight">Investment <span className="text-primary italic">Portfolio</span></h1>
           <p className="text-slate-500 font-medium whitespace-pre-wrap">Track your capital allocation and performance across verified startups.</p>
        </div>

        {/* Top Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
                { label: "Total Invested", value: `₹${portfolio.totalInvested.toLocaleString()}`, icon: <Wallet className="w-5 h-5" />, color: "bg-primary" },
                { label: "Asset Count", value: portfolio.investments?.length || 0, icon: <Briefcase className="w-5 h-5" />, color: "bg-slate-900" },
                { label: "Unrealized Gain", value: "₹0", icon: <TrendingUp className="w-5 h-5" />, color: "bg-emerald-500" },
                { label: "Avg trustScore", value: "84", icon: <ShieldCheck className="w-5 h-5" />, color: "bg-violet-500" },
            ].map((stat, i) => (
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    key={i} 
                    className="bg-white border border-slate-100 p-6 rounded-[2rem] shadow-sm relative overflow-hidden group"
                >
                    <div className={`p-3 w-fit rounded-2xl ${stat.color} text-white mb-4 shadow-lg shadow-black/5`}>
                        {stat.icon}
                    </div>
                    <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</span>
                    <span className="text-2xl font-display font-bold text-slate-900">{stat.value}</span>
                </motion.div>
            ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            {/* Investment List (Left) */}
            <div className="lg:col-span-2 space-y-8">
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="font-display font-bold text-2xl">Active Assets</h2>
                        <span className="text-xs font-bold text-primary">View All History</span>
                    </div>

                    <div className="space-y-4">
                        {portfolio.investments?.map((inv: any, idx: number) => {
                            const round = inv.fundingRoundId;
                            const comp = round.companyId;
                            return (
                                <motion.div 
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    key={inv._id} 
                                    className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm hover:shadow-xl hover:shadow-slate-200/40 transition-all flex flex-col md:flex-row items-center justify-between gap-6 group"
                                >
                                    <div className="flex items-center gap-4">
                                        <CompanyLogo 
                                          src={comp.logoUrl} 
                                          name={comp.displayName} 
                                          className="w-14 h-14 rounded-2xl border border-slate-50"
                                        />
                                        <div>
                                            <h4 className="font-bold text-slate-900 leading-tight group-hover:text-primary transition-colors">{comp.displayName}</h4>
                                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-tighter">{comp.industry}</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-8 flex-grow">
                                        <div>
                                            <span className="block text-[10px] font-black text-slate-300 uppercase tracking-tighter mb-1">Invested</span>
                                            <span className="text-sm font-bold text-slate-900">₹{inv.amount.toLocaleString()}</span>
                                        </div>
                                        <div>
                                            <span className="block text-[10px] font-black text-slate-300 uppercase tracking-tighter mb-1">Equity</span>
                                            <span className="text-sm font-bold text-slate-900">
                                                {((inv.amount / round.valuation) * 100).toFixed(4)}%
                                            </span>
                                        </div>
                                        <div className="hidden md:block">
                                            <span className="block text-[10px] font-black text-slate-300 uppercase tracking-tighter mb-1">Date</span>
                                            <span className="text-sm font-bold text-slate-400">{new Date(inv.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>

                                    <Link href={`/marketplace/funding/${round._id}`}>
                                        <button className="p-3 bg-slate-50 rounded-2xl text-slate-400 group-hover:bg-primary group-hover:text-white transition-all">
                                            <ArrowUpRight className="w-5 h-5" />
                                        </button>
                                    </Link>
                                </motion.div>
                            );
                        })}

                        {(!portfolio.investments || portfolio.investments.length === 0) && (
                            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] p-20 flex flex-col items-center justify-center text-center">
                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg mb-6 text-slate-300">
                                    <Activity className="w-8 h-8" />
                                </div>
                                <h3 className="font-display font-bold text-xl text-slate-900 mb-2">Portfolio is Empty</h3>
                                <p className="text-sm text-slate-400 font-medium mb-8 max-w-xs">Start your investment journey in the marketplace today.</p>
                                <Link href="/marketplace">
                                   <button className="px-8 py-3 kaame-gradient text-white rounded-2xl font-bold shadow-lg shadow-primary/20">Marketplace</button>
                                </Link>
                            </div>
                        )}
                    </div>
                </section>
            </div>

            {/* Allocation Analysis (Right) */}
            <div className="space-y-8">
                <section className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm">
                    <h2 className="font-display font-bold text-xl mb-6">Sector Allocation</h2>
                    <div className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={[
                                { name: 'Fintech', value: 45 },
                                { name: 'AI', value: 30 },
                                { name: 'SaaS', value: 15 },
                                { name: 'Health', value: 10 },
                            ]}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 10}} />
                                <YAxis hide />
                                <Tooltip cursor={{fill: '#F8FAFC'}} contentStyle={{ border: 'none', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                                    {[1,2,3,4].map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-8 space-y-4">
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                           <div className="flex items-center gap-3">
                              <div className="w-2 h-2 rounded-full bg-primary" />
                              <span className="text-xs font-bold text-slate-900">Highest Exposure</span>
                           </div>
                           <span className="text-xs font-black text-slate-400">FINTECH</span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                           <div className="flex items-center gap-3">
                              <div className="w-2 h-2 rounded-full bg-violet-500" />
                              <span className="text-xs font-bold text-slate-900">Strategic Fit</span>
                           </div>
                           <span className="text-xs font-black text-slate-400">AI / ML</span>
                        </div>
                    </div>
                </section>

                <section className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
                    <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <h3 className="font-display font-bold text-xl mb-4 relative z-10">Investor Trust Badge</h3>
                    <p className="text-sm text-slate-400 font-medium mb-6 relative z-10">You've unlocked the "Early Believer" badge for funding locally verified startups.</p>
                    <div className="w-16 h-16 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center relative z-10">
                        <ShieldCheck className="w-8 h-8 text-primary" />
                    </div>
                </section>
            </div>

        </div>
      </main>
    </div>
  );
}
