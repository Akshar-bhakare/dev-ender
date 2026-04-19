"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  Trash2, 
  Mail, 
  Clock, 
  AlertCircle,
  CheckCircle2,
  Loader2,
  Plus,
  ShieldAlert
} from "lucide-react";
import { api } from "@/lib/api-client";

interface Host {
  _id: string;
  userId: {
    _id: string;
    fullName: string;
    email: string;
    trustScore: number;
    identityVerified: boolean;
    role: string;
  };
  role: string;
  assignedAt: string;
}

interface PendingInvite {
  _id: string;
  email: string;
  role: string;
  status: string;
  expiresAt: string;
  isJoinInvite: boolean;
}

export default function CompanyHostingDashboard() {
  const [hosts, setHosts] = useState<Host[]>([]);
  const [invites, setInvites] = useState<PendingInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviting, setInviting] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"COMPANY_ADMIN" | "COMPANY_EVENT_HOST">("COMPANY_EVENT_HOST");
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    fetchHosts();
  }, []);

  const fetchHosts = async () => {
    try {
      const response = await api.get('/company/event-hosts');
      if (response.success) {
        setHosts(response.hosts);
        setInvites(response.pendingInvites);
      }
    } catch (error) {
      console.error("Failed to fetch hosts", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviting(true);
    setMessage(null);
    try {
      const response = await api.post('/company/invite-host', { email: inviteEmail, role: inviteRole });
      if (response.success) {
        setMessage({ type: 'success', text: response.message });
        setInviteEmail("");
        fetchHosts();
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error?.response?.data?.error?.message || "Failed to send invitation" });
    } finally {
      setInviting(false);
    }
  };

  const removeHost = async (id: string) => {
    if (!confirm("Are you sure you want to revoke hosting permissions for this user?")) return;
    try {
      await api.delete(`/company/event-hosts/${id}`);
      fetchHosts();
    } catch (error) {
      alert("Failed to remove host");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 grayscale opacity-50">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <span className="font-display font-bold text-xl">Loading Organization...</span>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <h1 className="font-display font-bold text-4xl mb-2 lowercase tracking-tight">
             Delegate <span className="text-primary italic">Hosting</span>
           </h1>
           <p className="text-slate-500 font-medium">Manage who can speak and organize events on behalf of your brand.</p>
        </div>
        
        {/* Quick Invite Card */}
        <form onSubmit={handleInvite} className="bg-white p-2 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-2 max-w-md w-full">
           <input 
             type="email" 
             required
             placeholder="Member Email..."
             className="flex-grow bg-transparent px-6 py-2 focus:outline-none font-bold text-sm"
             value={inviteEmail}
             onChange={(e) => setInviteEmail(e.target.value)}
           />
           <select 
             className="bg-slate-50 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl focus:outline-none border-none"
             value={inviteRole}
             onChange={(e) => setInviteRole(e.target.value as any)}
           >
              <option value="COMPANY_EVENT_HOST">Host</option>
              <option value="COMPANY_ADMIN">Admin</option>
           </select>
           <button 
             disabled={inviting}
             className="p-3 bg-slate-900 text-white rounded-2xl hover:bg-primary transition-all disabled:opacity-50"
           >
             {inviting ? <Loader2 className="w-5 h-5 animate-spin" /> : <UserPlus className="w-5 h-5" />}
           </button>
        </form>
      </div>

      {message && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-2xl flex items-center gap-3 text-sm font-bold ${message.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}
        >
           {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
           {message.text}
        </motion.div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Active Hosts */}
        <div className="space-y-6">
           <div className="flex items-center gap-3 px-2">
              <Users className="w-5 h-5 text-slate-400" />
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">Authorized Team</h2>
           </div>
           
           <div className="space-y-4">
              {hosts.map((host) => (
                <motion.div 
                  key={host._id}
                  layout 
                  className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between group"
                >
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center font-display font-bold text-slate-400 text-xl uppercase">
                        {host.userId.fullName[0]}
                      </div>
                      <div>
                         <div className="flex items-center gap-2">
                            <h3 className="font-bold text-slate-900">{host.userId.fullName}</h3>
                            {host.userId.identityVerified && (
                                <div className="p-0.5 bg-emerald-50 text-emerald-600 rounded">
                                   <ShieldCheck className="w-3.5 h-3.5" />
                                </div>
                            )}
                         </div>
                         <div className="flex items-center gap-3 mt-1">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-100 px-2 py-0.5 rounded-lg">
                               {host.role === 'COMPANY_ADMIN' ? 'Admin' : 'Host'}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                               <Clock className="w-3 h-3" />
                               Joined {new Date(host.assignedAt).toLocaleDateString()}
                            </span>
                         </div>
                      </div>
                   </div>
                   
                   <div className="flex items-center gap-2">
                      <div className="text-right mr-4">
                         <div className="text-xs font-black text-slate-900">{host.userId.trustScore}</div>
                         <div className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter">Trust Core</div>
                      </div>
                      <button 
                        onClick={() => removeHost(host._id)}
                        className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                      >
                         <Trash2 className="w-4 h-4" />
                      </button>
                   </div>
                </motion.div>
              ))}
              
              {hosts.length === 0 && (
                <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] p-12 text-center">
                   <p className="text-sm font-bold text-slate-400 italic">No assigned hosts yet.</p>
                </div>
              )}
           </div>
        </div>

        {/* Pending Invitations */}
        <div className="space-y-6">
           <div className="flex items-center gap-3 px-2">
              <Mail className="w-5 h-5 text-slate-400" />
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">Sent Invitations</h2>
           </div>

           <div className="space-y-4">
              {invites.map((invite) => (
                <div key={invite._id} className="bg-slate-50 border border-slate-100 p-6 rounded-[2rem] flex items-center justify-between">
                   <div className="flex items-center gap-4 opacity-70">
                      <div className="w-10 h-10 bg-white shadow-sm rounded-xl flex items-center justify-center">
                         <Mail className="w-4 h-4 text-slate-400" />
                      </div>
                      <div>
                         <h3 className="font-bold text-sm text-slate-600">{invite.email}</h3>
                         <div className="flex items-center gap-3 mt-1">
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                               {invite.role === 'COMPANY_ADMIN' ? 'Admin' : 'Host'}
                            </span>
                            {invite.isJoinInvite && (
                                <span className="text-[9px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded-lg">
                                   Join Invitation
                                </span>
                            )}
                         </div>
                      </div>
                   </div>
                   <div className="text-right">
                      <span className="text-[9px] font-black uppercase tracking-widest text-amber-500 bg-amber-50 px-3 py-1 rounded-full">
                         Pending
                      </span>
                   </div>
                </div>
              ))}

              {invites.length === 0 && (
                <div className="bg-slate-50/50 border border-slate-100 rounded-[2rem] p-12 text-center">
                   <p className="text-sm font-bold text-slate-300">No pending invites.</p>
                </div>
              )}
           </div>
        </div>
      </div>

      {/* Trust Reminder */}
      <div className="bg-slate-900 rounded-[3rem] p-10 relative overflow-hidden group">
         <div className="grain-filter absolute inset-0 opacity-10 pointer-events-none" />
         <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            <div className="p-5 bg-primary/10 rounded-[2rem] text-primary">
               <ShieldAlert className="w-10 h-10" />
            </div>
            <div>
               <h3 className="font-display font-black text-2xl text-white lowercase">The Trust Guard</h3>
               <p className="text-slate-400 font-medium max-w-xl text-sm mt-1">
                 Delegating hosting permission allows members to organize events for your company. However, **publishing paid events** still requires individual identity verification and a trust score of 60+ for each representative.
               </p>
            </div>
            <button className="md:ml-auto px-8 py-4 bg-white text-slate-900 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-primary hover:text-white transition-all">
               View Trust Core
            </button>
         </div>
      </div>
    </div>
  );
}
