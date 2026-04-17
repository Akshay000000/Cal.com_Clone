<![CDATA[<div align="center">

# 📅 Cal.com Clone

![Next.js](https://img.shields.io/badge/Next.js_14-000?logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?logo=tailwindcss&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white)
![Clerk](https://img.shields.io/badge/Clerk_Auth-6C47FF?logo=clerk&logoColor=white)
![Vercel](https://img.shields.io/badge/Deployed_on_Vercel-000?logo=vercel&logoColor=white)

A production-grade, full-stack scheduling platform inspired by [Cal.com](https://cal.com) — built from scratch with **Next.js 14**, **Prisma**, **Tailwind CSS**, and **Clerk**. Features real-time availability, cross-timezone booking, automated email notifications, and double-booking prevention.

### 🌍 [Live Demo → akshaycal.vercel.app](https://akshaycal.vercel.app)

</div>

---

## ✨ Key Features

### 📅 Scheduling & Bookings
- **Configurable Event Types** — Create events with custom durations (15, 30, 60, 90 min), URL slugs, buffer times, and booking questions
- **Real-Time Slot Computation** — Timezone-aware slot generation that filters past times and accounts for buffer periods
- **Cross-Event-Type Double-Booking Prevention** — Server-side conflict detection across *all* of a host's event types, not just the one being booked
- **Booking Lifecycle** — Full support for confirm → reschedule → cancel workflows with status tracking
- **Reschedule Chain Tracking** — Maintains `rescheduledFromId` references to preserve booking history

### 🌐 Timezone Intelligence
- **Auto-Detection** — The booking page detects the invitee's local timezone via the browser
- **Dynamic Slot Rendering** — Slots are computed and displayed in the invitee's timezone while stored in the host's timezone
- **Current-Day Filtering** — Past time slots on the current day are automatically hidden

### 🔐 Authentication & Demo Mode
- **Clerk Integration** — Full sign-up / sign-in flow with automatic user provisioning in the database
- **Demo Mode** — Unauthenticated users get a fully seeded "Demo User" account with sample event types, bookings, and availability schedules
- **Action Guards** — Destructive actions (edit, delete, create) are gated behind authentication with informative sign-in prompts

### 📧 Email Notification System
- **6 Email Types** — Booking confirmation, cancellation, reschedule (each sent to both the invitee and the host)
- **Automated Reminders** — Vercel Cron job runs daily at 9 AM UTC to send 24-hour reminders to both parties
- **Serverless-Safe Delivery** — Uses `Promise.allSettled` to await all emails before the serverless function responds, preventing Vercel from killing in-flight requests
- **Graceful Degradation** — Missing SMTP config logs warnings instead of crashing; the `safeSend` wrapper catches and logs all failures

### 💅 Premium UI / UX
- **Dark Theme** — Consistent `#111111` dark mode across all pages with Vercel/Apple-inspired design language
- **Mobile-First** — Responsive sidebar, slide-out mobile navigation, and adaptive layouts
- **Micro-Animations** — Smooth hover effects, transitions, and loading states using CSS transitions
- **Premium Feature Locks** — Teams, Routing, and Workflows pages show upgrade prompts with tier information

---

## 🏗 Project Architecture

```
cal-clone/
├── prisma/
│   ├── schema.prisma              # Database schema (8 models)
│   └── seed.js                    # Database seeder
│
├── src/
│   ├── app/
│   │   ├── (admin)/               # Authenticated dashboard (route group)
│   │   │   ├── layout.tsx         # Sidebar + Navbar shell
│   │   │   ├── event-types/       # Event type CRUD pages
│   │   │   ├── bookings/          # Booking management (upcoming/past/cancelled)
│   │   │   ├── availability/      # Weekly schedule + date overrides
│   │   │   ├── teams/             # Premium feature lock page
│   │   │   ├── routing/           # Premium feature lock page
│   │   │   └── workflows/         # Premium feature lock page
│   │   │
│   │   ├── api/                   # REST API (Next.js Route Handlers)
│   │   │   ├── bookings/          # POST create, GET list
│   │   │   │   └── [id]/          # GET, PATCH (cancel/reschedule)
│   │   │   ├── event-types/       # CRUD + public slug lookup
│   │   │   ├── slots/             # GET available slots (timezone-aware)
│   │   │   ├── schedules/         # Availability schedule CRUD
│   │   │   ├── availability/      # Availability rules management
│   │   │   ├── date-overrides/    # Date-specific schedule overrides
│   │   │   ├── cron/reminders/    # Vercel Cron: 24h email reminders
│   │   │   └── auth/              # NextAuth adapter for Clerk
│   │   │
│   │   ├── book/
│   │   │   └── [slug]/            # Public booking flow
│   │   │       ├── page.tsx       # Calendar + time slot picker
│   │   │       └── confirmed/     # Booking confirmation page
│   │   │
│   │   ├── login/                 # Custom login page
│   │   ├── sign-in/               # Clerk sign-in
│   │   ├── sign-up/               # Clerk sign-up
│   │   ├── pricing/               # Pricing tiers page
│   │   └── page.tsx               # Marketing landing page
│   │
│   ├── components/
│   │   ├── admin/
│   │   │   ├── Sidebar.tsx        # Dashboard sidebar navigation
│   │   │   ├── EventTypeForm.tsx  # Event type create/edit form
│   │   │   └── UpgradeView.tsx    # Premium feature lock component
│   │   ├── booking/
│   │   │   ├── CalendarPicker.tsx  # Mini calendar date selector
│   │   │   ├── TimeSlots.tsx      # Available time slot grid
│   │   │   └── BookingForm.tsx    # Booker details form
│   │   ├── Navbar.tsx             # Top navigation bar
│   │   └── ClientSessionProvider.tsx
│   │
│   ├── lib/
│   │   ├── auth.ts               # Clerk + demo user auth logic
│   │   ├── email.ts              # Nodemailer transporter + 6 HTML templates
│   │   ├── prisma.ts             # Prisma client singleton
│   │   └── slots.ts              # Slot generation & overlap detection math
│   │
│   └── types/
│       └── next-auth.d.ts        # TypeScript augmentations
│
├── vercel.json                    # Cron job configuration
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 📧 Email Notification System — Deep Dive

The email system (`src/lib/email.ts`) is purpose-built for serverless environments:

```
┌─────────────────────────────────────────────────────────┐
│                    Email Pipeline                       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Trigger Event                                          │
│       │                                                 │
│       ▼                                                 │
│  Route Handler (API)                                    │
│       │                                                 │
│       ├──▶ sendBookingConfirmation()  → Invitee         │
│       ├──▶ sendHostNotification()     → Host            │
│       ├──▶ sendCancellationEmail()    → Invitee         │
│       ├──▶ sendHostCancellationNotification() → Host    │
│       ├──▶ sendRescheduleEmail()      → Invitee         │
│       ├──▶ sendHostRescheduleNotification()  → Host     │
│       │                                                 │
│       ▼                                                 │
│  safeSend() wrapper                                     │
│       │                                                 │
│       ├── Check SMTP config (graceful skip if missing)  │
│       ├── Create transporter with extended timeouts     │
│       │   (10s connect, 10s greeting, 15s socket)       │
│       └── Send via Gmail SMTP (port 465, SSL)           │
│                                                         │
│  Cron Job (/api/cron/reminders)                         │
│       │                                                 │
│       ├── Runs daily at 09:00 UTC via Vercel Cron       │
│       ├── Finds confirmed bookings in next 24 hours     │
│       ├── sendReminderEmail() → Invitee                 │
│       ├── sendReminderEmail() → Host                    │
│       └── Marks booking.reminderSent = true             │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Key Design Decisions:**
- All emails are `await`ed via `Promise.allSettled` before the HTTP response is sent — critical for Vercel, which terminates pending promises after sending the response
- Extended socket timeouts (10–15s) accommodate cold-start latency in serverless
- The `safeSend` wrapper ensures a failed email never crashes a booking operation
- HTML templates are inline (no external dependencies) for maximum serverless compatibility

---

## 🔒 Double-Booking Prevention

The scheduling engine prevents conflicts at **three layers**:

| Layer | Location | What It Does |
|-------|----------|--------------|
| **Slot Display** | `GET /api/slots` | Queries all confirmed bookings across *every* event type for the host, then removes occupied slots from the UI |
| **Booking Creation** | `POST /api/bookings` | Server-side overlap check against all host bookings before inserting — returns `409 Conflict` if occupied |
| **Reschedule** | `PATCH /api/bookings/[id]` | Same cross-event-type check (excluding the booking being moved) before creating the new booking |

The overlap algorithm uses half-open interval math: `[A_start, A_end) ∩ [B_start, B_end) ≠ ∅`

---

## 🛠 Tech Stack

| Category | Technology | Purpose |
|----------|-----------|---------|
| **Framework** | Next.js 14 (App Router) | Server components, API routes, middleware |
| **Language** | TypeScript | End-to-end type safety |
| **Styling** | Tailwind CSS 3.4 | Utility-first responsive design |
| **Database** | PostgreSQL (Neon / Render) | Serverless-compatible relational DB |
| **ORM** | Prisma 5 | Type-safe database queries, migrations |
| **Auth** | Clerk | OAuth, email/password, session management |
| **Email** | Nodemailer (Gmail SMTP) | Transactional email delivery |
| **Icons** | Lucide React | Consistent icon system |
| **Deployment** | Vercel | Serverless hosting, edge middleware, cron |

---

## 📊 Database Schema

```
┌──────────┐     ┌─────────────┐     ┌──────────┐
│   User   │────▶│  EventType  │────▶│ Booking  │
│          │     │             │     │          │
│ id       │     │ id          │     │ id       │
│ clerkId  │     │ userId (FK) │     │ eventTypeId│
│ name     │     │ title       │     │ bookerName│
│ email    │     │ slug        │     │ date     │
│ timezone │     │ duration    │     │ startTime│
│ password │     │ buffer      │     │ endTime  │
└──────────┘     │ isActive    │     │ status   │
     │           └─────────────┘     │ notes    │
     │                  │            │ reminderSent│
     ▼                  │            └──────────┘
┌──────────────┐        │                 │
│ Availability │        ▼                 ▼
│  Schedule    │  ┌───────────┐    ┌─────────────┐
│              │  │ Booking   │    │ Booking     │
│ id           │  │ Question  │    │ Answer      │
│ userId (FK)  │  │           │    │             │
│ name         │  │ id        │    │ id          │
│ timezone     │  │ eventTypeId│   │ bookingId   │
│ isDefault    │  │ label     │    │ questionId  │
└──────────────┘  │ required  │    │ answer      │
     │            └───────────┘    └─────────────┘
     ▼
┌──────────────┐  ┌──────────────┐
│ Availability │  │    Date      │
│    Rule      │  │  Override    │
│              │  │              │
│ scheduleId   │  │ scheduleId   │
│ dayOfWeek    │  │ date         │
│ startTime    │  │ startTime    │
│ endTime      │  │ endTime      │
└──────────────┘  │ isBlocked    │
                  └──────────────┘
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18+
- **PostgreSQL** database (or a free [Neon](https://neon.tech) / [Render](https://render.com) instance)
- **Clerk** account for authentication ([clerk.com](https://clerk.com))
- **Gmail App Password** for email notifications ([Google Guide](https://support.google.com/accounts/answer/185833))

### 1. Clone the Repository

```bash
git clone https://github.com/Akshay000000/Cal.com_Clone.git
cd Cal.com_Clone
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root:

```env
# ── Database ─────────────────────────────────────────────
DATABASE_URL="postgresql://user:pass@host:5432/dbname"

# ── Clerk Authentication ─────────────────────────────────
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/event-types
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/event-types

# ── Email (Gmail SMTP) ──────────────────────────────────
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_gmail_app_password
SMTP_FROM="Your App <your_email@gmail.com>"

# ── Application ─────────────────────────────────────────
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 4. Set Up the Database

```bash
npx prisma db push
```

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app. No login required — the demo mode auto-seeds sample data.

---

## 🌐 Deployment (Vercel)

1. Push to GitHub and import the repo in [Vercel](https://vercel.com)
2. Add all `.env` variables in **Settings → Environment Variables**
3. Set `NEXT_PUBLIC_BASE_URL` to your production domain (e.g., `https://akshaycal.vercel.app`)
4. The `vercel.json` cron job automatically schedules daily email reminders at 9:00 AM UTC

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">

**Built with ❤️ by [Akshay](https://akshaycal.vercel.app)**

</div>
]]>
