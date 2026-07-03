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
import quoteService from '../../services/api/quoteService';
import fortusService from '../../services/api/fortusService';
import { serverUrl } from '../../apis/sharedApi';
import toast from 'react-hot-toast';
import styles from './Mortgage.module.css';

const { Panel } = Collapse;

const NOTE_ONE = "💡Important: Parlez à votre conseiller, il pourrait vous offrir un meilleur prix avec une stratégie personnalisée";
const NOTE_TWO = "💡Important: Parlez à votre conseiller, il pourrait vous offrir un meilleur prix avec un produit combiné";

// Format a WinQuote money value (number or "12.34"/"Not available") -> "12.34" | null.
const fmtMoney = (v) => {
  if (v === undefined || v === null || v === 'Not available') return null;
  const n = typeof v === 'number' ? v : parseFloat(String(v).replace(/[$,\s]/g, ''));
  return Number.isNaN(n) ? null : n.toLocaleString('fr-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};
const num = (v) => {
  const n = typeof v === 'number' ? v : parseFloat(String(v ?? '').replace(/[$,\s]/g, ''));
  return Number.isNaN(n) ? 0 : n;
};
const planLabel = (plan) => {
  if (!plan) return null;
  if (plan === 'wholelife') return 'À vie';
  const years = String(plan).replace(/\D/g, '');
  return years ? `Temporaire ${years} ans` : String(plan);
};
const personName = (p) => (p?.prenom || p?.nom || '').trim();

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

  const [advisor, setAdvisor] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [userProductId, setUserProductId] = useState(null);
  const [quote, setQuote] = useState(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

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

  // Load this user's mortgage-insurance product → advisor + submission (borrowers).
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await quoteService.getUserProducts();
        const product = (res?.products || []).find((p) => p.productSlug === 'mortgage-insurance');
        if (active && product) {
          setUserProductId(product.id || null);
          if (product.advisor) setAdvisor(product.advisor);
          if (product.submission) setSubmission(product.submission);
        }
      } catch (e) { /* fall back to generic advisor + placeholders */ }
    })();
    return () => { active = false; };
  }, []);

  // Fetch the WinQuote price for 1-2 borrowers (3+ is advisor-only, no online price).
  const borrowerCount = Number(submission?.borrowers) || (submission?.insured || []).length || 1;
  useEffect(() => {
    if (!submission || borrowerCount > 2) return;
    let active = true;
    (async () => {
      try {
        const res = await quoteService.fetchQuote('mortgage-insurance');
        if (active && res?.success && res?.quote) setQuote(res.quote);
      } catch (e) { /* leave quote null -> "Sur demande" */ }
    })();
    return () => { active = false; };
  }, [submission, borrowerCount]);

  const handleBookCall = async () => {
    if (sent) return;
    try {
      setSending(true);
      const r = await fortusService.requestCall({ productSlug: 'mortgage-insurance', userProductId });
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

  // ── Build the view data (mirrors the old MORTGAGE_DATA shape) ──
  const insured = submission?.insured || [];
  const numPersons = borrowerCount;
  const processed = quote?.processed || {};
  const bq = Array.isArray(quote?.borrowerQuotes) ? quote.borrowerQuotes : [];
  const coverageDisplay = fmtMoney(submission?.desiredCoverageAmount)
    ? `${fmtMoney(submission.desiredCoverageAmount)}$`
    : (fmtMoney(processed.faceAmount) ? `${fmtMoney(processed.faceAmount)}$` : 'À déterminer');
  const protectionDisplay = planLabel(processed.plan) || 'À déterminer';
  const range = (low, high) => {
    const l = fmtMoney(low); const h = fmtMoney(high);
    return l && h ? `${l} - ${h}` : (l || null);
  };

  let currentData;
  if (numPersons > 2) {
    currentData = {
      isPersonalized: true,
      persons: insured.map((p, i) => ({ name: personName(p) || `Emprunteur ${i + 1}` })),
      protection: 'À déterminer', coverage: 'À déterminer', disability: 'À déterminer',
    };
  } else if (numPersons === 2) {
    const totalLow = num(bq[0]?.lowest) + num(bq[1]?.lowest);
    const totalHigh = num(bq[0]?.highest) + num(bq[1]?.highest);
    const total = fmtMoney(totalLow) && fmtMoney(totalHigh) ? `${fmtMoney(totalLow)}$ - ${fmtMoney(totalHigh)}$` : 'Sur demande';
    currentData = {
      title: 'Prix total estimé',
      totalPrice: total,
      persons: [0, 1].map((i) => ({
        name: personName(insured[i]) || `Emprunteur ${i + 1}`,
        price: range(bq[i]?.lowest, bq[i]?.highest) || 'Sur demande',
      })),
      protection: protectionDisplay, coverage: coverageDisplay, disability: 'À déterminer',
      isPersonalized: false, note: NOTE_TWO,
    };
  } else {
    const single = range(processed.lowest, processed.highest);
    currentData = {
      title: 'Prix estimé',
      totalPrice: single ? `${single}$` : 'Sur demande',
      persons: [{ name: personName(insured[0]) || 'Emprunteur', price: single || 'Sur demande' }],
      protection: protectionDisplay, coverage: coverageDisplay, disability: 'À déterminer',
      isPersonalized: false, note: NOTE_ONE,
    };
  }

  // Advisor display values (assigned to this lead), with safe fallbacks.
  const advisorName = advisor?.name || 'Votre conseiller';
  const advisorTitle = 'Conseiller en sécurité financière';
  const advisorEmail = advisor?.email || '';
  const advisorPhone = advisor?.phone || '';
  const advisorAvatar = advisor?.avatar && !String(advisor.avatar).includes('default')
    ? (String(advisor.avatar).startsWith('http') ? advisor.avatar : `${serverUrl}${advisor.avatar}`)
    : '/images/user-placeholder.png';

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
      <div className={`${styles.mortgagePage} ${numPersons === 1 ? styles.onePersonPage : ''} ${numPersons === 2 ? styles.twoPersonPage : ''} ${numPersons === 3 ? styles.threePersonPage : ''}`}>
        
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
            <Button className={styles.bannerButton} onClick={handleBookCall} loading={sending} disabled={sending || sent}>
              {sent ? 'Demande envoyée' : 'Planifier mon appel maintenant'}
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
                      <span className={styles.namePill}>{currentData.persons[0]?.name}</span>
                      <span className={styles.namePlus}>+</span>
                      <span className={styles.namePill}>{currentData.persons[1]?.name}</span>
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

export default Mortgage;
