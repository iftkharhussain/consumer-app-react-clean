/**
 * Achat d'une propriété — public mortgage-purchase funnel page
 * (route: /questions/mortgage-buy)
 *
 * UI/UX only — no backend wiring yet. A 3-step funnel (projet → situation →
 * compte) built entirely from a config object handed to the shared <FunnelForm/>.
 */

import React from 'react';
import { FunnelForm } from '../../components/funnel';

// "Mise de fonds" summary shows the amount + its share of the purchase price,
// e.g. "70 000 $ — 20.0% du prix de la propriété".
function formatMiseDeFonds(value, answers) {
  const mise = Number(String(value ?? '').replace(/\D/g, '')) || 0;
  const prix = Number(String(answers.prixAchat ?? '').replace(/\D/g, '')) || 0;
  const pct = prix > 0 ? ((mise / prix) * 100).toFixed(1) : '0.0';
  return `${mise.toLocaleString('fr-CA')} $ — ${pct}% du prix de la propriété`;
}

const mortgageBuyConfig = {
  badge: "Achat d'une propriété",
  title: 'Soumission instantanée',
  mobileLabel: "Achat d'une propriété",

  tabs: [
    { step: 'Étape 1', label: "Votre projet d'achat" },
    { step: 'Étape 2', label: 'Votre situation' },
    { step: 'Étape 3', label: 'Créez votre compte Norga' },
  ],
  mobLabels: ["Projet d'achat", 'Votre situation', 'Ton compte'],

  // ── Étape 1 — Votre projet d'achat ──
  step1: {
    doneMessage: "Vos renseignements sont complets. Passez à l'étape suivante.",
    quiz: [
      {
        key: 'habiter',
        label: 'Allez-vous habiter la propriété ?',
        summaryLabel: 'Habiterez-vous la propriété',
        description: "Nous ajusterons les taux en fonction de votre situation. Si vous n'habitez pas la propriété, nous la considérerons comme un immeuble locatif.",
        inputType: 'yesno',
      },
      {
        key: 'typePropriete',
        label: "De quel type de propriété s'agit-il ?",
        summaryLabel: 'Type de propriété',
        inputType: 'choice',
        columns: 2,
        options: [
          { value: 'maison-condo', label: 'Maison ou condo' },
          { value: 'residence-secondaire', label: 'Résidence secondaire ou chalet' },
          { value: 'duplex', label: 'Duplex' },
          { value: 'triplex', label: 'Triplex' },
          { value: 'quadruplex', label: 'Quadruplex' },
          { value: 'commercial', label: 'Commercial' },
        ],
      },
      {
        key: 'prixAchat',
        label: "Quel est le prix d'achat envisagé pour la propriété ?",
        summaryLabel: "Prix d'achat envisagé",
        description: "Si vous n'avez pas encore trouvé la propriété idéale, entrez simplement le prix que nous devrions viser.",
        inputType: 'number',
        placeholder: '350 000',
        suffix: '$',
      },
      {
        key: 'miseDeFonds',
        label: 'Quel est le montant de votre mise de fonds ?',
        summaryLabel: 'Mise de fonds',
        inputType: 'number',
        placeholder: '70 000',
        suffix: '$',
        formatSummary: formatMiseDeFonds,
      },
    ],
  },

  // ── Étape 2 — Votre situation ──
  step2: {
    doneMessage: "Votre situation est complète. Passez à l'étape suivante.",
    quiz: [
      {
        key: 'typeDemande',
        label: 'Faites-vous la demande seul(e) ou avec un codemandeur ?',
        summaryLabel: 'Type de demande',
        inputType: 'choice',
        options: [
          { value: 'seul', label: 'Seul(e)' },
          { value: 'codemandeur', label: 'Avec un codemandeur' },
        ],
      },
      {
        key: 'premierePropriete',
        label: "S'agit-il de votre première propriété ?",
        summaryLabel: 'Première propriété',
        inputType: 'yesno',
      },
      {
        key: 'statutRecherche',
        label: 'Avez-vous trouvé une propriété ?',
        summaryLabel: 'Statut de la recherche',
        inputType: 'choice',
        options: [
          { value: 'offre-faite', label: "J'ai fait une offre d'achat" },
          { value: 'offre-bientot', label: "Je prévois faire une offre d'achat bientôt" },
          { value: 'prequalification', label: 'Je veux une préqualification' },
          { value: 'curieux', label: 'Je suis juste curieux' },
        ],
      },
    ],
  },

  // ── Étape 3 — Créez votre compte Norga (account screen, UI only) ──
  contact: { collectName: true },
};

export default function MortgageBuy() {
  return <FunnelForm config={mortgageBuyConfig} />;
}
