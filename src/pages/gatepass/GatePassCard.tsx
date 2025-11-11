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
 <div className="gatepass-card">
     <div className="gatepass-header-row">
<img className="gatepass-logo" src={ayodhyaLogo} alt="Logo" />
  <div className="gatepass-titles">
    <div className="gatepass-title-hindi">श्री राम जन्मभूमि तीर्थ क्षेत्र</div>
    <div className="gatepass-title-en">SHRI RAM JANMBHOOMI TEERTH KSHETRA</div>
    <div className="gatepass-title-sub">PRAN PRATISHTHA</div>
  </div>
</div>



         <div className="gatepass-banner">प्रवेश पास / ENTRY PASS</div>

     <div className="gatepass-details-row">
   <div className="gatepass-details-main">
    <div className="gatepass-photo">
     {entry.photoDataUrl ? (
        <img src={entry.photoDataUrl} alt="Profile" />
      ) : (
        <div className="gatepass-avatar" />
      )}
    </div>
<table className="gatepass-fields-table">
  <tbody>
    <tr>
      <td className="lbl">Name</td>
      <td className="value">{entry.fullName}</td>
    </tr>
    <tr>
      <td className="lbl">Mobile</td>
      <td className="value">{entry.mobile}</td>
    </tr>
    <tr>
      <td className="lbl">ID Proof</td>
      <td className="value">{entry.idProof}</td>
    </tr>
    <tr>
      <td className="lbl">Category</td>
      <td className="value">{entry.purpose}</td>
    </tr>
    <tr>
      <td className="lbl">Access</td>
      <td className="value">{entry.accessArea}</td>
    </tr>
  </tbody>
</table>



  </div>
  <div className="gatepass-qrwrap">
    <img src={qrDataUrl} alt="QR" />
  </div>
</div>

//   </div>
);

export default GatePassCard;
