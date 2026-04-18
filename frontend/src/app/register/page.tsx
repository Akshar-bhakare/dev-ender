import { KaaMeNavbar } from "@/components/kaa-me/KaaMeNavbar";
import { RegisterWizard } from "@/components/auth/RegisterWizard";

export default function RegisterPage() {
  return (
    <main className="min-h-screen flex flex-col bg-[#FAFAFA]">
      <KaaMeNavbar />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side: Branding/Information Panel */}
        <div className="hidden lg:flex w-[40%] bg-slate-900 border-r border-slate-800 p-12 flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 z-0">
             {/* Simple subtle background effect in lieu of complex elements */}
             <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-primary/20 to-transparent" />
             <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-[100px]" />
          </div>

          <div className="relative z-10 flex flex-col items-start gap-4">
            <h2 className="text-4xl font-display font-medium text-white tracking-tight leading-tight">
              Join the ecosystem built for <span className="text-primary font-bold">verified trust.</span>
            </h2>
            <p className="text-slate-400 text-lg max-w-sm font-medium">
              Join thousands of founders, verified professionals, and elite companies building the future together.
            </p>
          </div>

          <div className="relative z-10 bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              </div>
              <div>
                 <h4 className="text-white font-medium">100% Verified Humans</h4>
                 <p className="text-slate-400 text-sm">Face & ID checks keep SyncUp safe.</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <div>
                 <h4 className="text-white font-medium">Dynamic Trust Score</h4>
                 <p className="text-slate-400 text-sm">Earn reputation just by participating.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Wizard */}
        <div className="w-full lg:w-[60%] flex-1 overflow-y-auto bg-white">
          <RegisterWizard />
        </div>
      </div>
    </main>
  );
}
