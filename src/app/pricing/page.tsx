"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, ChevronRight, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";

const plans = [
  {
    name: "Individuals",
    price: "Free",
    period: "",
    description: "Everything you could need for scheduling as an individual.",
    cta: "Use for free",
    ctaStyle: "bg-[#111827] text-white hover:bg-gray-800",
    note: "*Free forever",
    featured: false,
    features: [
      "1 user",
      "Unlimited event types & calendars",
      "Email & SMS notifications",
      "Cal Video (1:1)",
      "Community support",
      "Accept payments (Stripe)",
      "2 workflows",
    ],
    prefix: "Free features:",
  },
  {
    name: "Teams",
    price: "$12",
    period: "per month/user",
    badge: "Save 25%",
    description: "For small teams and startups with combined scheduling needs.",
    cta: "Try for free",
    ctaStyle: "bg-[#111827] text-white hover:bg-gray-800",
    note: "*14 day free trial",
    featured: false,
    features: [
      "Schedule accross 1 team",
      "Round-robin scheduling",
      "Managed & collective events",
      "Routing forms",
      "Admin panel",
      "Organization branding",
      "SOC2 & HIPAA compliance",
    ],
    prefix: "Free plan features, plus:",
  },
  {
    name: "Organizations",
    price: "$28",
    period: "per month/user",
    badge: "Save 25%",
    description: "For larger teams looking to have more control, privacy, and security.",
    cta: "Try for free",
    ctaStyle: "border border-gray-300 bg-white text-[#111827] hover:bg-gray-50",
    note: "*14 day free trial",
    featured: true,
    features: [
      "Unlimited sub-teams",
      "Route by custom variables",
      "Company subdomain",
      "Insights & analytics",
      "DSynce (SCIM)",
      "Cal.ai phone agent",
      "Priority support",
    ],
    prefix: "Teams plan features, plus:",
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "The most advanced scheduling for enterprise without limits.",
    cta: "Talk to sales",
    ctaStyle: "bg-[#111827] text-white hover:bg-gray-800",
    note: "*Annual pricing",
    featured: false,
    features: [
      "Dedicated onboarding and engineering support",
      "SLA & uptime guarantees",
      "HRIS & directory integrations",
      "Custom contracts",
      "Compliance review",
      "Custom integrations",
    ],
    prefix: "Organizations plan features, plus:",
  },
];

export default function PricingPage() {
  const [yearly, setYearly] = useState(true);

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <Navbar />

      {/* Header */}
      <section className="pt-16 pb-12 px-6">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
              💰 Pricing
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-[#111827] leading-tight tracking-tight mb-4">
            Choose your Cal.com<br/>subscription
          </h1>
          <p className="text-gray-500 max-w-lg mb-8 leading-relaxed">
            Start scheduling for free, with no usage limits. For collaborative features, choose one of our
            premium plans that fits your company size.
          </p>
          <div className="flex items-center gap-3">
            <a href="#" className="inline-flex items-center gap-1.5 rounded-md bg-[#111827] px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800 transition-colors shadow-sm">
              Talk to sales <ChevronRight className="h-3.5 w-3.5" />
            </a>
            <a href="#comparison" className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              See feature breakdown <ChevronRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </section>

      {/* Pricing cards */}
      <section className="pb-20 px-6">
        <div className="mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-0 border border-gray-200 rounded-xl overflow-hidden">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`flex flex-col p-6 border-b md:border-b-0 md:border-r border-gray-200 last:border-r-0 last:border-b-0 ${
                  plan.featured ? "bg-gray-50 ring-2 ring-inset ring-[#111827] rounded-xl relative z-10" : "bg-white"
                }`}
              >
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-[#111827]">{plan.name}</h3>
                    {plan.name === "Teams" || plan.name === "Organizations" ? (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-medium text-gray-500 uppercase">Yearly</span>
                        <button
                          onClick={() => setYearly(!yearly)}
                          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                            yearly ? "bg-[#111827]" : "bg-gray-300"
                          }`}
                        >
                          <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform ${
                            yearly ? "translate-x-4" : "translate-x-1"
                          }`} />
                        </button>
                      </div>
                    ) : null}
                  </div>

                  <div className="flex items-baseline gap-1.5 mt-2">
                    <span className="text-3xl font-extrabold text-[#111827]">{plan.price}</span>
                    {plan.period && (
                      <span className="text-xs text-gray-500">{plan.period}</span>
                    )}
                    {plan.badge && (
                      <span className="ml-1 inline-flex rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700">
                        {plan.badge}
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-xs text-gray-500 leading-relaxed">{plan.description}</p>
                </div>

                <button className={`w-full rounded-md px-4 py-2.5 text-sm font-medium transition-colors mb-2 ${plan.ctaStyle}`}>
                  {plan.cta} {plan.cta !== "Talk to sales" && <span className="ml-1">›</span>}
                </button>
                {plan.note && (
                  <p className="text-[10px] text-gray-400 text-center mb-4">{plan.note}</p>
                )}

                <div className="border-t border-gray-100 pt-4 mt-auto">
                  <p className="text-xs font-medium text-gray-500 mb-3">{plan.prefix}</p>
                  <ul className="space-y-2.5">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <Check className="h-4 w-4 flex-shrink-0 text-[#111827] mt-0.5" />
                        <span className="text-xs text-gray-600 leading-relaxed">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature comparison teaser */}
      <section id="comparison" className="py-16 px-6 bg-gray-50 border-t border-gray-100">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-2xl font-bold text-[#111827] mb-4">Compare all features</h2>
          <p className="text-sm text-gray-500 mb-6">
            Every plan includes the core scheduling features. Premium plans add team collaboration,
            advanced routing, and enterprise security.
          </p>
          <Link
            href="/event-types"
            className="inline-flex items-center gap-2 rounded-md bg-[#111827] px-6 py-2.5 text-sm font-medium text-white hover:bg-gray-800 transition-colors shadow-sm"
          >
            Get started for free <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 px-6 bg-white">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-sm font-bold text-[#111827]">Cal<span className="text-gray-400">.com</span></span>
          <p className="text-xs text-gray-400">© {new Date().getFullYear()} Cal.com. Open source scheduling platform.</p>
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <Link href="/event-types" className="hover:text-gray-600 transition-colors">Dashboard</Link>
            <Link href="/pricing" className="hover:text-gray-600 transition-colors">Pricing</Link>
            <Link href="/login" className="hover:text-gray-600 transition-colors">Login</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
