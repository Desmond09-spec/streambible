import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section style={{ marginBottom: '40px' }}>
    <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '12px', color: 'var(--color-text-primary)' }}>{title}</h2>
    <div style={{ fontSize: '15px', lineHeight: '1.75', color: 'var(--color-text-secondary)' }}>{children}</div>
  </section>
);

export const PrivacyPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-secondary)', padding: '40px 20px', fontFamily: "'Inter', sans-serif" }}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ maxWidth: '720px', margin: '0 auto' }}
      >
        <button
          onClick={() => navigate(-1)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '6px',
            color: 'var(--color-text-secondary)', fontSize: '14px',
            fontWeight: 500, marginBottom: '32px', padding: 0
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Back
        </button>

        <div style={{ marginBottom: '48px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '8px', color: 'var(--color-text-primary)' }}>Privacy Policy</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>Last updated: May 2026</p>
        </div>

        <Section title="1. What StreamBible Is">
          <p>
            StreamBible is a free, open-use web application designed to help churches, worship teams, and media operators present Scripture in real time during live services and livestreams. It is not a commercial product or paid subscription service. There are no fees, subscriptions, or revenue generated from this application.
          </p>
        </Section>

        <Section title="2. What Data We Collect">
          <p style={{ marginBottom: '12px' }}>StreamBible collects the minimum data necessary to provide its core features. Specifically:</p>
          <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li><strong>Email address</strong> — collected when you create an account. Used solely to identify your account and associate your claimed Room ID with you.</li>
            <li><strong>Google profile name and profile picture</strong> — collected only if you choose to sign in with Google. This is used for account identification only and is not displayed publicly anywhere in the app.</li>
            <li><strong>Claimed Room ID</strong> — a short 3–8 character code (e.g. "GRACE") you choose for yourself. This is your permanent broadcast identifier.</li>
            <li><strong>Onboarding status</strong> — a simple true/false flag stored to track whether you have seen the new user welcome guide, so it isn't shown repeatedly.</li>
          </ul>
        </Section>

        <Section title="3. What We Do NOT Collect">
          <p style={{ marginBottom: '12px' }}>We do not collect, store, or process:</p>
          <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li>Your sermon notes, presentation content, or selected Bible verses.</li>
            <li>Any usage analytics, page view tracking, or behavioural data.</li>
            <li>Payment or billing information of any kind.</li>
            <li>Device location, contacts, microphone, or camera access.</li>
            <li>Any third-party advertising identifiers.</li>
          </ul>
        </Section>

        <Section title="4. How We Use Your Data">
          <p>
            Your email and account details are used exclusively to:
          </p>
          <ul style={{ paddingLeft: '20px', marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li>Authenticate you securely when you sign in.</li>
            <li>Permanently link your chosen Room ID to your account, so your OBS browser sources and overlays remain stable across sessions and devices.</li>
          </ul>
          <p style={{ marginTop: '12px' }}>
            We do not sell, rent, trade, or share your personal data with any third party for commercial or marketing purposes.
          </p>
        </Section>

        <Section title="5. Data Storage and Security">
          <p>
            Account data is stored securely on <strong>Supabase</strong>, a GDPR-compliant cloud platform built on top of PostgreSQL and hosted on AWS infrastructure. We enforce Row Level Security (RLS) on all database tables, meaning your data is strictly inaccessible to other users. Authentication is managed using industry-standard JWTs (JSON Web Tokens) via Supabase Auth.
          </p>
          <p style={{ marginTop: '12px' }}>
            Bible verse data is fetched from third-party APIs (API.Bible and NLT.to) and cached temporarily in your browser's local storage and in our shared cache table to improve speed. This cached data is anonymous and contains no personal information.
          </p>
        </Section>

        <Section title="6. Third-Party Services">
          <p style={{ marginBottom: '12px' }}>StreamBible integrates with the following third-party services to function:</p>
          <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li><strong>Supabase</strong> — database, authentication, and real-time broadcasting.</li>
            <li><strong>Google OAuth</strong> — optional "Sign in with Google" functionality.</li>
            <li><strong>API.Bible</strong> — a third-party Bible content API for retrieving certain translations (NKJV, NIV, AMP).</li>
            <li><strong>NLT.to</strong> — the official New Living Translation API.</li>
          </ul>
          <p style={{ marginTop: '12px' }}>Each of these services operates under their own privacy policies and data handling practices. We encourage you to review their policies if you have concerns.</p>
        </Section>

        <Section title="7. Cookies and Local Storage">
          <p>
            StreamBible uses your browser's <strong>local storage</strong> (not traditional cookies) to store your active room session and cached Bible verse data. This data is stored entirely on your own device and is never transmitted to our servers. You can clear it at any time by clearing your browser data.
          </p>
          <p style={{ marginTop: '12px' }}>
            If you sign in with Google or email/password, Supabase stores a secure authentication session token in your browser, which is required to maintain your signed-in state.
          </p>
        </Section>

        <Section title="8. Data Retention">
          <p>
            Your account and associated Room ID remain stored for as long as your account is active. If you sign out and never return, your data remains in our database but is never accessed or processed for any purpose. We have no automated deletion policy currently in place, as the data footprint per user is minimal (a single database row).
          </p>
          <p style={{ marginTop: '12px' }}>
            Bible cache entries are automatically expired and deleted after 30 days via a time-to-live (TTL) mechanism.
          </p>
        </Section>

        <Section title="9. Children's Privacy">
          <p>
            StreamBible is a tool for church media operators and presenters, not a consumer application directed at children. We do not knowingly collect data from individuals under the age of 13. If you believe a minor has created an account, please contact us.
          </p>
        </Section>

        <Section title="10. Your Rights">
          <p style={{ marginBottom: '12px' }}>You have the right to:</p>
          <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li>Request a copy of any personal data we hold about you.</li>
            <li>Request deletion of your account and associated data.</li>
            <li>Sign out of your account at any time from the Settings page.</li>
          </ul>
          <p style={{ marginTop: '12px' }}>To exercise any of these rights, please reach out to us directly.</p>
        </Section>

        <Section title="11. Changes to This Policy">
          <p>
            We may update this Privacy Policy as the application evolves. If significant changes are made, we will update the "last updated" date at the top of this page. Continued use of StreamBible following any changes constitutes your acknowledgement of the updated policy.
          </p>
        </Section>

        <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '24px', marginTop: '16px', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
          <p>StreamBible is a free tool built for the church community. If you have any questions about this Privacy Policy, please contact the developer directly.</p>
        </div>
      </motion.div>
    </div>
  );
};
