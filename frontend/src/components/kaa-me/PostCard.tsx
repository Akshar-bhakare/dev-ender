import { motion, AnimatePresence } from "framer-motion";
import { Heart, MessageSquare, ShieldCheck, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface PostProps {
  post: any;
  user: any;
}

export const PostCard = ({ post, user }: PostProps) => {
  const router = useRouter();
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes || 0);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [localComments, setLocalComments] = useState<string[]>([]);

  const handleProfileClick = () => {
    router.push(`/profile/${user.id}`);
  };

  const toggleLike = () => {
    if (isLiked) {
      setLikesCount(likesCount - 1);
    } else {
      setLikesCount(likesCount + 1);
    }
    setIsLiked(!isLiked);
  };

  const handleAddComment = () => {
    if (commentText.trim()) {
      setLocalComments([...localComments, commentText]);
      setCommentText("");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="bg-white border border-slate-100 asymmetric-card p-6 relative overflow-hidden group mb-6 shadow-sm hover:shadow-xl hover:shadow-slate-200/50"
    >
      {/* Texture Layer */}
      <div className="grain-filter absolute inset-0 z-0" />

      {/* Header */}
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="relative cursor-pointer" onClick={handleProfileClick}>
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-md">
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            </div>
            {user.verified && (
              <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
                <ShieldCheck className="w-4 h-4 text-accent fill-accent/20" />
              </div>
            )}
          </div>
          <div className="cursor-pointer" onClick={handleProfileClick}>
            <div className="flex items-center gap-1.5">
              <h3 className="font-display font-bold text-slate-900 leading-tight">
                {user.name}
              </h3>
              {user.verified && (
                <span className="text-[10px] font-bold bg-accent/10 text-accent px-1.5 py-0.5 rounded text-uppercase tracking-wider">
                  Verified
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 font-medium">{user.role} @ {user.company}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 mb-5">
        <p className="text-slate-700 leading-relaxed font-medium mb-4">
          {post.content}
        </p>
        {post.image && (
          <div 
            className="asymmetric-card overflow-hidden border border-slate-100 shadow-sm cursor-pointer"
            onClick={handleProfileClick}
          >
            <img 
              src={post.image} 
              alt="Post content" 
              className="w-full h-auto object-cover group-hover:scale-[1.02] transition-transform duration-700"
            />
          </div>
        )}
      </div>

      {/* Stats & Actions */}
      <div className="relative z-10">
        <div className="flex items-center justify-between pt-4 border-t border-slate-50">
          <div className="flex items-center gap-6">
            <button 
              onClick={toggleLike}
              className={`flex items-center gap-2 transition-colors group/btn ${isLiked ? 'text-rose-500' : 'text-slate-400 hover:text-rose-500'}`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-rose-500' : 'group-hover/btn:fill-rose-500'}`} />
              <span className="text-xs font-bold">{likesCount}</span>
            </button>
            <button 
              onClick={() => setShowComments(!showComments)}
              className={`flex items-center gap-2 transition-colors ${showComments ? 'text-primary' : 'text-slate-400 hover:text-primary'}`}
            >
              <MessageSquare className="w-5 h-5" />
              <span className="text-xs font-bold">{(post.comments || 0) + localComments.length}</span>
            </button>
          </div>
        </div>

        {/* Comment Section */}
        <AnimatePresence>
          {showComments && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-slate-50 overflow-hidden"
            >
              <div className="space-y-3 mb-4 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                {localComments.map((comment, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <div className="w-8 h-8 rounded-full bg-slate-100 overflow-hidden flex-shrink-0">
                      <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100" alt="Me" className="w-full h-full object-cover" />
                    </div>
                    <div className="bg-slate-50 rounded-2xl px-4 py-2 flex-grow">
                      <p className="text-xs font-bold text-slate-900 mb-0.5">You</p>
                      <p className="text-xs text-slate-600">{comment}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <input 
                  type="text" 
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                  placeholder="Add a verified comment..."
                  className="flex-grow bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <button 
                  onClick={handleAddComment}
                  disabled={!commentText.trim()}
                  className="p-2 bg-primary text-white rounded-xl hover:scale-105 transition-transform disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
