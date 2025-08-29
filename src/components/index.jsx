// Essential UI Components Export

// Page Layout Components
export { default as PageBanner } from './pageBanner';
export { default as PageHeading } from './pageHeading';
export { default as PageHeader } from './pageHeader';
export { default as PageContent } from './pageContent';
export { default as PanelWrapper } from './PanelWrapper';

// UI Components
export { default as Banner } from './banner';
export { default as Card } from './card';
export { default as CustomInput } from './customInput';
export { default as CustomSwitch } from './switch';

// Utility Components
export { default as Loader } from './loader';
export { default as ErrorBoundary } from './errorBoundary';
export { default as ScreenResolutionAlert } from './screenResolutionAlert';

// Form Components
export { default as NumericInput } from './numericInput';
export { default as PhoneInput } from './phone';

// Content Components
export { default as ContentBox } from './contentBox';
export { default as InfoText } from './infoText';
export { default as LinkPreviewBadge } from './linkPreviewBadge';
export { default as UserProfileBadge } from './userProfileBadge';
export { default as AdvisorTypeBadge } from './advisorTypeBadge';
export { default as StatusBadge } from './statusBadge';
export { default as QuestionBox } from './questionBox';

// Error Pages
export { default as PageNotFound } from './errorsPages/notFound';
export { default as NotFound } from './notFound';

// UntitledUI-inspired Components
export { default as Button } from './button';
export { 
  default as Input,
  TextArea,
  Password 
} from './input';
export {
  default as Badge,
  PrimaryBadge,
  SecondaryBadge,
  SuccessBadge,
  WarningBadge,
  ErrorBadge,
  GrayBadge
} from './badge';
export {
  default as Avatar,
  XSAvatar,
  SMAvatar,
  MDAvatar,
  LGAvatar,
  XLAvatar,
  XXLAvatar,
  OnlineAvatar,
  OfflineAvatar,
  AwayAvatar,
  BusyAvatar
} from './avatar';
export {
  default as Icon,
  CheckIcon,
  ChevronDownIcon,
  InfoIcon,
  AlertTriangleIcon,
  XIcon,
  ArrowRightIcon
} from './icon';
export { default as IconWithCircles } from './iconWithCircles';
export { default as Tooltip } from './tooltip';

// Layout Components
export { default as Heading } from './heading';
export { default as Section } from './section';
export { default as Text } from './text';

// Demo Component
export { default as ComponentsDemo } from './demo/ComponentsDemo';

// Notification Message Component (if it exists)
export const NotificationMessage = ({ message, type = 'info' }) => {
  return null; // Placeholder component
};
