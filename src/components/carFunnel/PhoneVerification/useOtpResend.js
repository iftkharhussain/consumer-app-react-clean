/* eslint-disable */
import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for managing OTP resend functionality
 * @param {Object} options - Configuration options
 * @param {number} options.initialDelay - Initial delay before countdown starts (default: 5)
 * @param {number} options.countdownDuration - Duration of countdown in seconds (default: 30)
 * @param {number} options.maxAttempts - Maximum number of resend attempts (default: 5)
 * @returns {Object} - Hook state and methods
 */
export function useOtpResend({
  initialDelay = 5,
  countdownDuration = 30,
  maxAttempts = 5
} = {}) {
  const [canResend, setCanResend] = useState(false);
  const [countdown, setCountdown] = useState(countdownDuration);
  const [attempts, setAttempts] = useState(0);

  const resetCountdown = useCallback(() => {
    setCountdown(countdownDuration);
    setCanResend(false);
  }, [countdownDuration]);

  const handleResend = useCallback(() => {
    if (attempts < maxAttempts) {
      setAttempts((prev) => prev + 1);
      resetCountdown();
      return true;
    }
    return false;
  }, [attempts, maxAttempts, resetCountdown]);

  const startCountdown = useCallback(() => {
    resetCountdown();
  }, [resetCountdown]);

  // Countdown timer effect
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
    } else if (countdown === 0) {
      setCanResend(true);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  // Initial delay effect
  useEffect(() => {
    const initialTimer = setTimeout(() => resetCountdown(), initialDelay * 1000);
    return () => clearTimeout(initialTimer);
  }, [initialDelay, resetCountdown]);

  // Reset state
  const reset = useCallback(() => {
    setCanResend(false);
    setCountdown(countdownDuration);
    setAttempts(0);
  }, [countdownDuration]);

  return {
    canResend,
    countdown,
    handleResend,
    startCountdown,
    attempts,
    maxAttempts,
    hasReachedMaxAttempts: attempts >= maxAttempts,
    reset
  };
}

export default useOtpResend;
