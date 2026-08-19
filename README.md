# StreamBible Desktop

StreamBible Desktop is an open-source, high-performance, **100% offline-first** presentation application built to display multi-lingual Bible verses on church livestreams and venue screens in real-time. 

Built with **Electron, React, TypeScript, and Vite**, StreamBible provides a zero-latency Controller dashboard that feeds lower-third overlays and full-screen graphics directly to broadcast software like **OBS Studio, vMix, and Wirecast**.

---

## Key Highlights

- **100% Offline Core:** Pre-bundled local Bible translations loaded into an in-memory map. Zero cloud dependencies, zero external API keys required.
- **Instant Multi-Lingual Display:** Pushes primary (e.g. KJV) and secondary (e.g. Yoruba) translations side-by-side in milliseconds.
- **Embedded Local Server:** Electron starts an embedded Node HTTP & WebSocket server on `http://localhost:3456` at launch.
- **OBS Studio Ready:** Overlays are served directly at `http://localhost:3456/#/overlay` and `http://localhost:3456/#/fullscreen`. Simply paste them as Browser Sources.
- **Smart Incremental Search:** Type references like `John 3:16`, `Genesis 1:1-3`, or `Romans 8:28,30` for instant live previews.
- **Keyboard Shortcut Friendly:** `Ctrl + P` to Push Live, `Ctrl + L` to Clear Overlay (with on-screen toast feedback).

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    StreamBible Desktop                      │
│                                                             │
│   ┌─────────────────────┐       ┌───────────────────────┐   │
│   │ Controller Dashboard│ ────> │   In-Memory Bible     │   │
│   │   (React / Vite)    │       │ Store (KJV / Yoruba)  │   │
│   └──────────┬──────────┘       └───────────────────────┘   │
│              │                                              │
│              │ WebSocket Push (localhost:3456)               │
│              ▼                                              │
│   ┌─────────────────────────────────────────────────────┐   │
│   │       Embedded Express & WebSocket Server           │   │
│   └──────────┬──────────────────────────────┬───────────┘   │
└──────────────┼──────────────────────────────┼───────────────┘
               │                              │
               ▼                              ▼
     ┌───────────────────┐          ┌───────────────────┐
     │ OBS Browser Source│          │ OBS Browser Source│
     │   (Lower Third)   │          │   (Fullscreen)    │
     └───────────────────┘          └───────────────────┘
```

### How Communication Works
1. **Startup:** When StreamBible launches, Electron starts an embedded HTTP/WS server on port `3456`.
2. **Overlay Connection:** OBS loads `http://localhost:3456/#/overlay`. The overlay establishes an auto-reconnecting WebSocket client to `ws://localhost:3456/ws-relay` and registers as an `overlay`.
3. **Controller Connection:** The Controller dashboard connects to the same local WebSocket server and registers as `controller`.
4. **Synchronization:** When the operator pushes a verse, the server broadcasts the payload to all connected overlays.
5. **Heartbeat & Latency:** The controller sends a periodic ping (`3s`) to measure exact round-trip latency to active overlays.

---

## Installation & Development

### Prerequisites
- **Node.js:** v18.0.0 or higher
- **npm:** v9.0.0 or higher

### 1. Clone & Install
```bash
git clone git@github.com:madebyfoundry/streambible.git
cd streambible
npm install
```

### 2. Development Mode
To launch Vite dev server and Electron simultaneously with Hot Module Replacement (HMR):
```bash
npm run dev
```

### 3. Packaging Desktop Executables
To compile the production frontend and package the native Windows installer (`.exe`):
```bash
npm run desktop:build
```
The packaged executable will be generated inside the `dist/` directory.

---

## Keyboard Shortcuts

| Shortcut | Description |
|---|---|
| **`Enter`** | Push selected verse live (when search input is active) |
| **`Ctrl + P`** | Push live from anywhere in the app |
| **`Ctrl + L`** | Clear overlay from screen (preserves controller preview) |
| **`Esc`** | Reset search input |
| **`↑ / ↓`** | Navigate books, chapters, or verses incrementally |

---

## License

MIT License — Copyright (c) 2026 StreamBible Authors.
