"use client";

import { motion, AnimatePresence } from "framer-motion";
import { KaaMeNavbar } from "@/components/kaa-me/KaaMeNavbar";
import { PostCard } from "@/components/kaa-me/PostCard";
import { Briefcase, Users, Star, TrendingUp, ShieldCheck, Zap, Image as ImageIcon, X, CheckCircle, Clock, Building2, Calendar, Handshake, DollarSign } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";

const OPPORTUNITY_TAGS = [
  { value: "hiring", label: "Hiring", icon: Briefcase, color: "bg-blue-50 text-blue-600 border-blue-200" },
  { value: "seeking_funding", label: "Seeking Funding", icon: DollarSign, color: "bg-green-50 text-green-600 border-green-200" },
  { value: "hosting_event", label: "Hosting Event", icon: Calendar, color: "bg-purple-50 text-purple-600 border-purple-200" },
  { value: "looking_for_partners", label: "Looking for Partners", icon: Handshake, color: "bg-orange-50 text-orange-600 border-orange-200" },
];

export default function FeedPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const postInputRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [caption, setCaption] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [opportunityTag, setOpportunityTag] = useState<string | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPosting, setIsPosting] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);

  const fetchFeed = useCallback(async (cursor?: string) => {
    try {
      const params = cursor ? `?cursor=${cursor}` : '';
      const res: any = await api.get(`/posts${params}`);
      if (cursor) {
        setPosts(prev => [...prev, ...res.posts]);
      } else {
        setPosts(res.posts || []);
      }
      setNextCursor(res.nextCursor);
    } catch (err) {
      console.error("Failed to fetch feed", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchSuggestions = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res: any = await api.get('/users/recommendations');
      setSuggestions(Array.isArray(res) ? res : []);
    } catch {}
  }, [isAuthenticated]);

  useEffect(() => {
    fetchFeed();
    fetchSuggestions();
  }, [fetchFeed, fetchSuggestions]);

  const handlePost = async () => {
    if (!caption.trim() || isPosting) return;
    setIsPosting(true);
    try {
      const newPost: any = await api.post('/posts', {
        content: caption,
        mediaUrls: selectedImage ? [selectedImage] : [],
        opportunityTag: opportunityTag || null,
      });
      setPosts(prev => [newPost, ...prev]);
      setCaption("");
      setSelectedImage(null);
      setOpportunityTag(null);
    } catch (err) {
      console.error("Failed to create post", err);
    } finally {
      setIsPosting(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setSelectedImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleFollow = async (userId: string) => {
    try {
      await api.post(`/users/${userId}/follow`, {});
      setSuggestions(prev => prev.filter(u => u._id !== userId));
    } catch {}
  };

  const trustBadges = user ? [
    { label: "Face Verified", done: user.faceVerified ?? (user as any).identityVerified, icon: ShieldCheck },
    { label: "Govt ID", done: (user as any).documentVerificationStatus === 'verified', icon: CheckCircle },
  ] : [];

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-slate-900">
      <KaaMeNavbar />

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* Left Sidebar — sticky */}
        <aside className="lg:col-span-3 space-y-4 lg:sticky lg:top-[80px]">
          {/* Profile Card */}
          <div className="bg-white border border-slate-100 rounded-[2rem] overflow-hidden shadow-sm">
            {/* Mini cover */}
            <div className="h-16 kaame-gradient relative">
              <div className="grain-filter absolute inset-0 pointer-events-none opacity-40" />
            </div>
            <div className="px-5 pb-5 relative">
              <div className="-mt-8 mb-3">
                <div className="w-16 h-16 rounded-2xl border-4 border-white overflow-hidden shadow-lg bg-white">
                  <img src={user?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100"} alt="Me" className="w-full h-full object-cover" />
                </div>
              </div>
              <h2 className="font-display font-bold text-base mb-0.5">{user?.fullName || "Your Name"}</h2>
              <p className="text-xs font-medium text-slate-500">{(user as any)?.jobTitle || "Professional"}</p>
              {(user as any)?.currentCompany && <p className="text-xs text-slate-400">{(user as any).currentCompany}</p>}

              {/* Followers row */}
              <div className="flex gap-4 mt-3 pt-3 border-t border-slate-50">
                <div className="text-center">
                  <div className="text-sm font-bold text-slate-900">{(user as any)?.followers?.length ?? 0}</div>
                  <div className="text-[10px] text-slate-400 font-medium">Followers</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-bold text-slate-900">{(user as any)?.following?.length ?? 0}</div>
                  <div className="text-[10px] text-slate-400 font-medium">Following</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-bold text-primary">{(user as any)?.trustScore ?? 0}</div>
                  <div className="text-[10px] text-slate-400 font-medium">Trust</div>
                </div>
              </div>

              {/* Trust badges */}
              <div className="space-y-1.5 mt-3 pt-3 border-t border-slate-50">
                {trustBadges.map(b => (
                  <div key={b.label} className="flex items-center gap-2 text-xs">
                    <b.icon className={`w-3.5 h-3.5 ${b.done ? 'text-green-500' : 'text-slate-300'}`} />
                    <span className={b.done ? 'text-slate-700' : 'text-slate-400'}>{b.label}</span>
                    {b.done ? <span className="ml-auto text-green-500 font-bold text-[10px]">✓</span> : <span className="ml-auto text-slate-300 text-[10px]">Pending</span>}
                  </div>
                ))}
              </div>

              {/* Skills preview */}
              {(user as any)?.skills?.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-50">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Skills</p>
                  <div className="flex flex-wrap gap-1">
                    {((user as any).skills as string[]).slice(0, 4).map((s: string) => (
                      <span key={s} className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-[10px] font-bold">{s}</span>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={() => user && router.push(`/profile/${user._id}`)}
                className="w-full mt-4 py-2 text-xs font-bold text-primary hover:bg-primary/5 rounded-xl transition-colors border border-primary/20"
              >
                View Full Profile
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm">
            <h3 className="font-display font-bold text-sm mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" /> Quick Actions
            </h3>
            <div className="space-y-1">
              {[
                { label: "Create Post", icon: TrendingUp, action: () => postInputRef.current?.scrollIntoView({ behavior: 'smooth' }) },
                { label: "Create Event", icon: Calendar, action: () => router.push('/events') },
                { label: "Post Opportunity", icon: Briefcase, action: () => router.push('/jobs') },
                { label: "Find Partners", icon: Handshake, action: () => {} },
                { label: "Verify Identity", icon: ShieldCheck, action: () => router.push('/register') },
              ].map(item => (
                <button key={item.label} onClick={item.action} className="w-full text-left p-3 rounded-2xl text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-primary transition-all flex items-center gap-3">
                  <item.icon className="w-4 h-4" /> {item.label}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Center Feed */}
        <section className="lg:col-span-6 space-y-4 min-w-0">
          {/* Post Input */}
          <div ref={postInputRef} className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm space-y-4">
            <div className="flex items-start gap-4">
              <img src={user?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100"} alt="Me" className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
              <textarea
                value={caption}
                onChange={e => setCaption(e.target.value)}
                placeholder="Share a verified insight..."
                className="flex-grow bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[80px] resize-none"
              />
            </div>

            {selectedImage && (
              <div className="relative rounded-2xl overflow-hidden border border-slate-100">
                <img src={selectedImage} alt="Selected" className="w-full max-h-64 object-cover" />
                <button onClick={() => setSelectedImage(null)} className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Opportunity Tags */}
            <div className="flex flex-wrap gap-2">
              {OPPORTUNITY_TAGS.map(tag => (
                <button
                  key={tag.value}
                  onClick={() => setOpportunityTag(opportunityTag === tag.value ? null : tag.value)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${opportunityTag === tag.value ? tag.color : 'bg-slate-50 text-slate-400 border-slate-200 hover:border-slate-300'}`}
                >
                  <tag.icon className="w-3 h-3" /> {tag.label}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2">
              <div>
                <input type="file" ref={fileInputRef} onChange={handleImageSelect} accept="image/*" className="hidden" />
                <button onClick={() => fileInputRef.current?.click()} className="p-3 bg-slate-50 text-slate-500 rounded-2xl hover:bg-slate-100 hover:text-primary transition-all flex items-center gap-2 text-xs font-bold">
                  <ImageIcon className="w-4 h-4" /> Add Image
                </button>
              </div>
              <button onClick={handlePost} disabled={!caption.trim() || isPosting} className="px-8 py-3 bg-primary text-white rounded-2xl shadow-lg shadow-primary/20 hover:scale-105 transition-transform disabled:opacity-50 disabled:scale-100 font-bold text-sm flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                {isPosting ? "Posting..." : "Post"}
              </button>
            </div>
          </div>

          {/* Feed Posts */}
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-[2rem] p-6 shadow-sm animate-pulse">
                  <div className="flex gap-3 mb-4"><div className="w-12 h-12 rounded-full bg-slate-100" /><div className="flex-1 space-y-2"><div className="h-4 bg-slate-100 rounded w-1/3" /><div className="h-3 bg-slate-100 rounded w-1/4" /></div></div>
                  <div className="space-y-2"><div className="h-4 bg-slate-100 rounded" /><div className="h-4 bg-slate-100 rounded w-5/6" /></div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {posts.map((post: any) => (
                <PostCard key={post._id} post={post} user={post.author} onLikeToggle={(postId, data) => {
                  setPosts(prev => prev.map(p => p._id === postId ? { ...p, ...data } : p));
                }} />
              ))}
              {nextCursor && (
                <button onClick={() => fetchFeed(nextCursor)} className="w-full py-4 text-sm font-bold text-primary hover:bg-primary/5 rounded-2xl transition-colors">
                  Load more posts
                </button>
              )}
            </>
          )}
        </section>

        {/* Right Sidebar — sticky */}
        <aside className="lg:col-span-3 space-y-4 lg:sticky lg:top-[80px]">
          <div className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm">
            <h3 className="font-display font-bold text-sm mb-5 uppercase tracking-wider text-slate-400">Suggested Connections</h3>
            <div className="space-y-4">
              {suggestions.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">No suggestions yet</p>
              ) : suggestions.map((u: any) => (
                <div key={u._id} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push(`/profile/${u._id}`)}>
                    <div className="relative">
                      <img src={u.avatar} alt={u.fullName} className="w-10 h-10 rounded-xl object-cover transition-all" />
                      {u.identityVerified && (
                        <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
                          <ShieldCheck className="w-3 h-3 text-accent fill-accent/20" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1">
                        {u.fullName || u.name}
                        {u.identityVerified && <span title="Face + ID verified" className="text-[9px] font-bold bg-accent/10 text-accent px-1 py-0.5 rounded">✔ Verified Human</span>}
                      </h4>
                      <p className="text-[10px] font-medium text-slate-400 truncate w-28">{u.jobTitle}</p>
                      <p className="text-[10px] text-slate-300">{u.followersCount} followers</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <button onClick={() => handleFollow(u._id)} className="px-3 py-1 text-[10px] font-bold bg-primary/10 text-primary rounded-lg hover:bg-primary hover:text-white transition-all">
                      Follow
                    </button>
                    <button onClick={() => router.push(`/profile/${u._id}`)} className="px-3 py-1 text-[10px] font-bold bg-slate-50 text-slate-500 rounded-lg hover:bg-slate-100 transition-all">
                      Profile
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={fetchSuggestions} className="w-full mt-6 pt-4 border-t border-slate-50 text-[10px] font-black uppercase tracking-widest text-primary hover:tracking-[0.2em] transition-all">
              Refresh suggestions
            </button>
          </div>

          {/* Opportunity Filter */}
          <div className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm">
            <h3 className="font-display font-bold text-sm mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> Opportunity Feed
            </h3>
            <div className="space-y-2">
              {OPPORTUNITY_TAGS.map(tag => (
                <button key={tag.value} className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border transition-all hover:scale-[1.02] ${tag.color}`}>
                  <tag.icon className="w-3.5 h-3.5" /> {tag.label}
                </button>
              ))}
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
