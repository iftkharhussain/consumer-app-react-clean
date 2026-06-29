import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { PageContent } from 'components';
import { Button, Collapse } from 'antd';
import { 
  CheckCircleOutlined, 
  CheckCircleFilled, 
  InfoCircleOutlined, 
  CheckOutlined,
  UsergroupAddOutlined 
} from '@ant-design/icons';
import { Types } from '../../utils/helper';
import styles from './Mortgage.module.css';
import OtherProducts from '../../components/otherProducts';

const { Panel } = Collapse;

/**
 * MORTGAGE DATA CONFIGURATION
 * This object controls the UI based on the number of insured persons.
 * In a real scenario, this would come from your API.
 */
const MORTGAGE_DATA = {
  1: {
    title: "Prix estimé",
    totalPrice: "24.33$ - 27.14$",
    persons: [
      { name: "Edward", price: "24.33 - 27.14" }
    ],
    protection: "Temporaire 10 ans",
    coverage: "400 000$",
    disability: "À déterminer",
    isPersonalized: false,
    note: "💡Important: Parlez à votre conseiller, il pourrait vous offrir un meilleur prix avec une stratégie personnalisée"
  },
  2: {
    title: "Prix total estimé",
    totalPrice: "43.02$ - 54.31$",
    persons: [
      { name: "Edward", price: "32.00 - 36.35" },
      { name: "Marie", price: "11.02 - 17.96" }
    ],
    protection: "Temporaire 10 ans",
    coverage: "600 000$",
    disability: "À déterminer",
    isPersonalized: false,
    note: "💡Important: Parlez à votre conseiller, il pourrait vous offrir un meilleur prix avec un produit combiné"
  },
  3: {
    isPersonalized: true,
    persons: [
      { name: "Edward" },
      { name: "Marie" },
      { name: "Julia" }
    ],
    protection: "À déterminer",
    coverage: "À déterminer",
    disability: "À déterminer"
  }
};

const PersonalizedIcon = () => (
  <img src="/images/icon-people.svg" alt="People" style={{ width: 22, height: 18, flexShrink: 0 }} />
);

const CustomInfoIcon = () => (
  <img src="/images/info1.svg" alt="Info" style={{ width: 16, height: 16, cursor: 'pointer', flexShrink: 0 }} />
);

const CustomTickIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="7" viewBox="0 0 10 7" fill="none" style={{ flexShrink: 0 }}>
    <path fillRule="evenodd" clipRule="evenodd" d="M9.5863 0.204951C9.71753 0.33622 9.79125 0.514236 9.79125 0.69985C9.79125 0.885465 9.71753 1.06348 9.5863 1.19475L3.9863 6.79475C3.85503 6.92598 3.67701 6.9997 3.4914 6.9997C3.30578 6.9997 3.12777 6.92598 2.9965 6.79475L0.196498 3.99475C0.0689876 3.86273 -0.00156843 3.68591 2.64618e-05 3.50237C0.00162136 3.31883 0.0752396 3.14326 0.205025 3.01348C0.334811 2.88369 0.51038 2.81007 0.693917 2.80848C0.877455 2.80688 1.05428 2.87744 1.1863 3.00495L3.4914 5.31005L8.5965 0.204951C8.72777 0.0737209 8.90578 0 9.0914 0C9.27701 0 9.45503 0.0737209 9.5863 0.204951Z" fill="#1A1ABA"/>
  </svg>
);

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
      <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
  </span>
);

