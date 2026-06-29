import React from 'react';
import { Button, Modal } from 'antd';
import styles from './QuoteModal.module.css';

// Auto insurance partners -> /images/logo_assurance_auto
const AUTO_LOGOS = [
  { name: 'Economical', icon: '/images/logo_assurance_auto/Economical.png' },
  { name: 'Pafco', icon: '/images/logo_assurance_auto/Pafco.png' },
  { name: 'Intact', icon: '/images/logo_assurance_auto/intact.png' },
  { name: "L'Unique", icon: '/images/logo_assurance_auto/lunique.png' },
  { name: 'Optimum', icon: '/images/logo_assurance_auto/optimum.png' },
  { name: 'Promutuel', icon: '/images/logo_assurance_auto/promutuel.png' },
  { name: 'Wawanesa', icon: '/images/logo_assurance_auto/wawanesa.png' }
];

// Personal insurance (life, disability, critical illness, mortgage insurance) -> /images/logo-assurance-de-personne
const PERSONNE_LOGOS = [
  { name: 'Assomption Vie', icon: '/images/logo-assurance-de-personne/assomption-vie.png' },
  { name: 'Banque Nationale', icon: '/images/logo-assurance-de-personne/banque-national.png' },
  { name: 'Beneva', icon: '/images/logo-assurance-de-personne/beneva.png' },
  { name: 'BMO', icon: '/images/logo-assurance-de-personne/bmo.png' },
  { name: 'Canada Vie', icon: '/images/logo-assurance-de-personne/canada-vie.png' },
  { name: 'CIBC', icon: '/images/logo-assurance-de-personne/cibc.png' },
  { name: 'Co-operators', icon: '/images/logo-assurance-de-personne/co-operators.png' },
  { name: 'Croix Bleue', icon: '/images/logo-assurance-de-personne/croix-bleu.png' },
  { name: 'Desjardins', icon: '/images/logo-assurance-de-personne/desjardins.png' },
  { name: 'Empire Vie', icon: '/images/logo-assurance-de-personne/empire-vie.png' },
  { name: 'Equitable', icon: '/images/logo-assurance-de-personne/equitable.png' },
  { name: 'Foresters', icon: '/images/logo-assurance-de-personne/financiere-foresters.png' },
  { name: 'Humania', icon: '/images/logo-assurance-de-personne/humania.png' },
  { name: 'iA', icon: '/images/logo-assurance-de-personne/ia.png' },
  { name: 'ivari', icon: '/images/logo-assurance-de-personne/ivari.png' },
  { name: 'Manuvie', icon: '/images/logo-assurance-de-personne/manuvie.png' },
  { name: 'Plan de Protection', icon: '/images/logo-assurance-de-personne/plan-de-protection.png' },
  { name: 'RBC', icon: '/images/logo-assurance-de-personne/rbc.png' },
  { name: 'Sun Life', icon: '/images/logo-assurance-de-personne/sun-life.png' },
  { name: 'UV Assurance', icon: '/images/logo-assurance-de-personne/uv-assurance.png' }
];

// Mortgage broker / rate partners -> /images/logo_taux
const TAUX_LOGOS = [
  { name: 'B2B Bank', icon: '/images/logo_taux/b2b-bank.png' },
  { name: 'Banque Laurentienne', icon: '/images/logo_taux/banque-laurentienne.png' },
  { name: 'Banque Nationale', icon: '/images/logo_taux/banque-national.png' },
  { name: 'Banque Scotia', icon: '/images/logo_taux/banque-scotia.png' },
  { name: 'BMO', icon: '/images/logo_taux/bmo.png' },
  { name: 'CIBC', icon: '/images/logo_taux/cibc.png' },
  { name: 'Desjardins', icon: '/images/logo_taux/desjardins.png' },
  { name: 'First National', icon: '/images/logo_taux/first-national.png' },
  { name: 'Haventree', icon: '/images/logo_taux/haventree.png' },
  { name: 'HSBC', icon: '/images/logo_taux/hsbc.png' },
  { name: 'Manuvie', icon: '/images/logo_taux/manuvie.png' },
  { name: 'MCAP', icon: '/images/logo_taux/mcap.png' },
  { name: 'RBC', icon: '/images/logo_taux/rbc.png' },
  { name: 'TD', icon: '/images/logo_taux/td.png' }
];

// Pick the partner logos based on the selected product / card.
const getPartnerLogos = (selectedProduct) => {
  switch (selectedProduct?.key) {
    case 'auto':
      return AUTO_LOGOS;
    case 'mortgageBroker':
    case 'broker':
    case 'taux':
      return TAUX_LOGOS;
    // life, disability, critical, mortgage (mortgage insurance) and any default
    default:
      return PERSONNE_LOGOS;
  }
};

const CheckIcon = () => (
  <div className={styles.featureIconBox}>
    <svg width="10" height="10" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  </div>
);

const QuoteModal = ({ selectedProduct, isModalVisible, setIsModalVisible }) => {
  const partnerLogos = getPartnerLogos(selectedProduct);
  return (
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
              <div
                className={styles.marqueeTrack}
                style={{ animationDuration: `${partnerLogos.length * 0.75}s` }}
              >
                {[...partnerLogos, ...partnerLogos].map((partner, idx) => (
                  <div key={idx} className={styles.partnerCard}>
                     <img src={partner.icon} alt={partner.name} className={styles.partnerIcon} />
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
  );
};

export default QuoteModal;
