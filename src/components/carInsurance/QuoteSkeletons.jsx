import React from 'react';
import styles from './QuoteSkeletons.module.css';

/* IMAGE 2: Results Page Skeleton (Long List with Blue Box) */
export const ResultsSkeleton = () => (
    <div className={styles.skeletonWrapper}>
        <div className={styles.confirmContainer}>
            {/* 1. Header Mini-Bar */}
            <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
                <div className={styles.rect} style={{ width: '160px', height: '10px', opacity: 0.4 }} />
            </div>

            {/* 2. Top Card (Featured) */}
            <div className={styles.featuredCard} style={{ padding: 0, overflow: 'hidden', border: '1px solid #ececec' }}>
                {/* Left Side (Identity) */}
                <div className={styles.featuredCardLeft}>
                    <div className={styles.rect} style={{ width: '120px', height: '60px', borderRadius: '8px' }} />
                    <div className={styles.rect} style={{ width: '80px', height: '22px' }} />
                    <div style={{ marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                        <div className={styles.rect} style={{ width: '100%', height: '18px' }} />
                        <div className={styles.rect} style={{ width: '100%', height: '18px' }} />
                    </div>
                </div>
                {/* Right Side (Blue Box) */}
                <div className={styles.featuredCardRight}>
                    <div className={styles.rect} style={{ width: '100%', height: '12px', opacity: 0.7 }} />
                    <div className={styles.rect} style={{ width: '90%', height: '12px', opacity: 0.7 }} />
                    <div className={styles.rect} style={{ width: '80%', height: '12px', marginBottom: '24px', opacity: 0.7 }} />
                    <div className={styles.rect} style={{ width: '100%', height: '44px', borderRadius: '8px', opacity: 0.9 }} />
                </div>
            </div>

            {/* 3. Middle Bullet List Card */}
            <div className={styles.largeBottom} style={{ padding: '0', overflow: 'hidden', marginTop: '16px', border: '1px solid #ececec' }}>
                <div style={{ padding: '24px 32px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f9f9f9' }}>
                    <div className={styles.rect} style={{ width: '160px', height: '16px' }} />
                    <div className={styles.rect} style={{ width: '100px', height: '16px' }} />
                </div>
                <div style={{ padding: '24px 32px' }}>
                    {[...Array(6)].map((_, i) => (
                        <div key={i} style={{ display: 'flex', flexDirection: 'column', marginBottom: '16px' }}>
                            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                <div className={styles.rect} style={{ width: '12px', height: '12px', borderRadius: '2px', flexShrink: 0 }} />
                                <div className={styles.rect} style={{ flex: 1, height: '12px' }} />
                            </div>
                            <div style={{ paddingLeft: '28px', marginTop: '8px' }}>
                                <div className={styles.rect} style={{ width: '85%', height: '12px', opacity: 0.5 }} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 4. Wide Separator Label */}
            <div style={{ padding: '16px 0 8px 0' }}>
                <div className={styles.rect} style={{ width: '180px', height: '18px', opacity: 0.8 }} />
            </div>

            {/* 5. Insurer List Cards */}
            {[...Array(4)].map((_, i) => (
                <div key={i} className={styles.listRow} style={{ border: '1px solid #ececec', padding: '24px 32px' }}>
                    <div style={{ display: 'flex', gap: '32px', alignItems: 'center', flex: 1 }}>
                        <div className={styles.rect} style={{ width: '120px', height: '60px', borderRadius: '8px' }} />
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div className={styles.rect} style={{ width: '200px', height: '16px' }} />
                            <div className={styles.rect} style={{ width: '120px', height: '16px' }} />
                        </div>
                    </div>
                    <div className={styles.rect} style={{ width: '100px', height: '40px', borderRadius: '8px' }} />
                </div>
            ))}
        </div>
    </div>
);

/* IMAGE 3: Fallback Page Skeleton (Warning + Courtika) */
export const FallbackSkeleton = () => (
    <div className={styles.skeletonWrapper}>
        <div className={styles.confirmContainer}>
            {/* Header: Warning + Titles */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', marginBottom: '40px' }}>
                <div className={styles.circle} style={{ width: '64px', height: '64px', backgroundColor: '#fff7ed', border: '1px solid #fed7aa' }} />
                <div className={styles.rect} style={{ width: '400px', height: '32px' }} />
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <div className={styles.rect} style={{ width: '500px', height: '14px', opacity: 0.6 }} />
                    <div className={styles.rect} style={{ width: '480px', height: '14px', opacity: 0.6 }} />
                    <div className={styles.rect} style={{ width: '450px', height: '14px', opacity: 0.6 }} />
                </div>
            </div>

            {/* Main Center Card (Courtika) */}
            <div className={styles.largeBottom} style={{ padding: '48px', border: '1px solid #ececec' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '32px' }}>
                    {/* Title */}
                    <div className={styles.rect} style={{ width: '320px', height: '24px' }} />
                    
                    {/* Logo + Badge Row */}
                    <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
                         <div className={styles.rect} style={{ width: '140px', height: '50px', borderRadius: '8px' }} />
                         <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              <div className={styles.rect} style={{ width: '160px', height: '24px', borderRadius: '20px', opacity: 0.5 }} />
                              <div className={styles.rect} style={{ width: '180px', height: '12px', opacity: 0.4 }} />
                         </div>
                    </div>

                    {/* Blue-ish Banner */}
                    <div style={{ width: '100%', padding: '24px', backgroundColor: '#f5f7ff', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                         <div className={styles.circle} style={{ width: '32px', height: '32px', opacity: 0.6 }} />
                         <div style={{ flex: 1 }}>
                              <div className={styles.rect} style={{ width: '40%', height: '16px', marginBottom: '8px' }} />
                              <div className={styles.rect} style={{ width: '70%', height: '12px', opacity: 0.7 }} />
                         </div>
                    </div>

                    {/* Why Talk to a Broker Section */}
                    <div style={{ width: '100%', padding: '24px', border: '1px solid #f9f9f9', borderRadius: '12px' }}>
                         <div className={styles.rect} style={{ width: '220px', height: '16px', marginBottom: '24px' }} />
                         {[...Array(4)].map((_, i) => (
                             <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
                                 <div className={styles.rect} style={{ width: '16px', height: '16px', borderRadius: '4px', opacity: 0.5 }} />
                                 <div className={styles.rect} style={{ width: '200px', height: '12px' }} />
                                 <div className={styles.rect} style={{ width: '240px', height: '10px', opacity: 0.4 }} />
                             </div>
                         ))}
                    </div>

                    {/* Large CTA Button */}
                    <div className={styles.rect} style={{ width: '100%', height: '56px', borderRadius: '8px', backgroundColor: '#1A1ABA', opacity: 0.9 }} />
                    
                    {/* Tiny Footer Text */}
                    <div className={styles.rect} style={{ width: '240px', height: '12px', opacity: 0.4 }} />
                </div>
            </div>

            {/* About Card Card */}
            <div className={styles.largeBottom} style={{ marginTop: '24px', padding: '40px', border: '1px solid #ececec' }}>
                 <div className={styles.rect} style={{ width: '180px', height: '20px', marginBottom: '16px' }} />
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '40px' }}>
                      <div className={styles.rect} style={{ width: '100%', height: '12px', opacity: 0.6 }} />
                      <div className={styles.rect} style={{ width: '90%', height: '12px', opacity: 0.6 }} />
                 </div>
                 {/* Footer Row */}
                 <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                      <div className={styles.rect} style={{ width: '100px', height: '40px', borderRadius: '4px' }} />
                      <div style={{ flex: 1 }}>
                           <div className={styles.rect} style={{ width: '200px', height: '14px', marginBottom: '8px' }} />
                           <div className={styles.rect} style={{ width: '240px', height: '10px', opacity: 0.5 }} />
                      </div>
                 </div>
            </div>
        </div>
    </div>
);

/* Confirmation uses Fallback by default as requested for state-of-the-art fallback pages */
export const ConfirmationSkeleton = () => <FallbackSkeleton />;

/* Compatibility Primitives */
export const FeaturedCardSkeleton = () => <ResultsSkeleton />;
export const ComparisonTableSkeleton = () => <ResultsSkeleton />;
export const QuoteLoadingState = () => <ResultsSkeleton />;
export const QuoteErrorState = ({ message }) => (<div style={{ textAlign: 'center', padding: '40px' }}>{message}</div>);
export const QuotePendingState = ({ message }) => (<div style={{ textAlign: 'center', padding: '40px' }}>{message}</div>);

export default {
    ResultsSkeleton,
    FallbackSkeleton,
    ConfirmationSkeleton,
    FeaturedCardSkeleton,
    ComparisonTableSkeleton,
    QuoteLoadingState,
    QuoteErrorState,
    QuotePendingState
};
