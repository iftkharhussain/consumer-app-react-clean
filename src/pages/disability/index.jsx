import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Button, Collapse, Modal } from 'antd';
import { 
  CheckCircleOutlined, 
  CheckCircleFilled,
  BulbOutlined,
  InfoCircleOutlined,
  LeftOutlined,
  RightOutlined
} from '@ant-design/icons';
import styles from './Disability.module.css';

const { Panel } = Collapse;

// Reuse the same CustomArrowIcon for consistent FAQ look
const CustomArrowIcon = ({ rotate = 0, size = '1.2em' }) => (
  <span 
    role="img" 
    aria-label="arrow" 
    className="anticon" 
    style={{ 
      display: 'inline-flex', 
      alignItems: 'center',
      transform: `rotate(${rotate}deg)`,
      transition: 'transform 0.3s',
      verticalAlign: '-0.125em',
      fontSize: size
    }}
  >
    <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9l6 6 6-6" />
    </svg>
  </span>
);

const CustomInfoIcon = () => (
  <img src="/images/info1.svg" alt="Info" style={{ width: 16, height: 16, cursor: 'pointer', flexShrink: 0 }} />
);

const DISABILITY_DATA = {
  protection: "Assurance salaire et invalidité",
  annualIncome: "75 000$",
  monthlyAmount: "4 375$",
  waitingPeriod: "90 jours",
  benefitPeriod: "5 ans",
  note: " 💡 Important: Votre conseiller vous offrira une soumission en fonction des infos fournis mais vous pouvez toujours les modifier avec lui au téléphone"
};

const FAQ_DATA = [
  {
    key: '1',
    question: "Qu'est-ce que l'assurance salaire et invalidité?",
    answer: "L'assurance salaire (ou invalidité) est conçue pour remplacer une partie de votre revenu si vous ne pouvez plus travailler en raison d'une maladie ou d'un accident. Elle vous permet de maintenir votre niveau de vie et de payer vos factures courantes."
  },
  {
    key: '2',
    question: "Pourquoi choisir une assurance invalidité indépendante?",
    answer: "Contrairement aux assurances collectives d'employeur, une police individuelle vous appartient. Elle vous suit si vous changez d'emploi, et les prestations sont généralement non imposables si vous payez les primes vous-même."
  },
  {
    key: '3',
    question: "Comment est calculé le montant mensuel assuré?",
    answer: "Le montant est généralement basé sur un pourcentage de votre revenu brut (souvent entre 60% et 85%). L'objectif est de couvrir vos besoins essentiels sans dépasser votre revenu net habituel."
  },
  {
    key: '4',
    question: "Qu'est-ce que le délai de carence?",
    answer: "C'est la période d'attente entre le début de votre invalidité et le moment où vous commencez à recevoir vos prestations. Plus le délai est long (ex: 90 jours), plus la prime est abordable."
  },
  {
    key: '5',
    question: "Puis-je annuler mon assurance?",
    answer: "Oui, vous pouvez annuler votre contrat à tout moment sans pénalité. Cependant, il est recommandé de parler à votre conseiller pour explorer des ajustements de couverture avant d'annuler complètement votre protection."
  }
];

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

