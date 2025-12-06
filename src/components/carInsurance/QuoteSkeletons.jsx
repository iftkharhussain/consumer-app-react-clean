import React from 'react';
import { Skeleton } from 'antd';
import { Section } from 'components';
import styles from '../../pages/carInsurance/CarInsurance.module.css';

/**
 * Skeleton loader for featured provider card
 */
export const FeaturedCardSkeleton = () => (
  <div className={styles.featuredCard}>
    <div className={styles.featuredCardContent}>
      <div className={styles.providerColumn}>
        <div className={styles.providerHeader}>
          <Skeleton.Avatar active size={48} shape="square" />
          <Skeleton.Input active size="small" style={{ width: 150, marginLeft: 12 }} />
        </div>
      </div>

      <div className={styles.pricingColumn}>
        <div className={styles.pricingSection}>
          <Skeleton.Input active size="large" style={{ width: 100 }} />
          <Skeleton.Input active size="small" style={{ width: 120, marginTop: 8 }} />
        </div>
      </div>

      <div className={styles.benefitsColumn}>
        <div className={styles.benefitsSection}>
          <Skeleton active paragraph={{ rows: 3, width: ['80%', '70%', '60%'] }} title={false} />
        </div>
      </div>

      <div className={styles.actionsColumn}>
        <div className={styles.featuredActions}>
          <Skeleton.Button active size="large" style={{ width: 140 }} />
          <div style={{ marginTop: 12 }}>
            <Skeleton.Input active size="small" style={{ width: 100 }} />
          </div>
        </div>
      </div>
    </div>
  </div>
);

/**
 * Skeleton loader for comparison table row
 */
const TableRowSkeleton = () => (
  <tr className={styles.providerRow}>
    <td className={styles.providerLogoColumn}>
      <Skeleton.Avatar active size={40} shape="square" />
    </td>
    <td className={styles.providerNameColumn} style={{ width: '200px' }}>
      <Skeleton.Input active size="small" style={{ width: 120 }} />
    </td>
    <td className={styles.providerPricing}>
      <Skeleton.Input active size="small" style={{ width: 200 }} />
    </td>
    <td className={styles.providerActions}>
      <Skeleton.Button active size="default" style={{ width: 100 }} />
      <Skeleton.Avatar active size={24} shape="circle" style={{ marginLeft: 8 }} />
    </td>
  </tr>
);

/**
 * Skeleton loader for comparison table
 */
export const ComparisonTableSkeleton = ({ rows = 4 }) => (
  <Section variant="card" style={{ padding: '0px' }}>
    <table className={styles.comparisonTable}>
      <tbody>
        {Array.from({ length: rows }).map((_, index) => (
          <TableRowSkeleton key={index} />
        ))}
      </tbody>
    </table>
  </Section>
);

/**
 * Loading state component with message
 */
export const QuoteLoadingState = ({ message = 'Loading quotes...' }) => (
  <div style={{ 
    textAlign: 'center', 
    padding: '40px 20px',
    color: '#666'
  }}>
    <Skeleton.Avatar active size={64} shape="circle" />
    <p style={{ marginTop: 16, fontSize: '14px' }}>{message}</p>
  </div>
);

/**
 * Error state component
 */
export const QuoteErrorState = ({ message, onRetry }) => (
  <div style={{ 
    textAlign: 'center', 
    padding: '40px 20px',
    color: '#666'
  }}>
    <div style={{ fontSize: '48px', marginBottom: 16 }}>⚠️</div>
    <p style={{ marginBottom: 16 }}>{message || 'Failed to load quotes'}</p>
    {onRetry && (
      <button 
        onClick={onRetry}
        style={{
          padding: '8px 24px',
          borderRadius: '8px',
          border: '1px solid #ddd',
          background: 'white',
          cursor: 'pointer'
        }}
      >
        Try Again
      </button>
    )}
  </div>
);

/**
 * Pending quote state
 */
export const QuotePendingState = ({ message }) => (
  <div style={{ 
    textAlign: 'center', 
    padding: '40px 20px',
    color: '#666',
    background: '#f9fafb',
    borderRadius: '12px',
    border: '1px solid #e5e7eb'
  }}>
    <div style={{ fontSize: '48px', marginBottom: 16 }}>⏳</div>
    <h3 style={{ marginBottom: 8, color: '#374151' }}>Quote in Progress</h3>
    <p style={{ margin: 0, fontSize: '14px' }}>
      {message || 'We are getting the best quotes for you. This may take a few moments...'}
    </p>
  </div>
);

export default {
  FeaturedCardSkeleton,
  ComparisonTableSkeleton,
  QuoteLoadingState,
  QuoteErrorState,
  QuotePendingState
};
