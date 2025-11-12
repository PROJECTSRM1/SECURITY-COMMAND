import React from "react";
import "./GateVisitorPass.css";
import ayodhyaLogo from "../../assets/ayodhya-logo.png"; 

type EntryProps = {
  entry: {
    fullName: string;
    idProof: string;
    mobile: string;
    purpose: string;
    accessArea: string;
    entry: string;
    photoDataUrl?: string | null;
  };
  qrDataUrl: string;
};

const GatePassCard: React.FC<EntryProps> = ({ entry, qrDataUrl }) => (
 <div className="rjb-gatepass-card">
     <div className="rjb-gatepass-header-row">
<img className="rjb-gatepass-logo" src={ayodhyaLogo} alt="Logo" />
  <div className="rjb-gatepass-titles">
    <div className="rjb-gatepass-title-hindi">श्री राम जन्मभूमि तीर्थ क्षेत्र</div>
    <div className="rjb-gatepass-title-en">SHRI RAM JANMBHOOMI TEERTH KSHETRA</div>
    <div className="rjb-gatepass-title-sub">PRAN PRATISHTHA</div>
  </div>
</div>
         <div className="rjb-gatepass-banner">प्रवेश पास / ENTRY PASS</div>

     <div className="rjb-gatepass-details-row">
   <div className="rjb-gatepass-details-main">
    <div className="rjb-gatepass-photo">
     {entry.photoDataUrl ? (
        <img src={entry.photoDataUrl} alt="Profile" />
      ) : (
        <div className="rjb-gatepass-avatar" />
      )}
    </div>
<table className="rjb-gatepass-fields-table">
  <tbody>
    <tr>
      <td className="rjb-lbl">Name</td>
      <td className="rjb-value">{entry.fullName}</td>
    </tr>
    <tr>
      <td className="rjb-lbl">Mobile</td>
      <td className="rjb-value">{entry.mobile}</td>
    </tr>
    <tr>
      <td className="rjb-lbl">ID Proof</td>
      <td className="rjb-value">{entry.idProof}</td>
    </tr>
    <tr>
      <td className="rjb-lbl">Category</td>
      <td className="rjb-value">{entry.purpose}</td>
    </tr>
    <tr>
      <td className="rjb-lbl">Access</td>
      <td className="rjb-value">{entry.accessArea}</td>
    </tr>
  </tbody>
</table>



  </div>
  <div className="rjb-gatepass-qrwrap">
    <img src={qrDataUrl} alt="QR" />
  </div>
</div>

 </div>
);

export default GatePassCard;
