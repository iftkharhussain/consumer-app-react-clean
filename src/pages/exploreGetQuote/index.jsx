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

// slug -> internal funnel form. Add the other products here as they're built.
const FORMS = {
  'life-insurance': AssuranceVie,
  // 'critical-illness': AssuranceMaladieGrave,
  // 'disability': AssuranceSalaire,
  // 'mortgage-insurance': ...,
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
