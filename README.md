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
- **"Doomsday" Offline Resilience:** StreamBible operates as an offline-first Progressive Web App (PWA) with native Electron and Capacitor wrappers. Operators can pre-cache their Sunday setlists in advance. If the internet fails entirely, the application fetches verses from the local database and syncs to the screen via the local router.

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

VITE_API_BIBLE_KEY=your_api_bible_key
VITE_NLT_API_KEY=your_nlt_key
```

#### Setting up API.Bible
1. Go to [scripture.api.bible](https://scripture.api.bible/) and create a free developer account.
2. Create a new "App" in their dashboard.
3. Copy the generated API Key and paste it as your `VITE_API_BIBLE_KEY`.
4. *Note: API.Bible provides access to hundreds of translations, but requires attribution and has rate limits (which StreamBible handles automatically).*

#### Setting up NLT.to (Tyndale)
1. Go to [nlt.to/api](https://nlt.to/api) and request a free API key for non-commercial use.
2. Once approved, copy the key and paste it as your `VITE_NLT_API_KEY`.
3. *Note: The NLT API uses a different schema than API.Bible. StreamBible includes a dedicated `nltService.ts` to normalize this data.*

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
- **How they are currently used:** When a user types a reference (e.g., "John 3:16"), the app parses it and pings the APIs. To respect API quotas and rate limits, StreamBible implements aggressive caching. When a user creates a "Setlist" for Sunday, the app throttles requests (250ms delay) to safely pre-cache all verses into the local IndexedDB.
- **How you can use it:** You can extend the `bibleService.ts` to query metadata, fetch entire chapters for a reading view, or add support for audio Bibles using the API.Bible audio endpoints.

### 3. Supabase (Discovery & Fallback Layer)
- **Why it's used:** WebRTC requires a "signaling server" so two peers can exchange IP addresses and connect. Instead of hosting a dedicated Node.js signaling server, we use Supabase. Furthermore, we need a fallback for native, public-domain translations (like the KJV or Yoruba Bibeli Mimo) that we own.
- **How it's currently used:** 
  1. **Device Discovery:** A simple database polling mechanism helps devices in the same "Room" find each other. Once connected via WebRTC, they stop polling Supabase to save bandwidth.
  2. **Native Database:** A Postgres table holds public-domain texts. If API.Bible goes down, the app falls back to our Supabase Postgres instance.
  3. **Row Level Security (RLS):** Because the app is bundled as an Electron `.exe`, the Supabase Anon Key is technically public. We enforce strict RLS policies so public users can only *Read* verses, completely protecting the database from malicious inserts.
- **How you can use it:** You can easily add Supabase Authentication to allow users to save their Setlists to the cloud and sync them across different laptops.

### 4. Dexie / IndexedDB (Persistence Layer)
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
