"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
  const { accountType, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (accountType === "company") {
        router.replace("/dashboard/hosting");
      } else {
        // Fallback for professional users, maybe they have a portfolio or just the feed
        router.replace("/feed");
      }
    }
  }, [accountType, isLoading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-slate-500 font-medium animate-pulse">Redirecting to your workspace...</p>
      </div>
    </div>
  );
}
