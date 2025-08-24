import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { PageContent, AdvisorTypeBadge } from 'components';
import { Button, Table } from 'antd';
import { AlertTriangleIcon, ArrowRightIcon, XIcon } from '../../components/icon';
import Text from '../../components/text';
import { Types } from '../../utils/helper';
import styles from './MyAdvisors.module.css';

const MyAdvisors = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      dispatch({
        type: Types.PAGE_HEADING,
        payLoad: {
          title: 'My Advisors',
          subtitle: 'These are your advisors'
        }
      });
      document.title = 'My Advisors - Consumer App';
      initialized.current = true;
    }
  }, [dispatch]);

  // Mock data for advisors
  const advisorsData = [
    {
      key: '1',
      name: 'John Smith',
      license: '12345',
      type: 'Mortgage Broker',
      specialties: ['Renewal', 'Refinance', 'Buying Home'],
      email: 'johnsmith@sample.com',
      phone: '9999999999',
      avatar: 'JS'
    },
    {
      key: '2',
      name: 'Jane Doe',
      license: '12345',
      type: 'Insurance Broker',
      specialties: ['Auto & Home'],
      email: 'janedoe@sample.com',
      phone: '9999999999',
      avatar: 'JD'
    },
    {
      key: '3',
      name: 'Martha Jones',
      license: '12345',
      type: 'Financial Advisor',
      specialties: ['Life', 'Critical Illness', 'Mortgage Insurance', 'Disability'],
      email: 'marthajones@sample.com',
      phone: '9999999999',
      avatar: 'MJ'
    },
    {
      key: 'empty-row',
      name: null,
      license: null,
      type: null,
      specialties: null,
      email: null,
      phone: null,
      avatar: null,
      isEmpty: true
    }
  ];

  const handleSearchRegister = () => {
    console.log('Search register clicked');
  };

  const handleMessage = (advisorName) => {
    console.log(`Message ${advisorName} clicked`);
  };

  const handleBookMeeting = (advisorName) => {
    console.log(`Book meeting with ${advisorName} clicked`);
  };

  const handleRequestAdvisor = () => {
    console.log('Request an advisor clicked');
  };

  const handleCloseAlert = () => {
    console.log('Alert closed');
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      width: '240px',
      key: 'name',
      render: (text, record) => {
        if (record.isEmpty) {
          return (
            <Text variant="body-sm" color="primary-900" as="div">
              You currently do not have an insurance broker
            </Text>
          );
        }
        return (
          <div className={styles.nameCell}>
            <div className={styles.avatar}>
              {record.avatar}
            </div>
            <div>
              <div className={styles.advisorName}>{text}</div>
              <div className={styles.advisorLicense}>License: {record.license}</div>
            </div>
          </div>
        );
      },
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (text, record) => {
        if (record.isEmpty) {
          return (
            <div>
              <AdvisorTypeBadge type="Insurance Broker" />
              <div className={styles.advisorSpecialties}>
                Auto & Home
              </div>
            </div>
          );
        }
        return (
          <div>
            <AdvisorTypeBadge type={text} />
            <div className={styles.advisorSpecialties}>
              {record.specialties.join(', ')}
            </div>
          </div>
        );
      },
    },
    {
      title: 'Email address',
      dataIndex: 'email',
      key: 'email',
      render: (text, record) => {
        if (record.isEmpty) return null;
        return (
          <span className={styles.contactInfo}>{text}</span>
        );
      },
    },
    {
      title: 'Phone Number',
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
        if (record.isEmpty) {
          return (
            <Button 
              type="default"
              onClick={handleRequestAdvisor}
              className={styles.requestButton}
            >
              Request an advisor
            </Button>
          );
        }
        return (
          <div className={styles.actionButtons}>
            <Button 
              type="text" 
              onClick={() => handleMessage(record.name)}
              className={styles.messageButton}
            >
              Message
            </Button>
            <Button 
              type="primary" 
              onClick={() => handleBookMeeting(record.name)}
              className={styles.bookButton}
            >
              Book Meeting
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
        <div className={styles.header}>
          <Text variant="display-sm" color="primary" as="h1">
            My Advisors
          </Text>
          <Text variant="body-md" color="tertiary">
            These are your advisors
          </Text>
        </div>

        {/* Alert Section */}
        <div className={styles.alertContainer}>
          <div className={styles.alertBox}>
            <div className={styles.alertIcon}>
              <img src='/images/alert-circle.png' alt='alert-alt-icon' />
            </div>
            
            <div className={styles.alertContent}>
              <div className={styles.alertTextContent}>
                <Text variant="body-sm-semibold" color="secondary" as="div">
                  Verify Credentials with Confidence
                </Text>
                <Text variant="body-sm" color="tertiary" as="div">
                  We work exclusively with licensed professionals you can trust. You can search the official Québec registry to confirm the credentials of any authorized firm or individual.
                </Text>
              </div>
              
              <Button 
                type="text"
                onClick={handleSearchRegister}
                className={styles.searchRegisterButton}
              >
                <span>Search the register</span>
                <ArrowRightIcon />
              </Button>
            </div>

            <div className={styles.alertLogo}>
              <img src='/images/logo-amf-header 1.png' alt='amf-logo' />
            </div>

            <button 
              className={styles.closeButton}
              onClick={handleCloseAlert}
              aria-label="Close alert"
            >
              <XIcon />
            </button>
          </div>
        </div>

        {/* Advisors Table */}
        <div className={styles.tableContainer}>
          <Table 
            columns={columns}
            dataSource={advisorsData}
            pagination={false}
            className={styles.advisorsTable}
            rowClassName={styles.tableRow}
          />
        </div>
      </div>
    </PageContent>
  );
};

export default MyAdvisors;
