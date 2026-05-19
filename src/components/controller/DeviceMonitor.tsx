import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from '../../context/SessionContext';

interface DeviceMonitorProps {
  copyUrl: (url: string, type: "overlay" | "fullscreen" | "controller") => void;
}

export const DeviceMonitor: React.FC<DeviceMonitorProps> = ({ copyUrl }) => {
  const {
    roomId,
    isHost,
    remoteAccess,
    setRemoteAccess,
    discoveryEnabled,
    setDiscoveryEnabled,
    devices,
    myId,
    joinRequest,
    incomingRequest,
    requestStatus,
    setRequestStatus,
    nearbySessions,
    refreshDiscovery,
    isDiscovering,
    regenerateRoom,
    handleJoinRequest,
    handleResponse,
  } = useSession();

  const [isNetworkExpanded, setIsNetworkExpanded] = useState(false);
  const [qrLoaded, setQrLoaded] = useState(false);

  return (
    <>
      <div id="network-panel" className="network-panel">
        <div className="network-header">
          <div className="network-title-box">
            <div className="network-title">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0110 0v4"></path>
              </svg>
              Remote Access
            </div>
            <div className="network-status">
              Allow mobile devices on this Wi-Fi to control StreamBible.
            </div>
          </div>
          <div className="network-header-controls">
            <label className={`toggle-switch ${!isHost ? "is-locked" : ""}`}>
              <input
                type="checkbox"
                checked={remoteAccess}
                onChange={(e) => setRemoteAccess(e.target.checked)}
                disabled={!isHost}
              />
              <span className="toggle-slider"></span>
            </label>
            <button
              className={`network-collapse-btn ${isNetworkExpanded ? "" : "collapsed"} ${remoteAccess ? "active" : ""}`}
              onClick={() => setIsNetworkExpanded(!isNetworkExpanded)}
            >
              <svg
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="4 10 8 6 12 10" />
              </svg>
            </button>
          </div>
        </div>

        <AnimatePresence initial={false}>
          {isNetworkExpanded && remoteAccess && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="network-expanded visible"
              style={{ overflow: "hidden" }}
            >
              <div
                className="qr-container"
                style={{
                  padding: "16px",
                  background: "white",
                  borderRadius: "12px",
                  display: "inline-block",
                  position: "relative",
                  width: "172px",
                  height: "172px",
                }}
              >
                {roomId && (
                  <>
                    <AnimatePresence>
                      {!qrLoaded && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          style={{
                            position: "absolute",
                            inset: "16px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: "rgba(0,0,0,0.02)",
                            borderRadius: "8px",
                          }}
                        >
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{
                              repeat: Infinity,
                              duration: 1,
                              ease: "linear",
                            }}
                            style={{
                              width: "24px",
                              height: "24px",
                              borderRadius: "50%",
                              border: "2px solid rgba(0,0,0,0.1)",
                              borderTopColor: "#0A84FF",
                            }}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(`${window.location.origin}/#/controller?room=${roomId}`)}`}
                      alt="Scan to control session"
                      width={140}
                      height={140}
                      onLoad={() => setQrLoaded(true)}
                      style={{
                        display: "block",
                        opacity: qrLoaded ? 1 : 0,
                        transition: "opacity 0.4s ease",
                      }}
                    />
                  </>
                )}
              </div>
              <div
                className="network-url-box"
                style={{ display: "flex", gap: "8px", alignItems: "center" }}
              >
                <svg
                  className="network-url-icon"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0110 0v4"></path>
                </svg>
                <span
                  style={{
                    flex: 1,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {window.location.origin}/#/controller?room={roomId}
                </span>
                <button
                  onClick={() =>
                    copyUrl(
                      `${window.location.origin}/#/controller?room=${roomId}`,
                      "controller",
                    )
                  }
                  style={{ padding: "4px 12px" }}
                >
                  Copy
                </button>
                {isHost && (
                  <button
                    onClick={regenerateRoom}
                    style={{
                      padding: "4px 12px",
                      background: "rgba(255,0,0,0.1)",
                      color: "#ff4444",
                    }}
                    title="Reset Session ID"
                  >
                    Reset
                  </button>
                )}
              </div>

              <div className="device-monitor">
                <div className="device-monitor-header">
                  <span className="device-monitor-title">Live Sessions</span>
                </div>
                <div className="device-list">
                  {[...devices]
                    .sort((a, b) => {
                      if (a.id === myId) return -1;
                      if (b.id === myId) return 1;
                      if (a.isHost) return -1;
                      if (b.isHost) return 1;
                      return 0;
                    })
                    .map((dev) => {
                      const isMe = dev.id === myId;
                      return (
                        <div
                          key={dev.id}
                          className={`device-item ${isMe ? "is-me" : ""}`}
                        >
                          <div className="device-item-left">
                            <div className="device-icon-wrap">
                              <svg
                                viewBox="0 0 24 24"
                                width="14"
                                height="14"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <rect
                                  x="5"
                                  y="2"
                                  width="14"
                                  height="20"
                                  rx="2"
                                  ry="2"
                                ></rect>
                                <line x1="12" y1="18" x2="12.01" y2="18"></line>
                              </svg>
                            </div>
                            <div className="device-info">
                              <div className="device-name">
                                {isMe ? "You" : dev.name}
                              </div>
                              <div className="device-meta">
                                {isMe
                                  ? dev.name
                                  : dev.isOverlay
                                    ? "Overlay"
                                    : "Remote Controller"}
                                {dev.isHost && (
                                  <span className="device-badge badge-host">
                                    Host
                                  </span>
                                )}
                                {isMe && (
                                  <span className="device-badge badge-me">
                                    You
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {incomingRequest && isHost && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: "-50%", scale: 0.9 }}
            animate={{ opacity: 1, y: 0, x: "-50%", scale: 1 }}
            exit={{ opacity: 0, y: 20, x: "-50%", scale: 0.9 }}
            className="glass join-modal"
            style={{
              position: "fixed",
              bottom: "100px",
              left: "50%",
              zIndex: 11000,
              width: "90%",
              maxWidth: "380px",
              textAlign: "center",
              padding: "var(--s-6)",
              borderRadius: "var(--r-2xl)",
            }}
          >
            <div className="modal-icon">🤝</div>
            <h3 className="modal-title">Join Request</h3>
            <p className="modal-body-text">
              <strong>{incomingRequest.name}</strong> is nearby and wants to
              join your session.
            </p>
            {!remoteAccess && (
              <div
                style={{
                  marginTop: "8px",
                  marginBottom: "4px",
                  padding: "10px 12px",
                  background: "rgba(255, 170, 0, 0.12)",
                  border: "1px solid rgba(255, 170, 0, 0.35)",
                  borderRadius: "8px",
                  fontSize: "12px",
                  color: "var(--warning, #e6a000)",
                  textAlign: "left",
                  lineHeight: "1.5",
                  display: "flex",
                  gap: "8px",
                  alignItems: "flex-start",
                }}
                role="alert"
              >
                <span style={{ flexShrink: 0, fontSize: "14px" }}>⚠️</span>
                <span>
                  <strong>Remote Access is off.</strong> Accepting will
                  automatically enable it so this device can connect.
                </span>
              </div>
            )}
            <div className="modal-actions">
              <button
                onClick={() => handleResponse(false)}
                className="modal-btn modal-btn-decline"
              >
                Decline
              </button>
              <button
                onClick={() => handleResponse(true)}
                className="modal-btn modal-btn-accept"
              >
                {!remoteAccess ? "Accept & Enable Access" : "Accept"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {requestStatus === "pending" && (
          <motion.div
            initial={{ opacity: 0, y: 20, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 20, x: "-50%" }}
            className="request-pending-pill"
          >
            <span className="spinner-dots"></span>
            Request sent. Waiting for Host approval...
            <button
              onClick={() => setRequestStatus("idle")}
              className="cancel-request-btn"
            >
              Cancel
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {requestStatus === "declined" && (
          <motion.div
            initial={{ opacity: 0, y: 20, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 20, x: "-50%" }}
            className="request-declined-pill"
          >
            🔒 Request declined by the Host.
          </motion.div>
        )}
      </AnimatePresence>

      <div id="discovery-section" className="discovery-section">
        <div className="device-monitor discovery-prominent">
          <div
            className="device-monitor-header"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span
              className="device-monitor-title"
              style={{ display: "flex", alignItems: "center", gap: "8px" }}
            >
              {discoveryEnabled && isDiscovering ? (
                <span className="spinner-dots" style={{ margin: "0 4px" }}></span>
              ) : (
                <span className={`live-pulse ${!discoveryEnabled ? "is-paused" : ""}`}></span>
              )}
              Discover Nearby Sessions
            </span>
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              {discoveryEnabled && (
                <button
                  onClick={refreshDiscovery}
                  disabled={isDiscovering}
                  className="refresh-discovery-btn"
                  title="Refresh List"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    width="14"
                    height="14"
                  >
                    <polyline points="23 4 23 10 17 10"></polyline>
                    <polyline points="1 20 1 14 7 14"></polyline>
                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                  </svg>
                </button>
              )}
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={discoveryEnabled}
                  onChange={(e) => setDiscoveryEnabled(e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {!discoveryEnabled ? (
              <motion.div
                key="disabled"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="discovery-empty-state"
              >
                Turn on discovery to find and join active StreamBible sessions on
                your Wi-Fi network.
              </motion.div>
            ) : nearbySessions.filter((s) => s.room_id !== roomId).length > 0 ? (
              <motion.div
                key="list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="device-list"
              >
                {nearbySessions
                  .filter((s) => s.room_id !== roomId)
                  .map((session) => (
                    <div
                      key={session.room_id}
                      className="device-item discovery-item"
                    >
                      <div className="device-item-left">
                        <div
                          className="device-icon-wrap"
                          style={{
                            background: "var(--color-accent-primary)",
                            color: "white",
                          }}
                        >
                          <svg
                            viewBox="0 0 24 24"
                            width="14"
                            height="14"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M5 12.55a11 11 0 0 1 14.08 0"></path>
                            <path d="M1.42 9a16 16 0 0 1 21.16 0"></path>
                            <path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path>
                            <line x1="12" y1="20" x2="12.01" y2="20"></line>
                          </svg>
                        </div>
                        <div className="device-info">
                          <div className="device-name">
                            Room: {session.room_id}
                          </div>
                          <div className="device-meta">Church Wi-Fi Network</div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleJoinRequest(session.room_id)}
                        disabled={requestStatus === "pending"}
                        className="join-request-btn"
                      >
                        {requestStatus === "pending" &&
                        joinRequest?.roomId === session.room_id
                          ? "Wait..."
                          : "Request Join"}
                      </button>
                    </div>
                  ))}
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="discovery-empty-state"
              >
                {isDiscovering
                  ? "Scanning network..."
                  : "No nearby sessions found. Make sure Remote Access is enabled on the host device."}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
};
