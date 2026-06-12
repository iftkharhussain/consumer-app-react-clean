import React, { useState, useEffect, useRef } from 'react';
import { PageContent } from 'components';
import { useNavigate } from 'react-router-dom';
import { Button, Modal } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import styles from './ThankyouAdvisor.module.css';

const OTHER_PRODUCTS = [
  {
    key: 'mortgage',
    title: 'Assurance hypothécaire',
    desc: 'Protégez votre hypothèque.',
    icon: '/images/NORGA-Assurance-Hypothécaire.svg',
    recommended: true
  },
  {
    key: 'life',
    title: 'Assurance vie',
    desc: 'Protégez vos proches.',
    icon: '/images/NORGA-Assurance-Vie.svg'
  },
  {
    key: 'disability',
    title: 'Assurance salaire',
    desc: 'Protégez votre revenu.',
    icon: '/images/Assurance-Salaire.svg'
  },
  {
    key: 'auto',
    title: 'Assurance auto',
    desc: 'Comparez et économisez.',
    icon: '/images/Assurance-Auto_new.svg'
  },
  {
    key: 'critical',
    title: 'Assurance maladies graves',
    desc: "Faites face à l'imprévu.",
    icon: '/images/NORGA-Assurance-Maladie-Grave.svg'
  }
];

const CheckIcon = () => (
  <div className={styles.featureIconBox}>
    <svg width="10" height="10" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  </div>
);

