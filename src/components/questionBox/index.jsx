import React, { useState } from 'react';
import { Card, Button, Radio, Space, Typography, Progress, Input, Select, Checkbox } from 'antd';
import { Flag05 } from '../../utils/icons';
import FeaturedIcon from '../featuredIcon';
import styles from './QuestionBox.module.css';

const { Title, Text } = Typography;
const { Option } = Select;

const QuestionBox = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});

  // Multi-step questions data
  const questions = [
    {
      id: 'quote-for',
      title: 'Start with Consumer App',
      subtitle: 'It takes only 2 minutes to get your quote',
      question: 'Who would you like to get the quote for?',
      type: 'radio',
      options: [
        { value: 'myself', label: 'Myself' },
        { value: 'me-and-kids', label: 'Me and my kids' },
        { value: 'other', label: 'Other' }
      ]
    },
    {
      id: 'coverage-type',
      title: 'Coverage Type',
      subtitle: 'Help us understand your insurance needs',
      question: 'What type of coverage are you looking for?',
      type: 'radio',
      options: [
        { value: 'health', label: 'Health Insurance' },
        { value: 'life', label: 'Life Insurance' },
        { value: 'auto', label: 'Auto Insurance' },
        { value: 'home', label: 'Home Insurance' }
      ]
    },
    {
      id: 'personal-info',
      title: 'Personal Information',
      subtitle: 'We need some basic information about you',
      question: 'Please provide your personal details',
      type: 'form',
      fields: [
        { name: 'firstName', label: 'First Name', type: 'input', required: true },
        { name: 'lastName', label: 'Last Name', type: 'input', required: true },
        { name: 'age', label: 'Age Range', type: 'select', required: true, options: [
          { value: '18-25', label: '18-25' },
          { value: '26-35', label: '26-35' },
          { value: '36-45', label: '36-45' },
          { value: '46-55', label: '46-55' },
          { value: '55+', label: '55+' }
        ]}
      ]
    },
    {
      id: 'preferences',
      title: 'Your Preferences',
      subtitle: 'Customize your coverage options',
      question: 'What features are important to you?',
      type: 'checkbox',
      options: [
        { value: 'low-premium', label: 'Low monthly premium' },
        { value: 'comprehensive', label: 'Comprehensive coverage' },
        { value: 'fast-claims', label: 'Fast claim processing' },
        { value: 'online-access', label: '24/7 online access' },
        { value: 'customer-support', label: 'Dedicated customer support' }
      ]
    },
    {
      id: 'contact',
      title: 'Almost Done!',
      subtitle: 'We\'ll send your personalized quote',
      question: 'How would you like to receive your quote?',
      type: 'radio',
      options: [
        { value: 'email', label: 'Email me the quote' },
        { value: 'phone', label: 'Call me with details' },
        { value: 'both', label: 'Both email and phone call' }
      ]
    }
  ];

  const currentQuestion = questions[currentStep];
  const progress = Math.round(((currentStep + 1) / questions.length) * 100);

  const handleOptionChange = (e) => {
    setAnswers({
      ...answers,
      [currentQuestion.id]: e.target.value
    });
  };

  const handleCheckboxChange = (checkedValues) => {
    setAnswers({
      ...answers,
      [currentQuestion.id]: checkedValues
    });
  };

  const handleFormFieldChange = (fieldName, value) => {
    setAnswers({
      ...answers,
      [currentQuestion.id]: {
        ...answers[currentQuestion.id],
        [fieldName]: value
      }
    });
  };

  const handleCancel = () => {
    setCurrentStep(0);
    setAnswers({});
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleNext = () => {
    const currentAnswer = answers[currentQuestion.id];
    
    // Validation
    if (currentQuestion.type === 'form') {
      const requiredFields = currentQuestion.fields.filter(field => field.required);
      const isValid = requiredFields.every(field => 
        currentAnswer && currentAnswer[field.name] && currentAnswer[field.name].trim() !== ''
      );
      if (!isValid) {
        return; // Don't proceed if validation fails
      }
    } else if (!currentAnswer || (Array.isArray(currentAnswer) && currentAnswer.length === 0)) {
      return; // Don't proceed if no option selected
    }

    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Final step - submit the form
      console.log('Form completed:', answers);
      alert('Thank you! Your quote request has been submitted.');
    }
  };

  const isNextDisabled = () => {
    const currentAnswer = answers[currentQuestion.id];
    
    if (currentQuestion.type === 'form') {
      const requiredFields = currentQuestion.fields.filter(field => field.required);
      return !requiredFields.every(field => 
        currentAnswer && currentAnswer[field.name] && currentAnswer[field.name].trim() !== ''
      );
    }
    
    return !currentAnswer || (Array.isArray(currentAnswer) && currentAnswer.length === 0);
  };

  const renderQuestionContent = () => {
    const currentAnswer = answers[currentQuestion.id];

    switch (currentQuestion.type) {
      case 'radio':
        return (
          <Radio.Group 
            value={currentAnswer} 
            onChange={handleOptionChange}
            className={styles.optionsGroup}
          >
            {currentQuestion.options.map((option) => (
              <Radio.Button key={option.value} value={option.value} className={styles.optionRadio}>
                {option.label}
              </Radio.Button>
            ))}
          </Radio.Group>
        );

      case 'checkbox':
        return (
          <Checkbox.Group
            value={currentAnswer || []}
            onChange={handleCheckboxChange}
            className={styles.checkboxGroup}
          >
            <Space direction="vertical" size="middle" className={styles.optionsSpace}>
              {currentQuestion.options.map((option) => (
                <Checkbox key={option.value} value={option.value} className={styles.optionCheckbox}>
                  {option.label}
                </Checkbox>
              ))}
            </Space>
          </Checkbox.Group>
        );

      case 'form':
        return (
          <div className={styles.form}>
            {currentQuestion.fields.map((field) => {
              const fieldValue = currentAnswer?.[field.name] || '';
              
              if (field.type === 'input') {
                return (
                  <div key={field.name} className={styles.formField}>
                    <label className={styles.formLabel}>
                      {field.label}
                      {field.required && <span className={styles.required}>*</span>}
                    </label>
                    <Input
                      value={fieldValue}
                      onChange={(e) => handleFormFieldChange(field.name, e.target.value)}
                      placeholder={`Enter your ${field.label.toLowerCase()}`}
                      className={styles.formInput}
                    />
                  </div>
                );
              }
              
              if (field.type === 'select') {
                return (
                  <div key={field.name} className={styles.formField}>
                    <label className={styles.formLabel}>
                      {field.label}
                      {field.required && <span className={styles.required}>*</span>}
                    </label>
                    <Select
                      value={fieldValue || undefined}
                      onChange={(value) => handleFormFieldChange(field.name, value)}
                      placeholder={`Select ${field.label.toLowerCase()}`}
                      className={styles.formSelect}
                      style={{ width: '100%' }}
                    >
                      {field.options.map((option) => (
                        <Option key={option.value} value={option.value}>
                          {option.label}
                        </Option>
                      ))}
                    </Select>
                  </div>
                );
              }
              
              return null;
            })}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={styles.container}>
      <Card className={styles.card}>
        {/* Header with icon and title */}
        <div className={styles.header}>
          <div className={styles.iconContainer}>
            <FeaturedIcon 
              icon={Flag05} 
              size="lg" 
              color="gray" 
              type="modern" 
            />
          </div>
          <div className={styles.headerContent}>
            <Title level={5} className={styles.title}>{currentQuestion.title}</Title>
            <Text className={styles.subtitle}>{currentQuestion.subtitle}</Text>
            <Progress 
              percent={progress} 
              showInfo={true} 
              className={styles.progressBar}
              format={(percent) => `${percent}%`}
            />
          </div>
        </div>

        {/* Question */}
        <div className={styles.content}>
          <Text className={styles.questionText}>{currentQuestion.question}</Text>
          
          {/* Dynamic question content */}
          {renderQuestionContent()}
        </div>

        {/* Action buttons */}
        <div className={styles.actions}>
          <div className={styles.actionsLeft}>
            {currentStep > 0 && (
              <Button 
                onClick={handleBack}
                className={styles.backButton}
              >
                Back
              </Button>
            )}
          </div>
          <div className={styles.actionsRight}>
            <Button 
              onClick={handleCancel}
              className={styles.cancelButton}
            >
              Cancel
            </Button>
            <Button 
              type="primary" 
              onClick={handleNext}
              disabled={isNextDisabled()}
              className={styles.nextButton}
            >
              {currentStep === questions.length - 1 ? 'Get Quote' : 'Next'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default QuestionBox;
