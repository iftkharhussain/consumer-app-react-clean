/* eslint-disable */
import React, { useEffect } from 'react';
import { Provider, useSelector } from 'react-redux';
import { store } from 'store/carFunnel';
import CarApp from './CarApp';

// Car-funnel global styles. Every selector in these files is scoped under
// `.car-funnel`, so they cannot leak into the rest of the app.
import 'styles/carFunnel/root.css';
import 'styles/carFunnel/index.css';
import 'styles/carFunnel/responsive.css';
import arrowDownUrl from 'styles/carFunnel/assets/arrow-down.svg';

/**
 * CarInsuranceFunnel — the isolation wrapper that mounts the ported
 * auto-insurance funnel inside this app.
 *
 *  - Provides its OWN Redux store (`store/carFunnel`) via a nested <Provider>,
 *    so it never touches the app's store.
 *  - `CarApp` supplies its own antd <ConfigProvider>/theme (scoped to children).
 *  - Everything renders inside `<div className="car-funnel">`, which scopes all
 *    car CSS away from the rest of the app.
 *
 * `mode` ("internal" | "public") is forwarded to CarApp (internal will later
 * skip the account/verification screens).
 */
export default function CarInsuranceFunnel({ mode }) {
  // Read from the APP store (this component is above the nested car-funnel Provider),
  // so the funnel can submit the lead against the logged-in account.
  const up = useSelector((s) => s.app?.user_profile) || {};
  const initialContact = {
    fullName: [up.firstName, up.lastName].filter(Boolean).join(' ').trim() || up.fullName || '',
    email: up.email || '',
    phone: up.phone || '',
  };

  useEffect(() => {
    // Custom antd select-arrow image, scoped to the car funnel only.
    const style = document.createElement('style');
    style.setAttribute('data-car-funnel', '');
    style.textContent = `.car-funnel .ant-select-arrow::after{background-image:url('${arrowDownUrl}') !important;}`;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

  return (
    <Provider store={store}>
      <div className="car-funnel">
        <CarApp mode={mode} initialContact={initialContact} />
      </div>
    </Provider>
  );
}
