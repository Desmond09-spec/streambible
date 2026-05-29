import React from 'react';
import { CustomDropdown } from '../CustomDropdown';
import { VerseText } from '../VerseText';
import { curatedVersions } from '../../services/bibleService';
import { useSettings } from '../../context/SettingsContext';

const SkeletonLoader = () => (
  <div style={{ width: "100%", paddingTop: "4px" }}>
    <div className="skeleton-bar" style={{ width: "100%" }}></div>
    <div className="skeleton-bar" style={{ width: "90%" }}></div>
    <div className="skeleton-bar" style={{ width: "95%" }}></div>
    <div className="skeleton-bar" style={{ width: "60%" }}></div>
  </div>
);

interface PreviewCardsProps {
  showPrimary: boolean;
  setShowPrimary: (val: boolean) => void;
  primaryVersion: string;
  setPrimaryVersion: (val: string) => void;
  isUsingFallback: boolean;
  primaryText: string;
  primarySource?: 'api.bible' | 'local' | 'nlt';
  status: "default" | "fetching" | "success" | "live" | "error";
  primaryRef: string;
  primaryExpanded: boolean;
  setPrimaryExpanded: (val: boolean) => void;

  showSecondary: boolean;
  setShowSecondary: (val: boolean) => void;
  secondaryVersion: string;
  setSecondaryVersion: (val: string) => void;
  secondaryText: string;
  secondarySource?: 'api.bible' | 'local' | 'nlt';
  secondaryRef: string;
  secondaryExpanded: boolean;
  setSecondaryExpanded: (val: boolean) => void;
}

export const PreviewCards: React.FC<PreviewCardsProps> = ({
  showPrimary, setShowPrimary, primaryVersion, setPrimaryVersion,
  isUsingFallback, primaryText, primarySource, status, primaryRef, primaryExpanded, setPrimaryExpanded,
  showSecondary, setShowSecondary, secondaryVersion, setSecondaryVersion,
  secondaryText, secondarySource, secondaryRef, secondaryExpanded, setSecondaryExpanded
}) => {
  const { showVerseNumbers } = useSettings();

  return (
    <div id="preview-cards" className="previews">
      <div className={`preview-card ${!showPrimary ? "lang-disabled" : ""}`}>
        <div className="card-label">
          <span className="card-label-dot"></span>
          Window 1<span className="card-label-rule"></span>
          <div style={{ flex: 1, margin: "0 12px" }}>
            <CustomDropdown
              value={primaryVersion}
              onChange={setPrimaryVersion}
              curatedVersions={curatedVersions}
              isFallbackActive={isUsingFallback}
            />
          </div>
          <label className="lang-toggle" title="Show on stream">
            <input
              type="checkbox"
              checked={showPrimary}
              onChange={(e) => setShowPrimary(e.target.checked)}
            />
            <span className="lang-toggle-track"></span>
          </label>
        </div>
        <div
          className={`preview-text ${primaryText && status !== "fetching" ? "has-content" : ""} ${primaryExpanded ? "expanded" : ""}`}
        >
          {status === "fetching" ? (
            <SkeletonLoader />
          ) : primaryText ? (
            <VerseText
              text={primaryText}
              source={primarySource}
              showVerseNumbers={showVerseNumbers}
              isMultiVerse={primaryRef.includes("-")}
            />
          ) : (
            "Waiting for a verse…"
          )}
        </div>
        <div className="card-footer">
          <span
            className={`card-ref ${primaryRef && status !== "fetching" ? "visible" : ""}`}
          >
            {primaryRef}
          </span>
          <button
            className={`expand-btn ${primaryText.length > 230 && status !== "fetching" ? "visible" : ""}`}
            onClick={() => setPrimaryExpanded(!primaryExpanded)}
          >
            {primaryExpanded ? "Show less" : "Show more"}
          </button>
        </div>
      </div>

      <div className={`preview-card ${!showSecondary ? "lang-disabled" : ""}`}>
        <div className="card-label">
          <span className="card-label-dot"></span>
          Window 2<span className="card-label-rule"></span>
          <div style={{ flex: 1, margin: "0 12px" }}>
            <CustomDropdown
              value={secondaryVersion}
              onChange={setSecondaryVersion}
              curatedVersions={curatedVersions}
              isFallbackActive={isUsingFallback}
            />
          </div>
          <label className="lang-toggle" title="Show on stream">
            <input
              type="checkbox"
              checked={showSecondary}
              onChange={(e) => setShowSecondary(e.target.checked)}
            />
            <span className="lang-toggle-track"></span>
          </label>
        </div>
        <div
          className={`preview-text ${secondaryText && status !== "fetching" ? "has-content" : ""} ${secondaryExpanded ? "expanded" : ""}`}
        >
          {status === "fetching" ? (
            <SkeletonLoader />
          ) : secondaryText ? (
            <VerseText
              text={secondaryText}
              source={secondarySource}
              showVerseNumbers={showVerseNumbers}
              isMultiVerse={secondaryRef.includes("-")}
            />
          ) : (
            "Nduro fun ẹsẹ kan…"
          )}
        </div>
        <div className="card-footer">
          <span
            className={`card-ref ${secondaryRef && status !== "fetching" ? "visible" : ""}`}
          >
            {secondaryRef}
          </span>
          <button
            className={`expand-btn ${secondaryText.length > 230 && status !== "fetching" ? "visible" : ""}`}
            onClick={() => setSecondaryExpanded(!secondaryExpanded)}
          >
            {secondaryExpanded ? "Show less" : "Show more"}
          </button>
        </div>
      </div>
    </div>
  );
};
