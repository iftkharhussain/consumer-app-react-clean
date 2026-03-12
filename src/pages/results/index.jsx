import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, Card, Collapse, Divider } from 'antd';
import { CheckOutlined, ClockCircleOutlined, DownOutlined, UpOutlined } from '@ant-design/icons';
import styles from './Results.module.css';

const { Panel } = Collapse;

// Insurance company logos - update these paths to your actual assets
const insurerLogos = {
  intact: '/images/insurers/intact-logo.png',
  lunique: '/images/insurers/lunique-logo.png',
  promutuel: '/images/insurers/promutuel-logo.png',
  economical: '/images/insurers/economical-logo.png',
  wawanesa: '/images/insurers/wawanesa-logo.png',
  echelon: '/images/insurers/echelon-logo.png',
  pafco: '/images/insurers/pafco-logo.png',
};

const Results = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [expandedFAQ, setExpandedFAQ] = useState([0]);
  const [expandedInsurer, setExpandedInsurer] = useState(null);
  const [billingPeriod, setBillingPeriod] = useState('monthly'); // 'monthly' or 'yearly'
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const insurers = [
    {
      id: 'intact',
      name: 'Intact',
      logo: insurerLogos.intact,
      price: 90,
      isRecommended: true,
      discount: 'Rabais Courtika appliqué',
      oldPrice: 102,
    },
    {
      id: 'lunique',
      name: "L'Unique",
      logo: insurerLogos.lunique,
      price: 90,
      discount: "Rabais L'Unique appliqué!",
      oldPrice: 98,
    },
    {
      id: 'promutuel',
      name: 'Promutuel assurance',
      logo: insurerLogos.promutuel,
      price: 93,
    },
    {
      id: 'economical',
      name: 'Economical assurance',
      logo: insurerLogos.economical,
      price: 90,
      discount: 'Rabais Economical appliqué!',
      oldPrice: 95,
    },
    {
      id: 'wawanesa',
      name: 'Wawanesa',
      logo: insurerLogos.wawanesa,
      price: 97,
    },
    {
      id: 'echelon',
      name: 'Echelon',
      logo: insurerLogos.echelon,
      price: 95,
    },
    {
      id: 'pafco',
      name: 'Pafco',
      logo: insurerLogos.pafco,
      price: 90,
      discount: 'Rabais Pafco appliqué!',
      oldPrice: 103,
    },
  ];

  const protections = [
    {
      title: 'Responsabilité civile',
      description: 'Assure les dommages que vous causez à autrui (blessures corporelles ou dommages matériels)',
      coverage: '2 000 000 $',
      type: 'couverture',
    },
    {
      title: 'Collision et renversement (B2)',
      description: 'Couvre les dommages à votre véhicule suite à une collision ou un renversement',
      coverage: '500 $',
      type: 'franchise',
    },
    {
      title: 'Accidents sans collision ni renversement (B3)',
      description: 'Couvre les dommages à votre véhicule causés par des événements autres qu\'une collision',
      coverage: '250 $',
      type: 'franchise',
    },
    {
      title: 'Assistance routière (FAQ 33)',
      description: 'Aide en cas de panne ou d\'urgence sur la route',
    },
    {
      title: 'Protection bonifiée',
      description: 'Protections supplémentaires incluses',
    },
  ];

  const faqs = [
    {
      question: 'Est-ce que le prix affiché est final ?',
      answer: 'Non. Le prix affiché est une estimation basée sur les informations fournies. Le prix final sera confirmé après discussion avec un courtier en assurance de dommages.',
    },
    {
      question: 'Pourquoi dois-je parler à un courtier ?',
      answer: 'Un courtier en assurance certifié peut vérifier vos informations, répondre à vos questions spécifiques et s\'assurer que vous obtenez la meilleure couverture adaptée à vos besoins.',
    },
    {
      question: 'Que se passe-t-il après avoir complété la soumission en ligne ?',
      answer: 'Après avoir sélectionné votre assureur, vous serez dirigé vers Courtika pour finaliser votre achat par téléphone ou rendez-vous planifié.',
    },
    {
      question: 'Suis-je obligé d\'acheter une assurance après la soumission ?',
      answer: 'Non, vous n\'êtes jamais obligé d\'acheter. La soumission est gratuite et sans engagement. Vous pouvez prendre le temps de réfléchir.',
    },
    {
      question: 'Mes informations sont-elles sécurisées ?',
      answer: 'Oui, toutes vos informations sont protégées et cryptées. Nous respectons les normes de sécurité les plus strictes.',
    },
    {
      question: 'Puis-je modifier mes informations après la soumission ?',
      answer: 'Oui, vous pourrez discuter et modifier vos informations avec le courtier lors de votre appel ou rendez-vous.',
    },
  ];

  const recommendedInsurer = insurers[0];
  const otherInsurers = insurers.slice(1);

  const handleSelectInsurer = (insurerId) => {
    // Navigate to advisor or callback booking page
    console.log('Selected insurer:', insurerId);
    // navigate('/book-callback');
  };

  const toggleInsurerDetails = (insurerId) => {
    setExpandedInsurer(expandedInsurer === insurerId ? null : insurerId);
  };

  return (
    <div className={styles.resultsContainer}>
      <div className={styles.resultsContent}>
        {/* Timer */}
        <div className={styles.timerSection}>
          <ClockCircleOutlined className={styles.timerIcon} />
          <span className={styles.timerText}>Vos soumissions expirent dans :</span>
          <span className={styles.timerValue}>{formatTime(timeLeft)}</span>
        </div>

        {/* Recommended Insurer Card */}
        <Card className={styles.recommendedCard}>
          <div className={styles.recommendedBadge}>
            <CheckOutlined className={styles.badgeIcon} />
            <span>Recommandé</span>
          </div>

          <div className={styles.cardContent}>
            {/* Left Column - Logo + Pricing */}
            <div className={styles.leftColumn}>
              <div className={styles.logoContainer}>
                <img
                  src={recommendedInsurer.logo}
                  alt={recommendedInsurer.name}
                  className={styles.insurerLogo}
                />
              </div>

              {/* Price Section */}
              <div className={styles.priceSection}>
                <div className={styles.priceDisplay}>
                  {recommendedInsurer.oldPrice && (
                    <span className={styles.oldPrice}>
                      {billingPeriod === 'monthly' ? recommendedInsurer.oldPrice : recommendedInsurer.oldPrice * 12}$
                    </span>
                  )}
                  <span className={styles.mainPrice}>
                    {billingPeriod === 'monthly' ? recommendedInsurer.price : recommendedInsurer.price * 12}
                  </span>
                  <span className={styles.priceSuffix}>$ / {billingPeriod === 'monthly' ? 'mois' : 'année'}</span>
                </div>
              </div>

              {/* Discount Badge */}
              {recommendedInsurer.discount && (
                <div className={styles.discountBadge}>
                  <CheckOutlined className={styles.discountIcon} />
                  <span>{recommendedInsurer.discount}</span>
                </div>
              )}

              {/* Savings text */}
              {recommendedInsurer.oldPrice && (
                <p className={styles.savingsText}>
                  Courtika vous offre un rabais de 10% supplémentaire
                </p>
              )}

              {/* Toggle */}
              <div className={styles.billingToggle}>
                <button
                  onClick={() => setBillingPeriod('monthly')}
                  className={`${styles.toggleButton} ${billingPeriod === 'monthly' ? styles.toggleActive : ''}`}
                >
                  Mensuel
                </button>
                <button
                  onClick={() => setBillingPeriod('yearly')}
                  className={`${styles.toggleButton} ${billingPeriod === 'yearly' ? styles.toggleActive : ''}`}
                >
                  Annuel
                </button>
              </div>
            </div>

            {/* Right Column - Title, Description and CTA */}
            <div className={styles.rightColumn}>
              <h2 className={styles.recommendedTitle}>
                Edward, <span className={styles.highlightText}>{recommendedInsurer.name}</span> est votre meilleure option!
              </h2>

              <p className={styles.recommendedDescription}>
                Ce prix est <span className={styles.boldText}>une estimation personnalisée</span> basée sur votre profil. Un courtier certifié confirmera le tarif final et répondra à toutes vos questions lors d'un échange rapide et gratuit.
              </p>

              <Button
                type="primary"
                size="large"
                className={styles.selectButton}
                onClick={() => handleSelectInsurer(recommendedInsurer.id)}
                block
              >
                Choisir {recommendedInsurer.name}
              </Button>
            </div>
          </div>
        </Card>

        {/* Protections Section */}
        <Card className={styles.protectionsCard}>
          <div className={styles.protectionsHeader}>
            <h2 className={styles.sectionTitle}>Vos protections</h2>
            <Button type="link" className={styles.customizeButton}>
              Personnaliser
            </Button>
          </div>
          <div className={styles.protectionsList}>
            {protections.map((protection, index) => (
              <div key={index} className={styles.protectionItem}>
                <CheckOutlined className={styles.protectionIcon} />
                <div className={styles.protectionContent}>
                  <div className={styles.protectionRow}>
                    <div className={styles.protectionInfo}>
                      <h3 className={styles.protectionTitle}>{protection.title}</h3>
                      <p className={styles.protectionDescription}>{protection.description}</p>
                    </div>
                    {protection.coverage && (
                      <span className={styles.coverageText}>
                        <span className={styles.coverageLabel}>
                          {protection.type === 'franchise' ? 'Franchise' : 'Couverture'} :{' '}
                        </span>
                        <span className={styles.coverageValue}>{protection.coverage}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Other Insurers */}
        <div className={styles.otherInsurersSection}>
          <h2 className={styles.sectionTitle}>Autres options d'assureurs reconnus</h2>
          <div className={styles.insurersList}>
            {otherInsurers.map((insurer) => (
              <Card key={insurer.id} className={styles.insurerCard}>
                <div className={styles.insurerContent}>
                  <div className={styles.insurerMain}>
                    <div className={styles.insurerLogoWrapper}>
                      <img src={insurer.logo} alt={insurer.name} className={styles.insurerLogo} />
                    </div>
                    <div className={styles.insurerDetails}>
                      <h3 className={styles.insurerName}>{insurer.name}</h3>
                      <div className={styles.insurerPrice}>
                        {insurer.oldPrice && (
                          <span className={styles.insurerOldPrice}>
                            {billingPeriod === 'monthly' ? insurer.oldPrice : insurer.oldPrice * 12}$
                          </span>
                        )}
                        <span className={styles.insurerMainPrice}>
                          {billingPeriod === 'monthly' ? insurer.price : insurer.price * 12}
                        </span>
                        <span className={styles.insurerPriceSuffix}>
                          $ / {billingPeriod === 'monthly' ? 'mois' : 'année'}
                        </span>
                        {insurer.oldPrice && (
                          <span className={styles.alternativePrice}>
                            {billingPeriod === 'monthly'
                              ? `ou ${insurer.price * 12}$ par année`
                              : `ou ${insurer.price}$ par mois`}
                          </span>
                        )}
                      </div>
                      {insurer.oldPrice && (
                        <div className={styles.insurerDiscount}>
                          <CheckOutlined className={styles.insurerDiscountIcon} />
                          <span>Rabais appliqué</span>
                        </div>
                      )}
                      {!insurer.oldPrice && (
                        <span className={styles.alternativePrice}>
                          {billingPeriod === 'monthly'
                            ? `ou ${insurer.price * 12}$ par année`
                            : `ou ${insurer.price}$ par mois`}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className={styles.insurerActions}>
                    <Button
                      type="primary"
                      className={styles.insurerSelectButton}
                      onClick={() => handleSelectInsurer(insurer.id)}
                    >
                      Choisir
                    </Button>
                    <Button
                      type="link"
                      className={styles.detailsButton}
                      onClick={() => toggleInsurerDetails(insurer.id)}
                    >
                      {expandedInsurer === insurer.id ? (
                        <>
                          Moins de détails <UpOutlined />
                        </>
                      ) : (
                        <>
                          Voir détails <DownOutlined />
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedInsurer === insurer.id && (
                  <div className={styles.expandedDetails}>
                    <Divider />
                    {insurer.discount && (
                      <div className={styles.savingsInfo}>
                        <p>Économisez {(insurer.oldPrice - insurer.price) * 12}$ par année avec Courtika</p>
                      </div>
                    )}
                    <div className={styles.expandedProtections}>
                      <h4 className={styles.expandedTitle}>Protections incluses</h4>
                      <div className={styles.expandedProtectionsList}>
                        {protections.slice(0, 3).map((protection, index) => (
                          <div key={index} className={styles.expandedProtectionItem}>
                            <CheckOutlined className={styles.expandedProtectionIcon} />
                            <div className={styles.expandedProtectionContent}>
                              <span className={styles.expandedProtectionTitle}>{protection.title}</span>
                              {protection.coverage && (
                                <span className={styles.expandedCoverage}>
                                  <span className={styles.expandedCoverageLabel}>
                                    {protection.type === 'franchise' ? 'Franchise' : 'Couverture'} :{' '}
                                  </span>
                                  <span className={styles.expandedCoverageValue}>{protection.coverage}</span>
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            ))}

            {/* Call-to-Action Card for More Insurers */}
            <Card className={styles.moreInsurersCard}>
              <div className={styles.moreInsurersContent}>
                <div className={styles.moreInsurersMain}>
                  <div className={styles.moreInsurersIconWrapper}>
                    <div className={styles.moreInsurersIcon}>
                      <span className={styles.moreInsurersNumber}>30+</span>
                      <p className={styles.moreInsurersLabel}>Assureurs</p>
                    </div>
                  </div>
                  <div className={styles.moreInsurersInfo}>
                    <h3 className={styles.moreInsurersTitle}>
                      Vous n'avez pas trouvé votre assureur idéal ?
                    </h3>
                    <p className={styles.moreInsurersDescription}>
                      Courtika a accès à <span className={styles.boldText}>plus de 30 assureurs partenaires</span>. Un courtier certifié peut comparer encore plus d'options pour vous.
                    </p>
                  </div>
                </div>
                <div className={styles.moreInsurersActions}>
                  <Button
                    type="primary"
                    className={styles.courtikaButton}
                    onClick={() => handleSelectInsurer('courtika')}
                  >
                    Parler à Courtika
                  </Button>
                  <span className={styles.freeText}>Gratuit et sans engagement</span>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* FAQ Section */}
        <Card className={styles.faqCard}>
          <div className={styles.faqHeader}>
            <h2 className={styles.faqTitle}>Foire aux questions</h2>
            <p className={styles.faqSubtitle}>Trouvez rapidement les réponses à vos questions</p>
          </div>

          <Collapse
            activeKey={expandedFAQ}
            onChange={setExpandedFAQ}
            className={styles.faqCollapse}
            expandIconPosition="end"
          >
            {faqs.map((faq, index) => (
              <Panel header={faq.question} key={index} className={styles.faqPanel}>
                <p className={styles.faqAnswer}>{faq.answer}</p>
              </Panel>
            ))}
          </Collapse>
        </Card>
      </div>
    </div>
  );
};

export default Results;
