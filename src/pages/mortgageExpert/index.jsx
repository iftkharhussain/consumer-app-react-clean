import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Collapse } from 'antd';
import { 
  CheckCircleOutlined, 
  CheckCircleFilled,
  BulbOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { PageContent } from 'components';
import { Types } from '../../utils/helper';
import styles from './MortgageExpert.module.css';
import OtherProducts from '../../components/otherProducts';

const { Panel } = Collapse;

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

const MORTGAGE_RATES = {
  "3 ans": {
    fixed: "4.89% - 5.49%",
    variable: "4.25% - 5.15%"
  },
  "5 ans": {
    fixed: "4.39% - 4.99%",
    variable: "3.75% - 4.65%"
  }
};

const FAQ_DATA = [
  {
    key: '1',
    question: "Est-ce qu'il y a un essai gratuit disponible?",
    answer: "Oui, vous pouvez nous essayer gratuitement pendant 30 jours. Si vous le souhaitez, nous vous offrirons un appel d'intégration personnalisé gratuit de 30 minutes pour vous aider à démarrer le plus rapidement possible."
  },
  {
    key: '2',
    question: "Puis-je modifier mon plan plus tard?",
    answer: "Oui, vous pouvez modifier votre plan d'assurance en fonction de l'évolution de vos besoins en contactant votre conseiller."
  },
  {
    key: '3',
    question: "Quelle est votre politique d'annulation?",
    answer: "Vous pouvez annuler votre police à tout moment sans frais de pénalité."
  },
  {
    key: '4',
    question: "Peut-on ajouter d'autres informations à une facture?",
    answer: "Absolument, veuillez en discuter avec votre conseiller pour ajuster les détails de facturation."
  },
  {
    key: '5',
    question: "Comment fonctionne la facturation?",
    answer: "La facturation est effectuée mensuellement ou annuellement selon votre préférence, avec prélèvement automatique."
  },
  {
    key: '6',
    question: "Comment puis-je changer mon courriel de compte?",
    answer: "Vous pouvez mettre à jour vos informations de contact directement depuis les paramètres de votre compte ou en demandant à votre conseiller."
  }
];

const MortgageExpert = () => {
  const dispatch = useDispatch();
  const initialized = useRef(false);
  const { firstName } = useSelector((state) => state.app.user_profile);
  const [activeTab, setActiveTab] = useState("5 ans");
  const [activeFaq, setActiveFaq] = useState([]);

  useEffect(() => {
    if (!initialized.current) {
      dispatch({
        type: Types.PAGE_HEADING,
        payLoad: {
          title: 'Courtier hypothécaire',
          subtitle: 'Trouvez le meilleur taux pour votre hypothèque'
        }
      });
      document.title = 'Hypothèque - Norga';
      initialized.current = true;
    }
  }, [dispatch]);

  const handleBookCall = () => {
    console.log("Booking call with mortgage broker...");
  };

  const currentRates = MORTGAGE_RATES[activeTab];

  return (
    <PageContent pageType="overview">
      <div className={styles.mortgageExpertPage}>
        
        {/* Banner Card */}
        <div className={styles.bannerCard}>
          <div className={styles.advisorProfileBox}>
            {/* Using a different avatar as in the image */}
            <img src="/images/user-placeholder.png" alt="Advisor" className={styles.advisorAvatarLarge} />
            <h3 className={styles.advisorNameLarge}>Jean-Phil Dion</h3>
            <p className={styles.advisorTitleLarge}>Courtier hypothécaire</p>
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
              Nos experts sont toujours là pour bâtir avec vous une stratégie hypothécaire personnalisée, confirmer votre taux instantané, recueillir vos questions personnelles et financières, puis ajuster la soumission avec précision selon vos besoins.
            </p>
            <Button className={styles.bannerButton} onClick={handleBookCall}>
              Planifier un appel avec votre courtier
            </Button>
          </div>
        </div>

        {/* Two Columns Grid */}
        <div className={styles.twoColGrid}>
          {/* Left: Rates Card */}
          <div className={`${styles.gridCard} ${styles.ratesCard}`}>
            <div className={styles.cardHeader}>
              <div className={styles.headerLeft}>
                <CheckCircleOutlined className={styles.checkIcon} />
                <span>Taux estimés*</span>
                <CustomInfoIcon />
              </div>
              <div className={styles.tabsContainer}>
                {["3 ans", "5 ans"].map(tab => (
                  <div 
                    key={tab} 
                    className={`${styles.tabItem} ${activeTab === tab ? styles.tabActive : ''}`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab}
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.ratesSection}>
              <div className={styles.rateBlock}>
                <p className={styles.rateLabel}>Fixe {activeTab}</p>
                <h2 className={styles.rateBig}>{currentRates.fixed}</h2>
              </div>
              
              <div className={styles.ratesDivider}></div>
              
              <div className={styles.rateBlock}>
                <p className={styles.rateLabel}>Variable {activeTab}</p>
                <h2 className={styles.rateBig}>{currentRates.variable}</h2>
              </div>
            </div>

            <div className={styles.importantNote}>
             
              <p className={styles.noteText}>
                💡
                Important: Parlez à votre courtier hypothécaire pour obtenir un taux final et précis, car les taux dépendent de plusieurs facteurs personnels
              </p>
            </div>
            
            <p className={styles.timestamp}>*Mis à jour le 08/05/2026 · Taux indicatifs, variables selon votre situation</p>
          </div>

          {/* Right: Lenders Card */}
          <div className={`${styles.gridCard} ${styles.lendersCard}`}>
            <div className={styles.subCardHeader}>
              <span>Meilleurs prêteurs</span>
              <CustomInfoIcon />
            </div>
            <div className={styles.insurersGrid}>
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
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
            defaultActiveKey={[]}
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

          <div className={styles.faqCta}>
            <img src="/images/user-placeholder.png" alt="Advisor" className={styles.ctaAvatar} />
            <h3 className={styles.ctaTitle}>Vous avez encore des questions?</h3>
            <p className={styles.ctaDesc}>Parlez à votre courtier Jean-Phil Dion pour qu'il vous aide.</p>
            <Button className={styles.ctaButton} onClick={handleBookCall}>
              Planifier mon appel
            </Button>
          </div>
        </div>

        <OtherProducts className={styles.fullWidthProducts} currentKey="mortgageBroker" />

      </div>
    </PageContent>
  );
};

export default MortgageExpert;
