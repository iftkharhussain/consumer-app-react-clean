/**
 * Consolidation de dette — public debt-consolidation funnel page
 * (route: /questions/mortgage-consolidate)
 *
 * UI/UX only — no backend wiring yet. A 2-step funnel (renseignements → compte):
 * it reuses the shared <FunnelForm /> and omits `step2`, so the shell renders a
 * 2-step flow. Nothing is redeclared per product.
 */

import React from 'react';
import { FunnelForm } from '../../components/funnel';

const mortgageConsolidateConfig = {
  badge: 'Consolidation de dette',
  title: 'Soumission instantanée',
  mobileLabel: 'Consolidation de dette',

  tabs: [
    { step: 'Étape 1', label: 'Vos renseignements' },
    { step: 'Étape 2', label: 'Créez votre compte Norga' },
  ],
  mobLabels: ['Renseignements', 'Ton compte'],

  // ── Étape 1 — Vos renseignements ──
  step1: {
    doneMessage: "Vos renseignements sont complets. Passez à l'étape suivante.",
    quiz: [
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
    ],
  },

  // No step2 → the shell renders a 2-step funnel (Étape 2 is the account step).

  // ── Étape 2 — Créez votre compte Norga (account screen, UI only) ──
  contact: { collectName: true },
};

export default function MortgageConsolidate() {
  return <FunnelForm config={mortgageConsolidateConfig} />;
}
