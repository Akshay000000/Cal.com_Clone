"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/admin/Sidebar";
import { Menu, X, Clock, Link2, CalendarDays, Settings, Users, Grid3X3, GitBranch, Zap, BarChart3, ExternalLink, Copy, Gift, Search, User, Moon, Map, HelpCircle, Download, LogOut, ChevronDown, ChevronRight } from "lucide-react";
import { useUser, useClerk } from "@clerk/nextjs";

const navItems = [
  { href: "/event-types", label: "Event types", icon: Link2 },
  { href: "/bookings", label: "Bookings", icon: CalendarDays },
  { href: "/availability", label: "Availability", icon: Clock },
  { href: "#", label: "Teams", icon: Users },
  { href: "#", label: "Apps", icon: Grid3X3 },
  { href: "#", label: "Routing", icon: GitBranch },
  { href: "#", label: "Workflows", icon: Zap },
  { href: "#", label: "Insights", icon: BarChart3 },
];

const bottomLinks = [
  { icon: ExternalLink, label: "View public page", href: "/book/30min" },
  { icon: Copy, label: "Copy public page link", href: "#" },
  { icon: Gift, label: "Refer and earn", href: "#" },
  { icon: Settings, label: "Settings", href: "/availability" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const pathname = usePathname();
  const { user, isSignedIn } = useUser();
  const { signOut } = useClerk();

  const displayName = isSignedIn
    ? (user?.fullName || user?.emailAddresses?.[0]?.emailAddress || "User")
    : "Demo User";
  const displayInitial = displayName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-[#111111]">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile header */}
      <div className="lg:hidden sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-[#2c2c2c] bg-[#111111] px-4">
        <button
          onClick={() => setMobileOpen(true)}
          className="rounded-md p-1.5 text-gray-400 hover:bg-white/[0.04] transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div 
          onClick={() => setIsProfileOpen(!isProfileOpen)}
          className="flex items-center gap-2 cursor-pointer relative"
        >
          <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#c2410c] text-[10px] font-bold text-white relative">
            {displayInitial}
            <div className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border-2 border-[#111111] bg-[#10b981]"></div>
          </div>
          <span className="text-[14px] font-semibold text-white">{displayName}</span>
          <ChevronDown className={`h-4 w-4 text-gray-500 flex-shrink-0 transition-transform ${isProfileOpen ? "rotate-180" : ""}`} />
          
          {/* Dropdown Menu */}
          {isProfileOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setIsProfileOpen(false); }}></div>
              <div className="absolute right-0 top-[40px] z-50 w-[220px] rounded-xl border border-[#2c2c2c] bg-[#1c1c1c] py-1.5 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-150" onClick={(e) => e.stopPropagation()}>
                <div className="px-1.5 py-1">
                  <button className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-[14px] font-medium text-white hover:bg-white/10 transition-colors">
                    <User className="h-4 w-4 text-gray-300" /> My profile
                  </button>
                  <button className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-[14px] font-medium text-white hover:bg-white/10 transition-colors">
                    <Settings className="h-4 w-4 text-gray-300" /> My settings
                  </button>
                  <button className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-[14px] font-medium text-white hover:bg-white/10 transition-colors">
                    <Moon className="h-4 w-4 text-gray-300" /> Out of office
                  </button>
                </div>
                <div className="my-1 border-t border-[#2c2c2c]"></div>
                <div className="px-1.5 py-1">
                  <button className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-[14px] font-medium text-white hover:bg-white/10 transition-colors">
                    <Map className="h-4 w-4 text-gray-300" /> Roadmap
                  </button>
                  <button className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-[14px] font-medium text-white hover:bg-white/10 transition-colors">
                    <HelpCircle className="h-4 w-4 text-gray-300" /> Help
                  </button>
                  <button className="flex w-full justify-between items-center rounded-md px-2.5 py-2 text-[14px] font-medium text-white hover:bg-white/10 transition-colors">
                    <div className="flex items-center gap-2.5"><Download className="h-4 w-4 text-gray-300" /> Download app</div>
                    <ChevronRight className="h-4 w-4 text-gray-500" />
                  </button>
                </div>
                <div className="my-1 border-t border-[#2c2c2c]"></div>
                <div className="px-1.5 py-1">
                  {isSignedIn ? (
                  <button onClick={() => { setIsProfileOpen(false); signOut({ redirectUrl: '/' }); }} className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-[14px] font-medium text-[#f87171] hover:bg-red-500/10 transition-colors">
                    <LogOut className="h-4 w-4" /> Sign out
                  </button>
                  ) : (
                  <Link href="/sign-in" onClick={() => setIsProfileOpen(false)} className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-[14px] font-medium text-white hover:bg-white/10 transition-colors">
                    <LogOut className="h-4 w-4 text-gray-300" /> Sign in
                  </Link>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 flex w-[280px] flex-col bg-[#111111] shadow-2xl">
            {/* Drawer header */}
            <div className="flex h-14 items-center justify-between px-4">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[#c2410c] text-[12px] font-bold text-white relative">
                  {displayInitial}
                  <div className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border-2 border-[#111111] bg-[#10b981]"></div>
                </div>
                <span className="text-[14px] font-semibold text-white">{displayName}</span>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="rounded-md p-1 text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Nav items */}
            <nav className="flex-1 space-y-0.5 px-3 pt-2">
              {navItems.map((item) => {
                const isActive =
                  pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-2.5 rounded-md px-2.5 py-[7px] text-[13px] font-medium transition-all duration-150 ${
                      isActive
                        ? "bg-white/[0.08] text-white"
                        : "text-gray-400 hover:bg-white/[0.04] hover:text-gray-200"
                    }`}
                  >
                    <item.icon className={`h-4 w-4 ${isActive ? "text-white" : "text-gray-500"}`} />
                    {item.label}
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
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2.5 rounded-md px-2.5 py-[7px] text-[13px] font-medium text-gray-400 transition-all hover:bg-white/[0.04] hover:text-gray-200"
                >
                  <item.icon className="h-4 w-4 text-gray-500" />
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      <main className="lg:pl-[250px]">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
}
