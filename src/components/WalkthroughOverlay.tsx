import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SplitSquareHorizontal, Tv, Sparkles, ChevronRight, X } from 'lucide-react';

export interface TourStep {
  id: string;
  title: string;
  text: string;
}

interface WalkthroughOverlayProps {
  steps: TourStep[];
  onComplete: () => void;
}

const WalkthroughOverlay: React.FC<WalkthroughOverlayProps> = ({ steps, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const step = steps[currentStep];
  if (!step) return null;

  // Render specific icon based on step ID
  const renderGraphic = (id: string) => {
    switch (id) {
      case 'welcome':
        return (
          <div style={{ width: '80px', height: '80px', borderRadius: 'var(--r-2xl)', background: 'linear-gradient(135deg, var(--bg-elevated) 0%, var(--bg-body) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-bright)', boxShadow: 'var(--shadow-lg)' }}>
             <Sparkles size={36} color="var(--accent)" />
          </div>
        );
      case 'search':
        return (
          <div style={{ width: '80px', height: '80px', borderRadius: 'var(--r-2xl)', background: 'linear-gradient(135deg, var(--bg-elevated) 0%, var(--bg-body) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-bright)', boxShadow: 'var(--shadow-lg)' }}>
             <Search size={36} color="var(--accent)" />
          </div>
        );
      case 'preview':
        return (
          <div style={{ width: '80px', height: '80px', borderRadius: 'var(--r-2xl)', background: 'linear-gradient(135deg, var(--bg-elevated) 0%, var(--bg-body) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-bright)', boxShadow: 'var(--shadow-lg)' }}>
             <SplitSquareHorizontal size={36} color="var(--accent)" />
          </div>
        );
      case 'broadcast':
        return (
          <div style={{ width: '80px', height: '80px', borderRadius: 'var(--r-2xl)', background: 'linear-gradient(135deg, var(--bg-elevated) 0%, var(--bg-body) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-bright)', boxShadow: 'var(--shadow-lg)' }}>
             <Tv size={36} color="var(--accent)" />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
    }}>
      {/* Background Dimmer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
        style={{
          position: 'absolute', inset: 0, background: 'rgba(0, 0, 0, 0.65)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)'
        }}
        onClick={onComplete}
      />

      {/* Modal Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: '420px',
            background: 'var(--bg-card)',
            backdropFilter: 'blur(40px) saturate(200%)',
            WebkitBackdropFilter: 'blur(40px) saturate(200%)',
            border: '1px solid var(--border-bright)',
            borderRadius: 'var(--r-2xl)',
            boxShadow: 'var(--shadow-xl)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button 
            onClick={onComplete}
            style={{ position: 'absolute', top: '16px', right: '16px', background: 'var(--bg-elevated)', border: '1px solid var(--border-dim)', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-2)', cursor: 'pointer', zIndex: 10, transition: 'background 0.2s' }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-body)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'var(--bg-elevated)'}
          >
            <X size={16} />
          </button>

          {/* Graphic Area */}
          <div style={{ padding: '48px 32px 24px', display: 'flex', justifyContent: 'center' }}>
            {renderGraphic(step.id)}
          </div>

          {/* Content Area */}
          <div style={{ padding: '0 32px', textAlign: 'center' }}>
            <h3 style={{ margin: '0 0 12px', fontSize: 'var(--fs-xl)', fontWeight: 600, color: 'var(--text-1)', letterSpacing: '-0.02em' }}>
              {step.title}
            </h3>
            <p style={{ margin: 0, fontSize: 'var(--fs-base)', color: 'var(--text-2)', lineHeight: 1.6 }}>
              {step.text}
            </p>
          </div>

          {/* Footer Area */}
          <div style={{ padding: '32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '16px' }}>
            
            {/* Dots */}
            <div style={{ display: 'flex', gap: '8px' }}>
              {steps.map((_, i) => (
                <div key={i} style={{
                  width: '6px', height: '6px', borderRadius: '50%',
                  background: i === currentStep ? 'var(--text-1)' : 'var(--border-bright)',
                  transition: 'background 0.3s'
                }} />
              ))}
            </div>

            {/* Action Button */}
            <button 
              onClick={handleNext}
              style={{
                background: 'var(--text-1)', color: 'var(--bg-body)', border: 'none', borderRadius: 'var(--r-full)',
                padding: '10px 20px', fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px',
                cursor: 'pointer', transition: 'transform 0.1s, opacity 0.2s', boxShadow: 'var(--shadow-sm)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.96)'}
              onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              {currentStep === steps.length - 1 ? 'Get Started' : 'Continue'}
              {currentStep < steps.length - 1 && <ChevronRight size={16} />}
            </button>
          </div>

        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default WalkthroughOverlay;
