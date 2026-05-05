# StreamBible Dual — App Audit & Project State
*Updated: 2026-05-04*

---

## Overall Rating: ✅ Production-Ready

StreamBible is a complete, polished, church-environment web application. The core sync engine, Bible data layer, and UI design system are all stable. The app is ready for deployment and active use in live-streaming / church presentation environments.

---

## Architecture

```
streambible-dual/
├── src/
│   ├── pages/        → Controller, Overlay, FullScreen, Settings, Help
│   ├── components/   → AutoFitFont, ConfirmModal, CustomDropdown,
│   │                    SwitchingOverlay, WalkthroughOverlay
│   ├── hooks/        → useSync.ts (Publisher, Subscriber, Presence,
│   │                    Heartbeat, Discovery)
│   ├── services/     → bibleService.ts (parse + 2-tier fetch)
│   └── context/      → SessionContext, SettingsContext
└── supabase/
    └── functions/fetch-verse/  → Deno Edge Function (API.Bible + NLT gateway)
```

**Stack:** Vite 8 · React 19 · TypeScript 6 · Supabase · Framer Motion · React Router 7

---

## ✅ What's Complete & Working

### Real-Time Sync Engine
- Supabase Broadcast channels with clean Publisher/Subscriber hook split
- Ghost-connection bug fully resolved via `updatedAt` timestamp arbitration
- Remote access (grant/deny) updates propagate instantly without reconnection
- Room switching is a seamless SPA transition with a premium loading overlay

### Presence & Discovery
- Per-room device tracking (host / overlay / guest roles)
- IP-based LAN session discovery via `active_sessions` table
- 20-second host heartbeat with graceful `beforeunload` cleanup

### Bible Data Layer
| Tier | Source | Translations |
|---|---|---|
| **Tier 1 (Local)** | Supabase `verses` table | KJV, Yoruba (BM), ASV, BSB, WEB |
| **Tier 2 (Edge Function)** | API.Bible | NKJV, NIV, AMP |
| **Tier 2 (Edge Function)** | NLT.to official API | NLT |

- Client-side `localStorage` cache (fast path) backed by a Supabase `bible_cache` table (30-day TTL)
- Stale/broken cache entries are automatically evicted on read
- `fetchWithTimeout` (6s) prevents hanging on slow networks
- Triage error categories (`client_network`, `third_party_outage`, `user_input`, `internal_error`) power user-friendly toast messages

### Design System
- Full iOS/macOS aesthetic: Inter typography, spring-based motion, glassmorphism
- `ConfirmModal` — native browser `alert()` fully replaced with an iOS System Alert replica
- `CustomDropdown` — pixel-accurate custom select for all form controls
- `AutoFitFont` — dynamic font scaling for the overlay/fullscreen display
- 5-route SPA: `/controller`, `/overlay`, `/fullscreen`, `/settings`, `/help`
- Interactive 7-step onboarding walkthrough (react-joyride)
- Full Help page with FAQ and feedback section

### Security & Housekeeping
| Area | Status |
|---|---|
| API Keys | ✅ `.env.local` only — never in source |
| Host Auth | ✅ `localStorage` — correct for LAN church use |
| Build | ✅ Zero TypeScript errors, clean Vite production build |
| Dead code | ✅ No dangling imports or unused components |
| Old `yv_` cache keys | ✅ Auto-purged on app init (`App.tsx` cleanup effect) |

---

## 🟡 Post-Production Roadmap (Deferred by Design)

These items are deliberately deferred and not considered blockers:

| Item | Plan |
|---|---|
| **Unit tests** | To be added post-production (`vitest` already installed) |
| **PWA / Offline mode** | To be added post-production (Local DB fallback already provides partial offline support) |
| **NLT markup changes** | Handled by active maintenance — no automated guard needed |

---

## Conclusion

The application has crossed from prototype to production. All core features — real-time sync, multi-translation Bible fetching, premium UI, LAN discovery, and onboarding — are complete and stable. No critical issues remain. Remaining roadmap items (tests, PWA) are scheduled post-launch improvements, not launch blockers.
