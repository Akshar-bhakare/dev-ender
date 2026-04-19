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
  const [onfidoToken, setOnfidoToken] = useState<string | null>(null);
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
    country: "IN",
    ownershipPercentage: "",
    founderStatement: "",
  });

  const [documentImageFrontend, setDocumentImageFrontend] = useState<string | null>(null);
  const webcamRef = useRef<Webcam>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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
        country: formData.country,
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
      const res: any = await api.post("/auth/company/step2/verify-otp", {
        emailOtp: formData.emailOtp,
        phoneOtp: formData.phoneOtp
      });
      if (res.onfidoSdkToken) setOnfidoToken(res.onfidoSdkToken);
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
      await api.post("/auth/company/step3/branding", {
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

  const [docs, setDocs] = useState({
    incorporation_cert: null as string | null,
    gst_cert: null as string | null,
    business_pan: null as string | null,
  });

  const [ocrResults, setOcrResults] = useState<any[]>([]);

  const handleDocUpload = async (docType: string, imageBase64: string) => {
    setLoading(true); setError(null);
    try {
      const res: any = await api.post("/auth/company/step5/documents", {
        docType,
        documentImageBase64: imageBase64
      });
      setOcrResults(prev => [...prev, { type: docType, ...res.extracted }]);
      setDocs(prev => ({ ...prev, [docType]: imageBase64 }));
    } catch (err: any) {
      setError(err.response?.data?.error?.message || "OCR Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docs.incorporation_cert) return setError("Certificate of Incorporation is mandatory");

    setLoading(true); setError(null);
    try {
      await api.post("/auth/company/step6/ownership", {
        representativeRole: formData.representativeRole,
        ownershipPercentage: formData.ownershipPercentage,
        founderStatement: formData.founderStatement,
        linkedInUrl: formData.linkedInUrl
      });
      
      const completeRes: any = await api.get("/auth/get-me");
      login(completeRes);
      router.push("/feed");
    } catch (err: any) {
      setError(err.response?.data?.error?.message || "Final submission failed");
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
            <label className="block text-sm font-medium text-slate-700 mb-1">Registered Country</label>
            <select name="country" value={formData.country} onChange={handleChange} className="w-full p-3 rounded-xl border border-slate-200 focus:border-accent bg-white outline-none">
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

          <button disabled={loading} type="submit" className="w-full mt-6 py-4 kaame-gradient-alt text-white rounded-xl font-bold hover:shadow-lg transition-all">
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

          <button disabled={loading} type="submit" className="w-full mt-6 py-4 kaame-gradient-alt text-white rounded-xl font-bold hover:shadow-lg transition-all">
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
        <form onSubmit={handleFinalSubmit} className="space-y-6">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-display font-bold text-slate-900 mb-1">Ownership & Compliance</h2>
            <p className="text-slate-500 font-medium text-sm">International validation and ownership verification.</p>
          </div>

          <div className="space-y-4">
            {onfidoToken ? (
              <div className="p-8 rounded-2xl bg-blue-50 border border-blue-100 flex flex-col items-center">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                   <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                </div>
                <h3 className="text-base font-bold text-slate-800">Automated Registry Verification</h3>
                <p className="text-center text-xs text-slate-500 mt-1 mb-4">We will verify {formData.legalName} against {formData.country} registries.</p>
                <button type="button" onClick={() => setDocs({...docs, business_pan: "onfido_automated_check"})} className="py-3 px-6 kaame-gradient text-white rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all">
                   {docs.business_pan ? "Check Initiated" : "Start Registry Lookup"}
                </button>
              </div>
            ) : null}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Your Ownership (%)</label>
              <input name="ownershipPercentage" value={formData.ownershipPercentage} onChange={handleChange} placeholder="e.g. 51" className="w-full p-3 rounded-xl border border-slate-200 focus:border-accent outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Founder's Vision Statement</label>
              <textarea name="founderStatement" value={formData.founderStatement} onChange={handleChange} rows={3} placeholder="Tell us about your mission..." className="w-full p-3 rounded-xl border border-slate-200 focus:border-accent outline-none" />
            </div>
          </div>

          <div className="space-y-4">
            {[
              { id: 'incorporation_cert', label: 'Certificate of Incorporation', required: true },
              { id: 'gst_cert', label: 'GST Certificate (Bonus +20)', required: false },
              { id: 'business_pan', label: 'Business PAN (Bonus +20)', required: false },
            ].map((d) => {
              const result = ocrResults.find(r => r.type === d.id);
              return (
                <div key={d.id} className={`p-4 rounded-2xl border-2 transition-all ${docs[d.id as keyof typeof docs] ? 'border-green-100 bg-green-50/30' : 'border-slate-100 bg-white'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-bold text-slate-700">{d.label} {d.required && <span className="text-red-500">*</span>}</span>
                    {docs[d.id as keyof typeof docs] ? (
                      <span className="flex items-center gap-1 text-xs font-bold text-green-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                        UPLOADED
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-400">PENDING</span>
                    )}
                  </div>

                  {!docs[d.id as keyof typeof docs] ? (
                    <div className="relative h-20 border border-dashed border-slate-300 rounded-xl flex items-center justify-center hover:border-accent transition-colors">
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => handleDocUpload(d.id, reader.result as string);
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                      <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-white border border-green-200 flex items-center justify-center">
                         <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" /></svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">OCR Extraction</p>
                        <p className="text-xs font-mono text-slate-700 truncate">{result?.docNumber || 'Processing metadata...'}</p>
                      </div>
                      {result?.mismatch && (
                        <div className="px-2 py-1 rounded bg-amber-100 text-[10px] font-bold text-amber-600 animate-pulse">
                          FLAGGED
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <button disabled={loading} type="submit" className="w-full mt-6 py-4 kaame-gradient-alt text-white rounded-xl font-bold flex justify-center items-center gap-2 hover:shadow-xl transition-all shadow-xl shadow-slate-200">
             {loading ? <span className="animate-pulse">Analyzing Documents...</span> : "Finalize Verification"}
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
          </button>
        </form>
      )}

    </motion.div>
  );
};