const ThankyouAdvisor = () => {
  const navigate = useNavigate();
  const scrollContainerRef = useRef(null);
  const exitScrollContainerRef = useRef(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isExitPopupVisible, setIsExitPopupVisible] = useState(false);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  const exitScrollLeft = () => {
    if (exitScrollContainerRef.current) {
      exitScrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const exitScrollRight = () => {
    if (exitScrollContainerRef.current) {
      exitScrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    document.title = 'Votre rendez-vous est confirmé - Norga';
  }, []);

  return (
    <PageContent pageType="overview">
      <div className={styles.container}>
        {/* Header Section */}
        <div className={styles.header}>
          <div className={styles.successIconWrapper}>
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36" fill="none" className={styles.successIcon}>
              <path d="M32.7015 15.0012C33.3865 18.3632 32.8983 21.8583 31.3183 24.9039C29.7382 27.9495 27.1618 30.3613 24.0188 31.7372C20.8757 33.1131 17.3559 33.3699 14.0464 32.4648C10.737 31.5596 7.83778 29.5473 5.83241 26.7633C3.82704 23.9794 2.83668 20.5921 3.02649 17.1663C3.21631 13.7405 4.57482 10.4833 6.87547 7.93796C9.17613 5.39258 12.2799 3.71285 15.6691 3.17889C19.0583 2.64492 22.5282 3.289 25.5 5.0037" stroke="#00A63E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M13.5 16.5L18 21L33 6" stroke="#00A63E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 className={styles.title}>Votre rendez-vous est confirmé !</h1>
          <p className={styles.subtitle}>Un conseiller vous contactera au moment convenu pour discuter de votre dossier.</p>
        </div>

        {/* Appointment Details Card */}
        <div className={styles.card}>
          <div className={styles.appointmentGrid}>
            
            {/* Advisor Column */}
            <div className={styles.appointmentCol}>
              <div className={styles.avatar}>JL</div>
              <div className={styles.colText}>
                <span className={styles.colTitle}>Jean-Luc Tremblay</span>
                <span className={styles.colSubtitle}>Conseiller en sécurité financière</span>
              </div>
            </div>

            {/* Date Column */}
            <div className={styles.appointmentCol}>
              <div className={styles.iconWrapper}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
              </div>
              <div className={styles.colText}>
                <span className={styles.colTitle}>Mardi 25 mars 2025</span>
                <span className={styles.colSubtitle}>10:00 AM</span>
              </div>
            </div>

            {/* Type Column */}
            <div className={styles.appointmentCol}>
              <div className={styles.iconWrapper}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
              </div>
              <div className={styles.colText}>
                <span className={styles.colTitle}>Appel téléphonique</span>
                <span className={styles.colSubtitle}>30 min</span>
              </div>
            </div>

          </div>
          
          <div className={styles.confirmationMessage}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.messageIcon}>
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
              <polyline points="22,6 12,13 2,6"></polyline>
            </svg>
            <p className={styles.messageText}>
              Une confirmation a été envoyée à votre adresse courriel. Le conseiller vous appellera directement au numéro fourni lors de votre inscription.
            </p>
          </div>
        </div>

        {/* Products Card */}
        <div className={styles.otherProductsCard}>
          <div className={styles.otherProductsHeader}>
            <h2 className={styles.otherProductsTitle}>Selon votre profil, vous pourriez aussi économiser sur ces produits</h2>
            <div className={styles.otherProductsNav}>
              <button className={styles.navButton} aria-label="Previous" onClick={scrollLeft}>
                <LeftOutlined />
              </button>
              <button className={styles.navButton} aria-label="Next" onClick={scrollRight}>
                <RightOutlined />
              </button>
            </div>
          </div>

          <div className={styles.productsScrollContainer} ref={scrollContainerRef}>
            {OTHER_PRODUCTS.map((product) => (
              <div key={product.key} className={`${styles.productCard} ${product.recommended ? styles.recommendedCard : ''}`}>
                <div className={styles.productCardTop}>
                  <div className={styles.productIconWrapper}>
                    <img src={product.icon} alt={product.title} className={styles.productIcon} />
                  </div>
                  {product.recommended && (
                    <div className={styles.recommendedBadge}>RECOMMANDÉ</div>
                  )}
                </div>
                <h3 className={styles.productTitle}>{product.title}</h3>
                <p className={styles.productDesc}>{product.desc}</p>
                <Button className={styles.productButton} onClick={() => {
                  setSelectedProduct(product);
                  setIsModalVisible(true);
                }}>
                  <span>Obtenir une soumission</span>
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <Button onClick={() => setIsExitPopupVisible(true)}>
            Exit pop up
          </Button>
        </div>
      </div>

      <Modal
        open={isModalVisible}
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={800}
        centered
        className={styles.productModal}
        closeIcon={
          <span className={styles.modalCloseIcon}>
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 15 15" fill="none" style={{ flexShrink: 0 }}>
              <path d="M11.25 3.75L3.75 11.25" stroke="#697586" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3.75 3.75L11.25 11.25" stroke="#697586" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
        }
      >
        {selectedProduct && (
          <div className={styles.modalContent}>
            {/* Left Column */}
            <div className={styles.modalLeft}>
              <div className={styles.modalHeader}>
                <div className={styles.modalIconBox}>
                  <img src={selectedProduct.icon} alt={selectedProduct.title} className={styles.modalProductIcon} />
                </div>
                <div className={styles.modalBadge}>{selectedProduct.title}</div>
              </div>
              <h2 className={styles.modalTitle}>Délègue le magasinage de ton {selectedProduct.title.toLowerCase()}</h2>
              <p className={styles.modalDesc}>On compare les différents assureurs pour toi.</p>
              
              <Button className={styles.modalActionBtn}>
                Commencer maintenant
              </Button>

              <div className={styles.modalFeatures}>
                <div className={styles.featureItem}>
                  <CheckIcon />
                  <span>Gratuit et sans engagement</span>
                </div>
                <div className={styles.featureItem}>
                  <CheckIcon />
                  <span>Comparaison de plusieurs options</span>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className={styles.modalRight}>
              <h4 className={styles.partnersTitle}>ASSUREURS ET PARTENAIRES</h4>
              
              <div className={styles.partnersGrid}>
                <div className={styles.marqueeTrack}>
                  {[
                    { name: 'Assureur B', icon: '/images/Assurance-Habitation.svg' },
                    { name: 'Assureur C', icon: '/images/NORGA-Assurance-Vie.svg' },
                    { name: 'Assureur D', icon: '/images/Assurance-Salaire.svg' },
                    { name: 'Assureur E', icon: '/images/NORGA-Assurance-Maladie-Grave.svg' },
                    { name: 'Assureur F', icon: '/images/Assurance-Auto_new.svg' },
                    { name: 'Assureur B', icon: '/images/Assurance-Habitation.svg' },
                    { name: 'Assureur C', icon: '/images/NORGA-Assurance-Vie.svg' },
                    { name: 'Assureur D', icon: '/images/Assurance-Salaire.svg' },
                    { name: 'Assureur E', icon: '/images/NORGA-Assurance-Maladie-Grave.svg' },
                    { name: 'Assureur F', icon: '/images/Assurance-Auto_new.svg' }
                  ].map((partner, idx) => (
                    <div key={idx} className={styles.partnerCard}>
                       <img src={partner.icon} alt={partner.name} className={styles.partnerIcon} />
                       <span>{partner.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <p className={styles.partnersDesc}>
                Nous analysons les offres de nos partenaires pour vous présenter les meilleures options selon votre profil.
              </p>
            </div>
          </div>
        )}
      </Modal>
      <Modal
        open={isExitPopupVisible}
        onCancel={() => setIsExitPopupVisible(false)}
        footer={null}
        width={950}
        centered
        className={styles.exitModal}
        closeIcon={
          <span className={styles.modalCloseIcon}>
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 15 15" fill="none" style={{ flexShrink: 0 }}>
              <path d="M11.25 3.75L3.75 11.25" stroke="#697586" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3.75 3.75L11.25 11.25" stroke="#697586" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
        }
      >
        <div className={styles.exitModalContent}>
          <div className={styles.exitModalLeft}>
            <h2 className={styles.exitModalTitle}>Selon votre profil, vous pourriez économiser sur ces produits.</h2>
            <p className={styles.exitModalSubtitle}>Obtenez une soumission gratuite en quelques minutes.</p>
            
            <div className={styles.exitProductsScrollContainer} ref={exitScrollContainerRef}>
              {OTHER_PRODUCTS.map((product) => (
                <div key={product.key} className={`${styles.exitProductCard} ${product.recommended ? styles.recommendedCard : ''}`}>
                  <div className={styles.productCardTop}>
                    <div className={styles.productIconWrapper}>
                      <img src={product.icon} alt={product.title} className={styles.productIcon} />
                    </div>
                    {product.recommended && (
                      <div className={styles.recommendedBadge}>RECOMMANDÉ</div>
                    )}
                  </div>
                  <h3 className={styles.productTitle}>{product.title}</h3>
                  <p className={styles.productDesc}>{product.desc}</p>
                  <Button className={styles.productButton} onClick={() => {
                    setSelectedProduct(product);
                    setIsExitPopupVisible(false);
                    setIsModalVisible(true);
                  }}>
                    <span>Obtenir une soumission</span>
                  </Button>
                </div>
              ))}
            </div>

            <div className={styles.exitModalNav}>
              <button className={styles.navButton} aria-label="Previous" onClick={exitScrollLeft}>
                <LeftOutlined />
              </button>
              <button className={styles.navButton} aria-label="Next" onClick={exitScrollRight}>
                <RightOutlined />
              </button>
            </div>
          </div>
          <div className={styles.exitModalRight}>
            <img src="/images/illustration_uiuxcoins.svg" alt="Illustration" className={styles.exitModalIllustration} />
          </div>
        </div>
      </Modal>

    </PageContent>
  );
};

export default ThankyouAdvisor;
