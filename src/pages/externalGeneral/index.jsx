/**
 * External general — a generic 3-step external funnel template
 * (route: /questions/external-general)
 *
 * UI/UX only — no backend wiring yet. Demonstrates the full shared step set:
 *   Étape 1 — coverage quiz   (CoverageStep)
 *   Étape 2 — borrowers/insured cards (PersonsStep)
 *   Étape 3 — account screen  (ContactTab)
 *
 * Driven by a `steps` array handed to the shared <FunnelForm />.
 */

import React from 'react';
import { FunnelForm } from '../../components/funnel';

const externalGeneralConfig = {
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
    // ── Étape 1 — De quelle couverture avez-vous besoin ? (placeholder quiz) ──
    {
      type: 'quiz',
      doneMessage: "Vos besoins sont bien définis. Passez à l'étape suivante.",
      quiz: [
        {
          key: 'typeCouverture',
          label: 'De quel type de couverture avez-vous besoin ?',
          summaryLabel: 'Type de couverture',
          inputType: 'choice',
          columns: 2,
          options: [
            { value: 'hypothecaire', label: 'Assurance hypothécaire' },
            { value: 'vie', label: 'Assurance vie' },
            { value: 'invalidite', label: 'Assurance invalidité' },
            { value: 'maladie-grave', label: 'Assurance maladie grave' },
          ],
        },
      ],
    },

    // ── Étape 2 — Pour qui est la soumission ? (borrower cards) ──
    {
      type: 'persons',
      personLabel: 'Emprunteur',
      addLabel: 'Ajouter un emprunteur',
      maxPersons: 2,
      montantLabel: "Montant d'assurance souhaité",
    },

    // ── Étape 3 — Crée ton compte Norga (account screen, UI only) ──
    {
      type: 'contact',
      collectName: true,
    },
  ],
};

export default function ExternalGeneral() {
  return <FunnelForm config={externalGeneralConfig} />;
}
