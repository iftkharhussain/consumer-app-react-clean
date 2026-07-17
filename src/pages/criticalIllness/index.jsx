import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { PageContent } from 'components';
import { Button, Collapse } from 'antd';
import { CheckCircleOutlined, CheckCircleFilled } from '@ant-design/icons';
import { Types } from '../../utils/helper';
import quoteService from '../../services/api/quoteService';
import fortusService from '../../services/api/fortusService';
import { serverUrl } from '../../apis/sharedApi';
import toast from 'react-hot-toast';
import styles from './CriticalIllness.module.css';

const { Panel } = Collapse;

// Critical illness is advisor-only (no WinQuote price), so there are no quote
// records to fill "Meilleurs assureurs". Show a default set of major Québec
// critical-illness insurers instead. Logos live in /public/images/winquote/.
const DEFAULT_INSURERS = [
  { file: 'MANULIFE.png', name: 'Manulife' },
  { file: 'sunlife.png', name: 'Sun Life' },
  { file: 'CANADALI.png', name: 'Canada Life' },
  { file: 'IAFINANC.png', name: 'iA Groupe financier' },
  { file: 'DESJARDI.png', name: 'Desjardins' },
  { file: 'BENEVA.png', name: 'Beneva' },
];

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

  const [advisor, setAdvisor] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [userProductId, setUserProductId] = useState(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (!initialized.current) {
      dispatch({
        type: Types.PAGE_HEADING,
        payLoad: {
          title: 'Assurance maladie grave',
          subtitle: 'Détails de votre protection'
        }
      });
      document.title = 'Assurance maladie grave - Norga';
      initialized.current = true;
    }
  }, [dispatch]);

  // Load this user's critical-illness product → real advisor + userProductId.
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await quoteService.getUserProducts();
        const products = res?.products || [];
        const product = products.find((p) => p.productSlug === 'critical-illness') || null;
        if (active && product) {
          setUserProductId(product.id || null);
          if (product.advisor) setAdvisor(product.advisor);
          if (product.submission) setSubmission(product.submission);
        }
      } catch (e) {
        // leave advisor null -> header falls back to generic text
      }
    })();
    return () => { active = false; };
  }, []);

  const handleBookCall = async () => {
    if (sent) return;
    try {
      setSending(true);
      const r = await fortusService.requestCall({ productSlug: 'critical-illness', userProductId });
      if (r?.success) {
        setSent(true);
        toast.success('Votre demande a été envoyée. Un conseiller vous contactera.');
        if (userProductId) fortusService.trackEvent(userProductId, 'call').catch(() => {});
      } else {
        toast.error(r?.message || 'Une erreur est survenue.');
      }
    } catch (e) {
      toast.error(e?.response?.data?.message || e.message || 'Une erreur est survenue.');
    } finally {
      setSending(false);
    }
  };

  const advisorName = advisor?.name || 'Votre conseiller';
  const advisorTitle = 'Conseiller en sécurité financière';
  const advisorEmail = advisor?.email || '';
  const advisorPhone = advisor?.phone || '';
  const advisorAvatar = advisor?.avatar && !String(advisor.avatar).includes('default')
    ? (String(advisor.avatar).startsWith('http') ? advisor.avatar : `${serverUrl}${advisor.avatar}`)
    : '/images/user-placeholder.png';

  // Submission-driven values (advisor-only product — no online price for CI).
  const coverageDisplay = submission?.desiredCoverageAmount
    ? `${Number(submission.desiredCoverageAmount).toLocaleString('fr-CA')}$`
    : '—';
  const illnessDisplay = (() => {
    const p = submission?.needs?.protection;
    if (!p) return '—';
    const n = String(p).match(/\d+/)?.[0];
    return n ? `${n} maladies` : String(p);
  })();

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
            <img src={advisorAvatar} alt={advisorName} className={styles.advisorAvatarLarge} />
            <h3 className={styles.advisorNameLarge}>{advisorName}</h3>
            <p className={styles.advisorTitleLarge}>{advisorTitle}</p>
            <div className={styles.advisorContactBox}>
              <div>Courriel: {advisorEmail || '—'}</div>
              <div>Tél: {advisorPhone || '—'}</div>
            </div>
          </div>
          <div className={styles.bannerContent}>
            <h2 className={styles.bannerHead}>
              {firstName?.toUpperCase()}, voici votre conseiller pour <span style={{ color: '#2121DD' }}>établir votre stratégie</span> et finaliser votre soumission gratuite
            </h2>
            <p className={styles.bannerDesc}>
              En assurance maladie grave, les tarifs ne peuvent pas être offerts en ligne. Vous pouvez soit attendre l'appel du conseiller qui vous contactera dès que possible, ou planifier un moment précis pour vous assurer qu'il vous appelle au bon moment.
            </p>
            <Button className={styles.bannerButton} onClick={handleBookCall} loading={sending} disabled={sending || sent}>
              {sent ? 'Demande envoyée' : 'Planifier mon appel maintenant'}
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
              <span className={styles.rowValue}>{coverageDisplay}</span>
            </div>
            <div className={styles.priceRow}>
              <span className={styles.rowLabel}>Nombre de maladies couvertes</span>
              <span className={styles.rowValue}>{illnessDisplay}</span>
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
              {DEFAULT_INSURERS.map((ins) => (
                <div
                  className={styles.insurerBlank}
                  key={ins.file}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 8 }}
                >
                  <img
                    src={`/images/winquote/${ins.file}`}
                    alt={ins.name}
                    title={ins.name}
                    style={{ maxWidth: '100%', maxHeight: 28, objectFit: 'contain' }}
                  />
                </div>
              ))}
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
            <img src={advisorAvatar} alt={advisorName} className={styles.ctaAvatar} />
            <h3 className={styles.ctaTitle}>Vous avez encore des questions?</h3>
            <p className={styles.ctaDesc}>Parlez à votre conseiller {advisorName} pour qu'il vous aide.</p>
            <Button className={styles.ctaButton} onClick={handleBookCall} loading={sending} disabled={sending || sent}>
              {sent ? 'Demande envoyée' : 'Planifier mon appel'}
            </Button>
          </div>
        </div>
        
      </div>
    </PageContent>
  );
};

export default CriticalIllness;
