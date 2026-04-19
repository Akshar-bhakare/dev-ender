"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { KaaMeNavbar } from "@/components/kaa-me/KaaMeNavbar";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck, MapPin, Link as LinkIcon, Calendar, Edit3, Save, Plus, X,
  Briefcase, GraduationCap, Star, ExternalLink, Users, UserPlus, Check, ArrowLeft, ImageOff, TrendingUp
} from "lucide-react";
import { useState, useEffect } from "react";
import { PostCard } from "@/components/kaa-me/PostCard";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.userId as string;
  const { user: me, refetchUser } = useAuth();

  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSelf, setIsSelf] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState<"posts" | "about" | "hosted">("posts");
  const [hostedEvents, setHostedEvents] = useState<any[]>([]);
  
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyStep, setVerifyStep] = useState<'start' | 'face' | 'doc' | 'success'>('start');

  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [draft, setDraft] = useState<any>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const response: any = await api.get(`/users/${userId}`);
        const data = response;
        setProfile(data.user);
        setPosts(data.posts || []);
        setIsFollowing(data.user.isFollowing || false);
        setIsSelf(me?._id?.toString() === userId || me?._id?.toString() === data.user._id?.toString());
        
        // Load events for this host (demo logic using imported mock data)
        try {
          const eventsData = (await import("@/mock-data/events.json")).default;
          const myEvents = eventsData.filter((e: any) => e.hostId === userId);
          setHostedEvents(myEvents);
        } catch (err) {
          console.warn("Mock events not found", err);
        }
      } catch (err) {
        console.error("Failed to load profile", err);
        setProfile(null);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [userId, me]);

  const startEdit = (section: string) => { setDraft({ ...profile }); setEditingSection(section); };
  const cancelEdit = () => setEditingSection(null);

  const saveEdit = async () => {
    setSaving(true);
    try {
      const res: any = await api.patch('/users/me', draft);
      setProfile((prev: any) => ({ ...prev, ...res.user }));
      setEditingSection(null);
      if (isSelf) refetchUser();
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const handleFollow = async () => {
    try {
      if (isFollowing) {
        await api.post(`/users/${profile._id}/unfollow`, {});
        setIsFollowing(false);
        setProfile((p: any) => ({ ...p, followersCount: Math.max(0, (p.followersCount || 1) - 1) }));
      } else {
        await api.post(`/users/${profile._id}/follow`, {});
        setIsFollowing(true);
        setProfile((p: any) => ({ ...p, followersCount: (p.followersCount || 0) + 1 }));
      }
    } catch {}
  };

  const handleFaceVerification = async () => {
    try {
      await api.post('/auth/verify-face', {});
      setVerifyStep('doc');
    } catch (err) {
      console.error("Face verification failed", err);
    }
  };

  const handleDocVerification = async () => {
    try {
      // For demo, we send a mock multipart request
      const fd = new FormData();
      fd.append('nationality', 'IN');
      fd.append('docType', 'Passport');
      fd.append('file', new Blob(['fake-img'], { type: 'image/jpeg' }), 'doc.jpg');

      await api.post('/auth/verify-doc', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      handleVerificationComplete();
    } catch (err) {
      console.error("Doc verification failed", err);
    }
  };

  const handleVerificationComplete = () => {
    setVerifyStep('success');
    // Reload user data after a delay
    setTimeout(async () => {
      const response: any = await api.get(`/users/${userId}`);
      setProfile(response.user);
      if (isSelf) refetchUser();
      setShowVerifyModal(false);
    }, 2000);
  };

  const addExperience = () => setDraft((d: any) => ({
    ...d, experience: [...(d.experience || []), { title: "", company: "", startYear: new Date().getFullYear(), current: true, description: "" }]
  }));

  const addEducation = () => setDraft((d: any) => ({
    ...d, education: [...(d.education || []), { school: "", degree: "", field: "", startYear: new Date().getFullYear() }]
  }));

  const removeItem = (key: "experience" | "education", idx: number) =>
    setDraft((d: any) => ({ ...d, [key]: d[key].filter((_: any, i: number) => i !== idx) }));

  const updateItem = (key: "experience" | "education", idx: number, field: string, value: any) =>
    setDraft((d: any) => ({ ...d, [key]: d[key].map((item: any, i: number) => i === idx ? { ...item, [field]: value } : item) }));

  if (isLoading) return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!profile) return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <KaaMeNavbar />
      <div className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h1 className="text-2xl font-bold text-slate-900">User not found</h1>
      </div>
    </div>
  );

  const isVerified = profile.identityVerified || profile.faceVerified || profile.kycStatus === 'verified';

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-slate-900">
      <KaaMeNavbar />

      {/* Sticky save bar when editing */}
      {editingSection && (
        <div className="sticky top-[65px] z-40 bg-white border-b border-slate-200 shadow-sm px-6 py-3 flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-700">
            Editing <span className="text-primary capitalize">{editingSection}</span>
          </span>
          <div className="flex gap-2">
            <button onClick={cancelEdit} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all">
              Cancel
            </button>
            <button onClick={saveEdit} disabled={saving} className="px-5 py-2 bg-primary text-white rounded-xl text-sm font-bold hover:opacity-90 disabled:opacity-50 flex items-center gap-2 transition-all">
              <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      )}

      <main className="max-w-4xl mx-auto px-4 md:px-6 py-8 space-y-5">

        {/* Verification Banner for Self */}
        {isSelf && !isVerified && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-6 bg-gradient-to-r from-slate-900 to-slate-800 rounded-[2rem] text-white flex items-center justify-between shadow-xl"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <h3 className="font-bold text-lg tracking-tight">Verify your identity</h3>
                <p className="text-slate-400 text-sm">Get the "Legit" status and unlock all features.</p>
              </div>
            </div>
            <button 
              onClick={() => { setShowVerifyModal(true); setVerifyStep('start'); }}
              className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-900 rounded-xl font-bold text-sm transition-all active:scale-95"
            >
              Start Verification
            </button>
          </motion.div>
        )}

        {/* Back button */}
        <button onClick={() => router.push('/feed')} className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Feed
        </button>

        {/* Hero Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden shadow-sm">
          <div className="h-44 kaame-gradient relative">
            <div className="grain-filter absolute inset-0 pointer-events-none opacity-40" />
          </div>

          <div className="px-8 pb-8">
            <div className="flex items-end justify-between -mt-14 mb-6">
              <div className="relative">
                <div className="w-28 h-28 rounded-[1.75rem] border-4 border-white overflow-hidden shadow-xl bg-white">
                  <img src={profile.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.fullName || profile.name}`} alt={profile.fullName} className="w-full h-full object-cover" />
                </div>
                {isVerified && (
                  <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-md" title="Verified Member">
                    <ShieldCheck className="w-5 h-5 text-cyan-500 fill-cyan-500/20" />
                  </div>
                )}
              </div>

              <div className="flex gap-2 pb-1">
                {isSelf ? (
                  <div className="flex items-center gap-3">
                    {['company_admin', 'company_event_host', 'company_owner'].includes(profile.role) && (
                        <div className="hidden md:flex flex-col items-end mr-4">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Host Performance</span>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-emerald-600">98% Satisfied</span>
                                <div className="w-1 h-1 bg-slate-300 rounded-full" />
                                <span className="text-sm font-bold text-slate-900">4.9/5</span>
                            </div>
                        </div>
                    )}
                    <button
                      onClick={() => editingSection === "hero" ? saveEdit() : startEdit("hero")}
                      className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-primary transition-all shadow-sm"
                    >
                      {editingSection === "hero" ? <><Save className="w-4 h-4" /> Save</> : <><Edit3 className="w-4 h-4" /> Edit Profile</>}
                    </button>
                  </div>
                ) : (
                  <>
                    <button onClick={handleFollow} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm ${isFollowing ? 'bg-slate-100 text-slate-700 hover:bg-red-50 hover:text-red-500' : 'bg-slate-900 text-white hover:bg-primary'}`}>
                      {isFollowing ? <><Check className="w-4 h-4" /> Following</> : <><UserPlus className="w-4 h-4" /> Follow</>}
                    </button>
                    <button onClick={() => api.post(`/users/${profile._id}/connect`, {}).catch(() => {})} className="flex items-center gap-2 px-5 py-2.5 border-2 border-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:border-primary hover:text-primary transition-all">
                      <Users className="w-4 h-4" /> Connect
                    </button>
                  </>
                )}
              </div>
            </div>

            {editingSection === "hero" ? (
              <div className="space-y-3">
                <input value={draft.fullName || ""} onChange={e => setDraft((d: any) => ({ ...d, fullName: e.target.value }))} placeholder="Full Name" className="text-2xl font-bold w-full border-b-2 border-primary focus:outline-none bg-transparent text-slate-900 pb-1" />
                <div className="grid grid-cols-2 gap-3 pt-1">
                  {[
                    { key: "jobTitle", placeholder: "Job Title" },
                    { key: "currentCompany", placeholder: "Company" },
                    { key: "location", placeholder: "Location" },
                    { key: "website", placeholder: "Website URL" },
                  ].map(f => (
                    <input key={f.key} value={draft[f.key] || ""} onChange={e => setDraft((d: any) => ({ ...d, [f.key]: e.target.value }))} placeholder={f.placeholder} className="p-3 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 bg-slate-50" />
                  ))}
                  <input value={draft.linkedInUrl || ""} onChange={e => setDraft((d: any) => ({ ...d, linkedInUrl: e.target.value }))} placeholder="LinkedIn URL" className="p-3 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 bg-slate-50 col-span-2" />
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h1 className="text-2xl font-display font-bold text-slate-900">{profile.fullName || profile.name}</h1>
                  {isVerified && <span className="text-[10px] font-bold bg-cyan-500/10 text-cyan-600 px-2 py-0.5 rounded-full border border-cyan-500/20">✔ Legit Verified</span>}
                  {['company_admin', 'company_event_host', 'company_owner'].includes(profile.role) && (
                    <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/20 flex items-center gap-1">
                      <Star className="w-3 h-3 fill-primary" /> Verified Host
                    </span>
                  )}
                </div>
                <p className="text-base text-slate-600 font-medium mt-0.5">
                  {profile.jobTitle}{profile.currentCompany ? <span className="text-slate-400"> @ {profile.currentCompany}</span> : ""}
                </p>
                <div className="flex flex-wrap gap-4 mt-3 text-sm text-slate-500 font-medium">
                  {profile.location && <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-slate-400" />{profile.location}</span>}
                  {profile.website && <a href={profile.website} target="_blank" className="flex items-center gap-1.5 text-primary hover:underline"><LinkIcon className="w-4 h-4" />{profile.website}</a>}
                  {profile.linkedInUrl && <a href={profile.linkedInUrl} target="_blank" className="flex items-center gap-1.5 text-blue-600 hover:underline"><ExternalLink className="w-4 h-4" />LinkedIn</a>}
                  <span className="flex items-center gap-1.5 text-slate-400"><Calendar className="w-4 h-4" />Joined {new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "Followers", value: profile.followersCount ?? profile.followers?.length ?? 0 },
            { label: "Following", value: profile.followingCount ?? profile.following?.length ?? 0 },
            { label: "Trust Score", value: `${profile.trustScore ?? 0}/100` },
            { label: "Trust Level", value: profile.trustLevel ?? "low" },
          ].map(s => (
            <div key={s.label} className="bg-white border border-slate-100 rounded-2xl p-4 text-center shadow-sm">
              <div className="text-xl font-display font-bold text-slate-900 capitalize">{s.value}</div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white border border-slate-100 rounded-2xl p-1.5 shadow-sm w-fit">
          {(["posts", "about", "hosted"] as const).map(tab => {
            if (tab === 'hosted' && !['company_admin', 'company_event_host', 'company_owner'].includes(profile.role)) return null;
            return (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-2.5 rounded-xl text-sm font-bold capitalize transition-all ${activeTab === tab ? 'bg-primary text-white shadow-sm' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}>
                {tab === "posts" ? `Posts (${posts.length})` : tab === "hosted" ? `Events Hosted (${hostedEvents.length})` : "About"}
              </button>
            );
          })}
        </div>

        {/* Posts Tab */}
        {activeTab === "posts" && (
          <div className="space-y-4">
            {posts.length === 0 ? (
              <div className="bg-white border border-slate-100 rounded-[2rem] p-16 text-center shadow-sm">
                <p className="text-slate-500 font-semibold text-base">No posts yet.</p>
                <p className="text-slate-400 text-sm mt-1">Posts will appear here once published.</p>
              </div>
            ) : posts.map((post: any) => (
              <PostCard key={post._id} post={post} user={post.author || profile} />
            ))}
          </div>
        )}

        {/* Hosted Tab */}
        {activeTab === "hosted" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {hostedEvents.length === 0 ? (
              <div className="col-span-full bg-white border border-slate-100 rounded-[2rem] p-16 text-center shadow-sm">
                <p className="text-slate-500 font-semibold text-base">No hosted events yet.</p>
              </div>
            ) : hostedEvents.map((event: any) => (
              <Link key={event.id} href={`/events/${event.id}`}>
                <div className="bg-white border border-slate-100 rounded-[2rem] overflow-hidden group shadow-sm hover:shadow-md transition-all cursor-pointer">
                   <div className="h-32 overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                      {event.image ? (
                        <img src={event.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      ) : (
                        <div className="opacity-10">
                           <ImageOff className="w-6 h-6" />
                        </div>
                      )}
                   </div>
                   <div className="p-6">
                      <h4 className="font-bold text-slate-900 group-hover:text-primary transition-colors line-clamp-1">{event.title}</h4>
                      <p className="text-xs text-slate-400 mt-1 font-medium">{event.date}</p>
                   </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {activeTab === "about" && (
          <div className="space-y-4">

            {/* About / Bio */}
            <Section title="About" icon={<Star className="w-4 h-4 text-amber-500" />} onEdit={isSelf && editingSection !== "about" ? () => startEdit("about") : undefined}>
              {editingSection === "about" ? (
                <textarea
                  value={draft.bio || ""}
                  onChange={e => setDraft((d: any) => ({ ...d, bio: e.target.value }))}
                  rows={5}
                  placeholder="Tell people about yourself..."
                  className="w-full p-4 border border-slate-200 rounded-2xl text-sm text-slate-800 leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none bg-slate-50"
                />
              ) : (
                <p className="text-slate-700 leading-relaxed text-sm">
                  {profile.bio || <span className="text-slate-400 italic">No bio added yet.</span>}
                </p>
              )}
            </Section>

            {/* Skills */}
            <Section title="Skills" icon={<Star className="w-4 h-4 text-primary" />} onEdit={isSelf && editingSection !== "skills" ? () => startEdit("skills") : undefined}>
              {editingSection === "skills" ? (
                <div className="space-y-2">
                  <input
                    value={(draft.skills || []).join(", ")}
                    onChange={e => setDraft((d: any) => ({ ...d, skills: e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean) }))}
                    placeholder="React, Node.js, Python, Leadership..."
                    className="w-full p-4 border border-slate-200 rounded-2xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 bg-slate-50"
                  />
                  <p className="text-xs text-slate-400 pl-1">Separate skills with commas</p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {(profile.skills || []).length === 0
                    ? <span className="text-slate-400 italic text-sm">No skills added yet.</span>
                    : (profile.skills || []).map((s: string) => (
                      <span key={s} className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-bold border border-primary/20">{s}</span>
                    ))}
                </div>
              )}
            </Section>

            {/* Experience */}
            <Section title="Experience" icon={<Briefcase className="w-4 h-4 text-slate-600" />} onEdit={isSelf && editingSection !== "experience" ? () => startEdit("experience") : undefined}>
              {editingSection === "experience" ? (
                <div className="space-y-4">
                  {(draft.experience || []).map((exp: any, i: number) => (
                    <div key={i} className="p-4 border-2 border-slate-100 rounded-2xl space-y-3 relative bg-slate-50">
                      <button onClick={() => removeItem("experience", i)} className="absolute top-3 right-3 p-1 text-slate-300 hover:text-red-400 hover:bg-red-50 rounded-lg transition-all"><X className="w-4 h-4" /></button>
                      <div className="grid grid-cols-2 gap-2 pr-8">
                        <input value={exp.title} onChange={e => updateItem("experience", i, "title", e.target.value)} placeholder="Job Title" className="p-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white" />
                        <input value={exp.company} onChange={e => updateItem("experience", i, "company", e.target.value)} placeholder="Company" className="p-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white" />
                        <input type="number" value={exp.startYear} onChange={e => updateItem("experience", i, "startYear", Number(e.target.value))} placeholder="Start Year" className="p-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white" />
                        {!exp.current && <input type="number" value={exp.endYear || ""} onChange={e => updateItem("experience", i, "endYear", Number(e.target.value))} placeholder="End Year" className="p-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white" />}
                      </div>
                      <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer font-medium">
                        <input type="checkbox" checked={exp.current} onChange={e => updateItem("experience", i, "current", e.target.checked)} className="rounded accent-primary" />
                        Currently working here
                      </label>
                      <textarea value={exp.description || ""} onChange={e => updateItem("experience", i, "description", e.target.value)} placeholder="Description (optional)" rows={2} className="w-full p-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none bg-white" />
                    </div>
                  ))}
                  <button onClick={addExperience} className="flex items-center gap-2 text-sm text-primary font-bold hover:underline mt-1">
                    <Plus className="w-4 h-4" /> Add Experience
                  </button>
                </div>
              ) : (
                <div className="space-y-5">
                  {(profile.experience || []).length === 0
                    ? <span className="text-slate-400 italic text-sm">No experience added yet.</span>
                    : (profile.experience || []).map((exp: any, i: number) => (
                      <div key={i} className="flex gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Briefcase className="w-5 h-5 text-slate-500" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm">{exp.title}</h4>
                          <p className="text-sm text-slate-600 font-medium">{exp.company}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{exp.startYear} — {exp.current ? "Present" : exp.endYear}</p>
                          {exp.description && <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">{exp.description}</p>}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </Section>

            {/* Education */}
            <Section title="Education" icon={<GraduationCap className="w-4 h-4 text-slate-600" />} onEdit={isSelf && editingSection !== "education" ? () => startEdit("education") : undefined}>
              {editingSection === "education" ? (
                <div className="space-y-4">
                  {(draft.education || []).map((edu: any, i: number) => (
                    <div key={i} className="p-4 border-2 border-slate-100 rounded-2xl space-y-2 relative bg-slate-50">
                      <button onClick={() => removeItem("education", i)} className="absolute top-3 right-3 p-1 text-slate-300 hover:text-red-400 hover:bg-red-50 rounded-lg transition-all"><X className="w-4 h-4" /></button>
                      <div className="grid grid-cols-2 gap-2 pr-8">
                        <input value={edu.school} onChange={e => updateItem("education", i, "school", e.target.value)} placeholder="School / University" className="p-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 col-span-2 bg-white" />
                        <input value={edu.degree} onChange={e => updateItem("education", i, "degree", e.target.value)} placeholder="Degree (e.g. B.Tech)" className="p-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white" />
                        <input value={edu.field} onChange={e => updateItem("education", i, "field", e.target.value)} placeholder="Field of Study" className="p-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white" />
                        <input type="number" value={edu.startYear} onChange={e => updateItem("education", i, "startYear", Number(e.target.value))} placeholder="Start Year" className="p-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white" />
                        <input type="number" value={edu.endYear || ""} onChange={e => updateItem("education", i, "endYear", Number(e.target.value))} placeholder="End Year" className="p-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white" />
                      </div>
                    </div>
                  ))}
                  <button onClick={addEducation} className="flex items-center gap-2 text-sm text-primary font-bold hover:underline mt-1">
                    <Plus className="w-4 h-4" /> Add Education
                  </button>
                </div>
              ) : (
                <div className="space-y-5">
                  {(profile.education || []).length === 0
                    ? <span className="text-slate-400 italic text-sm">No education added yet.</span>
                    : (profile.education || []).map((edu: any, i: number) => (
                      <div key={i} className="flex gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <GraduationCap className="w-5 h-5 text-slate-500" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm">{edu.school}</h4>
                          <p className="text-sm text-slate-600 font-medium">{edu.degree}{edu.field ? `, ${edu.field}` : ""}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{edu.startYear}{edu.endYear ? ` — ${edu.endYear}` : ""}</p>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </Section>

          </div>
        )}
      </main>

      {/* Verification Modal */}
      <AnimatePresence>
      {showVerifyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-[3rem] w-full max-w-lg overflow-hidden relative shadow-2xl"
          >
            <button 
              onClick={() => setShowVerifyModal(false)}
              className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-10">
              {verifyStep === 'start' && (
                <div className="text-center space-y-6">
                  <div className="w-20 h-20 bg-cyan-100 rounded-[2rem] flex items-center justify-center mx-auto">
                    <ShieldCheck className="w-10 h-10 text-cyan-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">Become a "Legit" Member</h2>
                    <p className="text-slate-500 mt-2">To ensure a safe community, we require a quick face scan and document check.</p>
                  </div>
                  <div className="space-y-3 text-left">
                    <div className="flex gap-3 p-4 bg-slate-50 rounded-2xl">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                        <TrendingUp className="w-5 h-5 text-cyan-500" />
                      </div>
                      <div>
                        <p className="font-bold text-sm">Face Match</p>
                        <p className="text-xs text-slate-400">Verify it's really you behind the screen.</p>
                      </div>
                    </div>
                    <div className="flex gap-3 p-4 bg-slate-50 rounded-2xl">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                        <MapPin className="w-5 h-5 text-cyan-500" />
                      </div>
                      <div>
                        <p className="font-bold text-sm">Government ID</p>
                        <p className="text-xs text-slate-400">Aadhaar, Passport or License.</p>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => setVerifyStep('face')}
                    className="w-full py-4 bg-slate-900 text-white rounded-[1.5rem] font-bold shadow-xl hover:shadow-slate-900/20 active:scale-95 transition-all"
                  >
                    Continue to Face Scan
                  </button>
                </div>
              )}

              {verifyStep === 'face' && (
                <div className="text-center space-y-6">
                  <h2 className="text-xl font-bold">Step 1: Face Scan</h2>
                  <div className="aspect-square w-full max-w-[280px] mx-auto bg-slate-100 rounded-full border-4 border-dashed border-slate-200 flex items-center justify-center relative overflow-hidden">
                    <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=300" className="w-full h-full object-cover grayscale opacity-50" alt="demo" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="p-4 bg-white/90 backdrop-blur rounded-2xl shadow-lg flex flex-col items-center">
                        <TrendingUp className="w-8 h-8 text-cyan-500 animate-pulse" />
                        <p className="text-xs font-bold mt-2">AI Face Scanning...</p>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={handleFaceVerification}
                    className="w-full py-4 bg-slate-900 text-white rounded-[1.5rem] font-bold"
                  >
                    Simulate Capture
                  </button>
                </div>
              )}

              {verifyStep === 'doc' && (
                <div className="text-center space-y-6">
                  <h2 className="text-xl font-bold">Step 2: Document Upload</h2>
                  <div className="w-full h-48 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-6 cursor-pointer hover:bg-slate-100 transition-colors">
                    <Calendar className="w-10 h-10 text-slate-300 mb-2" />
                    <p className="text-sm font-bold text-slate-400">Upload ID Front Page</p>
                    <p className="text-xs text-slate-300">Supports JPG, PNG up to 5MB</p>
                  </div>
                  <button 
                    onClick={handleDocVerification}
                    className="w-full py-4 bg-cyan-500 text-slate-900 rounded-[1.5rem] font-bold"
                  >
                    Submit for Review
                  </button>
                </div>
              )}

              {verifyStep === 'success' && (
                <div className="text-center space-y-6 py-10">
                  <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                    <ShieldCheck className="w-12 h-12 text-emerald-600" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-slate-900">You are Legit! 🚀</h2>
                    <p className="text-slate-500 mt-2">Your identity has been verified by our AI.</p>
                  </div>
                  <div className="p-4 bg-emerald-50 rounded-2xl text-emerald-700 font-bold text-sm">
                    Status: Verified Member
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
      </AnimatePresence>
    </div>
  );
}

function Section({ title, icon, children, onEdit }: { title: string; icon: React.ReactNode; children: React.ReactNode; onEdit?: () => void }) {
  return (
    <div className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-display font-bold text-slate-900 text-base flex items-center gap-2">{icon}{title}</h3>
        {onEdit && (
          <button onClick={onEdit} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-primary hover:bg-primary/5 rounded-xl transition-all border border-slate-200 hover:border-primary/30">
            <Edit3 className="w-3.5 h-3.5" /> Edit
          </button>
        )}
      </div>
      {children}
    </div>
  );
}
