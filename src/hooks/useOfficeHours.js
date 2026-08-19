import { useEffect, useState } from 'react';
import { getOfficeHours } from '../services/api/fortusService';
import { setBusinessHours } from '../utils/businessHours';

/**
 * Fetches the advisor's office hours from the LMS and loads them into
 * businessHours.js, so getFullSchedule() / isOpenNow() / getFormattedTodayHours()
 * return the real configured values instead of the hardcoded fallback.
 *
 * Returns `loaded` - reading it in a component guarantees a re-render once the
 * hours arrive, since businessHours.js holds them outside of React state.
 *
 * @param {Object} params - { userProductId } or { productSlug }
 */
export const useOfficeHours = (params) => {
  const [loaded, setLoaded] = useState(false);

  const userProductId = params?.userProductId;
  const productSlug = params?.productSlug;

  useEffect(() => {
    if (!userProductId && !productSlug) return;

    let cancelled = false;

    getOfficeHours(userProductId ? { userProductId } : { productSlug })
      .then((res) => {
        if (cancelled) return;
        setBusinessHours(res?.data?.officeHours);
        setLoaded(true);
      })
      .catch(() => {
        if (!cancelled) setLoaded(true);
      });

    return () => { cancelled = true; };
  }, [userProductId, productSlug]);

  return loaded;
};

export default useOfficeHours;
