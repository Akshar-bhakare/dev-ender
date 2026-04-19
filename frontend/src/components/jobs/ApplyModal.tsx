"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, FileText, CheckCircle2 } from "lucide-react";
import { api } from "@/lib/api";

interface ApplyModalProps {
  job: any;
  isOpen: boolean;
  onClose: () => void;
}

export function ApplyModal({ job, isOpen, onClose }: ApplyModalProps) {
  const [coverLetter, setCoverLetter] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const jobId = job._id || job.id;
    const isMockJob = typeof jobId === 'string' && jobId.startsWith('j');

    if (isMockJob) {
      // Simulate API delay for mock jobs
      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
      setIsSubmitting(false);
      return;
    }

    try {
      const response: any = await api.post(`/jobs/listings/${jobId}/apply`, {
        coverLetter,
        resumeUrl: "https://example.com/resume.pdf", // In a real app, this would be from the profile or file upload
      });

      if (response.success) {
        setIsSuccess(true);
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error?.message || "Failed to submit application. Please try again.");
    } finally {
      setIsSubmitting(false);
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
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      />
      
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-display font-bold text-xl text-slate-900">Apply for Position</h3>
            <p className="text-sm text-slate-500">{job.title} at {job.companyId?.displayName || job.company}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="p-6">
          {isSuccess ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-2">Application Sent!</h4>
              <p className="text-slate-500">Your application has been successfully submitted to the hiring team.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex items-center gap-4">
                <div className="p-3 bg-white rounded-lg border border-slate-100 shadow-sm">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="text-xs font-black text-slate-400 uppercase tracking-widest">Resume</div>
                  <div className="text-sm font-bold text-slate-700">resume_v1_syncup.pdf</div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Cover Letter (Optional)</label>
                <textarea 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:bg-white outline-none transition-all placeholder:text-slate-300 min-h-[200px] resize-none shadow-inner"
                  placeholder="Share why you're a great fit for this role..."
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                />
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-bold">
                  {error}
                </div>
              )}

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full py-4 kaame-gradient text-white rounded-xl text-xs font-black uppercase tracking-[0.2em] shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale disabled:scale-100"
              >
                {isSubmitting ? "Submitting..." : (
                  <>Submit Application <Send className="w-4 h-4" /></>
                )}
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
