import React, { useEffect, useRef, useState } from "react";
import QRCode from "qrcode"; // default import (ESM)
import { Avatar } from "antd";
import { UserOutlined } from "@ant-design/icons";
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

  // (kept for PDF/internal uses)
  function escapeHtml(str: string) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function buildDataHtml(
    data: VisitorEntry,
    passType: "Gate Pass" | "Visitor Pass"
  ): string {
    const photoHtml = data.photoDataUrl
      ? `<div class="photo-wrapper"><img class="photo" src="${data.photoDataUrl}" alt="photo"></div>`
      : "";

    const html = `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(passType)} - ${escapeHtml(data.fullName)}</title>
<link rel="stylesheet" href="qr-card.css">
</head><body>
  <div class="card">
    ${photoHtml}
    <h2 class="title">${escapeHtml(data.fullName)}</h2>
    <div class="sub">${escapeHtml(data.idProof)}</div>
    <div class="row"><div class="label">Mobile</div><div>${escapeHtml(data.mobile)}</div></div>
    <div class="row"><div class="label">Purpose</div><div>${escapeHtml(data.purpose)}</div></div>
    <div class="row"><div class="label">Access</div><div>${escapeHtml(data.accessArea)}</div></div>
    <div class="row"><div class="label">Entry</div><div>${escapeHtml(prettyDateTime(data.entry))}</div></div>
    <div class="row"><div class="label">Valid Till</div><div>${escapeHtml(prettyDateTime(data.validTill))}</div></div>
    <div class="row"><div class="label">Pass Type</div><div>${escapeHtml(passType)}</div></div>
    <div class="verified">Verified by AI</div>
  </div>
</body></html>`;
    return `data:text/html;base64,${btoa(unescape(encodeURIComponent(html)))}`;
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
  async function downloadPdf(): Promise<void> {
    if (!qrDataUrl || !currentEntry) {
      alert("Generate a pass first.");
      return;
    }
    const { jsPDF } = await import("jspdf");

    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a5" });
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const margin = 12;
    const innerW = pageW - margin * 2;

    // Card background
    pdf.setDrawColor(230);
    pdf.setFillColor(255, 255, 255);
    pdf.roundedRect(margin, margin, innerW, pageH - margin * 2, 3, 3, "FD");

    // Header
    let y = margin + 10;
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(16);
    pdf.text(`${currentPassType}`, margin + 8, y);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.setTextColor(120);
    pdf.text("RJB Security Command • Verified by AI", pageW - margin - 8, y, { align: "right" });
    pdf.setTextColor(0);

    // QR centered
    const qrSize = 60; // mm
    y += 10;
    const qrX = (pageW - qrSize) / 2;
    pdf.addImage(qrDataUrl, "PNG", qrX, y, qrSize, qrSize);

    // Optional photo chip under QR (centered)
    const afterQrY = y + qrSize + 6;
    if (currentEntry.photoDataUrl) {
      const photoSize = 16;
      const photoX = (pageW - photoSize) / 2;
      pdf.addImage(currentEntry.photoDataUrl, "JPEG", photoX, afterQrY, photoSize, photoSize, undefined, "FAST");
    }

    // Details block (centered under QR/photo)
    let detailsY = afterQrY + (currentEntry.photoDataUrl ? 16 : 0) + 10;
    const labelW = 26;
    const valueStartX = (pageW - 100) / 2 + labelW;
    const labelStartX = valueStartX - labelW;

    const line = (label: string, value: string) => {
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(12);
      pdf.text(label, labelStartX, detailsY);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(12);
      pdf.text(value || "-", valueStartX, detailsY);
      detailsY += 8;
    };

    line("Name", currentEntry.fullName);
    line("ID Proof", currentEntry.idProof);
    line("Mobile", currentEntry.mobile);
    line("Purpose", currentEntry.purpose);
    line("Access", currentEntry.accessArea);
    line("Entry", prettyDateTime(currentEntry.entry));
    line("Valid Till", prettyDateTime(currentEntry.validTill));

    // Footer timestamp
    pdf.setFontSize(9);
    pdf.setTextColor(120);
    pdf.text(
      `Generated: ${prettyDateTime(new Date().toISOString())}`,
      margin + 8,
      pageH - margin - 6
    );

    pdf.save(
      `${currentEntry.fullName.replace(/\s+/g, "_")}_${currentPassType.replace(" ", "")}.pdf`
    );
  }

  return (
    <div className="gp-app">
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
