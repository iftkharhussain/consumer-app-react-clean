import React from 'react';
import { Modal } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';
import styles from './ScheduleModal.module.css';
import { getFullSchedule } from '../../utils/businessHours';

const ScheduleModal = ({ isOpen, onClose }) => {
  const scheduleData = getFullSchedule();

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={500}
      centered
      className={styles.modal}
      closeIcon={<img src="/images/Button close X.svg" alt="Close" />}
      title={<h2 className={styles.title}>Horaire complet</h2>}
    >
      <div className={styles.modalContent}>
        <div className={styles.scheduleList}>
          {scheduleData.map((item, index) => (
            <div 
              key={index} 
              className={`${styles.scheduleRow} ${item.isToday ? styles.todayRow : ''}`}
            >
              <div className={styles.dayColumn}>
                <span className={item.isToday ? styles.dayTextToday : styles.dayText}>
                  {item.day}
                </span>
                {item.isToday && (
                  <span className={styles.todayBadge}>(Aujourd'hui)</span>
                )}
              </div>
              <div className={styles.hoursColumn}>
                <span className={item.hours === 'Fermé' ? styles.closedText : (item.isToday ? styles.hoursTextToday : styles.hoursText)}>
                  {item.hours}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.footerNote}>
          <CalendarOutlined className={styles.footerIcon} />
          <span>Les heures peuvent varier durant les jours fériés</span>
        </div>
      </div>
    </Modal>
  );
};

export default ScheduleModal;
