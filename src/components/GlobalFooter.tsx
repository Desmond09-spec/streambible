import React from 'react';
import { useNavigate } from 'react-router-dom';
import './GlobalFooter.css';

export const GlobalFooter: React.FC = () => {
  const navigate = useNavigate();

  return (
    <footer className="global-footer">
      <div className="footer-logo" onClick={() => navigate('/')}>
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
          <rect x="2.5" y="1.5" width="11" height="13" rx="1.5"/>
          <path d="M5 5h6M5 7.5h6M5 10h4"/>
        </svg>
        <span className="footer-copyright">&copy; {new Date().getFullYear()} StreamBible</span>
      </div>
      <div className="footer-links">
        <a href="#/terms" onClick={(e) => { e.preventDefault(); navigate('/terms'); }}>Terms of Service</a>
        <a href="#/privacy" onClick={(e) => { e.preventDefault(); navigate('/privacy'); }}>Privacy Policy</a>
        <a href="#/copyright" onClick={(e) => { e.preventDefault(); navigate('/copyright'); }}>Third-Party Licenses</a>
      </div>
    </footer>
  );
};
