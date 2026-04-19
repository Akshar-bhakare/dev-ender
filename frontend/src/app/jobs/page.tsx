"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { KaaMeNavbar } from "@/components/kaa-me/KaaMeNavbar";
import { Search, Filter, SlidersHorizontal, ChevronDown, Plus, Briefcase, MapPin } from "lucide-react";
import { JobListItem } from "@/components/jobs/JobListItem";
import { JobDetailsPane } from "@/components/jobs/JobDetailsPane";
import { JobSidebar } from "@/components/jobs/JobSidebar";
import { PostJobModal } from "@/components/jobs/PostJobModal";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import jobsData from "@/mock-data/jobs.json";

export default function JobsPage() {
  const { accountType, company } = useAuth();
  const [realJobs, setRealJobs] = useState<any[]>([]);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check if company is verified
  const isVerifiedCompany = accountType === "company" && company?.verificationStatus === "verified";

  // Filter mock jobs based on search query
  const filteredMockJobs = useMemo(() => {
    if (!searchQuery) return jobsData;
    const q = searchQuery.toLowerCase();
    return jobsData.filter(job => 
      job.title.toLowerCase().includes(q) || 
      job.company.toLowerCase().includes(q) ||
      job.skills.some(s => s.toLowerCase().includes(q))
    );
  }, [searchQuery]);

  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      const response: any = await api.get("/jobs/search", {
        params: { q: searchQuery || undefined }
      });
      if (response.success) {
        setRealJobs(response.data.jobs);
      }
    } catch (err) {
      console.error("Failed to fetch jobs", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [searchQuery]);

  // Combine mock and real jobs
  const allJobs = useMemo(() => {
    // Put real jobs first, then mock jobs
    return [...realJobs, ...filteredMockJobs];
  }, [realJobs, filteredMockJobs]);

  useEffect(() => {
    if (allJobs.length > 0 && !selectedJob) {
      setSelectedJob(allJobs[0]);
    }
  }, [allJobs, selectedJob]);

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-slate-900 selection:bg-cyan-100 flex flex-col">
      <KaaMeNavbar />
      
      <PostJobModal 
        isOpen={isPostModalOpen} 
        onClose={() => setIsPostModalOpen(false)} 
        onSuccess={fetchJobs}
      />

      {/* Sub-Header / Filters Bar */}
      <header className="sticky top-[64px] z-30 bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between gap-6">
          <div className="flex-1 flex items-center gap-4">
            <div className="relative flex-1 max-w-md group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
              <input 
                type="text" 
                placeholder="Search experienced roles, companies, or skills..." 
                className="w-full pl-12 pr-6 py-2.5 bg-slate-50 border border-slate-100 rounded-lg text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all shadow-inner"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isVerifiedCompany && (
              <button 
                onClick={() => setIsPostModalOpen(true)}
                className="flex items-center gap-2 px-6 py-2.5 kaame-gradient text-white rounded-lg text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-primary/20"
              >
                <Plus className="w-4 h-4" />
                Post Opportunity
              </button>
            )}

            <button className="hidden md:flex items-center gap-2 px-6 py-2.5 bg-white border border-slate-100 rounded-xl text-xs font-bold text-slate-600 hover:border-primary hover:text-primary transition-all shadow-sm">
              <MapPin className="w-3.5 h-3.5" />
              Location
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
            
            <div className="h-6 w-px bg-slate-200 mx-2" />
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-primary" />
              All Filters
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-6 py-8 flex-1 w-full">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 h-full items-start">
          
          {/* Left Sidebar - Col 3 */}
          <aside className="hidden lg:block lg:col-span-3">
            <JobSidebar />
          </aside>

          {/* Center Feed - Col 4 (Desktop) or 5 (Tablet) */}
          <div className="col-span-1 md:col-span-5 lg:col-span-4 flex flex-col gap-4">
            <div className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm divide-y divide-slate-50">
              <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  {searchQuery ? `Search Results for "${searchQuery}"` : "Recent Jobs"}
                </h3>
                {isLoading && <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />}
              </div>
              
              {allJobs.length > 0 ? (
                allJobs.map((job) => (
                  <JobListItem 
                    key={job._id || job.id} 
                    job={job} 
                    isSelected={selectedJob?._id === job._id || selectedJob?.id === job.id}
                    onClick={() => setSelectedJob(job)}
                  />
                ))
              ) : !isLoading && (
                <div className="p-12 text-center">
                  <Briefcase className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                  <p className="text-sm font-bold text-slate-400">No opportunities found</p>
                </div>
              )}
            </div>

            {/* Pagination / Load More (Simple) */}
            {allJobs.length > 0 && (
              <button className="w-full py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em] hover:text-primary transition-colors">
                Show more opportunities
              </button>
            )}
          </div>

          {/* Right Details Pane - Col 5 */}
          <section className="hidden md:block md:col-span-7 lg:col-span-5 h-[calc(100vh-180px)]">
            <JobDetailsPane job={selectedJob} />
          </section>

        </div>
      </main>

      {/* Global Toast Placeholder for Application */}
      <AnimatePresence>
        {/* We can add application modals or success toasts here */}
      </AnimatePresence>
    </div>
  );
}


