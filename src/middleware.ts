import { clerkMiddleware } from "@clerk/nextjs/server";

// Clerk middleware runs on every request to attach auth context,
// but we do NOT call auth.protect() — admin routes are intentionally
// accessible without login (demo mode). Only /sign-in and /sign-up
// are truly "auth" pages handled by Clerk.
export default clerkMiddleware();

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
