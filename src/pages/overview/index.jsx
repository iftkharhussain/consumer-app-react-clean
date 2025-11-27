import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { PageContent, Section } from 'components';
import { Button, Tabs, Rate, Input } from 'antd';
import { CalendarOutlined, ClockCircleOutlined, BellOutlined } from '@ant-design/icons';
import { Types } from '../../utils/helper';
import CustomAlert from '../../components/customAlert';
import MoreOptions from '../../components/moreOptions';
import styles from './Overview.module.css';

const Overview = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const initialized = useRef(false);
  const { firstName, lastName } = useSelector((state) => state.app.user_profile);
  const [rating, setRating] = React.useState(0);
  const [comment, setComment] = React.useState('');

  useEffect(() => {
    if (!initialized.current) {
      dispatch({
        type: Types.PAGE_HEADING,
        payLoad: {
          title: 'Overview',
          subtitle: 'Your insurance estimate details'
        }
      });
      document.title = 'Overview - Consumer App';
      initialized.current = true;
    }
  }, [dispatch]);

  const customerName = firstName ? `${firstName} ${lastName}` : 'John Guiao';

  const handleBookCall = () => {
    // Handle booking call functionality
    console.log('Book call clicked');
  };

  const handleReschedule = () => {
    // Handle reschedule functionality
    console.log('Reschedule clicked');
  };

  const handleSubmitRating = () => {
    // Handle submit rating functionality
    console.log('Rating submitted:', rating, comment);
  };

  const tabItems = [
    {
      key: '1',
      label: (
        <div className={styles.tabLabelWithProgress}>
          <span className={styles.tabLabel}>Quote Estimate</span>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: '100%' }}></div>
          </div>
        </div>
      ),
      children: (
        <div className={styles.tabContent}>
          <div className={styles.completedMessage}>Quote estimate completed!</div>
        </div>
      ),
    },
    {
      key: '2',
      label: (
        <div className={styles.tabLabelWithProgress}>
          <span className={styles.tabLabel}>Book Meeting</span>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: '100%' }}></div>
          </div>
        </div>
      ),
      children: (
        <div className={styles.tabContent}>
          <h3 className={styles.detailsTitle}>Details</h3>
          <div className={styles.detailsList}>
            <div className={styles.detailItem}>
              <CalendarOutlined className={styles.detailIcon} />
              <span className={styles.detailText}>Friday, Jan 10, 2025</span>
            </div>
            <div className={styles.detailItem}>
              <ClockCircleOutlined className={styles.detailIcon} />
              <span className={styles.detailText}>1:30 PM - 3:30 PM</span>
            </div>
            <div className={styles.detailItem}>
              <BellOutlined className={styles.detailIcon} />
              <span className={styles.detailText}>10 min before</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: '3',
      label: (
        <div className={styles.tabLabelWithProgress}>
          <span className={styles.tabLabel}>Meeting</span>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: '0%' }}></div>
          </div>
        </div>
      ),
      children: (
        <div className={styles.tabContent}>
          <div className={styles.pendingMessage}>Meeting scheduled for Friday, Jan 10, 2025</div>
          
          <div className={styles.meetingQuestionSection}>
            <h3 className={styles.meetingQuestion}>Did the meeting happen?</h3>
            <div className={styles.yesNoButtons}>
              <Button className={styles.yesNoButton}>
                Yes
              </Button>
              <Button className={styles.yesNoButton}>
                No
              </Button>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: '4',
      label: (
        <div className={styles.tabLabelWithProgress}>
          <span className={styles.tabLabel}>Review your advisor</span>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: '0%' }}></div>
          </div>
        </div>
      ),
      children: (
        <div className={styles.tabContent}>
          <div className={styles.reviewSection}>
            <h3 className={styles.advisorTitle}>Advisor</h3>
            <div className={styles.advisorCard}>
              <div className={styles.advisorAvatar}>JD</div>
              <div className={styles.advisorInfo}>
                <h4 className={styles.advisorName}>Jane Doe</h4>
                <p className={styles.advisorContact}>Cell: 4187651234</p>
                <p className={styles.advisorContact}>Email: janedoe@gmail.com</p>
              </div>
            </div>

            <div className={styles.ratingSection}>
              <h3 className={styles.rateTitle}>Rate your advisor!</h3>
              <p className={styles.rateDescription}>
                Please share your experience to help us improve our service
              </p>
              
              <div className={styles.ratingContainer}>
                <Rate 
                  value={rating} 
                  onChange={setRating}
                  className={styles.customRate}
                />
              </div>

              <div className={styles.commentsSection}>
                <label className={styles.commentsLabel}>
                  Comments
                  <span className={styles.optional}>?</span>
                </label>
                <Input.TextArea
                  placeholder="Lorem Ipsum"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                  className={styles.commentsTextarea}
                />
              </div>

              <Button type="primary" onClick={handleSubmitRating} className={styles.submitButton} >Submit Rating</Button>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <PageContent pageType="overview">
      {/* Custom Alert at the top */}
      <CustomAlert
        style={{ marginBottom: '20px', marginTop: '-30px', marginLeft: '-30px', marginRight: '-30px' }}
        message="Want to save? You are also eligible for a [Same Category] quote."
        secondaryMessage="Get a free quote now!"
        buttonText="Get Free [Same Category Insurance] Quote"
        category="Life Insurance"
        onButtonClick={() => {
          console.log('Get quote clicked');
          // Handle navigation to quote page
        }}
        onClose={() => {
          console.log('Alert closed');
        }}
      />
      
      <div className={styles.overviewPage}>
        {/* Main Header */}
        <div>
          <h1 className={styles.mainHeading}>Here is your estimate!</h1>
          <p className={styles.subheading}>
            The price is not final — an advisor will call you to confirm your health status, then adjust the duration and price according to your needs.
          </p>
        </div>

        {/* Cards Container */}
        <div className={styles.cardsContainer}>
          {/* Estimated Price Card */}
          <div className={styles.estimateCard}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>Estimated Price</h3>
              <span className={styles.monthlyBadge}>Monthly</span>
            </div>
            
            <p className={styles.customerName}>For {customerName}</p>
            
            <div className={styles.priceRange}>$25.2 - $29.48</div>
            
            <div className={styles.termInfo}>
              <span className={styles.termLabel}>Term:</span>
              <span className={styles.termValue}>10-Year Term</span>
            </div>
            
            <div className={styles.termInfo}>
              <span className={styles.termLabel}>Coverage:</span>
              <span className={styles.termValue}>$250,000</span>
            </div>
            
            <div className={styles.benefitsContainer}>
              <div className={styles.benefitItem}>
                <span className={styles.benefitLabel}>Benefit 1:</span>
                <span className={styles.benefitValue}>Cool benefit</span>
              </div>
              <div className={styles.benefitItem}>
                <span className={styles.benefitLabel}>Benefit 2:</span>
                <span className={styles.benefitValue}>Cool benefit</span>
              </div>
              <div className={styles.benefitItem}>
                <span className={styles.benefitLabel}>Benefit 3:</span>
                <span className={styles.benefitValue}>Cool benefit</span>
              </div>
            </div>
          </div>

          {/* Top Insurers Card */}
          <div className={styles.insurersCard}>
            <h3 className={styles.cardTitle}>Top Insurers</h3>
            <div className={styles.insurersGrid}>
              <div className={styles.insurerLogo}>iA Financial</div>
              <div className={styles.insurerLogo}>Ivari</div>
              <div className={styles.insurerLogo}>Empire Life</div>
              <div className={styles.insurerLogo}>Co-operators</div>
              <div className={styles.insurerLogo}>Desjardins</div>
              <div className={styles.insurerLogo}>Manulife</div>
            </div>
          </div>
        </div>

        {/* Next Step Section */}
        <Section variant="card">
          <h2 className={styles.nextStepTitle}>Next Step: Schedule a call with your advisor</h2>
          <p className={styles.nextStepDescription}>
            Congratulations! An advisor has received your request and will prepare your personalized quotes. 
            Schedule a call so they can contact you at the right time.
          </p>

          <div className={'flex '+ styles.tabsContainer}>
            <Tabs
              defaultActiveKey="2"
              items={tabItems}
              className={styles.customTabs}
            />
            <div className={styles.overallProgress}>
              <span className={styles.progressPercentage}>25%</span>
            </div>
          </div>
          
          <div className={styles.advisorSection}>
            <h3 className={styles.advisorTitle}>Advisor</h3>
            <div className={styles.advisorCard}>
              <div className={styles.advisorAvatar}>JD</div>
              <div className={styles.advisorInfo}>
                <h4 className={styles.advisorName}>Jane Doe</h4>
                <p className={styles.advisorContact}>Cell: 4187651234</p>
                <p className={styles.advisorContact}>Email: janedoe@gmail.com</p>
              </div>
            </div>
            
            <div className={styles.buttonGroup}>
              <Button 
                type="primary"
                onClick={handleBookCall}
                block
              >
                Book a call with Jane Doe
              </Button>
              
              <Button 
                onClick={handleReschedule}
                block
                className={styles.rescheduleButton}
              >
                Reschedule Meeting
              </Button>
            </div>
          </div>
        </Section>

        {/* More Options Section */}
        <MoreOptions />
      </div>
    </PageContent>
  );
};

export default Overview;
