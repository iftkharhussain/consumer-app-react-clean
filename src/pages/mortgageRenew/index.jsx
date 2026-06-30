/**
 * Renouvellement hypothécaire — public mortgage-renewal funnel page
 * (route: /questions/mortgage-renew)
 *
 * UI/UX only — no backend wiring yet. This page is just a config object handed
 * to the shared <FunnelForm />; all fields/steps come from the reusable funnel
 * components in src/components/funnel, so nothing is redeclared per product.
 */

import React from 'react';
import { FunnelForm } from '../../components/funnel';

const mortgageRenewConfig = {
  badge: 'Renouvellement hypothécaire',
  title: 'Soumission instantanée',
  mobileLabel: 'Renouvellement hypothécaire',

  tabs: [
    { step: 'Étape 1', label: 'Vos renseignements actuels' },
    { step: 'Étape 2', label: 'Vos préférences' },
    { step: 'Étape 3', label: 'Créez votre compte Norga' },
  ],
  mobLabels: ['Renseignements', 'Préférences', 'Ton compte'],

  // ── Étape 1 — Vos renseignements actuels ──
  step1: {
    doneMessage: "Vos renseignements sont complets. Passez à l'étape suivante.",
    quiz: [
      {
        key: 'habiter',
        label: 'Allez-vous habiter la propriété suite au renouvellement ?',
        summaryLabel: 'Propriété habitée après renouvellement',
        inputType: 'yesno',
      },
      {
        key: 'valeurPropriete',
        label: 'Quelle est la valeur de votre propriété actuelle ?',
        summaryLabel: 'Valeur estimée de la propriété',
        description: 'À combien estimeriez-vous votre propriété si vous deviez la vendre demain ?',
        inputType: 'number',
        placeholder: '350 000',
        suffix: '$',
      },
      {
        key: 'soldeHypotheque',
        label: 'Quel est le solde de votre hypothèque ?',
        summaryLabel: 'Solde hypothécaire actuel',
        description: 'Un courtier hypothécaire fera le calcul pour vous présenter les options les plus avantageuses.',
        inputType: 'number',
        placeholder: '250 000',
        suffix: '$',
      },
      {
        key: 'dateRenouvellement',
        label: 'Quand renouvelez-vous votre hypothèque ?',
        summaryLabel: 'Date de renouvellement',
        inputType: 'monthYear',
      },
      {
        key: 'optionInteret',
        label: 'Laquelle de ces options vous intéresse ?',
        summaryLabel: 'Option souhaitée',
        inputType: 'choice',
        options: [
          { value: 'renegocier', label: 'Renégocier mon taux avant échéance' },
          { value: 'refinancer', label: 'Refinancer pour obtenir des liquidités' },
          { value: 'aucune', label: 'Aucune de ces options' },
        ],
      },
    ],
  },

  // ── Étape 2 — Vos préférences ──
  step2: {
    type: 'preferences',
    title: 'Vos préférences de renouvellement',
    subtitle: 'Ces valeurs sont pré-sélectionnées — modifiez-les au besoin.',
    fields: [
      {
        key: 'typeTaux',
        label: 'Quel type de taux recherchez-vous ?',
        default: 'fixe',
        options: [
          { value: 'fixe', label: 'Fixe' },
          { value: 'variable', label: 'Variable' },
        ],
      },
      {
        key: 'duree',
        label: 'Quelle durée vous intéresse ?',
        default: '5ans',
        options: [
          { value: '5ans', label: '5 ans' },
          { value: '3ans', label: '3 ans' },
        ],
      },
    ],
  },

  // ── Étape 3 — Créez votre compte Norga (account screen, UI only) ──
  // mortgage-renew has no person cards, so the name is collected here.
  contact: { collectName: true },
};

export default function MortgageRenew() {
  return <FunnelForm config={mortgageRenewConfig} />;
}
