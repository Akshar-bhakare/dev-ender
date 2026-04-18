"use client";

import { useParams } from "next/navigation";
import { KaaMeNavbar } from "@/components/kaa-me/KaaMeNavbar";
import usersData from "@/mock-data/users.json";
import { motion } from "framer-motion";
import { ShieldCheck, MapPin, Link as LinkIcon, Calendar, Edit3, Save, TrendingUp } from "lucide-react";
import { useState, useEffect } from "react";
import { PostCard } from "@/components/kaa-me/PostCard";

export default function ProfilePage() {
export default function ProfilePage() {
  const params = useParams();
  const userId = params.userId as string;
  
  const [user, setUser] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSelf, setIsSelf] = useState(false);

  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API}/api/users/${userId}`);
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          setPosts(data.posts);
          setEditedUser(data.user);
          
          // Check if it's the current user
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            const loggedInUser = JSON.parse(storedUser);
            if (loggedInUser.id === userId || loggedInUser.uid === userId) {
              setIsSelf(true);
            }
          }
        } else {
          // Fallback to mock data
          const mockUser = usersData.find((u) => u.id === userId);
          if (mockUser) {
            setUser(mockUser);
            setEditedUser(mockUser);
            setIsSelf(userId === "u2");
          }
        }
      } catch (err) {
        console.error("Failed to fetch profile", err);
        const mockUser = usersData.find((u) => u.id === userId);
        if (mockUser) {
          setUser(mockUser);
          setEditedUser(mockUser);
          setIsSelf(userId === "u2");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [userId, API]);

  const handleSaveProfile = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const res = await fetch(`${API}/api/users/me`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(editedUser)
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          localStorage.setItem('user', JSON.stringify(data.user));
          setIsEditing(false);
          return;
        }
      } catch (err) {
        console.error("Failed to save profile", err);
      }
    }
    // Fallback save locally
    setUser(editedUser);
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#FAFAFA]">
        <KaaMeNavbar />
        <div className="max-w-7xl mx-auto px-6 py-20 text-center">
          <h1 className="text-2xl font-bold text-slate-900">User not found</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-slate-900">
      <KaaMeNavbar />
      
      <main className="max-w-4xl mx-auto px-6 py-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-slate-100 rounded-[3rem] overflow-hidden shadow-sm"
        >
          {/* Header/Cover */}
          <div className="h-48 kaame-gradient relative">
            <div className="grain-filter absolute inset-0 pointer-events-none opacity-50" />
          </div>

          {/* Profile Info */}
          <div className="px-10 pb-10 relative">
            <div className="flex justify-between items-end -mt-16 mb-6">
              <div className="relative">
                <div className="w-32 h-32 rounded-[2.5rem] border-4 border-white overflow-hidden shadow-xl bg-white">
                  <img src={user.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100"} alt={user.name} className="w-full h-full object-cover" />
                </div>
                {(user.kycStatus === 'verified' || user.verified) && (
                  <div className="absolute bottom-1 right-1 bg-white rounded-full p-1 shadow-md">
                    <ShieldCheck className="w-6 h-6 text-accent fill-accent/20" />
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                {isSelf ? (
                  <button 
                    onClick={isEditing ? handleSaveProfile : () => setIsEditing(true)}
                    className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-primary transition-all shadow-lg hover:shadow-primary/20"
                  >
                    {isEditing ? <Save className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                    {isEditing ? "Save Profile" : "Edit Profile"}
                  </button>
                ) : (
                  <>
                    <button className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-primary transition-all shadow-lg hover:shadow-primary/20">
                      Follow
                    </button>
                    <button className="px-6 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all">
                      Message
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2">
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={editedUser?.name} 
                      onChange={(e) => setEditedUser({...editedUser, name: e.target.value})}
                      className="text-3xl font-display font-bold text-slate-900 border-b-2 border-primary focus:outline-none bg-transparent"
                    />
                  ) : (
                    <h1 className="text-3xl font-display font-bold text-slate-900">{user.name}</h1>
                  )}
                  {(user.kycStatus === 'verified' || user.verified) && (
                    <span className="text-[10px] font-bold bg-accent/10 text-accent px-2 py-0.5 rounded-full uppercase tracking-widest">
                      Verified {user.verificationLevel || 'Tier 3'}
                    </span>
                  )}
                </div>
                {isEditing ? (
                  <div className="flex gap-2 mt-2">
                    <input 
                      type="text" 
                      value={editedUser?.role} 
                      onChange={(e) => setEditedUser({...editedUser, role: e.target.value})}
                      className="text-slate-500 font-medium text-lg border-b border-slate-200 focus:outline-none bg-transparent"
                    />
                    <span className="text-slate-500 font-medium text-lg">@</span>
                    <input 
                      type="text" 
                      value={editedUser?.company} 
                      onChange={(e) => setEditedUser({...editedUser, company: e.target.value})}
                      className="text-slate-500 font-medium text-lg border-b border-slate-200 focus:outline-none bg-transparent"
                    />
                  </div>
                ) : (
                  <p className="text-slate-500 font-medium text-lg">{user.role} @ {user.company || 'Independent'}</p>
                )}
              </div>

              {isEditing ? (
                <textarea 
                  value={editedUser?.bio || ""}
                  onChange={(e) => setEditedUser({...editedUser, bio: e.target.value})}
                  className="w-full text-slate-600 leading-relaxed max-w-2xl border p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 bg-slate-50 mt-4"
                  rows={4}
                  placeholder="Tell us about yourself..."
                />
              ) : (
                <p className="text-slate-600 leading-relaxed max-w-2xl">
                  {user.bio || "No bio yet."}
                </p>
              )}

              <div className="flex flex-wrap gap-6 pt-4 text-sm font-medium text-slate-400">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{user.location || "Global"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <LinkIcon className="w-4 h-4" />
                  <a href="#" className="text-primary hover:underline">{user.website || "kaa-me.ai"}</a>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-6 mt-6">
          {[
            { label: "Followers", value: "12.4k" },
            { label: "Connections", value: "842" },
            { label: "Projects", value: "15" }
          ].map((stat) => (
            <div key={stat.label} className="bg-white border border-slate-100 rounded-[2rem] p-6 text-center shadow-sm">
              <div className="text-2xl font-display font-bold text-slate-900 mb-1">{stat.value}</div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="mt-12">
          <h2 className="text-xl font-display font-bold text-slate-900 mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Recent Activity
          </h2>
          <div className="space-y-6">
            {posts.length > 0 ? (
              posts.map((post: any, index: number) => {
                const postUser = post.author || user;
                const normalizedUser = {
                  id: postUser.uid || postUser.id,
                  name: postUser.name,
                  avatar: postUser.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100",
                  role: postUser.role,
                  company: postUser.company || "Independent",
                  verified: postUser.kycStatus === 'verified' || postUser.verified
                };
                
                const normalizedPost = {
                  ...post,
                  image: post.image || (post.mediaUrls && post.mediaUrls[0])
                };

                return <PostCard key={post._id || post.id} post={normalizedPost} user={normalizedUser} />;
              })
            ) : (
              <div className="bg-white border border-slate-100 rounded-[2rem] p-12 text-center shadow-sm">
                <p className="text-slate-400 font-medium">No posts to show yet.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

