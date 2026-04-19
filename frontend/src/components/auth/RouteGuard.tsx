"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/register",
  "/marketplace",
  "/jobs",
  "/events",
];

// Special case: /profile/[userId] is public, but /profile/setup is private
const isPublicRoute = (pathname: string) => {
  if (PUBLIC_ROUTES.includes(pathname)) return true;
  if (pathname.startsWith("/events/") && pathname !== "/events/create") return true;
  if (pathname.startsWith("/marketplace/") && pathname !== "/marketplace/post") return true;
  if (pathname.startsWith("/jobs/") && pathname !== "/jobs/post") return true;
  if (pathname.startsWith("/profile/") && pathname !== "/profile/setup") return true;
  return false;
};

export const RouteGuard = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      // Don't do anything while loading the initial session
      if (isLoading) return;

      const isPublic = isPublicRoute(pathname);

      if (!isAuthenticated && !isPublic) {
        console.warn(`[Guard] Unauthorized access to ${pathname}. Redirecting to login.`);
        router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      } else if (isAuthenticated && (pathname === "/login" || pathname === "/register")) {
        // Redirect to dashboard if already logged in and trying to access auth pages
        router.push("/dashboard");
      } else {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [isAuthenticated, isLoading, pathname, router]);

  // Premium loading state while session is being restored or redirect is happening
  if (isLoading || (isChecking && !isPublicRoute(pathname))) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center p-6 text-center">
        <div className="relative mb-8">
           <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150 animate-pulse" />
           <Loader2 className="w-12 h-12 text-primary animate-spin relative z-10" />
        </div>
        <h2 className="text-xl font-display font-bold text-slate-900 mb-2">Syncing Your Ecosystem</h2>
        <p className="text-slate-500 font-medium max-w-xs mx-auto">Verifying your identity and securing your professional network...</p>
      </div>
    );
  }

  return <>{children}</>;
};
