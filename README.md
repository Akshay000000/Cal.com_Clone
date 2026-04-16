# Cal.com Clone

![Status](https://img.shields.io/badge/Status-Deployed_%E2%9C%85-brightgreen.svg)
** Live Demo:** [akshaycal.vercel.app](https://akshaycal.vercel.app)

A fully functional, modern, and high-performance clone of Cal.com built with **Next.js 14**, **Tailwind CSS**, **Prisma**, and **Clerk**. This application allows users to create configurable event types, manage their availability, and enable clients to smoothly book appointments across different timezones.

##  Features

###  Advanced Scheduling & Bookings
- **Dynamic Timezone Detection:** The booking page automatically detects the invitee's timezone, ensuring they only see slots in their local time.
- **Smart Slot Filtering:** Unavailable times (past times during the current day, overlapping bookings) are automatically stripped from the user interface to prevent double bookings.
- **Configurable Event Types:** Users can create custom event types with specific durations, pre- and post-buffer times, and custom URL slugs.

###  Authentication & Demo Mode
- **Clerk Integration:** Full authentication flow powered by [Clerk](https://clerk.com).
- **Graceful Unauthenticated Mode (Demo User):** The platform features a customized fallback "Demo User" account. Unauthenticated users can safely explore the user dashboard interfaces—but any destructive actions (Edit, Delete, Preview) trigger intuitive security toasts urging the user to log in.

###  Reliable Email Notifications
- Uses **Nodemailer** alongside a robust wrapper (`safeSend`) designed to run gracefully on serverless environments like Vercel.
- Integrated `Promise.allSettled` to prevent serverless function termination before the email completes sending.
- Beautifully formatted HTML confirmation emails sent to both the invitee and the organizer, bundled with dynamic `BASE_URL` links ensuring reliable custom domain resolutions.

###  Premium UI / UX
- **Mobile-First Responsiveness:** Thoroughly styled to collapse elegantly on mobile devices. Smooth slide-out mobile sidebars, scaling font styles, and responsive dropdowns.
- **Apple/Vercel Aesthetic:** Uses `#111111` / off-whites, sleek grid outlines, polished `lucide-react` iconography, and subtle CSS transitions for a premium, lightweight interactive feel.

##  Tech Stack
- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **Database:** PostgreSQL (Neon Serverless)
- **ORM:** Prisma
- **Auth:** Clerk
- **Emails:** Nodemailer (via Gmail SMTP)
- **Icons:** Lucide React

##  Project Structure

```bash
src/
├── app/
│   ├── (admin)/             # Authenticated dashboard views (Event types, etc.)
│   ├── api/                 # Next.js Route Handlers (Email, slots, webhooks)
│   ├── book/[slug]/         # Public booking page for invitees
│   └── page.tsx             # Marketing / Landing page
├── components/
│   ├── admin/               # Dashboard layout components (Sidebar, Navbar)
│   └── booking/             # Interactive booking widgets (MiniCalendar, TimeSlots)
├── lib/
│   ├── email.ts             # Nodemailer configuration and raw HTML templates
│   ├── prisma.ts            # Prisma client instantiation
│   └── slots.ts             # Timezone and buffer-aware availability mathematics
└── ...
```

##  Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/Akshay000000/Cal.com_Clone.git
cd Cal.com_Clone
```

### 2. Install dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Create a `.env` file in the root directory with the following variables:

```env
# Database
DATABASE_URL="your_neon_postgres_url"

# Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your_clerk_pub_key"
CLERK_SECRET_KEY="your_clerk_secret_key"
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Application URL
NEXT_PUBLIC_BASE_URL="http://localhost:3000"

# SMTP settings strictly configured for Vercel/Nodemailer compatibility
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="465"
SMTP_SECURE="true"
SMTP_USER="your_email@gmail.com"
SMTP_PASS="your_gmail_app_password"
SMTP_FROM="your_email@gmail.com"
```

### 4. Setup Database
Push the Prisma schema to your PostgreSQL database to construct the initial tables.
```bash
npx prisma db push
```

### 5. Run the Application
```bash
npm run dev
```
Navigate to `http://localhost:3000` to interact with the layout block. 

##  Deployment
This application is fully optimized for **Vercel**. Push your main branch and configure your environment variables mirroring the `.env` settings directly in your Vercel Project Settings.

Make sure `NEXT_PUBLIC_BASE_URL` is configured to the exact production domain (e.g., `https://akshaycal.vercel.app`) to ensure email links route correctly.