const DisabilityPage = () => {
  const [activeFaq, setActiveFaq] = useState([]);
  const { firstName } = useSelector((state) => state.app.user_profile);
  const scrollContainerRef = useRef(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

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

  const handleBookCall = () => {
    console.log("Booking call for disability insurance...");
    // Future integration with booking logic
  };

  useEffect(() => {
    document.title = 'Assurance salaire et invalidité - Norga';
  }, []);

  return (
    <div className={styles.disabilityPage}>
      {/* Banner Section */}
      <div className={styles.bannerCard}>
        <div className={styles.advisorProfileBox}>
          <img src="/images/user-placeholder.png" alt="Advisor" className={styles.advisorAvatarLarge} />
          <h3 className={styles.advisorNameLarge}>Jean-Phil Dion</h3>
          <p className={styles.advisorTitleLarge}>Conseiller en sécurité financière</p>
          <div className={styles.advisorContactBox}>
            <div>Courriel: jeanph@norgax.com</div>
            <div>Tél: +1-514-XXX-XXXX</div>
          </div>
        </div>
        
        <div className={styles.bannerContent}>
          <div className={styles.freeBadge}>
            <CheckCircleFilled /> Gratuit
          </div>
          <h2 className={styles.bannerHead}>
            {firstName?.toUpperCase()}, voici votre conseiller pour <span style={{ color: '#2121DD' }}>établir votre stratégie</span> et finaliser votre soumission gratuite
          </h2>
          <p className={styles.bannerDesc}>
            En assurance salaire et invalidité, les tarifs ne peuvent pas être offerts en ligne. 
            Vous pouvez soit attendre l'appel du conseiller qui vous contactera dès que possible, 
            ou planifier un moment précis pour vous assurer qu'il vous appelle au bon moment.
          </p>
          <Button className={styles.bannerButton} onClick={handleBookCall}>
            Planifier mon appel maintenant
          </Button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className={styles.twoColGrid}>
        {/* Left: Info Card */}
        <div className={styles.gridCard}>
          <div className={styles.cardHeader}>
            <div className={styles.headerLeft}>
              <CheckCircleOutlined className={styles.checkIcon} />
              <span>Informations de votre soumission</span>
            </div>
          </div>

          <div className={styles.importantNote}>
           
            <p className={styles.noteText}>
              {DISABILITY_DATA.note}
            </p>
          </div>
          <div className={styles.priceDivider}></div>

          <div className={styles.infoRows}>
            <div className={styles.priceRow}>
              <span className={styles.rowLabel}>Type de protection</span>
              <span className={styles.rowValue}>{DISABILITY_DATA.protection}</span>
            </div>
            <div className={styles.priceRow}>
              <span className={styles.rowLabel}>Revenu annuel protégé</span>
              <span className={styles.rowValue}>{DISABILITY_DATA.annualIncome}</span>
            </div>
            <div className={styles.priceRow}>
              <span className={styles.rowLabel}>Montant mensuel assuré</span>
              <span className={styles.rowValue}>{DISABILITY_DATA.monthlyAmount}</span>
            </div>
            <div className={styles.priceRow}>
              <span className={styles.rowLabel}>Délai de carence</span>
              <span className={styles.rowValue}>{DISABILITY_DATA.waitingPeriod}</span>
            </div>
            <div className={styles.priceRow}>
              <span className={styles.rowLabel}>Période de prestations</span>
              <span className={styles.rowValue}>{DISABILITY_DATA.benefitPeriod}</span>
            </div>
          </div>
        </div>

        {/* Right: Insurers Card */}
        <div className={`${styles.gridCard} ${styles.insurersCard}`}>
          <div className={styles.subCardHeader}>
            <span>Meilleurs assureurs</span>
            <CustomInfoIcon />
          </div>
          <div className={styles.insurersGrid}>
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className={styles.insurerBlank}></div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className={styles.faqCard}>
        <div className={styles.faqHeader}>
          <h2 className={styles.faqTitle}>Foire aux questions</h2>
          <p className={styles.faqSub}>Tout ce que vous devez savoir sur le produit et la facturation.</p>
        </div>

        <Collapse
          ghost
          className={styles.faqCollapse}
          activeKey={activeFaq}
          onChange={setActiveFaq}
          expandIcon={({ isActive }) => <CustomArrowIcon rotate={isActive ? 180 : 0} />}
          expandIconPosition="end"
        >
          {FAQ_DATA.map((item) => (
            <Panel 
              header={item.question} 
              key={item.key} 
              className={styles.faqPanel}
              style={{ fontWeight: 500, fontSize: '15px' }}
            >
              <p className={styles.faqAnswer}>{item.answer}</p>
            </Panel>
          ))}
        </Collapse>

        {/* Bottom CTA */}
        <div className={styles.faqCta}>
          <img src="/images/user-placeholder.png" alt="Advisor" className={styles.ctaAvatar} />
          <h3 className={styles.ctaTitle}>Vous avez encore des questions?</h3>
          <p className={styles.ctaDesc}>Parlez à votre conseiller Jean-Phil Dion pour qu'il vous aide.</p>
          <Button className={styles.ctaButton} onClick={handleBookCall}>
            Planifier mon appel
          </Button>
        </div>
      </div>

      {/* Other Products Section */}
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

    </div>
  );
};

export default DisabilityPage;
