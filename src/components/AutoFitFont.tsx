import React, { useEffect, useRef, useState } from 'react';

interface AutoFitFontProps {
  children: React.ReactNode;
  dependencies: unknown[];
}

export const AutoFitFont: React.FC<AutoFitFontProps> = ({ children, dependencies }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [scaleFactor, setScaleFactor] = useState(1);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const content = contentRef.current;
    if (!wrapper || !content) return;

    const calculateFit = () => {
      // Get the maximum allowed height from the wrapper
      const maxHeight = wrapper.clientHeight;
      if (maxHeight === 0) return;

      let min = 0.2;
      let max = 1.0;
      let best = 0.2;

      const testScale = (factor: number) => {
        content.style.setProperty('--font-scale', factor.toString());
        return content.scrollHeight <= maxHeight;
      };

      // If it fits perfectly at scale 1.0, we're done
      if (testScale(1.0)) {
        setScaleFactor(1.0);
        return;
      }

      // Binary search for the optimal font scale to prevent text clipping
      for (let i = 0; i < 10; i++) {
        const mid = (min + max) / 2;
        if (testScale(mid)) {
          best = mid;
          min = mid;
        } else {
          max = mid;
        }
      }

      setScaleFactor(best);
      content.style.setProperty('--font-scale', best.toString());
    };

    // Calculate once when content changes
    calculateFit();

    // Recalculate if the browser window or container resizes
    const observer = new ResizeObserver(() => calculateFit());
    observer.observe(wrapper);
    
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies); // Re-run when dependencies (like verse content) change

  return (
    <div 
      ref={wrapperRef}
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden' // Ensure nothing leaks out
      }}
    >
      <div 
        ref={contentRef}
        style={{
          width: '100%',
          textAlign: 'center',
          '--font-scale': scaleFactor
        } as React.CSSProperties}
      >
        {children}
      </div>
    </div>
  );
};
