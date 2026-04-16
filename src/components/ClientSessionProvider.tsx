"use client";
// Kept as a no-op shim — auth is handled by Clerk (ClerkProvider in layout.tsx)
export default function ClientSessionProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
