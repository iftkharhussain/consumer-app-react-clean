/**
 * QuestionsPage — the public funnel shell (route: /questions/:slug).
 *
 * Every public /questions/* page shares the same chrome: the Norga Header on
 * top, the Footer at the bottom, and the product's funnel form sandwiched in
 * between (see PublicLayout). This file is the single place that maps a route
 * slug to its product label + form, so wiring a new funnel is a one-line add.
 *
 *   /questions/life-insurance     -> Assurance vie
 *   /questions/critical-illness   -> Assurance maladie grave
 *   /questions/disability         -> Assurance salaire
 *   /questions/mortgage-renew     -> Renouvellement hypothécaire
 *   /questions/mortgage-refinance -> Refinancement hypothécaire
 *   /questions/mortgage-buy       -> Achat d'une propriété
 *   /questions/mortgage-consolidate -> Consolidation de dette
 *   /questions/external-general   -> Assurance hypothécaire (generic template)
 *
 * An unknown slug renders the empty shell (Header + Footer only).
 */

import React, { Suspense } from 'react';
import { useParams } from 'react-router-dom';
import PublicLayout from '../../components/publicLayout/PublicLayout';

// Funnel forms are code-split so each page only loads its own form.
const AssuranceVie = React.lazy(() => import('../assuranceVie/index'));
const AssuranceMaladieGrave = React.lazy(() => import('../assuranceMaladieGrave/index'));
const AssuranceSalaire = React.lazy(() => import('../assuranceSalaire/index'));
const MortgageRenew = React.lazy(() => import('../mortgageRenew/index'));
const MortgageRefinance = React.lazy(() => import('../mortgageRefinance/index'));
const MortgageBuy = React.lazy(() => import('../mortgageBuy/index'));
const MortgageConsolidate = React.lazy(() => import('../mortgageConsolidate/index'));
const ExternalGeneral = React.lazy(() => import('../externalGeneral/index'));
const MortgageInsurance = React.lazy(() => import('../mortgageInsurance/index'));

// slug -> { label (header pill), Form (funnel form, or null for an empty shell) }
const QUESTIONS = {
  'life-insurance': { label: 'Assurance vie', Form: AssuranceVie },
  'critical-illness': { label: 'Assurance maladie grave', Form: AssuranceMaladieGrave },
  'disability': { label: 'Assurance salaire', Form: AssuranceSalaire },
  'mortgage-renew': { label: 'Renouvellement hypothécaire', Form: MortgageRenew },
  'mortgage-refinance': { label: 'Refinancement hypothécaire', Form: MortgageRefinance },
  'mortgage-buy': { label: "Achat d'une propriété", Form: MortgageBuy },
  'mortgage-consolidate': { label: 'Consolidation de dette', Form: MortgageConsolidate },
  'external-general': { label: 'Assurance hypothécaire', Form: ExternalGeneral },
  'mortgage-insurance': { label: 'Assurance hypothécaire', Form: MortgageInsurance },
};

export default function QuestionsPage() {
  const { slug } = useParams();
  const product = QUESTIONS[slug];
  const Form = product?.Form;

  return (
    <PublicLayout productLabel={product?.label}>
      {Form ? (
        <Suspense fallback={<div style={{ minHeight: '60vh' }} />}>
          <Form />
        </Suspense>
      ) : (
        // Empty shell — the funnel form for this slug gets integrated here.
        <div style={{ minHeight: '60vh' }} />
      )}
    </PublicLayout>
  );
}
