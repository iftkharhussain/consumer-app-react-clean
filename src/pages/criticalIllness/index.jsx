import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { PageContent } from 'components';
import { Button, Collapse } from 'antd';
import { CheckCircleOutlined, CheckCircleFilled } from '@ant-design/icons';
import { Types } from '../../utils/helper';
import styles from './CriticalIllness.module.css';

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
      <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
  </span>
);

const CustomInfoIcon = () => (
  <img src="/images/info1.svg" alt="Info" style={{ width: 16, height: 16, cursor: 'pointer', flexShrink: 0 }} />
);

const CriticalIllness = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const initialized = useRef(false);
  const { firstName } = useSelector((state) => state.app.user_profile);

  useEffect(() => {
    if (!initialized.current) {
      dispatch({
        type: Types.PAGE_HEADING,
        payLoad: {
          title: 'Assurance maladie grave',
          subtitle: 'Détails de votre protection'
        }
      });
      document.title = 'Assurance maladie grave - Consumer App';
      initialized.current = true;
    }
  }, [dispatch]);

  const handleBookCall = () => {
    console.log('Book call clicked');
  };

  const faqItems = [
    {
      key: '1',
      label: "Qu'est-ce que l'assurance maladie grave?",
      children: "L'assurance maladie grave vous protège financièrement en cas de diagnostic d'une maladie grave comme un cancer, une crise cardiaque ou un AVC. Elle verse un montant forfaitaire qui vous aide à couvrir vos dépenses pendant votre rétablissement."
    },
    {
      key: '2',
      label: "Quelles maladies sont couvertes?",
      children: "Généralement, les polices couvrent les maladies les plus courantes comme le cancer, les crises cardiaques et les accidents vasculaires cérébraux (AVC). Certaines polices peuvent couvrir jusqu'à 25 maladies ou plus selon le plan choisi."
    },
    {
      key: '3',
      label: "Comment fonctionne le versement des prestations?",
      children: "Le versement est effectué sous forme de montant forfaitaire unique et libre d'impôt, une fois la période de survie (généralement 30 jours) écoulée après le diagnostic d'une maladie couverte."
    },
    {
      key: '4',
      label: "Puis-je modifier ma couverture plus tard?",
      children: "Oui, vous pouvez demander une révision de votre couverture à tout moment. Votre conseiller pourra vous aider à ajuster le montant en fonction de l'évolution de vos besoins financiers."
    },
    {
      key: '5',
      label: "Y a-t-il une période d'attente après le diagnostic?",
      children: "Oui, la plupart des polices incluent une période de survie de 30 jours. Cela signifie que l'assuré doit survivre 30 jours après le diagnostic initial pour que la prestation soit versée."
    },
    {
      key: '6',
      label: "Puis-je annuler mon assurance?",
      children: "Absolument. Vous pouvez annuler votre police à tout moment. Il n'y a généralement pas de frais de pénalité pour l'annulation."
    }
  ];

  return (
    <PageContent pageType="overview">
      <div className={styles.criticalIllnessPage}>
        
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
            <p className={styles.bannerDesc}>
              En assurance maladie grave, les tarifs ne peuvent pas être offerts en ligne. Vous pouvez soit attendre l'appel du conseiller qui vous contactera dès que possible, ou planifier un moment précis pour vous assurer qu'il vous appelle au bon moment.
            </p>
            <Button className={styles.bannerButton} onClick={handleBookCall}>
              Planifier mon appel maintenant
            </Button>
          </div>
        </div>

        {/* Two Columns Grid */}
        <div className={styles.twoColGrid}>
          {/* Submission Info Card */}
          <div className={styles.gridCard}>
            <div className={styles.cardHeader}>
              <CheckCircleOutlined className={styles.checkIcon} />
              <span>Informations de votre soumission</span>
            </div>
            
            <div className={styles.infoBox}>
           
              <p className={styles.infoText}>
               💡 Important: Votre conseiller vous offrira une soumission en fonction des infos fournis mais vous pouvez toujours les modifier avec lui au téléphone
              </p>
            </div>
            <div className={styles.priceDivider}></div>
            
            <div className={styles.priceRow}>
              <span className={styles.rowLabel}>Type de protection</span>
              <span className={styles.rowValue}>Assurance maladie grave</span>
            </div>
            <div className={styles.priceRow}>
              <span className={styles.rowLabel}>Montant de couverture</span>
              <span className={styles.rowValue}>100 000$</span>
            </div>
            <div className={styles.priceRow}>
              <span className={styles.rowLabel}>Nombre de maladies couvertes</span>
              <span className={styles.rowValue}>25 maladies</span>
            </div>
            <div className={styles.priceRow}>
              <span className={styles.rowLabel}>Période de survie</span>
              <span className={styles.rowValue}>30 jours</span>
            </div>
            <div className={styles.priceRow}>
              <span className={styles.rowLabel}>Durée de la protection</span>
              <span className={styles.rowValue}>Jusqu'à 65 ans</span>
            </div>
          </div>

          {/* Top Insurers Card */}
          <div className={`${styles.gridCard} ${styles.insurersCard}`}>
            <div className={styles.subCardHeader}>
              <span>Meilleurs assureurs</span>
              <CustomInfoIcon />
            </div>
            <div className={styles.insurersGrid}>
              <div className={styles.insurerBlank}></div>
              <div className={styles.insurerBlank}></div>
              <div className={styles.insurerBlank}></div>
              <div className={styles.insurerBlank}></div>
              <div className={styles.insurerBlank}></div>
              <div className={styles.insurerBlank}></div>
            </div>
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
        
      </div>
    </PageContent>
  );
};

export default CriticalIllness;
