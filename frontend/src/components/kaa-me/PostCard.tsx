"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Heart, MessageSquare, ShieldCheck, Send, Briefcase, DollarSign, Calendar, Handshake, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

const OPPORTUNITY_CONFIG: Record<string, { label: string; icon: any; color: string }> = {
  hiring:               { label: "Hiring",               icon: Briefcase,  color: "bg-blue-50 text-blue-600 border-blue-200" },
  seeking_funding:      { label: "Seeking Funding",      icon: DollarSign, color: "bg-green-50 text-green-600 border-green-200" },
  hosting_event:        { label: "Hosting Event",        icon: Calendar,   color: "bg-purple-50 text-purple-600 border-purple-200" },
  looking_for_partners: { label: "Looking for Partners", icon: Handshake,  color: "bg-orange-50 text-orange-600 border-orange-200" },
};

interface PostCardProps {
  post: any;
  user: any;
  onLikeToggle?: (postId: string, data: { likesCount: number; isLiked: boolean }) => void;
  onDelete?: (postId: string) => void;
}

export const PostCard = ({ post, user, onLikeToggle, onDelete }: PostCardProps) => {
  const router = useRouter();
  const { user: me } = useAuth();
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [likesCount, setLikesCount] = useState(post.likesCount ?? post.likes?.length ?? 0);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState("");
  const [commentCount, setCommentCount] = useState(post.commentCount || 0);
  const [commentsLoaded, setCommentsLoaded] = useState(false);

  const author = user || post.author;
  const authorId = author?._id || author?.id;
  const isOwn = me && authorId && me._id?.toString() === authorId?.toString();

  const isVerified = author?.identityVerified || author?.faceVerified || author?.verified;
  const opportunityTag = post.opportunityTag;
  const tagCfg = opportunityTag ? OPPORTUNITY_CONFIG[opportunityTag] : null;

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  const toggleLike = async () => {
    const newLiked = !isLiked;
    const newCount = newLiked ? likesCount + 1 : likesCount - 1;
    setIsLiked(newLiked);
    setLikesCount(newCount);
    onLikeToggle?.(post._id, { likesCount: newCount, isLiked: newLiked });
    try {
      await api.post(`/posts/${post._id}/like`, {});
    } catch {
      setIsLiked(!newLiked);
      setLikesCount(likesCount);
    }
  };

  const loadComments = async () => {
    if (commentsLoaded) { setShowComments(!showComments); return; }
    try {
      const data: any = await api.get(`/posts/${post._id}/comments`);
      setComments(Array.isArray(data) ? data : []);
      setCommentsLoaded(true);
      setShowComments(true);
    } catch { setShowComments(!showComments); }
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    try {
      const newComment: any = await api.post(`/posts/${post._id}/comments`, { content: commentText });
      setComments(prev => [...prev, newComment]);
      setCommentCount(c => c + 1);
      setCommentText("");
    } catch {}
  };

  const handleDelete = async () => {
    if (!confirm("Delete this post?")) return;
    try {
      await api.delete(`/posts/${post._id}`);
      onDelete?.(post._id);
    } catch {}
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-slate-100 asymmetric-card p-6 relative overflow-hidden group mb-4 shadow-sm hover:shadow-xl hover:shadow-slate-200/50"
    >
      <div className="grain-filter absolute inset-0 z-0" />

      {/* Header */}
      <div className="flex items-start justify-between mb-4 relative z-10">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => authorId && router.push(`/profile/${authorId}`)}>
          <div className="relative">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-md">
              <img src={author?.avatar} alt={author?.fullName || author?.name} className="w-full h-full object-cover" />
            </div>
            {isVerified && (
              <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm" title="Face + ID verified">
                <ShieldCheck className="w-4 h-4 text-accent fill-accent/20" />
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="font-display font-bold text-slate-900 leading-tight">
                {author?.fullName || author?.name}
              </h3>
              {isVerified && (
                <span className="text-[9px] font-bold bg-accent/10 text-accent px-1.5 py-0.5 rounded border border-accent/20" title="Face + ID verified">
                  ✔ Verified Human
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 font-medium">
              {author?.jobTitle || author?.role}{author?.currentCompany || author?.company ? ` @ ${author?.currentCompany || author?.company}` : ""}
            </p>
            <p className="text-[10px] text-slate-400">{post.createdAt ? timeAgo(post.createdAt) : post.timestamp}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {tagCfg && (
            <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${tagCfg.color}`}>
              <tagCfg.icon className="w-3 h-3" /> {tagCfg.label}
            </span>
          )}
          {isOwn && (
            <button onClick={handleDelete} className="p-1.5 text-slate-300 hover:text-red-400 transition-colors rounded-lg hover:bg-red-50">
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 mb-5">
        <p className="text-slate-700 leading-relaxed font-medium mb-4">{post.content}</p>
        {(post.mediaUrls?.[0] || post.image) && (
          <div className="asymmetric-card overflow-hidden border border-slate-100 shadow-sm">
            <img src={post.mediaUrls?.[0] || post.image} alt="Post" className="w-full h-auto object-cover group-hover:scale-[1.02] transition-transform duration-700" />
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="relative z-10 flex items-center justify-between pt-4 border-t border-slate-50">
        <div className="flex items-center gap-6">
          <button onClick={toggleLike} className={`flex items-center gap-2 transition-colors group/btn ${isLiked ? 'text-rose-500' : 'text-slate-400 hover:text-rose-500'}`}>
            <Heart className={`w-5 h-5 ${isLiked ? 'fill-rose-500' : ''}`} />
            <span className="text-xs font-bold">{likesCount}</span>
          </button>
          <button onClick={loadComments} className={`flex items-center gap-2 transition-colors ${showComments ? 'text-primary' : 'text-slate-400 hover:text-primary'}`}>
            <MessageSquare className="w-5 h-5" />
            <span className="text-xs font-bold">{commentCount}</span>
          </button>
        </div>
      </div>

      {/* Comments */}
      <AnimatePresence>
        {showComments && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-4 pt-4 border-t border-slate-50 overflow-hidden relative z-10">
            <div className="space-y-3 mb-4 max-h-48 overflow-y-auto pr-1">
              {comments.map((c: any) => (
                <div key={c._id} className="flex gap-3 items-start">
                  <img src={c.author?.avatar} alt={c.author?.fullName} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                  <div className="bg-slate-50 rounded-2xl px-4 py-2 flex-grow">
                    <p className="text-xs font-bold text-slate-900 mb-0.5">{c.author?.fullName || c.author?.name}</p>
                    <p className="text-xs text-slate-600">{c.content}</p>
                  </div>
                </div>
              ))}
            </div>
            {me && (
              <div className="flex gap-3">
                <img src={me.avatar} alt="Me" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                <input
                  type="text"
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddComment()}
                  placeholder="Add a comment..."
                  className="flex-grow bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <button onClick={handleAddComment} disabled={!commentText.trim()} className="p-2 bg-primary text-white rounded-xl hover:scale-105 transition-transform disabled:opacity-50">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
