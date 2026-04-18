'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Globe, FileText, Camera, Upload, CheckCircle2,
  XCircle, Loader2, AlertCircle, ArrowRight, ChevronDown, ShieldCheck
} from 'lucide-react';

// ─── Country → Doc Type Map ─────────────────────────────────────────────────
const COUNTRY_DOCS: Record<string, { label: string; docs: string[] }> = {
  IN: { label: '🇮🇳 India', docs: ['Aadhaar Card', 'PAN Card', 'Driving Licence', 'Voter ID', 'Passport'] },
  US: { label: '🇺🇸 United States', docs: ['Passport', "Driver's License", 'State ID', 'Social Security Card'] },
  GB: { label: '🇬🇧 United Kingdom', docs: ['Passport', 'Driving Licence', 'National Insurance Card'] },
  CA: { label: '🇨🇦 Canada', docs: ['Passport', "Driver's License", 'Health Card', 'SIN Card'] },
  AU: { label: '🇦🇺 Australia', docs: ['Passport', "Driver's Licence", 'Medicare Card'] },
  DE: { label: '🇩🇪 Germany', docs: ['Personalausweis (National ID)', 'Passport', 'Driving Licence'] },
  FR: { label: '🇫🇷 France', docs: ["Carte d'identité", 'Passport', 'Driving Licence'] },
  AE: { label: '🇦🇪 UAE', docs: ['Emirates ID', 'Passport', 'Driving Licence'] },
  SG: { label: '🇸🇬 Singapore', docs: ['NRIC', 'Passport', 'Driving Licence'] },
  JP: { label: '🇯🇵 Japan', docs: ['My Number Card', 'Passport', "Driver's License"] },
  CN: { label: '🇨🇳 China', docs: ['Resident Identity Card', 'Passport'] },
  BR: { label: '🇧🇷 Brazil', docs: ['CPF', 'RG', 'Passport', "Driver's License"] },
  ZA: { label: '🇿🇦 South Africa', docs: ['Smart ID Card', 'Green Barcoded ID', 'Passport'] },
  OTHER: { label: '🌐 Other', docs: ['Passport', 'National ID Card'] },
};

type VerifyStep = 'nationality' | 'upload' | 'loading' | 'success' | 'rejected';

