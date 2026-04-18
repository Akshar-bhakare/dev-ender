"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import Webcam from "react-webcam";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

interface CompanyStepsProps {
  onBack: () => void;
}

export const CompanySteps = ({ onBack }: CompanyStepsProps) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    legalName: "",
    email: "",
    password: "",
    phone: "",
    representativeRole: "founder",
    emailOtp: "",
    phoneOtp: "",
    displayName: "",
    websiteUrl: "",
    linkedInUrl: "",
    customSlug: "",
    industry: "",
    companySize: "1-10",
    yearFounded: new Date().getFullYear().toString(),
  });

  const [documentImageFrontend, setDocumentImageFrontend] = useState<string | null>(null);
  const webcamRef = useRef<Webcam>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      const res: any = await api.post("/auth/company/step1", {
        legalName: formData.legalName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        representativeRole: formData.representativeRole
      });
      localStorage.setItem("signupSessionToken", res.signupSessionToken);
      setStep(2);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || "Failed to start registration");
    } finally {
      setLoading(false);
    }
  };

  const handleStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      await api.post("/auth/company/step2/verify-otp", {
        emailOtp: formData.emailOtp,
        phoneOtp: formData.phoneOtp
      });
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
      await api.post("/auth/company/step3/details", {
        displayName: formData.displayName,
        websiteUrl: formData.websiteUrl,
        linkedInUrl: formData.linkedInUrl,
        customSlug: formData.customSlug
      });
      setStep(4);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || "Failed to save details");
    } finally {
      setLoading(false);
    }
  };

  const handleStep4 = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      await api.post("/auth/company/step4/industry", {
        industry: formData.industry,
        size: formData.companySize,
        yearFounded: Number(formData.yearFounded)
      });
      setStep(5);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || "Failed to save industry");
    } finally {
      setLoading(false);
    }
  };

  const handleStep5Face = async () => {
    if (!webcamRef.current) return;
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return setError("Could not capture image from camera.");

    setLoading(true); setError(null);
    try {
      await api.post("/auth/company/step5/identity", { faceImageBase64: imageSrc });
      setStep(6);
    } catch (err: any) {
       // if duplicate face is found
       if (err.response?.data?.error?.code === "DUPLICATE_FACE_DETECTED") {
          alert("This representative face is already registered. Please log in.");
          router.push('/login');
       } else {
          setError(err.response?.data?.error?.message || "Face verification failed.");
       }
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setDocumentImageFrontend(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStep6Doc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!documentImageFrontend) return setError("Please upload registration document");

    setLoading(true); setError(null);
    try {
      await api.post("/auth/company/step6/ownership", {
        documentImageBase64: documentImageFrontend
      });
      
      const completeRes: any = await api.post("/auth/company/complete");
      login(completeRes);
      router.push("/feed"); // Or company dashboard
    } catch (err: any) {
      setError(err.response?.data?.error?.message || "Document verification failed");
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
      <button onClick={onBack} className="text-slate-400 hover:text-slate-700 flex items-center gap-2 mb-8 transition-colors">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        Back
      </button>

      {/* Progress */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3, 4, 5, 6].map((s) => (
          <div key={s} className={`h-1 flex-1 rounded-full ${s <= step ? 'bg-accent' : 'bg-slate-100'}`} />
        ))}
      </div>

      {error && (
        <div className="p-4 mb-6 text-sm text-red-500 bg-red-50 rounded-xl border border-red-100">
          {error}
        </div>
      )}

      {step === 1 && (
        <form onSubmit={handleStep1} className="space-y-4">
          <h2 className="text-2xl font-display font-bold text-slate-900 mb-6">Register Company</h2>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Legal Entity Name</label>
            <input required name="legalName" value={formData.legalName} onChange={handleChange} className="w-full p-3 rounded-xl border border-slate-200 focus:border-accent focus:ring-1 focus:ring-accent outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Admin Email</label>
            <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full p-3 rounded-xl border border-slate-200 focus:border-accent focus:ring-1 focus:ring-accent outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div>
               <label className="block text-sm font-medium text-slate-700 mb-1">Admin Password</label>
               <input required type="password" name="password" minLength={8} value={formData.password} onChange={handleChange} className="w-full p-3 rounded-xl border border-slate-200 focus:border-accent focus:ring-1 focus:ring-accent outline-none" />
             </div>
             <div>
               <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
               <input required type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full p-3 rounded-xl border border-slate-200 focus:border-accent focus:ring-1 focus:ring-accent outline-none" />
             </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Your Role</label>
            <select name="representativeRole" value={formData.representativeRole} onChange={handleChange} className="w-full p-3 rounded-xl border border-slate-200 focus:border-accent bg-white outline-none">
               <option value="founder">Founder</option>
               <option value="co_founder">Co-Founder</option>
               <option value="ceo">CEO</option>
               <option value="director">Director</option>
               <option value="authorized_rep">Authorized Representative</option>
            </select>
          </div>

          <button disabled={loading} type="submit" className="w-full mt-6 py-4 bg-slate-900 text-white rounded-xl font-bold hover:opacity-90 disabled:opacity-50 transition-all">
            {loading ? "Creating..." : "Continue"}
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleStep2} className="space-y-6">
          <h2 className="text-2xl font-display font-bold text-slate-900 mb-2">Verify Contact</h2>
          <p className="text-slate-500 mb-6 font-medium text-sm">We've sent codes to {formData.email} and your phone.</p>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email Verification Code</label>
            <input required name="emailOtp" value={formData.emailOtp} onChange={handleChange} className="w-full p-3 text-center tracking-widest text-lg font-mono rounded-xl border border-slate-200 focus:border-accent outline-none" placeholder="123456" maxLength={6} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Phone Verification Code</label>
            <input required name="phoneOtp" value={formData.phoneOtp} onChange={handleChange} className="w-full p-3 text-center tracking-widest text-lg font-mono rounded-xl border border-slate-200 focus:border-accent outline-none" placeholder="123456" maxLength={6} />
          </div>

          <button disabled={loading} type="submit" className="w-full mt-6 py-4 bg-slate-900 text-white rounded-xl font-bold hover:opacity-90 disabled:opacity-50 transition-all">
             Verify
          </button>
        </form>
      )}

      {step === 3 && (
        <form onSubmit={handleStep3} className="space-y-4">
          <h2 className="text-2xl font-display font-bold text-slate-900 mb-6">Company Branding</h2>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Display Name (Optional)</label>
            <input name="displayName" placeholder="If different from legal" value={formData.displayName} onChange={handleChange} className="w-full p-3 rounded-xl border border-slate-200 focus:border-accent outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Website URL</label>
            <input type="url" name="websiteUrl" placeholder="https://..." value={formData.websiteUrl} onChange={handleChange} className="w-full p-3 rounded-xl border border-slate-200 focus:border-accent outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">LinkedIn Page</label>
            <input type="url" name="linkedInUrl" value={formData.linkedInUrl} onChange={handleChange} className="w-full p-3 rounded-xl border border-slate-200 focus:border-accent outline-none" />
          </div>

          <button disabled={loading} type="submit" className="w-full mt-6 py-4 bg-slate-900 text-white rounded-xl font-bold">
            Continue
          </button>
        </form>
      )}

      {step === 4 && (
        <form onSubmit={handleStep4} className="space-y-4">
          <h2 className="text-2xl font-display font-bold text-slate-900 mb-6">Industry & Size</h2>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Industry</label>
            <input required name="industry" placeholder="e.g. Fintech, Healthcare..." value={formData.industry} onChange={handleChange} className="w-full p-3 rounded-xl border border-slate-200 focus:border-accent outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div>
               <label className="block text-sm font-medium text-slate-700 mb-1">Company Size</label>
               <select name="companySize" value={formData.companySize} onChange={handleChange} className="w-full p-3 rounded-xl border border-slate-200 focus:border-accent bg-white outline-none">
                 <option value="1-10">1-10</option>
                 <option value="11-50">11-50</option>
                 <option value="51-200">51-200</option>
                 <option value="201-500">201-500</option>
                 <option value="500+">500+</option>
               </select>
             </div>
             <div>
               <label className="block text-sm font-medium text-slate-700 mb-1">Year Founded</label>
               <input required type="number" name="yearFounded" value={formData.yearFounded} onChange={handleChange} className="w-full p-3 rounded-xl border border-slate-200 focus:border-accent outline-none" />
             </div>
          </div>

          <button disabled={loading} type="submit" className="w-full mt-6 py-4 bg-slate-900 text-white rounded-xl font-bold">
            Continue to Identity Check
          </button>
        </form>
      )}

      {step === 5 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-display font-bold text-slate-900 mb-2">Representative Identity</h2>
          <p className="text-slate-500 mb-6 font-medium text-sm">Please position your face clearly in the frame. We verify the identity of the person registering the company.</p>
          
          <div className="relative w-full aspect-video bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border-4 border-slate-100 verification-glow">
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={{ facingMode: "user" }}
              className="object-cover w-full h-full"
            />
            <div className="absolute inset-0 border-[40px] border-black/40 pointer-events-none rounded-2xl mix-blend-multiply flex items-center justify-center">
                 <div className="w-[180px] h-[250px] border-2 border-accent/50 border-dashed rounded-full" />
            </div>
          </div>

          <button disabled={loading} onClick={handleStep5Face} className="w-full mt-6 py-4 bg-slate-900 text-white rounded-xl font-bold">
            {loading ? "Analyzing Face..." : "Capture Face"}
          </button>
        </div>
      )}

      {step === 6 && (
        <form onSubmit={handleStep6Doc} className="space-y-6">
          <h2 className="text-2xl font-display font-bold text-slate-900 mb-2">Business Registration</h2>
          <p className="text-slate-500 mb-6 font-medium text-sm">Upload a valid business registration document (e.g. Certificate of Incorporation, GST, PAN).</p>
          
          <div className="w-full border-2 border-dashed border-slate-300 rounded-2xl p-8 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer relative overflow-hidden group">
            <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
            
            {documentImageFrontend ? (
              <img src={documentImageFrontend} className="absolute inset-0 w-full h-full object-cover z-0 opacity-50" />
            ) : null}

            <div className="z-10 bg-white shadow-sm p-4 rounded-full mb-3 group-hover:scale-110 transition-transform">
               <svg className="w-6 h-6 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            </div>
            <p className="z-10 font-medium text-slate-700">Upload Registration Document</p>
          </div>

          <button disabled={loading} type="submit" className="w-full mt-6 py-4 bg-slate-900 text-white rounded-xl font-bold flex justify-center">
             {loading ? <span className="animate-pulse">Running OCR Checks...</span> : "Complete Setup"}
          </button>
        </form>
      )}

    </motion.div>
  );
};
