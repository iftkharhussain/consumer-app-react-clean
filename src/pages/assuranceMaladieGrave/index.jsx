/**
 * Assurance maladie grave — critical-illness funnel.
 *   public:   /questions/critical-illness            (3 steps, real submit)
 *   internal: /explore/getquote/critical-illness      (logged-in, no account step)
 *
 * Migrated onto the shared <FunnelForm />: this file is now just the config
 * (previously ~1000 lines of duplicated components). Behavior is preserved —
 * incl. the "already diagnosed" disqualifier, the 100 000 $ default coverage,
 * and the real funnels/submit payload (product 'assurance-maladie-grave').
 */

import React from 'react';
import { FunnelForm } from '../../components/funnel';

const PROTECTION_TIP = (
  <span>
    En général, les Québécois choisissent les 4 maladies graves principales (cancer, crise cardiaque,
    AVC, pontage coronarien) puisqu&apos;elles représentent plus de 70% des réclamations.
  </span>
);

const MONTANT_TIP = (
  <span>
    La plupart des gens choisissent <strong>100 000 $</strong> de protection. Vous pouvez toujours
    ajuster ce montant plus tard lors de votre rencontre avec un conseiller.
  </span>
);

const BLOCKED_TEXT =
  "Malheureusement, il n'est pas possible d'obtenir une soumission d'assurance maladie grave si vous " +
  'avez reçu un diagnostic de maladie grave dans les 2 dernières années. Nous vous invitons à ' +
  'consulter un conseiller pour explorer vos options.';

// funnels/submit payload — mirrors the previous buildPayload exactly.
function buildMaladieGravePayload({ email, phone, persons, answers, selectedPerson }) {
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
  const fullName = [selectedPerson?.prenom, selectedPerson?.nom].filter(Boolean).join(' ').trim();
  return {
    event_id,
    product: 'assurance-maladie-grave',
    insuranceType: 'critical-illness',
    phone,
    email,
    fullName,
    // Flat coverage amount at root — the LMS custom-form mapper drops nested
    // arrays (insured[]), so the result page reads the coverage from here.
    desiredCoverageAmount: selectedPerson?.montant ? Number(String(selectedPerson.montant).replace(/\D/g, '')) : null,
    insured,
    needs: answers,
    consentChecked: true,
    verification: { channel: 'sms', verifiedAt: new Date().toISOString(), isTestNumber: false },
    submittedAt: new Date().toISOString(),
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    locale: 'fr',
  };
}

const assuranceMaladieGraveConfig = {
  badge: 'Assurance maladie grave',
  title: 'Soumission instantanée',
  mobileLabel: 'Assurance maladie grave',

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
      // A recent diagnosis disqualifies the quote.
      blockIf: (a) => a.diagnosed === 'oui',
      blockedTitle: 'Soumission non disponible',
      blockedText: BLOCKED_TEXT,
      quiz: [
        {
          key: 'diagnosed',
          label: "Avez-vous été diagnostiqué d'une maladie grave dans les 2 dernières années ?",
          inputType: 'pill',
          options: [
            { value: 'non', label: 'Non' },
            { value: 'oui', label: 'Oui' },
          ],
        },
        {
          key: 'protection',
          label: 'Quelle protection aimeriez-vous ?',
          tip: PROTECTION_TIP,
          showIf: (a) => a.diagnosed === 'non',
          inputType: 'choice',
          options: [
            { value: '4-maladies', label: 'Les 4 maladies principales' },
            { value: '25-maladies', label: 'Les 25 maladies graves' },
            { value: 'conseiller', label: "J'aimerais voir avec un conseiller" },
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
      montantLabel: 'Choisissez le montant de la protection',
      montantTip: MONTANT_TIP,
      defaultMontant: '100000',
    },

    // ── Étape 3 — Crée ton compte Norga (real submit; public only) ──
    {
      type: 'contact',
      collectName: false,
      api: true,
      otp: false, // 2-step SMS verification off (submit directly), as before
      logLabel: 'assurance-maladie-grave',
      buildPayload: buildMaladieGravePayload,
    },
  ],
};

export default function AssuranceMaladieGrave({ mode }) {
  return <FunnelForm config={assuranceMaladieGraveConfig} mode={mode} />;
}
