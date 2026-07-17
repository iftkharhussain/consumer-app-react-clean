/**
 * Assurance hypothécaire — mortgage-insurance funnel.
 *   public:   /questions/mortgage-insurance       (3 steps, ends in account)
 *   internal: /explore/getquote/mortgage-insurance (logged-in, no account step)
 *
 * UI/UX only — no backend wiring yet. Built from a config handed to the shared
 * <FunnelForm />; the `mode` prop (forwarded by the route wrapper) toggles the
 * public vs internal behavior.
 */

import React from 'react';
import { FunnelForm, customFormPostUrl } from '../../components/funnel';

const mortgageInsuranceConfig = {
  badge: 'Assurance hypothécaire',
  title: 'Soumission instantanée',
  mobileLabel: 'Assurance hypothécaire',

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
          key: 'aPret',
          label: 'Avez-vous déjà un prêt hypothécaire ?',
          inputType: 'yesno',
        },
        {
          key: 'anneesRestantes',
          label: "Combien d'années vous reste-t-il à payer votre hypothèque ?",
          description: 'Approximativement',
          inputType: 'number',
          placeholder: 'ex. 20',
          suffix: 'ans',
        },
        {
          key: 'montantRestant',
          label: "Quel montant reste-t-il à payer sur l'hypothèque ?",
          description: 'Approximativement',
          inputType: 'number',
          placeholder: '250 000',
          prefix: '$',
        },
      ],
    },

    // ── Étape 2 — Pour qui est la soumission ? (borrower cards) ──
    {
      type: 'persons',
      personLabel: 'Emprunteur',
      addLabel: 'Ajouter un emprunteur',
      // 1-2 borrowers get a WinQuote price; 3+ fall back to an advisor-only result
      // page (no online price), so the cap allows adding beyond 2.
      maxPersons: 5,
      // Guardrails: keep un-quotable values out of WinQuote (verified ranges —
      // <18 or >70 yrs and <$25k return no priced records).
      minAge: 18,
      maxAge: 70,
      minMontant: 25000,
      montantLabel: "Montant d'assurance souhaité",
      // Suggested coverage = remaining mortgage balance; pre-fills the montant.
      suggestionFrom: (a) => Number(String(a.montantRestant || '').replace(/\D/g, '')) || 0,
    },

    // ── Étape 3 — Crée ton compte Norga (account, public only) ──
    {
      type: 'contact',
      collectName: false,
      backLabel: "Retour à l'étape 1",
    },
  ],

  // Backend wiring: POST to the LMS mortgage-insurance custom-form endpoint. The
  // ?auth token is this product's custom-form integration key (LMS → Settings →
  // App Config → Custom Form). Override the URL via env for other environments.
  submit: {
    postUrl: customFormPostUrl(process.env.REACT_APP_MORTGAGE_INSURANCE_FORM_AUTH),
    buildPayload: ({ answers, persons, contact }) => {
      const list = persons || [];
      const b1 = list[0] || {};
      const b2 = list[1];
      const num = (v) => (v ? Number(String(v).replace(/\D/g, '')) : null);
      const coverage = num(b1.montant) || num(answers.montantRestant) || null;
      return {
        event_id: `norga_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
        product: 'assurance-hypothecaire',
        insuranceType: 'mortgage',
        phone: contact.phone,
        email: contact.email,
        fullName: [contact.prenom, contact.nom].filter(Boolean).join(' ').trim(),
        // Borrower count — drives 1-2 (WinQuote price) vs 3+ (advisor-only) downstream.
        borrowers: list.length,
        // Flat WinQuote inputs for borrower 1 (canonical keys the LMS mapper reads).
        gender: b1.sexe || '',
        dateOfBirth: b1.dateNaissance || '',
        smoker: b1.fumeur || '',
        desiredCoverageAmount: coverage,
        province: b1.province || '',
        // Borrower 2 (only when present) — WinQuote prices up to 2 lives.
        ...(b2 ? {
          gender2: b2.sexe || '',
          dateOfBirth2: b2.dateNaissance || '',
          smoker2: b2.fumeur || '',
          desiredCoverageAmount2: num(b2.montant),
        } : {}),
        // Full borrower list for the advisor + result page.
        insured: list.map((p) => ({
          nom: p.nom, prenom: p.prenom, dateNaissance: p.dateNaissance,
          sexe: p.sexe, fumeur: p.fumeur, province: p.province, montant: num(p.montant),
        })),
        // Mortgage context from step 1.
        needs: {
          aPret: answers.aPret,
          anneesRestantes: answers.anneesRestantes,
          montantRestant: num(answers.montantRestant),
        },
        consentChecked: true,
        verification: { channel: 'sms', verifiedAt: new Date().toISOString(), isTestNumber: false },
        submittedAt: new Date().toISOString(),
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
        locale: 'fr',
      };
    },
  },
};

export default function MortgageInsurance({ mode }) {
  return <FunnelForm config={mortgageInsuranceConfig} mode={mode} />;
}
