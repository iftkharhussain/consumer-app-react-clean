import React, { useState } from 'react';


function ErrorBoundary({ children }) {
  const [error, setError] = useState(null);
  const [errorInfo, setErrorInfo] = useState(null);

  const componentDidCatch = (error, errorInfo) => {
    // Catch errors and update the state with error message
    setError(error);
    setErrorInfo(errorInfo);
    // You can also log error messages to an error reporting service here
  };

  if (errorInfo) {
    // Error path
    return (
      <div>
        <div className="container" style={{ padding: '50px 0' }}>
          <div className="row">
            <div className="col-md-8 col-md-offset-2">
              <h2>Something went wrong.</h2>
              <details style={{ whiteSpace: 'pre-wrap' }}>
                {error && error.toString()}
                <br />
                {errorInfo.componentStack}
              </details>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Normally, just render children
  return children;
}

export default ErrorBoundary;