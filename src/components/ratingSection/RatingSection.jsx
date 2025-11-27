import React, { useState } from 'react';
import { Rate, Input } from 'antd';
import Button from '../button/Button';
import styles from './RatingSection.module.css';

const RatingSection = ({
    title = "Rate your experience!",
    subtitle,
    description = "Please share your experience to help us improve our service",
    buttonText = "Submit Rating",
    onSubmit,
    placeholder = "Share your feedback..."
}) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');

    const handleSubmit = () => {
        if (onSubmit) {
            onSubmit({ rating, comment });
        }
        console.log('Rating submitted:', rating, comment);
    };

    return (
        <div className={styles.ratingSection}>
            <h3 className={styles.rateTitle}>{title}</h3>
            {subtitle && <h4 className={styles.rateSubtitle}>{subtitle}</h4>}
            <p className={styles.rateDescription}>{description}</p>
            
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
                    placeholder={placeholder}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={4}
                    className={styles.commentsTextarea}
                />
            </div>

            <Button type="primary" onClick={handleSubmit} className={styles.submitButton}>
                {buttonText}
            </Button>
        </div>
    );
};

export default RatingSection;
