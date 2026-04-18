"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Heart, MessageSquare, Share2, MoreHorizontal, ShieldCheck, CheckCircle2 } from "lucide-react";

interface PostProps {
  post: any;
  user: any;
}

export const PostCard = ({ post, user }: PostProps) => {
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
          <div className="relative">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-md">
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            </div>
            {user.verified && (
              <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
                <ShieldCheck className="w-4 h-4 text-accent fill-accent/20" />
              </div>
            )}
          </div>
          <div>
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
        <button className="text-slate-400 hover:text-slate-900 transition-colors">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="relative z-10 mb-5">
        <p className="text-slate-700 leading-relaxed font-medium mb-4">
          {post.content}
        </p>
        {post.image && (
          <div className="asymmetric-card overflow-hidden border border-slate-100 shadow-sm">
            <img 
              src={post.image} 
              alt="Post content" 
              className="w-full h-auto object-cover group-hover:scale-[1.02] transition-transform duration-700"
            />
          </div>
        )}
      </div>

      {/* Stats & Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-50 relative z-10">
        <div className="flex items-center gap-6">
          <button className="flex items-center gap-2 text-slate-400 hover:text-rose-500 transition-colors group/btn">
            <Heart className="w-5 h-5 group-hover/btn:fill-rose-500" />
            <span className="text-xs font-bold">{post.likes}</span>
          </button>
          <button className="flex items-center gap-2 text-slate-400 hover:text-primary transition-colors">
            <MessageSquare className="w-5 h-5" />
            <span className="text-xs font-bold">{post.comments}</span>
          </button>
        </div>
        <button className="text-slate-400 hover:text-slate-900 transition-colors">
          <Share2 className="w-5 h-5" />
        </button>
      </div>
    </motion.div>
  );
};
