import React, { useState } from 'react';
import styles from './FAQ.module.css';

const FAQ = ({ title, subtitle, items }) => {
  const [expandedItems, setExpandedItems] = useState({});

  const toggleItem = (index) => {
    setExpandedItems(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  return (
    <div className={styles.faqSection}>
      {title && <h2 className={styles.faqTitle}>{title}</h2>}
      {subtitle && <p className={styles.faqSubtitle}>{subtitle}</p>}
      
      <div className={styles.faqList}>
        {items.map((item, index) => (
          <div key={index} className={styles.faqItem}>
            <button
              className={styles.faqQuestion}
              onClick={() => toggleItem(index)}
            >
              <span>{item.question}</span>
              <img 
                src={expandedItems[index] ? "/images/dash-circle.svg" : "/images/collapse.svg"}
                alt={expandedItems[index] ? "Collapse" : "Expand"}
                className={styles.faqIcon}
              />
            </button>
            {expandedItems[index] && (
              <div className={styles.faqAnswer}>
                {item.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQ;
