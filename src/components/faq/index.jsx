import React, { useState } from 'react';
import styles from './FAQ.module.css';

const defaultFaqItems = [
  {
    question: "Est-ce que le prix affiché est final ?",
    answer: "Non. Le prix affiché est une estimation basée sur les informations fournies. Le prix final sera confirmé après discussion avec un courtier en assurance de dommages."
  },
  {
    question: "Pourquoi dois-je parler à un courtier ?",
    answer: "Un courtier en assurance de dommages peut valider les informations que vous avez fournies et s'assurer que votre couverture correspond exactement à vos besoins et à votre situation."
  },
  {
    question: "Que se passe-t-il après avoir complété la soumission en ligne ?",
    answer: "Après avoir soumis vos informations, un courtier prendra contact avec vous pour confirmer les détails et finaliser votre soumission d'assurance automobile."
  },
  {
    question: "Suis-je obligé d'acheter une assurance après la soumission ?",
    answer: "Non. La soumission est sans engagement. Elle vous permet de comparer les options et de décider à votre rythme."
  },
  {
    question: "Mes informations sont-elles sécurisées ?",
    answer: "Oui. Toutes vos informations personnelles sont traitées de manière sécurisée et conforme aux normes de protection des données."
  },
  {
    question: "Puis-je modifier mes informations après la soumission ?",
    answer: "Oui. Vous pouvez modifier vos informations à tout moment. Les courtiers peuvent ajuster votre soumission en fonction de vos changements."
  }
];

const FAQ = ({ 
  title = "Questions fréquentes", 
  subtitle = "Avez-vous des questions? Nous sommes là pour vous aider.", 
  items = defaultFaqItems 
}) => {
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
