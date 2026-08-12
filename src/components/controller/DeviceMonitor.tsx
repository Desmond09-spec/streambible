import React from 'react';
import { getPublicBaseUrl } from '../../utils/urlHelpers';

interface DeviceMonitorProps {
  copyUrl: (url: string, type: "overlay" | "fullscreen" | "controller") => void;
}

const OverlayCard: React.FC<{
  label: string;
  description: string;
  icon: React.ReactNode;
  url: string;
  type: "overlay" | "fullscreen";
  copyUrl: (url: string, type: "overlay" | "fullscreen" | "controller") => void;
}> = ({ label, description, icon, url, type, copyUrl }) => {
  const handleOpen = () => window.open(url, '_blank', 'noopener');

  return (
    <div className="preview-card" style={{ minHeight: 'auto', cursor: 'default' }}>
      {/* Card header label */}
      <div className="card-label">
        <span className="card-label-dot" />
        {label}
        <span className="card-label-rule" />
      </div>

      {/* Icon + description */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flex: 1 }}>
        <div style={{
          width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
          background: 'var(--accent-bg, rgba(10,132,255,0.1))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--accent)',
        }}>
          {icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 'var(--fs-sm)', fontWeight: 'var(--fw-semibold)', color: 'var(--text-1)', marginBottom: '3px' }}>
            {description}
          </div>
          <div style={{
            fontSize: 'var(--fs-xs)', color: 'var(--text-3)',
            fontFamily: 'monospace', overflow: 'hidden',
            textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }} title={url}>
            {url}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
        <button
          onClick={() => copyUrl(url, type)}
          style={{
            flex: 1, padding: '7px 0',
            background: 'var(--accent)', color: '#fff',
            border: 'none', borderRadius: 'var(--r-md)',
            fontSize: 'var(--fs-xs)', fontWeight: 'var(--fw-semibold)',
            cursor: 'pointer', transition: 'opacity 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
        >
          Copy URL
        </button>
        <button
          onClick={handleOpen}
          title="Open in new window"
          style={{
            width: '34px', height: '34px', flexShrink: 0,
            background: 'var(--bg-elevated)', color: 'var(--text-2)',
            border: '1px solid var(--border-base)', borderRadius: 'var(--r-md)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: 'color 0.15s, border-color 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.borderColor = 'var(--accent)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-2)'; e.currentTarget.style.borderColor = 'var(--border-base)'; }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export const DeviceMonitor: React.FC<DeviceMonitorProps> = ({ copyUrl }) => {
  const base = getPublicBaseUrl();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div
        style={{
          fontSize: 'var(--fs-2xs)', fontWeight: 'var(--fw-semibold)',
          letterSpacing: 'var(--tracking-widest)', textTransform: 'uppercase',
          color: 'var(--text-3)', padding: '0 2px',
        }}
      >
        OBS Overlays
      </div>

      <div className="previews">
        <OverlayCard
          label="Lower-Third"
          description="Animated verse card in the lower corner of the screen"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <line x1="2" y1="20" x2="22" y2="20" />
              <line x1="2" y1="17" x2="22" y2="17" />
            </svg>
          }
          url={`${base}/#/overlay`}
          type="overlay"
          copyUrl={copyUrl}
        />
        <OverlayCard
          label="Fullscreen"
          description="Centred full-screen verse display for projectors"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <polyline points="8 21 12 17 16 21" />
            </svg>
          }
          url={`${base}/#/fullscreen`}
          type="fullscreen"
          copyUrl={copyUrl}
        />
      </div>
    </div>
  );
};
