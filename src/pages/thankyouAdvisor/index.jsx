import React, { useState, useEffect, useRef } from 'react';
import { PageContent } from 'components';
import { useNavigate } from 'react-router-dom';
import { Button, Modal } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import styles from './thankyouAdvisor.module.css';
import QuoteModal from '../../components/quoteModal';
import OtherProducts from '../../components/otherProducts';
import { isBannerKeyQuoted } from '../../constants/otherProducts';
import useQuotedProducts from '../../hooks/useQuotedProducts';

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return isMobile;
};

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
  },
  {
    key: 'mortgageBroker',
    title: 'Prêt hypothécaire',
    desc: 'Obtenez le meilleur taux.',
    icon: '/images/Prêt-Hypothécaire.svg'
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
  const isMobile = useIsMobile();
  const exitScrollContainerRef = useRef(null);
  const lottieRef = useRef(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isExitPopupVisible, setIsExitPopupVisible] = useState(false);
  const [activeCardIndex, setActiveCardIndex] = useState(0);

  const [exitScrollState, setExitScrollState] = useState({ canScrollLeft: false, canScrollRight: true });

  // Hide exit-popup cards for products the user has already quoted (completed quote).
  const { quotedProducts } = useQuotedProducts();
  const visibleExitProducts = OTHER_PRODUCTS.filter((p) => !isBannerKeyQuoted(p.key, quotedProducts));

  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeftPos = useRef(0);

  const handleMouseDown = (e) => {
    isDragging.current = true;
    startX.current = e.pageX - e.currentTarget.offsetLeft;
    scrollLeftPos.current = e.currentTarget.scrollLeft;
    e.currentTarget.style.cursor = 'grabbing';
    e.currentTarget.style.userSelect = 'none';
  };

  const handleMouseLeave = (e) => {
    isDragging.current = false;
    e.currentTarget.style.cursor = 'grab';
    e.currentTarget.style.userSelect = 'auto';
  };

  const handleMouseUp = (e) => {
    isDragging.current = false;
    e.currentTarget.style.cursor = 'grab';
    e.currentTarget.style.userSelect = 'auto';
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current) return;
    e.preventDefault();
    const x = e.pageX - e.currentTarget.offsetLeft;
    const walk = (x - startX.current) * 1.5;
    e.currentTarget.scrollLeft = scrollLeftPos.current - walk;
  };

  useEffect(() => {
    if (!document.getElementById('lottie-player-script')) {
      const script = document.createElement('script');
      script.id = 'lottie-player-script';
      script.src = "https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js";
      document.body.appendChild(script);
    }
  }, []);

  const checkExitScroll = () => {
    if (exitScrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = exitScrollContainerRef.current;
      setExitScrollState({
        canScrollLeft: scrollLeft > 0,
        canScrollRight: Math.ceil(scrollLeft + clientWidth) < scrollWidth
      });
    }
  };

  useEffect(() => {
    if (isExitPopupVisible) {
      setTimeout(checkExitScroll, 100);
    }
  }, [isExitPopupVisible]);

  // Coins animation: play the intro once (coins fly up from the bottom),
  // then keep looping only the tail segment so the coins stay up and
  // animate in place instead of re-launching from the bottom.
  useEffect(() => {
    if (!isMobile || !isExitPopupVisible) return;
    const player = lottieRef.current;
    if (!player) return;

    const handleComplete = () => {
      const anim = player.getLottie && player.getLottie();
      if (!anim || !anim.totalFrames) return;
      const loopStart = Math.floor(anim.totalFrames * 0.6); // last 40% = coins-up state
      anim.loop = true;
      anim.playSegments([loopStart, anim.totalFrames], true);
    };

    player.addEventListener('complete', handleComplete);
    return () => player.removeEventListener('complete', handleComplete);
  }, [isMobile, isExitPopupVisible]);

  const handleExitScrollEvent = (e) => {
    const container = e.target;
    const scrollLeft = container.scrollLeft;
    const cardWidth = 236; // 220px width + 16px gap
    const index = Math.round(scrollLeft / cardWidth);
    setActiveCardIndex(index);
    checkExitScroll();
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
                <div className={styles.advisorContactBox}>
                  <div>Courriel: jeanph@norgax.com</div>
                  <div>Tél: +1-514-XXX-XXXX</div>
                </div>
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

        {/* Products Card — shared OtherProducts component */}
        <OtherProducts className={styles.fullWidthProducts} />

        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <Button onClick={() => setIsExitPopupVisible(true)}>
            Exit pop up
          </Button>
        </div>
      </div>

      <QuoteModal
        selectedProduct={selectedProduct}
        isModalVisible={isModalVisible}
        setIsModalVisible={setIsModalVisible}
      />

      {/* Exit Popup — Desktop: centered Modal, Mobile: bottom sheet */}
      {isMobile ? (
        /* Mobile Bottom Sheet */
        isExitPopupVisible && (
          <div className={styles.bottomSheetOverlay} onClick={() => setIsExitPopupVisible(false)}>
            <div className={styles.lottieContainer}>
              <lottie-player
                ref={lottieRef}
                src="/animations/coins_explosion_square.json"
                background="transparent"
                speed="1"
                autoplay
                mode="normal"
                style={{ width: '100%', height: '100%', maxHeight: '400px' }}
              ></lottie-player>
            </div>
            <div className={styles.bottomSheet} onClick={(e) => e.stopPropagation()}>
              <div className={styles.bottomSheetHandle} />
              <button
                className={styles.bottomSheetClose}
                onClick={() => setIsExitPopupVisible(false)}
                aria-label="Fermer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 15 15" fill="none">
                  <path d="M11.25 3.75L3.75 11.25" stroke="#697586" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M3.75 3.75L11.25 11.25" stroke="#697586" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              <div className={styles.bottomSheetBody}>
                <h2 className={styles.exitModalTitle}>
                  Selon votre profil, vous pourriez{' '}
                  <span style={{ color: '#1A1ABA' }}>économiser</span>{' '}
                  sur ces produits.
                </h2>
                <p className={styles.exitModalSubtitle}>Obtenez une soumission gratuite en quelques minutes.</p>

                <div className={styles.bottomSheetCardsWrapper}>
                  <div
                    className={styles.bottomSheetScrollContainer}
                    ref={exitScrollContainerRef}
                    onScroll={handleExitScrollEvent}
                    onMouseDown={handleMouseDown}
                    onMouseLeave={handleMouseLeave}
                    onMouseUp={handleMouseUp}
                    onMouseMove={handleMouseMove}
                    style={{ cursor: 'grab' }}
                  >
                    {visibleExitProducts.map((product) => (
                      <div
                        key={product.key}
                        className={`${styles.exitProductCard} ${product.recommended ? styles.recommendedCard : ''}`}
                      >
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
                        <Button
                          className={styles.productButton}
                          onClick={() => {
                            setSelectedProduct(product);
                            setIsExitPopupVisible(false);
                            setIsModalVisible(true);
                          }}
                        >
                          <span>Obtenir une soumission</span>
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={styles.carouselDots}>
                  {visibleExitProducts.map((_, index) => (
                    <span
                      key={index}
                      className={`${styles.dot} ${index === activeCardIndex ? styles.activeDot : ''}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )
      ) : (
        /* Desktop centered Modal */
        <Modal
          open={isExitPopupVisible}
          onCancel={() => setIsExitPopupVisible(false)}
          footer={null}
          width={1020}
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
              <h2 className={styles.exitModalTitle}>Selon votre profil, vous pourriez <span style={{ color: '#1A1ABA' }}>économiser</span> sur ces produits.</h2>
              <p className={styles.exitModalSubtitle}>Obtenez une soumission gratuite en quelques minutes.</p>

              <div className={styles.exitProductsWrapper}>
                <div className={styles.exitProductsScrollContainer} ref={exitScrollContainerRef} onScroll={handleExitScrollEvent} onMouseDown={handleMouseDown} onMouseLeave={handleMouseLeave} onMouseUp={handleMouseUp} onMouseMove={handleMouseMove} style={{ cursor: 'grab' }}>
                  {visibleExitProducts.map((product) => (
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
              </div>

              <div className={styles.exitModalNav}>
                <button className={`${styles.navButton} ${!exitScrollState.canScrollLeft ? styles.navButtonDisabled : ''}`} aria-label="Previous" onClick={exitScrollLeft}>
                  <LeftOutlined />
                </button>
                <button className={`${styles.navButton} ${!exitScrollState.canScrollRight ? styles.navButtonDisabled : ''}`} aria-label="Next" onClick={exitScrollRight}>
                  <RightOutlined />
                </button>
              </div>
            </div>
            <div className={styles.exitModalRight}>
              <img src="/images/illustration_uiuxcoins.svg" alt="Illustration" className={styles.exitModalIllustration} />
            </div>
          </div>
        </Modal>
      )}

    </PageContent>
  );
};

export default ThankyouAdvisor;
