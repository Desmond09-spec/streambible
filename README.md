# StreamBible

StreamBible is an open-source, high-performance, offline-resilient web application designed to instantly display multilingual Bible verses on church livestreams and in-house screens. It provides a premium, zero-latency Controller dashboard that pushes lower-third overlays and full-screen graphics directly to broadcasting software like OBS Studio.

---

## The Pain It Solves

During a live church service, the speaker can call out a scripture at a moment's notice. Traditional church presentation software is often:
- **Expensive & Clunky:** Requiring heavy licenses and powerful dedicated hardware.
- **Single-Language Focused:** Poorly equipped to handle fast, dynamic dual-language presentations (e.g., English side-by-side with Yoruba).
- **Latency Prone:** Web-based alternatives often rely on slow cloud WebSockets, introducing unacceptable delays between the operator clicking "Push" and the verse appearing on the livestream.
- **Fragile:** Highly dependent on stable church Wi-Fi. If the internet drops, the presentation stops.

## How StreamBible Solves It

StreamBible is built specifically for speed, reliability, and broadcast integration:
- **Instant Dual-Language Display:** Search a reference like "John 3:16", instantly fetch it in multiple curated translations, preview it, and push it live.
- **OBS Integration:** Generates unique overlay links (transparent backgrounds) that drop directly into OBS Browser Sources. 
- **Zero-Latency Synchronization:** Instead of routing clicks through a cloud server, the Controller and the OBS Overlay communicate directly peer-to-peer over your local network. When you push a verse, it appears in milliseconds.
- **"Doomsday" Offline Resilience:** StreamBible operates as an offline-first Progressive Web App (PWA) with native Windows/Mac (Electron) and Android (Capacitor) wrapper apps available. Operators can pre-cache their Sunday setlists in advance. If the internet fails entirely, the application fetches verses from the local database and syncs to the screen via the local router.
- **Smart Caching Engine:** Features full-chapter local caching (fetching adjacent verses makes zero network calls), global Supabase caching to prevent rate-limiting across devices, and an automated 30-day TTL for fresh translation updates.

---

## Getting Started

To run StreamBible locally, contribute to the codebase, or build your own desktop/mobile installers, follow these steps.

### 1. Prerequisites
- **Node.js** (v18 or higher recommended)
- **Git**

### 2. Installation
Clone the repository and install the dependencies:
```bash
git clone https://github.com/Desmond09-spec/streambible.git
cd streambible
npm install
```

### 3. Environment Variables & API Keys
StreamBible relies on a few external services to fetch Bible texts and handle network discovery. You must create a `.env` file in the root directory based on `.env.example`:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

VITE_RELAY_SERVER_URL=wss://your_custom_relay_server_url
```

#### Setting up API.Bible & NLT.to (Supabase Secrets)
To protect your API keys from being exposed in the frontend, StreamBible securely proxies all requests through Supabase Edge Functions. You must set your API keys as Supabase Secrets, **not** in your `.env` file!

1. Go to [scripture.api.bible](https://scripture.api.bible/) and [nlt.to/api](https://nlt.to/api) to get your free developer keys.
2. In your terminal (with the Supabase CLI installed), set your secrets:
```bash
supabase secrets set API_BIBLE_KEY=your_api_bible_key
supabase secrets set NLT_API_KEY=your_nlt_key
```
3. Deploy the Edge Function to your Supabase project:
```bash
supabase functions deploy fetch-verse
```

#### Setting up the Custom WebSocket Relay
To bypass cloud limits and guarantee zero-latency syncing:
1. Push the `streambible-relay-server` directory (included in this repo) to a free cloud host like **Render** or **Railway**.
2. The server runs automatically using `npm install` and `npm start`.
3. Once deployed, copy your WebSocket URL (e.g., `wss://streambible-relay.onrender.com`) and paste it as your `VITE_RELAY_SERVER_URL`.

### 4. Running the Application

**Run as a Web App (PWA Development):**
```bash
npm run dev
```

**Run as a Native Desktop App (Electron):**
```bash
npm run desktop:dev
```

### 5. Building for Production

**Compile Windows/Mac Desktop Installer (.exe / .dmg):**
```bash
npm run desktop:build
```

**Sync to Android Studio for Mobile APK (Capacitor):**
```bash
npm run android:build
npx cap open android
```

---

## Architecture & Third-Party Integrations

StreamBible leverages a modern, distributed architecture designed to minimize cloud costs while maximizing local performance. Below is a detailed breakdown of the tools we use and why.

