"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";

interface UpgradeViewProps {
  featureTitle: string;
  featureDesc: string;
}

export default function UpgradeView({ featureTitle, featureDesc }: UpgradeViewProps) {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <div className="flex-1 flex justify-center pt-2 pb-10">
      <div className="w-full max-w-[860px] rounded-2xl bg-[#111111] border border-[#2c2c2c] overflow-hidden font-sans flex flex-col h-fit">
        {/* Header */}
        <div className="flex items-center justify-between pt-6 px-7 pb-4">
          <h2 className="text-[20px] font-bold text-white tracking-tight">Upgrade plan</h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center bg-white/5 rounded-full p-1 border border-[#2c2c2c]">
              <button 
                onClick={() => setIsAnnual(false)}
                className={`px-3 py-1.5 text-[13px] font-medium rounded-full transition-colors ${!isAnnual ? 'text-white bg-[#2c2c2c] shadow-sm' : 'text-gray-400 hover:text-white'}`}
              >
                Monthly
              </button>
              <button 
                onClick={() => setIsAnnual(true)}
                className={`px-3 py-1.5 text-[13px] font-medium rounded-full transition-colors flex items-center gap-1.5 ${isAnnual ? 'text-white bg-[#2c2c2c] shadow-sm' : 'text-gray-400 hover:text-white'}`}
              >
                Annual <span className="text-[#3b82f6]">-25%</span>
              </button>
            </div>
          </div>
        </div>

        {/* Banner */}
        <div className="px-7 pb-5">
          <div className="rounded-xl bg-gradient-to-r from-[#172033] to-[#111827] border border-blue-900/40 p-5 mt-2">
            <h3 className="text-[15px] font-bold text-white mb-1.5">{featureTitle}</h3>
            <p className="text-[14px] text-gray-400 leading-snug">{featureDesc}</p>
          </div>
        </div>

        {/* Pricing Columns */}
        <div className="px-7 pb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Teams */}
          <div className="rounded-xl border border-[#2c2c2c] bg-[#161616] p-6 flex flex-col hover:border-gray-500 transition-colors">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className="text-[16px] font-bold text-white">Team</span>
              <span className="text-[11px] font-medium text-white bg-[#2c2c2c] px-2 py-0.5 rounded-full">14 day free trial</span>
            </div>
            <div className="mb-1 flex items-baseline">
              <span className="text-[32px] font-bold text-white tracking-tight">${isAnnual ? '12' : '16'}</span>
            </div>
            <p className="text-[13px] text-gray-400 mb-6">per month/user</p>
            <button className="w-full rounded-md bg-white text-black py-2.5 text-[14px] font-semibold flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors mb-6 disabled">
              <ArrowRight className="h-4 w-4" /> Upgrade to Teams
            </button>
            <div className="flex-1">
              <p className="text-[13px] font-medium text-gray-300 mb-4">For growing teams</p>
              <ul className="space-y-3">
                {["Round-robin, fixed round-robin", "Collective events", "Routing forms", "Teams workflows", "Insights - analyze your booking data", "Remove branding"].map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-[13px] text-gray-400">
                    <span className="w-1 h-1 rounded-full bg-gray-500 mt-1.5 flex-shrink-0"></span>
                    <span className="leading-[1.3]">{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Organization */}
          <div className="rounded-xl border border-[#2c2c2c] bg-[#161616] p-6 flex flex-col hover:border-gray-500 transition-colors">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className="text-[16px] font-bold text-white">Organization</span>
              <span className="text-[11px] font-medium text-white bg-[#2c2c2c] px-2 py-0.5 rounded-full">14 day free trial</span>
            </div>
            <div className="mb-1 flex items-baseline">
              <span className="text-[32px] font-bold text-white tracking-tight">${isAnnual ? '28' : '37'}</span>
            </div>
            <p className="text-[13px] text-gray-400 mb-6">per month/user</p>
            <button className="w-full rounded-md border border-[#2c2c2c] text-white bg-transparent py-2.5 text-[14px] font-semibold flex items-center justify-center gap-2 hover:bg-white/5 transition-colors mb-6 disabled">
              <ArrowRight className="h-4 w-4" /> Upgrade to Orgs
            </button>
            <div className="flex-1">
              <p className="text-[13px] font-medium text-gray-300 mb-4">For scaling organizations</p>
              <ul className="space-y-3">
                {["Everything in Team", "Unlimited teams", "Verified domain", "Directory sync (SCIM)", "SAML SSO", "Admin panel"].map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-[13px] text-gray-400">
                    <span className="w-1 h-1 rounded-full bg-gray-500 mt-1.5 flex-shrink-0"></span>
                    <span className="leading-[1.3]">{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Enterprise */}
          <div className="rounded-xl border border-[#2c2c2c] bg-[#161616] p-6 flex flex-col hover:border-gray-500 transition-colors">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className="text-[16px] font-bold text-white">Enterprise</span>
            </div>
            <div className="mb-1 flex items-baseline">
              <span className="text-[32px] font-bold text-white tracking-tight">Custom</span>
            </div>
            <div className="h-[20px] mb-6"></div> {/* spacer */}
            <button className="w-full rounded-md border border-[#2c2c2c] text-white bg-transparent py-2.5 text-[14px] font-semibold flex items-center justify-center gap-2 hover:bg-white/5 transition-colors mb-6 disabled">
              <ArrowRight className="h-4 w-4" /> Get in touch
            </button>
            <div className="flex-1">
              <p className="text-[13px] font-medium text-gray-300 mb-4">For large enterprises</p>
              <ul className="space-y-3">
                {["Everything in Organization", "Dedicated support", "Custom SLA", "Custom integrations", "SOC2 & HIPAA compliance"].map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-[13px] text-gray-400">
                    <span className="w-1 h-1 rounded-full bg-gray-500 mt-1.5 flex-shrink-0"></span>
                    <span className="leading-[1.3]">{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-7 pt-2 pb-7">
          <div className="rounded-xl border border-[#2c2c2c] bg-[#161616] px-5 py-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-gray-400 mb-0.5">Individual</p>
              <p className="text-[18px] font-bold text-white">Free</p>
            </div>
            <button className="rounded-md border border-[#2c2c2c] bg-transparent px-4 py-2 text-[13px] font-semibold text-gray-400 hover:text-white hover:border-gray-500 transition-colors">
              Current plan
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
