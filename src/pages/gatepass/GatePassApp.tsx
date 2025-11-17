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

/** --- New helper: compress/resize DataURL to a smaller JPEG DataURL --- */
type CompressOpts = { maxWidth?: number; maxHeight?: number; quality?: number };

function compressImageDataUrl(dataUrl: string, opts: CompressOpts = {}): Promise<string> {
  const { maxWidth = 900, maxHeight = 900, quality = 0.7 } = opts;
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let width = img.width;
      let height = img.height;
      const scale = Math.min(1, Math.min(maxWidth / width, maxHeight / height));
      width = Math.round(width * scale);
      height = Math.round(height * scale);

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas not supported"));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);

      try {
        const out = canvas.toDataURL("image/jpeg", quality);
        resolve(out);
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = () => reject(new Error("Failed to load image for compression"));
    img.src = dataUrl;
  });
}

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

  // validation errors
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

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

  // storage: load once
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) setList(JSON.parse(raw));
    } catch {}
  }, []);

  // ----- Updated: safe localStorage write with try/catch -----
  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(list));
    } catch (err: any) {
      console.error("Failed to save visitor list to localStorage:", err);
      // user-friendly alert for quota issues
      if (err && (err.name === "QuotaExceededError" || err.code === 22 || err.code === 1014)) {
        alert(
          "Saving failed: localStorage quota exceeded. Try removing old entries or disable photo saving."
        );
      } else {
        alert("Failed to save visitor list. See console for details.");
      }
    }
  }, [list]);

  // ----- Validation logic -----
  function validateField<K extends keyof FormState>(name: K, value: FormState[K]): string | null {
    switch (name) {
      case "fullName": {
        const v = (value as string).trim();
        if (!v) return "Full name is required.";
        if (v.length < 3) return "Enter at least 3 characters.";
        return null;
      }
      case "idProof": {
        const v = (value as string).trim();
        if (!v) return "ID proof number is required.";
        // allow letters, numbers, hyphens, min 4 chars
        if (!/^[A-Za-z0-9\-]{4,}$/.test(v)) return "Enter a valid ID (alphanumeric, - allowed).";
        return null;
      }
      case "mobile": {
        const v = (value as string).trim();
        if (!v) return "Mobile number is required.";
        // accept 10 digits or +91xxxxxxxxxx
        if (!/^([6-9]\d{9}|\+91[6-9]\d{9})$/.test(v)) return "Enter a valid 10-digit Indian mobile number.";
        return null;
      }
      case "purpose": {
        const v = (value as string).trim();
        if (!v) return "Select purpose of visit.";
        return null;
      }
      case "accessArea": {
        const v = (value as string).trim();
        if (!v) return "Select access area.";
        return null;
      }
      case "entry": {
        const v = (value as string).trim();
        if (!v) return "Entry date & time is required.";
        const dt = new Date(v);
        if (isNaN(dt.getTime())) return "Enter a valid date & time.";
        // Optional: don't allow entry in the past (comment out if you want past entries)
        // if (dt.getTime() < Date.now() - 5 * 60 * 1000) return "Entry cannot be in the past.";
        // if validTill exists, check relation below
        if (form.validTill) {
          const vt = new Date(form.validTill);
          if (!isNaN(vt.getTime()) && vt.getTime() <= dt.getTime()) return "'Valid Till' must be after Entry.";
        }
        return null;
      }
      case "validTill": {
        const v = (value as string).trim();
        if (!v) return "Valid till date & time is required.";
        const dt = new Date(v);
        if (isNaN(dt.getTime())) return "Enter a valid date & time.";
        const entryDt = new Date(form.entry);
        if (form.entry && !isNaN(entryDt.getTime()) && dt.getTime() <= entryDt.getTime()) return "'Valid Till' must be after Entry.";
        return null;
      }
      case "photoDataUrl":
        return null; // optional
      default:
        return null;
    }
  }

  function setField<K extends keyof FormState>(name: K, value: FormState[K]) {
    setForm((p) => ({ ...p, [name]: value }));
    // validate immediately and update errors
    const err = validateField(name, value);
    setErrors((prev) => {
      const copy = { ...prev };
      if (err) copy[name] = err;
      else delete (copy as any)[name];
      return copy;
    });
  }

  function validateAll(): boolean {
    const newErrors: Partial<Record<keyof FormState, string>> = {};
    (Object.keys(form) as (keyof FormState)[]).forEach((k) => {
      const err = validateField(k, form[k]);
      if (err) newErrors[k] = err;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  const isFormValid = (): boolean => {
    // cheap check: required fields present and no errors
    const requiredPresent = Boolean(
      form.fullName.trim() &&
        form.idProof.trim() &&
        form.mobile.trim() &&
        form.purpose &&
        form.accessArea &&
        form.entry &&
        form.validTill
    );
    return requiredPresent && Object.keys(errors).length === 0;
  };

  // form handlers
  function onChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target as HTMLInputElement;
    setField(name as keyof FormState, value as any);
  }

  /** --- Updated: compress/resize uploaded photo before storing --- */
  function onPhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // only accept images
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const dataUrl = reader.result as string;
        // compress/resize before storing (adjust opts if you want smaller/larger)
        const compressed = await compressImageDataUrl(dataUrl, {
          maxWidth: 900,
          maxHeight: 900,
          quality: 0.7,
        });
        setField("photoDataUrl", compressed);
      } catch (err) {
        console.error("Image processing error:", err);
        alert("Failed to process image. See console for details.");
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };
    reader.onerror = () => {
      alert("Unable to read the file.");
      if (fileInputRef.current) fileInputRef.current.value = "";
    };
    reader.readAsDataURL(file);
  }

  function handleSave() {
    // final validation
    if (!validateAll()) return;

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
    setErrors({});
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

  async function downloadPdf() {
    if (!printRef.current) {
      alert("Nothing to export!");
      return;
    }
    const opt: any = {
      margin: 0,
      filename: `${currentEntry?.fullName || "rjb"}_${currentPassType.replace(" ", "_")}_pass.pdf`,
      image: { type: "jpeg" as const, quality: 0.98 },

      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: "a5", orientation: "portrait" },
    };
    await html2pdf().set(opt).from(printRef.current).save();
  }

  return (
    <div className="rjb-gp-app">
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

      <div className="rjb-gp-container">
        {/* LEFT: FORM */}
        <div className="rjb-gp-form-card">
          <h3 className="rjb-gp-heading">Gate Pass Details</h3>

          <label className="rjb-gp-label">Upload Photo (optional)</label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={onPhotoChange}
            className={`gp-input ${errors.photoDataUrl ? "error" : ""}`}
          />

          <label className="rjb-gp-label">Full Name</label>
          <input
            className={`rjb-gp-input ${errors.fullName ? "error" : ""}`}
            name="fullName"
            placeholder="Enter full name"
            value={form.fullName}
            onChange={onChange}
            aria-invalid={!!errors.fullName}
          />
          {errors.fullName && <div className="rjb-gp-error">{errors.fullName}</div>}

          <label className="rjb-gp-label">ID Proof Number</label>
          <input
            className={`rjb-gp-input ${errors.idProof ? "error" : ""}`}
            name="idProof"
            placeholder="SRJBTK-AYD-2025-000124"
            value={form.idProof}
            onChange={onChange}
            aria-invalid={!!errors.idProof}
          />
          {errors.idProof && <div className="rjb-gp-error">{errors.idProof}</div>}

          <label className="rjb-gp-label">Mobile Number</label>
          <input
            className={`rjb-gp-input ${errors.mobile ? "error" : ""}`}
            name="mobile"
            placeholder="9XXXXXXXXX"
            value={form.mobile}
            onChange={onChange}
            aria-invalid={!!errors.mobile}
          />
          {errors.mobile && <div className="rjb-gp-error">{errors.mobile}</div>}

          <div className="rjb-gp-form-row">
            <div className="rjb-gp-col">
              <label className="rjb-gp-label">Purpose of Visit</label>
              <select
                className={`rjb-gp-select ${errors.purpose ? "error" : ""}`}
                name="purpose"
                value={form.purpose}
                onChange={onChange}
                aria-invalid={!!errors.purpose}
              >
                <option value="">Select purpose</option>
                <option>Devotee</option>
                <option>Employee</option>
                <option>Visitor</option>
              </select>
              {errors.purpose && <div className="rjb-gp-error">{errors.purpose}</div>}
            </div>
            <div className="rjb-gp-col">
              <label className="rjb-gp-label">Access Area</label>
              <select
                className={`rjb-gp-select ${errors.accessArea ? "error" : ""}`}
                name="accessArea"
                value={form.accessArea}
                onChange={onChange}
                aria-invalid={!!errors.accessArea}
              >
                <option value="">Select access</option>
                <option>Inner Sanctum</option>
                <option>Outer Hall</option>
                <option>Garden</option>
              </select>
              {errors.accessArea && <div className="rjb-gp-error">{errors.accessArea}</div>}
            </div>
          </div>

          <div className="rjb-gp-form-row">
            <div className="rjb-gp-col">
              <label className="rjb-gp-label">Date &amp; Time</label>
              <input
                type="datetime-local"
                className={`rjb-gp-input ${errors.entry ? "error" : ""}`}
                name="entry"
                value={form.entry}
                onChange={onChange}
                aria-invalid={!!errors.entry}
              />
              {errors.entry && <div className="rjb-gp-error">{errors.entry}</div>}
            </div>
            <div className="rjb-gp-col">
              <label className="rjb-gp-label">Valid Till</label>
              <input
                type="datetime-local"
                className={`rjb-gp-input ${errors.validTill ? "error" : ""}`}
                name="validTill"
                value={form.validTill}
                min={form.entry || undefined}
                onChange={onChange}
                aria-invalid={!!errors.validTill}
              />
              {errors.validTill && <div className="rjb-gp-error">{errors.validTill}</div>}
            </div>
          </div>

          <div className="rjb-gp-button-row">
            <button
              type="button"
              className="rjb-gp-button rjb-gp-btn-primary"
              onClick={handleSave}
              disabled={!isFormValid()}
              title={!isFormValid() ? "Fix validation errors before saving" : ""}
            >
              Save
            </button>
          </div>

          <div className="rjb-gp-hint">
            Saved entries appear on the right. Click a pass button to generate a QR.
          </div>
        </div>

        {/* RIGHT: TABLE */}
        <div ref={listRef} className="rjb-gp-list-card">
          <div className="rjb-gp-table-head rjb-gp-sticky-head">
            <div>Visitor</div>
            <div>Full Name</div>
            <div>Purpose</div>
          </div>

          {list.length === 0 ? (
            <div className="rjb-gp-empty">No entries yet.</div>
          ) : (
            <div className="rjb-gp-table-body">
              {list.map((v) => (
                <div key={v.id} className="rjb-gp-row">
                  {/* Avatar */}
                  <div className="rjb-c1">
                    <div className="rjb-gp-avatar-wrap">
                      <Avatar
                        size={44}
                        src={v.photoDataUrl || undefined}
                        icon={!v.photoDataUrl ? <UserOutlined /> : undefined}
                        style={{ backgroundColor: v.photoDataUrl ? "#ffffff" : "#bfbfbf" }}
                      />
                    </div>
                  </div>

                  {/* Name & Purpose */}
                  <div className="rjb-c2">{v.fullName}</div>
                  <div className="rjb-c3">{v.purpose}</div>

                  {/* Actions under name→purpose */}
                  <div className="rjb-c4">
                    <button
                      type="button"
                      className="rjb-gp-chip"
                      onClick={() => openQrFor(v, "Gate Pass")}
                      disabled={qrLoading}
                    >
                      Gate Pass
                    </button>
                    <button
                      type="button"
                      className="rjb-gp-chip"
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
        <div className="rjb-gp-modal-backdrop" onClick={() => setShowQrModal(false)}>
          <div
            ref={modalRef}
            className="rjb-gp-modal"
            onClick={(e) => e.stopPropagation()}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-label="QR code modal"
          >
            <h4 className="rjb-gp-modal-title">{qrTitle || "Gate Pass"}</h4>
            <div className="rjb-gp-modal-center">
              {qrDataUrl ? (
                <img className="rjb-gp-qr-large" src={qrDataUrl} alt="QR code" />
              ) : (
                <div className="rjb-gp-qr-loading">Generating QR...</div>
              )}
            </div>
            <div className="rjb-gp-modal-actions">
              <button
                type="button"
                className="rjb-gp-button"
                onClick={downloadPdf}
                disabled={!qrDataUrl}
              >
                Download PDF
              </button>
              <button
                type="button"
                className="rjb-gp-button"
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
