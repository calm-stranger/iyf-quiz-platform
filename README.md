# Quiz Platform

A minimal, reliable online quiz system for live exams. Built with Next.js, Upstash Redis for live sessions, and optional Supabase Postgres for durable quiz history.

## Features

- 🔀 **Shuffled questions & options** — unique order per student, prevents answer sharing
- ⏱️ **Server-side timer** — start time stored in KV, can't be tampered via refresh
- 🚫 **Tab/app switch detection** — warning on first violation, auto-submit on second
- 📊 **Admin dashboard** — live view of submissions, scores, violations, CSV export
- 🗂️ **Quiz history with Supabase** — create quizzes, publish/close them, and keep past attempts
- 🔄 **Session resume** — page refresh doesn't lose progress or reset violations
- 👥 **50-student cap** — configurable via environment variable

---

## Deploy in ~10 minutes

### Prerequisites
- [Node.js](https://nodejs.org) 18+
- [Vercel account](https://vercel.com) (free)
- [Vercel CLI](https://vercel.com/docs/cli): `npm i -g vercel`

---

### Step 1 — Clone & install

```bash
# (after unzipping the project)
cd quiz-platform
npm install
```

---

### Step 2 — Deploy to Vercel

```bash
vercel          # follow the prompts: new project, defaults are fine
```

---

### Step 3 — Create an Upstash Redis store

1. Go to [upstash.com](https://upstash.com/) and create a free account.
2. Click **Create Database** in the Redis section. Name it (e.g. `quiz-store`) and pick a region.
3. Scroll down to the **REST API** section of your new database.
4. Add these environment variables locally (`.env.local`) and in Vercel Dashboard:

| Variable | Value |
|---|---|
| `UPSTASH_REDIS_REST_URL` | Your REST URL |
| `UPSTASH_REDIS_REST_TOKEN` | Your REST Token |

---

### Step 4 — Optional: Create Supabase database

Supabase is recommended for real exams because it stores every quiz and attempt permanently.

1. Create a Supabase project.
2. Open **SQL Editor**.
3. Run the SQL in `supabase/schema.sql`.
4. Open **Project Settings → API**.
5. Copy:
   - Project URL
   - Service role key

Add these environment variables locally and in Vercel:

| Variable | Value |
|---|---|
| `SUPABASE_URL` | Your Supabase Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role key |

Keep the service role key server-side only. Do not expose it in browser code.

---

### Step 5 — Set your environment variables

In Vercel Dashboard → **Settings** → **Environment Variables**, add:

| Variable | Value |
|---|---|
| `ADMIN_PASSWORD` | A strong password for `/admin` |
| `QUIZ_DURATION_MINUTES` | `30` (or however long your quiz is) |
| `MAX_STUDENTS` | `50` |
| `SUPABASE_URL` | Optional, recommended for real exams |
| `SUPABASE_SERVICE_ROLE_KEY` | Optional, recommended for real exams |

Make sure `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are set in your Vercel project variables.

---

### Step 6 — Create quizzes

Without Supabase, the app uses `lib/questions.js` as the local question bank.

With Supabase configured:

1. Visit `/admin`.
2. Create a new quiz.
3. Click **Import questions.js** to seed it with the current local questions.
4. Click **Publish** to make it the active student quiz.
5. Click **Close** when the exam is over.

Only one quiz is active at a time. Publishing one quiz automatically closes any previously active quiz.

Each question in `lib/questions.js` still looks like:

```js
{
  id: 1,
  question: "What is the capital of France?",
  options: ["London", "Berlin", "Paris", "Madrid"],
  correct: 2   // ← zero-based index of the correct option
}
```

You can keep using `lib/questions.js` as an import template while the admin database workflow grows.

---

### Step 7 — Redeploy

```bash
vercel --prod
```

Your quiz is live! Share the URL with students.

---

## Usage

| URL | Purpose |
|---|---|
| `your-app.vercel.app/` | Student landing page (name entry) |
| `your-app.vercel.app/admin` | Admin results dashboard |

---

## Local development (no KV required)

```bash
npm run dev
```

Without `UPSTASH_REDIS_REST_URL` set, the app uses an **in-memory store** — data resets on server restart, but everything works for testing.

---

## Anti-cheat details

| Mechanism | How it works |
|---|---|
| Tab switch | `document.visibilitychange` event |
| App switch | `window.blur` with 3-second grace period |
| Violation tracking | Server-side in Redis (refresh doesn't reset count) |
| Question order | Fisher-Yates shuffle seeded by student name |
| Option order | Same shuffle, seeded per question |
| Correct answers | Never sent to browser — graded server-side only |

> **Note:** Browser-based anti-cheat is a deterrent, not DRM. It won't stop screen recording or a second device. It effectively prevents casual tab-switching and answer-sharing between students.

---

## Admin panel

Visit `/admin` and enter your `ADMIN_PASSWORD`.

You can:
- Create quizzes
- Import the current `questions.js` question bank
- Publish or close quizzes
- View past quiz results
- See submitted scores, time taken, violations, auto-submit flag
- Monitor active sessions (who's currently taking the quiz)
- Export results as CSV per quiz
- Reset a student to allow a retake

---

## Troubleshooting

**"Maximum students reached"** — Increase `MAX_STUDENTS` in env vars and redeploy.

**"Already submitted"** — Use the Reset button in `/admin` to allow a retake.

**Redis errors in production** — Make sure your Upstash variables are correctly set in Vercel.

**Timer seems wrong** — The timer is calculated from `startTime` stored in Redis. It's accurate regardless of client clock drift.
