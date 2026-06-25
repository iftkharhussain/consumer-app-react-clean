/**
 * useQuotedProducts
 *
 * Fetches the signed-in user's products and returns those with a COMPLETED quote
 * (quoteStatus === 'success'). The "Other products" banner uses this to hide cards
 * for products the user has already quoted.
 *
 * Fails open: on error / not authenticated, returns an empty list so the banner
 * shows all products rather than hiding everything.
 */

import { useState, useEffect } from 'react';
import quoteService from '../services/api/quoteService';

export const useQuotedProducts = () => {
  const [quotedProducts, setQuotedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const res = await quoteService.getUserProducts();
        if (!active) return;
        const products = (res?.products || []).filter((p) => p.quoteStatus === 'success');
        setQuotedProducts(products);
      } catch (err) {
        // Fail open — never hide cards because the lookup failed.
        if (active) setQuotedProducts([]);
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  return { quotedProducts, loading };
};

export default useQuotedProducts;
