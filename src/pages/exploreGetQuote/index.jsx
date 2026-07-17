/**
 * ExploreGetQuote — the internal "quick quote" funnel (route: /explore/getquote/:slug).
 *
 * Reached from the "Get Quote" buttons on the Explore page. Unlike the public
 * /questions/* funnels, this renders the form in `internal` mode — a shorter,
 * already-signed-in variant (e.g. life insurance skips the coverage quiz) with
 * no public marketing Header/Footer.
 *
 * Wiring a product is a one-line add to FORMS below. Forms are passed
 * mode="internal"; a form that doesn't yet support it simply ignores the prop.
 */

import React, { Suspense } from 'react';
import { useParams } from 'react-router-dom';

const AssuranceVie = React.lazy(() => import('../assuranceVie/index'));
const AssuranceMaladieGrave = React.lazy(() => import('../assuranceMaladieGrave/index'));
const AssuranceSalaire = React.lazy(() => import('../assuranceSalaire/index'));
const MortgageInsurance = React.lazy(() => import('../mortgageInsurance/index'));
// Mortgage-broker forms reused internally: mode="internal" drops the contact
// (name/email/phone) step since the user is already logged in.
const MortgageRenew = React.lazy(() => import('../mortgageRenew/index'));
const MortgageRefinance = React.lazy(() => import('../mortgageRefinance/index'));
const MortgageBuy = React.lazy(() => import('../mortgageBuy/index'));
const MortgageConsolidate = React.lazy(() => import('../mortgageConsolidate/index'));
// Ported auto-insurance funnel — self-contained module in src/**/carFunnel.
const CarInsuranceFunnel = React.lazy(() => import('../../components/carFunnel/CarInsuranceFunnel'));

// slug -> internal funnel form. Add the other products here as they're built.
// Forms are rendered with mode="internal"; a form that doesn't support the prop
// (e.g. AssuranceMaladieGrave) simply ignores it and renders its full flow —
// i.e. the internal critical-illness form is the same as the external one.
const FORMS = {
  'life-insurance': AssuranceVie,
  'critical-illness': AssuranceMaladieGrave,
  'disability': AssuranceSalaire,
  'mortgage-insurance': MortgageInsurance,
  'mortgage-renew': MortgageRenew,
  'mortgage-refinance': MortgageRefinance,
  'mortgage-buy': MortgageBuy,
  'mortgage-consolidate': MortgageConsolidate,
  'car-insurance': CarInsuranceFunnel,
};

export default function ExploreGetQuote() {
  const { slug } = useParams();
  const Form = FORMS[slug];

  if (!Form) {
    return (
      <div style={{ padding: 40, color: '#697586', fontSize: 14 }}>
        Ce formulaire n&apos;est pas encore disponible.
      </div>
    );
  }

  return (
    <Suspense fallback={<div style={{ minHeight: '60vh' }} />}>
      <Form mode="internal" />
    </Suspense>
  );
}
