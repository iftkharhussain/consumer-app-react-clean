/**
 * FunnelForm — the reusable, config-driven shell for every public /questions/*
 * form, and its logged-in /explore/getquote/* variant. No per-product forking.
 *
 * Config (two interchangeable shapes):
 *
 *   // A) explicit steps array
 *   { badge, title, mobileLabel, tabs, mobLabels,
 *     steps: [ {type:'quiz',...}, {type:'persons',...}, {type:'contact',...} ] }
 *
 *   // B) legacy per-step keys (step2 optional — omit it for a 2-step funnel)
 *   { badge, title, mobileLabel, tabs, mobLabels,
 *     step1: {...}, step2?: {...}, contact?: { collectName? } }
 *
 * A `persons` step may carry `suggestionFrom(allAnswers) => number` — a coverage
 * amount derived from earlier answers, shown as a recommendation and pre-filled
 * into each insured's montant when the step is first reached.
 *
 * mode:
 *   'public'   — full funnel ending in the account (contact) step.
 *   'internal' — logged-in quick quote: the contact step is dropped and the last
 *                remaining step submits directly (route: /explore/getquote/:slug).
 */

import React, { useState } from 'react';
import { CheckOutlined } from '@ant-design/icons';
import TabBar from './TabBar';
import CoverageStep from './CoverageStep';
import PreferencesStep from './PreferencesStep';
import PersonsStep, { createPerson, isPersonsComplete } from './PersonsStep';
import ContactTab from './ContactTab';
import { MobProgress, MobSlide } from './Mobile';
import { isValidAmount } from '../../pages/assuranceVie/formValidation';
import logo from '../../logo.svg';
import styles from './funnel.module.css';

// A quiz step is complete when every required (non-optional) visible question is
// answered. Numeric questions must hold a valid amount; multi-selects need ≥1.
function isQuizComplete(quiz, answers) {
  const sequence = quiz.filter((q) => !q.showIf || q.showIf(answers));
  return sequence.every((q) => {
    if (q.optional) return true;
    const v = answers[q.key];
    if (q.inputType === 'number') return isValidAmount(v);
    if (q.inputType === 'multiselect') return Array.isArray(v) && v.length > 0;
    return !!v;
  });
}

function preferencesDefaults(fields) {
  return Object.fromEntries((fields || []).map((f) => [f.key, f.default ?? '']));
}

function initialAnswers(step) {
  if (step.type === 'preferences') return preferencesDefaults(step.fields);
  if (step.type === 'persons') return [createPerson(step.defaultMontant)];
  return {};
}

// Normalize either config shape into an ordered steps array. The legacy
// `step1/step2/contact` keys keep working unchanged; an omitted `step2` yields a
// shorter (e.g. 2-step) funnel.
function resolveSteps(config) {
  if (config.steps) return config.steps;
  const steps = [];
  if (config.step1) steps.push({ type: 'quiz', ...config.step1 });
  if (config.step2) steps.push(config.step2.type ? config.step2 : { type: 'quiz', ...config.step2 });
  steps.push({ type: 'contact', ...(config.contact || {}) });
  return steps;
}

