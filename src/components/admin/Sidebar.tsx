"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Clock,
  CalendarDays,
  Link2,
  Settings,
  ExternalLink,
  Users,
  Grid3X3,
  GitBranch,
  Zap,
  BarChart3,
  ChevronDown,
  Search,
  Copy,
  Gift,
  User,
  Moon,
  Map,
  HelpCircle,
  Download,
  LogOut,
  ChevronRight
} from "lucide-react";
import { useUser, useClerk } from "@clerk/nextjs";

const mainNav = [
  { href: "/event-types", label: "Event types", icon: Link2 },
  { href: "/bookings", label: "Bookings", icon: CalendarDays },
  { href: "/availability", label: "Availability", icon: Clock },
  { href: "/teams", label: "Teams", icon: Users },
  { href: "#", label: "Apps", icon: Grid3X3, hasChevron: true },
  { href: "/routing", label: "Routing", icon: GitBranch },
  { href: "/workflows", label: "Workflows", icon: Zap },
  { href: "#", label: "Insights", icon: BarChart3, hasChevron: true },
];

const bottomLinks = [
  { icon: ExternalLink, label: "View public page", href: "/book/30min" },
  { icon: Copy, label: "Copy public page link", href: "#" },
  { icon: Gift, label: "Refer and earn", href: "#" },
  { icon: Settings, label: "Settings", href: "/availability" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, isSignedIn } = useUser();
  const { signOut } = useClerk();

  const displayName = isSignedIn
    ? (user?.fullName || user?.emailAddresses?.[0]?.emailAddress || "User")
    : "Demo User";
  const displayInitial = displayName.charAt(0).toUpperCase();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-[250px] flex-col bg-[#111111]">
      {/* User / Logo area */}
      <div className="relative">
        <div
          onClick={() => setIsProfileOpen(!isProfileOpen)}
          className="flex h-14 items-center gap-2.5 px-4 cursor-pointer hover:bg-white/[0.04] transition-colors"
        >
          <div className="relative flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[#c2410c] text-[12px] font-bold text-white">
            {displayInitial}
            <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#111111] bg-[#10b981]"></div>
          </div>
          <div className="flex items-center gap-1 min-w-0 flex-1">
            <span className="text-[14px] font-semibold text-white truncate">{displayName}</span>
            <ChevronDown className={`h-4 w-4 text-gray-500 flex-shrink-0 transition-transform ${isProfileOpen ? "rotate-180" : ""}`} />
          </div>
          <button 
            onClick={(e) => e.stopPropagation()}
            className="ml-auto rounded-md p-1.5 text-gray-400 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <Search className="h-4 w-4" />
          </button>
        </div>

        {/* Dropdown Menu */}
        {isProfileOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)}></div>
            <div className="absolute left-3 top-[52px] z-50 w-[220px] rounded-xl border border-[#2c2c2c] bg-[#1c1c1c] py-1.5 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-150">
              
              <div className="px-1.5 py-1">
                <button className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-[14px] font-medium text-white hover:bg-white/10 transition-colors">
                  <User className="h-4 w-4 text-gray-300" />
                  My profile
                </button>
                <button className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-[14px] font-medium text-white hover:bg-white/10 transition-colors">
                  <Settings className="h-4 w-4 text-gray-300" />
                  My settings
                </button>
                <button className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-[14px] font-medium text-white hover:bg-white/10 transition-colors">
                  <Moon className="h-4 w-4 text-gray-300" />
                  Out of office
                </button>
              </div>

              <div className="my-1 border-t border-[#2c2c2c]"></div>

              <div className="px-1.5 py-1">
                <button className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-[14px] font-medium text-white hover:bg-white/10 transition-colors">
                  <Map className="h-4 w-4 text-gray-300" />
                  Roadmap
                </button>
                <button className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-[14px] font-medium text-white hover:bg-white/10 transition-colors">
                  <HelpCircle className="h-4 w-4 text-gray-300" />
                  Help
                </button>
                <button className="flex w-full justify-between items-center rounded-md px-2.5 py-2 text-[14px] font-medium text-white hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <Download className="h-4 w-4 text-gray-300" />
                    Download app
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-500" />
                </button>
              </div>

              <div className="my-1 border-t border-[#2c2c2c]"></div>

              <div className="px-1.5 py-1">
                {isSignedIn ? (
                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    signOut({ redirectUrl: '/' });
                  }}
                  className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-[14px] font-medium text-[#f87171] hover:bg-red-500/10 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
                ) : (
                <Link
                  href="/sign-in"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-[14px] font-medium text-white hover:bg-white/10 transition-colors"
                >
                  <LogOut className="h-4 w-4 text-gray-300" />
                  Sign in
                </Link>
                )}
              </div>

            </div>
          </>
        )}
      </div>

      {/* Main nav */}
      <nav className="flex-1 space-y-0.5 px-3 pt-1">
        {mainNav.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`group flex items-center justify-between rounded-md px-2.5 py-[7px] text-[13px] font-medium transition-all duration-150 ${
                isActive
                  ? "bg-white/[0.08] text-white"
                  : "text-gray-400 hover:bg-white/[0.04] hover:text-gray-200"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <item.icon className={`h-4 w-4 flex-shrink-0 ${isActive ? "text-white" : "text-gray-500 group-hover:text-gray-400"}`} />
                {item.label}
              </div>
              {item.hasChevron && (
                <ChevronDown className="h-3 w-3 text-gray-600" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom links */}
      <div className="border-t border-white/[0.06] px-3 py-2 space-y-0.5">
        {bottomLinks.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="flex items-center gap-2.5 rounded-md px-2.5 py-[7px] text-[13px] font-medium text-gray-400 transition-all duration-150 hover:bg-white/[0.04] hover:text-gray-200"
          >
            <item.icon className="h-4 w-4 text-gray-500" />
            {item.label}
          </Link>
        ))}
        <p className="px-2.5 pt-2 pb-1 text-[10px] text-gray-600">
          © 2026 Cal.com, Inc. v4.8.9
        </p>
      </div>
    </aside>
  );
}
