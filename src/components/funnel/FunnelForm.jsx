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
import { useSelector } from 'react-redux';
import { CheckOutlined, LoadingOutlined } from '@ant-design/icons';
import { submitFunnelLead } from './funnelUtils';
import TabBar from './TabBar';
import CoverageStep from './CoverageStep';
import PreferencesStep from './PreferencesStep';
import PersonsStep, { createPerson, isPersonsComplete } from './PersonsStep';
import ContactTab from './ContactTab';
import { MobProgress, MobSlide } from './Mobile';
import { isValidAmount } from '../../pages/assuranceVie/formValidation';
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

  // Internal (logged-in) funnels always drop the account/contact step — the user is
  // already authenticated, so we submit with their profile contact instead. "Short
  // form" funnels (internalDrops: 'coverage') also drop the coverage quiz, leaving
  // just the insured step before the submit.
  const dropTypes = internal
    ? (config.internalDrops === 'coverage' ? ['contact', 'quiz'] : ['contact'])
    : [];
  const shortInternal = internal && config.internalDrops === 'coverage';
  const allSteps = resolveSteps(config);

  // Indices of the steps that survive the internal drop (all steps in public mode).
  const keptIdx = allSteps.map((_, i) => i).filter((i) => !dropTypes.includes(allSteps[i].type));
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
  const [submitting, setSubmitting] = useState(false);
  // Logged-in user (internal mode) — supplies the contact for the account-less submit.
  const userProfile = useSelector((state) => state.app?.user_profile) || {};

  const setStepAnswers = (i, val) => setAnswers((prev) => prev.map((a, idx) => (idx === i ? val : a)));

  // Merge object-shaped (quiz/preferences) answers so a suggestion can read them.
  const mergedAnswers = () => answers.reduce((acc, a) => (Array.isArray(a) ? acc : { ...acc, ...a }), {});
  const suggestionFor = (s) => (s.suggestionFrom ? s.suggestionFrom(mergedAnswers()) : undefined);

  function stepDone(i) {
    const s = steps[i];
    if (s.type === 'quiz') return isQuizComplete(s.quiz, answers[i]) && !(s.blockIf && s.blockIf(answers[i]));
    if (s.type === 'preferences') return s.fields.every((f) => answers[i][f.key]);
    if (s.type === 'persons') return isPersonsComplete(answers[i], { minAge: s.minAge, maxAge: s.maxAge, minMontant: s.minMontant, maxMontant: s.maxMontant });
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

  // Internal (logged-in) submit: build the funnel payload from the insured step plus
  // the logged-in profile contact and POST it to the funnel's own custom-form endpoint,
  // then follow the LMS redirect (/auth/lead-login?token=…) to the quote result — the
  // same path the public ContactTab takes after OTP, minus the account/OTP step.
  async function submitInternal() {
    setSubmitted(true);
    const contactStep = allSteps.find((st) => st.type === 'contact');
    const postUrl = contactStep?.postUrl || config.submit?.postUrl;
    const personsIdx = steps.findIndex((st) => st.type === 'persons');
    const personsList = personsIdx >= 0 ? answers[personsIdx] : [];
    const email = userProfile.email || '';
    const phone = userProfile.phone || userProfile.phoneNumber || '';
    const build = contactStep?.buildPayload
      ? (args) => contactStep.buildPayload(args)
      : (config.submit
        ? ({ email: e, phone: p }) => config.submit.buildPayload({
          answers: mergedAnswers(), persons: personsList, contact: { email: e, phone: p },
        })
        : null);
    if (!postUrl || !build) return; // not wired for this funnel — keep the confirmation view
    const payload = build({ email, phone, persons: personsList, answers: mergedAnswers(), selectedPerson: personsList[0] });
    setSubmitting(true);
    try {
      const data = await submitFunnelLead(postUrl, payload);
      if (data?.redirectUrl) { window.location.href = data.redirectUrl; return; }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[funnel:internal] submit failed:', err);
    }
    setSubmitting(false);
  }

  function renderStep(i) {
    const s = steps[i];
    const isFinal = i === steps.length - 1;
    const onBack = i > 0 ? () => setTab(i - 1) : undefined;
    // In internal mode the final step submits instead of advancing to the account.
    const onNext = internal && isFinal ? submitInternal : () => advanceTo(i + 1);

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
          minAge={s.minAge}
          maxAge={s.maxAge}
          minMontant={s.minMontant}
          maxMontant={s.maxMontant}
          nextLabel={internal && isFinal ? 'Obtenir ma soumission' : 'Suivant'}
        />
      );
    }
    if (s.type === 'contact') {
      const personsIdx = steps.findIndex((st) => st.type === 'persons');
      const personsList = personsIdx >= 0 ? answers[personsIdx] : undefined;
      // Backend-wired funnels declare config.submit = { postUrl, buildPayload }.
      // Bridge its ({ answers, persons, contact }) shape onto ContactTab's payload
      // callback; forms without config.submit keep their existing s.buildPayload.
      const submit = config.submit;
      const buildPayload = submit
        ? ({ email, phone, nom, prenom }) => submit.buildPayload({
          answers: mergedAnswers(), persons: personsList || [], contact: { email, phone, nom, prenom },
        })
        : s.buildPayload;
      return (
        <ContactTab
          onBack={onBack}
          collectName={s.collectName}
          backLabel={s.backLabel || `Retour à l'étape ${i}`}
          api={s.api}
          otp={s.otp}
          logLabel={s.logLabel}
          // config.submit.postUrl (mortgage funnels) OR the contact step's own postUrl
          // (life: s.postUrl). Without the fallback, life posts to the shared
          // window.FORM_SUBMISSION_API (car token) and lands on the car error page.
          postUrl={submit?.postUrl || s.postUrl}
          buildPayload={buildPayload}
          persons={personsList}
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

  // Internal confirmation after "Obtenir ma soumission" (user already logged in — no
  // account/OTP step). While submitting we show a loader; on success the browser is
  // redirected to the quote result, so this view is only seen briefly or if submit fails.
  const submittedView = (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px 0', gap: 24, textAlign: 'center' }}>
      <div style={{ width: 56, height: 56, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(26,26,186,0.25)', background: 'linear-gradient(135deg, #1a1aba, #2525c5)' }}>
        {submitting
          ? <LoadingOutlined style={{ color: '#fff', fontSize: 26 }} spin />
          : <CheckOutlined style={{ color: '#fff', fontSize: 26 }} />}
      </div>
      <div>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#121926', margin: '0 0 8px', letterSpacing: '-0.3px' }}>
          {submitting ? 'Préparation de votre soumission…' : 'Demande envoyée !'}
        </h2>
        <p style={{ fontSize: 14, color: '#535862', lineHeight: 1.6, margin: 0 }}>
          {submitting
            ? 'Un instant, nous calculons votre soumission.'
            : 'Votre soumission a été transmise. Un conseiller Norga vous contactera sous peu.'}
        </p>
      </div>
    </div>
  );

  const content = internal && submitted ? submittedView : renderStep(tab);

  return (
    <div className={styles.root}>
      {/* ═══ DESKTOP ═══ */}
      <div className={`${styles.desktop} ${internal ? styles.desktopInternal : ''}`}>
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
            <img src="/images/norga-blue-logo.png" alt="Norga" style={{ height: 20, objectFit: 'contain' }} />
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
