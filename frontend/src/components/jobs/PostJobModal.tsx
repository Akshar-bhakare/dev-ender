"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Plus, Briefcase, MapPin, DollarSign, Sparkles, CheckCircle2 } from "lucide-react";
import { api } from "@/lib/api";

interface PostJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function PostJobModal({ isOpen, onClose, onSuccess }: PostJobModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    jobType: "full_time",
    workMode: "remote",
    city: "",
    minExperienceMonths: 12,
    minSalary: 0,
    maxSalary: 0,
    skills: [] as string[],
  });

  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [skillInput, setSkillInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      api.get("/jobs/categories").then((res: any) => {
        if (res.success) setCategories(res.data);
      });
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // In a real app, you'd fetch real skill IDs. 
      // For this demo, we'll mock some skill IDs if the user entered text skills.
      const formattedSkills = formData.skills.map(skill => ({
        skillId: "643f1b2b3c4d5e6f7a8b9c0d", // Placeholder MongoDB ID
        isPrimary: true
      }));

      const response: any = await api.post("/jobs/listings", {
        ...formData,
        categoryId: selectedCategory || undefined,
        requiredSkills: formattedSkills,
        location: { city: formData.city, country: "India" }
      });

      if (response.success) {
        setIsSuccess(true);
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 2000);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error?.message || "Failed to post job. Please ensure your company is verified.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData({ ...formData, skills: [...formData.skills, skillInput.trim()] });
      setSkillInput("");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
      />
      
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 40 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
              <Plus className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-display font-bold text-2xl text-slate-900">Post Opportunity</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Share a new role with the community</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors bg-white shadow-sm">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {isSuccess ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-24 h-24 bg-green-50 rounded-[2rem] flex items-center justify-center mb-8 rotate-3 shadow-lg shadow-green-100">
                <CheckCircle2 className="w-12 h-12 text-green-500" />
              </div>
              <h4 className="text-2xl font-display font-bold text-slate-900 mb-3">Job Listing Created!</h4>
              <p className="text-slate-500 max-w-sm">Your opportunity is now live and being analyzed by our AI matching engine.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Job Title</label>
                  <input 
                    required
                    type="text" 
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-primary/10 focus:bg-white outline-none transition-all placeholder:text-slate-300 shadow-inner"
                    placeholder="e.g. Senior Frontend Engineer"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Job Type</label>
                  <select 
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-primary/10 focus:bg-white outline-none transition-all shadow-inner"
                    value={formData.jobType}
                    onChange={(e) => setFormData({ ...formData, jobType: e.target.value })}
                  >
                    <option value="full_time">Full Time</option>
                    <option value="part_time">Part Time</option>
                    <option value="contract">Contract</option>
                    <option value="freelance">Freelance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Work Mode</label>
                  <select 
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-primary/10 focus:bg-white outline-none transition-all shadow-inner"
                    value={formData.workMode}
                    onChange={(e) => setFormData({ ...formData, workMode: e.target.value })}
                  >
                    <option value="remote">Remote Only</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="on_site">In-Office</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 text-primary flex items-center gap-2">
                  <Sparkles className="w-3 h-3" /> Job Description
                </label>
                <textarea 
                  required
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-primary/10 focus:bg-white outline-none transition-all placeholder:text-slate-300 min-h-[150px] resize-none shadow-inner"
                  placeholder="Detail the responsibilities, requirements, and what makes this role special..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              {/* Requirements & Compensation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-slate-50/50 rounded-3xl border border-slate-100">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Min Experience (Months)</label>
                  <input 
                    type="number" 
                    min="12"
                    className="w-full px-5 py-3 bg-white border border-slate-100 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    value={formData.minExperienceMonths}
                    onChange={(e) => setFormData({ ...formData, minExperienceMonths: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Location (City)</label>
                  <input 
                    type="text" 
                    className="w-full px-5 py-3 bg-white border border-slate-100 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    placeholder="e.g. Bangalore"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Min Salary (Annual)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="number" 
                      className="w-full pl-10 pr-5 py-3 bg-white border border-slate-100 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      value={formData.minSalary}
                      onChange={(e) => setFormData({ ...formData, minSalary: parseInt(e.target.value) })}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Max Salary (Annual)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="number" 
                      className="w-full pl-10 pr-5 py-3 bg-white border border-slate-100 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      value={formData.maxSalary}
                      onChange={(e) => setFormData({ ...formData, maxSalary: parseInt(e.target.value) })}
                    />
                  </div>
                </div>
              </div>

              {/* Skills */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Required Skills</label>
                <div className="flex gap-2 mb-4">
                  <input 
                    type="text" 
                    className="flex-1 px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold outline-none"
                    placeholder="Add a skill..."
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  />
                  <button 
                    type="button"
                    onClick={addSkill}
                    className="px-6 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.skills.map((skill) => (
                    <span key={skill} className="px-4 py-2 bg-primary/5 text-primary border border-primary/10 rounded-xl text-xs font-bold flex items-center gap-2">
                      {skill}
                      <button onClick={() => setFormData({ ...formData, skills: formData.skills.filter(s => s !== skill) })}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {error && (
                <div className="p-5 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-xs font-bold flex items-center gap-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  {error}
                </div>
              )}

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full py-5 kaame-gradient text-white rounded-2xl text-sm font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-4 disabled:opacity-50 disabled:grayscale disabled:scale-100"
              >
                {isSubmitting ? "Processing..." : (
                  <>Create Job Listing <Briefcase className="w-5 h-5" /></>
                )}
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
