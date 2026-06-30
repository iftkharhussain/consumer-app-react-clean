/**
 * Shared funnel form module — reusable, config-driven building blocks for the
 * public /questions/* product funnels. New products supply a config object to
 * <FunnelForm /> instead of redeclaring field/step components per file.
 */

export { default as FunnelForm } from './FunnelForm';
export { default as CoverageStep } from './CoverageStep';
export { default as PreferencesStep } from './PreferencesStep';
export { default as PersonsStep } from './PersonsStep';
export { default as ContactTab } from './ContactTab';
export { default as TabBar } from './TabBar';
export * from './primitives';
export * from './funnelUtils';
