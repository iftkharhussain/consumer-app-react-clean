/**
 * FunnelForm — the reusable, config-driven shell for every public /questions/*
 * form. Supports any number of steps (typically 2 or 3); no per-product forking.
 *
 * Config (two interchangeable shapes):
 *
 *   // A) explicit steps array
 *   { badge, title, mobileLabel, tabs, mobLabels,
 *     steps: [ {type:'quiz',...}, {type:'preferences',...}, {type:'contact',...} ] }
 *
 *   // B) legacy per-step keys (step2 optional — omit it for a 2-step funnel)
 *   { badge, title, mobileLabel, tabs, mobLabels,
 *     step1: { quiz, doneMessage? },
 *     step2?: { quiz, doneMessage? } | { type:'preferences', ... },
 *     contact?: { collectName? } }
 *
 * `tabs` / `mobLabels` length must match the number of steps.
 */

import React, { useState } from 'react';
import TabBar from './TabBar';
import CoverageStep from './CoverageStep';
import PreferencesStep from './PreferencesStep';
import PersonsStep, { createPerson, isPersonsComplete } from './PersonsStep';
import ContactTab from './ContactTab';
import { MobProgress, MobSlide } from './Mobile';
import { isValidAmount } from '../../pages/assuranceVie/formValidation';
import logo from '../../logo.svg';
import styles from '../../pages/assuranceVie/AssuranceVie.module.css';

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
  if (step.type === 'persons') return [createPerson()];
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

export default function FunnelForm({ config }) {
  const { badge, title, mobileLabel, tabs, mobLabels } = config;
  const steps = resolveSteps(config);
  const total = steps.length;

  const [tab, setTab] = useState(0);
  const [answers, setAnswers] = useState(() => steps.map(initialAnswers));

  const setStepAnswers = (i, val) => setAnswers((prev) => prev.map((a, idx) => (idx === i ? val : a)));

  function stepDone(i) {
    const s = steps[i];
    if (s.type === 'quiz') return isQuizComplete(s.quiz, answers[i]);
    if (s.type === 'preferences') return s.fields.every((f) => answers[i][f.key]);
    if (s.type === 'persons') return isPersonsComplete(answers[i]);
    return true; // contact step — reachable once prior steps are complete
  }

  // A tab is reachable only when every step before it is complete.
  const stepEnabled = (i) => steps.slice(0, i).every((_, idx) => stepDone(idx));
  const changeTab = (i) => { if (stepEnabled(i)) setTab(i); };

  function renderStep(i) {
    const s = steps[i];
    const onNext = () => changeTab(i + 1);
    const onBack = i > 0 ? () => setTab(i - 1) : undefined;

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
          addLabel={s.addLabel}
          maxPersons={s.maxPersons}
          montantLabel={s.montantLabel}
          montantTip={s.montantTip}
        />
      );
    }
    if (s.type === 'contact') {
      return (
        <ContactTab
          onBack={onBack}
          collectName={s.collectName}
          backLabel={`Retour à l'étape ${i}`}
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
      />
    );
  }

  const stepContent = renderStep(tab);

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
            {stepContent}
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
            {stepContent}
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
