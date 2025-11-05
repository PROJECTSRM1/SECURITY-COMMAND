import React, { useRef, useState } from "react";
import * as QRCode from "qrcode";
import "./GatePass.css";



type FormState = {
  fullName: string;
  idProof: string;
  mobile: string;          
  purpose: string;
  accessArea: string;
  entry: string;           
  validTill: string;       
  photoDataUrl?: string | null;
};

export default function GatePassApp(): JSX.Element {
  // Start with EMPTY fields
  const [form, setForm] = useState<FormState>({
    fullName: "",
    idProof: "",
    mobile: "",
    purpose: "",
    accessArea: "",
    entry: "",
    validTill: "",
    photoDataUrl: null,
  });

  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [showQrModal, setShowQrModal] = useState<boolean>(false);
  const [qrLoading, setQrLoading] = useState<boolean>(false);
  const cardRef = useRef<HTMLDivElement | null>(null);

  // --- helpers ---
  function escapeHtml(str: string) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function prettyDateTime(iso: string) {
    if (!iso) return "";
    const dt = new Date(iso);
    if (isNaN(dt.getTime())) return "";
    const dd = String(dt.getDate()).padStart(2, "0");
    const mm = String(dt.getMonth() + 1).padStart(2, "0");
    const yyyy = dt.getFullYear();
    let h = dt.getHours();
    const m = String(dt.getMinutes()).padStart(2, "0");
    const am = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    return `${dd}-${mm}-${yyyy} ${String(h).padStart(2, "0")}:${m} ${am}`;
  }

  const isFormValid: boolean = Boolean(
    form.fullName.trim() &&
      form.idProof.trim() &&
      form.mobile.trim() &&
      form.purpose &&
      form.accessArea &&
      form.entry &&
      form.validTill &&
      new Date(form.validTill) > new Date(form.entry)
  );

  // --- QR HTML (links to public/qr-card.css) ---
  function buildDataHtml(data: FormState): string {
    const photoHtml = data.photoDataUrl
      ? `<div class="photo-wrapper"><img class="photo" src="${data.photoDataUrl}" alt="photo"></div>`
      : "";

    const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Gate Pass - ${escapeHtml(data.fullName)}</title>
<link rel="stylesheet" href="qr-card.css">
</head>
<body>
  <div class="card">
    ${photoHtml}
    <h2 class="title">${escapeHtml(data.fullName)}</h2>
    <div class="sub">${escapeHtml(data.idProof)}</div>
    <div class="row"><div class="label">Mobile</div><div>${escapeHtml(data.mobile)}</div></div>
    <div class="row"><div class="label">Purpose</div><div>${escapeHtml(data.purpose)}</div></div>
    <div class="row"><div class="label">Access</div><div>${escapeHtml(data.accessArea)}</div></div>
    <div class="row"><div class="label">Entry</div><div>${escapeHtml(prettyDateTime(data.entry))}</div></div>
    <div class="row"><div class="label">Valid Till</div><div>${escapeHtml(prettyDateTime(data.validTill))}</div></div>
    <div class="verified">Verified by AI</div>
  </div>
</body>
</html>`;

    return `data:text/html;base64,${btoa(unescape(encodeURIComponent(html)))}`;
  }

  // --- actions ---
  async function generateQRCode(): Promise<void> {
    if (!isFormValid) return;
    setQrLoading(true);
    try {
      const dataHtml = buildDataHtml(form);
      const url = await QRCode.toDataURL(dataHtml, {
        errorCorrectionLevel: "L",
        type: "image/png",
        margin: 1,
        scale: 6,
      });
      setQrDataUrl(url);
      setShowQrModal(true);
    } catch (err) {
      console.error("QR generation error:", err);
      alert("Failed to generate QR. See console for details.");
    } finally {
      setQrLoading(false);
    }
  }

  async function downloadPdf(): Promise<void> {
    const html2canvas = (await import("html2canvas")).default;
    const jsPDF = (await import("jspdf")).default;
    const el = cardRef.current;
    if (!el) return;
    const canvas = await html2canvas(el, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ unit: "px", format: [canvas.width, canvas.height] });
    pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
    pdf.save(`${(form.fullName || "gatepass").replace(/\s+/g, "_")}.pdf`);
  }

  function onChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  }

  function onPhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm((p) => ({ ...p, photoDataUrl: reader.result as string }));
    reader.readAsDataURL(file);
  }

  function createHtmlFileAndShare(): void {
    const html = decodeURIComponent(escape(atob(buildDataHtml(form).split(",")[1])));
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
    navigator.clipboard?.writeText(url).catch(() => {});
    alert("Gate pass HTML opened in a new tab and link copied to clipboard (blob URL, only works on this device).");
  }

  return (
    <div className="gp-app">
      <div className="gp-container">
        <div className="gp-form-card">
          <h3 className="gp-heading">Gate Pass Details</h3>

          <label className="gp-label">Upload Photo (optional)</label>
          <input type="file" accept="image/*" onChange={onPhotoChange} className="gp-input" />

          <label className="gp-label">Full Name</label>
          <input
            className="gp-input"
            name="fullName"
            placeholder="Enter full name"
            value={form.fullName}
            onChange={onChange}
          />

          <label className="gp-label">ID Proof Number</label>
          <input
            className="gp-input"
            name="idProof"
            placeholder="SRJBTK-AYD-2025-000124"
            value={form.idProof}
            onChange={onChange}
          />

          <label className="gp-label">Mobile Number</label>
          <input
            className="gp-input"
            name="mobile"
            placeholder="9XXXXXXXXX"
            value={form.mobile}
            onChange={onChange}
          />

          <div className="gp-form-row">
            <div className="gp-col">
              <label className="gp-label">Purpose of Visit</label>
              <select
                className="gp-select"
                name="purpose"
                value={form.purpose}
                onChange={onChange}
              >
                <option value="">Select purpose</option>
                <option>Devotee</option>
                <option>Employee</option>
                <option>Visitor</option>
              </select>
            </div>

            <div className="gp-col">
              <label className="gp-label">Access Area</label>
              <select
                className="gp-select"
                name="accessArea"
                value={form.accessArea}
                onChange={onChange}
              >
                <option value="">Select access</option>
                <option>Inner Sanctum</option>
                <option>Outer Hall</option>
                <option>Garden</option>
              </select>
            </div>
          </div>

          <div className="gp-form-row">
            <div className="gp-col">
              <label className="gp-label">Date &amp; Time</label>
              <input
                type="datetime-local"
                className="gp-input"
                name="entry"
                value={form.entry}
                onChange={onChange}
              />
            </div>

            <div className="gp-col">
              <label className="gp-label">Valid Till</label>
              <input
                type="datetime-local"
                className="gp-input"
                name="validTill"
                value={form.validTill}
                min={form.entry || undefined}
                onChange={onChange}
              />
            </div>
          </div>

          <div className="gp-button-row">
            <button
              className="gp-button gp-btn-primary"
              onClick={() => setShowPreview(true)}
              disabled={!isFormValid}
              title={!isFormValid ? "Fill all fields to preview" : ""}
            >
              Preview Gate Pass
            </button>

            <button
              className="gp-button gp-btn-green"
              onClick={generateQRCode}
              disabled={qrLoading || !isFormValid}
              title={!isFormValid ? "Fill all fields to generate QR" : ""}
            >
              {qrLoading ? "Generating..." : "Generate QR"}
            </button>
          </div>

          <div className="gp-hint">All fields are required. Use the calendar to pick date &amp; time.</div>
        </div>

        {showPreview && (
          <div className="gp-preview-wrapper">
            <div ref={cardRef} className="gp-card">
              <div className="gp-avatar">
                {form.photoDataUrl ? (
                  <img className="gp-avatar-img" src={form.photoDataUrl} alt="avatar" />
                ) : (
                  <div className="gp-avatar-fallback" />
                )}
              </div>

              <h3 className="gp-name">{form.fullName || "—"}</h3>
              <div className="gp-id">{form.idProof || "—"}</div>

              <div className="gp-qr-box">
                {qrDataUrl ? (
                  <img
                    className="gp-qr-img"
                    src={qrDataUrl}
                    alt="qr"
                    onClick={() => setShowQrModal(true)}
                  />
                ) : (
                  <div className="gp-qr-placeholder">
                    QR will appear after you click "Generate QR".
                  </div>
                )}
              </div>

              {/* subtle divider below QR */}
              <div className="gp-divider" />

              <div className="gp-verified-section">
                <div className="gp-verified">Verified by AI</div>
                <div className="gp-entry">
                  Gate Entry: {form.entry ? prettyDateTime(form.entry) : "—"}
                </div>
                <div className="gp-valid">
                  Valid Till: {form.validTill ? prettyDateTime(form.validTill) : "—"}
                </div>

                <div className="gp-action-row center">
                  <button className="gp-btn" onClick={downloadPdf} disabled={!qrDataUrl}>
                    Print / Download PDF
                  </button>
                  <button className="gp-btn" onClick={createHtmlFileAndShare}>
                    Open/Share HTML
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {showQrModal && (
        <div className="gp-modal-backdrop" onClick={() => setShowQrModal(false)}>
          <div className="gp-modal" onClick={(e) => e.stopPropagation()}>
            <h4 className="gp-modal-title">{form.fullName || "Gate Pass"}</h4>

            <div className="gp-modal-center">
              {qrDataUrl ? (
                <img className="gp-qr-large" src={qrDataUrl} alt="qr" />
              ) : (
                <div className="gp-qr-loading">Generating QR...</div>
              )}
            </div>

            <div className="gp-modal-actions">
              <button className="gp-button" onClick={downloadPdf} disabled={!qrDataUrl}>
                Download PDF
              </button>

              <button
                className="gp-button"
                onClick={() => {
                  const dataHtml = buildDataHtml(form);
                  navigator.clipboard?.writeText(dataHtml).then(() =>
                    alert("Data URL copied to clipboard. Many QR scanner apps will open it directly.")
                  );
                }}
              >
                Copy data URL
              </button>
            </div>

            <div className="gp-tip">
              Tip: QR encodes a small HTML page (data URL). If a scanner only shows text, paste the copied data URL into a browser.
            </div>

            <div className="gp-close-row">
              <button className="gp-button" onClick={() => setShowQrModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