export default function VerifyPage() {
  const router = useRouter();
  const [step, setStep] = useState<VerifyStep>('nationality');

  // Nationality step
  const [countryCode, setCountryCode] = useState('');
  const [docType, setDocType] = useState('');
  const [nationalityError, setNationalityError] = useState('');

  // Upload step
  const [docFile, setDocFile] = useState<File | null>(null);
  const [docPreview, setDocPreview] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [camOpen, setCamOpen] = useState(false);
  const [camStream, setCamStream] = useState<MediaStream | null>(null);

  // Result
  const [rejectReason, setRejectReason] = useState('');

  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  // Guard: redirect to login if not authenticated
  React.useEffect(() => {
    if (!token) {
      router.replace('/login?redirect=/verify');
    }
  }, []);

  const selectedCountry = COUNTRY_DOCS[countryCode];

  // ── Step 1: Nationality ──────────────────────────────────────────────────
  const handleNationalityNext = () => {
    if (!countryCode) return setNationalityError('Please select your country');
    if (!docType) return setNationalityError('Please select a document type');
    setNationalityError('');
    setStep('upload');
  };

  // ── Camera helpers ───────────────────────────────────────────────────────
  const openCamera = async () => {
    try {
      const ms = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
      setCamStream(ms); setCamOpen(true);
      setTimeout(() => { if (videoRef.current) videoRef.current.srcObject = ms; }, 100);
    } catch { setUploadError('Camera unavailable — please upload a file instead.'); }
  };

  const captureFromCamera = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d')!;
    ctx.drawImage(videoRef.current, 0, 0, 640, 480);
    canvasRef.current.toBlob(blob => {
      if (blob) {
        const f = new File([blob], `${docType.replace(/\s/g, '_')}.jpg`, { type: 'image/jpeg' });
        setDocFile(f); setDocPreview(URL.createObjectURL(f));
      }
      camStream?.getTracks().forEach(t => t.stop());
      setCamStream(null); setCamOpen(false);
    }, 'image/jpeg', 0.9);
  };

  const handleFileSelect = (f: File) => {
    setDocFile(f); setDocPreview(URL.createObjectURL(f)); setUploadError('');
  };

  // ── Step 2 → Submit ──────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!docFile) return setUploadError('Please upload or capture your document');
    setUploadError('');
    setStep('loading');

    try {
      const fd = new FormData();
      fd.append('file', docFile, docFile.name);
      fd.append('nationality', countryCode);
      fd.append('docType', docType);

      const res = await fetch(`${API}/api/auth/verify-doc`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });

      const json = await res.json();

      if (res.ok && json.verified) {
        setStep('success');
        // Redirect to feed after 2.5s
        setTimeout(() => router.push('/feed'), 2500);
      } else {
        setRejectReason(json.message || 'Document verification failed. Please try again.');
        setStep('rejected');
      }
    } catch {
      setRejectReason('Network error. Please check your connection and try again.');
      setStep('rejected');
    }
  };

  if (!token) return null; // Avoid flash before redirect

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-cyan-100 rounded-2xl flex items-center justify-center text-cyan-600 mx-auto mb-4">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Identity Verification</h1>
          <p className="text-slate-500 text-sm mt-1">Verify your document to unlock full KaaMe access</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6">

          {/* ── STEP 1: NATIONALITY ── */}
          {step === 'nationality' && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-cyan-500" /> Select Your Country
                </h2>
                <p className="text-slate-500 text-xs">We'll ask for the right document based on your country.</p>
              </div>

              {/* Country select */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Country / Nationality</label>
                <div className="relative">
                  <select
                    value={countryCode}
                    onChange={e => { setCountryCode(e.target.value); setDocType(''); }}
                    className="w-full pl-4 pr-10 py-3 border border-slate-200 rounded-xl bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm appearance-none cursor-pointer"
                  >
                    <option value="">— Select country —</option>
                    {Object.entries(COUNTRY_DOCS).map(([code, { label }]) => (
                      <option key={code} value={code}>{label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Doc type — shown after country selected */}
              {selectedCountry && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Document Type</label>
                  <div className="grid grid-cols-1 gap-2">
                    {selectedCountry.docs.map(doc => (
                      <button
                        key={doc}
                        onClick={() => setDocType(doc)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium text-left transition-all
                          ${docType === doc
                            ? 'border-slate-900 bg-slate-900 text-white'
                            : 'border-slate-200 text-slate-700 hover:border-slate-400 hover:bg-slate-50'}`}
                      >
                        <FileText className="w-4 h-4 flex-shrink-0" />
                        {doc}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {nationalityError && (
                <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-2 text-rose-600 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />{nationalityError}
                </div>
              )}

              <button onClick={handleNationalityNext}
                className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all active:scale-[0.98]">
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* ── STEP 2: UPLOAD ── */}
          {step === 'upload' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-cyan-500" /> Upload {docType}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full font-medium">{selectedCountry?.label}</span>
                  <span className="text-xs px-2 py-0.5 bg-cyan-50 text-cyan-700 rounded-full font-medium border border-cyan-100">{docType}</span>
                </div>
              </div>

              <input ref={fileRef} type="file" accept="image/*" className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); }} />

              {/* Camera view */}
              {camOpen ? (
                <div className="space-y-3">
                  <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-slate-900">
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                    <div className="absolute inset-4 border-2 border-dashed border-white/60 rounded-xl pointer-events-none" />
                    <canvas ref={canvasRef} width={640} height={480} className="hidden" />
                  </div>
                  <button onClick={captureFromCamera}
                    className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all">
                    <Camera className="w-4 h-4" /> Capture Document
                  </button>
                  <button onClick={() => { camStream?.getTracks().forEach(t => t.stop()); setCamOpen(false); setCamStream(null); }}
                    className="w-full text-slate-400 text-xs hover:text-slate-600 transition-colors">← Back</button>
                </div>
              ) : (
                <>
                  {/* Upload / Preview box */}
                  <div onClick={() => fileRef.current?.click()}
                    className="w-full h-48 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-slate-400 hover:bg-slate-50 transition-all overflow-hidden">
                    {docPreview
                      ? <img src={docPreview} alt="Document" className="w-full h-full object-cover" />
                      : <>
                          <Upload className="w-10 h-10 text-slate-300" />
                          <span className="text-sm text-slate-400 font-medium">Click to upload <strong>{docType}</strong></span>
                          <span className="text-xs text-slate-300">Front side · JPG, PNG or WEBP</span>
                        </>}
                  </div>

                  <div className="flex gap-2">
                    <button onClick={openCamera}
                      className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-semibold flex items-center justify-center gap-1 hover:bg-slate-50 text-sm transition-all">
                      <Camera className="w-4 h-4" /> Use Camera
                    </button>
                    {docPreview && (
                      <button onClick={() => { setDocFile(null); setDocPreview(null); }}
                        className="px-4 py-2.5 border border-slate-200 text-slate-500 rounded-xl hover:bg-slate-50 text-sm transition-all">
                        Clear
                      </button>
                    )}
                  </div>
                </>
              )}

              {uploadError && (
                <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-2 text-rose-600 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />{uploadError}
                </div>
              )}

              <button onClick={handleSubmit} disabled={!docFile}
                className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]">
                <ShieldCheck className="w-4 h-4" /> Verify My Document
              </button>

              <button onClick={() => setStep('nationality')}
                className="w-full text-slate-400 hover:text-slate-600 text-xs transition-colors py-1">
                ← Change country or document type
              </button>
            </div>
          )}

          {/* ── LOADING ── */}
          {step === 'loading' && (
            <div className="flex flex-col items-center justify-center py-16 gap-5 text-center">
              <div className="relative">
                <div className="w-20 h-20 rounded-full border-4 border-slate-100 border-t-cyan-500 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <FileText className="w-8 h-8 text-slate-400" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Verifying your {docType}…</h3>
                <p className="text-slate-500 text-sm mt-1">This takes just a moment. Please don't close this page.</p>
              </div>
              <div className="flex gap-1 mt-2">
                {[0, 1, 2].map(i => (
                  <div key={i} className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          )}

          {/* ── SUCCESS ── */}
          {step === 'success' && (
            <div className="flex flex-col items-center justify-center py-12 gap-5 text-center">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center animate-in zoom-in duration-300">
                <CheckCircle2 className="w-12 h-12 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-900">Verified! 🎉</h3>
                <p className="text-slate-500 text-sm mt-2">Your <strong>{docType}</strong> has been successfully verified and saved.</p>
                <p className="text-slate-400 text-xs mt-3">Redirecting to your feed…</p>
              </div>
            </div>
          )}

          {/* ── REJECTED ── */}
          {step === 'rejected' && (
            <div className="flex flex-col items-center justify-center py-10 gap-5 text-center">
              <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center animate-in zoom-in duration-300">
                <XCircle className="w-12 h-12 text-rose-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Verification Failed</h3>
                <p className="text-rose-600 text-sm mt-2 font-medium">{rejectReason}</p>
              </div>
              <button onClick={() => { setStep('upload'); setDocFile(null); setDocPreview(null); }}
                className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all">
                Try Again
              </button>
              <button onClick={() => { setStep('nationality'); setCountryCode(''); setDocType(''); setDocFile(null); setDocPreview(null); }}
                className="text-slate-400 text-sm hover:text-slate-600 transition-colors">
                Change document type
              </button>
            </div>
          )}

        </div>
      </div>
    </main>
  );
}
