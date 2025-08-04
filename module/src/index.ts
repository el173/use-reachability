import { useEffect, useRef, useState } from 'react';

let isCheckingHealth = false;

export interface UseReachabilityOptions {
  healthCheckUrl: string;
  healthCheckInterval?: number;
  onStatusChange?: (status: boolean) => void;
  axiosInstance?: any;
  maxRetries?: number;
  initialRetryDelay?: number;
  healthCheckTimeout?: number;
  enableBrowserEvents?: boolean; // for React Web
}

export const useReachability = ({
  healthCheckUrl,
  healthCheckInterval = 30000,
  onStatusChange,
  axiosInstance,
  maxRetries = 3,
  initialRetryDelay = 1000,
  healthCheckTimeout = 15000,
  enableBrowserEvents = false,
}: UseReachabilityOptions): boolean | undefined => {
  const [isOnline, setIsOnline] = useState<boolean | undefined>(undefined);
  const prevIsOnlineRef = useRef<'initial' | boolean>('initial');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') {
      // SSR or Server Component in Next.js
      return;
    }

    let abortController: AbortController | null = null;

    const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

    const fetchWithTimeout = async () => {
      if (axiosInstance) {
        return axiosInstance.get(healthCheckUrl, { timeout: healthCheckTimeout });
      } else {
        abortController = new AbortController();
        const id = setTimeout(() => abortController?.abort(), healthCheckTimeout);
        try {
          const res = await fetch(healthCheckUrl, {
            signal: abortController.signal,
          });
          clearTimeout(id);
          const json = await res.json();
          return { status: res.status, data: json };
        } catch (err) {
          clearTimeout(id);
          throw err;
        }
      }
    };

    const retryCheck = async (): Promise<boolean> => {
      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          const response = await fetchWithTimeout();
          if (
            response.status === 200
          ) {
            return true;
          }
        } catch {
          // silent retry
        }
        if (attempt < maxRetries) {
          await delay(initialRetryDelay * 2 ** attempt);
        }
      }
      return false;
    };

    const checkReachability = async () => {
      if (isCheckingHealth) return;
      isCheckingHealth = true;

      try {
        const isReachable = await retryCheck();
        if (prevIsOnlineRef.current !== isReachable) {
          prevIsOnlineRef.current = isReachable;
          setIsOnline(isReachable);
          onStatusChange?.(isReachable);
        }
      } finally {
        isCheckingHealth = false;
      }
    };

    // Initial call
    checkReachability();

    // Interval health check
    intervalRef.current = setInterval(checkReachability, healthCheckInterval);

    // Optional browser events
    const handleOnline = () => checkReachability();
    if (enableBrowserEvents && typeof window !== 'undefined' && window.addEventListener) {
      window.addEventListener('online', handleOnline);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      abortController?.abort();
      if (enableBrowserEvents && typeof window !== 'undefined') {
        window.removeEventListener('online', handleOnline);
      }
    };
  }, [
    healthCheckUrl,
    healthCheckInterval,
    axiosInstance,
    maxRetries,
    initialRetryDelay,
    healthCheckTimeout,
    onStatusChange,
    enableBrowserEvents,
  ]);

  return isOnline;
};

export default useReachability;
