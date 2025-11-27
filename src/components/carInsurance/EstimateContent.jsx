import React, { useState } from 'react';
import PageHeader from '../pageHeader';
import { Section } from 'components';
import Button from '../button/Button';
import ProgressSection from '../progressSection/ProgressSection';
import FAQ from '../faq';
import GetInTouch from '../getInTouch';
import MoreOptions from '../moreOptions';
import InterestedModal from '../interestedModal';
import ContactSection from '../contactSection';
import styles from './EstimateContent.module.css';

const EstimateContent = () => {
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [isNoLoading, setIsNoLoading] = useState(false);

    const handleGetInTouch = () => {
        console.log('Get in touch clicked');
    };

    const handleNoClick = () => {
        setIsNoLoading(true);
        // Show loading for 1 second, then open modal
        setTimeout(() => {
            setIsNoLoading(false);
            setIsReviewModalOpen(true);
        }, 1000);
    };

    const faqItems = [
        {
            question: "Is there a free trial available?",
            answer: "lorem ipsum dolor sit amet consectetur adipisicing elit."
        },
        {
            question: "Can I change my plan later?",
            answer: "lorem ipsum dolor sit amet consectetur adipisicing elit."
        },
        {
            question: "What is your cancellation policy?",
            answer: "lorem ipsum dolor sit amet consectetur adipisicing elit."
        },
        {
            question: "Can other info be added to an invoice?",
            answer: "lorem ipsum dolor sit amet consectetur adipisicing elit."
        },
        {
            question: "How does billing work?",
            answer: "lorem ipsum dolor sit amet consectetur adipisicing elit."
        },
        {
            question: "How do I change my account email?",
            answer: "lorem ipsum dolor sit amet consectetur adipisicing elit."
        }
    ];

    return (
        <>
            <PageHeader title="Here is your estimate!" />
            <p className={styles.subtitle}>
                The price is not final — an advisor will call you to confirm your health status, then adjust the duration and price according to your needs.
            </p>

            {/* Next Step Section */}
            <Section variant="card">
                <h2 className={styles.nextStepTitle}>Next Step: Schedule a call with your Courtika</h2>
                <p style={{ margin: 0 }} className={styles.nextStepDescription}>
                    Congratulations! An advisor has received your request and will prepare your personalized quotes.
                    Schedule a call so they can contact you at the right time.
                </p>

                {/* Progress steps - using reusable component */}
                <ProgressSection percentage="66%" activeSteps={2} />

                {/* Details section */}
                <div className={styles.detailsSection}>
                    <h3 className={styles.detailsTitle}>Détails</h3>

                    <div className={styles.detailItem}>
                        <img src="/images/calendar.svg" alt="Calendar" className={styles.detailIcon} />
                        <span className={styles.detailText}>Ouvert de 8:30 à 16:30 du lundi au vendredi</span>
                    </div>

                    <div className={styles.detailItem}>
                        <img src="/images/clock.svg" alt="Clock" className={styles.detailIcon} />
                        <span className={styles.detailText}>Durée de l'appelle: 10 min</span>
                    </div>

                    <div className={styles.detailItem}>
                        <img src="/images/bell-ringing-01.svg" alt="Bell" className={styles.detailIcon} />
                        <span className={styles.detailText}>If you don't answer, we'll try 2 more times</span>
                    </div>
                </div>

                {/* Votre choix section */}
                <div className={styles.choiceSection}>
                    <div className={styles.choiceLeft}>
                        <h3 className={styles.choiceTitle}>Votre choix</h3>
                        <span className={styles.choiceLabel}>Intact assurance:</span>
                        <div className={styles.choicePrice}>90$ / mois</div>
                    </div>
                    <div className={styles.choiceRight}>
                        <img src="/images/intact-insurance.svg" alt="Intact" className={styles.choiceLogo} />
                    </div>
                </div>

                {/* Contact section - using reusable component */}
                <ContactSection />

                {/* Did the call happen section */}
                <div className={styles.callHappenSection}>
                    <h3 className={styles.callHappenTitle}>Did the call happen?</h3>
                    <div className={styles.yesNoButtons}>
                        <Button type="primary" className={styles.yesButton} onClick={handleNoClick} loading={isNoLoading}>
                            Yes
                        </Button>
                        <Button variant="secondary" className={styles.noButton}>
                            No
                        </Button>
                    </div>
                </div>
            </Section>

            {/* More Options Section */}
            <MoreOptions />

            {/* FAQ Section */}
            <FAQ
                title="Frequently asked questions"
                subtitle="Everything you need to know about the product and billing."
                items={faqItems}
            />

            {/* Get in Touch Section */}
            <GetInTouch onButtonClick={handleGetInTouch} />

            {/* Review Modal */}
            <InterestedModal
                isOpen={isReviewModalOpen}
                onClose={() => setIsReviewModalOpen(false)}
                variant="review"
            />
        </>
    );
};

export default EstimateContent;
