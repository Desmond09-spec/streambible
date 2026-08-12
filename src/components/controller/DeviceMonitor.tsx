import React from 'react';
import { getPublicBaseUrl } from '../../utils/urlHelpers';

interface DeviceMonitorProps {
  copyUrl: (url: string, type: "overlay" | "fullscreen" | "controller") => void;
}

export const DeviceMonitor: React.FC<DeviceMonitorProps> = ({ copyUrl }) => {
  const base = getPublicBaseUrl();
  const lowerThirdUrl = `${base}/#/overlay`;
  const fullscreenUrl = `${base}/#/fullscreen`;

  const handleOpen = (url: string) => {
    window.open(url, '_blank', 'noopener');
  };

  return (
    <div id="network-panel" className="network-panel">
      <div className="network-header">
        <div className="network-title-box">
          <div className="network-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
            OBS Overlays
          </div>
          <div className="network-status">
            Add these as Browser Sources in OBS at 1920×1080.
          </div>
        </div>
      </div>

      {/* Lower-Third */}
      <div className="network-url-box">
        <svg className="network-url-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="14" rx="2" />
          <line x1="9" y1="21" x2="15" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
        </svg>
        <span title={lowerThirdUrl}>Lower-Third — {lowerThirdUrl}</span>
        <button onClick={() => handleOpen(lowerThirdUrl)} title="Open in browser">↗</button>
        <button onClick={() => copyUrl(lowerThirdUrl, 'overlay')} title="Copy URL">Copy</button>
      </div>

      {/* Fullscreen */}
      <div className="network-url-box">
        <svg className="network-url-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <polyline points="8 21 12 17 16 21" />
        </svg>
        <span title={fullscreenUrl}>Fullscreen — {fullscreenUrl}</span>
        <button onClick={() => handleOpen(fullscreenUrl)} title="Open in browser">↗</button>
        <button onClick={() => copyUrl(fullscreenUrl, 'fullscreen')} title="Copy URL">Copy</button>
      </div>

      <div className="network-status" style={{ marginTop: '-8px' }}>
        💡 StreamBible must be running for overlays to receive updates.
      </div>
    </div>
  );
};
