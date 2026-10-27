import { useEffect, useState } from 'react';

export function useOnlineStatus() {
  const [browserOnline, setBrowserOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [forceOffline, setForceOffline] = useState(() => {
    try {
      return localStorage.getItem('omni_force_offline') === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const handleOnline = () => setBrowserOnline(true);
    const handleOffline = () => setBrowserOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const toggleForceOffline = (val?: boolean) => {
    const nextVal = val !== undefined ? val : !forceOffline;
    setForceOffline(nextVal);
    try {
      localStorage.setItem('omni_force_offline', String(nextVal));
    } catch {
      // ignore
    }
  };

  const isOnline = browserOnline && !forceOffline;

  return {
    isOnline,
    browserOnline,
    forceOffline,
    toggleForceOffline,
  };
}
