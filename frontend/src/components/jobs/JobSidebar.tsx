"use client";

import { cn } from "@/lib/utils";
import { 
  Bookmark, 
  Settings, 
  Bell, 
  FileText, 
  ChevronRight,
  Target,
  Layout
} from "lucide-react";

const NAV_ITEMS = [
  { id: "my-jobs", name: "My Jobs", icon: Bookmark, count: 5 },
  { id: "alerts", name: "Job Alerts", icon: Bell, count: 2 },
  { id: "preferences", name: "Preferences", icon: Target, active: true },
  { id: "resume", name: "Resume Builder", icon: FileText },
  { id: "settings", name: "Job Settings", icon: Settings },
];

export function JobSidebar() {
  return (
    <div className="flex flex-col gap-8 sticky top-[144px]">
      {/* Nav Section */}
      <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
        <div className="px-4 py-3 mb-2 flex items-center gap-2 text-primary">
          <Layout className="w-5 h-5" />
          <span className="font-display font-black text-xs uppercase tracking-widest">Dashboard</span>
        </div>
        
        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              className={cn(
                "w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all group",
                item.active 
                  ? "bg-slate-900 text-white" 
                  : "hover:bg-slate-50 text-slate-500 hover:text-slate-900"
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon className={cn(
                  "w-4 h-4",
                  item.active ? "text-primary" : "text-slate-400 group-hover:text-slate-600"
                )} />
                <span className="text-xs font-bold">{item.name}</span>
              </div>
              {item.count ? (
                <span className={cn(
                  "text-[10px] font-black px-1.5 py-0.5 rounded-lg",
                  item.active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                )}>
                  {item.count}
                </span>
              ) : (
                <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Stats/Highlight Section */}
      <div className="bg-slate-900 rounded-xl p-8 text-center relative overflow-hidden group">
        <div className="absolute inset-0 bg-primary opacity-5 group-hover:opacity-10 transition-opacity" />
        <div className="relative z-10">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-white/10 rounded-xl mb-4">
            <Target className="w-6 h-6 text-primary" />
          </div>
          <h3 className="text-white font-display font-bold text-lg mb-2">Open to Work</h3>
          <p className="text-slate-400 text-[11px] font-medium leading-relaxed mb-6">
            Let recruiters know you're looking for new experienced roles.
          </p>
          <div className="flex items-center justify-center gap-2">
            <div className="w-8 h-4 bg-primary rounded-full relative">
              <div className="absolute right-1 top-1 w-2 h-2 bg-white rounded-full" />
            </div>
            <span className="text-[10px] font-black text-white uppercase tracking-wider">Active</span>
          </div>
        </div>
      </div>

      {/* Legal/Footer Links */}
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 px-6">
        {["Privacy", "Terms", "Support", "Cookie Policy"].map(link => (
          <a key={link} href="#" className="text-[10px] font-bold text-slate-400 hover:text-primary transition-colors">
            {link}
          </a>
        ))}
        <div className="w-full text-center mt-2">
          <span className="text-[10px] font-bold text-slate-300 italic">SyncUp © 2026</span>
        </div>
      </div>
    </div>
  );
}