const Mortgage = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const initialized = useRef(false);
  const { firstName } = useSelector((state) => state.app.user_profile);
  
  // Controls the view: 1, 2, or 3 (for 3+ persons)
  const [numPersons, setNumPersons] = useState(1);
  
  const currentData = MORTGAGE_DATA[numPersons > 2 ? 3 : numPersons];

  useEffect(() => {
    if (!initialized.current) {
      dispatch({
        type: Types.PAGE_HEADING,
        payLoad: {
          title: 'Hypothèque',
          subtitle: 'Vos détails de soumission hypothécaire'
        }
      });
      document.title = 'Assurance hypothécaire - Norga';
      initialized.current = true;
    }
  }, [dispatch]);

  const handleBookCall = () => {
    console.log('Book call clicked');
  };

  const faqItems = [
    {
      key: '1',
      label: "Qu'est-ce que l'assurance prêt hypothécaire?",
      children: "L'assurance prêt hypothécaire protège votre famille en cas de décès ou d'invalidité. Elle permet de rembourser tout ou partie de votre hypothèque, assurant ainsi que vos proches ne perdent pas leur maison."
    },
    {
      key: '2',
      label: "Pourquoi choisir une assurance hypothécaire indépendante?",
      children: "Une assurance indépendante vous appartient, contrairement à celle de la banque. Si vous changez d'institution financière, votre protection vous suit sans que vous ayez à requalifier votre santé."
    },
    {
      key: '3',
      label: "Quelle est la différence avec l'assurance de la banque?",
      children: "L'assurance de la banque est souvent décroissante (le capital diminue avec le prêt) mais le prix reste le même. L'assurance indépendante offre un capital fixe et des bénéficiaires de votre choix."
    }
  ];

  return (
    <PageContent pageType="overview">
      {/* Dev Toggle - Remove this once connected to API */}
      <div style={{ marginBottom: 20, display: 'flex', gap: 10 }}>
        <Button onClick={() => setNumPersons(1)} type={numPersons === 1 ? "primary" : "default"}>1 Personne</Button>
        <Button onClick={() => setNumPersons(2)} type={numPersons === 2 ? "primary" : "default"}>2 Personnes</Button>
        <Button onClick={() => setNumPersons(3)} type={numPersons === 3 ? "primary" : "default"}>3+ Personnes</Button>
      </div>

      <div className={`${styles.mortgagePage} ${numPersons === 1 ? styles.onePersonPage : ''} ${numPersons === 2 ? styles.twoPersonPage : ''} ${numPersons === 3 ? styles.threePersonPage : ''}`}>
        
        {/* Banner Card */}
        <div className={styles.bannerCard}>
          <div className={styles.freeBadge}>
            <CheckCircleFilled /> Gratuit
          </div>
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
            <h2 className={styles.bannerHead}>
              {firstName?.toUpperCase()}, voici votre conseiller pour <span style={{ color: '#2121DD' }}>établir votre stratégie</span> et finaliser votre soumission gratuite
            </h2>
            {currentData.isPersonalized && (
              <div className={styles.bannerWarning}>
                <p className={styles.bannerWarningText}>
                  <strong>Pour 3 personnes et plus:</strong> L'estimation en ligne n'est pas disponible. Votre conseiller vous contactera pour établir votre soumission personnalisée au téléphone.
                </p>
              </div>
            )}
            <p className={styles.bannerDesc}>
              Planifiez maintenant pour être rappelé au meilleur moment. Ensemble, vous établirez la meilleure stratégie pour économiser le plus possible.
            </p>
            <Button className={styles.bannerButton} onClick={handleBookCall}>
              Planifier mon appel maintenant
            </Button>
          </div>
        </div>

        {/* Two Columns Grid */}
        <div className={`${styles.twoColGrid} ${numPersons === 2 ? styles.twoPersonGrid : ''} ${numPersons === 1 ? styles.onePersonGrid : ''} ${numPersons === 3 ? styles.threePersonGrid : ''}`}>
          {/* Main Content Card (Left Side) */}
          <div className={`${styles.gridCard} ${numPersons === 1 ? styles.onePersonPriceCard : ''} ${numPersons === 3 ? styles.threePersonPriceCard : ''}`}>
            {currentData.isPersonalized ? (
              <>
                <div className={styles.cardHeader}>
                  <div className={styles.headerLeft}>
                    <PersonalizedIcon />
                    <span>Soumission personnalisée</span>
                  </div>
                </div>
                <p className={styles.personalizedDesc}>
                  Pour garantir l'exactitude de votre soumission avec plusieurs assurés, le conseiller qui vous a été attribué établira avec vous la meilleure stratégie adaptée à votre situation unique.
                </p>
                <div className={styles.priceDivider}></div>
              </>
            ) : (
              <>
                <div className={styles.cardHeader}>
                  <div className={styles.headerLeft}>
                    <CheckCircleOutlined className={styles.checkIcon} />
                    <span>{currentData.title}</span>
                  </div>
                </div>
                
                {numPersons === 2 && (
                   <div className={styles.namePillContainer}>
                      <span className={styles.namePill}>Edward</span>
                      <span className={styles.namePlus}>+</span>
                      <span className={styles.namePill}>Marie</span>
                   </div>
                )}

                <div className={styles.priceWrapper}>
                  <h2 className={styles.priceBig}>{currentData.totalPrice} <span>/ mois</span></h2>
                </div>

                <div className={styles.importantNote}>
                 
                  <p className={styles.noteText}>{currentData.note}</p>
                </div>
                <div className={styles.priceDivider}></div>

              </>
            )}
            
            <div className={styles.priceRow}>
              <span className={styles.rowLabel}>Type de protection</span>
              <span className={styles.rowValue}>{currentData.protection}</span>
            </div>
            <div className={styles.priceRow}>
              <span className={styles.rowLabel}>Couverture</span>
              <span className={styles.rowValue}>{currentData.coverage}</span>
            </div>
            <div className={styles.priceRow}>
              <span className={styles.rowLabel}>Couverture d'invalidité</span>
              <span className={styles.rowValue}>{currentData.disability}</span>
            </div>
            {numPersons === 2 && <div className={styles.priceDivider}></div>}


            {numPersons === 2 && (
              <div className={styles.avantagesSection}>
                <h4 className={styles.avantagesTitle}>Avantages</h4>
                <div className={styles.avantageItem}>
                  <CustomTickIcon />
                  <span>Tarifs optimaux grâce à la comparaison</span>
                </div>
                <div className={styles.avantageItem}>
                  <CustomTickIcon />
                  <span>Meilleurs rabais avec l'assurance indépendante</span>
                </div>
                <div className={styles.avantageItem}>
                  <CustomTickIcon />
                  <span>Couverture fixe contrairement à l'assurance bancaire</span>
                </div>
              </div>
            )}
          </div>

          {/* Side Content Column (Right Side) */}
          <div className={styles.sideColumn}>
            {numPersons === 2 ? (
              // Individual cards for 2 persons
              currentData.persons.map((person, index) => (
                <div key={index} className={styles.individualCard}>
                  <div className={styles.individualHeader}>
                    <span className={styles.individualName}>{person.name}</span>
                    <span className={styles.individualPrice}>{person.price}$ <span>/ mois</span></span>
                  </div>
                  <div className={styles.subCardHeader}>
                    <span>Meilleurs assureurs</span>
                    <CustomInfoIcon />
                  </div>
                  <div className={styles.insurersGrid}>
                    {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className={styles.insurerBlank}></div>)}
                  </div>
                </div>
              ))
            ) : (
              // Single insurer card for 1 or 3+ persons
              <div className={`${styles.gridCard} ${numPersons === 1 ? styles.onePersonInsurerCard : ''} ${numPersons === 3 ? styles.threePersonInsurerCard : ''}`}>
                <div className={styles.subCardHeader}>
                  <span>Meilleurs assureurs</span>
                  <CustomInfoIcon />
                </div>
                <div className={styles.insurersGrid}>
                  {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className={styles.insurerBlank}></div>)}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* FAQ Card */}
        <div className={styles.faqCard}>
          <div className={styles.faqHeader}>
            <h2 className={styles.faqTitle}>Foire aux questions</h2>
            <p className={styles.faqSub}>Tout ce que vous devez savoir sur le produit et la facturation.</p>
          </div>
          
          <Collapse 
            className={styles.faqCollapse} 
            defaultActiveKey={[]} 
            expandIconPosition="end"
            expandIcon={({ isActive }) => <CustomArrowIcon rotate={isActive ? 180 : 0} />}
          >
            {faqItems.map(item => (
              <Panel header={item.label} key={item.key} className={styles.faqPanel} style={{ fontWeight: 500 }}>
                <p className={styles.faqAnswer}>{item.children}</p>
              </Panel>
            ))}
          </Collapse>

          <div className={styles.faqCta}>
            <img src="/images/user-placeholder.png" alt="Advisor" className={styles.ctaAvatar} />
            <h3 className={styles.ctaTitle}>Vous avez encore des questions?</h3>
            <p className={styles.ctaDesc}>Parlez à votre conseiller Jean-Phil Dion pour qu'il vous aide.</p>
            <Button className={styles.ctaButton} onClick={handleBookCall}>
              Planifier mon appel
            </Button>
          </div>
        </div>

        <OtherProducts className={styles.fullWidthProducts} currentKey="mortgage" />

      </div>
    </PageContent>
  );
};

export default Mortgage;
