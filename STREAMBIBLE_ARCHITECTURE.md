# StreamBible: Comprehensive Architecture & System Design

This document provides a top-level, exhaustive deep dive into StreamBible. It maps out the architecture, infrastructure, user experience paradigms, and the hidden technical details that make the application function robustly across desktop, mobile, and web environments.

---

## 1. Core Paradigm & Multi-Platform Strategy

StreamBible is built as a unified React 19 Single Page Application (SPA) using Vite and TypeScript. Rather than maintaining separate codebases, it uses a singular routing engine that serves two vastly different interfaces depending on the URL:
1. **The Controller (`/controller`)**: A complex dashboard for the operator to search, manage setlists, and push verses.
2. **The Output Screens (`/overlay`, `/fullscreen`)**: Minimalist, often transparent interfaces designed to be captured by broadcast software (OBS, vMix, ProPresenter).

This single SPA is packaged into three distinct distribution formats:
- **PWA (Web)**: Uses `vite-plugin-pwa` and Service Workers to cache assets (fonts, CSS, JS) allowing the app to run offline in a browser.
- **Electron (Desktop)**: Wraps the web build in a Chromium instance, utilizing a custom IPC bridge (`electron/main.ts`) for native file system access (saving Setlists as JSON files to the hard drive) and handling a custom frameless, transparent splash window to eliminate "white flash" during startup.
- **Capacitor (Android)**: Compiles the web view into a native APK. It utilizes custom XML Vector Drawables for adaptive icons and leverages the HTML "App Shell" to seamlessly bypass Android 12's restrictive OS-level splash screen designs.

---

## 2. The Synchronization Engine: "The Race Condition"

Because church Wi-Fi networks are notoriously unreliable and often strictly firewalled, syncing state between the Controller (a mobile phone) and the Overlay (a PC running OBS) is StreamBible's hardest engineering challenge. It is solved via a "Double-Barreled" network approach in `useSync.ts`.

When a user clicks "Show Verse", the payload is fired simultaneously down two network paths:

1. **Path A: WebRTC Data Channels (PeerJS)**
   - Attempts a direct peer-to-peer connection over the LAN. 
   - **Advantage:** Bypasses external servers entirely, resulting in sub-10ms latency.
   - **Drawback:** Frequently blocked by corporate symmetric NATs and mDNS isolation on guest Wi-Fi networks.
2. **Path B: Custom WebSocket Relay**
   - Both devices hold a persistent connection to a remote Node.js WebSocket relay server.
   - **Advantage:** Will penetrate almost any firewall (port 443).
   - **Drawback:** Relies on external internet speed and adds latency (~50-150ms).

**The Race Condition Implementation**: The Overlay screen listens to both channels. Whichever signal (WebRTC or WebSocket) arrives at the Overlay *first* triggers the React state update. The slower, duplicate message is ignored. This guarantees absolute zero-latency on good networks, and instant, invisible failover on bad networks.

---

## 3. Database Infrastructure & Caching Tiers

To eliminate API cost overhead and guarantee offline reliability, Bible data is fetched through a highly aggressive caching waterfall.

### Tier 1: Local Native Database (Supabase Postgres)
- Public domain and native translations (KJV, ASV, WEB, Yoruba Bibeli Mimo) are hosted directly on our Supabase Postgres database.
- **Security:** Strict Row Level Security (RLS) policies mean the `verses` table allows only unauthenticated `SELECT` queries, ensuring the public API cannot be maliciously written to.

### Tier 2: Proxied External APIs (API.Bible / NLT.to)
- Proprietary modern translations (NIV, NKJV, NLT) require paid API keys.
- **Security:** Keys are hidden inside a Supabase Deno Edge Function (`fetch-verse/index.ts`). The frontend never sees them.
- **The "Whole Chapter" Hack:** API.Bible charges per request. To bypass limits, when a user requests "John 3:16", the Edge Function actually queries and returns the *entirety of John Chapter 3*. 
- **HTML Slicing:** The frontend saves the full chapter HTML in IndexedDB, then uses a rapid Regex function to slice out only verse 16. If the user clicks verse 17 a second later, the app skips the network entirely, slicing verse 17 directly from the local chapter cache.

### Tier 3: Local IndexedDB (Dexie.js)
- `localStorage` is synchronous and limited to 5MB. StreamBible utilizes IndexedDB via `Dexie.js` to asynchronously store gigabytes of fetched scripture.
- Verses and entire chapters are saved permanently. This enables **Offline Setlists**: a worship leader can pre-click all their verses at home on Wi-Fi, caching them to IndexedDB. At church, if the internet completely dies, the app operates 100% locally.

---

## 4. UI/UX & Formatting Intelligence

The UI goes far beyond basic component rendering, addressing highly specific broadcast edge cases.

### The Network Prober
- In live production, "silent failures" are catastrophic (an operator clicks a verse, thinks it is live, but their network dropped 3 minutes ago).
- `useNetworkProber` runs a continuous background interval, silently pinging the local WebRTC peers and the WebSocket connection.
- If packets are dropped, a `NetworkWarningToast` immediately alerts the operator, while the `DeviceMonitor` visually red-flags disconnected overlay nodes.

### AutoFit Text Algorithm (`AutoFitFont.tsx`)
- Bible verses vary wildly in length (from 3 words to 50 words). Overlays have a strict fixed height in broadcast graphics.
- The `AutoFitFont` component dynamically calculates string length and recursively shrinks the `font-size` CSS property until the text mathematically fits within the bounding box without clipping or overflowing onto the video feed.

### FUMS (Fair Use Management System) Tracking
- API.Bible legally mandates tracking pixels (FUMS) for every verse rendered. 
- Because React apps don't reload pages, `FumsExecutor.tsx` silently intercepts the invisible `<script>` payloads returned by API.Bible and manually executes them in the DOM upon every verse display, keeping the app legally compliant.

### The Unified "App Shell" Splash Screen
- To make a web app feel like a premium native desktop/mobile app, `index.html` contains a hardcoded HTML/CSS splash screen overlay.
- During the exact milliseconds the JavaScript engine is downloading/parsing React, the user sees a beautiful blue gradient and animated loading dots.
- **The Overlay Exception:** An inline `<script>` check explicitly looks for the `/overlay` route and instantly applies `display: none` to the splash screen. This prevents OBS browser sources from temporarily painting a massive blue box over the church livestream when booting up.

---

## 5. LAN Discovery System

Without traditional accounts, getting a mobile phone to pair with an OBS PC is handled via "Public IP Matching".
1. Every 15 seconds, the Host Controller hits `api.ipify.org` to find the church's public WAN IP.
2. It POSTs a heartbeat to the Relay Server: `{ room_id: "X", public_ip: "1.2.3.4" }`.
3. When a mobile phone connects to the church Wi-Fi and clicks "Find nearby hosts", it also grabs its public IP (`1.2.3.4`) and asks the Relay Server for matches.
4. The Relay Server returns the matching `room_id`, allowing 1-click LAN pairing without ever sharing a URL or QR code.
