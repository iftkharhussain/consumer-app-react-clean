/**
 * useQuote Hook - Simplified quote fetching
 * 
 * Single API call approach:
 * - Calls /api/quote/fetch which handles everything server-side
 * - Returns quote if exists, or fetches from LMS if not
 */

import { useState, useEffect, useCallback } from 'react';
import quoteService from '../services/api/quoteService';

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

  /**
   * Fetch quote - single API call that handles everything
   * The server will:
   * 1. Find user's product
   * 2. Check if quote exists (return it)
   * 3. If not, request from LMS and return result
   */
  const fetchQuote = useCallback(async () => {
    if (!productSlug) {
      console.log('[useQuote] No productSlug, skipping fetch');
      return;
    }
    
    console.log('[useQuote] Fetching quote for:', productSlug);
    setLoading(true);
    setError(null);
    
    try {
      const response = await quoteService.fetchQuote(productSlug);
      console.log('[useQuote] Response:', response);
      
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
      setLoading(false);
    }
  }, [productSlug]);

  /**
   * Refresh quote data
   */
  const refresh = useCallback(async () => {
    await fetchQuote();
  }, [fetchQuote]);

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch && productSlug) {
      console.log('[useQuote] Auto-fetching quote...');
      fetchQuote();
    }
  }, [productSlug, autoFetch]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    // State
    loading,
    error,
    quoteStatus,
    quoteData,
    
    // Computed
    isLoading: loading,
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
