# Cal Clone — Scheduling Platform

A functional scheduling/booking web application that replicates Cal.com's design and user experience.

## Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | Next.js 14 (App Router), React 18  |
| Styling   | Tailwind CSS                        |
| Backend   | Next.js API Routes (REST)           |
| ORM       | Prisma                              |
| Database  | PostgreSQL                          |
| Icons     | Lucide React                        |

## Features Implemented

### Core
- **Event Types Management** — Create, edit, delete event types with title, description, duration, and unique URL slug. List all on dashboard. Each has a unique public booking link (`/book/{slug}`).
- **Availability Settings** — Set available days of the week with per-day time ranges. Timezone selection. Save/update.
- **Public Booking Page** — Calendar view to select date. Displays available time slots based on availability rules. Booking form collects name + email + optional notes. Prevents double booking (overlap check). Confirmation page with full event details.
- **Bookings Dashboard** — View upcoming bookings, past bookings, cancelled bookings (3 tabs). Cancel a booking.

### Bonus
- **Responsive design** — Mobile hamburger nav, responsive layouts on all pages.
- **Date overrides** — Schema + API support for blocking dates or setting custom hours.
- **Toggle active/inactive** — Disable event types without deleting.

## Database Schema (6 tables)

- `users` — Default user (no auth per spec).
- `event_types` — Booking definitions with unique slugs. `is_active` flag.
- `availability_schedules` — Named schedules with timezone. Supports multiple (bonus).
- `availability_rules` — Per-day-of-week time windows. One row per day.
- `date_overrides` — Per-date exceptions: block or custom hours.
- `bookings` — Confirmed/cancelled bookings. Composite index on `(event_type_id, date, status)` for fast availability queries.

### Key Design Decisions
1. **Separate rules from schedule** — normalization. One schedule → many day rules.
2. **Store `end_time` on bookings** — denormalized from duration for efficient overlap queries.
3. **`BookingStatus` enum** — extensible to `rescheduled`, `no_show` later.
4. **Composite index** — `(event_type_id, date, status)` optimizes the most-frequent query: "what bookings exist for this event on this date?"

## Project Structure

```
prisma/
  schema.prisma          # Database schema (6 tables)
  seed.js                # Sample data

src/
  lib/
    prisma.ts            # Prisma client singleton
    slots.ts             # Slot calculation engine

  app/
    layout.tsx           # Root layout
    page.tsx             # Redirect → /event-types
    globals.css          # Tailwind + utility classes

    (admin)/             # Admin pages (sidebar layout)
      layout.tsx         # Sidebar + mobile nav
      event-types/
        page.tsx         # Dashboard list
        new/page.tsx     # Create form
        [id]/edit/page.tsx # Edit form
      availability/
        page.tsx         # Day toggles + time pickers
      bookings/
        page.tsx         # Upcoming/past/cancelled tabs

    api/                 # REST API routes
      event-types/       # GET, POST
        [id]/            # GET, PUT, DELETE
      availability/      # GET, PUT
      slots/             # GET (computed availability)
      bookings/          # GET, POST
        [id]/            # PATCH (cancel)

    book/[slug]/         # Public booking page
      page.tsx           # Calendar → slots → form
      confirmed/page.tsx # Confirmation

  components/
    admin/
      Sidebar.tsx
      EventTypeForm.tsx
    booking/
      CalendarPicker.tsx
      TimeSlots.tsx
      BookingForm.tsx
```

## Setup Instructions

### Prerequisites
- Node.js 18+
- PostgreSQL running locally or hosted (Neon, Supabase, etc.)

### 1. Install dependencies

```bash
npm install
```

### 2. Configure database

```bash
cp .env.example .env
```

Edit `.env` with your PostgreSQL connection string:
```
DATABASE_URL="postgresql://username:password@localhost:5432/cal_clone?schema=public"
```

### 3. Create tables and seed data

```bash
npx prisma migrate dev --name init
npx prisma db seed
```

### 4. Run

```bash
npm run dev
```

Open http://localhost:3000

### 5. Test the booking flow

1. Go to http://localhost:3000 — you'll see the Event Types dashboard
2. Click the external link icon on any event type → opens the public booking page
3. Select a date → pick a time slot → fill in name + email → confirm
4. Check the Bookings tab to see it appear

## Deployment

1. Push to GitHub (public repo)
2. Import in Vercel
3. Set `DATABASE_URL` env var to your hosted PostgreSQL
4. Vercel runs `postinstall` → `prisma generate` automatically
5. Run `npx prisma migrate deploy` against production DB
6. Run `npx prisma db seed` for initial data

## Assumptions

- Single default user (id: 1) assumed logged in — no authentication
- Time stored as `"HH:mm"` strings, dates as `"YYYY-MM-DD"` strings
- Slot intervals equal the event duration (no overlapping slots)
- Timezone is informational display — slot math uses server time
- The public booking page fetches event types by slug from the same API
