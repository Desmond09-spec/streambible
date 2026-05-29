import React, { useEffect } from 'react';

interface FumsExecutorProps {
  fumsToken?: string;
}

export const FumsExecutor: React.FC<FumsExecutorProps> = ({ fumsToken }) => {
  useEffect(() => {
    if (!fumsToken) return;

    // Extract the content inside the <script> tags
    const match = fumsToken.match(/<script.*?>(.*?)<\/script>/s);
    if (match && match[1]) {
      const scriptContent = match[1];
      try {
        const script = document.createElement('script');
        script.text = scriptContent;
        document.body.appendChild(script);
        
        return () => {
          document.body.removeChild(script);
        };
      } catch (err) {
        console.error("FUMS execution error:", err);
      }
    }
  }, [fumsToken]);

  return null;
};
