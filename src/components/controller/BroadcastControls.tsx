import React from 'react';

interface BroadcastControlsProps {
  status: "default" | "fetching" | "success" | "live" | "error";
  statusMsg: string;
  pushLive: () => void;
  clearScreen: () => void;
  primaryText: string;
  secondaryText: string;
}

export const BroadcastControls: React.FC<BroadcastControlsProps> = ({
  status,
  statusMsg,
  pushLive,
  clearScreen,
  primaryText,
  secondaryText,
}) => {
  return (
    <footer id="action-bar" className="action-bar">
      <div className="action-row">
        <button
          className={`btn-live ${status === "live" ? "is-live" : ""}`}
          onClick={pushLive}
          disabled={(!primaryText && !secondaryText) || status === "fetching"}
        >
          Push Live
        </button>
        <button className="btn-clear" onClick={clearScreen}>
          Clear
        </button>
      </div>
      <div className="status-pill" data-state={status}>
        <span className="status-dot"></span>
        <span>{statusMsg}</span>
      </div>
    </footer>
  );
};
