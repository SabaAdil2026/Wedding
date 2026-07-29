# Saba & Adil's Wedding Planner 💍

A premium, festive wedding-planning dashboard built with Next.js 14, Supabase, and
Tailwind CSS. Black & gold theme, animated countdown, dynamic events, task Kanban,
shopping & budget tracking, guest list, vendor directory, and a critical vendor
**booking tracker** with an automatic urgency engine.

Wedding date: **16th November 2026**

---

## 1. Prerequisites

- Node.js 18.18+ and npm
- A free [Supabase](https://supabase.com) account
- A free [Vercel](https://vercel.com) account (for deployment)

---

## 2. Set up Supabase

1. Go to [supabase.com](https://supabase.com) → **New Project**. Pick any name/region, set a database password.
2. Once the project is created, open **SQL Editor** → **New query**.
3. Paste the entire contents of `supabase/migrations/001_init.sql` and click **Run**.
   This creates every table, enum, trigger, RLS policy, storage bucket, and enables Realtime.
4. Go to **Project Settings → API**. Copy the **Project URL** and **anon public key** —
   you'll need these in step 3.

### Create your admin account

1. Run the app locally first (see step 3), or just use Supabase's **Authentication → Users → Add user** screen to create your account, OR simply sign up through the app's `/login` page (toggle to "Create an account").
2. Every new signup is created as a `volunteer` by default. To make yourself `admin`,
   open **SQL Editor** and run:

   ```sql
   update profiles set role = 'admin'
   where id = (select id from auth.users where email = 'YOUR_EMAIL@example.com');
   ```

3. (Optional) Load starter data — default events, budget categories, a starter
   shopping list, and one booking row per vendor category — by running
   `supabase/seed.sql` in the SQL Editor.

### Invite family & volunteers

Anyone can sign up from `/login`. They land as `volunteer` by default — promote
specific people to `family` or leave as `volunteer` using the same SQL pattern above,
or build a small admin UI later (the `profiles` table already supports it — admins can
update any profile's `role` per the RLS policy `admin manage profiles`).

---

## 3. Run locally

```bash
npm install
cp .env.example .env.local
# then edit .env.local and paste your Supabase URL + anon key
npm run dev
```

Visit `http://localhost:3000` — you'll be redirected to `/login`.

---

## 4. Deploy to Vercel

1. Push this project to a GitHub repository.
2. In Vercel: **Add New Project** → import the repo.
3. Under **Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Click **Deploy**. That's it — no other backend to stand up.

---

## 5. What's included

| Area | Details |
|---|---|
| **Auth** | Supabase Auth (email/password). Roles: `admin`, `family`, `volunteer`, enforced via Row Level Security — not just in the UI. |
| **Dashboard** | Live countdown (days/weeks/hrs/min/sec), % planning time elapsed, overall progress ring, urgent tasks, today's tasks, upcoming deadlines, event status cards, overdue booking alerts, recent activity. |
| **Events** | Fully dynamic — admins add/archive/delete events any time. Default seed: Haldi, Sangeet, Nikah, Reception. Each event gets its own Tasks / Shopping / Budget / Notes tabs. |
| **Tasks** | Kanban (drag-and-drop via dnd-kit) + table view. Priority, status, due date, assignees, completion %. Realtime sync across all connected users. Confetti fires when the last task in an event is completed. |
| **Shopping Planner** | Category-based items with budget vs actual price, purchased toggle, assignment. |
| **Budget** | Planned vs actual bar chart, spend-distribution pie chart, expense log with advance/vendor tracking. |
| **Guests** | Search, side (Bride/Groom/Both), group (Family/Friends/VIP), RSVP status, WhatsApp deep link. |
| **Vendors** | General contact directory with rating, advance/balance. |
| **Booking Tracker** | The dedicated, most detailed feature — one record per required vendor category (Makeup, Clothes, Decoration, Catering, Photography, Venue, etc). Automatic **urgency engine**: each category has a typical "ideal lead time" before the wedding (Venue/Catering ~9 months, Makeup/Clothes ~3–4 months, etc — see `BOOKING_LEAD_TIMES` in `lib/utils.ts`). Unbooked vendors are flagged Red/Orange/Yellow/Green based on days remaining vs. that lead time, with overdue ones surfaced on the homepage. |
| **Notifications** | In-app notification center; assignees get notified automatically via a DB trigger when assigned to a task. |
| **Global search** | Quick search across tasks, guests, and vendors from the top bar. |
| **Dark mode** | Toggle in the top bar. |
| **Realtime** | Tasks, shopping, budget expenses, bookings, guests, and notifications all sync live via Supabase Realtime — no refresh needed. |

---

## 6. Customizing the urgency engine

Edit `BOOKING_LEAD_TIMES` and the thresholds inside `getBookingUrgency()` /
`getTaskUrgency()` in `lib/utils.ts` to change how aggressively categories get
flagged. The wedding date itself lives in `WEDDING_DATE` in the same file.

---

## 7. File uploads (receipts, documents)

Storage buckets `receipts`, `files`, and `avatars` are already created and policy-protected
by the migration. To wire up a receipt upload button on a shopping item, use:

```ts
const { data, error } = await supabase.storage
  .from('receipts')
  .upload(`${itemId}/${file.name}`, file);

const { data: { publicUrl } } = supabase.storage.from('receipts').getPublicUrl(data.path);
await supabase.from('shopping_items').update({ receipt_url: publicUrl }).eq('id', itemId);
```

---

## 8. Project structure

```
app/
  (auth)/login/            — sign in / sign up
  (dashboard)/             — protected shell (sidebar + topbar)
    dashboard/              — homepage
    events/                 — event manager + [eventId] hub
    tasks/ shopping/ budget/ guests/ vendors/ bookings/
components/
  ui/                      — shadcn-style primitives (button, card, dialog...)
  dashboard/ tasks/ shopping/ budget/ guests/ vendors/ bookings/ events/
lib/
  supabase/                — browser + server client factories
  utils.ts                 — countdown + urgency engines, formatting, event themes
  data.ts                  — dashboard aggregation queries
supabase/
  migrations/001_init.sql  — full schema + RLS + triggers + realtime + storage
  seed.sql                 — starter events/budget/bookings/shopping rows
```

---

## 9. Notes & known limitations

- This is a real, working codebase — but it was generated in one pass. Before a big
  family rollout, click through as both an `admin` and a `volunteer` test account to
  confirm the RLS policies match how you want permissions to work.
- File-upload UI (the receipt/photo picker itself) is scaffolded via Storage but not
  wired into every form yet — the Storage buckets + policies are ready, see §7.
- The booking tracker seeds one row per category against the Nikah event by default;
  duplicate rows for other events (e.g. separate catering per function) directly from
  the "Add Booking" button.
