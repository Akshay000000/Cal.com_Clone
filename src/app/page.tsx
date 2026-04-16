"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { Clock, Globe, ChevronRight, ChevronDown, ChevronLeft, MapPin, Video, Monitor, Phone, Users, MessageSquare, MicOff } from "lucide-react";
import Navbar from "@/components/Navbar";

/* ── Hero animated booking cards data ── */
const heroProfiles = [
  {
    avatar: "🧑‍💼",
    name: "Cédric van Ravesteijn",
    title: "Partnerships Meeting",
    desc: "Are you an agency, influencer, SaaS founder, or business looking to collaborate with Cal.com? Let's chat!",
    location: "Cal Video",
    timezone: "Europe/Amsterdam",
    selectedDuration: "30m",
  },
  {
    avatar: "📸",
    name: "Isabella Valce",
    title: "Photoshoot",
    desc: "Capture your special moments with our professional photography services today.",
    location: "Rock Wall Woods",
    timezone: "South America/Rio de Jane",
    selectedDuration: "45m",
  },
  {
    avatar: "💻",
    name: "Akshay Kumar",
    title: "Technical Interview",
    desc: "Let's discuss your technical skills and see if we're a good fit for each other.",
    location: "Cal Video",
    timezone: "Asia/Kolkata",
    selectedDuration: "1h",
  },
];

/* ── Custom link animated profiles ── */
const customLinkProfiles = [
  {
    id: "bailey",
    name: "Bailey Pumfleet",
    initial: "B",
    title: "Business meeting",
    desc: "Want to talk strategy, partnerships, or the bigger picture of scheduling infrastructure? Let's discuss how Cal.com fits into your business goals.",
    duration: "15m",
    platform: "Zoom",
    timezone: "North America/California"
  },
  {
    id: "rajiv",
    name: "Rajiv Sahal",
    initial: "R",
    title: "Platform API Meeting",
    desc: "Interested in building on top of Cal.com or integrating our platform API into your product? Let's explore what's possible together.",
    duration: "45m",
    platform: "MS Teams",
    timezone: "Asia/Delhi"
  },
  {
    id: "ewa",
    name: "Ewa Michalak",
    initial: "E",
    title: "Marketing Strategy Session",
    desc: "Let's collaborate on campaigns, co-marketing opportunities, and learn how Cal.com is approaching growth and brand.",
    duration: "30m",
    platform: "Google Meet",
    timezone: "Europe/Warsaw"
  }
];

/* ── Buffer animated profiles ── */
const bufferProfiles = [
  {
    minNotice: "24 hours",
    bufferBefore: "30 mins",
    bufferAfter: "30 mins",
    interval: "Use event length (default)"
  },
  {
    minNotice: "48 hours",
    bufferBefore: "1 hour",
    bufferAfter: "15 mins",
    interval: "30 mins"
  },
  {
    minNotice: "4 hours",
    bufferBefore: "15 mins",
    bufferAfter: "0 mins",
    interval: "15 mins"
  }
];

/* ── Reminder animated profiles ── */
const reminderProfiles = [
  {
    title: "Meeting is starting now",
    time: "Just now",
    desc: "Your meeting is starting now. Hurry up!"
  },
  {
    title: "Meeting starts in 15 mins",
    time: "15 mins",
    desc: "Your next meeting is starting in 15 mins"
  },
  {
    title: "Booking rescheduled",
    time: "30 mins",
    desc: "Melissa Smith has rescheduled the meeting to Wed, 25 Mar 15:00."
  },
  {
    title: "New booking received",
    time: "2 hours",
    desc: "Alex Johnson just booked a 30m Intro Call with you."
  },
  {
    title: "Daily schedule summary",
    time: "8:00 AM",
    desc: "You have 4 meetings scheduled for today."
  }
];

