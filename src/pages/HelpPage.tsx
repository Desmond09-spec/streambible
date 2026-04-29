import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import './HelpPage.css';

const HelpPage: React.FC = () => {
  const navigate = useNavigate();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  // Form State
  const [feedbackType, setFeedbackType] = useState<'review' | 'feature'>('feature');
  const [feedbackText, setFeedbackText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // FAQ State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    const saved = localStorage.getItem('streambible-theme') || 'light';
    setTheme(saved as 'light' | 'dark');
  }, []);

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;
    
    setIsSubmitting(true);
    // Simulate network request
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 1500);
  };

  const faqs = [
    {
      question: "How do I add this to OBS?",
      answer: "In OBS, add a new 'Browser Source'. Paste the Overlay or Fullscreen URL into the URL field. Set the width to 1920 and height to 1080 (or your stream's resolution). Check the box that says 'Refresh browser when scene becomes active'."
    },
    {
      question: "Can anyone on my Wi-Fi control my session?",
      answer: "No. While people on your Wi-Fi can see your session if they click 'Discover', they cannot join or control it unless they send a Request and you explicitly click 'Accept' on your controller."
    },
    {
      question: "Is this really free?",
      answer: "Yes! StreamBible is built to serve churches and ministries. There are no hidden fees or subscriptions for the core overlay service."
    },
    {
      question: "What translation does it use?",
      answer: "StreamBible is powered by the YouVersion Platform, giving you instant access to over 3,000+ Bible translations across 2,000 languages, including KJV, NIV, NLT, and regional translations like Yoruba."
    }
  ];

  return (
    <div className={`help-page-wrapper theme-${theme}`}>
      <header className="help-header">
        <button className="help-back-btn" onClick={() => navigate(-1)}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
          Back
        </button>
        <div className="wordmark">
          <div className="wordmark-icon">
            <svg viewBox="0 0 16 16" fill="none" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2.5" y="1.5" width="11" height="13" rx="1.5"/>
              <path d="M5 5h6M5 7.5h6M5 10h4"/>
            </svg>
          </div>
          <span className="wordmark-name">StreamBible</span>
        </div>
        <div style={{ width: '60px' }}></div> {/* spacer */}
      </header>

      <main className="help-main">
        
        {/* HERO */}
        <section className="help-hero">
          <span className="help-hero-subtitle">Our Mission</span>
          <h1 className="help-hero-title">Built for churches and<br/>Christian creators.</h1>
          <p className="help-hero-desc">
            A free Bible verse overlay system for OBS that lets you display scripture live during streams in seconds.
            <br/><br/>
            Made because too many ministries still struggle with clunky workflows, screenshots, or manually typing verses mid-service.
          </p>
          <div className="help-hero-hashtags">
            #ChurchTech #OBS #Streaming #OpenSource #ChristianTech
          </div>
        </section>

        {/* FEATURES GRID */}
        <section>
          <div className="help-features-grid">
            <div className="feature-card">
              <span className="feature-icon">⚡</span>
              <h3 className="feature-title">Real-time Sync</h3>
              <p className="walkthrough-text" style={{margin:0}}>Type a verse, preview it, and push it live instantly across all connected screens.</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">✝️</span>
              <h3 className="feature-title">Clean Overlays</h3>
              <p className="walkthrough-text" style={{margin:0}}>Modern, glassmorphic designs that look great on any church livestream.</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">🌍</span>
              <h3 className="feature-title">Multi-language</h3>
              <p className="walkthrough-text" style={{margin:0}}>Display English and Yoruba translations simultaneously or toggle them on the fly.</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">🎥</span>
              <h3 className="feature-title">OBS Ready</h3>
              <p className="walkthrough-text" style={{margin:0}}>Works natively with OBS Browser Sources. Just copy the link and you're set.</p>
            </div>
          </div>
        </section>

        {/* GUIDED TOUR */}
        <section className="help-tour-section">
          <h2 className="help-section-title">How to Use StreamBible</h2>
          <div className="tour-steps-container">
            
            {/* Step 1 */}
            <div className="tour-row">
              <div className="tour-graphic-col">
                <div className="tour-mockup search-mockup">
                  <div className="mockup-search-bar">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14" style={{opacity: 0.5}}>
                      <circle cx="11" cy="11" r="8"></circle>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    <span style={{fontFamily: 'monospace', opacity: 0.9}}>John 3:16</span>
                    <div className="mockup-cursor"></div>
                  </div>
                </div>
              </div>
              <div className="tour-text-col">
                <div className="tour-step-badge">Step 1</div>
                <h3 className="tour-step-title">Search in Milliseconds</h3>
                <p className="walkthrough-text">Type any reference—like "Romans 8:28" or "Gen 1:1"—into the search bar and press Enter. StreamBible immediately fetches the text from our library of over 3,000 translations.</p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="tour-row reverse">
              <div className="tour-graphic-col">
                <div className="tour-mockup dual-mockup">
                  <div className="mockup-card left">
                    <div className="mockup-card-header">
                      <div className="mockup-dot"></div> <div className="mockup-rule"></div> <span className="mockup-badge">KJV</span>
                    </div>
                    <div className="mockup-skeleton-line" style={{width: '90%'}}></div>
                    <div className="mockup-skeleton-line" style={{width: '75%'}}></div>
                    <div className="mockup-skeleton-line" style={{width: '85%'}}></div>
                  </div>
                  <div className="mockup-card right">
                    <div className="mockup-card-header">
                      <div className="mockup-dot"></div> <div className="mockup-rule"></div> <span className="mockup-badge">YCB</span>
                    </div>
                    <div className="mockup-skeleton-line" style={{width: '85%'}}></div>
                    <div className="mockup-skeleton-line" style={{width: '80%'}}></div>
                    <div className="mockup-skeleton-line" style={{width: '60%'}}></div>
                  </div>
                </div>
              </div>
              <div className="tour-text-col">
                <div className="tour-step-badge">Step 2</div>
                <h3 className="tour-step-title">Dual Translation Preview</h3>
                <p className="walkthrough-text">Preview your verse safely off-stream. You can set up two windows side-by-side (perfect for bilingual services) and instantly switch translations using the dropdowns.</p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="tour-row">
              <div className="tour-graphic-col">
                <div className="tour-mockup obs-mockup">
                  <div className="mockup-obs-button">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16">
                      <polygon points="5 3 19 12 5 21 5 3"></polygon>
                    </svg>
                    <span>Push Live</span>
                  </div>
                </div>
              </div>
              <div className="tour-text-col">
                <div className="tour-step-badge">Step 3</div>
                <h3 className="tour-step-title">Broadcast to OBS</h3>
                <p className="walkthrough-text">When you're ready, click "Push Live". Copy the overlay URL from the top of the page, add it as a Browser Source in OBS (1920x1080), and your verses will appear beautifully formatted on screen.</p>
              </div>
            </div>

          </div>
        </section>

        {/* FEEDBACK FORM */}
        <section>
          <h2 className="help-section-title">Help Us Improve</h2>
          <div className="feedback-card">
            <AnimatePresence mode="wait">
              {!submitted ? (
                <motion.form 
                  key="form"
                  className="feedback-form"
                  onSubmit={handleFeedbackSubmit}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <div className="feedback-radio-group">
                    <label className="feedback-radio-label">
                      <input 
                        type="radio" 
                        name="type" 
                        checked={feedbackType === 'feature'} 
                        onChange={() => setFeedbackType('feature')} 
                      />
                      <span>Feature Request</span>
                    </label>
                    <label className="feedback-radio-label">
                      <input 
                        type="radio" 
                        name="type" 
                        checked={feedbackType === 'review'} 
                        onChange={() => setFeedbackType('review')} 
                      />
                      <span>Submit Review</span>
                    </label>
                  </div>
                  
                  <textarea 
                    className="feedback-textarea" 
                    placeholder={feedbackType === 'feature' ? "What feature would make StreamBible better for your church? (e.g., 'Add NIV translation')" : "How has StreamBible helped your ministry?"}
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    required
                  ></textarea>
                  
                  <button type="submit" className="feedback-submit" disabled={isSubmitting || !feedbackText.trim()}>
                    {isSubmitting ? 'Sending...' : 'Submit Feedback'}
                  </button>
                </motion.form>
              ) : (
                <motion.div 
                  key="success"
                  className="feedback-success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <div className="feedback-success-icon">
                    <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                  </div>
                  <h3 className="feature-title" style={{ marginBottom: '8px' }}>Thank You!</h3>
                  <p className="walkthrough-text">Your {feedbackType} has been received. We appreciate your support in making StreamBible better for everyone.</p>
                  <button 
                    onClick={() => { setSubmitted(false); setFeedbackText(''); }}
                    style={{ background: 'transparent', border: 'none', color: 'var(--accent)', marginTop: '16px', cursor: 'pointer', fontWeight: '600' }}
                  >
                    Submit another
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* FAQS */}
        <section>
          <h2 className="help-section-title">Frequently Asked Questions</h2>
          <div className="faqs-list">
            {faqs.map((faq, index) => (
              <div key={index} className={`faq-item ${openFaq === index ? 'is-open' : ''}`}>
                <button className="faq-question" onClick={() => setOpenFaq(openFaq === index ? null : index)}>
                  {faq.question}
                  <svg className="faq-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>
                <AnimatePresence>
                  {openFaq === index && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div className="faq-answer">{faq.answer}</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </section>
        
        <footer className="help-footer">
          StreamBible &copy; {new Date().getFullYear()}
        </footer>
      </main>
    </div>
  );
};

export default HelpPage;
