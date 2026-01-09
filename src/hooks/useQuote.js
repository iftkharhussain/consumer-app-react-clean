/**
 * useQuote Hook - Simplified quote fetching with async polling
 * 
 * Async Polling Flow (Jan 2026):
 * 1. Calls /api/quote/fetch which requests quote from LMS
 * 2. LMS returns immediately with quoteId (status: 'pending')
 * 3. Hook polls /api/quote/poll/:quoteId every 5 seconds
 * 4. When status becomes 'success'/'failed'/'timeout', polling stops
 * 
 * Quote Statuses:
 * - pending: Quote request submitted, waiting to start
 * - processing: LMS is fetching from insurers
 * - success: Quote completed with carrier data
 * - failed: Quote request failed
 * - timeout: Quote timed out (5 min max)
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import quoteService from '../services/api/quoteService';

// Polling configuration
const POLL_INTERVAL = 5000;       // 5 seconds (matches LMS async flow)
const MAX_POLL_DURATION = 300000; // 5 minutes max
const MAX_POLL_ATTEMPTS = 60;     // 60 * 5s = 5 minutes

/**
 * Custom hook for quote management with async polling
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
  const [quoteId, setQuoteId] = useState(null);
  const [isAuthed, setIsAuthed] = useState(true);
  const [pollAttempts, setPollAttempts] = useState(0);

  // Refs for cleanup
  const pollTimeoutRef = useRef(null);
  const pollStartTimeRef = useRef(null);
  const isMountedRef = useRef(true);
  const hasInitialFetchRef = useRef(false);

  /**
   * Poll quote status by quoteId
   */
  const pollQuoteStatus = useCallback(async (qId) => {
    if (!qId || !isMountedRef.current) return;

    // Check if max poll duration exceeded
    if (pollStartTimeRef.current) {
      const elapsed = Date.now() - pollStartTimeRef.current;
      if (elapsed >= MAX_POLL_DURATION) {
        setQuoteStatus('timeout');
        setError('Quote request timed out. Please try again.');
        setLoading(false);
        return;
      }
    }

    try {
      const response = await quoteService.checkQuoteStatus(qId);

      if (!isMountedRef.current) return;

      if (response.success) {
        const status = response.status;
        setQuoteStatus(status);

        // If complete, update quote data
        if (['success', 'failed', 'timeout'].includes(status)) {
          if (status === 'success') {
            console.log('[useQuote] Quote success! Setting quote data:', {
              carriersCount: response.carriers?.length || 0,
              carriers: response.carriers?.map(c => ({
                code: c.carrierCode,
                name: c.carrierName,
                status: c.status,
                premium: c.premium
              }))
            });
            setQuoteData({
              id: response.quoteId,
              carriers: response.carriers || [],
              carriersCount: response.carriersCount || response.carriers?.length || 0,
              responseTime: response.responseTime,
              createdAt: response.createdAt
            });
          } else if (status === 'failed') {
            setError(response.error || response.errorMessage || 'Quote request failed');
          }
          setLoading(false);
          return; // Stop polling
        }

        // Continue polling for pending/processing
        setPollAttempts(prev => prev + 1);
      } else {
        setQuoteStatus('error');
        setError(response.message || 'Failed to check quote status');
        setLoading(false);
      }
    } catch (err) {
      console.error('[useQuote] Poll error:', err);

      if (!isMountedRef.current) return;

      // Don't stop polling on transient errors, but count them
      if (pollAttempts >= MAX_POLL_ATTEMPTS) {
        setQuoteStatus('error');
        setError('Quote status check failed. Please try again.');
        setLoading(false);
      } else {
        setPollAttempts(prev => prev + 1);
      }
    }
  }, [pollAttempts]);

  /**
   * Fetch quote - initial API call that triggers LMS quote request
   * Returns immediately with quoteId for polling
   */
  const fetchQuote = useCallback(async (isPoll = false) => {
    if (!productSlug) {
      return;
    }

    if (!isPoll) {
      setLoading(true);
      setError(null);
      setQuoteId(null);
      setPollAttempts(0);
      pollStartTimeRef.current = null;
    }

    try {
      const response = await quoteService.fetchQuote(productSlug);

      if (!isMountedRef.current) return;

      if (response.success) {
        // Check if we got a quoteId for polling (new async flow)
        if (response.quoteId && ['pending', 'processing', 'fetching'].includes(response.quoteStatus || response.status)) {
          console.log('[useQuote] Starting async polling flow:', {
            quoteId: response.quoteId,
            status: response.quoteStatus || response.status,
            leadId: response.leadId
          });
          setQuoteId(response.quoteId);
          setQuoteStatus(response.quoteStatus || response.status || 'pending');
          pollStartTimeRef.current = Date.now();
          // Polling will be triggered by useEffect watching quoteStatus
        } else {
          // Quote already exists (success) or failed
          console.log('[useQuote] Got immediate quote result:', {
            status: response.quoteStatus,
            hasQuote: !!response.quote,
            carriersCount: response.quote?.carriers?.length || 0
          });
          setQuoteStatus(response.quoteStatus || 'success');
          setQuoteData(response.quote || null);
          setLoading(false);
        }

        return response;
      } else {
        // API returned success: false
        setQuoteStatus(response.quoteStatus || 'failed');
        setError(response.message || 'Failed to fetch quote');
        setQuoteData(null);
        setLoading(false);
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
      setLoading(false);
    }
  }, [productSlug]);

  /**
   * Refresh quote data - force new quote request
   */
  const refresh = useCallback(async () => {
    setPollAttempts(0);
    setQuoteId(null);
    pollStartTimeRef.current = null;
    hasInitialFetchRef.current = true;
    await fetchQuote();
  }, [fetchQuote]);

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch && productSlug && !hasInitialFetchRef.current) {
      hasInitialFetchRef.current = true;
      fetchQuote();
    }
  }, [productSlug, autoFetch]); // eslint-disable-line react-hooks/exhaustive-deps

  // Polling effect - poll when status is 'pending' or 'processing' or 'fetching'
  useEffect(() => {
    // Clear any existing timeout
    if (pollTimeoutRef.current) {
      clearTimeout(pollTimeoutRef.current);
      pollTimeoutRef.current = null;
    }

    const shouldPoll = ['pending', 'processing', 'fetching'].includes(quoteStatus) && 
                       quoteId && 
                       pollAttempts < MAX_POLL_ATTEMPTS;

    if (shouldPoll) {
      pollTimeoutRef.current = setTimeout(async () => {
        if (isMountedRef.current) {
          await pollQuoteStatus(quoteId);
        }
      }, POLL_INTERVAL);
    } else if (pollAttempts >= MAX_POLL_ATTEMPTS && ['pending', 'processing', 'fetching'].includes(quoteStatus)) {
      setQuoteStatus('timeout');
      setError('Quote fetch timed out. Please try again.');
      setLoading(false);
    }

    return () => {
      if (pollTimeoutRef.current) {
        clearTimeout(pollTimeoutRef.current);
      }
    };
  }, [quoteStatus, quoteId, pollAttempts, pollQuoteStatus]);

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
    quoteId,

    // Computed
    isLoading: loading || ['pending', 'processing', 'fetching'].includes(quoteStatus),
    hasQuote: quoteStatus === 'success',
    isPending: ['pending', 'processing', 'fetching'].includes(quoteStatus),
    hasFailed: ['failed', 'error', 'not_found', 'timeout'].includes(quoteStatus),
    isAuthenticated: isAuthed,
    showFallback: !isAuthed || ['unauthenticated', 'not_found', 'error'].includes(quoteStatus),

    // Actions
    fetchQuote,
    refresh,
  };
};

export default useQuote;

