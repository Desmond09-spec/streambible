import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section style={{ marginBottom: '40px' }}>
    <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '12px', color: 'var(--color-text-primary)' }}>{title}</h2>
    <div style={{ fontSize: '15px', lineHeight: '1.75', color: 'var(--color-text-secondary)' }}>{children}</div>
  </section>
);

export const TermsPage: React.FC = () => {
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
          <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '8px', color: 'var(--color-text-primary)' }}>Terms of Service</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>Last updated: May 2026</p>
        </div>

        <Section title="1. About StreamBible">
          <p>
            StreamBible is a free, non-commercial web application built to help churches and worship teams display Scripture in real time during live services and livestreams. It is provided as-is, without charge, and is not a commercial product or subscription service of any kind.
          </p>
          <p style={{ marginTop: '12px' }}>
            By using StreamBible — whether as a host, operator, or display device — you agree to these Terms of Service. If you do not agree, please discontinue use of the application.
          </p>
        </Section>

        <Section title="2. Who Can Use StreamBible">
          <p>StreamBible is intended for use by:</p>
          <ul style={{ paddingLeft: '20px', marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li>Church media teams, presentation operators, and worship leaders.</li>
            <li>Organisations running hybrid or fully digital worship services.</li>
            <li>Individuals or ministries presenting Scripture in a church or ministry context.</li>
          </ul>
          <p style={{ marginTop: '12px' }}>
            Creating an account requires a valid email address. You must be at least 13 years of age to use this service.
          </p>
        </Section>

        <Section title="3. Account Responsibilities">
          <p>
            When you create an account and claim a Room ID, you are responsible for maintaining the security of your credentials. Do not share your account details with others. Each Room ID is unique and permanently associated with your account — it cannot be transferred or reassigned.
          </p>
          <p style={{ marginTop: '12px' }}>
            You are solely responsible for all activity that occurs under your account. If you believe your account has been accessed without your authorisation, you should sign out immediately and contact us.
          </p>
        </Section>

        <Section title="4. Acceptable Use">
          <p style={{ marginBottom: '12px' }}>You may use StreamBible for any lawful, sincere ministry or worship-related purpose. You agree not to use StreamBible to:</p>
          <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li>Display content that is defamatory, hateful, obscene, or unlawful.</li>
            <li>Attempt to access, disrupt, or interfere with other users' sessions or data.</li>
            <li>Probe, scan, or test the vulnerability of the system or its infrastructure.</li>
            <li>Automate requests to the service in a manner that unreasonably burdens the infrastructure.</li>
            <li>Attempt to reverse-engineer, replicate, or commercially redistribute this application.</li>
          </ul>
        </Section>

        <Section title="5. Bible Content and Translations">
          <p>
            StreamBible retrieves Bible verse content from licensed third-party APIs, specifically <strong>API.Bible</strong> and the <strong>New Living Translation API (NLT.to)</strong>. Several translations are sourced from open-access datasets stored locally.
          </p>
          <p style={{ marginTop: '12px' }}>
            The Bible translations available in StreamBible (KJV, NIV, NKJV, NLT, AMP, ASV, BSB, WEB, Yoruba BM) are the intellectual property of their respective copyright holders. Use of these translations via StreamBible is for personal and congregational, non-commercial display purposes only. StreamBible does not grant any copyright licence over translation content.
          </p>
          <p style={{ marginTop: '12px' }}>
            If you redistribute StreamBible's output (e.g., as a recorded or livestreamed service), you are responsible for ensuring your use of any copyrighted Bible translation complies with the translation publisher's licensing terms.
          </p>
        </Section>

        <Section title="6. Availability and Reliability">
          <p>
            StreamBible is provided free of charge and on a best-effort basis. We make no guarantee of 100% uptime or continuous availability. Outages may occur due to third-party infrastructure (Supabase, API.Bible, NLT.to) or scheduled maintenance.
          </p>
          <p style={{ marginTop: '12px' }}>
            StreamBible includes automatic fallbacks — including a local King James Version database — to maintain availability during network or API disruptions. However, we cannot guarantee that all translations or features will be available at all times.
          </p>
        </Section>

        <Section title="7. No Warranty">
          <p>
            StreamBible is provided <strong>"as is"</strong> and <strong>"as available"</strong>, without any warranty of any kind, express or implied. This includes, but is not limited to, warranties of merchantability, fitness for a particular purpose, or non-infringement.
          </p>
          <p style={{ marginTop: '12px' }}>
            We do not warrant that StreamBible will be uninterrupted, error-free, or free from technical issues. Use of the application during live services is at your own discretion. We strongly recommend having a backup presentation plan for critical services.
          </p>
        </Section>

        <Section title="8. Limitation of Liability">
          <p>
            To the fullest extent permitted by law, StreamBible and its developer shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of your use — or inability to use — the application. This includes any disruption during a live church service, event, or broadcast.
          </p>
        </Section>

        <Section title="9. Termination">
          <p>
            You may stop using StreamBible at any time by signing out of your account. You may request full account deletion by contacting us directly.
          </p>
          <p style={{ marginTop: '12px' }}>
            We reserve the right to suspend or terminate access to any account that violates these Terms of Service, without prior notice.
          </p>
        </Section>

        <Section title="10. Changes to These Terms">
          <p>
            We may revise these Terms of Service from time to time as the application grows. Any significant changes will be reflected in an updated "last updated" date at the top of this page. Continued use of StreamBible constitutes your acceptance of any revised terms.
          </p>
        </Section>

        <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '24px', marginTop: '16px', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
          <p>StreamBible is a free tool built for the church community. If you have any questions about these Terms of Service, please contact the developer directly.</p>
        </div>
      </motion.div>
    </div>
  );
};
