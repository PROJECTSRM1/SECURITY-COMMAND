
import React from "react";
import "./GateVisitorPass.css";

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
  <div className="visitorpass-card">
    <div className="visitorpass-photo">
      {entry.photoDataUrl ? (
        <img src={entry.photoDataUrl} alt="Profile" />
      ) : (
        <div className="visitorpass-avatar" />
      )}
    </div>
    <div className="visitorpass-name">{entry.fullName}</div>
    <div className="visitorpass-id">{entry.idProof}</div>
    <div className="visitorpass-qr">
      <img src={qrDataUrl} alt="QR" />
    </div>
    <div className="visitorpass-verified">✔ Verified by AI</div>
    <div className="visitorpass-entry">
      Gate Entry: {entry.entry}
    </div>
  </div>
);

export default VisitorPassCard;
