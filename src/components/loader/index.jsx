import React from "react";

function Loader(){
  return(
    <div className="ipl-progress-indicator" id="ipl-progress-indicator">
      <div className="ipl-progress-indicator-head">
        <div className="first-indicator" />
        <div className="second-indicator" />
      </div>
      <div className="insp-logo-frame">
        <div style={{
          width: 40,
          height: 40,
          border: '3px solid #e5e7eb',
          borderTop: '3px solid #3b82f6',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
          alignSelf: 'center'
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  )
}

export default Loader