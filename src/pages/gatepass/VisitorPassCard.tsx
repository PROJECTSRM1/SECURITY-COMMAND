
import React from "react";
// import "./GateVisitorPass.css";  

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

const VisitorPassCard: React.FC<EntryProps> = ({ entry, qrDataUrl }) => (
  <div className="rjb-visitorpass-card">
    <div className="rjb-visitorpass-photo">
      {entry.photoDataUrl ? (
        <img src={entry.photoDataUrl} alt="Profile" />
      ) : (
        <div className="rjb-visitorpass-avatar" />
      )}
    </div>
    <div className="rjb-visitorpass-name">{entry.fullName}</div>
    <div className="rjb-visitorpass-id">{entry.idProof}</div>
    <div className="rjb-visitorpass-qr">
      <img src={qrDataUrl} alt="QR" />
    </div>
    <div className="rjb-visitorpass-verified">✔ Verified by AI</div>
    <div className="rjb-visitorpass-entry">
      Gate Entry: {entry.entry}
    </div>
  </div>
);

export default VisitorPassCard;