function MiniCalendar({ highlightedDays }: { highlightedDays: number[] }) {
  const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const weeks = [
    [null, null, null, 1, 2, 3, 4],
    [5, 6, 7, 8, 9, 10, 11],
    [12, 13, 14, 15, 16, 17, 18],
    [19, 20, 21, 22, 23, 24, 25],
    [26, 27, 28, 29, 30, 31, null],
  ];

  // Specific selected day for the mock animation (e.g. 8th, 15th depending on active profile)
  const selectedDay = highlightedDays[2] || 8;

  return (
    <div>
      {/* mini calendar content */}
      <div className="flex items-center justify-between mb-5">
        <span className="text-[16px] font-bold text-[#1a1a1a]">
          May <span className="text-[#898989] font-normal">2025</span>
        </span>
      </div>
      <div className="grid grid-cols-7 gap-y-2 gap-x-1">
        {days.map((d) => (
          <div key={d} className="text-center text-[11px] font-bold text-[#898989] pb-3 tracking-wider">
            {d}
          </div>
        ))}
        {weeks.flat().map((day, i) => (
          <div key={i} className="flex flex-col items-center justify-center h-12 w-full relative group cursor-pointer">
            {day !== null && (
              <div
                className={`flex items-center justify-center h-[40px] w-[40px] text-[15px] font-semibold rounded-full transition-all duration-300 ${
                  day === selectedDay
                    ? "bg-[#111827] text-white shadow-md transform scale-105"
                    : highlightedDays.includes(day)
                    ? "bg-[#f3f4f6] text-[#111827] group-hover:bg-[#e5e7eb] group-hover:scale-105 transform"
                    : "text-[#6b7280] group-hover:bg-gray-50"
                }`}
              >
                {day}
              </div>
            )}
            {/* The small dot indicator below the numbers */}
            {day !== null && highlightedDays.includes(day) && (
              <span className={`absolute bottom-[2px] h-[4px] w-[4px] rounded-full transition-transform duration-300 ${day === selectedDay ? 'bg-white scale-110' : 'bg-[#d1d5db] group-hover:scale-110'}`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function LandingPage() {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();

  // Redirect signed-in users straight to the dashboard
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.replace("/event-types");
    }
  }, [isLoaded, isSignedIn, router]);

  const [currentProfile, setCurrentProfile] = useState(0);
  const [fadeIn, setFadeIn] = useState(true);

  // Additional state for custom link animation
  const [currentLink, setCurrentLink] = useState(0);
  const [linkFadeIn, setLinkFadeIn] = useState(true);

  // Additional state for buffer animation
  const [currentBuffer, setCurrentBuffer] = useState(0);
  const [bufferFadeIn, setBufferFadeIn] = useState(true);

  // Additional state for reminder animation
  const [currentReminder, setCurrentReminder] = useState(0);
  const [reminderFadeIn, setReminderFadeIn] = useState(true);

  // Cycle through main hero profiles every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setFadeIn(false);
      setTimeout(() => {
        setCurrentProfile((prev) => (prev + 1) % heroProfiles.length);
        setFadeIn(true);
      }, 400);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Cycle through custom link profiles
  useEffect(() => {
    const interval = setInterval(() => {
      setLinkFadeIn(false);
      setTimeout(() => {
        setCurrentLink((prev) => (prev + 1) % customLinkProfiles.length);
        setLinkFadeIn(true);
      }, 400);
    }, 4500); // slightly staggered from main interval
    return () => clearInterval(interval);
  }, []);

  // Cycle through buffer profiles
  useEffect(() => {
    const interval = setInterval(() => {
      setBufferFadeIn(false);
      setTimeout(() => {
        setCurrentBuffer((prev) => (prev + 1) % bufferProfiles.length);
        setBufferFadeIn(true);
      }, 400);
    }, 5000); // staggered to run every 5s
    return () => clearInterval(interval);
  }, []);

  // Cycle through reminder profiles
  useEffect(() => {
    const interval = setInterval(() => {
      setReminderFadeIn(false);
      setTimeout(() => {
        setCurrentReminder((prev) => (prev + 1) % reminderProfiles.length);
        setReminderFadeIn(true);
      }, 400);
    }, 5500); // staggered to run every 5.5s
    return () => clearInterval(interval);
  }, []);

  const profile = heroProfiles[currentProfile];
  const highlightedDays = currentProfile === 0 ? [6, 15, 20, 21, 27, 28, 29, 30] : currentProfile === 1 ? [6, 7, 8, 16, 20, 21, 27, 28, 29, 30] : [6, 7, 14, 15, 20, 21, 22, 27, 28, 29];

  const linkProfile = customLinkProfiles[currentLink];
  const bufferProfile = bufferProfiles[currentBuffer];
  const reminderProfile = reminderProfiles[currentReminder];

  return (
    <div className="min-h-screen bg-[#f0f0f0] sm:p-3 md:p-4 font-sans flex flex-col">
      <div className="mx-auto w-full max-w-[1440px] flex-1 rounded-[24px] md:rounded-[36px] bg-[#fafafa] shadow-2xl ring-1 ring-black/5 flex flex-col">
      <Navbar />

      {/* ═══════════ HERO ═══════════ */}
      <section className="pt-12 pb-8 px-6">
        <div className="mx-auto max-w-[1120px] flex flex-col lg:flex-row items-start gap-12 lg:gap-16">
          {/* Left side */}
          <div className="flex-1 pt-4">
            {/* Badge */}
            <Link
              href="#"
              className="group inline-flex items-center gap-1.5 rounded-full border border-[#e0e0e0] bg-white px-3.5 py-1.5 text-[13px] font-medium text-[#292929] mb-7 hover:border-[#ccc] transition-colors shadow-sm"
            >
              Cal.com launches v6.4
              <ChevronRight className="h-3 w-3 text-[#898989] group-hover:translate-x-0.5 transition-transform" />
            </Link>

            {/* Heading */}
            <h1 className="text-[48px] sm:text-[60px] font-black text-[#1a1a1a] leading-[1.05] tracking-[-0.03em] mb-6 drop-shadow-sm">
              With us, appointment<br />scheduling is easy
            </h1>

            {/* Description */}
            <p className="text-[17px] text-[#666] leading-[1.6] mb-8 font-medium">
              for fast-growing modern companies.
            </p>

            {/* CTA buttons */}
            <div className="flex items-center gap-3">
              <Link
                href="/sign-up"
                className="inline-flex items-center justify-center gap-1.5 rounded-full bg-[#1a1a1a] px-6 py-3 text-[15px] font-semibold text-white hover:bg-black transition-all shadow-md hover:shadow-lg"
              >
                Get started <ChevronRight className="h-4 w-4 opacity-80" />
              </Link>
              <Link
                href="#"
                className="inline-flex items-center justify-center gap-1.5 rounded-full border border-[#e0e0e0] bg-white px-6 py-3 text-[15px] font-semibold text-[#1a1a1a] hover:bg-[#fafafa] transition-all"
              >
                Book a demo <ChevronRight className="h-4 w-4 opacity-60" />
              </Link>
            </div>
          </div>

          {/* Right side — animated booking card */}
          <div className="flex-shrink-0 w-full xl:w-[600px] lg:w-[540px]">
            <div className="rounded-[20px] border border-[#e5e5e5] bg-white shadow-[0_8px_32px_rgba(0,0,0,0.08)] overflow-hidden">
              <div className="flex flex-col md:flex-row">
                {/* Event info */}
                <div
                  className={`p-7 md:p-8 md:w-[260px] border-b md:border-b-0 md:border-r border-[#eee] transition-all duration-500 bg-white z-10 ${
                    fadeIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
                  }`}
                >
                  <p className="text-[12px] text-[#898989] font-medium">{profile.name}</p>
                  <p className="text-[17px] font-bold text-[#1a1a1a] mt-0.5 tracking-tight">{profile.title}</p>
                  <p className="text-[12.5px] text-[#898989] mt-3 leading-relaxed">{profile.desc}</p>

                  {/* Duration pills */}
                  <div className="flex items-center gap-1.5 mt-4">
                    <Clock className="h-3.5 w-3.5 text-[#898989]" />
                    {["15m", "30m", "45m", "1h"].map((d) => (
                      <span
                        key={d}
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold transition-colors ${
                          d === profile.selectedDuration
                            ? "bg-[#292929] text-white"
                            : "border border-[#e0e0e0] text-[#666]"
                        }`}
                      >
                        {d}
                      </span>
                    ))}
                  </div>

                  {/* Location */}
                  <div className="mt-3 space-y-1.5">
                    <p className="flex items-center gap-1.5 text-[12px] text-[#666]">
                      {profile.location === "Cal Video" ? (
                        <Video className="h-3 w-3 text-[#898989]" />
                      ) : (
                        <MapPin className="h-3 w-3 text-[#898989]" />
                      )}
                      {profile.location}
                    </p>
                    <p className="flex items-center gap-1.5 text-[12px] text-[#666]">
                      <Globe className="h-3 w-3 text-[#898989]" />
                      {profile.timezone}
                      <ChevronDown className="h-2.5 w-2.5 text-[#aaa]" />
                    </p>
                  </div>
                </div>

                {/* Calendar */}
                <div className="p-7 md:p-8 flex-1 relative bg-white flex flex-col justify-center">
                  <MiniCalendar highlightedDays={highlightedDays} />
                </div>
              </div>
            </div>

            {/* Ratings bar — matches Cal.com's layout */}
            <div className="mt-8 flex items-center justify-center gap-10">
              {/* Trustpilot */}
              <div className="flex flex-col items-center gap-1.5">
                <div className="flex gap-[2px]">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="w-[18px] h-[18px] bg-[#00b67a] flex items-center justify-center">
                      <span className="text-white text-[10px]">★</span>
                    </div>
                  ))}
                </div>
                <span className="text-[11px] font-bold text-[#292929]">★ Trustpilot</span>
              </div>
              {/* Product Hunt */}
              <div className="flex flex-col items-center gap-1.5">
                <span className="text-[#f5a623] text-[16px] tracking-tight">★★★★★</span>
                <span className="inline-flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[#da552f] text-white text-[10px] font-bold">P</span>
              </div>
              {/* Google */}
              <div className="flex flex-col items-center gap-1.5">
                <div className="flex items-center">
                  <span className="text-[#f5a623] text-[16px] tracking-tight">★★★★★</span>
                </div>
                <svg viewBox="0 0 24 24" className="h-[16px] w-[16px]">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ HOW IT WORKS ═══════════ */}
      <section className="py-16 px-6">
        <div className="mx-auto max-w-[1120px] text-center mb-10">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#e0e0e0] bg-white px-4 py-2 text-[13px] font-medium text-[#292929] shadow-sm">
            How it works
          </div>
          <h2 className="text-[36px] sm:text-[44px] font-extrabold text-[#292929] leading-[1.08] tracking-[-0.03em] mb-3">
            With us, appointment
            <br className="hidden sm:block" />
            scheduling is easy
          </h2>
          <p className="text-[15px] text-[#666] max-w-lg mx-auto mb-6 leading-relaxed italic">
            Effortless scheduling for business and individuals, powerful solutions
            <br className="hidden sm:block" />
            for fast-growing modern companies.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-1 rounded-lg bg-[#292929] px-5 py-2.5 text-[13px] font-semibold text-white hover:bg-[#1a1a1a] transition-colors"
            >
              Get started <ChevronRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              href="/book/30min"
              className="inline-flex items-center gap-1 rounded-lg border border-[#e0e0e0] bg-white px-5 py-2.5 text-[13px] font-medium text-[#292929] hover:bg-[#fafafa] transition-colors"
            >
              Book a demo <ChevronRight className="h-3.5 w-3.5 text-[#898989]" />
            </Link>
          </div>
        </div>

        {/* 3 cards */}
        <div className="mx-auto max-w-[1120px] grid lg:grid-cols-3 gap-6">
          
          {/* Card 1: Connect your calendar */}
          <div className="rounded-2xl border border-[#e5e5e5] bg-white p-7 shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] group overflow-hidden">
            <div className="flex h-[32px] w-[34px] items-center justify-center rounded-[8px] bg-[#f1f5f9] text-[13px] font-bold text-[#64748b] mb-6">
              01
            </div>
            <h3 className="text-[19px] font-bold text-[#1a1a1a] mb-2.5 tracking-[-0.02em]">Connect your calendar</h3>
            <p className="text-[15px] text-[#71717a] leading-[1.6] mb-8">
              We&apos;ll handle all the cross-referencing, so you don&apos;t have to worry about double bookings.
            </p>
            
            {/* Graphic */}
            <div className="relative flex items-center justify-center h-[200px] mt-6 w-full">
              <style jsx>{`
                @keyframes spin-cw { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @keyframes spin-ccw { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
                .orbit-cw-outer { animation: spin-cw 24s linear infinite; }
                .orbit-cw-inner { animation: spin-cw 24s linear infinite; }
                .orbit-ccw-outer { animation: spin-ccw 24s linear infinite; }
                .orbit-ccw-inner { animation: spin-ccw 24s linear infinite; }
                .group:hover .orbit-cw-outer { animation-duration: 8s; }
                .group:hover .orbit-cw-inner { animation-duration: 8s; }
                .group:hover .orbit-ccw-outer { animation-duration: 8s; }
                .group:hover .orbit-ccw-inner { animation-duration: 8s; }
              `}</style>
              
              {/* Outer Ring: Holds Apple & Google Calendar */}
              <div className="absolute w-[210px] h-[210px] rounded-full border border-[#f4f4f5] orbit-cw-outer flex items-center justify-center">
                {/* Google Calendar (Top) */}
                <div className="absolute w-[28px] h-[28px] rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)] flex items-center justify-center orbit-ccw-outer" style={{ top: '-14px', left: 'calc(50% - 14px)' }}>
                  <div className="w-[14px] h-[14px] rounded-[3px] bg-[#4285F4] flex items-center justify-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-0 h-0 border-t-[4px] border-r-[4px] border-t-white/30 border-r-transparent"></div>
                    <span className="text-white text-[7px] font-bold leading-none mt-[1px]">31</span>
                  </div>
                </div>
                {/* Apple Calendar (Bottom Left) */}
                <div className="absolute w-[28px] h-[28px] rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)] flex items-center justify-center orbit-ccw-outer" style={{ top: '144px', left: '0px' }}>
                   <div className="w-[14px] h-[14px] rounded-[3px] bg-white border border-[#e5e5e5] overflow-hidden flex flex-col justify-between">
                     <div className="h-[4px] w-full bg-[#ef4444]"></div>
                     <span className="text-[#1a1a1a] text-[7px] font-bold leading-none text-center mb-[1px]">17</span>
                   </div>
                </div>
              </div>
              
              {/* Inner Ring: Holds Outlook */}
              <div className="absolute w-[130px] h-[130px] rounded-full border border-[#f4f4f5] orbit-cw-inner flex items-center justify-center">
                {/* Outlook (Bottom Right) */}
                <div className="absolute w-[28px] h-[28px] rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)] flex items-center justify-center orbit-ccw-inner" style={{ top: '84px', right: '-5px' }}>
                  <div className="w-[14px] h-[14px] rounded-[3px] bg-[#0078D4] flex items-center justify-center">
                     <span className="text-white text-[8px] font-bold leading-none">O</span>
                  </div>
                </div>
              </div>

              {/* Center Pill */}
              <div className="absolute z-10 bg-[#f4f4f5] px-5 py-2 rounded-full font-bold text-[#1a1a1a] text-[15px] tracking-tight border border-[#e4e4e7]/50 shadow-[0_1px_4px_rgba(0,0,0,0.02)]">
                Cal.com
              </div>
            </div>
          </div>

          {/* Card 2: Set your availability */}
          <div className="rounded-2xl border border-[#e5e5e5] bg-white p-7 shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] group overflow-hidden flex flex-col">
            <div>
              <div className="flex h-[32px] w-[34px] items-center justify-center rounded-[8px] bg-[#f1f5f9] text-[13px] font-bold text-[#64748b] mb-6">
                02
              </div>
              <h3 className="text-[19px] font-bold text-[#1a1a1a] mb-2.5 tracking-[-0.02em]">Set your availability</h3>
              <p className="text-[15px] text-[#71717a] leading-[1.6] mb-8">
                Want to block off weekends? Set up any buffers? We make that easy.
              </p>
            </div>
            
            {/* Graphic - Stacked Cards */}
            <div className="relative h-[180px] mt-auto w-full flex justify-center">
              <style jsx>{`
                @keyframes toggle-on { 0% { background: #e4e4e7; } 100% { background: #18181b; } }
                @keyframes toggle-off { 0% { background: #18181b; } 100% { background: #e4e4e7; } }
                @keyframes dot-on { 0% { left: 2px; } 100% { left: 16px; } }
                @keyframes dot-off { 0% { left: 16px; } 100% { left: 2px; } }
                
                .group:hover .t-bg { animation: toggle-off 0.5s forwards ease-in-out; }
                .t-bg { animation: toggle-on 0.5s forwards ease-in-out; }
                .group:hover .t-dot { animation: dot-off 0.5s forwards ease-in-out; }
                .t-dot { animation: dot-on 0.5s forwards ease-in-out; }
              `}</style>
              
              {/* Back Card 2 */}
              <div className="absolute top-[30px] w-[90%] h-[120px] rounded-t-[12px] border border-[#e5e5e5] bg-white shadow-sm transition-transform duration-500 group-hover:-translate-y-2 group-hover:scale-100 opacity-40"></div>
              {/* Back Card 1 */}
              <div className="absolute top-[40px] w-[95%] h-[120px] rounded-t-[12px] border border-[#e5e5e5] bg-white shadow-sm transition-transform duration-500 group-hover:-translate-y-1 group-hover:scale-[1.02] opacity-70"></div>
              
              {/* Front Card */}
              <div className="absolute top-[50px] w-full h-[150px] rounded-t-[12px] border border-[#e5e5e5] bg-white shadow-md p-4 flex flex-col gap-3 transition-transform duration-500 group-hover:translate-y-1">
                {[
                  { day: "Mon", start: "8:30 am", end: "5:00 pm", delay: "0s" },
                  { day: "Tue", start: "9:00 am", end: "6:30 pm", delay: "0.1s" },
                  { day: "Wed", start: "10:00 am", end: "7:00 pm", delay: "0.2s" }
                ].map((row, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="relative w-8 h-[18px] rounded-full t-bg" style={{ animationDelay: row.delay }}>
                       <div className="absolute top-[2px] w-[14px] h-[14px] rounded-full bg-white shadow-sm t-dot" style={{ animationDelay: row.delay }}></div>
                    </div>
                    <span className="text-[12px] font-semibold text-[#a1a1aa] w-7 flex-shrink-0">{row.day}</span>
                    <div className="flex-1 flex gap-2 items-center text-[11px] text-[#a1a1aa] transition-opacity duration-300 group-hover:opacity-30">
                       <div className="rounded-[4px] border border-[#f4f4f5] px-2 py-1 flex-1 text-center font-medium bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)]">{row.start}</div>
                       <span>-</span>
                       <div className="rounded-[4px] border border-[#f4f4f5] px-2 py-1 flex-1 text-center font-medium bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)]">{row.end}</div>
                    </div>
                    <div className="flex items-center gap-1.5 text-[#d4d4d8] ml-1 opacity-100 group-hover:opacity-30 transition-opacity">
                      <div className="text-[14px] leading-none mb-0.5">+</div>
                      <div className="w-[10px] h-[12px] rounded-[2px] border border-current relative">
                         <div className="absolute -top-[3px] -right-[3px] w-[6px] h-[6px] border-t border-r border-current"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Card 3: Choose how to meet */}
          <div className="rounded-2xl border border-[#e5e5e5] bg-white p-7 shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] group overflow-hidden flex flex-col">
            <div>
              <div className="flex h-[32px] w-[34px] items-center justify-center rounded-[8px] bg-[#f1f5f9] text-[13px] font-bold text-[#64748b] mb-6">
                03
              </div>
              <h3 className="text-[19px] font-bold text-[#1a1a1a] mb-2.5 tracking-[-0.02em]">Choose how to meet</h3>
              <p className="text-[15px] text-[#71717a] leading-[1.6] mb-8">
                It could be a video chat, phone call, or a walk in the park!
              </p>
            </div>
            
            {/* Graphic - Browser Window */}
            <div className="relative mt-auto w-full h-[180px] rounded-[10px] border border-[#e5e5e5] shadow-sm bg-[#fafafa] flex flex-col pt-1 transition-transform duration-500 group-hover:scale-[1.02]">
               {/* Browser Top Bar */}
               <div className="flex gap-1.5 px-3 py-2 border-b border-[#f4f4f5] bg-white w-full rounded-t-[9px]">
                 <div className="w-2 h-2 rounded-full bg-[#e4e4e7]"></div>
                 <div className="w-2 h-2 rounded-full bg-[#e4e4e7]"></div>
                 <div className="w-2 h-2 rounded-full bg-[#e4e4e7]"></div>
               </div>
               
               {/* Split Pane */}
               <div className="flex-1 flex overflow-hidden">
                 <div className="flex-1 border-r border-[#f4f4f5] bg-white flex items-center justify-center">
                    <div className="flex flex-col items-center gap-1 transition-transform duration-300 group-hover:-translate-y-1">
                      <div className="w-[30px] h-[30px] rounded-full bg-[#18181b]"></div>
                      <div className="w-[45px] h-[22px] rounded-t-[20px] rounded-b-[4px] bg-[#18181b]"></div>
                    </div>
                 </div>
                 <div className="flex-1 bg-white flex items-center justify-center">
                    <div className="flex flex-col items-center gap-1 transition-transform duration-300 group-hover:-translate-y-1" style={{ transitionDelay: '50ms' }}>
                      <div className="w-[30px] h-[30px] rounded-full bg-[#18181b]"></div>
                      <div className="w-[45px] h-[22px] rounded-t-[20px] rounded-b-[4px] bg-[#18181b]"></div>
                    </div>
                 </div>
               </div>

               {/* Meeting Controls Pill */}
               <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3.5 bg-white border border-[#e5e5e5] rounded-full px-5 py-2 shadow-[0_4px_12px_rgba(0,0,0,0.05)] transition-transform duration-500 group-hover:-translate-y-1">
                 <Video className="w-4 h-4 text-[#1a1a1a] fill-[#1a1a1a]" />
                 <MicOff className="w-4 h-4 text-[#1a1a1a]" strokeWidth={2.5} />
                 <MessageSquare className="w-4 h-4 text-[#1a1a1a] fill-[#1a1a1a]" />
                 {/* End */}
                 <div className="w-[20px] h-[12px] rounded-[3px] bg-[#ef4444] text-[4.5px] font-extrabold text-white flex items-center justify-center leading-none tracking-widest ml-1">
                   END
                 </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ BENEFITS ═══════════ */}
      <section className="py-16 px-6">
        <div className="mx-auto max-w-[1120px] text-center mb-10">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#e0e0e0] bg-white px-4 py-2 text-[13px] font-medium text-[#292929] shadow-sm">
            Benefits
          </div>
          <h2 className="text-[36px] sm:text-[44px] font-extrabold text-[#292929] leading-[1.08] tracking-[-0.03em] mb-3">
            Your all-purpose scheduling app
          </h2>
          <p className="text-[15px] text-[#666] max-w-lg mx-auto mb-6 leading-relaxed italic">
            Discover a variety of our advanced features. Unlimited and free for individuals.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-1 rounded-lg bg-[#292929] px-5 py-2.5 text-[13px] font-semibold text-white hover:bg-[#1a1a1a] transition-colors"
            >
              Get started <ChevronRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              href="/book/30min"
              className="inline-flex items-center gap-1 rounded-lg border border-[#e0e0e0] bg-white px-5 py-2.5 text-[13px] font-medium text-[#292929] hover:bg-[#fafafa] transition-colors"
            >
              Book a demo <ChevronRight className="h-3.5 w-3.5 text-[#898989]" />
            </Link>
          </div>
        </div>

        {/* Feature cards 2x2 */}
        <div className="mx-auto max-w-[1120px] grid md:grid-cols-2 gap-5">
          {/* Card 1: Notice and buffers */}
          <div className="rounded-2xl border border-[#e5e5e5] bg-white p-7 hover:shadow-lg transition-all duration-300">
            <h3 className="text-[18px] font-bold text-[#292929] mb-2 tracking-[-0.01em]">Avoid meeting overload</h3>
            <p className="text-[14px] text-[#666] leading-relaxed mb-6">
              Only get booked when you want to. Set daily, weekly or monthly limits and add buffers around your events to allow you to focus or take a break.
            </p>
            <div className="rounded-xl border border-[#eee] bg-white p-5">
              <h4 className="text-[16px] font-bold text-[#292929] mb-4">Notice and buffers</h4>
              <div className={`space-y-4 transition-all duration-500 ease-in-out ${bufferFadeIn ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1"}`}>
                <div>
                  <p className="text-[13px] font-semibold text-[#292929] mb-2">Minimum notice</p>
                  <div className="flex items-center justify-between rounded-lg border border-[#e0e0e0] px-3.5 py-2.5">
                    <span className="text-[14px] text-[#292929]">{bufferProfile.minNotice}</span>
                    <ChevronDown className="h-4 w-4 text-[#999]" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[13px] font-semibold text-[#292929] mb-2">Buffer before event</p>
                    <div className="flex items-center justify-between rounded-lg border border-[#e0e0e0] px-3.5 py-2.5">
                      <span className="text-[14px] text-[#292929]">{bufferProfile.bufferBefore}</span>
                      <ChevronDown className="h-4 w-4 text-[#999]" />
                    </div>
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-[#292929] mb-2">Buffer after event</p>
                    <div className="flex items-center justify-between rounded-lg border border-[#e0e0e0] px-3.5 py-2.5">
                      <span className="text-[14px] text-[#292929]">{bufferProfile.bufferAfter}</span>
                      <ChevronDown className="h-4 w-4 text-[#999]" />
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-[#292929] mb-2">Time-slot intervals</p>
                  <div className="flex items-center justify-between rounded-lg border border-[#e0e0e0] px-3.5 py-2.5">
                    <span className="text-[14px] text-[#292929]">{bufferProfile.interval}</span>
                    <ChevronDown className="h-4 w-4 text-[#999]" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Custom booking link */}
          <div className="rounded-2xl border border-[#e5e5e5] bg-white p-7 hover:shadow-lg transition-all duration-300 relative overflow-hidden flex flex-col pt-8">
            <h3 className="text-[18px] font-bold text-[#292929] mb-2 tracking-[-0.01em]">Stand out with a custom booking link</h3>
            <p className="text-[14px] text-[#666] leading-relaxed mb-6">
              Customize your booking link so it&apos;s short and easy to remember for your bookers. No more long, complicated links one can easily forget.
            </p>
            <div className="relative mt-8 mt-auto mx-auto w-[90%]">
              {/* Floating ID Tag */}
              <div className="absolute -top-[18px] left-1/2 -translate-x-1/2 rounded-[10px] border border-[#e0e0e0] bg-[#f4f4f5] px-4 py-2 text-[15px] text-[#1a1a1a] shadow-[0_2px_8px_rgba(0,0,0,0.04)] z-20 transition-all duration-300">
                cal.com/<span className="font-bold relative inline-block transition-transform duration-300 min-w-[50px] text-center" style={{ opacity: linkFadeIn ? 1 : 0, transform: linkFadeIn ? 'translateY(0)' : 'translateY(2px)' }}>{linkProfile.id}</span>
              </div>
              
              {/* Card content */}
              <div className="rounded-t-[14px] border border-[#eee] border-b-0 bg-white p-5 pt-8 shadow-sm relative z-10">
                <div className={`transition-all duration-500 ease-in-out ${linkFadeIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}>
                  <div className="flex items-start gap-3">
                    <div className="flex h-[28px] w-[28px] flex-shrink-0 items-center justify-center rounded-full bg-[#1a1a1a] text-white font-medium text-[12px] shadow-sm">
                      {linkProfile.initial}
                    </div>
                    <div className="flex-1 min-w-0">
                       <p className="text-[12px] text-[#898989] font-medium leading-none mb-1">{linkProfile.name}</p>
                       <p className="text-[17px] font-bold text-[#1a1a1a] leading-tight tracking-[-0.01em]">{linkProfile.title}</p>
                       <p className="mt-2 text-[12px] text-[#666] leading-[1.6]">
                         {linkProfile.desc}
                       </p>
                       
                       {/* Duration Pills */}
                       <div className="mt-4 flex items-center gap-1.5 bg-[#fafafa] p-1.5 rounded-[10px] w-fit border border-[#f4f4f5]">
                         <Clock className="h-3.5 w-3.5 text-[#898989] ml-1 mr-0.5" />
                         {["15m", "30m", "45m", "1h"].map((d) => (
                           <span key={d} className={`rounded-[6px] px-3 py-1.5 text-[11.5px] font-semibold transition-colors duration-300 ${d === linkProfile.duration ? "bg-white text-[#1a1a1a] shadow-sm border border-[#e5e5e5]" : "text-[#898989] hover:text-[#1a1a1a]"}`}>
                             {d}
                           </span>
                         ))}
                       </div>
                       
                       {/* Context Info */}
                       <div className="mt-4 space-y-2.5">
                         <p className="flex items-center gap-2 text-[12.5px] text-[#666] font-medium">
                           {linkProfile.platform === "Zoom" ? <Video className="h-3.5 w-3.5 text-[#2D8CFF] fill-[#2D8CFF]" /> : 
                            linkProfile.platform === "MS Teams" ? <Monitor className="h-3.5 w-3.5 text-[#5B5FC7]" /> :
                            <Video className="h-3.5 w-3.5 text-[#00796B]" />} 
                           {linkProfile.platform}
                         </p>
                         <p className="flex items-center gap-2 text-[12.5px] text-[#666] font-medium">
                           <Globe className="h-3.5 w-3.5 text-[#898989]" /> 
                           {linkProfile.timezone}
                           <ChevronDown className="h-3 w-3 text-[#aaa] ml-0.5" />
                         </p>
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Streamline your bookers' experience */}
          <div className="rounded-2xl border border-[#e5e5e5] bg-white p-7 pb-0 hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col group">
            <h3 className="text-[18px] font-bold text-[#292929] mb-2 tracking-[-0.01em]">Streamline your bookers&apos; experience</h3>
            <p className="text-[14px] text-[#666] leading-relaxed mb-6">
              Let your bookers overlay their calendar, receive booking confirmations via text or email, get events added to their calendar, and allow them to reschedule with ease.
            </p>
            <div className="mt-auto border border-[#eee] border-b-0 rounded-t-xl overflow-hidden relative bg-white">
              <style jsx>{`
                @keyframes ev-slide-loop {
                  0%, 15% { opacity: 0; transform: translateY(30px); }
                  35%, 80% { opacity: 1; transform: translateY(0); }
                  100% { opacity: 0; transform: translateY(30px); }
                }
                @keyframes handle-loop {
                  0%, 15% { left: 2px; }
                  35%, 80% { left: 14px; }
                  100% { left: 2px; }
                }
                @keyframes track-loop {
                  0%, 15% { background: #e5e5e5; }
                  35%, 80% { background: #1a1a1a; }
                  100% { background: #e5e5e5; }
                }
                .ev-slide { opacity: 0; animation: ev-slide-loop 5s infinite cubic-bezier(0.16, 1, 0.3, 1); }
                .overlay-handle { left: 2px; background: #fff; animation: handle-loop 5s infinite cubic-bezier(0.16, 1, 0.3, 1); }
                .overlay-track { background: #e5e5e5; animation: track-loop 5s infinite cubic-bezier(0.16, 1, 0.3, 1); }
              `}</style>
              {/* Header Bar */}
              <div className="flex items-center justify-end px-4 py-3 border-b border-[#eee]">
                <div className="flex items-center gap-2 mr-3">
                  <div className="relative w-7 h-4 rounded-full overlay-track flex items-center">
                    <div className="absolute w-3 h-3 rounded-full overlay-handle shadow-sm"></div>
                  </div>
                  <span className="text-[12px] font-bold text-[#1a1a1a]">Overlay my calendar</span>
                </div>
                <div className="flex items-center border border-[#e5e5e5] rounded-[4px] overflow-hidden text-[11px] font-semibold">
                  <span className="px-2 py-0.5 text-[#1a1a1a] bg-white">12h</span>
                  <span className="px-2 py-0.5 text-[#a1a1aa] bg-[#fafafa] border-l border-[#e5e5e5]">24h</span>
                </div>
              </div>
              {/* Columns Header */}
              <div className="grid grid-cols-5 border-b border-[#eee]">
                {["Wed 06", "Thu 07", "Fri 08", "Sat 09", "Sun 10"].map((day, i) => (
                  <div key={day} className={`text-center py-2 text-[11px] font-semibold text-[#898989] ${i !== 0 ? "border-l border-[#eee]" : ""}`}>
                    {day}
                  </div>
                ))}
              </div>
              {/* Grid Body */}
              <div className="grid grid-cols-5 h-[160px] relative">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className={`h-full ${i !== 0 ? "border-l border-[#f4f4f5]" : ""}`}>
                    {/* Horizontal grid lines simulation */}
                    <div className="w-full h-1/4 border-b border-[#f4f4f5]"></div>
                    <div className="w-full h-1/4 border-b border-[#f4f4f5]"></div>
                    <div className="w-full h-1/4 border-b border-[#f4f4f5]"></div>
                  </div>
                ))}
                
                {/* Event Blocks */}
                {/* Wed */}
                <div className="absolute left-[0%] top-[50%] w-[20%] px-[2px] ev-slide" style={{ animationDelay: '0s' }}>
                  <div className="bg-[#f3e8ff] rounded-[3px] p-1.5 h-[34px] flex flex-col justify-center shadow-sm">
                     <span className="text-[9px] font-bold text-[#6b21a8] leading-none mb-0.5">Lunch date</span>
                     <span className="text-[8px] font-medium text-[#7e22ce] leading-none">12 PM - 1 PM</span>
                  </div>
                </div>
                {/* Thu */}
                <div className="absolute left-[20%] top-[25%] w-[20%] px-[2px] ev-slide" style={{ animationDelay: '0.1s' }}>
                  <div className="bg-[#f3e8ff] rounded-[3px] p-1.5 h-[34px] flex flex-col justify-center shadow-sm">
                     <span className="text-[9px] font-bold text-[#6b21a8] leading-none mb-0.5">Coffee</span>
                     <span className="text-[8px] font-medium text-[#7e22ce] leading-none">11 AM - 12 PM</span>
                  </div>
                </div>
                {/* Fri */}
                <div className="absolute left-[40%] top-[70%] w-[20%] px-[2px] ev-slide" style={{ animationDelay: '0.2s' }}>
                  <div className="bg-[#f1f5f9] rounded-[3px] p-1.5 h-[34px] flex flex-col justify-center shadow-sm">
                     <span className="text-[9px] font-bold text-[#334155] leading-none mb-0.5">Design conference</span>
                     <span className="text-[8px] font-medium text-[#475569] leading-none">12 PM - 2 PM</span>
                  </div>
                </div>
                {/* Sat */}
                <div className="absolute left-[60%] top-[40%] w-[20%] px-[2px] ev-slide" style={{ animationDelay: '0.3s' }}>
                  <div className="bg-[#ffe4e6] rounded-[3px] p-1.5 h-[50px] flex flex-col justify-center shadow-sm">
                     <span className="text-[9px] font-bold text-[#be123c] leading-none mb-0.5">Hiring call</span>
                     <span className="text-[8px] font-medium text-[#e11d48] leading-none">11:30 AM - 1 PM</span>
                  </div>
                </div>
                {/* Sun */}
                <div className="absolute left-[80%] top-[25%] w-[20%] px-[2px] ev-slide" style={{ animationDelay: '0.4s' }}>
                  <div className="bg-[#e0f2fe] rounded-[3px] p-1.5 h-[100px] flex flex-col pt-1.5 shadow-sm">
                     <span className="text-[9px] font-bold text-[#0369a1] leading-none mb-0.5 mt-2">Company meeting</span>
                     <span className="text-[8px] font-medium text-[#0ea5e9] leading-none mt-1">11 AM - 2:30 PM</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 4: Reduce no-shows */}
          <div className="rounded-2xl border border-[#e5e5e5] bg-white p-7 text-center sm:text-left hover:shadow-lg transition-all duration-300 flex flex-col group relative overflow-hidden">
            <h3 className="text-[18px] font-bold text-[#292929] mb-2 tracking-[-0.01em]">Reduce no-shows with automated meeting reminders</h3>
            <p className="text-[14px] text-[#666] leading-relaxed mb-6">
              Easily send sms or meeting reminder emails about bookings, and send automated follow-ups to gather any relevant information before the meeting.
            </p>
            
            {/* Notifications Graphic */}
            <div className="relative h-[160px] mt-auto w-full flex justify-center items-end pb-8">
              {/* Back Card 2 */}
              <div className={`absolute w-[75%] h-[80px] bg-[#f8f9fa] border border-[#e5e5e5] rounded-lg shadow-sm transition-all duration-500 z-0 ${reminderFadeIn ? 'bottom-[20px] opacity-50 group-hover:translate-y-2' : 'bottom-[24px] opacity-30'}`}></div>
              {/* Back Card 1 */}
              <div className={`absolute w-[80%] h-[80px] bg-[#fdfdfd] border border-[#e5e5e5] rounded-lg shadow-sm transition-all duration-500 z-10 ${reminderFadeIn ? 'bottom-[26px] opacity-80 group-hover:translate-y-1' : 'bottom-[34px] opacity-50'}`}></div>
              
              {/* Front Card */}
              <div className={`absolute w-[85%] bg-white border border-[#e5e5e5] shadow-md rounded-[10px] p-4 flex gap-3 z-20 transition-all duration-500 ${reminderFadeIn ? 'bottom-[32px] opacity-100 scale-100 group-hover:-translate-y-1' : 'bottom-[20px] opacity-0 scale-[0.97]'}`}>
                <div className="w-10 h-10 rounded-[6px] bg-[#1a1a1a] flex flex-shrink-0 items-center justify-center text-white text-[13px] font-bold">
                  Cal
                </div>
                <div className="text-left flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[12px] font-bold text-[#1a1a1a] truncate pr-2">{reminderProfile.title}</span>
                    <span className="text-[9px] text-[#a1a1aa] whitespace-nowrap">{reminderProfile.time}</span>
                  </div>
                  <p className="text-[10px] text-[#71717a] leading-[1.4] line-clamp-2">
                    {reminderProfile.desc}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ CTA ═══════════ */}
      <section className="py-20 px-6">
        <div className="mx-auto max-w-[700px] text-center">
          <h2 className="text-[36px] sm:text-[44px] font-extrabold text-[#292929] leading-[1.08] tracking-[-0.03em] mb-4">
            Start scheduling smarter today
          </h2>
          <p className="text-[15px] text-[#666] mb-8 italic">
            Join thousands of professionals who use Cal.com to simplify their scheduling.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/event-types"
              className="inline-flex items-center gap-1 rounded-lg bg-[#292929] px-6 py-3 text-[14px] font-semibold text-white hover:bg-[#1a1a1a] transition-colors"
            >
              Get started free <ChevronRight className="h-4 w-4" />
            </Link>
            <Link
              href="/book/30min"
              className="inline-flex items-center gap-1 rounded-lg border border-[#e0e0e0] bg-white px-6 py-3 text-[14px] font-medium text-[#292929] hover:bg-[#fafafa] transition-colors"
            >
              Book a demo <ChevronRight className="h-4 w-4 text-[#898989]" />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════ FOOTER ═══════════ */}
      <footer className="border-t border-[#e5e5e5] py-8 px-6">
        <div className="mx-auto max-w-[1120px] flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-[16px] font-extrabold text-[#292929]">Cal<span className="text-[#898989]">.com</span></span>
          <p className="text-[12px] text-[#898989]">© {new Date().getFullYear()} Cal.com, Inc. All rights reserved.</p>
          <div className="flex items-center gap-4 text-[12px] text-[#898989]">
            <Link href="/event-types" className="hover:text-[#292929] transition-colors">Dashboard</Link>
            <Link href="/pricing" className="hover:text-[#292929] transition-colors">Pricing</Link>
          </div>
        </div>
      </footer>
      </div>
    </div>
  );
}
