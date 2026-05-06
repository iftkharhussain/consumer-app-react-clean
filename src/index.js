import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { Provider } from 'react-redux';
import toast, { Toaster } from 'react-hot-toast'
import configureStore from './store/configureStore';
import reportWebVitals from './reportWebVitals';
import { Button, ConfigProvider, Space } from 'antd';
// import { ApolloProvider, ApolloClient, InMemoryCache } from "@apollo/client";
import i18n from './i18n';
import { ErrorBoundary, Loader, ScreenResolutionAlert } from './components/index'
import { I18nextProvider } from 'react-i18next';

const root = ReactDOM.createRoot(document.getElementById('root'));
const store = configureStore();

// detect networkStatus
window.addEventListener('online', function(e) { toast('Internet Connected', { icon: '✔️' }) });
window.addEventListener('offline', function(e) { toast(`You're not connected to internet`, { icon: '❌' }) })


root.render(
  <React.StrictMode>
    <Provider store={store}>
      <ErrorBoundary>
        <Suspense fallback={<Loader />}>
          <Toaster position="bottom-right" toastOptions={ {style: { borderRadius: '3px' }}} reverseOrder={false} />
          <I18nextProvider i18n={i18n}>
            {/* <ScreenResolutionAlert /> */}
            <App />
          </I18nextProvider>
        </Suspense>
      </ErrorBoundary>
    </Provider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
