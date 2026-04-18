"use client";

import { motion } from "framer-motion";
import { KaaMeNavbar } from "@/components/kaa-me/KaaMeNavbar";
import { PostCard } from "@/components/kaa-me/PostCard";
import { SponsoredCard } from "@/components/kaa-me/SponsoredCard";
import usersData from "@/mock-data/users.json";
import feedData from "@/mock-data/feed.json";
import { Briefcase, Users, Star, TrendingUp, ShieldCheck, Zap, Image as ImageIcon, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState, useEffect } from "react";

export default function FeedPage() {
  const router = useRouter();
  const postInputRef = useRef<HTMLDivElement>(null);
  const [caption, setCaption] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [localPosts, setLocalPosts] = useState<any[]>([]);
  const [backendPosts, setBackendPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  useEffect(() => {
    // Get current user
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }

    // Fetch feed
    const fetchFeed = async () => {
      try {
        const res = await fetch(`${API}/api/posts`);
        if (res.ok) {
          const data = await res.json();
          setBackendPosts(data);
        }
      } catch (err) {
        console.error("Failed to fetch feed, using mock data", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeed();
  }, [API]);

  const findUser = (userId: string) => usersData.find(u => u.id === userId);

  const handleSelfProfileClick = () => {
    if (currentUser) {
      router.push(`/profile/${currentUser.id}`);
    } else {
      router.push(`/profile/u2`);
    }
  };

  const scrollToPostInput = () => {
    postInputRef.current?.scrollIntoView({ behavior: 'smooth' });
    postInputRef.current?.classList.add('ring-2', 'ring-primary/50');
    setTimeout(() => {
      postInputRef.current?.classList.remove('ring-2', 'ring-primary/50');
    }, 2000);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePost = async () => {
    if (!caption.trim()) return;

    const token = localStorage.getItem('token');
    if (token) {
      try {
        const res = await fetch(`${API}/api/posts`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            content: caption,
            mediaUrls: selectedImage ? [selectedImage] : []
          })
        });

        if (res.ok) {
          const newPost = await res.json();
          setBackendPosts([newPost, ...backendPosts]);
          setCaption("");
          setSelectedImage(null);
          return;
        }
      } catch (err) {
        console.error("Failed to post to backend, falling back to local state", err);
      }
    }

    // Fallback/Mock logic
    const newPost = {
      id: `lp-${Date.now()}`,
      userId: currentUser?.id || "u2",
      type: "organic",
      content: caption,
      image: selectedImage,
      likes: 0,
      comments: 0,
      timestamp: "Just now",
      author: currentUser // For PostCard consistency
    };

    setLocalPosts([newPost, ...localPosts]);
    setCaption("");
    setSelectedImage(null);
  };

  // Interleaving logic: backend/local posts first, then mock data
  const combinedOrganic = [
    ...localPosts,
    ...backendPosts.map(p => ({ ...p, type: 'organic' })),
    ...feedData.filter(item => item.type === "organic" || item.type === "job_pulse")
  ];
  
  const sponsoredPosts = feedData.filter(item => item.type === "sponsored");

  const interleavedFeed: any[] = [];
  let sponsoredIndex = 0;

  for (let i = 0; i < combinedOrganic.length; i++) {
    interleavedFeed.push(combinedOrganic[i]);
    
    if ((i + 1) % 3 === 0 && sponsoredPosts.length > 0) {
      interleavedFeed.push(sponsoredPosts[sponsoredIndex % sponsoredPosts.length]);
      sponsoredIndex++;
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-slate-900 selection:bg-cyan-100">
      <KaaMeNavbar />
      
      <main className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Sidebar: Profile & Status */}
        <aside className="lg:col-span-3 space-y-6">
          <div 
            className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm relative overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
            onClick={handleSelfProfileClick}
          >
            <div className="grain-filter absolute inset-0 pointer-events-none" />
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-3xl kaame-gradient p-1 mb-4 rotate-3">
                <div className="w-full h-full rounded-[1.25rem] bg-white overflow-hidden p-0.5">
                  <img src={currentUser?.avatar || usersData[1].avatar} alt="Me" className="w-full h-full object-cover rounded-[1.1rem]" />
                </div>
              </div>
              <h2 className="font-display font-bold text-xl mb-1">{currentUser?.name || usersData[1].name}</h2>
              <p className="text-xs font-medium text-slate-500 mb-4">{currentUser?.role || usersData[1].role}</p>
              
              <div className="w-full pt-4 border-t border-slate-50 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Verify Status</span>
                  <span className="text-accent font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    {currentUser?.kycStatus === 'verified' ? 'Tier 3 (Verified)' : 'Tier 1 (Basic)'}
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className={`h-full ${currentUser?.kycStatus === 'verified' ? 'bg-emerald-500 w-full' : 'bg-accent w-[35%]'}`} />
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
                { label: "Upload Post", icon: Briefcase, action: scrollToPostInput },
                { label: "Verify Identity", icon: ShieldCheck, action: () => router.push(`/profile/${currentUser?.uid || currentUser?.id}`) },
                { label: "Find Partners", icon: Users },
                { label: "Verified Events", icon: Star }
              ].map((item) => (
                <button 
                  key={item.label} 
                  onClick={item.action}
                  className="w-full text-left p-3 rounded-2xl text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-primary transition-all flex items-center gap-3"
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Center: The Feed */}
        <section className="lg:col-span-6 space-y-4">
          {/* Post Input */}
          <div 
            ref={postInputRef}
            className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm mb-8 space-y-4 transition-all duration-500"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                <img src={currentUser?.avatar || usersData[1].avatar} alt="Me" className="w-full h-full object-cover" />
              </div>
              <textarea 
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Share a verified insight..."
                className="flex-grow bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[100px] resize-none"
              />
            </div>
            
            {selectedImage && (
              <div className="relative rounded-2xl overflow-hidden border border-slate-100">
                <img src={selectedImage} alt="Selected" className="w-full h-auto max-h-64 object-cover" />
                <button 
                  onClick={() => setSelectedImage(null)}
                  className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <div className="flex gap-2">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageSelect} 
                  accept="image/*" 
                  className="hidden" 
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="p-3 bg-slate-50 text-slate-500 rounded-2xl hover:bg-slate-100 hover:text-primary transition-all flex items-center gap-2 text-xs font-bold"
                >
                  <ImageIcon className="w-4 h-4" />
                  Add Image
                </button>
              </div>
              <button 
                onClick={handlePost}
                disabled={!caption.trim()}
                className="px-8 py-3 bg-primary text-white rounded-2xl shadow-lg shadow-primary/20 hover:scale-105 transition-transform disabled:opacity-50 disabled:scale-100 font-bold text-sm flex items-center gap-2"
              >
                <TrendingUp className="w-5 h-5" />
                Post
              </button>
            </div>
          </div>

          {interleavedFeed.map((item: any, index: number) => {
            if (item.type === "organic") {
              const user = item.author || findUser(item.userId);
              // Normalize user object for PostCard
              const normalizedUser = {
                id: user.uid || user.id,
                name: user.name,
                avatar: user.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100",
                role: user.role,
                company: user.company || "Independent",
                verified: user.kycStatus === 'verified' || user.verified
              };
              
              // Normalize post object
              const normalizedPost = {
                ...item,
                image: item.image || (item.mediaUrls && item.mediaUrls[0])
              };

              return <PostCard key={`${item._id || item.id}-${index}`} post={normalizedPost} user={normalizedUser} />;
            }
            if (item.type === "sponsored") {
              return <SponsoredCard key={`${item.id}-${index}`} ad={item} />;
            }
            if (item.type === "job_pulse") {
              return (
                <div key={`${item.id}-${index}`} className="bg-white border-2 border-dashed border-slate-200 rounded-[2.5rem] p-8 mb-6 text-center group hover:border-primary/30 transition-colors">
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
