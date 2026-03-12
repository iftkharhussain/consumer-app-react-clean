import React, { useEffect, useRef, useState } from 'react';
import { PageContent } from 'components';
import { Button } from 'antd';
import { 
  WarningOutlined, 
  CheckOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  InfoCircleOutlined,
  PhoneOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import styles from './FallbackNoQuotes.module.css';
import ScheduleModal from '../../components/fallbackquote/ScheduleModal';

const FallbackNoQuotes = () => {
  const navigate = useNavigate();
  const initialized = useRef(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);

  useEffect(() => {
    if (!initialized.current) {
      document.title = 'Impossible de générer vos soumissions - Consumer App';
      initialized.current = true;
    }
  }, []);

  const handleSubmit = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 1500);
  };

  return (
    <PageContent pageType="overview">
      <div className={styles.fallbackContainer}>
      
        <div className={styles.headerSection}>
          <div className={styles.warningIconWrapper}>
            <WarningOutlined className={styles.warningIcon} />
          </div>
          <h1 className={styles.mainTitle}>Impossible de générer vos soumissions</h1>
          <p className={styles.subTitle}>
            Nous éprouvons actuellement des difficultés techniques pour traiter votre demande. Pas de soucis!<br />
            Un courtier chez Courtika peut vous aider rapidement.
          </p>
        </div>

        {/* Action Card */}
        <div className={styles.actionCard}>
          {!isSubmitted ? (
            <>
              <h2 className={styles.cardTitle}>Aimeriez-vous continuer avec Courtika?</h2>
              
              <div className={styles.statusSection}>
                <div className={styles.courtikaLogo}>
                  <img src="/images/courtika-assurances-inc.png" alt="Courtika" className={styles.courtikaImageLogo} />
                </div>
                <div className={styles.statusInfo}>
                  <div className={styles.statusBadge}>
                    <div className={styles.statusDot}></div>
                    Disponible maintenant
                  </div>
                  <p className={styles.statusText}>Courtiers certifiés prêts à vous aider</p>
                </div>
              </div>

              <div className={styles.alertBox}>
                <img src="/images/CheckCircle.svg" alt="Check" className={styles.alertIcon} />
                <div className={styles.alertContent}>
                  <h3 className={styles.alertTitle}>Votre dossier est déjà prêt</h3>
                  <p className={styles.alertText}>Vous n'aurez pas à répéter vos informations. Tout sera déjà fourni à votre courtier.</p>
                </div>
              </div>

              <div className={styles.benefitsSection}>
                <p className={styles.benefitsTitle}>Pourquoi parler à un courtier maintenant:</p>
                <ul className={styles.benefitsList}>
                  <li>
                    <CheckOutlined className={styles.checkIcon} />
                    <span><strong>Service 100% gratuit</strong> - Aucun frais, aucune obligation</span>
                  </li>
                  <li>
                    <CheckOutlined className={styles.checkIcon} />
                    <span><strong>Accès à 30+ assureurs</strong> - Bien plus que ce que vous pourriez trouver seul</span>
                  </li>
                  <li>
                    <CheckOutlined className={styles.checkIcon} />
                    <span><strong>Conseils d'experts</strong> - Adaptés à votre situation spécifique</span>
                  </li>
                  <li>
                    <CheckOutlined className={styles.checkIcon} />
                    <span><strong>Économisez votre temps</strong> - Un expert compare pour vous</span>
                  </li>
                </ul>
              </div>

              <Button type="primary" className={styles.primaryButton} size="large" onClick={handleSubmit} loading={isLoading}>
                {!isLoading && <CheckOutlined />} Oui, continuer avec Courtika
              </Button>
              
              <p className={styles.footerNote}>Aucune obligation • Vous gardez le contrôle</p>
            </>
          ) : (
            <>
              <div className={styles.successBanner}>
                <CheckOutlined className={styles.successIcon} />
                <div className={styles.successContent}>
                  <h3 className={styles.successTitle}>Vos informations ont été transmises à Courtika!</h3>
                  <p className={styles.successText}>Un courtier attend <strong>votre appel</strong> pour vous aider</p>
                </div>
              </div>

              <h2 className={styles.submittedCardTitle}>Coordonnées de Courtika:</h2>
              
              <div className={styles.statusSectionLeft}>
                <div className={styles.courtikaLogo}>
                  <img src="/images/courtika-assurances-inc.png" alt="Courtika" className={styles.courtikaImageLogo} />
                </div>
                <div className={styles.statusInfo}>
                  <div className={styles.statusBadge}>
                    <div className={styles.statusDot}></div>
                    Disponible maintenant
                  </div>
                  <p className={styles.statusText}>Courtiers certifiés prêts à vous aider</p>
                </div>
              </div>

              <ul className={styles.infoList}>
                <li>
                  <CalendarOutlined className={styles.infoIcon} />
                  <div>
                    <span className={styles.infoText}>Ouvert aujourd'hui de 8:30 - 16:30</span>
                    <a href="#" className={styles.infoLink} onClick={(e) => { e.preventDefault(); setIsScheduleOpen(true); }}>Voir l'horaire complet</a>
                  </div>
                </li>
                <li>
                  <ClockCircleOutlined className={styles.infoIcon} />
                  <span className={styles.infoText}>Durée de l'appel: environ 15 min</span>
                </li>
                <li>
                  <InfoCircleOutlined className={styles.infoIcon} />
                  <span className={styles.infoText}>Ayez votre permis de conduire et les papiers d'immatriculation du véhicule à portée de main.</span>
                </li>
              </ul>

              <div className={styles.actionButtons}>
                <Button type="primary" className={styles.primaryButton} size="large" href="tel:+14507629240">
                  <PhoneOutlined className={styles.phoneIcon} /> Appeler maintenant: 1 (450) 762-9240
                </Button>
                
                <Button className={styles.secondaryOutlineButton} size="large" onClick={() => navigate('/schedule-call')}>
                  <CalendarOutlined /> Planifier l'appel plus tard
                </Button>
              </div>
            </>
          )}
        </div>

        {/* About Card */}
        <div className={styles.aboutCard}>
          <h2 className={styles.aboutTitle}>À propos de Courtika</h2>
          <p className={styles.aboutText}>
            Un cabinet de courtage en assurance de dommages avec plus de 50 ans d'expérience et 90+ courtiers qui comparent pour vous auprès de 30+ assureurs.
          </p>
          
          <div className={styles.certificationSection}>
            <div className={styles.amfLogoPlaceholder}>
              <img src="/images/logo-amf-header 1.png" alt="Autorité des marchés financiers" className={styles.amfImageLogo} />
            </div>
            <div className={styles.certText}>
              <h4 className={styles.certTitle}>Courtika est certifié par l'AMF</h4>
              <p className={styles.certSubtitle}>Autorité des marchés financiers du Québec</p>
            </div>
          </div>
        </div>
      </div>
      <ScheduleModal isOpen={isScheduleOpen} onClose={() => setIsScheduleOpen(false)} />
    </PageContent>
  );
};

export default FallbackNoQuotes;
