import html2pdf from "html2pdf.js";
import React, { useEffect, useRef, useState } from "react";
import QRCode from "qrcode"; // default import (ESM)
import { Avatar } from "antd";
import { UserOutlined } from "@ant-design/icons";
import "./GatePass.css";
import GatePassCard from "./GatePassCard";
import VisitorPassCard from "./VisitorPassCard";

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

type VisitorEntry = FormState & {
  id: string;
  createdAt: number;
};

const LS_KEY = "rjb_gatepass_visitors_v1";

export default function GatePassApp() {
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

  const [list, setList] = useState<VisitorEntry[]>([]);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [showQrModal, setShowQrModal] = useState<boolean>(false);
  const [qrLoading, setQrLoading] = useState<boolean>(false);
  const [qrTitle, setQrTitle] = useState<string>("");

  // Track which pass is open (for PDF layout)
  const [currentEntry, setCurrentEntry] = useState<VisitorEntry | null>(null);
  const [currentPassType, setCurrentPassType] =
    useState<"Gate Pass" | "Visitor Pass">("Gate Pass");

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);
  const printRef = useRef<HTMLDivElement>(null);


  // Lock body scroll + ESC close
  useEffect(() => {
    if (!showQrModal) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setShowQrModal(false);
    window.addEventListener("keydown", onKey);
    modalRef.current?.focus();
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [showQrModal]);

  const isFormValid = Boolean(
    form.fullName.trim() &&
      form.idProof.trim() &&
      form.mobile.trim() &&
      form.purpose &&
      form.accessArea &&
      form.entry &&
      form.validTill &&
      new Date(form.validTill) > new Date(form.entry)
  );

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

  // Build PLAIN TEXT for the QR (so phones show details directly; no hosting needed)
  function buildQrText(
    data: VisitorEntry,
    passType: "Gate Pass" | "Visitor Pass"
  ): string {
    return [
      "RJB Security — Pass",
      `Type: ${passType}`,
      `Name: ${data.fullName}`,
      `ID Proof: ${data.idProof}`,
      `Mobile: ${data.mobile}`,
      `Purpose: ${data.purpose}`,
      `Access: ${data.accessArea}`,
      `Entry: ${prettyDateTime(data.entry)}`,
      `Valid Till: ${prettyDateTime(data.validTill)}`,
      data.photoDataUrl ? "Photo: yes" : "Photo: no",
    ].join("\n");
  }
// const printRef = useRef<HTMLDivElement>(null);
  // storage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) setList(JSON.parse(raw));
    } catch {}
  }, []);
  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(list));
  }, [list]);

  // form handlers
  function onChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  }

  function onPhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () =>
      setForm((p) => ({ ...p, photoDataUrl: reader.result as string }));
    reader.readAsDataURL(file);
  }

  function handleSave() {
    if (!isFormValid) return;
    const entry: VisitorEntry = {
      ...form,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
    };
    setList((prev) => [entry, ...prev]);
    requestAnimationFrame(() =>
      listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    );
    setForm({
      fullName: "",
      idProof: "",
      mobile: "",
      purpose: "",
      accessArea: "",
      entry: "",
      validTill: "",
      photoDataUrl: null,
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  // Generate QR with PLAIN TEXT payload (no URL, no hosting)
  async function openQrFor(
    entry: VisitorEntry,
    passType: "Gate Pass" | "Visitor Pass"
  ) {
    setQrLoading(true);
    setQrTitle(`${passType} • ${entry.fullName}`);
    setCurrentEntry(entry);
    setCurrentPassType(passType);
    try {
      const textPayload = buildQrText(entry, passType);
      const url = await QRCode.toDataURL(textPayload, {
        errorCorrectionLevel: "M",
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
  

  /* VERSION 1 (stacked): A5 portrait, QR centered on top, details below */
async function downloadPdf() {
  if (!printRef.current) {
    alert("Nothing to export!");
    return;
  }
  // Options for best quality and A5 size
  const opt: any = {
    margin: 0,
    filename: `${currentEntry?.fullName || "rjb"}_${currentPassType.replace(" ", "_")}_pass.pdf`,
    // image: { type: "jpeg", quality: 0.98 },
    image: { type: "jpeg" as const, quality: 0.98 },

    html2canvas: { scale: 2 },
    jsPDF: { unit: "mm", format: "a5", orientation: "portrait" }
  };
  await html2pdf().set(opt).from(printRef.current).save();

}


  return (
    <div className="gp-app">
      <div style={{ display: "none" }}>
  <div ref={printRef}>
    {currentPassType === "Gate Pass" && currentEntry && (
      <GatePassCard entry={currentEntry} qrDataUrl={qrDataUrl} />
    )}
    {currentPassType === "Visitor Pass" && currentEntry && (
      <VisitorPassCard entry={currentEntry} qrDataUrl={qrDataUrl} />
    )}
  </div>
</div>

      <div className="gp-container">
        {/* LEFT: FORM */}
        <div className="gp-form-card">
          <h3 className="gp-heading">Gate Pass Details</h3>

          <label className="gp-label">Upload Photo (optional)</label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={onPhotoChange}
            className="gp-input"
          />

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
              type="button"
              className="gp-button gp-btn-primary"
              onClick={handleSave}
              disabled={!isFormValid}
              title={!isFormValid ? "Fill all fields to save" : ""}
            >
              Save
            </button>
          </div>

          <div className="gp-hint">
            Saved entries appear on the right. Click a pass button to generate a QR.
          </div>
        </div>

        {/* RIGHT: TABLE */}
        <div ref={listRef} className="gp-list-card">
          <div className="gp-table-head gp-sticky-head">
            <div>Visitor</div>
            <div>Full Name</div>
            <div>Purpose</div>
          </div>

          {list.length === 0 ? (
            <div className="gp-empty">No entries yet.</div>
          ) : (
            <div className="gp-table-body">
              {list.map((v) => (
                <div key={v.id} className="gp-row">
                  {/* Avatar */}
                  <div className="c1">
                    <div className="gp-avatar-wrap">
                      <Avatar
                        size={44}
                        src={v.photoDataUrl || undefined}
                        icon={!v.photoDataUrl ? <UserOutlined /> : undefined}
                        style={{ backgroundColor: v.photoDataUrl ? "#ffffff" : "#bfbfbf" }}
                      />
                    </div>
                  </div>

                  {/* Name & Purpose */}
                  <div className="c2">{v.fullName}</div>
                  <div className="c3">{v.purpose}</div>

                  {/* Actions under name→purpose */}
                  <div className="c4">
                    <button
                      type="button"
                      className="gp-chip"
                      onClick={() => openQrFor(v, "Gate Pass")}
                      disabled={qrLoading}
                    >
                      Gate Pass
                    </button>
                    <button
                      type="button"
                      className="gp-chip"
                      onClick={() => openQrFor(v, "Visitor Pass")}
                      disabled={qrLoading}
                    >
                      Visitor Pass
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* QR MODAL */}
      {showQrModal && (
        <div className="gp-modal-backdrop" onClick={() => setShowQrModal(false)}>
          <div
            ref={modalRef}
            className="gp-modal"
            onClick={(e) => e.stopPropagation()}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-label="QR code modal"
          >
            <h4 className="gp-modal-title">{qrTitle || "Gate Pass"}</h4>
            <div className="gp-modal-center">
              {qrDataUrl ? (
                <img className="gp-qr-large" src={qrDataUrl} alt="QR code" />
              ) : (
                <div className="gp-qr-loading">Generating QR...</div>
              )}
            </div>
            <div className="gp-modal-actions">
              <button
                type="button"
                className="gp-button"
                onClick={downloadPdf}
                disabled={!qrDataUrl}
              >
                Download PDF
              </button>
              <button
                type="button"
                className="gp-button"
                onClick={() => setShowQrModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
