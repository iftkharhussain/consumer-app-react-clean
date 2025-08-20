import React from "react";

function Loader(){
  return(
    <div className="ipl-progress-indicator" id="ipl-progress-indicator">
      <div className="ipl-progress-indicator-head">
        <div className="first-indicator" />
        <div className="second-indicator" />
      </div>
      <div className="insp-logo-frame" style={{textAlign: 'center'}}>
        <img style={{maxWidth: 200, display: 'inline-block'}} src="/images/norga_logo_noir-resized.svg" alt="site logo" />
      </div>
    </div>
  )
}

export default Loader