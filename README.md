# Cal.com Clone

[![Live Demo](https://img.shields.io/badge/🌍_Live_Demo-akshaycal.vercel.app-000?style=for-the-badge)](https://akshaycal.vercel.app)

[![Next.js](https://img.shields.io/badge/Next.js_14-000?style=flat-square&logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Tailwind](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=flat-square&logo=prisma&logoColor=white)](https://prisma.io)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://postgresql.org)
[![Clerk](https://img.shields.io/badge/Clerk-6C47FF?style=flat-square&logo=clerk&logoColor=white)](https://clerk.com)
[![Vercel](https://img.shields.io/badge/Vercel-000?style=flat-square&logo=vercel&logoColor=white)](https://vercel.com)

A production-grade, full-stack scheduling platform inspired by [Cal.com](https://cal.com). Built from scratch with **Next.js 14**, **Prisma**, **Tailwind CSS**, and **Clerk**. Features real-time availability, cross-timezone booking, automated email notifications, and robust double-booking prevention.

---

##  Features

###  Scheduling & Bookings
- Create events with custom durations (15 / 30 / 60 / 90 min), unique URL slugs, buffer times, and custom booking questions
- Timezone-aware slot generation — filters past times and accounts for buffer periods
- **Cross-event-type double-booking prevention** — conflict detection spans all of a host's event types, not just the one being booked
- Full booking lifecycle: **confirm → reschedule → cancel** with status tracking and chain references

###  Timezone Intelligence
- Auto-detects the invitee's local timezone via the browser
- Slots rendered in the invitee's timezone, stored in the host's timezone
- Past slots on the current day are automatically hidden

###  Authentication & Demo Mode
- **Clerk** sign-up / sign-in with automatic database user provisioning
- **Demo Mode** — unauthenticated visitors get a fully seeded account with sample events, bookings, and availability
- Edit / delete / create actions are gated behind auth with informative sign-in prompts

###  Email Notifications (6 types)
- Booking confirmation → invitee
- New booking alert → host
- Cancellation notice → invitee & host
- Reschedule notice → invitee & host
- **Automated 24-hour reminders** via Vercel Cron (runs daily at 9 AM UTC)
- Serverless-safe delivery using `Promise.allSettled` and the `safeSend` wrapper

###  Premium UI / UX
- Dark theme with Vercel/Apple-inspired `#111111` design language
- Mobile-first responsive layout with slide-out sidebar
- Micro-animations, hover effects, and smooth transitions
- Premium feature lock pages (Teams, Routing, Workflows)

---

##  Tech Stack

| Category | Technology | Purpose |
|:---------|:-----------|:--------|
| Framework | **Next.js 14** (App Router) | Server components, API routes, middleware |
| Language | **TypeScript** | End-to-end type safety |
| Styling | **Tailwind CSS 3.4** | Utility-first responsive design |
| Database | **PostgreSQL** (Neon / Render) | Serverless-compatible relational DB |
| ORM | **Prisma 5** | Type-safe queries and migrations |
| Auth | **Clerk** | OAuth, email/password, sessions |
| Email | **Nodemailer** (Gmail SMTP) | Transactional email delivery |
| Icons | **Lucide React** | Consistent icon system |
| Hosting | **Vercel** | Serverless deploy, edge middleware, cron |

---

##  Project Architecture

```
cal-clone/
├── prisma/
│   ├── schema.prisma                 # 8 database models
│   └── seed.js                       # Seeder script
│
├── src/
│   ├── app/
│   │   ├── (admin)/                  # Dashboard (route group)
│   │   │   ├── layout.tsx            # Sidebar + Navbar shell
│   │   │   ├── event-types/          # Event type CRUD
│   │   │   ├── bookings/             # Upcoming / Past / Cancelled
│   │   │   ├── availability/         # Weekly rules + date overrides
│   │   │   ├── teams/                # Premium lock page
│   │   │   ├── routing/              # Premium lock page
│   │   │   └── workflows/            # Premium lock page
│   │   │
│   │   ├── api/
│   │   │   ├── bookings/             # Create + list bookings
│   │   │   │   └── [id]/             # Get, cancel, reschedule
│   │   │   ├── event-types/          # CRUD + public slug lookup
│   │   │   ├── slots/                # Available slots (tz-aware)
│   │   │   ├── schedules/            # Availability schedules
│   │   │   ├── availability/         # Availability rules
│   │   │   ├── date-overrides/       # Date-specific overrides
│   │   │   ├── cron/reminders/       # Vercel Cron: 24h reminders
│   │   │   └── auth/                 # Clerk auth adapter
│   │   │
│   │   ├── book/[slug]/              # Public booking flow
│   │   │   ├── page.tsx              # Calendar + time picker
│   │   │   └── confirmed/            # Confirmation page
│   │   │
│   │   ├── login/                    # Custom login
│   │   ├── sign-in/ & sign-up/       # Clerk auth pages
│   │   ├── pricing/                  # Pricing tiers
│   │   └── page.tsx                  # Landing page
│   │
│   ├── components/
│   │   ├── admin/                    # Sidebar, EventTypeForm, UpgradeView
│   │   ├── booking/                  # CalendarPicker, TimeSlots, BookingForm
│   │   └── Navbar.tsx                # Top navigation
│   │
│   └── lib/
│       ├── auth.ts                   # Clerk + demo user logic
│       ├── email.ts                  # Nodemailer + 6 HTML templates
│       ├── prisma.ts                 # Prisma singleton
│       └── slots.ts                  # Slot math & overlap detection
│
├── vercel.json                       # Cron config
└── package.json
```

---

##  Email Notification System

The email system in `src/lib/email.ts` is built for serverless (Vercel):

**Email Types:**

| Event | To Invitee | To Host |
|:------|:-----------|:--------|
| New booking | ✅ Confirmation | ✅ New booking alert |
| Cancellation | ✅ Cancellation notice | ✅ Cancellation alert |
| Reschedule | ✅ New time details | ✅ Reschedule alert |
| 24h Reminder | ✅ Upcoming reminder | ✅ Upcoming reminder |

**Design Decisions:**

- **`safeSend()` wrapper** — catches errors so a failed email never crashes the booking flow
- **`Promise.allSettled()`** — all emails are awaited before the HTTP response, critical for Vercel which kills pending promises after responding
- **Extended timeouts** (10s connect, 10s greeting, 15s socket) for serverless cold starts
- **Graceful degradation** — missing SMTP config logs a warning instead of throwing
- **Inline HTML templates** — zero external dependencies for maximum compatibility

**Cron Reminders:**

Configured in `vercel.json` to run daily at `09:00 UTC`. The job finds confirmed bookings within the next 24 hours, sends reminders to both parties, and marks `reminderSent = true` to prevent duplicates.

---

##  Double-Booking Prevention

Conflicts are blocked at **three layers**:

| Layer | Endpoint | How It Works |
|:------|:---------|:-------------|
| **Slot Display** | `GET /api/slots` | Queries all confirmed bookings across every event type for the host, removes occupied slots from the UI |
| **Booking Creation** | `POST /api/bookings` | Server-side overlap check against all host bookings — returns `409 Conflict` if occupied |
| **Reschedule** | `PATCH /api/bookings/[id]` | Same cross-event-type check, excluding the booking being rescheduled |

**Overlap algorithm:** Half-open interval math — `[A_start, A_end) ∩ [B_start, B_end) ≠ ∅`

---

##  Database Schema

**8 models** defined in `prisma/schema.prisma`:

| Model | Purpose | Key Fields |
|:------|:--------|:-----------|
| **User** | Host accounts | `clerkId`, `name`, `email`, `timezone` |
| **EventType** | Bookable event templates | `title`, `slug`, `durationMinutes`, `bufferMinutes`, `isActive` |
| **Booking** | Scheduled appointments | `date`, `startTime`, `endTime`, `status`, `reminderSent` |
| **BookingQuestion** | Custom questions per event type | `label`, `required`, `order` |
| **BookingAnswer** | Invitee responses to questions | `bookingId`, `questionId`, `answer` |
| **AvailabilitySchedule** | Named schedule per user | `name`, `timezone`, `isDefault` |
| **AvailabilityRule** | Weekly recurring rules | `dayOfWeek`, `startTime`, `endTime` |
| **DateOverride** | Date-specific exceptions | `date`, `startTime`, `endTime`, `isBlocked` |

**Relationships:**
- `User` → has many `EventType` and `AvailabilitySchedule`
- `EventType` → has many `Booking` and `BookingQuestion`
- `Booking` → has many `BookingAnswer`; self-references via `rescheduledFromId`
- `AvailabilitySchedule` → has many `AvailabilityRule` and `DateOverride`

---

##  Getting Started

### Prerequisites

- **Node.js 18+**
- **PostgreSQL** — free tier on [Neon](https://neon.tech) or [Render](https://render.com)
- **Clerk** account — [clerk.com](https://clerk.com)
- **Gmail App Password** — [Google Guide](https://support.google.com/accounts/answer/185833)

### Setup

```bash
# 1. Clone
git clone https://github.com/Akshay000000/Cal.com_Clone.git
cd Cal.com_Clone

# 2. Install
npm install

# 3. Configure .env (see below)

# 4. Push database schema
npx prisma db push

# 5. Run
npm run dev
```

Open **http://localhost:3000** — no login required, demo mode auto-seeds sample data.

### Environment Variables

Create a `.env` file in the project root:

```env
# Database
DATABASE_URL="postgresql://user:pass@host:5432/dbname"

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/event-types
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/event-types

# Email (Gmail SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_gmail_app_password
SMTP_FROM="Cal Clone <your_email@gmail.com>"

# App
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

---

##  Deployment

This app is optimized for **Vercel**:

1. Push to GitHub → import in [Vercel](https://vercel.com)
2. Add all `.env` variables in **Settings → Environment Variables**
3. Set `NEXT_PUBLIC_BASE_URL` to your production domain
4. The cron job in `vercel.json` auto-schedules daily reminders at 9 AM UTC

---

## 📄 License

Open source under the [MIT License](LICENSE).

---

**Built by [Akshay](https://www.linkedin.com/in/akshay-sriram-6b8215296/)** ✦
