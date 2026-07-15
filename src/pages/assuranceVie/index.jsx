/**
 * Assurance vie — life-insurance funnel.
 *   public:   /questions/life-insurance             (3 steps, real OTP submit)
 *   internal: /explore/getquote/life-insurance       (logged-in short form)
 *
 * Migrated onto the shared <FunnelForm />: this file is now just the config
 * (previously ~985 lines of duplicated components). Behavior is preserved —
 * the coverage quiz + suggested-amount logic, insured cards, and the real
 * funnels/submit payload (product 'assurance-vie').
 *
 * Internal short form: drops BOTH the coverage quiz (internalDrops: 'coverage') and
 * the account/OTP step (the user is already logged in). It shows just the insured
 * step — no "+ add insured" button, a big green CTA — then submits with the logged-in
 * profile contact to the life custom-form endpoint and follows the LMS redirect to the
 * quote result. Wiring lives in FunnelForm's submitInternal().
 */

import React from 'react';
import { FunnelForm } from '../../components/funnel';

const MONTANT_TIP = (
  <span>
    Choisissez un montant <strong>au moins équivalent à la somme de vos dettes</strong>{' '}
    (hypothèque, prêts, carte de crédit…)
  </span>
);

// Suggested coverage from the coverage quiz (base by reason, +dependents, mortgage floor).
function suggestAmount(a) {
  let base = 250000;
  if (a.reason === 'revenu') base = 500000;
  else if (a.reason === 'dettes') {
    if (a.debtRange === 'moins-100k') base = 100000;
    else if (a.debtRange === '100k-300k') base = 250000;
    else if (a.debtRange === '300k-500k') base = 400000;
    else if (a.debtRange === 'plus-500k') base = 600000;
  } else if (a.reason === 'funeraires') base = 25000;
  else if (a.reason === 'proches') base = 200000;

  if (a.dependents === '1-2') base += 100000;
  else if (a.dependents === '3plus') base += 200000;

  if (a.reason !== 'dettes') {
    if (a.mortgage === 'moins-200k') base = Math.max(base, 200000);
    else if (a.mortgage === '200k-500k') base = Math.max(base, 500000);
    else if (a.mortgage === 'plus-500k') base = Math.max(base, 600000);
  }
  return base;
}

