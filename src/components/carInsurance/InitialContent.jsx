import React, { useState } from 'react';
import { Rate, Spin } from 'antd';
import PageHeader from '../pageHeader';
import Button from '../button/Button';
import { Section } from 'components';
import FAQ from '../faq';
import GetInTouch from '../getInTouch';
import MoreOptions from '../moreOptions';
import OptionsModal from '../optionsModal';
import styles from '../../pages/carInsurance/CarInsurance.module.css';

const InitialContent = ({ onInterestedClick }) => {
    const [expandedProviders, setExpandedProviders] = useState({});
    const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false);
    const [isOptionsLoading, setIsOptionsLoading] = useState(false);

    const toggleProvider = (providerId) => {
        setExpandedProviders(prev => ({
            ...prev,
            [providerId]: !prev[providerId]
        }));
    };

    const handleGetInTouch = () => {
        console.log('Get in touch clicked');
    };

    const handleRecalculate = (data) => {
        console.log('Recalculate with options:', data);
        // Handle recalculation logic here
    };

    const handleModifierClick = (e) => {
        e.preventDefault();
        setIsOptionsLoading(true);
        // Simulate loading delay (replace with actual API call if needed)
        setTimeout(() => {
            setIsOptionsLoading(false);
            setIsOptionsModalOpen(true);
        }, 800);
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

    const featuredProvider = {
        name: 'Intact assurance',
        logo: '/images/intact-insurance.svg',
        price: 90,
        rating: 4.5,
        benefits: [
            { label: 'Benefit 1', value: 'cool benefit' },
            { label: 'Benefit 2', value: 'cool benefit' },
            { label: 'Benefit 3', value: 'cool benefit' }
        ]
    };

    const comparisonProviders = [
        {
            id: 1,
            name: 'Beneva',
            logo: '/images/Beneva_rgb.svg',
            monthlyPrice: 90,
            yearlyPrice: 1080,
            rating: 4.5,
            details: [
                { label: 'Benefit 1', value: 'cool benefit' },
                { label: 'Benefit 2', value: 'cool benefit' },
                { label: 'Benefit 3', value: 'cool benefit' }
            ]
        },
        {
            id: 2,
            name: 'Promutuel assurance',
            logo: '/images/promutuel.svg',
            monthlyPrice: 90,
            yearlyPrice: 1080,
            rating: 4.5,
            details: [
                { label: 'Benefit 1', value: 'cool benefit' },
                { label: 'Benefit 2', value: 'cool benefit' },
                { label: 'Benefit 3', value: 'cool benefit' }
            ]
        },
        {
            id: 3,
            name: 'Economical assurance',
            logo: '/images/economical.svg',
            monthlyPrice: 90,
            yearlyPrice: 1080,
            rating: 4.5,
            details: [
                { label: 'Benefit 1', value: 'cool benefit' },
                { label: 'Benefit 2', value: 'cool benefit' },
                { label: 'Benefit 3', value: 'cool benefit' }
            ]
        },
        {
            id: 4,
            name: 'CAA',
            logo: '/images/CAA_logo.svg',
            monthlyPrice: 90,
            yearlyPrice: 1080,
            rating: 4.5,
            details: [
                { label: 'Benefit 1', value: 'cool benefit' },
                { label: 'Benefit 2', value: 'cool benefit' },
                { label: 'Benefit 3', value: 'cool benefit' }
            ]
        },
        {
            id: 5,
            name: 'Beneva',
            logo: '/images/Beneva_rgb.svg',
            monthlyPrice: 90,
            yearlyPrice: 1080,
            rating: 4.5,
            details: [
                { label: 'Benefit 1', value: 'cool benefit' },
                { label: 'Benefit 2', value: 'cool benefit' },
                { label: 'Benefit 3', value: 'cool benefit' }
            ]
        },
        {
            id: 6,
            name: 'Promutuel assurance',
            logo: '/images/promutuel.svg',
            monthlyPrice: 90,
            yearlyPrice: 1080,
            rating: 4.5,
            details: [
                { label: 'Benefit 1', value: 'cool benefit' },
                { label: 'Benefit 2', value: 'cool benefit' },
                { label: 'Benefit 3', value: 'cool benefit' }
            ]
        }
    ];

    return (
        <>
            <PageHeader title="Here's the best option for you!" />
            <p className={styles.subtitle}>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Totam iusto amet saepe commodi odio, deleniti cum dolor unde fugiat sunt aliquid ea obcaecati expedita maxime ut cupiditate voluptates id reprehenderit.</p>

            {/* Modifier Section */}
            <a href="#" className={styles.modifierLink} onClick={handleModifierClick}>
                Modifier {isOptionsLoading ? (
                    <Spin size="small" />
                ) : (
                    <img src="/images/config.svg" alt="" className={styles.modifierIcon} />
                )}
            </a>

            {/* Featured Provider Card */}
            <div className={styles.featuredCard}>
                <div className={styles.featuredCardContent}>
                    <div className={styles.providerColumn}>
                        <div className={styles.providerHeader}>
                            <img
                                src={featuredProvider.logo}
                                alt={featuredProvider.name}
                                className={styles.providerLogo}
                            />
                            <span className={styles.providerName}>{featuredProvider.name}</span>
                        </div>
                    </div>

                    <div className={styles.pricingColumn}>
                        <div className={styles.pricingSection}>
                            <div className={styles.priceMain}>
                                <span className={styles.priceAmount}>{featuredProvider.price}$</span>
                                <span className={styles.priceLabel}>a month</span>
                            </div>
                            <div className={styles.priceSecondary}>
                                <span className={styles.priceYearlyLabel}>or </span>
                                <span className={styles.priceYearlyAmount}>{featuredProvider.price * 12}$</span>
                                <span className={styles.priceYearlyLabel}> a year</span>
                            </div>
                        </div>
                    </div>

                    <div className={styles.benefitsColumn}>
                        <div className={styles.benefitsSection}>
                            {featuredProvider.benefits.map((benefit, index) => (
                                <div key={index} className={styles.benefitRow}>
                                    <span className={styles.benefitLabel}>{benefit.label}:</span>
                                    <span className={styles.benefitValue}>{benefit.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={styles.actionsColumn}>
                        <div className={styles.featuredActions}>
                            <Button
                                type="primary"
                                className={styles.interestedButton}
                                onClick={onInterestedClick}
                            >
                                I am Interested
                            </Button>

                            <div className={styles.ratingSection}>
                                <Rate
                                    disabled
                                    allowHalf
                                    value={featuredProvider.rating}
                                    className={styles.ratingStars}
                                />
                                <a href="#" className={styles.reviewsLink}>Read reviews</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Comparison Table */}
            <h2 className={styles.sectionHeading}>Other leading insurance providers</h2>
            <Section variant="card" style={{ padding: '0px' }}>
                <table className={styles.comparisonTable}>
                    <tbody>
                        {comparisonProviders.map((provider) => (
                            <React.Fragment key={provider.id}>
                                <tr className={styles.providerRow}>
                                    <td className={styles.providerLogoColumn}>
                                        <img
                                            src={provider.logo}
                                            alt={provider.name}
                                            className={styles.providerLogoSmall}
                                        />
                                    </td>

                                    <td className={styles.providerNameColumn} style={{ width: '200px' }}>
                                        <span className={styles.providerNameSmall}>{provider.name}</span>
                                    </td>

                                    <td className={styles.providerPricing}>
                                        <span className={styles.priceAmountSmall}>{provider.monthlyPrice}$</span>
                                        <span className={styles.priceLabelSmall}> a month or </span>
                                        <span className={styles.priceYearlySmall}>{provider.yearlyPrice}$</span>
                                        <span className={styles.priceLabelSmall}> a year</span>
                                    </td>

                                    <td className={styles.providerActions}>
                                        <Button
                                            type="primary"
                                            className={styles.interestedButtonSmall}
                                        >
                                            I am Interested
                                        </Button>
                                        <button
                                            className={styles.expandButton}
                                            onClick={() => toggleProvider(provider.id)}
                                        >
                                            <img
                                                src="/images/chevron-down1.svg"
                                                alt="Expand"
                                                className={expandedProviders[provider.id] ? styles.chevronUp : styles.chevronDown}
                                            />
                                        </button>
                                    </td>
                                </tr>

                                {expandedProviders[provider.id] && (
                                    <tr className={styles.expandedRow}>
                                        <td colSpan="4" className={styles.expandedDetails}>
                                            <div className={styles.detailsContent}>
                                                {provider.details.map((detail, index) => (
                                                    <div key={index} className={styles.detailRow}>
                                                        <span className={styles.detailLabel}>{detail.label}:</span>
                                                        <span className={styles.detailValue}> {detail.value}</span>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className={styles.expandedActions}>
                                                <Rate
                                                    disabled
                                                    allowHalf
                                                    value={provider.rating}
                                                    className={styles.ratingStarsSmall}
                                                />
                                                <a href="#" className={styles.reviewsLinkSmall}>Read reviews</a>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
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

            {/* Options Modal */}
            <OptionsModal
                isOpen={isOptionsModalOpen}
                onClose={() => setIsOptionsModalOpen(false)}
                onRecalculate={handleRecalculate}
            />
        </>
    );
};

export default InitialContent;
