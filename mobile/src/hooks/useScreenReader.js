// mobile/src/hooks/useScreenReader.js
import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

export const useScreenReader = () => {
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      const status = await AccessibilityInfo.isScreenReaderEnabled();
      setIsEnabled(status);
    };
    checkStatus();
  }, []);

  return isEnabled;
};