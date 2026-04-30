# StreamBible Dual — App Audit
*Generated 2026-04-29*

---

## Overall Rating: **Solid foundation, a few important rough edges**

The app is architecturally clean, visually premium, and mostly functional. The core use case (KJV + Yoruba live overlay for a church service) works reliably today. The gaps are well-understood and mostly trace back to external API provisioning being pending.

---

## ✅ What's Working Well

### Core Functionality
- **Verse search → Push Live → OBS overlay** — end-to-end works reliably for KJV and YCB
- **3-tier data waterfall** — Local DB (Tier 1) is always-on; Bible Brain and YouVersion are wired as fallback tiers once approved
- **Real-time sync** — Supabase Presence + Broadcast correctly propagates verses to all connected overlays
- **Remote Access gating** — join request flow, accept/decline, and the new auto-enable fix all work correctly
- **Session discovery** — `useDiscovery` + `useHeartbeat` + gatekeep setting all wired correctly

### UI / Design
- Controller is visually premium — Apple-adjacent dark/light system with consistent design tokens
- Settings page — clean iOS/macOS aesthetic, properly host-gated
- Help page — dark mode fixed, mobile mockups now landscape and full-width
- CustomDropdown — portal-rendering + outside-click fix working correctly
- Mobile menu — contextual (Settings for host, Help for non-host)

---

## 🔴 Critical Issues (Fix Before Production)

### 1. Wrong default translation for new users
```
primaryVersion default = '114' (NKJV)
```
NKJV cannot be served — it's YouVersion-exclusive and the API is pending. **Every new user gets a fallback toast and KJV text on first search.** This is a terrible first impression.

**Fix:** Change default to `'1'` (KJV) which always works.

### 2. Bible Brain API key is hardcoded in source
```ts
const BIBLE_BRAIN_KEY = 'fbc63a43-6c84-4861-b8d4-53106199480a';
// bibleService.ts line 251
```
API keys must not be in source code. Should be in `.env.local` as `VITE_BIBLE_BRAIN_KEY`.

---

## 🟡 UX Gaps (Noticeable, Should Fix Soon)

### 3. Fallback toast messaging is alarmist
When a user selects NIV (which silently falls back to KJV), the toast says **"API Outage"** and **"Primary sources unreachable."** This is technically accurate from the system's perspective but alarming for a church operator who doesn't know what an API is. Better message: *"NKJV isn't available — showing KJV instead."*

### 4. Curated versions list shows 5 translations that can't be served
NIV, NKJV, NLT, AMP, MSG all currently silently fall back to KJV. Either:
- Add a visual indicator (lock icon / "Pending" badge) to these items in the dropdown, or
- Remove them temporarily and add them back once YouVersion is approved

### 5. "Restart Tour" is now unreachable
The onboarding walkthrough auto-plays once for new users, but there's no way to replay it anymore — "Restart Tour" was removed from both the host menu (replaced by Settings) and non-host menu (replaced by Help). Consider adding a "Restart Walkthrough" option to the Help page or the Settings page.

### 6. Settings page "Reset Session" is incomplete
Clicking "Reset Session" generates a new room ID and navigates the host there, but it **does not broadcast a disconnect/clear to the old room first.** Any overlays or remote devices connected to the old room will be left with a stale session — they'll show "Host Disconnected" and have no way to recover gracefully.

---

## 🟠 Technical Debt

### 7. `rewrite-controller.js` — dead file in the repo
A scratch/planning file sitting at the project root, open in your editor. Should be deleted or moved to a scratchpad directory. It's confusing and could mislead future contributors.

### 8. Help page FAQ content is outdated
> *"StreamBible is powered by the YouVersion Platform, giving you instant access to over 3,000+ translations…"*

This is currently not true — YouVersion is Tier 3 and pending. The FAQ should reflect the current state or be written more timelessly.

### 9. Settings are `useState`-initialized from localStorage
Settings like `debounceEnabled` and `pushConfirmEnabled` are read once on `ControllerPage` mount. This means if a user changes a setting and navigates back, **the controller re-mounts** (different route) and picks up the new value — which is actually fine. But it's an implicit coupling that could break if the routing ever changes to keep ControllerPage mounted across navigations. Consider a shared settings context or Zustand store as the app grows.

### 10. Old localStorage cache keys will persist in users' browsers
The cache key prefix was changed from `yv_` → `sb_` to invalidate stale YouVersion-primary cached failures. But the old `yv_*` keys remain in localStorage indefinitely. Minor, but adds clutter.

---

## 🟢 Architecture Assessment

| Area | Status |
|---|---|
| Bible data triage | ✅ Well-structured, correct tier ordering |
| Supabase Realtime | ✅ Presence + Broadcast working correctly |
| Route structure | ✅ Clean — `/controller`, `/overlay`, `/fullscreen`, `/help`, `/settings` |
| Design token system | ✅ Centralised in `ControllerLegacy.css`, all pages use it |
| Host auth | ⚠️ Trust-based (localStorage) — sufficient for LAN church use, not suitable for public deployment |
| API key security | 🔴 Bible Brain key hardcoded in source |
| TypeScript coverage | ✅ Good — service layer is typed, hooks are typed |

---

## Recommended Priority Order

1. **Change default `primaryVersion` to `'1'`** — 1 line, prevents every new user from hitting a broken first experience
2. **Move Bible Brain key to `.env.local`** — security, should be done before any public repo push
3. **Improve fallback toast messages** — copy change, makes the app feel less broken for non-technical church operators
4. **Fix "Reset Session" to broadcast clear before navigating** — otherwise it leaves dangling sessions
5. **Add translation availability indicators to dropdown** — sets correct expectations for operators
6. **Delete `rewrite-controller.js`** — housekeeping
