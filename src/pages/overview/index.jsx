import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { PageContent } from 'components';
import { Button, Collapse } from 'antd';
import { CheckCircleOutlined, CheckCircleFilled } from '@ant-design/icons';
import { Types } from '../../utils/helper';
import styles from './Overview.module.css';

const { Panel } = Collapse;

const Overview = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const initialized = useRef(false);
  const { firstName } = useSelector((state) => state.app.user_profile);

  useEffect(() => {
    if (!initialized.current) {
      dispatch({
        type: Types.PAGE_HEADING,
        payLoad: {
          title: 'Overview',
          subtitle: 'Your insurance estimate details'
        }
      });
      document.title = 'Overview - Consumer App';
      initialized.current = true;
    }
  }, [dispatch]);

  const customerName = firstName ? `${firstName}` : 'Edward';

  const handleBookCall = () => {
    console.log('Book call clicked');
  };

  const faqItems = [
    {
      key: '1',
      label: "Est-ce qu'il y a un essai gratuit disponible?",
      children: "Oui, vous pouvez nous essayer gratuitement pendant 30 jours. Si vous le souhaitez, nous vous offrirons un appel d'intégration personnalisé gratuit de 30 minutes pour vous aider à démarrer le plus rapidement possible."
    },
    {
      key: '2',
      label: "Puis-je modifier mon plan plus tard?",
      children: "Oui, vous pouvez modifier votre plan d'assurance en fonction de l'évolution de vos besoins en contactant votre conseiller."
    },
    {
      key: '3',
      label: "Quelle est votre politique d'annulation?",
      children: "Vous pouvez annuler votre police à tout moment sans frais de pénalité."
    },
    {
      key: '4',
      label: "Peut-on ajouter d'autres informations à une facture?",
      children: "Absolument, veuillez en discuter avec votre conseiller pour ajuster les détails de facturation."
    },
    {
      key: '5',
      label: "Comment fonctionne la facturation?",
      children: "La facturation est effectuée mensuellement ou annuellement selon votre préférence, avec prélèvement automatique."
    },
    {
      key: '6',
      label: "Comment puis-je changer mon courriel de compte?",
      children: "Vous pouvez mettre à jour vos informations de contact directement depuis les paramètres de votre compte ou en demandant à votre conseiller."
    }
  ];

  return (
    <PageContent pageType="overview">
      <div className={styles.overviewPage}>
        
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
            <h4 className={styles.bannerSubHead}>établir votre stratégie</h4>
            <h2 className={styles.bannerHead}>{customerName}, voici votre conseiller pour finaliser votre soumission gratuite</h2>
            <p className={styles.bannerDesc}>
              Nos experts sont toujours là pour bâtir avec vous une stratégie d'assurance personnalisée, confirmer votre prix instantané, recueillir vos questions personnelles et de santé, puis ajuster la soumission avec précision selon vos besoins.
            </p>
            <Button className={styles.bannerButton} onClick={handleBookCall}>
              Planifier un appel avec votre conseiller
            </Button>
          </div>
        </div>

        {/* Two Columns Grid */}
        <div className={styles.twoColGrid}>
          {/* Price Estimate Card */}
          <div className={styles.gridCard}>
            <div className={styles.cardHeader}>
              <CheckCircleOutlined className={styles.checkIcon} />
              <span>Prix estimé</span>
            </div>
            
            <div className={styles.priceWrapper}>
              <h2 className={styles.priceBig}>24.33$ - 27.14$</h2>
              <p className={styles.priceNote}>Obtenez votre prix final avec le conseiller</p>
            </div>
            
            <div className={styles.priceDivider}></div>
            
            <div className={styles.priceRow}>
              <span className={styles.rowLabel}>Type de protection</span>
              <span className={styles.rowValue}>Temporaire 10 ans</span>
            </div>
            <div className={styles.priceRow}>
              <span className={styles.rowLabel}>Fréquence de paiement</span>
              <span className={styles.rowValue}>Mensuel</span>
            </div>
            <div className={styles.priceRow}>
              <span className={styles.rowLabel}>Couverture</span>
              <span className={styles.rowValue}>400 000$</span>
            </div>
          </div>

          {/* Top Insurers Card */}
          <div className={styles.gridCard}>
            <div className={styles.cardHeader}>
              <span>Meilleurs assureurs</span>
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
            defaultActiveKey={['1']} 
            ghost
            expandIconPosition="end"
            expandIcon={({ isActive }) => (
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="10" 
                height="5" 
                viewBox="0 0 12 7" 
                fill="none"
                style={{ 
                  transform: isActive ? 'rotate(0deg)' : 'rotate(180deg)', 
                  transition: 'transform 0.3s',
                  strokeWidth: '1.667px',
                  stroke: '#697586'
                }}
              >
                <path 
                  d="M10.833 5.83337L5.83301 0.833374L0.833008 5.83337" 
                  stroke="#697586" 
                  strokeWidth="1.66667" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
            )}
          >
            {faqItems.map(item => (
              <Panel header={item.label} key={item.key}>
                <p>{item.children}</p>
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

export default Overview;
