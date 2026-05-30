import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { useSettings } from "../context/SettingsContext";
import { useSession } from "../context/SessionContext";
import { ConfirmModal } from "../components/ConfirmModal";
import "./SettingsPage.css";

// ─── localStorage Keys ────────────────────────────────────────────────────────
// eslint-disable-next-line react-refresh/only-export-components
export const SETTINGS_KEYS = {
  debounce: "streambible-debounce-enabled",
  gatekeep: "streambible-gatekeep-discovery",
  pushConfirm: "streambible-push-confirm",
  autoClear: "streambible-auto-clear-seconds",
  theme: "streambible-theme",
  verseNumbers: "streambible-verse-numbers",
  setlistStyle: "streambible-setlist-style",
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const IOSToggle: React.FC<{
  checked: boolean;
  onChange: (v: boolean) => void;
  id: string;
}> = ({ checked, onChange, id }) => (
  <label htmlFor={id} className="ios-toggle" aria-label="Toggle">
    <input
      id={id}
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
    />
    <span className="ios-toggle-track">
      <span className="ios-toggle-thumb" />
    </span>
  </label>
);

const ChevronRight: React.FC = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    width="14"
    height="14"
    style={{ flexShrink: 0, opacity: 0.35 }}
  >
    <path d="M9 18l6-6-6-6" />
  </svg>
);

interface SettingToggleRowProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  id: string;
  last?: boolean;
}

const SettingToggleRow: React.FC<SettingToggleRowProps> = ({
  label,
  description,
  checked,
  onChange,
  id,
  last,
}) => (
  <div className={`settings-row${last ? " settings-row--last" : ""}`}>
    <div className="settings-row-content">
      <span className="settings-row-label">{label}</span>
      {description && <span className="settings-row-desc">{description}</span>}
    </div>
    <IOSToggle checked={checked} onChange={onChange} id={id} />
  </div>
);

// ── Lightweight Settings Dropdown ────────────────────────────────────────────
interface SettingsDropdownOption {
  value: number;
  label: string;
}

