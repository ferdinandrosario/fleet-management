import React, { createContext, useContext, useEffect, useState } from 'react';

export type FontScale = 'sm' | 'md' | 'lg' | 'xl';

interface FontSizeContextType {
  fontSize: FontScale;
  setFontSize: (size: FontScale) => void;
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
  resetFontSize: () => void;
}

const FontSizeContext = createContext<FontSizeContextType | undefined>(undefined);

const SCALE_ORDER: FontScale[] = ['sm', 'md', 'lg', 'xl'];

export const FontSizeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [fontSize, setFontSizeState] = useState<FontScale>(() => {
    const saved = localStorage.getItem('fm_font_size') as FontScale;
    return saved && SCALE_ORDER.includes(saved) ? saved : 'md';
  });

  useEffect(() => {
    localStorage.setItem('fm_font_size', fontSize);
    const root = document.documentElement;
    root.classList.remove('font-sm', 'font-md', 'font-lg', 'font-xl');
    root.classList.add(`font-${fontSize}`);
  }, [fontSize]);

  const increaseFontSize = () => {
    const currentIndex = SCALE_ORDER.indexOf(fontSize);
    if (currentIndex < SCALE_ORDER.length - 1) {
      setFontSizeState(SCALE_ORDER[currentIndex + 1]);
    }
  };

  const decreaseFontSize = () => {
    const currentIndex = SCALE_ORDER.indexOf(fontSize);
    if (currentIndex > 0) {
      setFontSizeState(SCALE_ORDER[currentIndex - 1]);
    }
  };

  const resetFontSize = () => {
    setFontSizeState('md');
  };

  return (
    <FontSizeContext.Provider
      value={{
        fontSize,
        setFontSize: setFontSizeState,
        increaseFontSize,
        decreaseFontSize,
        resetFontSize,
      }}
    >
      {children}
    </FontSizeContext.Provider>
  );
};

export const useFontSize = () => {
  const context = useContext(FontSizeContext);
  if (!context) {
    throw new Error('useFontSize must be used within a FontSizeProvider');
  }
  return context;
};
