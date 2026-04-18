import { Navbar } from "@/components/navbar";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { SparklesCore } from "@/components/ui/sparkles";
import { BackgroundBeams } from "@/components/ui/background-beams";

export default function Home() {
  const words = `Where code meets competitive spirit. Build, innovate, and clash with the best developers in the industry.`;

  return (
    <main className="relative min-h-screen w-full overflow-hidden">
      <Navbar />
      
      {/* Hero Section */}
      <AuroraBackground>
        <div className="relative z-10 flex flex-col items-center justify-center px-4 pt-20">
          <div className="w-[40rem] h-40 relative">
            {/* Gradients */}
            <div className="absolute inset-x-20 top-0 bg-gradient-to-r from-transparent via-indigo-500 to-transparent h-[2px] w-3/4 blur-sm" />
            <div className="absolute inset-x-20 top-0 bg-gradient-to-r from-transparent via-indigo-500 to-transparent h-px w-3/4" />
            <div className="absolute inset-x-60 top-0 bg-gradient-to-r from-transparent via-sky-500 to-transparent h-[5px] w-1/4 blur-sm" />
            <div className="absolute inset-x-60 top-0 bg-gradient-to-r from-transparent via-sky-500 to-transparent h-px w-1/4" />

            {/* Core component */}
            <SparklesCore
              background="transparent"
              minSize={0.4}
              maxSize={1}
              particleDensity={1200}
              className="w-full h-full"
              particleColor="#FFFFFF"
            />

            {/* Radial Gradient to prevent sharp edges */}
            <div className="absolute inset-0 w-full h-full bg-black [mask-image:radial-gradient(350px_200px_at_top,transparent_20%,white)]"></div>
          </div>

          <h1 className="text-4xl md:text-8xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400 bg-opacity-50">
            DEV CLASH 2026
          </h1>
          
          <div className="mt-4 max-w-xl mx-auto">
            <TextGenerateEffect words={words} />
          </div>

          <div className="mt-10 flex gap-4">
            <button className="px-8 py-3 rounded-full bg-white text-black font-bold hover:bg-neutral-200 transition-all transform hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.3)]">
              Join the Clash
            </button>
            <button className="px-8 py-3 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm text-white font-bold hover:bg-white/10 transition-all transform hover:scale-105 active:scale-95">
              View Schedule
            </button>
          </div>
        </div>
      </AuroraBackground>

      {/* Featured Section */}
      <section className="relative h-[40rem] w-full bg-neutral-950 flex flex-col items-center justify-center antialiased overflow-hidden">
        <div className="max-w-2xl mx-auto p-4 z-10">
          <h2 className="text-3xl md:text-5xl font-bold text-center text-white mb-8">
            The Hackathon for Builders
          </h2>
          <p className="text-neutral-400 text-center max-w-lg mx-auto">
            Whether you're a frontend wizard, a backend master, or a full-stack architect, 
            Dev Clash is the place to showcase your skills and take home the grand prize.
          </p>
        </div>
        <BackgroundBeams />
      </section>

      {/* Footer */}
      <footer className="py-10 border-t border-white/10 bg-black text-neutral-500 text-center text-sm">
        <p>© 2026 Dev Clash. Built with Next.js, Tailwind CSS, & Aceternity UI.</p>
      </footer>
    </main>
  );
}
