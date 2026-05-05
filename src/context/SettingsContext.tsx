import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { SETTINGS_KEYS } from '../pages/SettingsPage';

interface SettingsContextType {
  debounceEnabled: boolean;
  setDebounceEnabled: (val: boolean) => void;
  gatekeepDiscovery: boolean;
  setGatekeepDiscovery: (val: boolean) => void;
  pushConfirmEnabled: boolean;
  setPushConfirmEnabled: (val: boolean) => void;
  autoClearSeconds: number;
  setAutoClearSeconds: (val: number) => void;
  showVerseNumbers: boolean;
  setShowVerseNumbers: (val: boolean) => void;
}

const defaultSettings: SettingsContextType = {
  debounceEnabled: true,
  setDebounceEnabled: () => {},
  gatekeepDiscovery: false,
  setGatekeepDiscovery: () => {},
  pushConfirmEnabled: false,
  setPushConfirmEnabled: () => {},
  autoClearSeconds: 0,
  setAutoClearSeconds: () => {},
  showVerseNumbers: false,
  setShowVerseNumbers: () => {},
};

const SettingsContext = createContext<SettingsContextType>(defaultSettings);

// eslint-disable-next-line react-refresh/only-export-components
export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [debounceEnabled, setDebounceEnabledState] = useState(() =>
    localStorage.getItem(SETTINGS_KEYS.debounce) !== 'false'
  );
  const [gatekeepDiscovery, setGatekeepDiscoveryState] = useState(() =>
    localStorage.getItem(SETTINGS_KEYS.gatekeep) === 'true'
  );
  const [pushConfirmEnabled, setPushConfirmEnabledState] = useState(() =>
    localStorage.getItem(SETTINGS_KEYS.pushConfirm) === 'true'
  );
  const [autoClearSeconds, setAutoClearSecondsState] = useState(() =>
    parseInt(localStorage.getItem(SETTINGS_KEYS.autoClear) || '0', 10)
  );
  const [showVerseNumbers, setShowVerseNumbersState] = useState(() =>
    localStorage.getItem(SETTINGS_KEYS.verseNumbers) === 'true'
  );

  const setDebounceEnabled = (val: boolean) => {
    setDebounceEnabledState(val);
    localStorage.setItem(SETTINGS_KEYS.debounce, String(val));
  };

  const setGatekeepDiscovery = (val: boolean) => {
    setGatekeepDiscoveryState(val);
    localStorage.setItem(SETTINGS_KEYS.gatekeep, String(val));
  };

  const setPushConfirmEnabled = (val: boolean) => {
    setPushConfirmEnabledState(val);
    localStorage.setItem(SETTINGS_KEYS.pushConfirm, String(val));
  };

  const setAutoClearSeconds = (val: number) => {
    setAutoClearSecondsState(val);
    localStorage.setItem(SETTINGS_KEYS.autoClear, String(val));
  };

  const setShowVerseNumbers = (val: boolean) => {
    setShowVerseNumbersState(val);
    localStorage.setItem(SETTINGS_KEYS.verseNumbers, String(val));
  };

  return (
    <SettingsContext.Provider
      value={{
        debounceEnabled,
        setDebounceEnabled,
        gatekeepDiscovery,
        setGatekeepDiscovery,
        pushConfirmEnabled,
        setPushConfirmEnabled,
        autoClearSeconds,
        setAutoClearSeconds,
        showVerseNumbers,
        setShowVerseNumbers,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};
