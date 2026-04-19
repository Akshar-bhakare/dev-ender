"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Gift, 
  ArrowRight, 
  CheckCircle2, 
  Loader2, 
  Building2, 
  ShieldCheck,
  Zap
} from "lucide-react";
import { api } from "@/lib/api-client";
import { KaaMeNavbar } from "@/components/kaa-me/KaaMeNavbar";

function InviteContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  
  const [loading, setLoading] = useState(true);
  const [invite, setInvite] = useState<any>(null);
  const [accepting, setAccepting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (token) {
        verifyToken();
    } else {
        setLoading(false);
    }
  }, [token]);

  const verifyToken = async () => {
    try {
        const response = await api.get(`/company/invite/verify-token?token=${token}`);
        if (response.success) {
            setInvite(response.invite);
        }
    } catch (error) {
        console.error("Invalid token");
    } finally {
        setLoading(false);
    }
  };

  const handleAccept = async () => {
    setAccepting(true);
    try {
        const response = await api.post('/company/invite/accept', { token });
        if (response.success) {
            setSuccess(true);
            setTimeout(() => {
                router.push('/events');
            }, 3000);
        }
    } catch (error) {
        alert("Failed to accept invitation. Make sure you are logged in with the correct email.");
    } finally {
        setAccepting(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-40 grayscale opacity-50">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <span className="font-display font-bold text-xl lowercase">Verifying invitation...</span>
    </div>
  );

  if (!invite && !success) return (
    <div className="flex flex-col items-center justify-center py-40 text-center">
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mb-6">
            <ShieldCheck className="w-10 h-10" />
        </div>
        <h1 className="font-display font-bold text-3xl mb-2 lowercase">Invite Not Found</h1>
        <p className="text-slate-500 font-medium max-w-sm">This invitation link may have expired or was already used.</p>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto py-32">
        <AnimatePresence mode="wait">
        {!success ? (
            <motion.div 
              key="invite"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white border border-slate-100 rounded-[3rem] p-12 shadow-2xl relative overflow-hidden"
            >
                <div className="grain-filter absolute inset-0 opacity-5 pointer-events-none" />
                
                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-10">
                        <div className="w-16 h-16 bg-slate-900 text-white rounded-[1.5rem] flex items-center justify-center overflow-hidden">
                           {invite.companyId?.logoUrl ? (
                               <img src={invite.companyId.logoUrl} className="w-full h-full object-cover" />
                           ) : (
                               <Building2 className="w-8 h-8" />
                           )}
                        </div>
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-primary">Invitation Confirmed</span>
                            <h2 className="font-display font-bold text-4xl leading-tight lowercase">
                                Host for <span className="text-primary italic">{invite.companyId?.displayName}</span>
                            </h2>
                        </div>
                    </div>

                    <div className="bg-slate-50 rounded-3xl p-8 mb-10 border border-slate-100">
                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6">What you get</h3>
                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                                    <Zap className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900">+15 Trust Score Bonus</p>
                                    <p className="text-xs text-slate-500 font-medium">As a vouched representative of a verified organization.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                    <ShieldCheck className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900">Hosting Permissions</p>
                                    <p className="text-xs text-slate-500 font-medium">Create and manage events on behalf of {invite.companyId?.displayName}.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button 
                      onClick={handleAccept}
                      disabled={accepting}
                      className="w-full py-6 kaame-gradient text-white rounded-[2rem] font-display font-bold text-2xl shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4"
                    >
                        {accepting ? <Loader2 className="w-8 h-8 animate-spin" /> : <Gift className="w-8 h-8" />}
                        {accepting ? "Activating Role..." : "Accept & Get Bonus"}
                    </button>
                    
                    <p className="text-center text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-8">
                       Terms of delegation apply. Verification required for paid events.
                    </p>
                </div>
            </motion.div>
        ) : (
            <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-20"
            >
                <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-10">
                    <CheckCircle2 className="w-14 h-14" />
                </div>
                <h1 className="font-display font-bold text-5xl mb-4 lowercase tracking-tight">Permissions <span className="text-emerald-500 italic">Greanted</span>!</h1>
                <p className="text-slate-500 font-bold mb-10">Redirecting you to your new hosting console...</p>
                
                <div className="flex items-center justify-center gap-2">
                    {[1, 2, 3].map((i) => (
                        <motion.div 
                           key={i}
                           animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                           transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                           className="w-2 h-2 bg-emerald-500 rounded-full"
                        />
                    ))}
                </div>
            </motion.div>
        )}
        </AnimatePresence>
    </div>
  );
}

import { AnimatePresence } from "framer-motion";

export default function InviteAcceptPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] text-slate-900 selection:bg-cyan-100">
      <KaaMeNavbar />
      <Suspense fallback={<div className="pt-40 text-center font-bold">Loading...</div>}>
         <InviteContent />
      </Suspense>
    </div>
  );
}
