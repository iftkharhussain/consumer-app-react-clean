/**
 * Assurance salaire — income/salary-protection funnel.
 *   public:   /questions/disability            (3 steps, real OTP-off submit)
 *   internal: /explore/getquote/disability     (logged-in, no account step)
 *
 * Migrated onto the shared <FunnelForm />: this file is now just the config
 * (previously ~1000 lines of duplicated components). Behavior is preserved —
 * same coverage quiz, insured cards (+ refusSalaire), monthly-amount suggestion,
 * and the real funnels/submit payload (product 'assurance-salaire').
 */

import React from 'react';
import { FunnelForm, customFormPostUrl } from '../../components/funnel';

const DUREE_TIP = (
  <span>
    En général, les Québécois choisissent une durée de 2 ans.
    <br /><br />
    Voici la question qu&apos;il faut se poser : en cas d&apos;invalidité, combien de temps aimeriez-vous recevoir votre assurance salaire ?
  </span>
);

const MONTANT_TIP = (
  <span>
    En général, les Québécois couvrent le maximum que l&apos;assureur autorise, c&apos;est-à-dire{' '}
    <strong>70% de votre revenu sur une base mensuelle</strong>.
  </span>
);

// Suggested monthly benefit: ~70% of annual income, on a monthly basis.
function suggestMonthlyAmount(a) {
  const annual = parseFloat(String(a.revenu ?? '').replace(/\s/g, '').replace(',', '.')) || 0;
  return Math.round((annual * 0.7) / 12);
}

// funnels/submit payload — mirrors the previous buildPayload exactly.
function buildSalairePayload({ email, phone, persons, answers, selectedPerson }) {
  const insured = (persons || []).map((p) => ({
    nom: p.nom,
    prenom: p.prenom,
    dateNaissance: p.dateNaissance,
    sexe: p.sexe,
    fumeur: p.fumeur,
    province: p.province,
    refusSalaire: p.refusSalaire,
    montant: p.montant ? Number(String(p.montant).replace(/\D/g, '')) : null,
  }));
  const event_id = `norga_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
  const fullName = [selectedPerson?.prenom, selectedPerson?.nom].filter(Boolean).join(' ').trim();
  return {
    event_id,
    product: 'assurance-salaire',
    insuranceType: 'income',
    phone,
    email,
    fullName,
    insured,
    needs: answers,
    consentChecked: true,
    verification: { channel: 'sms', verifiedAt: new Date().toISOString(), isTestNumber: false },
    submittedAt: new Date().toISOString(),
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    locale: 'fr',
  };
}

const assuranceSalaireConfig = {
  badge: 'Assurance salaire',
  title: 'Soumission instantanée',
  mobileLabel: 'Assurance salaire',

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
          key: 'situation',
          label: 'Votre situation ?',
          inputType: 'choice',
          options: [
            { value: 'autonome', label: 'Travailleur autonome' },
            { value: 'employe', label: 'Employé' },
            { value: 'proprietaire', label: "Propriétaire d'entreprise" },
          ],
        },
        {
          key: 'metier',
          label: 'Votre métier ?',
          inputType: 'text',
          placeholder: 'Ex. : infirmière, électricien, comptable…',
        },
        {
          key: 'revenu',
          label: 'Votre revenu annuel imposable ?',
          inputType: 'number',
          placeholder: 'Ex. : 65 000',
          prefix: '$',
        },
        {
          key: 'assuranceEmploi',
          label: "Avez-vous accès à l'assurance-emploi (chômage) ?",
          inputType: 'yesno',
        },
        {
          key: 'dureeSansRevenu',
          label: 'Sans revenu, combien de temps seriez-vous en mesure de subvenir à vos besoins ?',
          inputType: 'choice',
          columns: 2,
          options: [
            { value: '0-30j', label: '0 à 30 jours' },
            { value: '30-60j', label: '30 à 60 jours' },
            { value: '60-90j', label: '60 à 90 jours' },
            { value: '90j+', label: '90 jours et plus' },
          ],
        },
        {
          key: 'dureePrestations',
          label: "En cas d'invalidité, combien de temps aimeriez-vous recevoir votre assurance salaire ?",
          tip: DUREE_TIP,
          inputType: 'choice',
          columns: 2,
          options: [
            { value: '2ans', label: '2 ans' },
            { value: '5ans', label: '5 ans' },
            { value: 'retraite', label: 'Jusqu\'à ma retraite' },
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
      maxPersons: 2,
      montantLabel: "Combien veux-tu recevoir par mois en cas d'invalidité ?",
      montantTip: MONTANT_TIP,
      montantSuffix: '/mois',
      extraFields: [
        { key: 'refusSalaire', label: "Avez-vous déjà été refusé pour de l'assurance salaire ?", inputType: 'yesno' },
      ],
      reco: {
        label: 'Recommandation selon votre revenu :',
        format: (s) => `${s.toLocaleString('fr-CA')} $ / mois`,
      },
      suggestionFrom: suggestMonthlyAmount,
    },

    // ── Étape 3 — Crée ton compte Norga (real submit; public only) ──
    {
      type: 'contact',
      collectName: false,
      api: true,
      otp: false, // 2-step SMS verification off (submit directly), as before
      logLabel: 'assurance-salaire',
      buildPayload: buildSalairePayload,
      // Disability custom-form endpoint (auth key from .env) — see life/CI.
      postUrl: customFormPostUrl(process.env.REACT_APP_DISABILITY_FORM_AUTH),
    },
  ],
};

export default function AssuranceSalaire({ mode }) {
  return <FunnelForm config={assuranceSalaireConfig} mode={mode} />;
}