export default function FunnelForm({ config, mode = 'public' }) {
  const internal = mode === 'internal';
  const { badge, title, mobileLabel } = config;

  // Internal (logged-in) funnels drop one step: the account by default, or the
  // coverage quiz for a "short form" (e.g. life insurance keeps its account step).
  const dropType = config.internalDrops === 'coverage' ? 'quiz' : 'contact';
  const shortInternal = internal && dropType === 'quiz';
  const allSteps = resolveSteps(config);

  // Indices of the steps that survive the internal drop (all steps in public mode).
  const keptIdx = allSteps.map((_, i) => i).filter((i) => !internal || allSteps[i].type !== dropType);
  const steps = keptIdx.map((i) => allSteps[i]);
  // Align tabs / mobile labels to the surviving steps, renumbering "Étape N".
  const allTabs = config.tabs || [];
  const allMobLabels = config.mobLabels || [];
  const tabs = keptIdx.map((i, n) => ({ ...(allTabs[i] || {}), step: `Étape ${n + 1}` }));
  const mobLabels = keptIdx.map((i) => allMobLabels[i]).filter((x) => x !== undefined);
  const total = steps.length;

  const [tab, setTab] = useState(0);
  const [answers, setAnswers] = useState(() => steps.map(initialAnswers));
  const [submitted, setSubmitted] = useState(false);

  const setStepAnswers = (i, val) => setAnswers((prev) => prev.map((a, idx) => (idx === i ? val : a)));

  // Merge object-shaped (quiz/preferences) answers so a suggestion can read them.
  const mergedAnswers = () => answers.reduce((acc, a) => (Array.isArray(a) ? acc : { ...acc, ...a }), {});
  const suggestionFor = (s) => (s.suggestionFrom ? s.suggestionFrom(mergedAnswers()) : undefined);

  function stepDone(i) {
    const s = steps[i];
    if (s.type === 'quiz') return isQuizComplete(s.quiz, answers[i]) && !(s.blockIf && s.blockIf(answers[i]));
    if (s.type === 'preferences') return s.fields.every((f) => answers[i][f.key]);
    if (s.type === 'persons') return isPersonsComplete(answers[i]);
    return true; // contact step — reachable once prior steps are complete
  }

  // A tab is reachable only when every step before it is complete.
  const stepEnabled = (i) => steps.slice(0, i).every((_, idx) => stepDone(idx));
  const changeTab = (i) => { if (stepEnabled(i)) setTab(i); };

  // Advance to step i, pre-filling a persons step's montant from its suggestion.
  function advanceTo(i) {
    const s = steps[i];
    if (s && s.type === 'persons' && s.suggestionFrom) {
      const sug = suggestionFor(s);
      if (sug > 0) {
        setStepAnswers(i, (answers[i] || []).map((p) => (p.montant ? p : { ...p, montant: String(sug) })));
      }
    }
    changeTab(i);
  }

  function renderStep(i) {
    const s = steps[i];
    const isFinal = i === steps.length - 1;
    const onBack = i > 0 ? () => setTab(i - 1) : undefined;
    // In internal mode the final step submits instead of advancing to the account.
    const onNext = internal && isFinal ? () => setSubmitted(true) : () => advanceTo(i + 1);

    if (s.type === 'preferences') {
      return (
        <PreferencesStep
          title={s.title}
          subtitle={s.subtitle}
          fields={s.fields}
          values={answers[i]}
          onChange={(val) => setStepAnswers(i, val)}
          onNext={onNext}
          onBack={onBack}
        />
      );
    }
    if (s.type === 'persons') {
      return (
        <PersonsStep
          persons={answers[i]}
          onChange={(val) => setStepAnswers(i, val)}
          onNext={onNext}
          onBack={onBack}
          personLabel={s.personLabel}
          firstPersonLabel={s.firstPersonLabel}
          addLabel={s.addLabel}
          maxPersons={s.maxPersons}
          defaultMontant={s.defaultMontant}
          montantLabel={s.montantLabel}
          montantTip={s.montantTip}
          montantSuffix={s.montantSuffix}
          extraFields={s.extraFields}
          reco={s.reco}
          suggestion={suggestionFor(s)}
          hideAdd={shortInternal}
          greenNext={shortInternal}
          nextLabel={internal && isFinal ? 'Obtenir ma soumission' : 'Suivant'}
        />
      );
    }
    if (s.type === 'contact') {
      const personsIdx = steps.findIndex((st) => st.type === 'persons');
      return (
        <ContactTab
          onBack={onBack}
          collectName={s.collectName}
          backLabel={s.backLabel || `Retour à l'étape ${i}`}
          api={s.api}
          otp={s.otp}
          logLabel={s.logLabel}
          buildPayload={s.buildPayload}
          persons={personsIdx >= 0 ? answers[personsIdx] : undefined}
          answers={mergedAnswers()}
          selectPersonLabel={s.selectPersonLabel}
        />
      );
    }
    return (
      <CoverageStep
        quiz={s.quiz}
        answers={answers[i]}
        onChange={(val) => setStepAnswers(i, val)}
        onNext={onNext}
        onBack={onBack}
        doneMessage={s.doneMessage}
        blockIf={s.blockIf}
        blockedTitle={s.blockedTitle}
        blockedText={s.blockedText}
      />
    );
  }

  // Internal confirmation after "Obtenir ma soumission" (user already logged in —
  // no account/OTP step). UI-only for now; wire the real submit here later.
  const submittedView = (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px 0', gap: 24, textAlign: 'center' }}>
      <div style={{ width: 56, height: 56, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(26,26,186,0.25)', background: 'linear-gradient(135deg, #1a1aba, #2525c5)' }}>
        <CheckOutlined style={{ color: '#fff', fontSize: 26 }} />
      </div>
      <div>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#121926', margin: '0 0 8px', letterSpacing: '-0.3px' }}>Demande envoyée !</h2>
        <p style={{ fontSize: 14, color: '#535862', lineHeight: 1.6, margin: 0 }}>
          Votre soumission a été transmise. Un conseiller Norga vous contactera sous peu.
        </p>
      </div>
    </div>
  );

  const content = internal && submitted ? submittedView : renderStep(tab);

  return (
    <div className={styles.root}>
      {/* ═══ DESKTOP ═══ */}
      <div className={styles.desktop}>
        <div className={styles.main}>
          <div className={styles.mainInner}>
            <div style={{ marginBottom: 20 }}>
              <span className={styles.badge}>{badge}</span>
              <h1 className={styles.h1}>{title}</h1>
            </div>
            <TabBar tabs={tabs} active={tab} onChange={changeTab} enabled={stepEnabled} />
            {content}
          </div>
        </div>
      </div>

      {/* ═══ MOBILE ═══ */}
      <div className={styles.mobile}>
        <div className={styles.mobHeader}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <img src={logo} alt="Norga" style={{ height: 20, objectFit: 'contain' }} />
            <span style={{ fontSize: 10, color: '#b0bac4', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
              {mobileLabel || badge}
            </span>
          </div>
          <MobProgress step={tab + 1} total={total} labels={mobLabels} />
        </div>

        <div className={styles.mobContent}>
          <MobSlide key={tab} dir={tab === 0 ? 'right' : 'left'}>
            {content}
          </MobSlide>
        </div>

        <div className={styles.mobDots}>
          {steps.map((_, s) => (
            <div key={s} style={{ width: tab === s ? 20 : 6, height: 6, borderRadius: 999, background: tab === s ? '#1a1aba' : '#d1d5db', transition: 'all 0.3s ease' }} />
          ))}
        </div>
      </div>
    </div>
  );
}
