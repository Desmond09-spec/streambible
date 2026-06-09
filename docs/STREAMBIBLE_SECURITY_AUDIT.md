# StreamBible: Security Audit & Architectural Overview

This document provides a comprehensive security overview of the StreamBible platform, detailing how it safely handles network traversal, protects API keys, prevents injection attacks, and enforces database isolation.

---

## 1. Network Traversal & Zero-Latency Sync Security
StreamBible's real-time engine uses a "Double-Barreled" connection strategy that must navigate complex corporate/church firewalls securely.

### WebRTC (PeerJS) Data Channels
- **Encryption:** WebRTC mandates End-to-End Encryption (E2EE) using DTLS and SRTP. Even though traffic flows peer-to-peer over a local network, all packets are encrypted.
- **Firewall Integration (Desktop):** The Desktop application uses an NSIS installation macro (`installer.nsh`) to automatically authorize `StreamBible.exe` for inbound/outbound UDP traffic on the Windows Defender firewall. This prevents the OS from blocking the WebRTC listener, while keeping the rule strictly isolated to the application sandbox.
- **Access Control:** The Host validates the `metadata.deviceId` on every incoming WebRTC request. If an overlay connects without the `isOverlay: true` flag and Remote Access is disabled in the Controller, the connection is instantly severed with an `ACCESS_DENIED` packet.

### Node.js WebSocket Relay
- **Fall-back Security:** When WebRTC fails (due to symmetric NATs), data routes through the WebSocket relay.
- **WSS Encryption:** The relay operates entirely over `wss://` (TLS 1.3), meaning corporate firewalls cannot intercept the broadcast traffic.
- **Stateless Relay:** The WebSocket server holds no persistent data. It acts as a blind relay, routing JSON payloads from publisher to subscriber based solely on transient Room IDs. 

---

## 2. External API Defense & Key Obfuscation
StreamBible queries paid, proprietary APIs (API.Bible and NLT.to) to fetch Tier 2 modern translations. 

- **Edge Function Gateway:** Client applications (Web, Mobile, Desktop) **never** contain the `BIBLE_API_KEY` or `NLT_API_KEY`. 
- **The Proxy:** All requests are routed to a Deno Edge Function on Supabase (`fetch-verse`). The Edge Function holds the secret environmental variables, attaches the authorization headers, executes the query to API.Bible, and strips the headers before returning the data to the client.
- **Cache TTL Arbitration:** The Edge Function saves the returned data to a `bible_cache` table. This prevents malicious actors from spamming the client to artificially inflate API.Bible billing costs (DDoS protection), as identical queries are served directly from the Postgres cache without triggering external API calls.

---

## 3. Database Security (Supabase PostgREST)
StreamBible hosts native, public-domain translations (Tier 1) in a Supabase Postgres database.

- **Row Level Security (RLS):** RLS policies are strictly enforced on the `verses` and `chapters` tables. 
- **Read-Only Enforced:** The public `anon` key can only execute `SELECT` operations. `INSERT`, `UPDATE`, and `DELETE` operations are strictly blocked. 
- **Authentication Isolation:** Guest users who have not explicitly signed in operate under standard anonymous RLS policies, meaning the database is structurally immune to data tampering via the client-side API.

---

## 4. Cross-Site Scripting (XSS) Prevention
When fetching data from API.Bible, the response contains raw HTML string representations of verses, which must be rendered in the DOM.

- **Edge Function Sanitization:** The Deno Edge Function strips dangerous HTML tags (e.g., `<script>`, `<iframe>`) using aggressive string sanitization *before* it reaches the client.
- **FUMS Sandbox:** API.Bible requires a tracking pixel (`FUMS`) to be executed for billing compliance. Instead of blindly executing external scripts, `FumsExecutor.tsx` sandboxes the required pixel payload and explicitly bounds its execution to the exact moment a verse is rendered on screen, preventing arbitrary code injection.

---

## 5. Privacy & Data Residency
StreamBible is designed as a "No-Login" priority platform. 

- **Local Storage:** Setlists and cached chapters are saved to the user's local `IndexedDB` instance using `Dexie.js`. This data never leaves the device and is never uploaded to the cloud.
- **WAN IP Discovery:** The LAN discovery feature hashes the user's public IP address (`api.ipify.org`) as a transient session locator. The IP is stored entirely in memory on the Relay Server and is forcefully evicted after 30 seconds of inactivity, leaving no persistent tracking logs of church networks. 

---

## Conclusion
StreamBible mitigates common attack vectors by keeping core secrets firmly behind Deno Edge Functions, enforcing strict Postgres RLS, maintaining End-to-End encryption across its WebRTC layer, and utilizing non-persistent relay memory logic. The application is secure for deployment in both open guest networks and locked-down corporate IT environments.
