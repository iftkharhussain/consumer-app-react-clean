import React, { useEffect, useRef } from 'react';
import { PageContent } from 'components';
import { Button } from 'antd';
import { ClockCircleOutlined, SearchOutlined, CheckOutlined } from '@ant-design/icons';
import styles from './FifteenMinutesRedirect.module.css';

const FifteenMinutesRedirect = () => {
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      document.title = 'Vos soumissions ont expiré - Consumer App';
      initialized.current = true;
    }
  }, []);

  return (
    <PageContent pageType="overview">
      <div className={styles.container}>
        
        {/* Header Section */}
        <div className={styles.successBanner}>
          <ClockCircleOutlined className={styles.clockIcon} />
        </div>
        
        <h1 className={styles.mainTitle}>Vos soumissions ont expiré</h1>
        
        <p className={styles.subTitle}>
          Ne vous inquiétez pas! Courtika peut continuer à magasiner pour vous et trouver encore de<br/>
          meilleures options. Continuez avec eux pour finaliser votre assurance.
        </p>

        <div className={styles.infoButton}>
          <SearchOutlined /> Courtika a accès à 30+ assureurs et pourrait peut-être vous trouver un meilleur prix
        </div>

        {/* Action Card */}
        <div className={styles.card}>
          <h2 className={styles.cardTitleCenter}>Voulez-vous que Courtika continue à magasiner pour vous?</h2>
          
          <div className={styles.brokerHeader}>
            <div className={styles.courtikaLogoBox}>
              <img src="/images/courtika-assurances-inc.png" alt="Courtika" className={styles.courtikaImageLogo} />
            </div>
            <div className={styles.statusInfo}>
              <div className={styles.statusBadge}>
                <div className={styles.statusDot}></div>
                Disponible maintenant
              </div>
              <div className={styles.statusSubtitle}>Courtiers certifiés prêts à vous aider</div>
            </div>
          </div>

          <div className={styles.reasonsBox}>
            <h3 className={styles.reasonsTitle}>Pourquoi parler à un courtier maintenant:</h3>
            <ul className={styles.reasonsList}>
              <li>
                <CheckOutlined className={styles.checkIcon} />
                <span><strong>Vos infos seront transmises</strong> - Pas besoin de tout répéter, le courtier aura votre dossier</span>
              </li>
              <li>
                <CheckOutlined className={styles.checkIcon} />
                <span><strong>Service 100% gratuit</strong> - Aucun frais, aucune obligation</span>
              </li>
              <li>
                <CheckOutlined className={styles.checkIcon} />
                <span><strong>Économisez votre temps</strong> - Un expert compare pour vous</span>
              </li>
              <li>
                <CheckOutlined className={styles.checkIcon} />
                <span><strong>Conseils personnalisés</strong> - Adaptés à votre situation</span>
              </li>
              <li>
                <CheckOutlined className={styles.checkIcon} />
                <span><strong>Maximisez vos économies</strong> - Trouvez la meilleure couverture au meilleur prix</span>
              </li>
            </ul>
          </div>

          <Button type="primary" className={styles.primaryButton} size="large">
            <CheckOutlined /> Oui, je veux que Courtika magasine pour moi
          </Button>
          <div className={styles.buttonSubtext}>
            Sans frais • Sans engagement • Vous gardez le contrôle
          </div>
        </div>

        {/* Why clients choose Courtika Card */}
        <div className={styles.aboutCard}>
          <h2 className={styles.aboutTitle}>Pourquoi continuer à magasiner avec Courtika</h2>
          <p className={styles.aboutText}>
            Un cabinet de courtage en assurance de dommages avec plus de 50 ans d'expérience et 90+ courtiers qui comparent pour vous auprès de 30+ assureurs.
          </p>

          <div className={styles.benefitsBox}>
            <h3 className={styles.benefitsBoxTitle}>Ce que Courtika peut faire pour vous:</h3>
            <ul className={styles.benefitsBoxList}>
              <li>
                 <SearchOutlined className={styles.benefitsBoxIcon} />
                 <span><strong>Continuer à magasiner</strong> : Les courtiers pourraient peut-être vous trouver un meilleur prix</span>
              </li>
              <li>
                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={styles.benefitsBoxIcon}>
                   <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
                   <path d="M9 22v-4h6v4"></path>
                   <path d="M8 6h.01"></path>
                   <path d="M16 6h.01"></path>
                   <path d="M12 6h.01"></path>
                   <path d="M12 10h.01"></path>
                   <path d="M12 14h.01"></path>
                   <path d="M16 10h.01"></path>
                   <path d="M16 14h.01"></path>
                   <path d="M8 10h.01"></path>
                   <path d="M8 14h.01"></path>
                 </svg>
                 <span><strong>Accès à 30+ assureurs</strong> : incluant des marchés spécialisés difficiles à trouver</span>
              </li>
              <li>
                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={styles.benefitsBoxIcon}>
                   <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                   <circle cx="9" cy="7" r="4"></circle>
                   <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                   <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                 </svg>
                 <span><strong>90+ courtiers qualifiés</strong> : toujours à l'avant-garde du service et de l'expertise</span>
              </li>
              <li>
                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={styles.benefitsBoxIcon}>
                   <circle cx="12" cy="8" r="7"></circle>
                   <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
                 </svg>
                 <span><strong>Personnaliser vos protections</strong> : Ajustez votre couverture selon vos besoins réels</span>
              </li>
            </ul>
          </div>
          
          <div className={styles.certificationSection}>
            <div>
              <img src="/images/logo-amf-header 1.png" alt="Autorité des marchés financiers" className={styles.amfImageLogo} />
            </div>
            <div className={styles.certText}>
              <h4 className={styles.certTitle}>Courtika est certifié par l'AMF</h4>
              <p className={styles.certSubtitle}>Autorité des marchés financiers du Québec</p>
            </div>
          </div>
        </div>
        
      </div>
    </PageContent>
  );
};

export default FifteenMinutesRedirect;
