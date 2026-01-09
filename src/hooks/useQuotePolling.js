/**
 * useQuotePolling Hook - Async quote status polling
 * 
 * Polls the quote status API at regular intervals until the quote
 * is complete (success/failed/timeout) or max duration is reached.
 * 
 * Flow:
 * 1. Submit quote request via quoteService.requestQuoteDirect()
 * 2. Get quoteId from response
 * 3. Use this hook to poll for status updates
 * 4. Hook calls onSuccess/onError/onTimeout when complete
 * 
 * @example
 * const { isPolling, status, startPolling, stopPolling } = useQuotePolling({
 *   onSuccess: (data) => setQuoteData(data),
 *   onError: (error) => setError(error),
 *   onTimeout: () => setError('Request timed out')
 * });
 * 
 * // Start polling when you have a quoteId
 * startPolling(quoteId);
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import quoteService from '../services/api/quoteService';

// Default configuration
const DEFAULT_POLL_INTERVAL = 5000;      // 5 seconds
const DEFAULT_MAX_DURATION = 300000;     // 5 minutes
const DEFAULT_MAX_ATTEMPTS = 60;         // 60 attempts = 5 min at 5s interval

/**
 * Quote status values
 */
export const QUOTE_STATUS = {
  IDLE: 'idle',           // Not started
  PENDING: 'pending',     // Request submitted, waiting to start
  PROCESSING: 'processing', // Fortus API call in progress
  SUCCESS: 'success',     // Quote completed successfully
  FAILED: 'failed',       // Quote request failed
  TIMEOUT: 'timeout',     // Max duration exceeded
  ERROR: 'error'          // Network/API error
};

/**
 * Custom hook for polling quote status
 * 
 * @param {Object} options - Configuration options
 * @param {number} options.interval - Poll interval in ms (default: 5000)
 * @param {number} options.maxDuration - Max polling duration in ms (default: 300000)
 * @param {Function} options.onSuccess - Callback when quote is successful
 * @param {Function} options.onError - Callback when quote fails
 * @param {Function} options.onTimeout - Callback when polling times out
 * @param {Function} options.onStatusChange - Callback on any status change
 */
