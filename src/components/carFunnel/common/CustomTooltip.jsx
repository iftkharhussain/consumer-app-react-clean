/* eslint-disable */
import React, { useState } from 'react';
import 'styles/carFunnel/components/CustomTooltip.css';

const CustomTooltip = ({ children, content, placement = 'top', alwaysVisible = false }) => {
  const [visible, setVisible] = useState(false);

  const isVisible = alwaysVisible || visible;

  // Function to render text with blue highlight for "save up to ..."
  const renderContent = (text) => {
    if (typeof text === 'string') {
      const parts = text.split(/(save up to \d+%!?)/i);
      return parts.map((part, index) => {
        if (/save up to \d+%!?/i.test(part)) {
          return (
            <span key={index} className="custom-tooltip__highlight">
              {part}
            </span>
          );
        }
        return <span key={index}>{part}</span>;
      });
    }
    return text;
  };

  const wrapperClasses = [
    'custom-tooltip__wrapper',
    isVisible ? 'custom-tooltip__wrapper--visible' : '',
    `custom-tooltip__wrapper--${placement}`
  ].filter(Boolean).join(' ');

  const arrowClasses = [
    'custom-tooltip__arrow',
    `custom-tooltip__arrow--${placement}`
  ].join(' ');

  return (
    <div
      className="custom-tooltip"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      <div className={wrapperClasses}>
        <div className="custom-tooltip__content">
          {renderContent(content)}
        </div>
        <div className={arrowClasses} />
      </div>
    </div>
  );
};

export default CustomTooltip;
