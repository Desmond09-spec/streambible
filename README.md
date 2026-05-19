# StreamBible

StreamBible is a high-performance, offline-resilient web application designed to instantly display multilingual Bible verses on church livestreams and in-house screens. It provides a premium, zero-latency Controller dashboard that pushes lower-third overlays and full-screen graphics directly to broadcasting software like OBS Studio.

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
- **"Doomsday" Offline Resilience:** StreamBible operates as an offline-first Progressive Web App (PWA). Operators can pre-cache their Sunday setlists in advance. If the internet fails entirely during the service, the application continues to load perfectly, fetches verses from the browser's local database, and syncs to the screen via the local router.

## Technical Infrastructure

StreamBible leverages a modern, distributed architecture designed to minimize cloud costs while maximizing local performance.

### 1. Core Stack
- **Framework:** React 19 + TypeScript + Vite.
- **Styling & Animation:** Vanilla CSS for maximum control, paired with Framer Motion for buttery-smooth broadcast graphics and UI transitions.

### 2. Network & Sync Layer (WebRTC)
- **Engine:** `PeerJS` (WebRTC).
- **Architecture:** The Controller acts as a local "Host" node. The OBS Overlays act as "Client" nodes. Data is sent peer-to-peer over the local network via WebRTC Data Channels, brokered entirely by public STUN servers. This completely eliminates cloud WebSocket costs and delivers sub-10ms local network latency.

### 3. Caching & Offline Layer (PWA)
- **Local Database:** `Dexie` (IndexedDB wrapper) handles persistent, asynchronous storage of fetched verses and user-generated Setlists.
- **Service Workers:** `vite-plugin-pwa` caches the application shell (HTML/CSS/JS), allowing the interface to boot even with no internet connection.

### 4. Discovery & Fallback Backend (Supabase)
While the app operates offline, it utilizes a lightweight Supabase backend for specific edge cases:
- **Device Discovery:** A simple database polling mechanism helps devices on the same network discover each other for the initial WebRTC handshake without requiring a dedicated signaling server.
- **Native Fallback Database:** A Postgres table holds native, public-domain Bible texts (like KJV and Bibeli Mimo) to guarantee availability even if external Bible APIs go down.
- **Edge Functions:** Securely proxies requests to strict third-party APIs (like API.Bible) before permanently caching the results locally.

---

*StreamBible is designed to ensure the message is never interrupted by technical failure.*
