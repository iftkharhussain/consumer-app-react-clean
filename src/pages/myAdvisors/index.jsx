import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { PageContent, AdvisorTypeBadge, PageHeader } from 'components';
import { Button, Table, Spin } from 'antd';
import { ArrowRightIcon, XIcon, MailIcon, PhoneIcon } from '../../components/icon';
import { ImageUser } from 'utils/icons';
import Text from '../../components/text';
import { Types, requestHelper } from '../../utils/helper';
import { getAllAdvisorsUrl } from '../../apis/sharedApi';
import styles from './MyAdvisors.module.css';

const MyAdvisors = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const initialized = useRef(false);
  const userProfile = useSelector(state => state.app?.user_profile);
  
  const [advisorsData, setAdvisorsData] = useState([]);
  const [loading, setLoading] = useState(true);

  // The 3 mandatory categories we always want to show
  const MANDATORY_CATEGORIES = [
    { 
      key: 'insurance', 
      type: 'Courtier en assurance de dommages', 
      specialties: ['Assurance de dommages'],
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
        const url = `${getAllAdvisorsUrl}?email=${userProfile.email}`;
        const response = await requestHelper(url, 'GET');
        
        if (!response || !response.ok) {
          throw new Error(`HTTP error! status: ${response?.status}`);
        }

        const responseData = await response.json();
        const rawAdvisors = (responseData?.success && responseData.data) ? responseData.data : [];
        
        // Map real data to the 3 mandatory categories
        const finalDisplayData = MANDATORY_CATEGORIES.map(cat => {
          // Find a real advisor that matches this category
          // We check the category name/slug AND the advisor's profession (type)
          const realAdvisor = rawAdvisors.find(item => {
            const categoryName = (item.categoryName || '').toLowerCase();
            const categorySlug = (item.categorySlug || '').toLowerCase();
            const advisorType = (item.advisor?.type || '').toLowerCase();
            
            return cat.matchKeywords.some(keyword => 
              categoryName.includes(keyword) || 
              categorySlug.includes(keyword) || 
              advisorType.includes(keyword)
            );
          });

          if (realAdvisor) {
            return {
              key: realAdvisor.advisor?._id || cat.key,
              name: realAdvisor.advisor?.name,
              license: 'Active',
              type: cat.type,
              specialties: cat.specialties,
              email: realAdvisor.advisor?.email,
              phone: realAdvisor.advisor?.phone,
              calendarLink: realAdvisor.advisor?.calendarLink || '',
              avatar: realAdvisor.advisor?.avatar && !realAdvisor.advisor.avatar.includes('default') ? (
                <img src={realAdvisor.advisor.avatar} alt={realAdvisor.advisor.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : null,
              isEmpty: false
            };
          } else {
            // Return empty row for this category
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
          }
        });

        setAdvisorsData(finalDisplayData);
      } catch (error) {
        console.error('Error fetching advisors:', error);
        // Fallback to all empty if error
        setAdvisorsData(MANDATORY_CATEGORIES.map(cat => ({
          key: `empty-${cat.key}`,
          name: null,
          license: null,
          type: cat.type,
          specialties: cat.specialties,
          email: null,
          phone: null,
          calendarLink: '',
          avatar: null,
          isEmpty: true
        })));
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
                <svg 
                  width="16" 
                  height="18" 
                  viewBox="0 0 18 20" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                  className={styles.emptyAvatarIcon}
                >
                  <path 
                    d="M16.9967 18.9965V16.9969C16.9967 15.9362 16.5754 14.919 15.8253 14.169C15.0754 13.419 14.0582 12.9977 12.9975 12.9977H4.99903C3.93837 12.9977 2.92116 13.419 2.17116 14.169C1.42116 14.919 0.999817 15.9362 0.999817 16.9969V18.9965M12.9975 4.99922C12.9975 7.20792 11.2069 8.99843 8.99825 8.99843C6.78954 8.99843 4.99903 7.20792 4.99903 4.99922C4.99903 2.79051 6.78954 1 8.99825 1C11.2069 1 12.9975 2.79051 12.9975 4.99922Z" 
                    stroke="#A4A7AE" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>
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
          title="My Advisors" 
          subtitle="These are your advisors"
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
              rowClassName={styles.tableRow}
            />
          )}
        </div>
        
        {/* Mobile Advisor Cards */}
        {!loading && (
          <div className={styles.mobileCards}>
            {advisorsData.map((advisor, index) => (
              <div key={index} className={styles.advisorCard}>
                <div className={styles.cardHeader}>
                  <div className={styles.avatar}>
                    {advisor.isEmpty ? (
                      <svg 
                        width="16" 
                        height="18" 
                        viewBox="0 0 18 20" 
                        fill="none" 
                        xmlns="http://www.w3.org/2000/svg"
                        className={styles.emptyAvatarIcon}
                      >
                        <path 
                          d="M16.9967 18.9965V16.9969C16.9967 15.9362 16.5754 14.919 15.8253 14.169C15.0754 13.419 14.0582 12.9977 12.9975 12.9977H4.99903C3.93837 12.9977 2.92116 13.419 2.17116 14.169C1.42116 14.919 0.999817 15.9362 0.999817 16.9969V18.9965M12.9975 4.99922C12.9975 7.20792 11.2069 8.99843 8.99825 8.99843C6.78954 8.99843 4.99903 7.20792 4.99903 4.99922C4.99903 2.79051 6.78954 1 8.99825 1C11.2069 1 12.9975 2.79051 12.9975 4.99922Z" 
                          stroke="#A4A7AE" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : (
                      advisor.avatar || (advisor.name ? advisor.name.split(' ').map(n => n[0]).join('') : '?')
                    )}
                  </div>
                  <div className={styles.headerInfo}>
                    <div className={styles.advisorName}>
                      {advisor.isEmpty ? "Vous n'avez actuellement pas de courtier d'assurance" : advisor.name}
                    </div>
                    {!advisor.isEmpty && advisor.license && (
                      <div className={styles.advisorLicense}>
                        License: {advisor.license}
                      </div>
                    )}
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
    </PageContent>
  );
};

export default MyAdvisors;