### 1. WebRTC & PeerJS (Network Layer)
- **Why it's used:** Traditional web apps use cloud WebSockets (like Socket.io or Supabase Realtime) to sync data between screens. In a church environment, this means a button click travels from the laptop, out to a server in Virginia, and back to the media PC. If the church internet is slow, the livestream text is delayed. WebRTC allows devices to connect peer-to-peer over the local LAN/WLAN.
- **How it's currently used:** We use `PeerJS` to abstract the complex WebRTC connection process. The Controller acts as the "Host" node, and the OBS Browser Sources act as "Client" nodes. Data is sent instantly over the local router.
- **How you can use it:** If you want to build a feature that lets multiple operators collaborate on a setlist, you can easily broadcast that JSON data over the existing WebRTC data channels without needing a central cloud server.

### 2. API.Bible & NLT.to (Content Layer)
- **Why they are used:** Storing hundreds of Bible translations locally would require gigabytes of data and violate copyright laws. We rely on official APIs to fetch modern, copyrighted translations (like NIV, ESV, NLT) legally and on-demand.
- **How they are currently used:** When a user types a reference (e.g., "John 3:16"), the app parses it and pings the APIs. To respect API quotas and rate limits, StreamBible implements aggressive tiered caching. The app stores **full chapters** locally in IndexedDB when a single verse is queried, ensuring adjacent verses load with zero network requests. Local caches automatically expire after a 30-day TTL.
- **How you can use it:** You can extend the `bibleService.ts` to query metadata, fetch entire chapters for a reading view, or add support for audio Bibles using the API.Bible audio endpoints.

### 3. Custom WebSocket Relay (`streambible-relay-server`)
- **Why it's used (The mDNS -105 Problem):** WebRTC is incredible when it works, but many enterprise church Wi-Fi networks block mDNS (Multicast DNS) traffic. When mDNS is blocked, WebRTC completely fails to discover local peers, resulting in an `mDNS -105` error. When this happens, we need a "Cloud Fallback". Commercial services like Supabase Realtime strictly cap concurrent connections on their free tier. We built a custom Node.js WebSocket relay to effortlessly handle 10,000+ simultaneous connections for $0 on free cloud hosts.
- **How it's currently used (The "Race Condition"):** 
  1. **Device Discovery:** The relay server tracks active sessions in-memory. Controllers poll the relay via HTTP to discover other connected screens on the same Wi-Fi network.
  2. **The "Race Condition" Sync:** The Relay Server is *not* a passive fallback. When the operator pushes a verse, the Controller blasts the payload across **both** WebRTC (P2P) **and** the Custom WebSocket Relay simultaneously. Whichever signal reaches the overlay screen first wins the race and displays the verse. This guarantees absolute zero-latency on good networks, and instant failover on networks with `mDNS -105` blocks.

### 4. Supabase (Database & Edge Functions)
- **Why it's used:** We need a serverless backend to proxy requests to API.Bible (to hide our API keys) and a Postgres database for our native, public-domain translations (like the KJV or Yoruba Bibeli Mimo).
- **How it's currently used:** 
  1. **Edge Functions:** When fetching modern translations, requests go to our Supabase Edge Function to securely attach the API key.
  2. **Native Database:** If API.Bible goes down, the app falls back to our Supabase Postgres instance.
  3. **Row Level Security (RLS):** We enforce strict RLS policies so public users can only *Read* verses, completely protecting the database from malicious inserts.

### 5. Dexie / IndexedDB (Persistence Layer)
- **Why it's used:** `localStorage` is synchronous and limited to 5MB, making it terrible for storing thousands of Bible verses. IndexedDB is asynchronous and can store gigabytes of data.
- **How it's currently used:** `Dexie` acts as a wrapper around IndexedDB. Every time a verse is fetched from an external API, it is permanently saved here. If the church internet completely drops, StreamBible queries Dexie. Because the app is a PWA (Progressive Web App) cached by Service Workers, it can boot and run 100% offline.

---

## Third-Party API Agreements & Liability

StreamBible relies on external services to fetch copyrighted Bible translations. We align strictly with the terms and agreements provided by these services (you can find copies of these in the `licenses` directory). 

If you choose to use, fork, or distribute StreamBible, **you must also comply strictly with their Terms of Service**. If you pursue a custom contract or alternative agreement with API.Bible or Tyndale (NLT), that is solely between you and the provider. 

The authors of StreamBible are **not liable or responsible** for any misuse, quota violations, or copyright infringement resulting from your usage of these third-party APIs.

---

## License

MIT License

Copyright (c) 2026 StreamBible Authors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
