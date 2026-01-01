/**
 * useQuote Hook - Simplified quote fetching with polling
 * 
 * Single API call approach:
 * - Calls /api/quote/fetch which handles everything server-side
 * - Returns quote if exists, or fetches from LMS if not
 * - Polls when status is 'fetching' until quote is ready
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import quoteService from '../services/api/quoteService';

// Polling interval in milliseconds
const POLL_INTERVAL = 3000;
const MAX_POLL_ATTEMPTS = 60; // Max 3 minutes of polling (60 * 3s)

/**
 * Custom hook for quote management
 * @param {string} productSlug - Product slug (e.g., 'car-insurance')
 * @param {Object} options - Hook options
 * @param {boolean} options.autoFetch - Auto fetch on mount (default: true)
 */
export const useQuote = (productSlug, options = {}) => {
  const { autoFetch = true } = options;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [quoteStatus, setQuoteStatus] = useState(null);
  const [quoteData, setQuoteData] = useState(null);
  const [isAuthed, setIsAuthed] = useState(true);
  const [pollAttempts, setPollAttempts] = useState(0);

  // Refs for cleanup
  const pollTimeoutRef = useRef(null);
  const isMountedRef = useRef(true);

  /**
   * Fetch quote - single API call that handles everything
   * The server will:
   * 1. Find user's product
   * 2. Check if quote exists (return it)
   * 3. If not, request from LMS and return result
   */
  const fetchQuote = useCallback(async (isPoll = false) => {
    if (!productSlug) {
      return;
    }

    if (!isPoll) {
      setLoading(true);
      setError(null);
    }

    try {
      const response = await quoteService.fetchQuote(productSlug);

      if (!isMountedRef.current) return;

      if (response.success) {
        setQuoteStatus(response.quoteStatus || 'success');
        setQuoteData(response.quote || null);

        return response;
      } else {
        // API returned success: false
        setQuoteStatus(response.quoteStatus || 'failed');
        setError(response.message || 'Failed to fetch quote');
        setQuoteData(null);
      }
    } catch (err) {
      console.error('[useQuote] Error:', err);

      if (!isMountedRef.current) return;

      if (err.response?.status === 401) {
        setQuoteStatus('unauthenticated');
        setIsAuthed(false);
      } else if (err.response?.status === 404) {
        setQuoteStatus('not_found');
        setError('Product not found');
      } else {
        setQuoteStatus('error');
        setError(err.response?.data?.message || err.message || 'Failed to fetch quote');
      }
    } finally {
      if (isMountedRef.current && !isPoll) {
        setLoading(false);
      }
    }
  }, [productSlug]);

  /**
   * Refresh quote data
   */
  const refresh = useCallback(async () => {
    setPollAttempts(0);
    await fetchQuote();
  }, [fetchQuote]);

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch && productSlug) {
      fetchQuote();
    }
  }, [productSlug, autoFetch]); // eslint-disable-line react-hooks/exhaustive-deps

  // Polling effect - poll when status is 'fetching'
  useEffect(() => {
    // Clear any existing timeout
    if (pollTimeoutRef.current) {
      clearTimeout(pollTimeoutRef.current);
      pollTimeoutRef.current = null;
    }

    // Start polling if status is 'fetching' and under max attempts
    if (quoteStatus === 'fetching' && pollAttempts < MAX_POLL_ATTEMPTS) {

      pollTimeoutRef.current = setTimeout(async () => {
        if (isMountedRef.current) {
          setPollAttempts(prev => prev + 1);
          await fetchQuote(true); // Pass true to indicate this is a poll
        }
      }, POLL_INTERVAL);
    } else if (pollAttempts >= MAX_POLL_ATTEMPTS && quoteStatus === 'fetching') {
      setQuoteStatus('error');
      setError('Quote fetch timed out. Please try again.');
      setLoading(false);
    }

    return () => {
      if (pollTimeoutRef.current) {
        clearTimeout(pollTimeoutRef.current);
      }
    };
  }, [quoteStatus, pollAttempts, fetchQuote]);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (pollTimeoutRef.current) {
        clearTimeout(pollTimeoutRef.current);
      }
    };
  }, []);

  return {
    // State
    loading,
    error,
    quoteStatus,
    quoteData,

    // Computed
    isLoading: loading || quoteStatus === 'fetching',
    hasQuote: quoteStatus === 'success',
    isPending: quoteStatus === 'fetching',
    hasFailed: quoteStatus === 'failed' || quoteStatus === 'error' || quoteStatus === 'not_found',
    isAuthenticated: isAuthed,
    showFallback: !isAuthed || quoteStatus === 'unauthenticated' || quoteStatus === 'not_found' || quoteStatus === 'error',

    // Actions
    fetchQuote,
    refresh,
  };
};

export default useQuote;

