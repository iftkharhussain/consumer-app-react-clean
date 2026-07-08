/* eslint-disable */
import React from 'react';
import 'styles/carFunnel/components/RadioButtonGroup.css';

const RadioButtonGroup = ({
  options = [],
  value,
  onChange,
  allowWrap = false,
  buttonWidth = 'auto',
  variant = 'default',
  columns
}) => {

  // Radio icon for selected state (outer circle + inner filled circle)
  const RadioSelectedIcon = () => (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="radio-button-option__icon"
    >
      <circle cx="5" cy="5" r="4.25" stroke="#FFFFFF" strokeWidth="1.5" />
      <circle cx="5" cy="5" r="2" fill="#FFFFFF" />
    </svg>
  );

  // Radio icon for unselected state
  const RadioUnselectedIcon = () => (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="radio-button-option__icon"
    >
      <circle cx="5" cy="5" r="4.25" stroke="#ededed" strokeWidth="1.5" />
    </svg>
  );

  const SelectedIconLarge = () => (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="radio-button-option__icon radio-button-option__icon--large"
    >
      <circle cx="5" cy="5" r="4.25" stroke="#FFFFFF" strokeWidth="1.5" />
      <circle cx="5" cy="5" r="2.25" fill="#FFFFFF" />
    </svg>
  );

  const UnselectedIconLarge = () => (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="radio-button-option__icon radio-button-option__icon--large"
    >
      <circle cx="5" cy="5" r="4.25" stroke="#ededed" strokeWidth="1.5" />
    </svg>
  );

  // Dynamic grid/flex style for absolute zero inline styles where possible
  // We only use inline style for strictly dynamic layout values (columns, custom width)
  const containerStyle = columns ? {
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
  } : {};

  const containerClasses = [
    'radio-button-group',
    `radio-button-group--${variant}`,
    columns ? 'radio-button-group--grid' : '',
    allowWrap ? 'radio-button-group--wrap' : '',
    options.length > 2 ? 'has-multiple-options' : ''
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses} style={containerStyle}>
      {options.map((option, index) => {
        const isSelected = value === option.value;
        const buttonClasses = [
          'radio-button-option',
          isSelected ? 'radio-button-option--selected' : '',
          buttonWidth === 'auto' ? 'radio-button-option--auto' : ''
        ].filter(Boolean).join(' ');

        const buttonStyle = (buttonWidth !== 'auto' && buttonWidth !== '100%') ? { width: buttonWidth } : {};

        return (
          <button
            key={option.value}
            type="button"
            className={buttonClasses}
            onClick={() => onChange(option.value)}
            style={buttonStyle}
          >
            {variant === 'radio' ? (
              <>
                <span>{option.label}</span>
                {isSelected ? <RadioSelectedIcon /> : <RadioUnselectedIcon />}
              </>
            ) : (
              <>
                <span className="radio-button-option__label">
                  {option.label}
                </span>
                {variant === 'default' && (isSelected ? <SelectedIconLarge /> : <UnselectedIconLarge />)}
              </>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default RadioButtonGroup;