export const useQuotePolling = (options = {}) => {
  const {
    interval = DEFAULT_POLL_INTERVAL,
    maxDuration = DEFAULT_MAX_DURATION,
    onSuccess,
    onError,
    onTimeout,
    onStatusChange
  } = options;

  // State
  const [status, setStatus] = useState(QUOTE_STATUS.IDLE);
  const [quoteData, setQuoteData] = useState(null);
  const [error, setError] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const [isPolling, setIsPolling] = useState(false);

  // Refs for cleanup and state access in callbacks
  const pollIntervalRef = useRef(null);
  const startTimeRef = useRef(null);
  const quoteIdRef = useRef(null);
  const isMountedRef = useRef(true);
  const maxAttempts = Math.ceil(maxDuration / interval);

  /**
   * Update status and notify
   */
  const updateStatus = useCallback((newStatus, data = null, errorMsg = null) => {
    if (!isMountedRef.current) return;
    
    setStatus(newStatus);
    if (data) setQuoteData(data);
    if (errorMsg) setError(errorMsg);
    
    onStatusChange?.(newStatus, data, errorMsg);
  }, [onStatusChange]);

  /**
   * Stop polling and cleanup
   */
  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    setIsPolling(false);
  }, []);

  /**
   * Perform a single poll request
   */
  const poll = useCallback(async () => {
    if (!isMountedRef.current || !quoteIdRef.current) return;

    const quoteId = quoteIdRef.current;
    const elapsed = Date.now() - startTimeRef.current;
    
    // Check if max duration exceeded
    if (elapsed >= maxDuration) {
      stopPolling();
      updateStatus(QUOTE_STATUS.TIMEOUT);
      onTimeout?.();
      return;
    }

    try {
      setAttempts(prev => prev + 1);
      
      const result = await quoteService.checkQuoteStatus(quoteId);
      
      if (!isMountedRef.current) return;

      if (!result.success) {
        // API returned an error response
        stopPolling();
        const errorMessage = result.message || 'Failed to check quote status';
        updateStatus(QUOTE_STATUS.ERROR, null, errorMessage);
        onError?.(errorMessage);
        return;
      }

      const quoteStatus = result.status;
      
      // Update status for UI
      if (quoteStatus === 'pending') {
        updateStatus(QUOTE_STATUS.PENDING, result);
      } else if (quoteStatus === 'processing') {
        updateStatus(QUOTE_STATUS.PROCESSING, result);
      } else if (quoteStatus === 'success') {
        // Quote completed successfully
        stopPolling();
        updateStatus(QUOTE_STATUS.SUCCESS, result);
        onSuccess?.(result);
      } else if (quoteStatus === 'failed') {
        // Quote request failed
        stopPolling();
        const errorMessage = result.error || result.errorMessage || 'Quote request failed';
        updateStatus(QUOTE_STATUS.FAILED, result, errorMessage);
        onError?.(errorMessage, result);
      } else if (quoteStatus === 'timeout') {
        // Server-side timeout
        stopPolling();
        updateStatus(QUOTE_STATUS.TIMEOUT, result);
        onTimeout?.();
      }

    } catch (err) {
      console.error('[useQuotePolling] Poll error:', err);
      
      if (!isMountedRef.current) return;
      
      // Don't stop polling on transient network errors
      // But count them and stop if too many consecutive errors
      if (attempts >= maxAttempts) {
        stopPolling();
        const errorMessage = err.message || 'Failed to check quote status';
        updateStatus(QUOTE_STATUS.ERROR, null, errorMessage);
        onError?.(errorMessage);
      }
    }
  }, [maxDuration, maxAttempts, attempts, stopPolling, updateStatus, onSuccess, onError, onTimeout]);

  /**
   * Start polling for a quote
   * @param {string} quoteId - The quote ID to poll for
   */
  const startPolling = useCallback((quoteId) => {
    if (!quoteId) {
      console.error('[useQuotePolling] quoteId is required');
      return;
    }

    // Stop any existing polling
    stopPolling();

    // Reset state
    quoteIdRef.current = quoteId;
    startTimeRef.current = Date.now();
    setAttempts(0);
    setError(null);
    setQuoteData(null);
    setIsPolling(true);
    updateStatus(QUOTE_STATUS.PENDING);

    console.log('[useQuotePolling] Starting poll for quoteId:', quoteId);

    // Initial poll immediately
    poll();

    // Set up interval for subsequent polls
    pollIntervalRef.current = setInterval(poll, interval);
  }, [interval, poll, stopPolling, updateStatus]);

  /**
   * Reset to initial state
   */
  const reset = useCallback(() => {
    stopPolling();
    quoteIdRef.current = null;
    startTimeRef.current = null;
    setStatus(QUOTE_STATUS.IDLE);
    setQuoteData(null);
    setError(null);
    setAttempts(0);
  }, [stopPolling]);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    
    return () => {
      isMountedRef.current = false;
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  return {
    // State
    status,
    quoteData,
    error,
    attempts,
    isPolling,
    
    // Computed
    isComplete: [QUOTE_STATUS.SUCCESS, QUOTE_STATUS.FAILED, QUOTE_STATUS.TIMEOUT, QUOTE_STATUS.ERROR].includes(status),
    isSuccess: status === QUOTE_STATUS.SUCCESS,
    isFailed: status === QUOTE_STATUS.FAILED,
    isTimeout: status === QUOTE_STATUS.TIMEOUT,
    
    // Actions
    startPolling,
    stopPolling,
    reset,
    
    // Constants (for UI)
    QUOTE_STATUS
  };
};

export default useQuotePolling;
