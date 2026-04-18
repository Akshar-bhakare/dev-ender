"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { KaaMeNavbar } from "@/components/kaa-me/KaaMeNavbar";
import { api } from "@/lib/api-client";
import { 
  Briefcase, 
  Plus, 
  Trash2, 
  Save, 
  Loader2, 
  Building2, 
  Award,
  BookOpen
} from "lucide-react";

export default function ServiceProfileSetupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    categories: ["Development"],
    skills: [] as string[],
    minBudget: 5000,
    preferredEngagementModel: "fixed",
    caseStudies: [] as any[],
    geoPreferences: ["Global"]
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await api.get('/marketplace/profiles/me');
        if (profile) setFormData(profile);
      } catch (error) {
        console.log("No existing profile found, starting fresh.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/marketplace/profiles', formData);
      router.push('/marketplace');
    } catch (error) {
       // If post fails because it exists, try patch
       try {
         await api.patch('/marketplace/profiles', formData);
         router.push('/marketplace');
       } catch (innerError) {
         console.error("Failed to save profile:", innerError);
         alert("Error saving service profile.");
       }
    } finally {
      setSaving(false);
    }
  };

  const addCaseStudy = () => {
    setFormData({
      ...formData,
      caseStudies: [...formData.caseStudies, { title: "", description: "", link: "" }]
    });
  };

  if (loading) return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
       <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-slate-900 selection:bg-cyan-100 pb-32">
      <KaaMeNavbar />
      
      <main className="max-w-4xl mx-auto px-6 py-16">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-16">
           <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-accent/10 rounded-2xl">
                 <Building2 className="w-6 h-6 text-accent" />
              </div>
              <span className="text-sm font-black uppercase tracking-widest text-accent">Provider Supply Node</span>
           </div>
           <h1 className="font-display font-bold text-5xl tracking-tight mb-4 lowercase">
             Scale your <span className="text-primary italic">Service Profile</span>
           </h1>
           <p className="text-slate-500 font-medium max-w-xl">
             Define what your organization delivers. High-quality profiles are more likely to be matched with verified project needs.
           </p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-12">
           {/* Section 1: Core Offering */}
           <div className="bg-white border border-slate-100 rounded-[3rem] p-10 shadow-sm relative group overflow-hidden">
              <div className="grain-filter absolute inset-0 opacity-[0.03] pointer-events-none" />
              <div className="flex items-center gap-4 mb-10">
                 <Award className="w-6 h-6 text-primary" />
                 <h2 className="font-display font-bold text-2xl uppercase tracking-tight">Supply Identity</h2>
              </div>

              <div className="space-y-8">
                 <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">Display Title</label>
                    <input 
                      required
                      type="text" 
                      placeholder="e.g., Full-stack product engineering squad"
                      className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-3xl font-bold focus:outline-none focus:border-primary transition-all"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                    />
                 </div>
                 <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">Capability Overview</label>
                    <textarea 
                      required
                      rows={5}
                      placeholder="Describe your collective expertise and value proposition..."
                      className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-3xl font-medium focus:outline-none focus:border-primary transition-all resize-none"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                    />
                 </div>
              </div>
           </div>

           {/* Section 2: Case Studies */}
           <div className="bg-white border border-slate-100 rounded-[3rem] p-10 shadow-sm">
              <div className="flex items-center justify-between mb-10">
                 <div className="flex items-center gap-4">
                    <BookOpen className="w-6 h-6 text-primary" />
                    <h2 className="font-display font-bold text-2xl uppercase tracking-tight">Case Studies</h2>
                 </div>
                 <button 
                   type="button" 
                   onClick={addCaseStudy}
                   className="p-3 bg-slate-900 text-white rounded-2xl hover:bg-primary transition-all"
                 >
                    <Plus className="w-5 h-5" />
                 </button>
              </div>

              <div className="space-y-6">
                 {formData.caseStudies.map((cs, idx) => (
                    <motion.div 
                      key={idx} 
                      initial={{ scale: 0.95, opacity: 0 }} 
                      animate={{ scale: 1, opacity: 1 }}
                      className="p-8 bg-slate-50 border border-slate-100 rounded-[2.5rem] relative group"
                    >
                       <button 
                         type="button"
                         onClick={() => {
                           const newCS = [...formData.caseStudies];
                           newCS.splice(idx, 1);
                           setFormData({...formData, caseStudies: newCS});
                         }}
                         className="absolute top-6 right-6 p-2 text-slate-300 hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                       >
                          <Trash2 className="w-4 h-4" />
                       </button>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                          <input 
                            placeholder="Title (e.g., Scaling a Neo-bank API)"
                            className="bg-transparent border-b border-slate-200 py-2 focus:outline-none focus:border-primary font-bold"
                            value={cs.title}
                            onChange={(e) => {
                               const newCS = [...formData.caseStudies];
                               newCS[idx].title = e.target.value;
                               setFormData({...formData, caseStudies: newCS});
                            }}
                          />
                          <input 
                            placeholder="Link (Optional)"
                            className="bg-transparent border-b border-slate-200 py-2 focus:outline-none focus:border-primary font-mono text-xs"
                            value={cs.link}
                            onChange={(e) => {
                               const newCS = [...formData.caseStudies];
                               newCS[idx].link = e.target.value;
                               setFormData({...formData, caseStudies: newCS});
                            }}
                          />
                       </div>
                       <textarea 
                          placeholder="Brief summary of challenge and result..."
                          className="w-full bg-transparent border-none focus:outline-none font-medium text-sm text-slate-500 resize-none"
                          rows={2}
                          value={cs.description}
                          onChange={(e) => {
                             const newCS = [...formData.caseStudies];
                             newCS[idx].description = e.target.value;
                             setFormData({...formData, caseStudies: newCS});
                          }}
                       />
                    </motion.div>
                 ))}
              </div>
           </div>

           <div className="flex items-center justify-end gap-6 pt-12">
              <button 
                type="button" 
                onClick={() => router.back()}
                className="px-8 py-4 text-slate-400 font-bold hover:text-slate-900 transition-colors"
              >
                 Discard Progress
              </button>
              <button 
                disabled={saving}
                className="px-12 py-5 kaame-gradient text-white rounded-3xl font-display font-bold text-xl shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
              >
                 {saving ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
                 {saving ? "Indexing Capabilites..." : "Sync Service Profile"}
              </button>
           </div>
        </form>
      </main>
    </div>
  );
}
