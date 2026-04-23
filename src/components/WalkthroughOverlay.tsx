import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface TourStep {
  targetId: string;
  title: string;
  text: string;
  learnMoreLink?: string;
}

interface WalkthroughOverlayProps {
  steps: TourStep[];
  onComplete: () => void;
}

const WalkthroughOverlay: React.FC<WalkthroughOverlayProps> = ({ steps, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1000,
    height: typeof window !== 'undefined' ? window.innerHeight : 1000,
  });

  const updateRect = useCallback(() => {
    const step = steps[currentStep];
    if (!step) return;

    // Special case for centered welcome modal
    if (step.targetId === 'center-screen') {
      setTargetRect(null);
      return;
    }

    const el = document.getElementById(step.targetId);
    if (el) {
      // Scroll into view if needed. Check height of element vs viewport height
      const rawRect = el.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      
      if (rawRect.height > viewportHeight * 0.8) {
        // Taller than most of the screen, scroll to start so it doesn't cut off top
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      
      // Give time for scroll to finish, then measure
      setTimeout(() => {
        const rect = el.getBoundingClientRect();
        setTargetRect(rect);
      }, 300); // 300ms delay to wait for scroll
    } else {
      console.warn(`Tour target element '${step.targetId}' not found.`);
      setTargetRect(null);
    }
  }, [currentStep, steps]);

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
      updateRect();
    };

    updateRect();
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', updateRect);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', updateRect);
    };
  }, [updateRect]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const step = steps[currentStep];
  if (!step) return null;

  const isCentered = step.targetId === 'center-screen' || !targetRect;

  // Calculate SVG mask paths
  // We use a large path covering the screen, and subtract a rounded rect from it.
  const { width: windowWidth, height: windowHeight } = windowSize;
  
  // Padding around the target element
  const padding = 12;
  const radius = 16; // Corner radius for the cutout

  let maskPath = `M 0 0 H ${windowWidth} V ${windowHeight} H 0 Z`;
  let spotlightStyle = {};

  if (!isCentered && targetRect) {
    const x = targetRect.left - padding;
    const y = targetRect.top - padding;
    const w = targetRect.width + padding * 2;
    const h = targetRect.height + padding * 2;
    const r = radius;

    // Draw a rounded rectangle in the opposite direction to create a hole
    const cutout = `
      M ${x + r} ${y}
      h ${w - 2 * r}
      a ${r} ${r} 0 0 1 ${r} ${r}
      v ${h - 2 * r}
      a ${r} ${r} 0 0 1 -${r} ${r}
      h -${w - 2 * r}
      a ${r} ${r} 0 0 1 -${r} -${r}
      v -${h - 2 * r}
      a ${r} ${r} 0 0 1 ${r} -${r}
      Z
    `;
    
    // Combine the outer rect and the inner cutout
    maskPath = `M 0 0 H ${windowWidth} V ${windowHeight} H 0 Z ${cutout}`;

    // For the glowing border around the cutout
    spotlightStyle = {
      left: x,
      top: y,
      width: w,
      height: h,
      borderRadius: r,
    };
  }

  // Calculate Tooltip position
  let placement = 'center';
  let tooltipStyle: React.CSSProperties = {
    top: '50%',
    left: '50%',
    x: '-50%',
    y: '-50%',
  };

  // Arrow position relative to the tooltip
  let arrowStyle: React.CSSProperties = {};

  if (!isCentered && targetRect) {
    const spaceBelow = windowHeight - targetRect.bottom;
    const spaceAbove = targetRect.top;
    
    // We assume the tooltip is ~200px tall and 320px wide
    const tooltipWidth = 320;
    
    // Attempt to center the tooltip horizontally relative to the target
    let targetCenterX = targetRect.left + (targetRect.width / 2);
    // Clamp left so it doesn't overflow screen
    let leftPos = Math.max(16, Math.min(windowWidth - tooltipWidth - 16, targetCenterX - (tooltipWidth / 2)));
    
    // Calculate where the arrow should point (relative to the tooltip's left edge)
    let arrowLeft = targetCenterX - leftPos;
    // Clamp arrow so it doesn't stick out of the rounded corners
    arrowLeft = Math.max(24, Math.min(tooltipWidth - 24, arrowLeft));

    if (spaceBelow > 220 || spaceBelow > spaceAbove) {
      // Place below the element
      placement = 'bottom';
      tooltipStyle = {
        top: targetRect.bottom + padding + 16,
        left: leftPos,
        x: 0,
        y: 0,
      };
      arrowStyle = { left: arrowLeft, top: -6, transform: 'rotate(45deg)' };
    } else {
      // Place above the element
      placement = 'top';
      tooltipStyle = {
        top: targetRect.top - padding - 16,
        left: leftPos,
        x: 0,
        y: '-100%',
      };
      arrowStyle = { left: arrowLeft, bottom: -6, transform: 'rotate(45deg)' };
    }
  }

  // Animation values based on placement
  const initialY = placement === 'center' ? '-45%' : placement === 'top' ? 'calc(-100% + 10px)' : '10px';
  const animateY = placement === 'center' ? '-50%' : placement === 'top' ? '-100%' : '0px';

  return (
    <div className="walkthrough-overlay">
      {/* Background Mask */}
      <svg
        className="walkthrough-svg-mask"
        width="100%"
        height="100%"
        preserveAspectRatio="none"
      >
        <motion.path
          d={maskPath}
          fill="rgba(0, 0, 0, 0.65)"
          fillRule="evenodd"
          initial={{ d: `M 0 0 H ${windowWidth} V ${windowHeight} H 0 Z` }}
          animate={{ d: maskPath }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        />
      </svg>

      {/* Spotlight Glow Border */}
      <AnimatePresence>
        {!isCentered && targetRect && (
          <motion.div
            className="walkthrough-spotlight"
            initial={{ opacity: 0, ...spotlightStyle }}
            animate={{ opacity: 1, ...spotlightStyle }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          />
        )}
      </AnimatePresence>

      {/* Tooltip Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          className="walkthrough-tooltip"
          data-placement={placement}
          style={tooltipStyle}
          initial={{ opacity: 0, y: initialY, scale: 0.95 }}
          animate={{ opacity: 1, y: animateY, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', damping: 22, stiffness: 300 }}
        >
          {placement !== 'center' && (
            <div className="walkthrough-arrow" style={arrowStyle}></div>
          )}
          
          <div className="walkthrough-progress">
            Step {currentStep + 1} of {steps.length}
          </div>
          <h3 className="walkthrough-title">{step.title}</h3>
          <p className="walkthrough-text">{step.text}</p>
          
          <div className="walkthrough-actions">
            <button className="walkthrough-btn-skip" onClick={onComplete}>
              {currentStep === steps.length - 1 ? 'Close' : 'Skip Tour'}
            </button>
            <div style={{ display: 'flex', gap: '8px' }}>
              {step.learnMoreLink && (
                <button 
                  className="walkthrough-btn-learn" 
                  onClick={() => { window.location.href = step.learnMoreLink!; }}
                >
                  Learn More
                </button>
              )}
              {currentStep < steps.length - 1 && (
                <button className="walkthrough-btn-next" onClick={handleNext}>
                  Next
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default WalkthroughOverlay;
