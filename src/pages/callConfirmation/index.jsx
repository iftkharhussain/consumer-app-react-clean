import React, { useEffect, useRef, useState } from 'react';
import { PageContent } from 'components';
import { Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { 
  CheckOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  InfoCircleOutlined,
  PhoneOutlined
} from '@ant-design/icons';
import styles from './CallConfirmation.module.css';
import ScheduleModal from '../../components/fallbackquote/ScheduleModal';

const CallConfirmation = () => {
  const navigate = useNavigate();
  const initialized = useRef(false);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);

  useEffect(() => {
    if (!initialized.current) {
      document.title = 'Appelez Courtika - Consumer App';
      initialized.current = true;
    }
  }, []);

  return (
    <PageContent pageType="overview">
      <div className={styles.fallbackContainer}>
        {/* Action Card */}
        <div className={styles.actionCard}>
          <div className={styles.successBanner}>
            <CheckOutlined className={styles.successIcon} />
          </div>
          
          <h1 className={styles.mainTitle}>Génial! Appelez Courtika au <span className={styles.phoneNumberHighlight}>1 (450) 762-9240</span></h1>
          
          <p className={styles.subTitle}>
            Nous avons envoyé votre demande à un courtier en assurance de dommages chez Courtika. Appelez-les dès que possible pour qu'il réponde à vos questions et finalise les détails.
          </p>

          <div className={styles.cardLayout}>
            {/* Left Card: Votre sélection */}
            <div className={styles.selectionCard}>
              <h2 className={styles.cardHeading}>Votre sélection</h2>
              
              <div className={styles.insurerRow}>
                <div className={styles.insurerLeft}>
                  <div className={styles.insurerLogoBox}>
                    <img src="/images/intact-insurance.svg" alt="Intact" className={styles.insurerLogo} />
                  </div>
                  <span className={styles.insurerName}>Intact</span>
                </div>
                <div className={styles.priceContainer}>
                  <span className={styles.priceMain}>90$/mois</span>
                  <span className={styles.priceOld}>110$/mois</span>
                </div>
              </div>
              
              <div className={styles.discountBadge}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.discountIcon}>
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                Rabais Courtika appliqué
              </div>

              <div className={styles.protectionsSection}>
                <h3 className={styles.protectionsTitle}>Vos protections</h3>
                <ul className={styles.protectionsList}>
                  <li>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={styles.checkIcon}>
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <span>Protection dommage matériel 2 000 000 $</span>
                  </li>
                  <li>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={styles.checkIcon}>
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <span>Protection accident et collision 500 $</span>
                  </li>
                  <li>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={styles.checkIcon}>
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <span>Protection dommage matériel 250 $</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Right Card: Broker Information */}
            <div className={styles.brokerCard}>
              <h2 className={styles.cardHeading}>Votre courtier en assurance de dommages:</h2>
              
              <div className={styles.statusSectionLeft}>
                <div className={styles.courtikaLogo}>
                  <img src="/images/courtika-assurances-inc.png" alt="Courtika" className={styles.courtikaImageLogo} />
                </div>
                <div className={styles.statusInfo}>
                  <div className={styles.statusBadge}>
                    <div className={styles.statusDot}></div>
                    Ouvert
                  </div>
                </div>
              </div>

              <ul className={styles.infoList}>
                <li>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={styles.infoIcon}>
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                  <div>
                    <span className={styles.infoText}>Ouvert aujourd'hui de 8:30 - 16:30</span>
                    <a href="#" className={styles.infoLink} onClick={(e) => { e.preventDefault(); setIsScheduleOpen(true); }}>Voir l'horaire complet</a>
                  </div>
                </li>
                <li>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={styles.infoIcon}>
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                  <span className={styles.infoText}>Durée de l'appel: environ 15 min</span>
                </li>
                <li>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={styles.infoIcon}>
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                  </svg>
                  <span className={styles.infoText}>Ayez votre permis de conduire et les papiers d'immatriculation du véhicule à portée de main.</span>
                </li>
              </ul>

              <div className={styles.actionButtons}>
                <Button type="primary" className={styles.primaryButton} size="large" href="tel:+14507629240">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.buttonIconLeft}>
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                  Appeler maintenant
                </Button>
                
                <Button className={styles.secondaryOutlineButton} size="large" onClick={() => navigate('/schedule-call')}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.buttonIconLeft}>
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                  Planifier l'appel plus tard
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Why clients choose Courtika Card */}
        <div className={styles.aboutCard}>
          <h2 className={styles.aboutTitle}>Pourquoi nos clients choisissent Courtika</h2>
          <p className={styles.aboutText}>
            Un cabinet de courtage en assurance de dommages avec plus de 50 ans d'expérience et 90+ courtiers qui comparent pour vous auprès de 30+ assureurs.
          </p>
          
          <a href="https://www.courtika.com" target="_blank" rel="noopener noreferrer" className={styles.websiteLink}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.globeIcon}>
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="2" y1="12" x2="22" y2="12"></line>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
            </svg>
            www.courtika.com
          </a>

          <hr className={styles.separator} />

          <div className={styles.benefitsBox}>
            <h3 className={styles.benefitsBoxTitle}>Il vous facilite la vie! Le service chez Courtika, c'est :</h3>
            <ul className={styles.benefitsBoxList}>
              <li>
                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F57C00" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={styles.benefitsBoxIcon}>
                   <circle cx="12" cy="8" r="7"></circle>
                   <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
                 </svg>
                 <span><strong>Plus de 50 ans d'expérience</strong> et 7 bureaux établis au Québec</span>
              </li>
              <li>
                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F57C00" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={styles.benefitsBoxIcon}>
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
                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F57C00" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={styles.benefitsBoxIcon}>
                   <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                   <circle cx="9" cy="7" r="4"></circle>
                   <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                   <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                 </svg>
                 <span><strong>90+ courtiers qualifiés</strong> : toujours à l'avant-garde du service et de l'expertise</span>
              </li>
              <li>
                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F57C00" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={styles.benefitsBoxIcon}>
                   <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                 </svg>
                 <span><strong>Disponible du lundi au vendredi par téléphone</strong> : 100% gratuit, aucun frais</span>
              </li>
            </ul>
          </div>
          
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

export default CallConfirmation;
