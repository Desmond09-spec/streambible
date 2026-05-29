import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GlobalFooter } from '../components/GlobalFooter';

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section style={{ marginBottom: '40px' }}>
    <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '12px', color: 'var(--color-text-primary)' }}>{title}</h2>
    <div style={{ fontSize: '15px', lineHeight: '1.75', color: 'var(--color-text-secondary)' }}>{children}</div>
  </section>
);

export const CopyrightPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--color-bg-secondary)', padding: '40px 20px 20px', fontFamily: "'Inter', sans-serif" }}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ maxWidth: '720px', width: '100%', margin: '0 auto', flex: 1 }}
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
          <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '8px', color: 'var(--color-text-primary)' }}>Copyright Information</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>
            Full copyright and licensing notices for the Bible translations used in StreamBible.
          </p>
        </div>

        <Section title="New International Version (NIV)">
          <p>
            Scriptures quotations marked (NIV) © are taken from the New International Version © , Copyright 1973, 1978, 1984, 2011 by Biblica, Inc. Used by permission. All rights reserved. The NIV text may not be quoted in any publication made available to the public by a Creative Commons license. The NIV may not be translated into any other language. Website: <a href="https://www.biblica.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-accent-primary)' }}>https://www.biblica.com</a>
          </p>
        </Section>

        <Section title="New King James Version (NKJV)">
          <p>
            Scriptures quotations marked (NKJV) © are taken from the New King James Version © , Copyright 1982 by Thomas Nelson. Used by permission. All rights reserved. The NKJV text may not be quoted in any publication made available to the public by a Creative Commons license. The NKJV may not be translated into any other language. Website: <a href="https://www.thomasnelson.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-accent-primary)' }}>https://www.thomasnelson.com</a>
          </p>
        </Section>

        <Section title="Amplified Bible (AMP)">
          <p>
            Scriptures quotations marked (AMP) © are taken from the Amplified Bible © , Copyright 2015 by The Lockman Foundation. Used by permission. All rights reserved. The AMP text may not be quoted in any publication made available to the public by a Creative Commons license. The AMP may not be translated into any other language. Website: <a href="https://www.lockman.org" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-accent-primary)' }}>https://www.lockman.org</a>
          </p>
        </Section>

        <Section title="New Living Translation (NLT)">
          <p>
            Scripture quotations marked (NLT) are taken from the Holy Bible, New Living Translation, copyright ©1996, 2004, 2015 by Tyndale House Foundation. Used by permission of Tyndale House Publishers. All rights reserved. Website: <a href="https://www.tyndale.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-accent-primary)' }}>https://www.tyndale.com</a>
          </p>
        </Section>

        <Section title="Berean Standard Bible (BSB)">
          <p>
            Scriptures quotations marked (BSB) are taken from the Berean Standard Bible. The Holy Bible, Berean Standard Bible, BSB is produced in cooperation with Bible Hub, Discovery Bible, OpenBible.com, and the Berean Bible Translation Committee. This text of God's Word has been dedicated to the public domain. Additional Information: <a href="https://berean.bible/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-accent-primary)' }}>https://berean.bible/</a>
          </p>
        </Section>

      </motion.div>

      <div style={{ width: '100%', maxWidth: '720px', margin: '0 auto' }}>
        <GlobalFooter />
      </div>
    </div>
  );
};
