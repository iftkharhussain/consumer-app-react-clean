import React, { useState, useEffect } from 'react';
import { Rate, Spin, Radio } from 'antd';
import PageHeader from '../pageHeader';
import Button from '../button/Button';
import BillingToggle from '../billingToggle';
import { Section } from 'components';
import FAQ from '../faq';
import GetInTouch from '../getInTouch';
import MoreOptions from '../moreOptions';
import OptionsModal from '../optionsModal';
import CourtikaModal from '../courtikaModal';
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

const InitialContent = ({
    onInterestedClick,
    onCustomize,
    // Props from parent (CarInsurance page)
    quoteData,
    quoteLoading,
    quoteStatus,
    hasQuote,
    hasFailed,
    isPending,
    quoteError,
    isAuthenticated = true,
    onRetryQuote
}) => {
    const [expandedProviders, setExpandedProviders] = useState({});
    const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false);
    const [isCourtikaModalOpen, setIsCourtikaModalOpen] = useState(false);
    const [isOptionsLoading, setIsOptionsLoading] = useState(false);
    const [isPersonnaliserLoading, setIsPersonnaliserLoading] = useState(false);
    const [billingPeriod, setBillingPeriod] = useState('Mensuel');

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

    const handlePersonnaliserClick = (e) => {
        e.preventDefault();
        setIsPersonnaliserLoading(true);
        // Simulate 2 second loading delay
        setTimeout(() => {
            setIsPersonnaliserLoading(false);
            onCustomize && onCustomize();
        }, 2000);
    };

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
            name: 'L\'Unique',
            logo: '/images/LUnique.svg',
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
            name: 'Wawanesa',
            logo: '/images/Wawanesa.svg',
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
            name: 'Echelon Insurance',
            logo: '/images/Echelon_Insuranc.svg',
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
            name: 'Pafco',
            logo: '/images/pafco.svg',
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
    const shouldShowLoading = quoteLoading && isAuthenticated && !hasQuote;

    return (
        <>
            {/* Countdown Timer */}
            <p className={styles.countdownText}>
                Vos soumissions expirent dans : <span className={styles.countdownTime}>14:59</span>
            </p>

            {/* Featured Quote Card */}
            <div className={styles.featuredQuoteCard}>
                <div className={styles.featuredLeft}>
                    <img
                        src="/images/intact-insurance.svg"
                        alt="Intact"
                        className={styles.featuredLogo}
                    />

                    <div className={styles.featuredPricing}>
                        <span className={styles.originalPrice}>102 $ / mo</span>
                        <div className={styles.currentPrice}>
                            <span className={styles.priceNumber}>90</span>
                            <span className={styles.priceCurrency}>$</span>
                            <span className={styles.pricePerMonth}> / mo</span>
                        </div>
                    </div>

                    <div className={styles.discountBadge}>
                        Rabais Intact appliqué!
                    </div>

                    <p className={styles.discountText}>
                        Intact vous offre un rabais de 10% supplémentaire
                    </p>

                    <BillingToggle
                        value={billingPeriod}
                        onChange={setBillingPeriod}
                    />
                </div>

                <div className={styles.featuredRight}>
                    <h2 className={styles.featuredHeading}>
                        Edward, Intact se démarque selon vos infos fournies!
                    </h2>

                    <p className={styles.featuredDescription}>
                        Le prix affiché est une estimation. <strong>Pour obtenir le prix final, cliquez sur « Poursuivre » et parlez à un courtier en assurance de dommages</strong> ; celui-ci validera les informations nécessaires avec vous.
                    </p>

                    <Button
                        type="primary"
                        className={styles.poursuivreButton}
                        onClick={() => setIsCourtikaModalOpen(true)}
                    >
                        Poursuivre
                    </Button>
                </div>
            </div>

            {/* Vos protections Section */}
            <div className={styles.protectionsHeader}>
                <h2 className={styles.protectionsTitle}>Vos protections</h2>
                <a
                    href="#"
                    className={styles.personnaliserLink}
                    onClick={handlePersonnaliserClick}
                    style={{ opacity: isPersonnaliserLoading ? 0.6 : 1, pointerEvents: isPersonnaliserLoading ? 'none' : 'auto' }}
                >
                    {isPersonnaliserLoading ? 'Chargement...' : 'Personnaliser'}
                    {!isPersonnaliserLoading && <img src="/images/config.svg" alt="" className={styles.configIcon} />}
                </a>
            </div>

            <div className={styles.protectionsCard}>
                <div className={styles.protectionItem}>
                    <div className={styles.protectionHeader}>
                        <img src="/images/Tick.svg" alt="check" className={styles.tickIcon} />
                        <h3 className={styles.protectionName}>Responsabilité civile</h3>
                    </div>
                    <p className={styles.protectionDescription}>
                        Couvre les dommages à ce qui ne vous appartient pas quand vous causez un accident
                    </p>
                    <p className={styles.protectionCoverage}>Couverture : 2 000 000 $</p>
                </div>

                <div className={styles.protectionItem}>
                    <div className={styles.protectionHeader}>
                        <img src="/images/Tick.svg" alt="check" className={styles.tickIcon} />
                        <h3 className={styles.protectionName}>Assistance routière (FAQ 33)</h3>
                    </div>
                    <p className={styles.protectionDescription}>
                        Aide et remorquage en cas de panne ou d'imprévu sur la route.
                    </p>
                    <a href="#" className={styles.disclaimerLink}>Disclaimer ici</a>
                </div>

                <div className={styles.protectionItem}>
                    <div className={styles.protectionHeader}>
                        <img src="/images/Tick.svg" alt="check" className={styles.tickIcon} />
                        <h3 className={styles.protectionName}>Collision et renversement (B2)</h3>
                    </div>
                    <p className={styles.protectionDescription}>
                        Couvre les dommages causés à votre auto lorsque vous entrez en collision avec quelqu'un ou quelque chose.
                    </p>
                    <p className={styles.protectionCoverage}>Franchise : 500 $</p>
                </div>

                <div className={styles.protectionItem}>
                    <div className={styles.protectionHeader}>
                        <img src="/images/Tick.svg" alt="check" className={styles.tickIcon} />
                        <h3 className={styles.protectionName}>Protection bonifiée</h3>
                    </div>
                    <ul className={styles.protectionList}>
                        <li>Responsabilité civile étendue (FAQ 2)</li>
                        <li>Véhicule de remplacement et frais de déplacement (FAQ 20)</li>
                        <li>Assurance de personnes (FAQ 27)</li>
                        <li>Véhicules loués ou empruntés (FAQ 34)</li>
                    </ul>
                    <a href="#" className={styles.disclaimerLink}>Disclaimer ici</a>
                </div>

                <div className={styles.protectionItem}>
                    <div className={styles.protectionHeader}>
                        <img src="/images/Tick.svg" alt="check" className={styles.tickIcon} />
                        <h3 className={styles.protectionName}>Accidents sans collision ni renversement (B3)</h3>
                    </div>
                    <p className={styles.protectionDescription}>
                        Couvre les bris de votre voiture et les dommages qui ne sont pas liés à une collision
                    </p>
                    <p className={styles.protectionCoverage}>Franchise : 250 $</p>
                </div>
            </div>

            {/* Show skeleton while loading (only if authenticated), error state if failed, pending state if waiting */}
            {shouldShowLoading ? (
                <>
                    <h2 className={styles.sectionHeading}>Insurance providers</h2>
                    <ComparisonTableSkeleton />
                </>
            ) : quoteError && isAuthenticated ? (
                <QuoteErrorState message={quoteError} onRetry={onRetryQuote} />
            ) : isPending && isAuthenticated ? (
                <QuotePendingState message="Your quote is being processed. This may take a moment..." />
            ) : (
                <>
                    {/* Comparison Table */}
                    <h2 className={styles.sectionHeading}>Autres options d'assureurs reconnus</h2>
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

                                            <td className={styles.providerNameColumn}>
                                                <span className={styles.providerSubtitle}>{provider.name}</span>
                                            </td>

                                            <td className={styles.providerPricing}>
                                                {provider.monthlyPrice ? (
                                                    <div className={styles.priceContainer}>
                                                        <span className={styles.priceAmountLarge}>{provider.monthlyPrice}</span>
                                                        <span className={styles.priceCurrencySmall}>$</span>
                                                        <span className={styles.priceUnitSmall}> a month or </span>
                                                        <span className={styles.priceUnitSmall}>{provider.yearlyPrice}</span>
                                                        <span className={styles.priceUnitSmall}> a year</span>
                                                    </div>
                                                ) : null}
                                            </td>

                                            <td className={styles.providerActions}>
                                                <Button
                                                    type="primary"
                                                    className={styles.poursuivreButtonSmall}
                                                    onClick={onInterestedClick}
                                                >
                                                    Poursuivre
                                                </Button>
                                            </td>
                                        </tr>
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </Section>
                </>
            )}

            {/* FAQ Section */}
            <FAQ />

            {/* Options Modal */}
            <OptionsModal
                isOpen={isOptionsModalOpen}
                onClose={() => setIsOptionsModalOpen(false)}
                onRecalculate={handleRecalculate}
            />

            {/* Courtika Modal */}
            <CourtikaModal
                isOpen={isCourtikaModalOpen}
                onClose={() => setIsCourtikaModalOpen(false)}
            />
        </>
    );
};

export default InitialContent;
