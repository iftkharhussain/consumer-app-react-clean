import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { PageContent } from 'components';
import { Button, Collapse } from 'antd';
import { CheckCircleOutlined, CheckCircleFilled } from '@ant-design/icons';
import { Types } from '../../utils/helper';
import quoteService from '../../services/api/quoteService';
import fortusService from '../../services/api/fortusService';
import apiClient from '../../services/api/client';
import { serverUrl } from '../../apis/sharedApi';
import toast from 'react-hot-toast';
import styles from './Overview.module.css';

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

const Overview = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const initialized = useRef(false);
  const { firstName, email } = useSelector((state) => state.app.user_profile);

  const [quote, setQuote] = useState(null);
  const [userProductId, setUserProductId] = useState(null);
  const [advisor, setAdvisor] = useState(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (!initialized.current) {
      dispatch({
        type: Types.PAGE_HEADING,
        payLoad: {
          title: 'Assurance vie',
          subtitle: 'Votre estimation'
        }
      });
      document.title = 'Assurance vie - Norga';
      initialized.current = true;

      // Load the life (WinQuote) result
      (async () => {
        try {
          const res = await quoteService.fetchQuote('life-insurance');
          if (res?.success && res?.quote) {
            setQuote(res.quote);
            if (res.userProductId) setUserProductId(res.userProductId);
          }
        } catch (e) {
          // leave quote null -> UI falls back to placeholder text
        }
      })();
    }
  }, [dispatch]);

  // Load the advisor assigned to this user's life/insurance product (runs once email is available)
  useEffect(() => {
    if (!email) return;
    let active = true;
    (async () => {
      try {
        const aRes = await apiClient.get('/api/advisor/all', { params: { email } });
        const list = aRes?.data?.success && Array.isArray(aRes.data.data) ? aRes.data.data : [];
        const keywords = ['life', 'vie', 'insurance', 'financ', 'sécurité', 'securite'];
        const match = list.find((item) => {
          const cn = (item.categoryName || '').toLowerCase();
          const cs = (item.categorySlug || '').toLowerCase();
          const at = (item.advisor?.type || '').toLowerCase();
          return keywords.some((k) => cn.includes(k) || cs.includes(k) || at.includes(k));
        }) || list[0];
        if (active && match?.advisor) setAdvisor(match.advisor);
      } catch (e) {
        // leave advisor null -> header falls back to generic text
      }
    })();
    return () => { active = false; };
  }, [email]);

  const customerName = firstName ? `${firstName}` : '';

  // WinQuote result -> display helpers
  const processed = quote?.processed || {};
  const records = Array.isArray(processed.records) ? processed.records : [];
  const fmtMoney = (v) => {
    if (v === undefined || v === null || v === 'Not available') return null;
    const n = typeof v === 'number' ? v : parseFloat(String(v).replace(/[$,\s]/g, ''));
    return Number.isNaN(n) ? null : n.toLocaleString('fr-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };
  const planLabel = (plan) => {
    if (!plan) return null;
    if (plan === 'wholelife') return 'À vie';
    const years = String(plan).replace(/\D/g, '');
    return years ? `Temporaire ${years} ans` : String(plan);
  };
  const recordName = (rec) =>
    rec?.recordSetHeading?.companyName || rec?.recordSetHeading?.companyNameCode || rec?.companyName || 'Assureur';
  // Insurer logos are served from the consumer app's own /public/images/winquote folder.
  // The LMS returns logos as "/uploads/winquote/<CODE>.png"; we reuse the <CODE>.png filename.
  const logoSrc = (rec) => {
    const file = rec?.logo
      ? String(rec.logo).split('/').pop()
      : (rec?.recordSetHeading?.companyNameCode ? `${rec.recordSetHeading.companyNameCode}.png` : null);
    return file ? `/images/winquote/${file}` : null;
  };
  const priceLow = fmtMoney(processed.lowest);
  const priceHigh = fmtMoney(processed.highest);
  const priceRange = priceLow && priceHigh ? `${priceLow}$ - ${priceHigh}$` : (priceLow ? `${priceLow}$` : 'Sur demande');
  const protectionType = planLabel(processed.plan) || 'Sur demande';
  const coverageAmount = fmtMoney(processed.faceAmount) ? `${fmtMoney(processed.faceAmount)}$` : '—';

  // Advisor (assigned to this lead) display values, with safe fallbacks
  const advisorName = advisor?.name || 'Votre conseiller';
  const advisorTitle = advisor?.type || 'Conseiller en sécurité financière';
  const advisorEmail = advisor?.email || '';
  const advisorPhone = advisor?.phone || '';
  const advisorAvatar = advisor?.avatar && !String(advisor.avatar).includes('default')
    ? (String(advisor.avatar).startsWith('http') ? advisor.avatar : `${serverUrl}${advisor.avatar}`)
    : '/images/user-placeholder.png';

  const handleBookCall = async () => {
    if (sent) return;
    try {
      setSending(true);
      const r = await fortusService.requestCall({ productSlug: 'life-insurance', userProductId });
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
              {customerName}, voici votre conseiller <br></br>pour <span style={{ color: '#2121DD' }}>établir</span> 
              <span style={{ color: '#2121DD' }}>votre stratégie</span> et finaliser votre  
              soumission gratuite
            </h2>
            <p className={styles.bannerDesc}>
              Nos experts sont toujours là pour bâtir avec vous une stratégie d'assurance personnalisée, confirmer votre prix instantané, recueillir vos questions personnelles et de santé, puis ajuster la soumission avec précision selon vos besoins.
            </p>
            <Button className={styles.bannerButton} onClick={handleBookCall} loading={sending} disabled={sending || sent}>
              {sent ? 'Demande envoyée ✓' : 'Planifier un appel avec votre conseiller'}
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
              <h2 className={styles.priceBig}>{priceRange}</h2>
              <p className={styles.priceNote}>Obtenez votre prix final avec le conseiller</p>
            </div>
            
            <div className={styles.priceDivider}></div>
            
            <div className={styles.priceRow}>
              <span className={styles.rowLabel}>Type de protection</span>
              <span className={styles.rowValue}>{protectionType}</span>
            </div>
            <div className={styles.priceRow}>
              <span className={styles.rowLabel}>Fréquence de paiement</span>
              <span className={styles.rowValue}>Mensuel</span>
            </div>
            <div className={styles.priceRow}>
              <span className={styles.rowLabel}>Couverture</span>
              <span className={styles.rowValue}>{coverageAmount}</span>
            </div>
          </div>

          {/* Top Insurers Card */}
          <div className={styles.gridCard}>
            <div className={styles.subCardHeader}>
              <span>Meilleurs assureurs</span>
              <CustomInfoIcon />
            </div>
            <div className={styles.insurersGrid}>
              {records.length > 0
                ? records.slice(0, 6).map((rec, i) => (
                    <div
                      className={styles.insurerBlank}
                      key={i}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 8, textAlign: 'center' }}
                    >
                      {logoSrc(rec) ? (
                        <img
                          src={logoSrc(rec)}
                          alt={recordName(rec)}
                          title={recordName(rec)}
                          style={{ maxWidth: '100%', maxHeight: 28, objectFit: 'contain' }}
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      ) : (
                        <span style={{ fontSize: 12, fontWeight: 600 }}>{recordName(rec)}</span>
                      )}
                    </div>
                  ))
                : [0, 1, 2, 3, 4, 5].map((i) => <div className={styles.insurerBlank} key={i}></div>)}
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
            <p className={styles.ctaDesc}>Parlez à votre conseiller {advisorName} pour qu'il vous aide.</p>
            <Button className={styles.ctaButton} onClick={handleBookCall} loading={sending} disabled={sending || sent}>
              {sent ? 'Demande envoyée ✓' : 'Planifier mon appel'}
            </Button>
          </div>
        </div>
        
      </div>
    </PageContent>
  );
};

export default Overview;
