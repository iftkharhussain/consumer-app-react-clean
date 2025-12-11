import React, { useState, useEffect } from 'react';
import { Rate, Spin } from 'antd';
import PageHeader from '../pageHeader';
import Button from '../button/Button';
import { Section } from 'components';
import FAQ from '../faq';
import GetInTouch from '../getInTouch';
import MoreOptions from '../moreOptions';
import OptionsModal from '../optionsModal';
import { useQuote } from '../../hooks/useQuote';
import { 
    FeaturedCardSkeleton, 
    ComparisonTableSkeleton, 
    QuoteErrorState,
    QuotePendingState 
} from './QuoteSkeletons';
import { 
    getCarrierLogo, 
    getCarrierName, 
    isIntactCarrier 
} from '../../utils/carrierUtils';
import styles from '../../pages/carInsurance/CarInsurance.module.css';

const InitialContent = ({ onInterestedClick }) => {
    const [expandedProviders, setExpandedProviders] = useState({});
    const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false);
    const [isOptionsLoading, setIsOptionsLoading] = useState(false);

    // Use quote hook to fetch and manage quotes (single API call)
    const { 
        loading, 
        error, 
        quoteStatus, 
        quoteData,
        isLoading,
        hasQuote,
        isPending,
        hasFailed,
        showFallback,
        isAuthenticated,
        refresh 
    } = useQuote('car-insurance', { 
        autoFetch: true
    });

    // Transform quote details into display format
    const [featuredProvider, setFeaturedProvider] = useState(null);
    const [comparisonProviders, setComparisonProviders] = useState([]);

    // Process quote results when available
    useEffect(() => {
        console.log('Quote data received:', {
            hasQuoteData: !!quoteData,
            carriers: quoteData?.carriers?.length || 0,
            quoteStatus,
            hasQuote,
            isAuthenticated
        });
        
        // quoteData contains { carriers: [...], carriersCount, responseTime }
        if (quoteData?.carriers && Array.isArray(quoteData.carriers)) {
            console.log('Processing carriers:', quoteData.carriers.map(c => ({
                name: c.name,
                carrierCode: c.carrierCode,
                available: c.available,
                premium: c.premium
            })));
            
            // Filter available carriers (Fortus returns 'available' not 'success')
            const availableCarriers = quoteData.carriers.filter(r => r.available);
            
            if (availableCarriers.length > 0) {
                // Find Intact as the featured provider (always show Intact first)
                // Check by carrier code using the utility function
                let intactCarrier = availableCarriers.find(c => 
                    isIntactCarrier(c.carrierCode) ||
                    c.name?.toLowerCase() === 'intact' || 
                    c.carrierName?.toLowerCase() === 'intact'
                );
                
                // Fallback to first carrier if Intact not found
                const featured = intactCarrier || availableCarriers[0];
                
                // Calculate price - premium is annual, divide by 12 for monthly
                // If premium is 0 (test/sandbox), show placeholder
                const annualPremium = featured.premium || 0;
                const monthlyPrice = annualPremium > 0 ? Math.round(annualPremium / 12) : null;
                
                // Get display name from carrier code or use the name from response
                const displayName = featured.carrierCode 
                    ? getCarrierName(featured.carrierCode) 
                    : (featured.name || featured.carrierName || 'Best Option');
                
                console.log('Setting featured provider:', displayName, 'code:', featured.carrierCode);
                setFeaturedProvider({
                    name: displayName,
                    carrierCode: featured.carrierCode,
                    logo: getCarrierLogo(featured.carrierCode || featured.name),
                    price: monthlyPrice,
                    yearlyPrice: annualPremium > 0 ? annualPremium : null,
                    rating: 4.5,
                    benefits: extractBenefits(featured),
                    coverages: featured.coverages || [],
                    quoteDetails: featured.quoteDetails || {}
                });
                
                // Rest are comparison providers (exclude the featured one)
                const otherCarriers = availableCarriers.filter(c => 
                    (c.carrierCode || c.name || c.carrierName) !== (featured.carrierCode || featured.name || featured.carrierName)
                );
                
                const others = otherCarriers.map((result, index) => {
                    const annual = result.premium || 0;
                    const monthly = annual > 0 ? Math.round(annual / 12) : null;
                    
                    // Get display name from carrier code or use the name from response
                    const providerName = result.carrierCode 
                        ? getCarrierName(result.carrierCode) 
                        : (result.name || result.carrierName || `Provider ${index + 2}`);
                    
                    return {
                        id: index + 1,
                        name: providerName,
                        carrierCode: result.carrierCode,
                        logo: getCarrierLogo(result.carrierCode || result.name),
                        monthlyPrice: monthly,
                        yearlyPrice: annual > 0 ? annual : null,
                        rating: 4.5,
                        details: extractBenefits(result),
                        coverages: result.coverages || [],
                        quoteDetails: result.quoteDetails || {}
                    };
                });
                
                console.log('Setting comparison providers:', others.map(p => ({ name: p.name, code: p.carrierCode })));
                setComparisonProviders(others);
            }
        }
    }, [quoteData]);
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

    // Helper function to extract benefits from quote result
    const extractBenefits = (result) => {
        const benefits = [];
        
        // Extract from Fortus coverages array format
        // Format: [{ code: "TPL", limit: "$2,000,000/-$1", deductible: 500 }, ...]
        if (result.coverages && Array.isArray(result.coverages)) {
            result.coverages.forEach(coverage => {
                const code = coverage.code?.toUpperCase();
                
                // Map coverage codes to friendly names
                const coverageNames = {
                    'TPL': 'Third Party Liability',
                    'DCPD': 'Direct Compensation',
                    'COLL': 'Collision',
                    'COMP': 'Comprehensive',
                    'AB': 'Accident Benefits',
                    'UA': 'Uninsured Auto',
                    'SEF44': 'Family Protection'
                };
                
                const label = coverageNames[code] || code || 'Coverage';
                let value = '';
                
                if (coverage.limit && coverage.limit !== '-$1/-$1') {
                    value = coverage.limit;
                } else if (coverage.deductible && coverage.deductible > 0) {
                    value = `$${coverage.deductible} deductible`;
                } else {
                    value = 'Included';
                }
                
                benefits.push({ label, value });
            });
        }
        
        // If no coverages extracted, add default benefits
        if (benefits.length === 0) {
            benefits.push(
                { label: 'Coverage', value: 'Full coverage' },
                { label: 'Deductible', value: '$500' },
                { label: 'Support', value: '24/7 Claims' }
            );
        }
        
        // Limit to first 3 benefits for display
        return benefits.slice(0, 3);
    };

    // Fallback data when no quotes available
    const fallbackFeaturedProvider = {
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

    const fallbackComparisonProviders = [
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
        }
    ];

    // Use quote data if available, otherwise use fallback
    const displayFeaturedProvider = featuredProvider || fallbackFeaturedProvider;
    const displayComparisonProviders = comparisonProviders.length > 0 ? comparisonProviders : fallbackComparisonProviders;

    // Determine if we should show loading state (only when authenticated and actually loading)
    const shouldShowLoading = isLoading && isAuthenticated && !showFallback;

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

            {/* Show skeleton while loading (only if authenticated), error state if failed, pending state if waiting */}
            {shouldShowLoading ? (
                <>
                    <FeaturedCardSkeleton />
                    <h2 className={styles.sectionHeading}>Other leading insurance providers</h2>
                    <ComparisonTableSkeleton />
                </>
            ) : error && isAuthenticated ? (
                <QuoteErrorState message={error} onRetry={refresh} />
            ) : isPending && isAuthenticated ? (
                <QuotePendingState message="Your quote is being processed. This may take a moment..." />
            ) : (
                <>
                    {/* Featured Provider Card */}
                    <div className={styles.featuredCard}>
                        <div className={styles.featuredCardContent}>
                            <div className={styles.providerColumn}>
                                <div className={styles.providerHeader}>
                                    <img
                                        src={displayFeaturedProvider.logo}
                                        alt={displayFeaturedProvider.name}
                                        className={styles.providerLogo}
                                    />
                                    <span className={styles.providerName}>{displayFeaturedProvider.name}</span>
                                </div>
                            </div>

                            <div className={styles.pricingColumn}>
                                <div className={styles.pricingSection}>
                                    {displayFeaturedProvider.price ? (
                                        <>
                                            <div className={styles.priceMain}>
                                                <span className={styles.priceAmount}>{displayFeaturedProvider.price}$</span>
                                                <span className={styles.priceLabel}>a month</span>
                                            </div>
                                            <div className={styles.priceSecondary}>
                                                <span className={styles.priceYearlyLabel}>or </span>
                                                <span className={styles.priceYearlyAmount}>{displayFeaturedProvider.yearlyPrice || displayFeaturedProvider.price * 12}$</span>
                                                <span className={styles.priceYearlyLabel}> a year</span>
                                            </div>
                                        </>
                                    ) : null}
                                </div>
                            </div>

                            <div className={styles.benefitsColumn}>
                                <div className={styles.benefitsSection}>
                                    {displayFeaturedProvider.benefits.map((benefit, index) => (
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
                                            value={displayFeaturedProvider.rating}
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
                                {displayComparisonProviders.map((provider) => (
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
                                                {provider.monthlyPrice ? (
                                                    <>
                                                        <span className={styles.priceAmountSmall}>{provider.monthlyPrice}$</span>
                                                        <span className={styles.priceLabelSmall}> a month or </span>
                                                        <span className={styles.priceYearlySmall}>{provider.yearlyPrice}$</span>
                                                        <span className={styles.priceLabelSmall}> a year</span>
                                                    </>
                                                ) : null}
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
                </>
            )}

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
