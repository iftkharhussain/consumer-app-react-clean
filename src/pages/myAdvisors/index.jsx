import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { PageContent, AdvisorTypeBadge, PageHeader } from 'components';
import { Button, Table, Spin } from 'antd';
import { ArrowRightIcon, XIcon, MailIcon, PhoneIcon } from '../../components/icon';
import { CalendarOutlined } from '@ant-design/icons';
import { ImageUser } from 'utils/icons';
import Text from '../../components/text';
import { Types } from '../../utils/helper';
import quoteService from '../../services/api/quoteService';
import ScheduleModal from '../../components/fallbackquote/ScheduleModal';
import styles from './MyAdvisors.module.css';

// Which advisor "cabinet" bucket each product belongs to. Deterministic (avoids the
// fragile substring matching — every insurance slug contains the word "insurance").
const SLUG_BUCKET = {
  'car-insurance': 'insurance',
  'home-insurance': 'insurance',
  'mortgage-renew': 'mortgage',
  'mortgage-refinance': 'mortgage',
  'mortgage-buy': 'mortgage',
  'mortgage-consolidate': 'mortgage',
  'life-insurance': 'financial',
  'critical-illness': 'financial',
  'disability': 'financial',
  'mortgage-insurance': 'financial',
};

const MyAdvisors = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const initialized = useRef(false);
  const userProfile = useSelector(state => state.app?.user_profile);
  
  // When arriving from Explore's "Speak with an advisor", blink that cabinet's row.
  const location = useLocation();
  const highlightBucket = location.state?.highlightBucket || null;

  const [advisorsData, setAdvisorsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);

  // The 3 mandatory categories we always want to show
  const MANDATORY_CATEGORIES = [
    { 
      key: 'insurance', 
      type: 'Cabinet en assurance de dommages', 
      specialties: ['Assurance auto et habitation'],
      matchKeywords: ['insurance', 'auto', 'habitation', 'broker', 'courtier', 'dommage']
    },
    { 
      key: 'mortgage', 
      type: 'Courtier hypothécaire', 
      specialties: ['Hypothèque'],
      matchKeywords: ['mortgage', 'hypothecaire', 'hypothèque', 'loan', 'prêt']
    },
    { 
      key: 'financial', 
      type: 'Conseiller en sécurité financière', 
      specialties: ['Vie & Placements'],
      matchKeywords: ['financial', 'life', 'investment', 'vie', 'sécurité', 'placements', 'épargne']
    }
  ];

  useEffect(() => {
    if (!initialized.current) {
      dispatch({
        type: Types.PAGE_HEADING,
        payLoad: {
          title: 'Mes conseillers',
          subtitle: 'Voici les conseillers qui vous accompagnent.'
        }
      });
      document.title = 'Mes conseillers - Norga';
      initialized.current = true;
    }
  }, [dispatch]);

  // Fetch real advisors from local backend proxy
  useEffect(() => {
    const fetchAdvisors = async () => {
      if (!userProfile?.email) return;
      
      try {
        setLoading(true);
        // Source advisors from the user's own products (reliable productSlug + advisor),
        // then bucket each into one of the 3 cabinets via SLUG_BUCKET.
        const res = await quoteService.getUserProducts();
        const products = (res?.products || []).filter(p => p.advisor);

        const finalDisplayData = MANDATORY_CATEGORIES.map(cat => {
          const match = products.find(p => SLUG_BUCKET[p.productSlug] === cat.key);
          const adv = match?.advisor;

          if (adv) {
            return {
              key: adv._id || cat.key,
              bucket: cat.key,
              name: adv.name,
              license: 'Active',
              type: cat.type,
              specialties: cat.specialties,
              email: adv.email,
              phone: adv.phone,
              calendarLink: adv.calendarLink || '',
              avatar: adv.avatar && !String(adv.avatar).includes('default') ? (
                <img src={adv.avatar} alt={adv.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
              ) : null,
              isEmpty: false
            };
          }
          // Empty row for a cabinet the user has no advisor in.
          return {
            key: `empty-${cat.key}`,
            name: null,
            license: null,
            type: cat.type,
            specialties: cat.specialties,
            email: null,
            phone: null,
            avatar: null,
            isEmpty: true
          };
        });

        // Only show cabinets that actually have an advisor (hide unassigned ones).
        setAdvisorsData(finalDisplayData.filter(item => !item.isEmpty));
      } catch (error) {
        console.error('Error fetching advisors:', error);
        // If error, show no advisors (hide empty categories)
        setAdvisorsData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAdvisors();
  }, [userProfile?.email]);

  const handleSearchRegister = () => {
    console.log('Search register clicked');
  };

  const handleMessage = (advisorName) => {
    console.log(`Message ${advisorName} clicked`);
  };

  const handleBookMeeting = (record) => {
    if (record?.calendarLink) {
      window.open(record.calendarLink, '_blank');
    } else {
      console.log(`Book meeting with ${record?.name} clicked, but no link found`);
      // Optional: show a message to user
    }
  };

  const handleRequestAdvisor = () => {
    console.log('Request an advisor clicked');
  };

  const handleCloseAlert = () => {
    console.log('Alert closed');
  };

  const columns = [
    {
      title: 'Nom',
      dataIndex: 'name',
      width: '240px',
      key: 'name',
      render: (text, record) => {
        if (record.isEmpty) {
          return (
            <div className={styles.emptyStateText}>
              Vous n'avez actuellement pas de courtier d'assurance
            </div>
          );
        }
        return (
          <div className={styles.nameCell}>
            <div className={styles.avatar}>
              {record.avatar || (
                <img 
                  src="/images/user-placeholder.png" 
                  alt="Avatar" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} 
                />
              )}
            </div>
            <div>
              <div className={styles.advisorName}>{text}</div>
            </div>
          </div>
        );
      },
    },
    {
      title: 'Type',
      key: 'type',
      render: (text, record) => {
        return (
          <div>
            <AdvisorTypeBadge type={record.type} />
            <div className={styles.advisorSpecialties}>
              {Array.isArray(record.specialties) ? record.specialties.join(', ') : record.specialties}
            </div>
          </div>
        );
      },
    },
    {
      title: 'Courriel',
      dataIndex: 'email',
      key: 'email',
      render: (text, record) => {
        if (record.isEmpty) {
          return (
            <Button 
              type="default"
              onClick={handleRequestAdvisor}
              className={styles.requestButton}
            >
              Demander un conseiller
            </Button>
          );
        }
        return (
          <span className={styles.contactInfo}>{text}</span>
        );
      },
    },
    {
      title: 'Téléphone',
      dataIndex: 'phone',
      key: 'phone',
      render: (text, record) => {
        if (record.isEmpty) return null;
        return (
          <span className={styles.contactInfo}>{text}</span>
        );
      },
    },
    {
      title: '',
      key: 'actions',
      render: (_, record) => {
        if (record.isEmpty) return null;
        return (
          <div className={styles.actionButtons}>
            <Button 
              type="primary" 
              onClick={() => handleBookMeeting(record)}
              className={styles.bookButton}
              disabled={!record.calendarLink}
            >
              Prendre rendez-vous
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <PageContent pageType="myAdvisors">
      <div className={styles.myAdvisorsPage}>
        {/* Main Header */}
        <PageHeader 
          title="Mes conseillers" 
          subtitle="Voici les conseillers qui vous accompagnent."
          className={styles.header}
        />

        {/* Advisors Table (Desktop) */}
        <div className={styles.tableContainer}>
          {loading ? (
            <div style={{ padding: '50px', textAlign: 'center' }}><Spin size="large" /></div>
          ) : (
            <Table
              columns={columns}
              dataSource={advisorsData}
              pagination={false}
              className={styles.advisorsTable}
              rowClassName={(record) => `${styles.tableRow} ${record.bucket && record.bucket === highlightBucket ? styles.highlightRow : ''}`}
            />
          )}
        </div>
        
        {/* Mobile Advisor Cards */}
        {!loading && (
          <div className={styles.mobileCards}>
            {advisorsData.map((advisor, index) => (
              <div key={index} className={`${styles.advisorCard} ${advisor.bucket && advisor.bucket === highlightBucket ? styles.highlightRow : ''}`}>
                <div className={styles.cardHeader}>
                  <div className={styles.avatar}>
                    {advisor.isEmpty ? (
                      <img 
                        src="/images/user-placeholder.png" 
                        alt="Placeholder" 
                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} 
                      />
                    ) : (
                      advisor.avatar || (
                        <img 
                          src="/images/user-placeholder.png" 
                          alt="Placeholder" 
                          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} 
                        />
                      )
                    )}
                  </div>
                  <div className={styles.headerInfo}>
                    <div className={styles.advisorName}>
                      {advisor.isEmpty ? "Vous n'avez actuellement pas de courtier d'assurance" : advisor.name}
                    </div>
                  </div>
                </div>

                <div className={styles.cardBody}>
                  <div className={styles.cardBadge}>
                    <AdvisorTypeBadge type={advisor.type} />
                  </div>
                  
                  <div className={styles.cardSpecialties}>
                    {Array.isArray(advisor.specialties) ? advisor.specialties.join(', ') : advisor.specialties}
                  </div>

                  {!advisor.isEmpty && (
                    <div className={styles.cardContact}>
                      <div className={styles.contactItem}>
                         <MailIcon size={14} />
                        <span>{advisor.email}</span>
                      </div>
                      <div className={styles.contactItem}>
                        <PhoneIcon size={14} />
                        <span>{advisor.phone}</span>
                      </div>
                      <div className={styles.contactItem} onClick={() => setIsScheduleOpen(true)} style={{ cursor: 'pointer', color: '#1A1ABA' }}>
                        <CalendarOutlined style={{ fontSize: '18px' }} />
                        <span style={{ fontWeight: 600 }}>Voir l'horaire complet</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className={styles.cardFooter}>
                  {advisor.isEmpty ? (
                    <Button 
                      type="default"
                      onClick={handleRequestAdvisor}
                      className={styles.mobileRequestButton}
                    >
                      Demander un conseiller
                    </Button>
                  ) : (
                    <Button 
                      type="primary" 
                      onClick={() => handleBookMeeting(advisor.name)}
                      className={styles.mobileBookButton}
                    >
                      Réserver une rencontre
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <ScheduleModal isOpen={isScheduleOpen} onClose={() => setIsScheduleOpen(false)} />
    </PageContent>
  );
};

export default MyAdvisors;
