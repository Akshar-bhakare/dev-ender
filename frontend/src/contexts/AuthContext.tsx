"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";

interface UserProfile {
  _id: string;
  uid: string;
  fullName?: string;
  email: string;
  role: string;
  status: string;
  trustScore: number;
  permissionTier: number;
  badges: string[];
  identityVerified: boolean;
  linkedInConnected: boolean;
  avatar?: string;
}

interface CompanyProfile {
  _id: string;
  legalName: string;
  displayName: string;
  status: string;
  trustScore: number;
  permissionTier: number;
  badges: string[];
  verificationStatus: string;
}

interface AuthContextType {
  user: UserProfile | null;
  company: CompanyProfile | null;
  accountType: 'user' | 'company' | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: any) => void;
  logout: () => void;
  refetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [company, setCompany] = useState<CompanyProfile | null>(null);
  const [accountType, setAccountType] = useState<'user' | 'company' | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  const refetchUser = async () => {
    try {
      const token = localStorage.getItem("syncup_token");
      if (!token) {
        throw new Error("No token");
      }
      // Use the newly created /auth/me endpoint
      const response: any = await api.get("/auth/me");
      if (response && response.success) {
        setIsAuthenticated(true);
        setAccountType(response.accountType || 'user');
        if (response.accountType === 'company') {
          setCompany(response.user); 
        } else {
          setUser(response.user);
        }
      }
    } catch (error: any) {
      // Don't clutter console if user is just unauthenticated or backend is temporarily down
      const isUnauthenticated = error?.message === "No token" || error?.response?.status === 401;
      const isNetworkError = !error?.response && error?.message?.toLowerCase().includes("network");
      
      if (!isUnauthenticated && !isNetworkError) {
        console.error("Failed to refetch user session", error);
      }
      setIsAuthenticated(false);
      setUser(null);
      setCompany(null);
      localStorage.removeItem("syncup_token");
      localStorage.removeItem("syncup_refresh_token");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refetchUser();
  }, []);

  const login = (data: any) => {
    localStorage.setItem("syncup_token", data.token);
    if (data.refreshToken) {
      localStorage.setItem("syncup_refresh_token", data.refreshToken);
    }
    
    // Explicitly set the profile based on the login response
    setIsAuthenticated(true);
    if (data.profile) {
      if (data.profile.legalName) { // cheap check if it's a company
        setAccountType('company');
        setCompany(data.profile);
      } else {
        setAccountType('user');
        setUser(data.profile);
      }
    } else {
      refetchUser(); // Fallback to fetching it
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (e) {} // ignore if failed
    localStorage.removeItem("syncup_token");
    localStorage.removeItem("syncup_refresh_token");
    localStorage.removeItem("signupSessionToken");
    setIsAuthenticated(false);
    setUser(null);
    setCompany(null);
    setAccountType(null);
    router.push("/login"); // redirect to login
  };

  return (
    <AuthContext.Provider value={{ user, company, accountType, isAuthenticated, isLoading, login, logout, refetchUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
