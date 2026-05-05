import React from 'react';

interface VerseTextProps {
  text: string;
  showVerseNumbers: boolean;
  isMultiVerse: boolean;
}

export const VerseText: React.FC<VerseTextProps> = ({ text, showVerseNumbers, isMultiVerse }) => {
  if (!text) return null;

  if (!showVerseNumbers || !isMultiVerse) {
    // Strip the markers securely, including any trailing space immediately after the marker
    return <>{text.replace(/\{\{v:\d+\}\}\s*/g, '')}</>;
  }

  // Parse the text into chunks, capturing the verse number
  const parts = text.split(/\{\{v:(\d+)\}\}/);
  
  return (
    <>
      {parts.map((part, index) => {
        // Odd indices correspond to the captured verse numbers
        if (index % 2 === 1) {
          return (
            <sup key={index} style={{ opacity: 0.6, fontSize: '0.6em', marginRight: '4px', fontWeight: 'bold' }}>
              {part}
            </sup>
          );
        }
        return <React.Fragment key={index}>{part}</React.Fragment>;
      })}
    </>
  );
};
