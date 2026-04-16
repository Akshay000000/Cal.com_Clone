"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });
    
    if (res?.error) {
      setError(res.error);
      setLoading(false);
    } else {
      router.push("/event-types");
      router.refresh();
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0a0a0a] px-4">
      {/* Login card */}
      <div className="w-full max-w-sm">
        <div className="rounded-xl border border-white/10 bg-[#191919] shadow-2xl">
          <div className="p-8 pb-6">
            {/* Logo */}
            <div className="text-center mb-6">
              <Link href="/" className="inline-block text-xl font-bold text-white tracking-tight hover:opacity-80 transition-opacity">
                Cal.com
              </Link>
              <p className="mt-1 text-sm text-gray-400">
                Welcome back! <span className="underline decoration-gray-600 underline-offset-2 cursor-pointer hover:text-gray-300 transition-colors">Sign in</span> to continue
              </p>
            </div>

            {/* Social sign-in buttons */}
            <div className="space-y-2.5 mb-6">
              <button 
                type="button"
                onClick={() => signIn("google")}
                className="flex w-full items-center justify-center gap-2.5 rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-white/[0.06] hover:border-white/20">
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Sign in with Google
              </button>

              <button 
                type="button"
                onClick={() => signIn("azure-ad")}
                className="flex w-full items-center justify-center gap-2.5 rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-white/[0.06] hover:border-white/20">
                <svg className="h-4 w-4" viewBox="0 0 23 23">
                  <path fill="#f35325" d="M1 1h10v10H1z"/>
                  <path fill="#81bc06" d="M12 1h10v10H12z"/>
                  <path fill="#05a6f0" d="M1 12h10v10H1z"/>
                  <path fill="#ffba08" d="M12 12h10v10H12z"/>
                </svg>
                Sign in with Microsoft
              </button>
            </div>

            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-[#191919] px-3 text-gray-500">or</span>
              </div>
            </div>

            {/* Email/Password form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm px-3 py-2 rounded-lg text-center">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-white placeholder-gray-600 outline-none transition-all focus:border-white/25 focus:ring-1 focus:ring-white/10"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-medium text-gray-300">Password</label>
                  <a href="#" className="text-sm text-gray-400 hover:text-gray-300 transition-colors">Forgot?</a>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 pr-10 text-sm text-white placeholder-gray-600 outline-none transition-all focus:border-white/25 focus:ring-1 focus:ring-white/10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-[#111827] transition-all hover:bg-gray-100 disabled:opacity-60"
              >
                {loading ? "Signing in..." : "Continue"}
              </button>
            </form>
          </div>

          {/* Footer */}
          <div className="border-t border-white/10 px-8 py-4 text-center">
            <p className="text-sm text-gray-400">
              <Link href="/event-types" className="font-medium text-white hover:underline underline-offset-2 transition-colors">
                Create account
              </Link>
              <span className="mx-2 text-gray-600">·</span>
              <a href="#" className="font-medium text-white hover:underline underline-offset-2 transition-colors">
                Sign in with SAML/OIDC
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
