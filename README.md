# Zen Learn

Distraction-free skill learning. You type a skill — Claude finds the best educators on YouTube, fetches their videos, runs an AI quality filter, and builds you a curated catalogue. No ads, no recommendations rabbit holes.

---

## How it works

```
User types a skill query
        │
        ▼
 Claude (Anthropic API)
 → Identifies top educators for that skill
        │
        ▼
 YouTube Data API v3
 → Resolves channel IDs
 → Fetches videos from each channel
 → Enriches with duration, views, metadata
        │
        ▼
 Claude (Anthropic API)
 → AI quality filter — keeps only genuinely relevant videos
        │
        ▼
 Firestore
 → Saves catalogue to users/{uid}/catalogues/{id}
 → Real-time sync across devices via onSnapshot
```

From there you can pin videos, remove noise, re-order, search within a catalogue, and re-discover new content on demand.

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS |
| Auth | Firebase Auth (Google Sign-in) |
| Database | Firestore |
| AI | Anthropic Claude API (claude-sonnet-4 by default) |
| Video data | YouTube Data API v3 |
| Hosting | Vercel (frontend + serverless API functions) |
| Local dev API | Node.js HTTP server (`devserver.mjs`) |
| PWA | vite-plugin-pwa |

---

## Architecture

```
┌─────────────────────────────────────────────┐
│  Browser (React SPA)                        │
│                                             │
│  ┌──────────┐  ┌────────────┐  ┌────────┐  │
│  │  Firebase │  │ /api/claude│  │/api/   │  │
│  │  Auth    │  │  (proxy)   │  │youtube │  │
│  └────┬─────┘  └─────┬──────┘  └───┬────┘  │
└───────┼──────────────┼─────────────┼────────┘
        │              │             │
        ▼              ▼             ▼
   Firebase       Vercel         Vercel
   Auth +      Serverless fn   Serverless fn
   Firestore   api/claude.js   api/youtube.js
                    │               │
                    ▼               ▼
              Anthropic API   YouTube Data API
```

The Vercel functions act as a secure proxy — API keys never reach the browser. Firebase Auth tokens are verified server-side on every request via Firebase Admin SDK.

**Local dev**: `devserver.mjs` runs a Node.js server on port 3001 that replicates the Vercel functions, without Firebase auth verification (so you can dev without a real account).

---

## Prerequisites

