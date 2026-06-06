# Changelog

All notable changes to this project are documented here.
Follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) format.

---

## [Unreleased]

### Added — Admin: View Student Wrong Answers

**Files changed:** `lib/db.js`, `pages/api/admin.js`, `pages/admin.js`

Admins can now inspect exactly which questions a student got wrong, directly from the admin dashboard.

- **`lib/db.js`** — New `getWrongAnswers(attemptId)` function.
  - Fetches all `answers` rows where `is_correct = false` for a given attempt.
  - Fetches the corresponding `questions` rows (text, options, position).
  - Reconstructs the **exact shuffled option order** the student saw by re-running the same deterministic `shuffleWithSeed` used at quiz start time, keyed by `${studentKey}-opts-${qIdx}`.
  - Returns options in shuffled order so that `selected_index` and `correct_index` (which are shuffled positions stored at submit time) correctly highlight the right choices.

- **`pages/api/admin.js`** — New `wrong_answers` sub-action on the `GET` endpoint.
  - `GET /api/admin?password=xxx&action=wrong_answers&attemptId=yyy`
  - Password-protected. Requires Supabase to be configured.
  - Returns `{ wrongAnswers: [...] }`.

- **`pages/admin.js`** — New "View Answers" modal in the Submitted results table.
  - Each submitted student row now has a **"View Answers"** link (indigo, next to Reset).
  - Clicking it opens a blurred-backdrop modal showing every incorrectly answered question.
  - Each option is rendered in a pill with color-coded badges:
    - 🟢 **Green** — Correct answer
    - 🔴 **Red** — Student's chosen answer
  - Handles: loading spinner, network/API errors, and the "perfect score" (no wrong answers) case.
  - Modal closes by clicking the backdrop or the Close button.

### Fixed — Wrong answer display showing incorrect option highlights

**File changed:** `lib/db.js`

The initial implementation of `getWrongAnswers` was using the **original unshuffled** options array from the `questions` table and indexing into it with `selected_index` / `correct_index` — which are actually **positions in the per-student shuffled order**. This caused the wrong options to be highlighted.

**Fix:** The function now re-runs `shuffleWithSeed` with the same seed (`${studentKey}-opts-${qIdx}`) that `start.js` uses, producing the exact `optionOrder` mapping. Options are then presented in the shuffled order so that stored indices correctly reference the displayed options.

---

## [Previous] — Restrict Quiz Participation Access

**Files changed:** `pages/api/active-quiz.js`, `pages/index.js`

Students can no longer enter their details or begin the quiz when no quiz is currently active.

- **`pages/api/active-quiz.js`** — The `/api/active-quiz` endpoint now returns `{ isActive: boolean }` alongside the quiz title. Returns `isActive: false` when no active quiz exists in Supabase.

- **`pages/index.js`** — The student landing page checks `isActive` on load.
  - When `isActive` is `false`, the name/email/DOB entry form is hidden and replaced with a "No active quiz — contact your admin" message.
  - Prevents unauthorized participation when an exam is not running.
