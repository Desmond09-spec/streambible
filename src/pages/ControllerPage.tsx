import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./ControllerLegacy.css";
import WalkthroughOverlay from "../components/WalkthroughOverlay";
import { ConfirmModal } from "../components/ConfirmModal";
import { useSession } from "../context/SessionContext";

import { useControllerState } from "../hooks/useControllerState";
import { ControllerHeader } from "../components/controller/ControllerHeader";
import { DeviceMonitor } from "../components/controller/DeviceMonitor";
import { SearchModule } from "../components/controller/SearchModule";
import { PreviewCards } from "../components/controller/PreviewCards";
import { BroadcastControls } from "../components/controller/BroadcastControls";
import { MobileMenuSheet } from "../components/controller/MobileMenuSheet";
import { SetlistManager } from "../components/controller/SetlistManager";

const ControllerPage: React.FC = () => {
  const {
    theme, toggleTheme, isTransitioning,
    query, setQuery, onFormSubmit,
    showPushConfirm, setShowPushConfirm, pendingPush, setPendingPush,
    primaryVersion, setPrimaryVersion,
    secondaryVersion, setSecondaryVersion,
    showPrimary, setShowPrimary,
    showSecondary, setShowSecondary,
    primaryText, primaryRef, primaryExpanded, setPrimaryExpanded,
    secondaryText, secondaryRef, secondaryExpanded, setSecondaryExpanded,
    status, statusMsg,
    copiedType, copyUrl,
    showFallbackToast, isUsingFallback, fallbackType, primarySource, secondarySource, triageReason, fallbackOriginalVersion,
    isMobileMenuOpen, setIsMobileMenuOpen,
    showTour, finishTour, tourSteps,
    pushLive, clearScreen,
    setlistStyle
  } = useControllerState();

  const { wsConnected, roomId, claimedRoomId, isHost, hostStatus } = useSession();
  const [isSetlistOpen, setIsSetlistOpen] = React.useState(false);

  return (
    <div
      id="controller-legacy-wrapper"
      className={`theme-${theme} legacy-body${isTransitioning ? " theme-transitioning" : ""}`}
      style={{ width: "100%", minHeight: "100vh", flex: 1 }}
    >
      {showTour && (
        <WalkthroughOverlay steps={tourSteps} onComplete={finishTour} />
      )}

      <AnimatePresence>
        {copiedType && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: "-50%", scale: 0.95 }}
            animate={{ opacity: 1, y: 0, x: "-50%", scale: 1 }}
            exit={{ opacity: 0, y: -10, x: "-50%", scale: 0.95 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="copy-toast visible"
            role="status"
            aria-live="polite"
            aria-atomic="true"
            style={{ x: "-50%" }}
          >
            <div className="copy-toast-icon-wrap">
              <svg
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="2.5 8.5 6 12 13.5 4" />
              </svg>
            </div>
            <div className="copy-toast-body">
              <span className="copy-toast-title">Link copied</span>
              <span className="copy-toast-sub">
                {copiedType === "overlay"
                  ? "Bible overlay link"
                  : copiedType === "fullscreen"
                    ? "Fullscreen display link"
                    : "Controller link"}{" "}
                copied to clipboard
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>



      <ControllerHeader 
        wsConnected={wsConnected}
        roomId={roomId}
        claimedRoomId={claimedRoomId}
        isHost={isHost}
        theme={theme}
        toggleTheme={toggleTheme}
        copyUrl={copyUrl}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      <main className="main">
        <DeviceMonitor copyUrl={copyUrl} />

        <SearchModule 
          query={query}
          setQuery={setQuery}
          onFormSubmit={onFormSubmit}
          isSetlistOpen={isSetlistOpen}
          setIsSetlistOpen={setIsSetlistOpen}
        />

        <AnimatePresence>
          {showFallbackToast && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: "auto", marginBottom: 16 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              style={{ overflow: "hidden" }}
            >
              <div
                style={{
                  background:
                    triageReason === "internal_error"
                      ? "rgba(255, 69, 58, 0.15)"
                      : triageReason === "client_network"
                        ? "rgba(255, 214, 10, 0.15)"
                        : triageReason === "user_input"
                          ? "rgba(152, 152, 157, 0.15)"
                          : "rgba(255, 159, 10, 0.15)",
                  border: `1px solid ${triageReason === "internal_error" ? "rgba(255, 69, 58, 0.3)" : triageReason === "client_network" ? "rgba(255, 214, 10, 0.3)" : triageReason === "user_input" ? "rgba(152, 152, 157, 0.3)" : "rgba(255, 159, 10, 0.3)"}`,
                  color: "var(--text-1)",
                  padding: "12px 16px",
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
                role="alert"
              >
                <div
                  style={{
                    color:
                      triageReason === "internal_error"
                        ? "#FF453A"
                        : triageReason === "client_network"
                          ? "#FFD60A"
                          : triageReason === "user_input"
                            ? "#98989D"
                            : "var(--warning)",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: "14px", marginBottom: "2px" }}>
                    {triageReason === "client_network" ? "Network Error" :
                     triageReason === "internal_error" ? "Critical System Error" :
                     triageReason === "user_input" ? "Verse Not Found" :
                     triageReason === "third_party_outage" && fallbackType === "api.bible" ? "Primary Unreachable" :
                     triageReason === "third_party_outage" && fallbackType === "local" ? "Translation Unavailable" : "System Alert"}
                  </div>
                  <div style={{ fontSize: "13px", opacity: 0.85, lineHeight: 1.4 }}>
                    {triageReason === "client_network" ? "You appear to be offline. Defaulting to local database." :
                     triageReason === "internal_error" ? "Local database unavailable. Please refresh." :
                     triageReason === "user_input" ? "Please check the reference and try again." :
                     triageReason === "third_party_outage" && fallbackType === "api.bible" ? "API is unreachable. Reverting to fallback." :
                     triageReason === "third_party_outage" && fallbackType === "local" ? "Selected version isn't available right now. Showing fallback instead." : "An unknown error occurred."}
                    {fallbackOriginalVersion && fallbackOriginalVersion !== "1" && fallbackType === "local" && (
                      <span style={{ display: "block", marginTop: "2px", fontWeight: 500 }}>
                        Translation unavailable offline. Reverted to KJV.
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <PreviewCards 
          showPrimary={showPrimary} setShowPrimary={setShowPrimary}
          primaryVersion={primaryVersion} setPrimaryVersion={setPrimaryVersion}
          isUsingFallback={isUsingFallback} primaryText={primaryText} status={status}
          primaryRef={primaryRef} primaryExpanded={primaryExpanded} setPrimaryExpanded={setPrimaryExpanded}
          showSecondary={showSecondary} setShowSecondary={setShowSecondary}
          secondaryVersion={secondaryVersion} setSecondaryVersion={setSecondaryVersion}
          secondaryText={secondaryText} secondaryRef={secondaryRef}
          secondaryExpanded={secondaryExpanded} setSecondaryExpanded={setSecondaryExpanded}
        />

        <AnimatePresence>
          {isSetlistOpen && (
            <SetlistManager 
              primaryVersion={primaryVersion}
              onSelectVerse={(ref) => {
                setQuery(ref);
                setIsSetlistOpen(false);
              }}
              onClose={() => setIsSetlistOpen(false)}
              style={setlistStyle}
            />
          )}
        </AnimatePresence>
      </main>

      <MobileMenuSheet 
        isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen}
        wsConnected={wsConnected} roomId={roomId} copyUrl={copyUrl}
        theme={theme} toggleTheme={toggleTheme} isHost={isHost}
      />

      <div
        style={{
          textAlign: "center",
          marginTop: "10px",
          marginBottom: "10px",
          display: "flex",
          flexDirection: "column",
          gap: "4px",
          minHeight: "28px",
          alignItems: "center",
        }}
      >
        {(primarySource === "api.bible" || secondarySource === "api.bible") && (
          <span
            style={{
              fontSize: "12px",
              fontWeight: 600,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              opacity: 0.45,
              color: "var(--text-1)",
            }}
          >
            Powered by API.Bible
          </span>
        )}
        {(primarySource === "nlt" || secondarySource === "nlt") && (
          <span
            style={{
              fontSize: "10px",
              fontWeight: 500,
              opacity: 0.45,
              color: "var(--text-1)",
              maxWidth: "400px",
              lineHeight: 1.4,
            }}
          >
            Scripture quotations marked (NLT) are taken from the Holy Bible, New
            Living Translation, copyright ©1996, 2004, 2015 by Tyndale House
            Foundation. Used by permission of Tyndale House Publishers. All
            rights reserved.
          </span>
        )}
        {primarySource === "local" && secondarySource === "local" && (
          <span
            style={{
              fontSize: "12px",
              fontWeight: 600,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              opacity: 0.45,
              color: "var(--text-1)",
            }}
          >
            StreamBible Local Data
          </span>
        )}
      </div>

      <BroadcastControls 
        status={status} statusMsg={statusMsg}
        pushLive={pushLive} clearScreen={clearScreen}
        primaryText={primaryText} secondaryText={secondaryText}
      />

      {/* DISCONNECTED OVERLAY for Guests */}
      {!isHost && hostStatus !== "online" && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.85)",
            backdropFilter: "blur(10px)",
            zIndex: 10000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            textAlign: "center",
            padding: "20px",
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{ maxWidth: "400px" }}
          >
            <div style={{ fontSize: "48px", marginBottom: "20px" }}>
              {hostStatus === "denied" ? "🔒" : "📡"}
            </div>
            <h2
              style={{
                fontSize: "24px",
                fontWeight: "bold",
                marginBottom: "12px",
              }}
            >
              {hostStatus === "denied" ? "Access Revoked" : "Host Disconnected"}
            </h2>
            <p style={{ opacity: 0.7, lineHeight: 1.5 }}>
              {hostStatus === "denied"
                ? "The host has disabled remote access for this session. Please contact your media team."
                : "The primary controller has gone offline or the session has been reset."}
            </p>
            <button
              onClick={() => {
                localStorage.removeItem("streambible-active-room");
                window.location.href = window.location.pathname;
              }}
              style={{
                marginTop: "30px",
                padding: "12px 24px",
                borderRadius: "full",
                background: "var(--color-accent-primary)",
                color: "white",
                border: "none",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              Back to Home
            </button>
          </motion.div>
        </div>
      )}

      {/* Push-live confirmation modal */}
      <ConfirmModal
        isVisible={showPushConfirm}
        title="Push Verse Live?"
        message="This will immediately update the verse displayed on all connected overlays."
        confirmLabel="Push Live"
        cancelLabel="Cancel"
        onConfirm={() => {
          setShowPushConfirm(false);
          if (pendingPush) {
            pendingPush();
            setPendingPush(null);
          }
        }}
        onCancel={() => {
          setShowPushConfirm(false);
          setPendingPush(null);
        }}
      />
    </div>
  );
};

export default ControllerPage;
