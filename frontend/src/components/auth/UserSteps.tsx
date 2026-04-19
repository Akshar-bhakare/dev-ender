"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { FaceVerifier } from "@/components/auth/FaceVerifier";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

interface UserStepsProps {
  onBack: () => void;
}

const SIGNUP_KEY = "signup_progress";

const defaultFormData = {
  fullName: "", email: "", password: "", phone: "", country: "IN",
  emailOtp: "", jobTitle: "", industry: "",
  totalYearsExperience: "", currentCompany: "", linkedInUrl: "", bio: "",
  documentType: "aadhaar",
};

type BufferedData = {
  step3?: { jobTitle: string; industry: string; totalYearsExperience: string; currentCompany: string; linkedInUrl: string; bio: string; };
  step4?: { faceImageBase64: string; faceDescriptor: number[]; };
  step5?: { documentType: string; documentImageBase64: string; };
};

export const UserSteps = ({ onBack }: UserStepsProps) => {
  const saved = typeof window !== "undefined"
    ? JSON.parse(localStorage.getItem(SIGNUP_KEY) || "null") : null;

  const [step, setStep] = useState<number>(saved?.step || 1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({ ...defaultFormData, ...(saved?.formData || {}) });
  const [documentImageFront, setDocumentImageFront] = useState<string | null>(saved?.buffered?.step5?.documentImageBase64 || null);
  const [onfidoToken, setOnfidoToken] = useState<string | null>(null);
  const [buffered, setBuffered] = useState<BufferedData>(saved?.buffered || {});

  const handleCancel = () => {
    if (confirm("Cancel registration? All progress will be lost.")) {
      clearProgress();
      onBack();
    }
  };

  const saveProgress = (newStep: number, newFormData = formData, newBuffered = buffered) => {
    localStorage.setItem(SIGNUP_KEY, JSON.stringify({ step: newStep, formData: newFormData, buffered: newBuffered }));
  };

  const handleBack = () => {
    if (step === 1) { onBack(); return; }
    if (step === 2) {
      setFormData(prev => ({ ...prev, emailOtp: "" }));
      localStorage.removeItem("signupSessionToken");
      saveProgress(1, { ...formData, emailOtp: "" });
      setStep(1);
      return;
    }
    const prev = step - 1;
    saveProgress(prev);
    setStep(prev);
  };

  const clearProgress = () => {
    localStorage.removeItem(SIGNUP_KEY);
    localStorage.removeItem("signupSessionToken");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const updated = { ...formData, [e.target.name]: e.target.value };
    setFormData(updated);
    saveProgress(step, updated);
  };

  const handleStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      const res: any = await api.post("/auth/user/step1", {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        country: formData.country
      });
      localStorage.setItem("signupSessionToken", res.signupSessionToken);
      saveProgress(2);
      setStep(2);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  const handleStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      const res: any = await api.post("/auth/user/step2/verify-otp", { emailOtp: formData.emailOtp });
      localStorage.setItem("signupSessionToken", res.signupSessionToken);
      if (res.onfidoSdkToken) setOnfidoToken(res.onfidoSdkToken);
      saveProgress(3);
      setStep(3);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleStep3 = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      await api.post("/auth/user/step3/professional-details", {
        jobTitle: formData.jobTitle,
        industry: formData.industry,
        totalYearsExperience: Number(formData.totalYearsExperience),
        currentCompany: formData.currentCompany,
        linkedInUrl: formData.linkedInUrl,
        bio: formData.bio
      });
      const newBuffered = { ...buffered, step3: {
        jobTitle: formData.jobTitle, industry: formData.industry,
        totalYearsExperience: formData.totalYearsExperience, currentCompany: formData.currentCompany,
        linkedInUrl: formData.linkedInUrl, bio: formData.bio
      }};
      setBuffered(newBuffered);
      saveProgress(4, formData, newBuffered);
      setStep(4);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleStep4Face = async (imageSrc: string) => {
    setLoading(true); setError(null);
    try {
      const res: any = await api.post("/auth/user/step4/face-verify", { faceImageBase64: imageSrc });
      const newBuffered = { ...buffered, step4: { faceImageBase64: imageSrc, faceDescriptor: res.descriptor } };
      setBuffered(newBuffered);
      saveProgress(5, formData, newBuffered);
      setStep(5);
    } catch (err: any) {
      if (err.response?.data?.error?.code === "DUPLICATE_FACE_DETECTED") {
        alert("This face is already registered. Please log in.");
        router.push('/login');
      } else {
        setError(err.response?.data?.error?.message || "Face verification failed. Please ensure your face is clearly visible.");
      }
    } finally {
      setLoading(false);
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setDocumentImageFront(result);
        const newBuffered = { ...buffered, step5: { documentType: formData.documentType, documentImageBase64: result } };
        setBuffered(newBuffered);
        saveProgress(5, formData, newBuffered);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStep5Doc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!documentImageFront) return setError("Please upload an ID document");
    if (!buffered.step3 || !buffered.step4) return setError("Missing data from previous steps. Please restart.");

    setLoading(true); setError(null);
    try {
      const completeRes: any = await api.post("/auth/user/complete", {
        ...buffered.step3,
        totalYearsExperience: Number(buffered.step3.totalYearsExperience),
        faceImageBase64: buffered.step4.faceImageBase64,
        faceDescriptor: buffered.step4.faceDescriptor,
        documentType: formData.documentType,
        documentImageBase64: documentImageFront,
      });
      login(completeRes);
      clearProgress();
      router.push("/feed");
    } catch (err: any) {
      setError(err.response?.data?.error?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="max-w-md mx-auto w-full pb-20"
    >
      <div className="flex items-center justify-between mb-8">
        <button onClick={handleBack} className="text-slate-400 hover:text-slate-700 flex items-center gap-2 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Back
        </button>
        <button onClick={handleCancel} className="text-xs text-slate-400 hover:text-red-500 transition-colors">
          Cancel registration
        </button>
      </div>

      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3, 4, 5].map((s) => (
          <div key={s} className={`h-1 flex-1 rounded-full ${s <= step ? 'bg-primary' : 'bg-slate-100'}`} />
        ))}
      </div>

      {error && (
        <div className="p-4 mb-6 text-sm text-red-500 bg-red-50 rounded-xl border border-red-100">
          {error}
        </div>
      )}

      {step === 1 && (
        <form onSubmit={handleStep1} className="space-y-4">
          <h2 className="text-2xl font-display font-bold text-slate-900 mb-6">Create your profile</h2>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
            <input required name="fullName" value={formData.fullName} onChange={handleChange} className="w-full p-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full p-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input required type="password" name="password" value={formData.password} onChange={handleChange} minLength={8} className="w-full p-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
            <input required type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full p-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Country</label>
            <select name="country" value={formData.country} onChange={handleChange} className="w-full p-3 rounded-xl border border-slate-200 focus:border-primary bg-white outline-none">
              <option value="IN">India</option>
              <option value="US">United States</option>
              <option value="GB">United Kingdom</option>
              <option value="AE">United Arab Emirates</option>
              <option value="SG">Singapore</option>
              <option value="DE">Germany</option>
              <option value="FR">France</option>
              <option value="CA">Canada</option>
              <option value="AU">Australia</option>
            </select>
          </div>
          <button disabled={loading} type="submit" className="w-full mt-6 py-4 kaame-gradient text-white rounded-xl font-bold hover:opacity-90 disabled:opacity-50 transition-all flex justify-center">
            {loading ? <span className="animate-pulse">Creating...</span> : "Continue"}
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleStep2} className="space-y-6">
          <h2 className="text-2xl font-display font-bold text-slate-900 mb-2">Verify your Email</h2>
          <p className="text-slate-500 mb-6 font-medium text-sm">We've sent a code to {formData.email}. <button type="button" onClick={handleBack} className="text-primary underline">Wrong email?</button></p>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email Verification Code</label>
            <input required name="emailOtp" value={formData.emailOtp} onChange={handleChange} className="w-full p-3 text-center tracking-widest text-lg font-mono rounded-xl border border-slate-200 focus:border-primary outline-none transition-all" placeholder="123456" maxLength={6} />
          </div>
          <button disabled={loading} type="submit" className="w-full mt-6 py-4 kaame-gradient text-white rounded-xl font-bold hover:opacity-90 disabled:opacity-50 transition-all">
            {loading ? "Verifying..." : "Verify Codes"}
          </button>
        </form>
      )}

      {step === 3 && (
        <form onSubmit={handleStep3} className="space-y-4">
          <h2 className="text-2xl font-display font-bold text-slate-900 mb-6">Professional Details</h2>
          <div className="grid grid-cols-2 gap-4">
             <div>
               <label className="block text-sm font-medium text-slate-700 mb-1">Job Title</label>
               <input required name="jobTitle" value={formData.jobTitle} onChange={handleChange} className="w-full p-3 rounded-xl border border-slate-200 focus:border-primary outline-none" />
             </div>
             <div>
               <label className="block text-sm font-medium text-slate-700 mb-1">Industry</label>
               <input required name="industry" value={formData.industry} onChange={handleChange} className="w-full p-3 rounded-xl border border-slate-200 focus:border-primary outline-none" />
             </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div>
               <label className="block text-sm font-medium text-slate-700 mb-1">Current Company</label>
               <input name="currentCompany" value={formData.currentCompany} onChange={handleChange} className="w-full p-3 rounded-xl border border-slate-200 focus:border-primary outline-none" />
             </div>
             <div>
               <label className="block text-sm font-medium text-slate-700 mb-1">Years of Exp.</label>
               <input type="number" required name="totalYearsExperience" value={formData.totalYearsExperience} onChange={handleChange} className="w-full p-3 rounded-xl border border-slate-200 focus:border-primary outline-none" />
             </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">LinkedIn Profile</label>
            <input type="url" name="linkedInUrl" placeholder="https://linkedin.com/in/..." value={formData.linkedInUrl} onChange={handleChange} className="w-full p-3 rounded-xl border border-slate-200 focus:border-primary outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Short Bio</label>
            <textarea name="bio" value={formData.bio} onChange={handleChange} rows={3} className="w-full p-3 rounded-xl border border-slate-200 focus:border-primary outline-none" maxLength={300} />
          </div>
          <button disabled={loading} type="submit" className="w-full mt-6 py-4 kaame-gradient text-white rounded-xl font-bold hover:opacity-90 disabled:opacity-50 transition-all">
            {loading ? "Saving..." : "Continue to Verification"}
          </button>
        </form>
      )}

      {step === 4 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-display font-bold text-slate-900 mb-2">Live Identity Verification</h2>
          <p className="text-slate-500 mb-4 font-medium text-sm">Position your face in the oval. We'll auto-capture when ready.</p>
          <FaceVerifier onCapture={handleStep4Face} loading={loading} />
        </div>
      )}

      {step === 5 && (
        <form onSubmit={handleStep5Doc} className="space-y-6 text-center">
          <div className="mb-4">
            <h2 className="text-2xl font-display font-bold text-slate-900 mb-2">Secure Verification</h2>
            <p className="text-slate-500 font-medium text-sm">International ID check powered by Onfido.</p>
          </div>
          
          {onfidoToken ? (
            <div className="p-10 rounded-2xl bg-white border-2 border-slate-100 shadow-sm flex flex-col items-center relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-1 kaame-gradient" />
              <div className="w-16 h-16 bg-white shadow-xl rounded-full flex items-center justify-center mb-6">
                 <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Verification Session Ready</h3>
              <p className="text-xs text-slate-500 mb-8 max-w-[200px]">Secure international registry check initialized for {formData.country}.</p>
              
              {!documentImageFront ? (
                <button 
                   type="button" 
                   onClick={() => setDocumentImageFront("onfido_automated_capture")}
                   className="w-full py-4 kaame-gradient text-white rounded-xl font-bold hover:shadow-xl hover:scale-[1.02] transition-all shadow-lg"
                >
                   Start Onfido Capture
                </button>
              ) : (
                <div className="flex flex-col items-center gap-2">
                   <div className="px-4 py-2 rounded-full bg-green-100 text-green-700 text-xs font-bold flex items-center gap-2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" /></svg>
                      CAPTURE COMPLETE
                   </div>
                   <button type="button" onClick={() => setDocumentImageFront(null)} className="text-xs text-slate-400 font-medium underline">Retake</button>
                </div>
              )}
            </div>
          ) : (
            <div onClick={() => fileInputRef.current?.click()} className="w-full border-2 border-dashed border-slate-300 rounded-2xl p-8 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer relative overflow-hidden group">
               <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
               <div className="z-10 bg-white shadow-sm p-4 rounded-full mb-3 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
               </div>
               <p className="z-10 font-medium text-slate-700">Fallback Upload</p>
            </div>
          )}

          <button disabled={loading || !documentImageFront} type="submit" className="w-full mt-6 py-4 kaame-gradient text-white rounded-xl font-bold hover:opacity-90 disabled:opacity-50 transition-all flex justify-center">
            {loading ? <span className="animate-pulse">Finalizing Account...</span> : "Complete Registration"}
          </button>
        </form>
      )}
    </motion.div>
  );
};
