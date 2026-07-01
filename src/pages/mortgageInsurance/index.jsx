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
import { FunnelForm } from '../../components/funnel';

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
      maxPersons: 2,
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
};

export default function MortgageInsurance({ mode }) {
  return <FunnelForm config={mortgageInsuranceConfig} mode={mode} />;
}