const SettingsDropdown: React.FC<{
  value: number;
  options: SettingsDropdownOption[];
  onChange: (v: number) => void;
  id?: string;
}> = ({ value, options, onChange, id }) => {
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const selectedLabel =
    options.find((o) => o.value === value)?.label ?? String(value);

  // Position the menu relative to the trigger
  useEffect(() => {
    if (!open || !triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const menuH = options.length * 44;
    const above = spaceBelow < menuH + 16;
    setMenuStyle({
      position: "fixed",
      right: window.innerWidth - rect.right,
      ...(above
        ? { bottom: window.innerHeight - rect.top + 4 }
        : { top: rect.bottom + 4 }),
      minWidth: Math.max(rect.width, 160),
      zIndex: 9000,
    });
  }, [open, options.length]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        triggerRef.current?.contains(e.target as Node) ||
        menuRef.current?.contains(e.target as Node)
      )
        return;
      setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div className="sd-wrap">
      <button
        id={id}
        ref={triggerRef}
        className="sd-trigger"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="sd-trigger-label">{selectedLabel}</span>
        <svg
          className={`sd-chevron${open ? " sd-chevron--open" : ""}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          width="12"
          height="12"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            ref={menuRef}
            className="sd-menu"
            style={menuStyle}
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ type: "spring", damping: 24, stiffness: 380 }}
            role="listbox"
          >
            {options.map((opt) => (
              <button
                key={opt.value}
                role="option"
                aria-selected={opt.value === value}
                className={`sd-option${opt.value === value ? " sd-option--selected" : ""}`}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
              >
                {opt.label}
                {opt.value === value && (
                  <svg
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    width="12"
                    height="12"
                  >
                    <polyline points="2.5 8.5 6 12 13.5 4" />
                  </svg>
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface SettingSelectRowProps {
  label: string;
  description?: string;
  value: number;
  options: SettingsDropdownOption[];
  onChange: (v: number) => void;
  last?: boolean;
}

const SettingSelectRow: React.FC<SettingSelectRowProps> = ({
  label,
  description,
  value,
  options,
  onChange,
  last,
}) => (
  <div className={`settings-row${last ? " settings-row--last" : ""}`}>
    <div className="settings-row-content">
      <span className="settings-row-label">{label}</span>
      {description && <span className="settings-row-desc">{description}</span>}
    </div>
    <SettingsDropdown value={value} options={options} onChange={onChange} />
  </div>
);

interface SettingLinkRowProps {
  label: string;
  description?: string;
  onClick: () => void;
  last?: boolean;
  danger?: boolean;
}

const SettingLinkRow: React.FC<SettingLinkRowProps> = ({
  label,
  description,
  onClick,
  last,
  danger,
}) => (
  <button
    className={`settings-row settings-row--btn${last ? " settings-row--last" : ""}${danger ? " settings-row--danger" : ""}`}
    onClick={onClick}
  >
    <div className="settings-row-content">
      <span className="settings-row-label">{label}</span>
      {description && <span className="settings-row-desc">{description}</span>}
    </div>
    <ChevronRight />
  </button>
);

interface SettingsSectionProps {
  title: string;
  badge?: string;
  footer?: string;
  children: React.ReactNode;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({
  title,
  badge,
  footer,
  children,
}) => (
  <div className="settings-section">
    <div className="settings-section-header">
      {title}
      {badge && <span className="settings-section-badge">{badge}</span>}
    </div>
    <div className="settings-section-card">{children}</div>
    {footer && <div className="settings-section-footer">{footer}</div>}
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { roomId, isHost, regenerateRoom, pendingReset, confirmRegenerate, cancelRegenerate, user, claimedRoomId } = useSession();
  const [claimInput, setClaimInput] = useState("");
  const [claimStatus, setClaimStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [claimMessage, setClaimMessage] = useState("");

  const [theme] = useState<"light" | "dark">(
    () =>
      (localStorage.getItem(SETTINGS_KEYS.theme) || "light") as
      | "light"
      | "dark",
  );

  // ── Settings state (saves on every change) ────────────────────────────────
  const {
    debounceEnabled,
    setDebounceEnabled,
    gatekeepDiscovery,
    setGatekeepDiscovery,
    pushConfirmEnabled,
    setPushConfirmEnabled,
    autoClearSeconds,
    setAutoClearSeconds,
    showVerseNumbers,
    setShowVerseNumbers,
    setlistStyle,
    setSetlistStyle,
  } = useSettings();
  const [savedIndicator, setSavedIndicator] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const save = () => {
    setSavedIndicator(true);
    setTimeout(() => setSavedIndicator(false), 1800);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const setDebounce = (v: boolean) => {
    setDebounceEnabled(v);
    save();
  };
  const setGatekeep = (v: boolean) => {
    setGatekeepDiscovery(v);
    save();
  };
  const setPushConfirm = (v: boolean) => {
    setPushConfirmEnabled(v);
    save();
  };
  const setAutoClear = (v: number) => {
    setAutoClearSeconds(v);
    save();
  };
  const setVerseNumbers = (v: boolean) => {
    setShowVerseNumbers(v);
    save();
  };
  const updateSetlistStyle = (v: number) => {
    setSetlistStyle(v === 1 ? 'modal' : 'drawer');
    save();
  };

  const goBack = () =>
    navigate(roomId ? `/controller?room=${roomId}` : "/controller");

  const handleClaim = async () => {
    if (!user) return;
    const roomCode = claimInput.toUpperCase().trim();
    if (roomCode.length < 3 || roomCode.length > 8) {
      setClaimStatus("error");
      setClaimMessage("Room ID must be between 3 and 8 characters.");
      return;
    }
    if (!/^[A-Z0-9]+$/.test(roomCode)) {
      setClaimStatus("error");
      setClaimMessage("Room ID can only contain letters and numbers.");
      return;
    }

    setClaimStatus("loading");

    try {
      // Securely check availability via RPC (OWASP A01 Prevention)
      const { data: isAvailable, error: rpcError } = await supabase.rpc(
        "check_room_available",
        { room_code: roomCode },
      );
      if (rpcError) throw rpcError;

      if (!isAvailable && roomCode !== claimedRoomId) {
        setClaimStatus("error");
        setClaimMessage("This Room ID is already taken.");
        return;
      }

      // Update the profile
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ claimed_room_id: roomCode })
        .eq("id", user.id);

      if (updateError) throw updateError;

      setClaimStatus("success");
      setClaimMessage(
        "Room successfully claimed! Changes will apply on your next session restart.",
      );
      setTimeout(() => setClaimStatus("idle"), 5000);
    } catch (err: unknown) {
      setClaimStatus("error");
      setClaimMessage(
        err instanceof Error ? err.message : "Failed to claim room.",
      );
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  // ── Access denied ─────────────────────────────────────────────────────────
  if (!isHost) {
    return (
      <div className={`settings-root theme-${theme}`}>
        <motion.div
          className="settings-denied"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", damping: 22, stiffness: 280 }}
        >
          <div className="settings-denied-icon">🔒</div>
          <h2 className="settings-denied-title">Host Access Only</h2>
          <p className="settings-denied-body">
            Settings can only be changed by the session host. Contact your media
            team operator if you need assistance.
          </p>
          <button className="settings-back-btn" onClick={goBack}>
            Back to Controller
          </button>
        </motion.div>
      </div>
    );
  }

  // ── Full settings ─────────────────────────────────────────────────────────
  return (
    <div className={`settings-root theme-${theme}`}>
      {/* ── Sticky Header ─────────────────────────────────────────────── */}
      <header className="settings-header">
        <button className="settings-nav-back" onClick={goBack}>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            width="18"
            height="18"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
          <span>Controller</span>
        </button>

        <div className="settings-header-center">
          <span className="settings-header-title">Settings</span>
        </div>

        <AnimatePresence>
          {(savedIndicator || toastMessage) && (
            <motion.div
              className="settings-saved-badge"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
            >
              {savedIndicator ? (
                <>
                  <svg
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    width="12"
                    height="12"
                  >
                    <polyline points="2.5 8.5 6 12 13.5 4" />
                  </svg>
                  Saved
                </>
              ) : (
                toastMessage
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ── Page title (below header) ──────────────────────────────────── */}
      <div className="settings-page-title-wrap">
        <h1 className="settings-page-title">Settings</h1>
        {roomId && <span className="settings-room-badge">Room {roomId}</span>}
      </div>

      {/* ── Content ───────────────────────────────────────────────────── */}
      <motion.div
        className="settings-body"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Search Behaviour */}
        <SettingsSection
          title="Search Behaviour"
          footer="When disabled, verses only fetch when you press Enter or change the translation."
        >
          <SettingToggleRow
            id="toggle-debounce"
            label="Auto-search while typing"
            description="Fetch results automatically after a short pause as you type."
            checked={debounceEnabled}
            onChange={setDebounce}
            last
          />
        </SettingsSection>

        {/* Network & Discovery */}
        <SettingsSection
          title="Network & Discovery"
          footer="When gatekeeping is on, other devices will only see your room in discovery results while you also have 'Discover Nearby Sessions' enabled."
        >
          <SettingToggleRow
            id="toggle-gatekeep"
            label="Gatekeep room visibility"
            description="Only advertise this session when discovery is actively on."
            checked={gatekeepDiscovery}
            onChange={setGatekeep}
            last
          />
        </SettingsSection>

        {/* Broadcast & Display */}
        <SettingsSection
          title="Broadcast & Display"
          footer="Auto-clear removes verse text from all overlays and displays after the chosen duration."
        >
          <SettingToggleRow
            id="toggle-push-confirm"
            label="Confirm before pushing live"
            description="Require a confirmation tap before broadcasting to prevent accidental pushes."
            checked={pushConfirmEnabled}
            onChange={setPushConfirm}
          />
          <SettingToggleRow
            id="toggle-verse-numbers"
            label="Show verse numbers"
            description="Display verse numbers when showing multiple verses on screens."
            checked={showVerseNumbers}
            onChange={setVerseNumbers}
          />
          <SettingSelectRow
            label="Auto-clear overlay"
            description="Automatically clear the display after pushing a verse."
            value={autoClearSeconds}
            options={[
              { value: 0, label: "Off" },
              { value: 5, label: "5 seconds" },
              { value: 10, label: "10 seconds" },
              { value: 20, label: "20 seconds" },
              { value: 30, label: "30 seconds" },
              { value: 60, label: "1 minute" },
            ]}
            onChange={setAutoClear}
            last
          />
        </SettingsSection>

        {/* Appearance */}
        <SettingsSection
          title="Appearance"
          footer="Choose how the Setlist Manager appears when you click the List button."
        >
          <SettingSelectRow
            label="Setlist UI Style"
            description="Display setlists as a centered pop-up or a bottom drawer."
            value={setlistStyle === 'modal' ? 1 : 2}
            options={[
              { value: 1, label: "Floating Modal" },
              { value: 2, label: "Bottom Drawer" },
            ]}
            onChange={updateSetlistStyle}
            last
          />
        </SettingsSection>

        {/* Account & Persistent Room */}
        <SettingsSection
          title="Account & Branding"
          badge="Coming Soon"
          footer="Soon you will be able to create an account to claim a permanent Room ID and unlock custom branding (your church's logo, colors, and more) for your overlays."
        >
          {!user ? (
            <SettingLinkRow
              label="Sign in or Create Account"
              description="Accounts and branding are coming soon!"
              onClick={() => showToast("Accounts are coming soon!")}
              last
            />
          ) : (
            <div
              className="settings-row settings-row--last"
              style={{
                flexDirection: "column",
                alignItems: "flex-start",
                padding: "16px",
              }}
            >
              <div style={{ width: "100%", marginBottom: "16px" }}>
                <span className="settings-row-label">Claimed Room ID</span>
                <span className="settings-row-desc">
                  Currently signed in as {user.email}
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  width: "100%",
                  marginBottom: "12px",
                }}
              >
                <motion.input
                  animate={
                    claimStatus === "error"
                      ? { x: [-5, 5, -5, 5, 0], transition: { duration: 0.4 } }
                      : claimStatus === "success"
                        ? {
                          boxShadow: "0 0 15px rgba(52,199,89,0.4)",
                          borderColor: "var(--color-accent-success)",
                        }
                        : {}
                  }
                  type="text"
                  placeholder={claimedRoomId || "e.g. GRACE"}
                  value={claimInput}
                  onChange={(e) => setClaimInput(e.target.value.toUpperCase())}
                  maxLength={8}
                  style={{
                    flex: 1,
                    padding: "10px 14px",
                    borderRadius: "8px",
                    border: `1px solid ${claimStatus === "error" ? "var(--color-accent-danger)" : "var(--color-border)"}`,
                    background: "var(--color-bg-secondary)",
                    color: "var(--color-text-primary)",
                    outline: "none",
                    textTransform: "uppercase",
                    fontWeight: "bold",
                    letterSpacing: "2px",
                  }}
                />
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleClaim}
                  disabled={claimStatus === "loading" || !claimInput.trim()}
                  style={{
                    padding: "10px 20px",
                    borderRadius: "8px",
                    background:
                      claimStatus === "success"
                        ? "var(--color-accent-success)"
                        : "var(--color-accent-primary)",
                    color: "white",
                    fontWeight: "600",
                    border: "none",
                    cursor:
                      claimStatus === "loading" || !claimInput.trim()
                        ? "not-allowed"
                        : "pointer",
                    opacity:
                      claimStatus === "loading" || !claimInput.trim() ? 0.6 : 1,
                  }}
                >
                  {claimStatus === "loading"
                    ? "Checking..."
                    : claimStatus === "success"
                      ? "Claimed!"
                      : "Claim"}
                </motion.button>
              </div>

              {claimMessage && (
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: "500",
                    color:
                      claimStatus === "error"
                        ? "var(--color-accent-danger)"
                        : "var(--color-accent-success)",
                    marginBottom: "16px",
                  }}
                >
                  {claimMessage}
                </div>
              )}

              {claimedRoomId && (
                <div
                  style={{
                    marginTop: "16px",
                    width: "100%",
                    padding: "16px",
                    background: "var(--color-bg-primary)",
                    borderRadius: "8px",
                    border: "1px solid var(--color-border)",
                  }}
                >
                  <h4
                    style={{
                      fontSize: "13px",
                      color: "var(--color-text-secondary)",
                      marginBottom: "12px",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Copy URLs for OBS
                  </h4>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "8px",
                      background: "var(--color-bg-secondary)",
                      padding: "8px 12px",
                      borderRadius: "6px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "14px",
                        fontFamily: "monospace",
                        color: "var(--color-text-primary)",
                      }}
                    >
                      /overlay?room={claimedRoomId}
                    </span>
                    <button
                      onClick={(e) => {
                        const baseUrl = (window.location.protocol === 'file:' || window.location.hostname === 'localhost') 
                          ? 'https://streambible.vercel.app' 
                          : window.location.origin;
                        navigator.clipboard.writeText(
                          `${baseUrl}/#/overlay?room=${claimedRoomId}`,
                        );
                        const btn = e.currentTarget;
                        btn.innerText = "Copied!";
                        setTimeout(() => (btn.innerText = "Copy"), 2000);
                      }}
                      style={{
                        background: "none",
                        border: "1px solid var(--color-border)",
                        padding: "4px 10px",
                        borderRadius: "4px",
                        color: "var(--color-text-secondary)",
                        fontSize: "12px",
                        cursor: "pointer",
                      }}
                    >
                      Copy
                    </button>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      background: "var(--color-bg-secondary)",
                      padding: "8px 12px",
                      borderRadius: "6px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "14px",
                        fontFamily: "monospace",
                        color: "var(--color-text-primary)",
                      }}
                    >
                      /fullscreen?room={claimedRoomId}
                    </span>
                    <button
                      onClick={(e) => {
                        navigator.clipboard.writeText(
                          `${window.location.origin}/#/fullscreen?room=${claimedRoomId}`,
                        );
                        const btn = e.currentTarget;
                        btn.innerText = "Copied!";
                        setTimeout(() => (btn.innerText = "Copy"), 2000);
                      }}
                      style={{
                        background: "none",
                        border: "1px solid var(--color-border)",
                        padding: "4px 10px",
                        borderRadius: "4px",
                        color: "var(--color-text-secondary)",
                        fontSize: "12px",
                        cursor: "pointer",
                      }}
                    >
                      Copy
                    </button>
                  </div>
                </div>
              )}

              <button
                onClick={handleLogout}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--color-accent-danger)",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: "pointer",
                  padding: "4px 0",
                  marginTop: "16px",
                }}
              >
                Sign Out
              </button>
            </div>
          )}
        </SettingsSection>

        {/* Native Apps */}
        <SettingsSection title="Native Apps">
          <SettingLinkRow
            label="Download Android App"
            description="Get the native mobile app (.apk) for Android."
            onClick={() =>
              window.open(
                "https://github.com/Desmond09-spec/streambible/releases/download/v1.0.0/StreamBible.apk",
                "_blank",
              )
            }
          />
          <SettingLinkRow
            label="Download Desktop App"
            description="Get the native desktop app (.exe) for Windows/Mac."
            onClick={() =>
              window.open(
                "https://github.com/Desmond09-spec/streambible/releases/download/v1.0.0/StreamBible.Setup.exe",
                "_blank",
              )
            }
            last
          />
        </SettingsSection>

        {/* Session */}
        <SettingsSection title="Session">
          <SettingLinkRow
            label="Help & Documentation"
            description="Guides, FAQs, and getting started with StreamBible."
            onClick={() => navigate("/help")}
          />
          <SettingLinkRow
            label="Restart Walkthrough"
            description="Replay the initial guided tour of the controller interface."
            onClick={() => navigate("/controller?tour=true")}
          />
          <SettingLinkRow
            label="Reset Session"
            description="Disconnect all remote devices and generate a new room ID."
            onClick={regenerateRoom}
            danger
          />
          <SettingLinkRow
            label="Privacy Policy"
            description="Read how we handle your data."
            onClick={() => navigate("/privacy")}
          />
          <SettingLinkRow
            label="Third-party Licenses & Agreements"
            description="View copyright and licensing information for Bible translations."
            onClick={() => navigate("/copyright")}
          />
          <SettingLinkRow
            label="Terms of Service"
            description="Read the terms for using StreamBible."
            onClick={() => navigate("/terms")}
            last
          />
        </SettingsSection>

        <p className="settings-footer-note">
          StreamBible {roomId ? `· Room ${roomId}` : ""} · Host view
        </p>
      </motion.div>

      <ConfirmModal
        isVisible={pendingReset}
        title="Reset Session?"
        message="This will disconnect all linked devices and generate a new Room ID. This cannot be undone."
        confirmLabel="Reset"
        cancelLabel="Cancel"
        destructive
        onConfirm={confirmRegenerate}
        onCancel={cancelRegenerate}
      />
    </div>
  );
};

export default SettingsPage;
