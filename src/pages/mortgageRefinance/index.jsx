/**
 * Refinancement hypothécaire — public mortgage-refinance funnel page
 * (route: /questions/mortgage-refinance)
 *
 * UI/UX only — no backend wiring yet. A 2-step funnel (renseignements → compte):
 * it reuses the shared <FunnelForm /> and simply omits `step2`, so the shell
 * renders a 2-step flow. Nothing is redeclared per product.
 */

import React from 'react';
import { FunnelForm } from '../../components/funnel';

const mortgageRefinanceConfig = {
  badge: 'Refinancement hypothécaire',
  title: 'Soumission instantanée',
  mobileLabel: 'Refinancement hypothécaire',

  tabs: [
    { step: 'Étape 1', label: 'Vos renseignements' },
    { step: 'Étape 2', label: 'Créez votre compte Norga' },
  ],
  mobLabels: ['Renseignements', 'Ton compte'],

  // ── Étape 1 — Vos renseignements ──
  step1: {
    quiz: [
      {
        key: 'habiter',
        label: 'Allez-vous habiter la propriété suite au refinancement ?',
        summaryLabel: 'Propriété habitée après refinancement',
        inputType: 'yesno',
      },
      {
        key: 'raison',
        label: 'Quelle est la principale raison de votre refinancement ?',
        summaryLabel: 'Raison(s) du refinancement',
        inputType: 'multiselect',
        columns: 2,
        options: [
          { value: 'consolidation', label: 'Consolidation de dettes' },
          { value: 'renovation', label: 'Travaux de rénovation' },
          { value: 'residence-secondaire', label: "Achat d'une résidence secondaire" },
          { value: 'refinancement', label: 'Refinancement hypothécaire' },
          { value: 'projet-personnel', label: 'Projet personnel' },
          { value: 'autre', label: 'Autre' },
        ],
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
        description: 'Un solde hypothécaire plus bas peut vous donner accès à de meilleurs taux. Nous faisons le calcul pour vous présenter les options les plus avantageuses.',
        inputType: 'number',
        placeholder: '250 000',
        suffix: '$',
      },
      {
        key: 'fondsSupplementaires',
        label: 'Combien de fonds supplémentaires aimeriez-vous retirer ?',
        summaryLabel: 'Fonds supplémentaires',
        description: 'Optionnelle',
        inputType: 'number',
        placeholder: '50 000',
        suffix: '$',
        optional: true,
      },
    ],
  },

  // No step2 → the shell renders a 2-step funnel (Étape 2 is the account step).

  // ── Étape 2 — Créez votre compte Norga (account screen, UI only) ──
  contact: { collectName: true },
};

export default function MortgageRefinance({ mode }) {
  return <FunnelForm config={mortgageRefinanceConfig} mode={mode} />;
}
