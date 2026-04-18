"use client";

import { motion } from "framer-motion";
import { KaaMeNavbar } from "@/components/kaa-me/KaaMeNavbar";
import { PostCard } from "@/components/kaa-me/PostCard";
import { SponsoredCard } from "@/components/kaa-me/SponsoredCard";
import usersData from "@/mock-data/users.json";
import feedData from "@/mock-data/feed.json";
import { Briefcase, Users, Star, TrendingUp, ShieldCheck, Zap } from "lucide-react";

export default function FeedPage() {
  const findUser = (userId: string) => usersData.find(u => u.id === userId);

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-slate-900 selection:bg-cyan-100">
      <KaaMeNavbar />
      
      <main className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Sidebar: Profile & Status */}
        <aside className="lg:col-span-3 space-y-6">
          <div className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm relative overflow-hidden">
            <div className="grain-filter absolute inset-0 pointer-events-none" />
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-3xl kaame-gradient p-1 mb-4 rotate-3">
                <div className="w-full h-full rounded-[1.25rem] bg-white overflow-hidden p-0.5">
                  <img src={usersData[1].avatar} alt="Me" className="w-full h-full object-cover rounded-[1.1rem]" />
                </div>
              </div>
              <h2 className="font-display font-bold text-xl mb-1">{usersData[1].name}</h2>
              <p className="text-xs font-medium text-slate-500 mb-4">{usersData[1].role}</p>
              
              <div className="w-full pt-4 border-t border-slate-50 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Verify Status</span>
                  <span className="text-accent font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    Tier 2
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-accent h-full w-[65%]" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm">
            <h3 className="font-display font-bold text-sm mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              Quick Actions
            </h3>
            <div className="space-y-2">
              {[
                { label: "Post Opportunity", icon: Briefcase },
                { label: "Find Partners", icon: Users },
                { label: "Verified Events", icon: Star }
              ].map((item) => (
                <button key={item.label} className="w-full text-left p-3 rounded-2xl text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-primary transition-all flex items-center gap-3">
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Center: The Feed */}
        <section className="lg:col-span-6 space-y-4">
          {/* Post Input Mock */}
          <div className="bg-white border border-slate-100 rounded-[2rem] p-4 shadow-sm mb-8 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
              <img src={usersData[1].avatar} alt="Me" className="w-full h-full object-cover" />
            </div>
            <div className="flex-grow bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 text-sm font-medium text-slate-400">
              Share a verified insight...
            </div>
            <button className="p-3 bg-primary text-white rounded-2xl shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
              <TrendingUp className="w-5 h-5" />
            </button>
          </div>

          {feedData.map((item: any) => {
            if (item.type === "organic") {
              const user = findUser(item.userId);
              return <PostCard key={item.id} post={item} user={user} />;
            }
            if (item.type === "sponsored") {
              return <SponsoredCard key={item.id} ad={item} />;
            }
            if (item.type === "job_pulse") {
              return (
                <div key={item.id} className="bg-white border-2 border-dashed border-slate-200 rounded-[2.5rem] p-8 mb-6 text-center group hover:border-primary/30 transition-colors">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Experienced Role Match</h4>
                  <h3 className="font-display font-bold text-2xl text-slate-900 group-hover:text-primary transition-colors">{item.title}</h3>
                  <p className="text-sm font-bold text-slate-500 mb-6">{item.company} • {item.salary} • {item.location}</p>
                  <button className="px-8 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-primary transition-all shadow-lg hover:shadow-primary/20">
                    Apply Securely
                  </button>
                </div>
              );
            }
            return null;
          })}
        </section>

        {/* Right Sidebar: Suggestions */}
        <aside className="lg:col-span-3 space-y-6">
          <div className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm">
            <h3 className="font-display font-bold text-sm mb-6 uppercase tracking-wider text-slate-400">Trusted Contacts</h3>
            <div className="space-y-6">
              {usersData.filter(u => u.id !== "u2").map(user => (
                <div key={user.id} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-xl object-cover grayscale group-hover:grayscale-0 transition-all" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">{user.name}</h4>
                      <p className="text-[10px] font-medium text-slate-400 truncate w-32">{user.role}</p>
                    </div>
                  </div>
                  <button className="p-2 text-primary hover:bg-primary/5 rounded-lg transition-colors">
                    <Users className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <button className="w-full mt-8 pt-4 border-t border-slate-50 text-[10px] font-black uppercase tracking-widest text-primary hover:tracking-[0.2em] transition-all">
              Discover verified humans
            </button>
          </div>
        </aside>

      </main>
    </div>
  );
}
