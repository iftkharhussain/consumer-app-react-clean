import React, { useState } from 'react';
import styles from './MeetingStatus.module.css';

const MeetingStatus = ({ onConfirm, onNotYet, onSubmitFeedback, userName = 'John Paul' }) => {
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');

  const handleConfirm = () => {
    setIsConfirmed(true);
    if (onConfirm) onConfirm();
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.headerIcon}>
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28" fill="none" style={{ flexShrink: 0 }}>
          <g clipPath="url(#clip0_6306_13370)">
            <path d="M13.9997 25.6693C20.443 25.6693 25.6663 20.4459 25.6663 14.0026C25.6663 7.55928 20.443 2.33594 13.9997 2.33594C7.55635 2.33594 2.33301 7.55928 2.33301 14.0026C2.33301 20.4459 7.55635 25.6693 13.9997 25.6693Z" stroke="#00A63E" strokeWidth="2.91667" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M10.5 13.9974L12.8333 16.3307L17.5 11.6641" stroke="#00A63E" strokeWidth="2.91667" strokeLinecap="round" strokeLinejoin="round"/>
          </g>
          <defs>
            <clipPath id="clip0_6306_13370">
              <rect width="28" height="28" fill="white"/>
            </clipPath>
          </defs>
        </svg>
      </div>
      <h2 className={styles.headerTitle}>Bon retour, {userName}!</h2>
      <p className={styles.headerSubtitle}>
        Votre dossier d'assurance auto est toujours actif chez Courtika. On fait le point ensemble sur votre expérience.
      </p>

      <div className={
        isSubmitted ? styles.success_main_div : 
        isConfirmed ? styles.feedback_main_div : 
        styles.main_div
      }>
        <div className={
          isSubmitted ? styles.success_inner_container : 
          isConfirmed ? styles.feedback_inner_container : 
          styles.inner_container
        }>
          {isSubmitted ? (
            <div className={styles.successContainer}>
              <div className={styles.successIconWrapper}>
                {/* Thumbs Up Icon */}
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                  <path d="M7 10V22" stroke="#00A63E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M15 5.88L14 10H19.83C20.1405 10 20.4467 10.0723 20.7244 10.2111C21.0021 10.35 21.2437 10.5516 21.43 10.8C21.6163 11.0484 21.7422 11.3367 21.7977 11.6422C21.8533 11.9477 21.8369 12.2619 21.75 12.56L19.42 20.56C19.2988 20.9754 19.0462 21.3404 18.7 21.6C18.3538 21.8596 17.9327 22 17.5 22H4C3.46957 22 2.96086 21.7893 2.58579 21.4142C2.21071 21.0391 2 20.5304 2 20V12C2 11.4696 2.21071 10.9609 2.58579 10.5858C2.96086 10.2107 3.46957 10 4 10H6.76C7.13208 9.9998 7.49674 9.89581 7.81296 9.69972C8.12917 9.50363 8.38442 9.22321 8.55 8.89L12 2C12.4716 2.00584 12.9357 2.11817 13.3578 2.3286C13.7799 2.53902 14.1489 2.84211 14.4374 3.2152C14.7259 3.5883 14.9263 4.02176 15.0237 4.4832C15.1212 4.94464 15.113 5.42213 15 5.88Z" stroke="#00A63E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              
              <h3 className={styles.successTitle}>Merci pour votre avis!</h3>
              
              <div className={styles.successStars}>
                {[1, 2, 3, 4, 5].map((star) => {
                  const isActive = star <= rating;
                  return (
                    <svg 
                      key={star} 
                      className={styles.successStar} 
                      xmlns="http://www.w3.org/2000/svg" 
                      viewBox="0 0 24 24" 
                      fill={isActive ? "#facc15" : "none"}
                      stroke={isActive ? "#facc15" : "#d1d5db"} 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                    </svg>
                  );
                })}
              </div>
              
              <p className={styles.successSubtitle}>
                Votre retour nous aide à améliorer l'expérience pour tous nos utilisateurs.
              </p>
            </div>
          ) : isConfirmed ? (
            <div className={styles.contentPadding}>
              <div className={styles.feedbackHeader}>
                <div className={styles.feedbackIconWrapper}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 17 17" fill="none" style={{ flexShrink: 0 }}>
                    <path d="M8.49984 15.5807C12.4119 15.5807 15.5832 12.4094 15.5832 8.4974C15.5832 4.58538 12.4119 1.41406 8.49984 1.41406C4.58782 1.41406 1.4165 4.58538 1.4165 8.4974C1.4165 12.4094 4.58782 15.5807 8.49984 15.5807Z" stroke="#00A63E" strokeWidth="1.77083" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M6.375 8.5026L7.79167 9.91927L10.625 7.08594" stroke="#00A63E" strokeWidth="1.77083" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3 className={styles.feedbackTitle}>Super! Partagez votre expérience</h3>
              </div>
              <p className={styles.subtitleWithMargin}>
                Comment s'est passé votre appel avec votre courtier Courtika?
              </p>
              
              <div className={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => {
                  const isActive = star <= rating;
                  return (
                    <svg 
                      key={star} 
                      className={styles.starIcon} 
                      xmlns="http://www.w3.org/2000/svg" 
                      width="28" 
                      height="28" 
                      viewBox="0 0 28 28" 
                      fill={isActive ? "#facc15" : "none"}
                      stroke={isActive ? "#facc15" : "#D1D5DB"} 
                      strokeWidth="2.33333" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                      onClick={() => setRating(star)}
                      style={{ flexShrink: 0 }}
                    >
                      <path d="M13.4457 2.67998C13.4968 2.57668 13.5758 2.48973 13.6737 2.42894C13.7716 2.36815 13.8846 2.33594 13.9998 2.33594C14.1151 2.33594 14.228 2.36815 14.326 2.42894C14.4239 2.48973 14.5029 2.57668 14.554 2.67998L17.249 8.13881C17.4265 8.49811 17.6886 8.80896 18.0127 9.04468C18.3368 9.28039 18.7133 9.43394 19.1098 9.49215L25.1368 10.3741C25.251 10.3907 25.3583 10.4389 25.4466 10.5132C25.5348 10.5876 25.6005 10.6851 25.6362 10.7949C25.6719 10.9046 25.6761 11.0221 25.6485 11.1342C25.6209 11.2462 25.5624 11.3483 25.4798 11.4288L21.1212 15.6731C20.8337 15.9533 20.6186 16.299 20.4945 16.6807C20.3703 17.0624 20.3407 17.4685 20.4083 17.8641L21.4373 23.8608C21.4575 23.975 21.4451 24.0925 21.4017 24.1999C21.3583 24.3074 21.2856 24.4005 21.1918 24.4686C21.098 24.5368 20.987 24.5771 20.8713 24.5852C20.7557 24.5932 20.6401 24.5686 20.5378 24.5141L15.1502 21.6815C14.7952 21.4951 14.4002 21.3977 13.9992 21.3977C13.5983 21.3977 13.2033 21.4951 12.8483 21.6815L7.46182 24.5141C7.35954 24.5683 7.24412 24.5926 7.12868 24.5844C7.01324 24.5762 6.90243 24.5358 6.80883 24.4677C6.71524 24.3997 6.64263 24.3067 6.59925 24.1994C6.55588 24.0921 6.54349 23.9748 6.56349 23.8608L7.59132 17.8653C7.65922 17.4695 7.6298 17.0631 7.50561 16.6812C7.38143 16.2993 7.1662 15.9533 6.87849 15.6731L2.51982 11.43C2.43651 11.3495 2.37748 11.2473 2.34944 11.1349C2.32141 11.0225 2.3255 10.9045 2.36125 10.7944C2.397 10.6842 2.46297 10.5863 2.55164 10.5118C2.64032 10.4373 2.74814 10.3892 2.86282 10.373L8.88865 9.49215C9.28562 9.4344 9.66261 9.28105 9.98717 9.0453C10.3117 8.80955 10.5741 8.49846 10.7518 8.13881L13.4457 2.67998Z"></path>
                    </svg>
                  );
                })}
              </div>

              <textarea 
                className={styles.textarea} 
                placeholder="Dites-nous ce que vous avez aimé ou ce qu'on pourrait améliorer..."
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
              ></textarea>

              <button 
                className={`${styles.btnSubmit} ${(rating > 0 && feedbackText.trim() !== '') ? styles.btnSubmitActive : ''}`} 
                disabled={rating === 0 || feedbackText.trim() === ''}
                onClick={() => {
                  setIsSubmitted(true);
                  if (onSubmitFeedback) onSubmitFeedback(rating, feedbackText);
                }}
              >
                Envoyer mon avis
              </button>
            </div>
          ) : (
            <div className={styles.contentPadding}>
              <div className={styles.iconWrapper}>
                <svg className={styles.customIcon} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M6.66699 1.66406V4.9974" stroke="#1A1ABA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M13.333 1.66406V4.9974" stroke="#1A1ABA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M15.8333 3.33594H4.16667C3.24619 3.33594 2.5 4.08213 2.5 5.0026V16.6693C2.5 17.5897 3.24619 18.3359 4.16667 18.3359H15.8333C16.7538 18.3359 17.5 17.5897 17.5 16.6693V5.0026C17.5 4.08213 16.7538 3.33594 15.8333 3.33594Z" stroke="#1A1ABA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2.5 8.33594H17.5" stroke="#1A1ABA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              
              <h3 className={styles.title}>Votre rendez-vous a-t-il eu lieu?</h3>
              <p className={styles.subtitle}>
                On ne sait pas encore si vous avez eu votre appel avec Courtika. Dites-nous où vous en êtes!
              </p>

              <div className={styles.buttonGroup}>
                <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleConfirm}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 17 17" fill="none" style={{ flexShrink: 0 }}>
                    <path d="M8.50033 15.5807C12.4123 15.5807 15.5837 12.4094 15.5837 8.4974C15.5837 4.58538 12.4123 1.41406 8.50033 1.41406C4.58831 1.41406 1.41699 4.58538 1.41699 8.4974C1.41699 12.4094 4.58831 15.5807 8.50033 15.5807Z" stroke="white" strokeWidth="1.41667" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M6.375 8.5026L7.79167 9.91927L10.625 7.08594" stroke="white" strokeWidth="1.41667" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Oui, c'est fait!
                </button>
                
                <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={onNotYet}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 17 17" fill="none" style={{ flexShrink: 0 }}>
                    <path d="M8.49984 15.5807C12.4119 15.5807 15.5832 12.4094 15.5832 8.4974C15.5832 4.58538 12.4119 1.41406 8.49984 1.41406C4.58782 1.41406 1.4165 4.58538 1.4165 8.4974C1.4165 12.4094 4.58782 15.5807 8.49984 15.5807Z" stroke="#364152" strokeWidth="1.41667" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M8.5 4.25V8.5L11.3333 9.91667" stroke="#364152" strokeWidth="1.41667" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Pas encore
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MeetingStatus;
