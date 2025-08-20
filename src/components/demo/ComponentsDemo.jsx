import React, { useState } from 'react';
import Button from '../button';
import Input from '../input';
import Badge from '../badge';
import Avatar from '../avatar';
import Icon, { CheckIcon, ChevronDownIcon, InfoIcon } from '../icon';
import IconWithCircles from '../iconWithCircles';
import Tooltip from '../tooltip';
import styles from './ComponentsDemo.module.css';

const ComponentsDemo = () => {
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      console.log('Form submitted with:', inputValue);
    }, 2000);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>UntitledUI Components Demo</h1>
        <p className={styles.subtitle}>
          Integration of UntitledUI design system components with Ant Design
        </p>
      </div>

      {/* Button Examples */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Buttons</h2>
        <div className={styles.grid}>
          <div className={styles.group}>
            <h3>Primary Buttons</h3>
            <div className={styles.buttonRow}>
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
              <Button size="xl">Extra Large</Button>
            </div>
          </div>

          <div className={styles.group}>
            <h3>Secondary Buttons</h3>
            <div className={styles.buttonRow}>
              <Button color="secondary" size="sm">Small</Button>
              <Button color="secondary" size="md">Medium</Button>
              <Button color="secondary" size="lg">Large</Button>
              <Button color="secondary" size="xl">Extra Large</Button>
            </div>
          </div>

          <div className={styles.group}>
            <h3>Buttons with Icons</h3>
            <div className={styles.buttonRow}>
              <Button iconLeading={CheckIcon} size="md">
                Save Changes
              </Button>
              <Button color="secondary" iconTrailing={ChevronDownIcon} size="md">
                Options
              </Button>
              <Button color="primary-destructive" iconLeading={InfoIcon} size="md">
                Delete
              </Button>
            </div>
          </div>

          <div className={styles.group}>
            <h3>States</h3>
            <div className={styles.buttonRow}>
              <Button isLoading={isLoading} showTextWhileLoading size="md" onClick={handleSubmit}>
                Submit Form
              </Button>
              <Button isDisabled size="md">
                Disabled
              </Button>
              <Button color="link-color" size="md">
                Link Button
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Input Examples */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Input Fields</h2>
        <div className={styles.grid}>
          <div className={styles.group}>
            <Input
              label="Email Address"
              placeholder="Enter your email"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              hint="We'll never share your email with anyone else."
              isRequired
            />
          </div>

          <div className={styles.group}>
            <Input
              label="Password"
              placeholder="Enter password"
              type="password"
              icon={InfoIcon}
              tooltip="Password must be at least 8 characters"
              size="md"
            />
          </div>

          <div className={styles.group}>
            <Input
              label="Search"
              placeholder="Search..."
              shortcut="⌘K"
              size="lg"
            />
          </div>

          <div className={styles.group}>
            <Input
              placeholder="This field has an error"
              isInvalid
              hint="This is an error message"
            />
          </div>
        </div>
      </section>

      {/* Badge Examples */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Badges</h2>
        <div className={styles.badgeGrid}>
          <Badge variant="primary" size="sm">Primary</Badge>
          <Badge variant="secondary" size="md">Secondary</Badge>
          <Badge variant="success" size="lg">Success</Badge>
          <Badge variant="warning">Warning</Badge>
          <Badge variant="error">Error</Badge>
          <Badge variant="gray">Gray</Badge>
          <Badge variant="primary" dot />
          <Badge variant="success" onClose={() => console.log('Badge closed')}>
            Closable
          </Badge>
        </div>
      </section>

      {/* Avatar Examples */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Avatars</h2>
        <div className={styles.avatarGrid}>
          <div className={styles.avatarGroup}>
            <h4>Sizes</h4>
            <div className={styles.avatarRow}>
              <Avatar size="xs" name="John Doe" />
              <Avatar size="sm" name="Jane Smith" />
              <Avatar size="md" name="Bob Johnson" />
              <Avatar size="lg" name="Alice Brown" />
              <Avatar size="xl" name="Charlie Wilson" />
            </div>
          </div>

          <div className={styles.avatarGroup}>
            <h4>With Status</h4>
            <div className={styles.avatarRow}>
              <Avatar name="Online User" status="online" size="lg" />
              <Avatar name="Away User" status="away" size="lg" />
              <Avatar name="Busy User" status="busy" size="lg" />
              <Avatar name="Offline User" status="offline" size="lg" />
            </div>
          </div>
        </div>
      </section>

      {/* Icon Examples */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Icons</h2>
        <div className={styles.iconGrid}>
          <Tooltip title="Check Icon">
            <CheckIcon size="lg" color="success" />
          </Tooltip>
          <Tooltip title="Chevron Down">
            <ChevronDownIcon size="lg" color="primary" />
          </Tooltip>
          <Tooltip title="Info Icon">
            <InfoIcon size="lg" color="default" />
          </Tooltip>
          <Icon
            icon={CheckIcon}
            size="xl"
            color="error"
            onClick={() => console.log('Icon clicked')}
          />
        </div>
      </section>

      {/* Icon with Circles Examples */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Icons with Circles</h2>
        <div className={styles.iconGrid}>
          <div className={styles.iconWithCirclesGroup}>
            <h4>Sizes</h4>
            <div className={styles.iconRow}>
              <IconWithCircles icon={CheckIcon} size="xs" variant="success" />
              <IconWithCircles icon={InfoIcon} size="sm" variant="primary" />
              <IconWithCircles icon={ChevronDownIcon} size="md" variant="secondary" />
              <IconWithCircles icon={CheckIcon} size="lg" variant="warning" />
              <IconWithCircles icon={InfoIcon} size="xl" variant="error" />
            </div>
          </div>

          <div className={styles.iconWithCirclesGroup}>
            <h4>Variants</h4>
            <div className={styles.iconRow}>
              <IconWithCircles icon={CheckIcon} variant="primary" size="lg" />
              <IconWithCircles icon={CheckIcon} variant="secondary" size="lg" />
              <IconWithCircles icon={CheckIcon} variant="success" size="lg" />
              <IconWithCircles icon={CheckIcon} variant="warning" size="lg" />
              <IconWithCircles icon={CheckIcon} variant="error" size="lg" />
              <IconWithCircles icon={CheckIcon} variant="info" size="lg" />
            </div>
          </div>

          <div className={styles.iconWithCirclesGroup}>
            <h4>Interactive</h4>
            <div className={styles.iconRow}>
              <IconWithCircles 
                icon={CheckIcon} 
                variant="success" 
                size="lg" 
                onClick={() => console.log('Success action clicked')}
              />
              <IconWithCircles 
                icon={InfoIcon} 
                variant="primary" 
                size="lg" 
                onClick={() => console.log('Info action clicked')}
              />
              <IconWithCircles 
                icon={() => (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path
                      d="M15 5L5 15M5 5L15 15"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )} 
                variant="error" 
                size="lg" 
                onClick={() => console.log('Delete action clicked')}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Example */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Interactive Example</h2>
        <div className={styles.interactiveExample}>
          <div className={styles.form}>
            <Input
              label="Full Name"
              placeholder="Enter your full name"
              isRequired
              size="md"
            />
            <Input
              label="Email"
              placeholder="Enter your email"
              type="email"
              isRequired
              size="md"
            />
            <div className={styles.formActions}>
              <Button color="secondary" size="md">
                Cancel
              </Button>
              <Button
                color="primary"
                size="md"
                iconLeading={CheckIcon}
                isLoading={isLoading}
                onClick={handleSubmit}
              >
                Save Profile
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ComponentsDemo;
