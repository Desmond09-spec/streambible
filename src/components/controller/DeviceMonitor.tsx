import React from 'react';
import { LayoutTemplate, Monitor, Copy, ExternalLink } from 'lucide-react';
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
            Add these as Browser Sources in OBS (1920×1080, transparent background).
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '12px 0 4px' }}>

        {/* Lower-Third Overlay */}
        <div style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-base)',
          borderLeft: '3px solid var(--color-accent-primary)',
          borderRadius: '10px',
          padding: '12px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          <LayoutTemplate size={18} style={{ color: 'var(--color-accent-primary)', flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-1)', marginBottom: '2px' }}>
              Lower-Third Overlay
            </div>
            <div style={{
              fontSize: '11px',
              color: 'var(--text-3)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              fontFamily: 'monospace',
            }}>
              {lowerThirdUrl}
            </div>
          </div>
          <button
            onClick={() => copyUrl(lowerThirdUrl, 'overlay')}
            className="header-icon-btn"
            title="Copy URL"
            style={{ flexShrink: 0 }}
          >
            <Copy size={15} />
          </button>
          <button
            onClick={() => handleOpen(lowerThirdUrl)}
            className="header-icon-btn"
            title="Open in browser to preview"
            style={{ flexShrink: 0 }}
          >
            <ExternalLink size={15} />
          </button>
        </div>

        {/* Fullscreen Overlay */}
        <div style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-base)',
          borderLeft: '3px solid #a78bfa',
          borderRadius: '10px',
          padding: '12px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          <Monitor size={18} style={{ color: '#a78bfa', flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-1)', marginBottom: '2px' }}>
              Fullscreen Display
            </div>
            <div style={{
              fontSize: '11px',
              color: 'var(--text-3)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              fontFamily: 'monospace',
            }}>
              {fullscreenUrl}
            </div>
          </div>
          <button
            onClick={() => copyUrl(fullscreenUrl, 'fullscreen')}
            className="header-icon-btn"
            title="Copy URL"
            style={{ flexShrink: 0 }}
          >
            <Copy size={15} />
          </button>
          <button
            onClick={() => handleOpen(fullscreenUrl)}
            className="header-icon-btn"
            title="Open in browser to preview"
            style={{ flexShrink: 0 }}
          >
            <ExternalLink size={15} />
          </button>
        </div>

        <div style={{
          fontSize: '11px',
          color: 'var(--text-3)',
          lineHeight: 1.5,
          padding: '4px 2px',
        }}>
          💡 StreamBible must be running for overlays to receive updates. OBS will auto-reconnect if the app restarts.
        </div>
      </div>
    </div>
  );
};
