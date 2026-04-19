"use client";

import { KaaMeNavbar } from "@/components/kaa-me/KaaMeNavbar";
import CompanyHostingDashboard from "@/components/dashboard/CompanyHostingDashboard";
import { motion } from "framer-motion";

export default function HostingManagementPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] text-slate-900 selection:bg-cyan-100">
      <KaaMeNavbar />
      
      <main className="max-w-7xl mx-auto px-6 pt-32">
        <CompanyHostingDashboard />
      </main>
    </div>
  );
}
