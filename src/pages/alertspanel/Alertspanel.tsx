
  import { useEffect, useMemo, useState } from "react";
  import "./AlertsPanel.css";

  import snap1 from "../../assets/susp1.webp";
  import snap2 from "../../assets/susp2.webp";
  import snap3 from "../../assets/susp3.webp";
  import snap4 from "../../assets/susp4.webp";
  import snap5 from "../../assets/susp5.webp";
  import snap6 from "../../assets/susp6.webp";

  /* ---------- Types ---------- */
  type Severity = "critical" | "high" | "medium" | "low";
  type Status = "new" | "triaged" | "in_progress" | "resolved" | "false_positive";

  type AlertRecord = {
    id: string;
    title: string;
    type: string;
    severity: Severity;
    confidence: number;
    createdAt: string;
    status: Status;
    source: { name?: string; location?: string; snapshotDataUrl?: string | null };
    assignedTo?: string | null;
    notes?: { text: string; at: string }[];
    reasoning?: string;
    updatedAt?: string;
  };

  /* ---------- LocalStorage keys ---------- */
  const LS = "rjb_alerts_v1";
  const SETTINGS_LS = "rjb_settings_v1";

  /* Use imported assets as the default snapshot pool */
  const DEFAULT_PUBLIC_SAMPLES = [snap1, snap2, snap3, snap4, snap5, snap6];

  /* ---------- Helpers ---------- */
  function uid() {
    return Math.random().toString(36).slice(2, 9);
  }
  function nowIso() {
    return new Date().toISOString();
  }

  /* Load minimal settings (defensive) */
  function loadSettings() {
    try {
      const raw = localStorage.getItem(SETTINGS_LS);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  /* ---------- Component ---------- */
  export default function AlertsPanel() {
    const [alerts, setAlerts] = useState<AlertRecord[]>(() => {
      try {
        const raw = localStorage.getItem(LS);
        return raw ? (JSON.parse(raw) as AlertRecord[]) : [];
      } catch {
        return [];
      }
    });

    // SETTINGS state
    const [settings, setSettings] = useState<any>(() => loadSettings());

    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [filter, setFilter] = useState<{ severity: "all" | Severity; status: "all" | Status; q: string }>({
      severity: "all",
      status: "all",
      q: "",
    });
    const [noteText, setNoteText] = useState<string>("");

    useEffect(() => {
      localStorage.setItem(LS, JSON.stringify(alerts));
    }, [alerts]);

    /* listen for settings updates via custom event + storage */
    useEffect(() => {
      function reloadSettings() {
        const s = loadSettings();
        setSettings(s);
      }

      // initial
      reloadSettings();

      // custom event fired by settings page onSave
      const onUpdate = () => reloadSettings();
      window.addEventListener("rjb:settings-updated", onUpdate);

      // storage event for other tabs/windows
      const onStorage = (e: StorageEvent) => {
        if (e.key === SETTINGS_LS) reloadSettings();
      };
      window.addEventListener("storage", onStorage);

      return () => {
        window.removeEventListener("rjb:settings-updated", onUpdate);
        window.removeEventListener("storage", onStorage);
      };
    }, []);

    /* ---------- Update & helpers ---------- */
    function updateAlert(id: string, patch: Partial<AlertRecord>) {
      setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch, updatedAt: nowIso() } : a)));
    }

    function addNote(id: string, text: string) {
      if (!text.trim()) return;
      setAlerts((prev) =>
        prev.map((a) => (a.id === id ? { ...a, notes: [...(a.notes || []), { text: text.trim(), at: nowIso() }] } : a))
      );
      setNoteText("");
    }

    function removeAlert(id: string) {
      setAlerts((prev) => prev.filter((a) => a.id !== id));
      if (selectedId === id) setSelectedId(null);
    }

    /* ---------- Create mock alerts (each gets a random snapshot) ---------- */

    function mapSeverityByConfidence(confPct: number, typeHint?: string) {
      const ai = settings?.aiAlerts;
      if (!ai) {
        if (confPct >= 90) return "critical";
        if (confPct >= 80) return "high";
        if (confPct >= 70) return "medium";
        return "low";
      }

      if (typeHint === "person") {
        const pThresh = ai.personConfidence ?? ai.person?.suspiciousConfidence ?? 70;
        if (confPct >= pThresh + 20) return "critical";
        if (confPct >= pThresh + 5) return "high";
        if (confPct >= pThresh) return "medium";
        return "low";
      }

      if (typeHint === "vehicle") {
        const vThresh = ai.vehicleConfidence ?? ai.vehicle?.confidenceThreshold ?? 85;
        if (confPct >= vThresh + 10) return "high";
        if (confPct >= vThresh) return "medium";
        return "low";
      }

      if (confPct >= 90) return "critical";
      if (confPct >= 80) return "high";
      if (confPct >= 70) return "medium";
      return "low";
    }

    function createMockAlert(): AlertRecord | null {
      // respect settings: if ai alerts disabled, don't create mock alerts
      if (settings?.aiAlerts?.enabled === false) return null;

      const snap = DEFAULT_PUBLIC_SAMPLES[Math.floor(Math.random() * DEFAULT_PUBLIC_SAMPLES.length)];

      // generate a random confidence and optionally adjust using settings
      let confidence = +(0.6 + Math.random() * 0.4).toFixed(2); // 0.6 - 1.0
      let type = "vision";
      let typeHint: "person" | "vehicle" | undefined = undefined;
      const r = Math.random();
      if (r < 0.25) {
        type = "person";
        typeHint = "person";
        confidence = +(0.4 + Math.random() * 0.6).toFixed(2);
      } else if (r < 0.55) {
        type = "vehicle";
        typeHint = "vehicle";
        confidence = +(0.4 + Math.random() * 0.6).toFixed(2);
      }

      const confPct = Math.round(confidence * 100);
      const mappedSeverity = mapSeverityByConfidence(confPct, typeHint) as Severity;

      let title = mappedSeverity === "critical" ? "Intrusion detected" : mappedSeverity === "high" ? "Suspicious activity" : "Motion detected";
      let reasoning = `Model confidence ${confPct}%`;
      if (typeHint === "person" && settings?.aiAlerts?.personConfidence) {
        reasoning += ` (person threshold ${settings.aiAlerts.personConfidence}%)`;
      }
      if (typeHint === "vehicle" && settings?.aiAlerts?.vehicleConfidence) {
        reasoning += ` (vehicle threshold ${settings.aiAlerts.vehicleConfidence}%)`;
      }

      return {
        id: uid(),
        title,
        type,
        severity: mappedSeverity,
        confidence,
        createdAt: nowIso(),
        status: "new",
        source: {
          name: ["Camera A1", "Gate Cam 2", "Perimeter 5"][Math.floor(Math.random() * 3)],
          location: ["Gate 1", "Inner Hall", "Perimeter Fence"][Math.floor(Math.random() * 3)],
          snapshotDataUrl: snap,
        },
        assignedTo: null,
        notes: [],
        reasoning,
      };
    }

    /* ---------- Emit mock alerts periodically (frontend-only) ---------- */
    useEffect(() => {
      // simulator frequency controlled by settings
      const freqSeconds = settings?.aiAlerts?.simulatorFrequencySeconds ?? settings?.aiAlerts?.simulator?.alertsFrequencySeconds ?? 8;
      const enabled = settings?.aiAlerts?.simulatorEnabled ?? settings?.aiAlerts?.simulator?.enabled ?? true;
      if (!enabled) return;

      const id = setInterval(() => {
        const a = createMockAlert();
        if (!a) return;
        setAlerts((s) => [a, ...s].slice(0, 200));
      }, Math.max(500, freqSeconds * 1000));

      return () => clearInterval(id);
      // include the relevant settings deps so effect restarts when they change
    }, [settings?.aiAlerts?.simulatorEnabled, settings?.aiAlerts?.simulatorFrequencySeconds, settings?.aiAlerts?.enabled, settings?.aiAlerts?.vehicleConfidence, settings?.aiAlerts?.personConfidence]);

    /* ---------- Backfill existing alerts without snapshots ---------- */
    useEffect(() => {
      if (!alerts || alerts.length === 0) return;
      const missing = alerts.filter((a) => !a.source?.snapshotDataUrl);
      if (missing.length === 0) return;

      setAlerts((prev) =>
        prev.map((a) => {
          if (a.source?.snapshotDataUrl) return a;
          const snap = DEFAULT_PUBLIC_SAMPLES[Math.floor(Math.random() * DEFAULT_PUBLIC_SAMPLES.length)];
          return { ...a, source: { ...a.source, snapshotDataUrl: snap } };
        })
      );
    }, []); // run once

    /* ---------- Filtering ---------- */
    const filtered = useMemo(() => {
      return alerts.filter((a) => {
        if (filter.severity !== "all" && a.severity !== filter.severity) return false;
        if (filter.status !== "all" && a.status !== filter.status) return false;
        if (filter.q && !(`${a.title} ${a.type} ${a.source.name} ${a.source.location}`.toLowerCase().includes(filter.q.toLowerCase())))
          return false;
        return true;
      });
    }, [alerts, filter]);

    const selected = alerts.find((a) => a.id === selectedId) ?? null;

    /* ---------- Render ---------- */
    return (
      <div className="rjb-alerts-panel">
        <div className="rjb-alerts-list">
          <div className="rjb-alerts-filters">
            <input
              className="rjb-search"
              placeholder="Search..."
              value={filter.q}
              onChange={(e) => setFilter((f) => ({ ...f, q: e.target.value }))}
            />
            <select className="rjb-select" value={filter.severity} onChange={(e) => setFilter((f) => ({ ...f, severity: e.target.value as any }))}>
              <option value="all">All</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <select className="rjb-select" value={filter.status} onChange={(e) => setFilter((f) => ({ ...f, status: e.target.value as any }))}>
              <option value="all">Any</option>
              <option value="new">New</option>
              <option value="triaged">Triaged</option>
              <option value="in_progress">In progress</option>
              <option value="resolved">Resolved</option>
              <option value="false_positive">False positive</option>
            </select>
          </div>

          <div className="rjb-alerts-list-body">
            {filtered.length === 0 && <div className="rjb-empty">No alerts — waiting for events...</div>}

            {filtered.map((a) => (
              <div
                key={a.id}
                className={`rjb-alert-item ${selectedId === a.id ? "selected" : ""}`}
                onClick={() => setSelectedId(a.id)}
              >
                <div className="rjb-alert-main">
                  <div className="rjb-alert-title">
                    <div className="rjb-title-row">
                      <strong>{a.title}</strong>
                      <span className={`rjb-status-badge ${a.status}`}>{a.status.replace("_", " ").toUpperCase()}</span>
                    </div>
                    <span className="rjb-alert-source">{a.source.name}</span>
                  </div>

                  <div className="rjb-alert-meta">
                    <div className={`rjb-alert-severity ${a.severity}`}>{a.severity.toUpperCase()}</div>
                    <div className="rjb-alert-confidence">{Math.round(a.confidence * 100)}%</div>
                  </div>
                </div>

                <div className="rjb-alert-actions">
                  <button className="rjb-btn" onClick={(e) => { e.stopPropagation(); updateAlert(a.id, { status: "triaged" }); }}>Acknowledge</button>
                  <button className="rjb-btn" onClick={(e) => { e.stopPropagation(); const name = prompt("Assign to (enter name):", a.assignedTo || "") || ""; if (name) updateAlert(a.id, { assignedTo: name, status: "in_progress" }); }}>Assign</button>
                  <button className="rjb-btn" onClick={(e) => { e.stopPropagation(); updateAlert(a.id, { status: "false_positive" }); }}>False</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rjb-alerts-detail">
          {selected ? (
            <div className="rjb-detail-card">
              <div className="rjb-detail-header">
                <div>
                  <h3 className="rjb-detail-title">{selected.title}</h3>
                  <div className="rjb-detail-sub">{selected.source.name} • {selected.source.location}</div>
                </div>

                <div className="rjb-detail-right">
                  <div className="rjb-confidence">{Math.round(selected.confidence * 100)}% confidence</div>
                  <div className="rjb-created">{new Date(selected.createdAt).toLocaleString()}</div>
                </div>
              </div>

              <div className="rjb-detail-body">
                <div className="rjb-media">
                  {selected.source.snapshotDataUrl ? (
                    <img src={selected.source.snapshotDataUrl} alt="snapshot" />
                  ) : (
                    <div className="rjb-media-empty">No snapshot</div>
                  )}
                </div>

                <div className="rjb-meta-actions">
                  <p><strong>Type:</strong> {selected.type}</p>
                  <p><strong>Assigned to:</strong> {selected.assignedTo ?? "—"}</p>

                  <div className="rjb-action-row">
                    <button className="rjb-btn primary" onClick={() => updateAlert(selected.id, { status: "triaged" })}>Acknowledge</button>
                    <button className="rjb-btn" onClick={() => { const name = prompt("Assign to (enter name):", selected.assignedTo || "") || ""; if (name) updateAlert(selected.id, { assignedTo: name, status: "in_progress" }); }}>Assign</button>
                    <button className="rjb-btn" onClick={() => updateAlert(selected.id, { status: "resolved" })}>Resolve</button>
                    <button className="rjb-btn danger" onClick={() => updateAlert(selected.id, { status: "false_positive" })}>Mark False</button>
                  </div>

                  <div className="rjb-ai-reason">
                    <h4>AI Reasoning</h4>
                    <pre>{selected.reasoning}</pre>
                  </div>

                  <div className="rjb-notes">
                    <h4>Notes</h4>
                    <div className="rjb-notes-list">
                      {(selected.notes || []).map((n, idx) => (
                        <div key={idx} className="rjb-note">
                          <div className="rjb-note-meta">{new Date(n.at).toLocaleString()}</div>
                          <div>{n.text}</div>
                        </div>
                      ))}
                    </div>

                    <div className="rjb-add-note">
                      <input placeholder="Add note..." value={noteText} onChange={(e) => setNoteText(e.target.value)} />
                      <button className="rjb-btn" onClick={() => addNote(selected.id, noteText)}>Add</button>
                    </div>
                  </div>

                  <div className="rjb-delete-row">
                    <button className="rjb-link danger" onClick={() => { if (confirm("Delete alert?")) removeAlert(selected.id); }}>Delete Alert</button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="rjb-detail-empty">Select an alert to see details</div>
          )}
        </div>
      </div>
    );
  }
