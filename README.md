# FocusTrack

A personal to-do and productivity tracking app: tasks, a daily view, a calendar, habits, weekly goals, analytics, and a transparent productivity score. Built with React, TypeScript, Tailwind CSS, and Vite. Works fully offline using local storage, with an optional Supabase backend for cross-device sync.

## 1. Project structure

```
focustrack/
├── public/
│   ├── icons/                 # PWA icons (192, 512)
├── src/
│   ├── types/index.ts         # Core data models (Task, Habit, Goal, Settings…)
│   ├── services/
│   │   ├── storage.ts         # IDataStore interface + LocalDataStore (localStorage)
│   │   └── supabase.ts        # SupabaseDataStore (same interface, cloud-backed)
│   ├── lib/productivity.ts    # Streaks, completion %, productivity score, recurrence
│   ├── context/
│   │   ├── AppContext.tsx     # Global state: tasks/habits/goals/settings + actions
│   │   ├── ThemeContext.tsx   # Light/dark/system theme
│   │   └── ToastContext.tsx   # Toast notifications
│   ├── components/
│   │   ├── layout/             # Sidebar, BottomNav, Header, FloatingAddButton
│   │   ├── common/              # Modal, ConfirmDialog, ProgressBar, EmptyState, Loading
│   │   ├── tasks/                # TaskForm, TaskCard, TaskFilters
│   │   ├── habits/                # HabitForm, HabitCard, HabitHeatmap
│   │   ├── goals/                  # GoalForm, GoalCard
│   │   └── charts/                  # WeeklyChart, CategoryChart, PriorityChart
│   ├── pages/                   # Dashboard, Today, Tasks, Calendar, Habits, Goals, Analytics, Settings
│   ├── App.tsx                  # Providers + navigation shell
│   └── main.tsx
├── supabase/schema.sql          # Tables + Row Level Security policies
├── .env.example                  # Supabase credentials template
└── vite.config.ts                # Includes the PWA plugin (manifest + service worker)
```

The data layer is intentionally isolated: every page talks to `useApp()` (from `AppContext`), which talks to `dataStore` (from `services/storage.ts`). Today `dataStore` is a `LocalDataStore`. To move to the cloud, you swap that one line for a `SupabaseDataStore` — no page or component changes.

## 2. Run it locally

```bash
npm install
npm run dev
```

Open the printed local URL (usually `http://localhost:5173`). Data persists in your browser's local storage, so refreshing keeps everything.

```bash
npm run build      # production build to dist/
npm run preview    # preview the production build locally
```

## 3. Deploy to Vercel

1. Push this project to a GitHub (or GitLab/Bitbucket) repository.
2. Go to vercel.com → **Add New… → Project** → import that repository.
3. Vercel auto-detects Vite. Confirm:
   - Build command: `npm run build`
   - Output directory: `dist`
4. If you're using Supabase (optional, see below), add the environment variables under **Project Settings → Environment Variables**:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Click **Deploy**. You'll get a URL like `https://focustrack-yourname.vercel.app`.

**Updating the deployed app later:** commit and push changes to the connected branch (usually `main`). Vercel automatically rebuilds and redeploys — nothing else to do. For a manual redeploy, use the **Redeploy** button on the project's Vercel dashboard.

## 4. Supabase setup (optional — for cross-device sync)

The app works fully without Supabase, using local storage. To sync the same account across your phone, laptop, and other devices:

1. Create a free project at supabase.com.
2. In the Supabase dashboard, go to **SQL Editor → New query**, paste the contents of `supabase/schema.sql`, and run it. This creates the `tasks`, `categories`, `habits`, `goals`, and `settings` tables with Row Level Security enabled, so each user can only ever access their own rows.
3. Go to **Project Settings → API** and copy the **Project URL** and **anon public key**.
4. Copy `.env.example` to `.env.local` and fill in both values:
   ```
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-public-key
   ```
5. In **Authentication → Providers**, make sure **Email** is enabled (it is by default) for email/password sign-in.
6. In `src/services/storage.ts`, change:
   ```ts
   export const dataStore: IDataStore = new LocalDataStore()
   ```
   to construct a `SupabaseDataStore(userId)` once you have a signed-in user (wire this through a small `AuthContext` that calls `supabase.auth.signInWithPassword` / `signUp` — `src/services/supabase.ts` already exports the configured `supabase` client and a ready `SupabaseDataStore` implementing the same interface).

The anon key is safe to expose in client code — it's the equivalent of a public API endpoint identifier. Actual data protection comes from the Row Level Security policies in `schema.sql`, which key every row to `auth.uid()`. Never put your Supabase **service role** key in client code or a `VITE_`-prefixed variable.

## 5. Install as an app

**Android (Chrome):**
1. Open your deployed FocusTrack URL in Chrome.
2. Tap the **⋮** menu → **Add to Home screen** (or you'll see an automatic install banner).
3. Confirm — FocusTrack now opens full-screen from your home screen like a native app.

**Windows (Chrome or Edge):**
1. Open the deployed URL.
2. Click the **install icon** in the address bar, or open the **⋮ / …** menu → **Install FocusTrack** (Chrome) / **Apps → Install this site as an app** (Edge).
3. FocusTrack opens in its own window and appears in your Start menu.

Offline: the service worker caches the app shell, so it opens even without a connection; since data is local-first (or synced opportunistically with Supabase), you can keep working offline and it will pick back up when you're online.

## 6. How the numbers are calculated

- **Completion %** = completed tasks ÷ total tasks due on that day (or range) × 100. Tasks due in the future never count against today's percentage.
- **Streak**: a day counts if at least one task due that day was completed. Missing a day resets the streak to 0 (checked from today backwards).
- **Productivity score (0–100)**: 40% today's completion rate, 25% the priority-weighted share of completed tasks (high priority counts for more), 20% consistency (current streak, capped at 14 days), minus up to 15 points for overdue tasks (−3 per overdue task). The breakdown is shown on the Analytics page — nothing is hidden.
- **Recurring tasks**: completing a recurring task automatically creates its next occurrence (daily / weekdays / weekly / monthly) with a fresh due date; it doesn't touch the completed one.
- **Overdue tasks** stay visible (in Today and Tasks) until completed or their due date is edited.

## 7. Testing checklist

- [ ] Add, edit, delete, complete/undo a task
- [ ] Search, filter, and sort on the Tasks page
- [ ] Calendar: select a date, add a task to it, see it reflected
- [ ] Habits: mark today done, streak updates, heatmap fills in
- [ ] Goals: add a weekly goal, progress updates as matching tasks complete
- [ ] Analytics: charts render with real data, score breakdown adds up
- [ ] Settings: theme switch (light/dark/system), export JSON/CSV, import a JSON backup, clear data
- [ ] Refresh the page — nothing is lost
- [ ] Resize to a phone width — bottom nav + floating add button appear, sidebar hides
- [ ] Resize to desktop — sidebar appears, bottom nav hides

## 8. Notes and honest limitations

- This project was generated outside an npm-capable environment, so `npm install` has not actually been run against it here — run it locally and fix any dependency-version hiccups you hit (versions in `package.json` were current as of early 2026).
- Task reminders use the browser's local `Notification` API when permission is granted; there's no background push server, so reminders only fire while the app/tab has been opened recently on that device. A true background push would need a server-sent push subscription — a reasonable next step once Supabase is wired in.
- The Supabase integration is fully scaffolded (schema, RLS, typed row mapping, `SupabaseDataStore`) but authentication UI (sign in / sign up screens) is not included — wire a small `AuthContext` around `supabase.auth` and swap `dataStore` as described in section 4.
