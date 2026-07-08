/* eslint-disable */
/**
 * Translations for Phone Verification Component
 * Currently using French (fr) as the default language
 */

export const translations = {
  fr: {
    // Phone input screen
    selectChannel: "Sélectionnez la méthode de vérification",
    phoneNumber: "Numéro de téléphone",
    enterPhone: "(xxx) xxx-xxxx",
    
    // Verification methods
    sms: "SMS",
    voice: "Appel vocal",
    email: "Courriel",
    
    // Button labels
    receiveCodeBySms: "Recevoir un code par SMS",
    receiveCodeByVoice: "Recevoir un code par appel vocal",
    receiveCodeByEmail: "Recevoir un code par courriel",
    sending: "Envoi en cours...",
    verify: "Vérifier",
    verifying: "Vérification en cours...",
    
    // OTP verification screen
    codeSentTo: "Un code de vérification a été envoyé au",
    codeSentToEmail: "Un code de vérification a été envoyé à",
    enterCode: "Entrez le code",
    fourDigitCode: "Entrez le code à 4 chiffres",
    
    // Resend messages
    noCodeReceived: "Vous n'avez pas reçu de code ou le code est invalide? Renvoyer",
    resendCountdown: "Si vous n'avez pas reçu le code, vous pourrez le renvoyer dans {seconds} secondes",
    
    // Success/Error messages
    verificationSuccess: "Numéro de téléphone vérifié avec succès!",
    verificationFailed: "La vérification a échoué. Veuillez réessayer.",
    otpSendFailed: "Échec de l'envoi du code. Veuillez vérifier votre numéro et réessayer.",
    invalidOrExpiredOtp: "Code invalide ou expiré. Si le problème persiste, veuillez essayer de renvoyer le code.",
    
    // Test mode messages
    testNumberNotice: "Ceci est un numéro de test - contournera la vérification",
    testModeOtp: "Mode Test: Utilisez le code OTP",
    
    // Validation messages
    invalidPhoneNumber: "Numéro de téléphone invalide",
    invalidEmail: "Adresse courriel invalide",
  },
  en: {
    // Phone input screen
    selectChannel: "Select verification method",
    phoneNumber: "Phone number",
    enterPhone: "(xxx) xxx-xxxx",
    
    // Verification methods
    sms: "SMS",
    voice: "Voice Call",
    email: "Email",
    
    // Button labels
    receiveCodeBySms: "Receive a code by text message",
    receiveCodeByVoice: "Receive a code by voice call",
    receiveCodeByEmail: "Receive a code by email",
    sending: "Sending...",
    verify: "Verify",
    verifying: "Verifying...",
    
    // OTP verification screen
    codeSentTo: "A verification code was sent to",
    codeSentToEmail: "A verification code was sent to",
    enterCode: "Enter code",
    fourDigitCode: "Enter 4 digit code",
    
    // Resend messages
    noCodeReceived: "Didn't receive a code or is the code invalid? Resend",
    resendCountdown: "If you haven't received the code, you'll be able to request a new one in {seconds} seconds",
    
    // Success/Error messages
    verificationSuccess: "Phone number verified successfully!",
    verificationFailed: "Verification failed. Please try again.",
    otpSendFailed: "OTP failed to send. Please check your phone number and try again.",
    invalidOrExpiredOtp: "Invalid or expired OTP. If the issue persists, please try sending the OTP again.",
    
    // Test mode messages
    testNumberNotice: "This is a test number - will bypass verification",
    testModeOtp: "Test Mode: Use OTP code",
    
    // Validation messages
    invalidPhoneNumber: "Invalid phone number",
    invalidEmail: "Invalid email address",
  }
};

/**
 * Get translations for a specific language
 * @param {string} lang - Language code ('fr' or 'en')
 * @returns {Object} - Translations object
 */
export const getTranslations = (lang = 'fr') => {
  return translations[lang] || translations.fr;
};

export default translations;
