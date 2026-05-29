import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  MonitorPlay,
  Search,
  MessageSquare,
  CheckCircle2,
  ChevronDown,
  ChevronLeft
} from 'lucide-react';
import { GlobalFooter } from '../components/GlobalFooter';
import './HelpPage.css';

const HelpPage: React.FC = () => {
  const navigate = useNavigate();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Form State
  const [feedbackType, setFeedbackType] = useState<'feature' | 'review'>('feature');
  const [feedbackText, setFeedbackText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // FAQ State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    const saved = localStorage.getItem('streambible-theme') || 'light';
    Promise.resolve().then(() => setTheme(saved as 'light' | 'dark'));
  }, []);

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;

    setIsSubmitting(true);
    // Simulate network request
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 1200);
  };

  const faqs = [
    {
      question: "How does this connect to OBS?",
      answer: "We use a Browser Source. Every session generates a unique URL. When you paste that URL into OBS, it creates an invisible webpage that listens for your commands and displays the verses you push."
    },
    {
      question: "Can anyone on my Wi-Fi control my session?",
      answer: "No. Other users on your network can ask to join your session, but they cannot control the screen unless you explicitly tap 'Accept' on your screen."
    },
    {
      question: "Is StreamBible free?",
      answer: "Yes. StreamBible is completely free. There are no hidden fees or subscriptions to use the core overlay service."
    }
  ];

  return (
    <div className={`help-page-wrapper theme-${theme}`}>
      <header className="help-header">
        <button className="help-nav-back" onClick={() => navigate(-1)}>
          <ChevronLeft size={20} strokeWidth={2.5} />
          <span>Back</span>
        </button>
        <div /> {/* center spacer */}
        <div /> {/* right spacer */}
      </header>

      <main className="help-main">

        {/* Page Title */}
        <div className="help-page-title-wrap">
          <h1 className="help-page-title">Help & Support</h1>
          <p className="help-page-subtitle">Learn how to set up your stream, manage devices, or get in touch.</p>
        </div>

        {/* Quick Setup Guide */}
        <section className="support-group">
          <div className="support-group-header">Quick Setup Guide</div>
          <div className="support-card">

            <div className="support-row">
              <div className="support-icon-wrap bg-blue">
                <MonitorPlay size={18} strokeWidth={2.5} />
              </div>
              <div className="support-row-content">
                <span className="support-row-title">Step 1: Get the Overlay Link</span>
                <span className="support-row-desc">Tap the "Copy Overlay URL" button at the top of this screen. That link is what shows verses on your stream.</span>
              </div>
            </div>

            <div className="support-row">
              <div className="support-icon-wrap bg-orange">
                <MonitorPlay size={18} strokeWidth={2.5} />
              </div>
              <div className="support-row-content">
                <span className="support-row-title">Step 2: Add to OBS</span>
                <span className="support-row-desc">In OBS, add a new "Browser Source". Paste the link into the URL box, set Width to 1920, and Height to 1080.</span>
              </div>
            </div>

            <div className="support-row">
              <div className="support-icon-wrap bg-green">
                <Search size={18} strokeWidth={2.5} />
              </div>
              <div className="support-row-content">
                <span className="support-row-title">Step 3: Search & Go Live</span>
                <span className="support-row-desc">Type any Bible verse in the search bar. Tap "Push Live" to instantly display it on your OBS stream.</span>
              </div>
            </div>

          </div>
        </section>

        {/* FAQs */}
        <section className="support-group">
          <div className="support-group-header">Frequently Asked Questions</div>
          <div className="support-card">
            {faqs.map((faq, index) => (
              <div key={index} className={`faq-row ${openFaq === index ? 'is-open' : ''}`}>
                <button className="faq-header" onClick={() => setOpenFaq(openFaq === index ? null : index)}>
                  <span className="faq-title">{faq.question}</span>
                  <ChevronDown className="faq-icon" size={18} strokeWidth={2.5} />
                </button>
                <AnimatePresence>
                  {openFaq === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div className="faq-body">{faq.answer}</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </section>

        {/* Feedback Form */}
        <section className="support-group">
          <div className="support-group-header">Send Feedback</div>
          <div className="support-card feedback-container">
            <AnimatePresence mode="wait">
              {!submitted ? (
                <motion.form
                  key="form"
                  onSubmit={handleFeedbackSubmit}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
                >

                  {/* Apple-style Segmented Control */}
                  <div className="segmented-control">
                    <motion.div
                      className="segmented-pill"
                      initial={false}
                      animate={{
                        x: feedbackType === 'feature' ? '0%' : '100%',
                        width: '50%'
                      }}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                    <button
                      type="button"
                      className={`segmented-btn ${feedbackType === 'feature' ? 'active' : ''}`}
                      onClick={() => setFeedbackType('feature')}
                    >
                      Feature Request
                    </button>
                    <button
                      type="button"
                      className={`segmented-btn ${feedbackType === 'review' ? 'active' : ''}`}
                      onClick={() => setFeedbackType('review')}
                    >
                      Submit Review
                    </button>
                  </div>

                  <textarea
                    className="feedback-textarea"
                    placeholder={feedbackType === 'feature' ? "What feature would make StreamBible better?" : "How has StreamBible helped your stream?"}
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    required
                  ></textarea>

                  <button type="submit" className="feedback-submit-btn" disabled={isSubmitting || !feedbackText.trim()}>
                    <MessageSquare size={18} strokeWidth={2.5} />
                    {isSubmitting ? 'Sending...' : 'Send Feedback'}
                  </button>
                </motion.form>
              ) : (
                <motion.div
                  key="success"
                  className="feedback-success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <CheckCircle2 className="feedback-success-icon" size={48} strokeWidth={2} />
                  <div className="feedback-success-title">Thank You</div>
                  <div className="feedback-success-desc">Your {feedbackType} has been received.</div>
                  <button
                    onClick={() => { setSubmitted(false); setFeedbackText(''); }}
                    style={{ background: 'transparent', border: 'none', color: 'var(--accent)', marginTop: '20px', cursor: 'pointer', fontSize: '15px', fontWeight: '500' }}
                  >
                    Send another
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="support-group-footer">
            Your feedback helps us prioritize new features and improve StreamBible.
          </div>
        </section>
        <GlobalFooter />
      </main>
    </div>
  );
};

export default HelpPage;