// funnels/submit payload — mirrors the previous buildPayload exactly.
function buildViePayload({ email, phone, persons, answers, selectedPerson }) {
  const insured = (persons || []).map((p) => ({
    nom: p.nom,
    prenom: p.prenom,
    dateNaissance: p.dateNaissance,
    sexe: p.sexe,
    fumeur: p.fumeur,
    province: p.province,
    montant: p.montant ? Number(String(p.montant).replace(/\D/g, '')) : null,
  }));
  const event_id = `norga_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
  const primary = selectedPerson || (persons && persons[0]) || {};
  const fullName = [primary?.prenom, primary?.nom].filter(Boolean).join(' ').trim();
  return {
    event_id,
    product: 'assurance-vie',
    insuranceType: 'life',
    phone,
    email,
    fullName,
    // Flat WinQuote inputs for the primary insured at ROOT. The custom-form mapper
    // can't capture arrays of plain objects (insured[] only yields {index}), and the
    // LMS life mapper reads these keys at root — so the quote needs them here.
    gender: primary?.sexe || '',
    dateOfBirth: primary?.dateNaissance || '',
    smoker: primary?.fumeur || '',
    desiredCoverageAmount: primary?.montant ? Number(String(primary.montant).replace(/\D/g, '')) : null,
    province: primary?.province || '',
    insured,
    needs: answers,
    consentChecked: true,
    verification: { channel: 'sms', verifiedAt: new Date().toISOString(), isTestNumber: false },
    submittedAt: new Date().toISOString(),
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    locale: 'fr',
  };
}

const assuranceVieConfig = {
  badge: 'Assurance vie',
  title: 'Soumission instantanée',
  mobileLabel: 'Assurance vie',
  internalDrops: 'coverage', // internal short form omits the coverage quiz

  tabs: [
    { step: 'Étape 1', label: 'De quelle couverture avez-vous besoin ?' },
    { step: 'Étape 2', label: 'Pour qui est la soumission ?' },
    { step: 'Étape 3', label: 'Crée ton compte Norga' },
  ],
  mobLabels: ['Couverture', 'Pour qui ?', 'Ton compte'],

  steps: [
    // ── Étape 1 — De quelle couverture avez-vous besoin ? ──
    {
      type: 'quiz',
      doneMessage: "Vos besoins sont bien définis. Passez à l'étape suivante.",
      quiz: [
        {
          key: 'reason',
          label: 'Quelle est la principale raison pour laquelle vous cherchez une assurance vie ?',
          inputType: 'choice',
          options: [
            { value: 'revenu', label: 'Remplacer mon revenu pour ma famille' },
            { value: 'dettes', label: 'Couvrir mes dettes' },
            { value: 'proches', label: 'Laisser quelque chose à mes proches' },
            { value: 'funeraires', label: 'Couvrir les frais funéraires' },
            { value: 'incertain', label: 'Je ne suis pas encore certain' },
          ],
        },
        {
          key: 'debtRange',
          label: 'Quel est le solde approximatif de vos dettes ?',
          inputType: 'choice',
          columns: 2,
          showIf: (a) => a.reason === 'dettes',
          options: [
            { value: 'moins-100k', label: '< 100 000 $' },
            { value: '100k-300k', label: '100 – 300 k$' },
            { value: '300k-500k', label: '300 – 500 k$' },
            { value: 'plus-500k', label: '> 500 000 $' },
          ],
        },
        {
          key: 'mortgage',
          label: 'Avez-vous une hypothèque ou des dettes importantes ?',
          inputType: 'choice',
          columns: 2,
          options: [
            { value: 'non', label: 'Non' },
            { value: 'moins-200k', label: 'Moins de 200 000 $' },
            { value: '200k-500k', label: 'Entre 200 000 $ et 500 000 $' },
            { value: 'plus-500k', label: 'Plus de 500 000 $' },
          ],
        },
        {
          key: 'dependents',
          label: 'Des personnes dépendent-elles de votre revenu ?',
          inputType: 'choice',
          columns: 2,
          options: [
            { value: 'non', label: 'Non' },
            { value: '1-2', label: 'Oui, 1–2' },
            { value: '3plus', label: 'Oui, 3 ou +' },
          ],
        },
      ],
    },

    // ── Étape 2 — Pour qui est la soumission ? ──
    {
      type: 'persons',
      personLabel: 'Assuré',
      firstPersonLabel: 'Assuré principal',
      addLabel: 'Ajouter un assuré',
      maxPersons: 10,
      montantLabel: "Montant d'assurance souhaité",
      montantTip: MONTANT_TIP,
      // WinQuote carriers only price coverage between $25,000 and $2,000,000 — block
      // out-of-range entries so the quote never comes back empty ("Sur demande").
      minMontant: 25000,
      maxMontant: 2000000,
      // Quotable age band at the $25k floor: carriers return products for ~18–74 and
      // nothing at 75+ (or for young children at this coverage). Guard both ends so the
      // online estimate never comes back empty — over-74 is routed to an advisor.
      minAge: 18,
      maxAge: 74,
      // Suggested coverage only once the reason is known (never in the short form).
      suggestionFrom: (a) => (a.reason ? suggestAmount(a) : 0),
    },

    // ── Étape 3 — Crée ton compte Norga (real submit) ──
    {
      type: 'contact',
      collectName: false,
      api: true,
      otp: true, // life sends the SMS verification code
      logLabel: 'assurance-vie',
      buildPayload: buildViePayload,
      // Post to the LIFE custom-form endpoint (its own token) rather than the shared
      // window.FORM_SUBMISSION_API — which the car funnel points at its own endpoint.
      postUrl:
        process.env.REACT_APP_LIFE_FORM_POST_URL ||
        'http://localhost:3024/api/v1/lead/custom-form?auth=e8659bcfade113f081575a0b47af777ee3c0c321',
    },
  ],
};

export default function AssuranceVie({ mode }) {
  return <FunnelForm config={assuranceVieConfig} mode={mode} />;
}
