"use client";

import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  Users, 
  ShieldCheck, 
  Star, 
  Clock, 
  Info,
  ChevronRight,
  Share2,
  Heart,
  Globe,
  Ticket,
  Loader2,
  ImageOff
} from "lucide-react";
import { useState, useEffect } from "react";
import { KaaMeNavbar } from "@/components/kaa-me/KaaMeNavbar";
import eventsData from "@/mock-data/events.json";
import { api } from "@/lib/api-client";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";

export default function EventDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const eventId = params.id as string;
  
  const [event, setEvent] = useState<any>(null);
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    const found = eventsData.find(e => e.id === eventId);
    if (found) {
        setEvent(found);
    }
  }, [eventId]);

  const handleRegister = async () => {
    if (!user) {
        router.push("/login?redirect=" + window.location.pathname);
        return;
    }
    
    setIsRegistering(true);
    try {
        // Since we are using mock data, the eventId might not exist in the DB.
        // For the demo, we'll try to initiate the checkout.
        const response = await api.post('/payments/checkout', { eventId: eventId });
        if (response.url) {
            window.location.href = response.url;
        }
    } catch (error) {
        console.error("Payment failed", error);
        alert("Payment initialization failed. Please try again later.");
    } finally {
        setIsRegistering(false);
    }
  };

  if (!event) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-32 selection:bg-cyan-100">
      <KaaMeNavbar />

      <main className="max-w-7xl mx-auto px-6 pt-32">
        {/* Navigation */}
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-slate-900 transition-colors mb-12 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Events
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Left Column: Content */}
          <div className="lg:col-span-8 space-y-12">
            
            {/* Header section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-widest border border-primary/20">
                  {event.type.split('/')[1]?.trim() || "Event"}
                </span>
                <span className="text-slate-400 text-xs font-bold flex items-center gap-1.5">
                   <Clock className="w-3.5 h-3.5" />
                   10:00 AM - 4:00 PM EST
                </span>
              </div>
              
              <h1 className="font-display font-bold text-6xl md:text-7xl leading-[0.9] tracking-tighter text-slate-900">
                {event.title}
              </h1>

              <div className="flex flex-wrap items-center gap-6 pt-4">
                 <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full border-2 border-white shadow-sm overflow-hidden">
                       <img src={event.hostAvatar} className="w-full h-full object-cover" />
                    </div>
                    <Link href={`/profile/${event.hostId}`} className="text-sm font-bold text-slate-900 hover:text-primary transition-colors">
                       Hosted by <span className="underline decoration-slate-200">{event.hostName}</span>
                    </Link>
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                 </div>
                 <div className="h-4 w-px bg-slate-200" />
                 <div className="flex items-center gap-1.5 text-sm font-bold text-slate-500">
                    <MapPin className="w-4 h-4 text-primary" />
                    {event.type.split('/')[0]}
                 </div>
              </div>
            </div>

            {/* Banner image */}
            <div className="aspect-[21/9] rounded-[3rem] overflow-hidden shadow-2xl relative bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
               {event.image ? (
                 <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
               ) : (
                 <div className="flex flex-col items-center gap-4 opacity-10">
                    <ImageOff className="w-16 h-16" />
                    <span className="text-sm font-black uppercase tracking-[0.2em]">No Event Visual Available</span>
                 </div>
               )}
               <div className="absolute top-6 right-6 flex gap-3">
                  <button className="p-3 bg-white/80 backdrop-blur-md rounded-2xl hover:bg-white transition-all shadow-lg shadow-black/5">
                     <Share2 className="w-5 h-5 text-slate-600" />
                  </button>
                  <button className="p-3 bg-white/80 backdrop-blur-md rounded-2xl hover:bg-white transition-all shadow-lg shadow-black/5">
                     <Heart className="w-5 h-5 text-red-500" />
                  </button>
               </div>
            </div>

            {/* Description */}
            <div className="space-y-8">
               <div className="flex items-center gap-3">
                  <Info className="w-5 h-5 text-slate-400" />
                  <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">About the event</h2>
               </div>
               <p className="text-xl text-slate-600 font-medium leading-relaxed max-w-4xl">
                  {event.description}
               </p>

               <div className="flex flex-wrap gap-2">
                  {event.tags.map((tag: string) => (
                    <span key={tag} className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-500">
                       #{tag}
                    </span>
                  ))}
               </div>
            </div>

            {/* What's included / Agenda placeholder */}
            <div className="bg-white border border-slate-100 rounded-[3rem] p-10 shadow-sm space-y-8">
                <h3 className="font-display font-bold text-2xl">Elite Outcomes</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   {[
                      { title: "Direct Networking", desc: "One-on-one time with Tier-3 industry leaders." },
                      { title: "Governance Docs", desc: "Exclusive framework access for AI safety protocols." },
                      { title: "Global Sync", desc: "Connected with builders across 14+ timezones." },
                      { title: "Certified Attendance", desc: "Identity-backed participation certificate." }
                   ].map((item, i) => (
                      <div key={i} className="flex gap-4">
                         <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center text-primary flex-shrink-0">
                            <Star className="w-6 h-6" />
                         </div>
                         <div>
                            <p className="font-bold text-slate-900">{item.title}</p>
                            <p className="text-sm text-slate-500 font-medium">{item.desc}</p>
                         </div>
                      </div>
                   ))}
                </div>
            </div>
          </div>

          {/* Right Column: Sticky Pricing & Host info */}
          <div className="lg:col-span-4">
             <div className="sticky top-32 space-y-8">
                {/* Booking Card */}
                <div className="bg-slate-900 rounded-[3rem] p-8 text-white shadow-2xl relative overflow-hidden group">
                   <div className="grain-filter absolute inset-0 opacity-10 pointer-events-none" />
                   
                   <div className="relative z-10 space-y-8">
                      <div className="space-y-1">
                         <span className="text-[10px] font-black uppercase tracking-widest text-white/50">Registration Package</span>
                         <div className="flex items-baseline gap-2">
                            <span className="text-5xl font-display font-bold">
                               {event.price > 0 ? `${event.price}${event.currency === 'USD' ? '$' : event.currency}` : "Free"}
                            </span>
                            {event.price > 0 && <span className="text-sm font-bold text-white/40">/ person</span>}
                         </div>
                      </div>

                      <div className="space-y-4 pt-4 border-t border-white/10">
                         <div className="flex items-center gap-3 text-sm font-medium text-white/70">
                            <Ticket className="w-4 h-4 text-primary" />
                            Includes Private Session Access
                         </div>
                         <div className="flex items-center gap-3 text-sm font-medium text-white/70">
                            <Users className="w-4 h-4 text-primary" />
                            Only {Math.floor(Math.random() * 20) + 5} spots remaining
                         </div>
                      </div>

                      <button 
                        onClick={handleRegister}
                        disabled={isRegistering}
                        className="w-full py-5 bg-white text-slate-900 rounded-2xl font-display font-bold text-xl hover:bg-primary hover:text-white transition-all shadow-xl shadow-black/20 flex items-center justify-center gap-3 disabled:opacity-50"
                      >
                         {isRegistering ? <Loader2 className="w-6 h-6 animate-spin" /> : <Ticket className="w-6 h-6" />}
                         {event.price > 0 ? "Secure Private Pass" : "Register Free"}
                      </button>

                      <p className="text-center text-[10px] font-bold text-white/30 uppercase tracking-widest">
                         Backed by identity escrow. Non-refundable.
                      </p>
                   </div>
                </div>

                {/* Host Preview Card */}
                <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm space-y-6">
                   <div className="flex items-center justify-between">
                       <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">The Organizer</h3>
                       <div className="flex items-center gap-1.5 px-2 py-0.5 bg-amber-50 text-amber-600 rounded-full text-[10px] font-black tracking-tighter">
                          <Star className="w-3 h-3 fill-amber-600" />
                          {event.hostRating}
                       </div>
                   </div>

                   <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-3xl overflow-hidden shadow-lg">
                         <img src={event.hostAvatar} className="w-full h-full object-cover" />
                      </div>
                      <div>
                         <h4 className="font-bold text-slate-900">{event.hostName}</h4>
                         <p className="text-xs text-slate-500 font-medium">Expert in {event.tags[0]}</p>
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-3 pb-2">
                       <div className="bg-slate-50 p-3 rounded-2xl text-center">
                          <div className="text-xs font-black text-slate-900">{event.totalHosted}</div>
                          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Events</div>
                       </div>
                       <div className="bg-slate-50 p-3 rounded-2xl text-center">
                          <div className="text-xs font-black text-slate-900">1.2k</div>
                          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Network</div>
                       </div>
                   </div>

                   <Link href={`/profile/${event.hostId}`}>
                       <button className="w-full py-3 bg-slate-50 text-slate-900 border border-slate-200 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-100 transition-all flex items-center justify-center gap-2">
                          View Host Profile
                          <ChevronRight className="w-4 h-4" />
                       </button>
                   </Link>
                </div>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}
