/* eslint-disable */
// Asset path utility for handling different deployment environments
// Returns the correct base path for assets based on the environment

export const getAssetPath = (path) => {
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // Use the global ASSET_BASE_URL if defined (for Webflow deployment)
  // Otherwise, use relative path (for normal deployment)
  const baseUrl = window.ASSET_BASE_URL || '';
  
  return `${baseUrl}/${cleanPath}`;
};

// Shorthand for image paths
export const getImagePath = (imageName) => {
  return getAssetPath(`images/${imageName}`);
};
