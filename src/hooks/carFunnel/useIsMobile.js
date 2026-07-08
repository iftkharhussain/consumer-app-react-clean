/* eslint-disable */
/**
 * useIsMobile - detects iOS / Android touch devices
 * Returns true when the user is on a mobile device (iOS or Android).
 */
const getIsMobile = () => {
    if (typeof navigator === 'undefined') return false;
    return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
};

// Not a hook that needs re-computation — just a stable value evaluated once.
export const isMobileDevice = getIsMobile();

export default isMobileDevice;
