"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight, FileText, Store, Users, CreditCard, Settings2, BookOpen, Code2, Webhook, Moon, Zap, Link2, Calendar, UserPlus } from "lucide-react";
import { useSession, signOut } from "next-auth/react";

const resourcesItems = [
  { icon: FileText, label: "Font: Cal Sans UI & Text", desc: "Our own variable typeface for user interface design" },
  { icon: Code2, label: "Embed", desc: "Embed Cal.com into your website" },
  { icon: BookOpen, label: "Blog", desc: "Stay up to date with the latest news and updates" },
  { icon: Store, label: "App Store", desc: "Integrate with your favorite apps" },
  { icon: Moon, label: "Out Of Office", desc: "Schedule time off with ease" },
  { icon: Zap, label: "Instant Meetings", desc: "Meet with clients in minutes" },
  { icon: Users, label: "Collective Events", desc: "Schedule events with multiple participants" },
  { icon: CreditCard, label: "Payments", desc: "Accept payments for bookings" },
  { icon: UserPlus, label: "Dynamic Group Links", desc: "Seamlessly book meetings with multiple people" },
  { icon: BookOpen, label: "Help Docs", desc: "Need to learn more about our system? Check the help docs" },
  { icon: Settings2, label: "Workflows", desc: "Automate scheduling and reminders" },
  { icon: Webhook, label: "Webhooks", desc: "Get notified when something happens" },
];

const solutionsItems = [
  { icon: Calendar, label: "Scheduling", desc: "Powerful scheduling for individuals and teams" },
  { icon: Link2, label: "Booking Links", desc: "Share your availability with a link" },
  { icon: Users, label: "Team Scheduling", desc: "Round-robin, collective, and managed events" },
  { icon: Zap, label: "Automation", desc: "Automate your scheduling workflows" },
  { icon: Code2, label: "Platform API", desc: "Build on top of Cal.com" },
  { icon: CreditCard, label: "Payments", desc: "Collect payments when bookings are made" },
];

function MegaMenu({ items, columns = 3 }: { items: typeof resourcesItems; columns?: number }) {
  const gridClass = columns === 3 ? "grid-cols-3" : "grid-cols-2";
  return (
    <div className={`grid ${gridClass} gap-0.5 p-3`} style={{ minWidth: columns === 3 ? "700px" : "480px" }}>
      {items.map((item) => (
        <a
          key={item.label}
          href="#"
          className="flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-[#f5f5f0] group"
        >
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 group-hover:border-gray-300 group-hover:text-[#292929] transition-colors mt-0.5">
            <item.icon className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-[#292929] leading-snug">{item.label}</p>
            <p className="text-[11.5px] text-[#898989] leading-snug mt-0.5">{item.desc}</p>
          </div>
        </a>
      ))}
    </div>
  );
}

export default function Navbar() {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const { data: session } = useSession();

  const handleEnter = (menu: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpenMenu(menu);
  };

  const handleLeave = () => {
    timeoutRef.current = setTimeout(() => setOpenMenu(null), 200);
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener("mousedown", handler);

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);

    return () => {
      document.removeEventListener("mousedown", handler);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const navLinks = [
    { label: "Solutions", hasMenu: true, menuKey: "solutions" },
    { label: "Enterprise", href: "#" },
    { label: "Cal.ai", href: "#" },
    { label: "Developer", hasMenu: true, menuKey: "developer" },
    { label: "Resources", hasMenu: true, menuKey: "resources" },
    { label: "Pricing", href: "/pricing" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full h-20 pointer-events-none">
      <div
        ref={navRef}
        className={`pointer-events-auto mx-auto flex w-full items-center justify-between transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          scrolled
            ? "mt-4 h-[56px] max-w-[1040px] rounded-full border border-[#e5e5e5] bg-white/95 backdrop-blur-md shadow-[0_4px_16px_rgba(0,0,0,0.06)] px-6"
            : "mt-0 h-20 max-w-[1440px] rounded-none border border-transparent bg-transparent px-6 md:px-10"
        }`}
      >
        <div className="flex items-center gap-10">
        <Link href="/" className="flex items-center">
          <span className="text-[20px] font-bold tracking-tight text-[#1a1a1a]">
            Cal<span className="text-[#898989]">.com</span>
          </span>
        </Link>
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) =>
            link.hasMenu ? (
              <div
                key={link.label}
                className="relative"
                onMouseEnter={() => handleEnter(link.menuKey!)}
                onMouseLeave={handleLeave}
              >
                <button
                  className={`flex items-center gap-1 rounded-md px-3 py-2 text-[14px] font-medium transition-colors ${
                    openMenu === link.menuKey
                      ? "text-[#1a1a1a]"
                      : "text-[#666] hover:text-[#1a1a1a]"
                  }`}
                >
                  {link.label}
                  <ChevronDown className={`h-3 w-3 transition-transform duration-200 opacity-60 ${openMenu === link.menuKey ? "rotate-180" : ""}`} />
                </button>

                <div
                  className={`absolute left-1/2 top-full -translate-x-1/2 pt-2 transition-all duration-200 ${
                    openMenu === link.menuKey
                      ? "opacity-100 translate-y-0 pointer-events-auto"
                      : "opacity-0 translate-y-1 pointer-events-none"
                  }`}
                  onMouseEnter={() => handleEnter(link.menuKey!)}
                  onMouseLeave={handleLeave}
                >
                  <div className="rounded-2xl border border-gray-200/60 bg-white shadow-xl shadow-black/[0.04]">
                    {link.menuKey === "resources" && <MegaMenu items={resourcesItems} columns={3} />}
                    {link.menuKey === "solutions" && <MegaMenu items={solutionsItems} columns={2} />}
                    {link.menuKey === "developer" && (
                      <MegaMenu
                        items={[
                          { icon: Code2, label: "API Reference", desc: "Complete API documentation" },
                          { icon: Webhook, label: "Webhooks", desc: "Real-time event notifications" },
                          { icon: FileText, label: "SDKs", desc: "Libraries for popular languages" },
                          { icon: BookOpen, label: "Guides", desc: "Step-by-step tutorials" },
                        ]}
                        columns={2}
                      />
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <Link
                key={link.label}
                href={link.href!}
                className="rounded-md px-3 py-2 text-[14px] font-medium text-[#666] hover:text-[#1a1a1a] transition-colors"
              >
                {link.label}
              </Link>
            )
          )}
        </div>
      </div>

      <div className="flex items-center gap-5">
        {session ? (
          <>
            <Link
              href="/event-types"
              className="hidden sm:inline-flex text-[14px] font-semibold text-[#1a1a1a] hover:opacity-70 transition-opacity"
            >
              Dashboard
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#1a1a1a] px-5 py-2.5 text-[14px] font-semibold text-white hover:bg-black transition-colors"
            >
              Sign out
            </button>
          </>
        ) : (
          <>
            <Link
              href="/login"
              className="hidden sm:inline-flex text-[14px] font-semibold text-[#1a1a1a] hover:opacity-70 transition-opacity"
            >
              Sign in
            </Link>
            <Link
              href="/event-types"
              className="inline-flex items-center gap-1.5 rounded-full bg-[#1a1a1a] px-5 py-2.5 text-[14px] font-semibold text-white hover:bg-black transition-colors"
            >
              Get started <ChevronRight className="h-4 w-4 opacity-70" />
            </Link>
          </>
        )}
      </div>
      </div>
    </header>
  );
}
