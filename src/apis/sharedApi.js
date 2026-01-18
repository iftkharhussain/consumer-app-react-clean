// API Configuration for Consumer App

// Get API URL from environment variable with fallback
const getBaseUrl = () => {
  const url = process.env.REACT_APP_API_URL;
  return url;
};

export const baseUrl = getBaseUrl();
export const serverUrl = baseUrl; // Alias for baseUrl

// Authentication Endpoints
export const authUrl = `${baseUrl}/api/auth/verify`;
export const LoginUrl = `${baseUrl}/api/auth/login`;
export const RegisterUrl = `${baseUrl}/api/auth/register`;
export const PhoneLoginUrl = `${baseUrl}/api/auth/phone-login`;
export const LeadLoginUrl = `${baseUrl}/api/auth/lead-login`;
export const CheckTokenUrl = `${baseUrl}/api/auth/check-token`;
export const logoutUrl = `${baseUrl}/api/auth/logout`;
export const profileUrl = `${baseUrl}/api/auth/profile`;
export const CurrentUserUrl = `${baseUrl}/api/auth/me`;
export const ForgotPasswordUrl = `${baseUrl}/api/auth/forgot-password`;
export const ResetPasswordUrl = `${baseUrl}/api/auth/reset-password`;
export const ResetPasswordAuthUrl = `${baseUrl}/api/auth/reset-password-auth`;
export const resetPasswordAuthUrl = ResetPasswordAuthUrl; // Alias for consistency
export const verifyTokenUrl = `${baseUrl}/api/auth/verify-token`;

// Profile Management
export const updateProfileUrl = `${baseUrl}/api/profile/update`;
export const uploadAvatarUrl = `${baseUrl}/api/profile/upload-avatar`;

// Phone/2FA Management
export const addPhoneOTPUrl = `${baseUrl}/api/phone/send-otp`;
export const verifyPhoneOTPUrl = `${baseUrl}/api/phone/verify-otp`;
export const manageTwoStepAuthUrl = `${baseUrl}/api/auth/two-step`;

// Search
export const appSearchUrl = `${baseUrl}/api/search`;

// Quote Management
export const requestQuoteUrl = `${baseUrl}/api/quote/request`;
export const getUserProductsUrl = `${baseUrl}/api/quote/products`;
export const getQuoteStatusUrl = `${baseUrl}/api/quote/status`;
export const getQuoteDetailsUrl = `${baseUrl}/api/quote/details`;

// For backwards compatibility (these were imported in helper.js but not used)
export const login = LoginUrl;
export const signup = `${baseUrl}/api/auth/signup`;
