import { KaaMeNavbar } from "@/components/kaa-me/KaaMeNavbar";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <main className="min-h-screen flex flex-col bg-[#FAFAFA]">
      <KaaMeNavbar />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side: Branding/Information Panel */}
        <div className="hidden lg:flex w-[40%] bg-slate-900 border-r border-slate-800 p-12 flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 z-0">
             <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-primary/20 to-transparent" />
             <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-[100px]" />
          </div>

          <div className="relative z-10 flex flex-col items-start gap-4">
            <h2 className="text-4xl font-display font-medium text-white tracking-tight leading-tight">
              Access the ecosystem of <span className="text-primary font-bold">verified excellence.</span>
            </h2>
            <p className="text-slate-400 text-lg max-w-sm font-medium">
              Continue building, investing, and growing within the world's most trusted professional network.
            </p>
          </div>

          <div className="relative z-10 flex flex-col gap-6">
            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-md">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    </div>
                    <h4 className="text-white font-medium text-sm tracking-wide uppercase">Network Status</h4>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-sm">Active Professionals</span>
                    <span className="text-white font-display font-bold">12,492</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                    <span className="text-slate-400 text-sm">Verified Companies</span>
                    <span className="text-white font-display font-bold">1,084</span>
                </div>
            </div>
            
            <p className="text-slate-500 text-[10px] uppercase tracking-widest font-bold">
              Secure Login Powered by KaaMe Verification
            </p>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="w-full lg:w-[60%] flex items-center justify-center bg-white overflow-y-auto pt-20 lg:pt-0">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