- Node.js 20+
- A [Firebase](https://console.firebase.google.com) project
- An [Anthropic](https://console.anthropic.com) API key
- A [Google Cloud](https://console.cloud.google.com) project with **YouTube Data API v3** enabled
- A [Vercel](https://vercel.com) account (for deployment)

---

## Setup

### 1. Fork and clone

```bash
git clone https://github.com/your-username/zen-learn.git
cd zen-learn
npm install
```

### 2. Firebase project

1. Go to [console.firebase.google.com](https://console.firebase.google.com) and create a project
2. **Firestore** → Create database → Start in production mode
3. **Authentication** → Sign-in method → Enable **Google**
4. **Project Settings** → General → Your apps → Add a Web app → copy the config values
5. **Project Settings** → Service accounts → Generate new private key → download the JSON

### 3. API keys

**Anthropic**
- Go to [console.anthropic.com](https://console.anthropic.com) → API Keys → Create key

**YouTube Data API v3**
- Go to [console.cloud.google.com](https://console.cloud.google.com) → APIs & Services → Enable **YouTube Data API v3**
- Credentials → Create API Key
- For server-side use (Vercel functions): set the key restriction to **None** or **IP addresses** — do not use HTTP referrers, as server requests have no referer header

### 4. Environment variables

Copy the example file:

```bash
cp .env.example .env
```

Fill in `.env` for local development:

```env
# Firebase client config (safe to expose — these go to the browser)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id

# App metadata
VITE_APP_NAME=Zen Learn
VITE_APP_VERSION=2.1.0

# Local dev API keys (used by devserver.mjs only — never sent to the browser)
ANTHROPIC_API_KEY=sk-ant-...
YOUTUBE_API_KEY=AIza...
```

> The `VITE_DEFAULT_*` variants in `.env.example` are a legacy pattern. Use the non-prefixed names for local dev so they match what the Vercel functions expect.

### 5. Update the admin email

Open `src/config/admins.js` and replace the email with yours:

```js
export const ADMIN_EMAILS = ["your-email@gmail.com"];
```

This controls who can approve invite requests from within the app.

### 6. Deploy Firestore security rules

```bash
npx firebase login
npx firebase use your-project-id
npx firebase deploy --only firestore:rules
```

### 7. Add yourself as the first approved user

The app is invite-only by default. In the Firebase console, go to **Firestore** and create a document:

- **Collection**: `invitations`
- **Document ID**: your Google account email (e.g. `you@gmail.com`)
- **Fields**: `status` (string) = `approved`

### 8. Run locally

You need two terminals:

```bash
# Terminal 1 — Vite dev server (frontend)
npm run dev

# Terminal 2 — local API server (replaces Vercel functions)
npm run dev:api
```

Open [http://localhost:5173](http://localhost:5173). Sign in with Google, and you should land on the Home screen.

---

## Deploy to Vercel

### 1. Push to GitHub and connect to Vercel

```bash
git remote set-url origin https://github.com/your-username/zen-learn.git
git push origin master
```

In the [Vercel dashboard](https://vercel.com), import the GitHub repo. Vercel auto-detects Vite.

### 2. Add environment variables

In **Project Settings → Environment Variables**, add these for both Production and Preview:

| Variable | Value | Notes |
|---|---|---|
| `VITE_FIREBASE_API_KEY` | Firebase API key | Client-side |
| `VITE_FIREBASE_AUTH_DOMAIN` | `your-project.firebaseapp.com` | Client-side |
| `VITE_FIREBASE_PROJECT_ID` | `your-project-id` | Client-side |
| `ANTHROPIC_API_KEY` | `sk-ant-...` | Server-side only |
| `YOUTUBE_API_KEY` | `AIza...` | Server-side only |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | Full service account JSON on one line | Server-side only |
| `DAILY_DISCOVERY_LIMIT` | `5` | Max catalogues per user per day |

For `FIREBASE_SERVICE_ACCOUNT_JSON`: open the downloaded service account JSON, minify it to a single line, and paste it as the value.

### 3. Deploy

Push any commit to `master` — Vercel deploys automatically. Or trigger manually:

```bash
npm install -g vercel
vercel --prod
```

---

## Removing the invite gate

If you want to make the app open to anyone who signs in, remove the invite check in `src/auth/AuthProvider.jsx`:

```js
// Remove this block and always set inviteStatus to "approved"
const snap = await getDoc(doc(db, "invitations", firebaseUser.email));
if (snap.exists() && snap.data().status === "approved") { ... }
```

And remove the `<InviteGate />` from `src/auth/AuthGuard.jsx`.

---

## Configurable settings

Users can adjust these from the in-app Settings page (stored in `localStorage`):

| Setting | Default | Description |
|---|---|---|
| Claude model | `claude-sonnet-4` | Affects quality and cost per discovery |
| Educator count | 5 | How many educators Claude finds per skill |
| Videos per skill | 200 | Max videos kept in a catalogue |
| Min video duration | 3 min | Filters out shorts and clips |
| Max video duration | 4 hours | Filters out very long recordings |
| Language | English | Passed to YouTube search |

---

## Project structure

```
zen-learn/
├── api/                    # Vercel serverless functions
│   ├── _lib.js             # Firebase Admin auth + rate limiting
│   ├── claude.js           # POST /api/claude → Anthropic proxy
│   └── youtube.js          # GET  /api/youtube → YouTube proxy
├── src/
│   ├── api/                # Client-side API callers
│   │   ├── firebase.js     # Firebase app init
│   │   ├── claude.js       # Calls /api/claude
│   │   └── youtube.js      # Calls /api/youtube
│   ├── auth/               # Firebase auth + invite gate
│   ├── components/         # UI components
│   ├── config/             # Defaults, admin list
│   ├── hooks/
│   │   ├── useCatalogue.js # Firestore CRUD + onSnapshot
│   │   ├── useDiscovery.js # Full discovery pipeline
│   │   └── useConfig.js    # User settings
│   └── pages/              # Route-level components
├── devserver.mjs           # Local dev API server (replaces Vercel functions)
├── firestore.rules         # Firestore security rules
├── vercel.json             # SPA rewrite rule
└── vite.config.js          # Vite + PWA config, proxies /api → localhost:3001
```

---

## Cost estimate

A single catalogue discovery makes roughly:
- 2–3 Claude API calls (educator discovery + quality filter)
- ~10–30 YouTube API units

At the default `DAILY_DISCOVERY_LIMIT=5`, a user doing the maximum each day costs well under $1/month at current API pricing. Adjust the limit in your Vercel environment variables.
