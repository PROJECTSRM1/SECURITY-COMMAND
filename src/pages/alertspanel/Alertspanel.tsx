
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

/* Use imported assets as the default snapshot pool */
const DEFAULT_PUBLIC_SAMPLES = [snap1, snap2, snap3, snap4,snap5,snap6 ];

/* ---------- Helpers ---------- */
function uid() {
  return Math.random().toString(36).slice(2, 9);
}
function nowIso() {
  return new Date().toISOString();
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

  /* ---------- Create mock alerts (each gets a random snapshot from src/assets) ---------- */
  function createMockAlert(): AlertRecord {
    const severities: Severity[] = ["critical", "high", "medium", "low"];
    const severity = severities[Math.floor(Math.random() * severities.length)];
    const title =
      severity === "critical" ? "Intrusion detected" : severity === "high" ? "Suspicious activity" : "Motion detected";

    const snap = DEFAULT_PUBLIC_SAMPLES[Math.floor(Math.random() * DEFAULT_PUBLIC_SAMPLES.length)];

    return {
      id: uid(),
      title,
      type: "vision",
      severity,
      confidence: +(0.6 + Math.random() * 0.4).toFixed(2),
      createdAt: nowIso(),
      status: "new",
      source: {
        name: ["Camera A1", "Gate Cam 2", "Perimeter 5"][Math.floor(Math.random() * 3)],
        location: ["Gate 1", "Inner Hall", "Perimeter Fence"][Math.floor(Math.random() * 3)],
        snapshotDataUrl: snap,
      },
      assignedTo: null,
      notes: [],
      reasoning: "AI model v1: unusual motion pattern detected outside working hours.",
    };
  }

  /* ---------- Emit mock alerts periodically (frontend-only) ---------- */
  useEffect(() => {
    const id = setInterval(() => {
      const a = createMockAlert();
      setAlerts((s) => [a, ...s].slice(0, 50));
    }, 8000);
    return () => clearInterval(id);
  }, []);

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
    
  }, []);

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
    <div className="alerts-panel">
      {/* LEFT: List */}
      <div className="alerts-list">
        <div className="alerts-filters">
          <input
            className="search"
            placeholder="Search..."
            value={filter.q}
            onChange={(e) => setFilter((f) => ({ ...f, q: e.target.value }))}
          />
          <select className="select" value={filter.severity} onChange={(e) => setFilter((f) => ({ ...f, severity: e.target.value as any }))}>
            <option value="all">All</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <select className="select" value={filter.status} onChange={(e) => setFilter((f) => ({ ...f, status: e.target.value as any }))}>
            <option value="all">Any</option>
            <option value="new">New</option>
            <option value="triaged">Triaged</option>
            <option value="in_progress">In progress</option>
            <option value="resolved">Resolved</option>
            <option value="false_positive">False positive</option>
          </select>
        </div>

        <div className="alerts-list-body">
          {filtered.length === 0 && <div className="empty">No alerts — waiting for events...</div>}

          {filtered.map((a) => (
            <div
              key={a.id}
              className={`alert-item ${selectedId === a.id ? "selected" : ""}`}
              onClick={() => setSelectedId(a.id)}
            >
              {/* LEFT list: no thumbnail (kept clean) */}

              <div className="alert-main">
                <div className="alert-title">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <strong>{a.title}</strong>
                    <span className={`status-badge ${a.status}`}>{a.status.replace("_", " ").toUpperCase()}</span>
                  </div>
                  <span className="alert-source">{a.source.name}</span>
                </div>

                <div className="alert-meta">
                  <div className={`alert-severity ${a.severity}`}>{a.severity.toUpperCase()}</div>
                  <div className="alert-confidence">{Math.round(a.confidence * 100)}%</div>
                </div>
              </div>

              <div className="alert-actions">
                <button
                  className="btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    updateAlert(a.id, { status: "triaged" });
                  }}
                >
                  Acknowledge
                </button>

                <button
                  className="btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    const name = prompt("Assign to (enter name):", a.assignedTo || "") || "";
                    if (name) updateAlert(a.id, { assignedTo: name, status: "in_progress" });
                  }}
                >
                  Assign
                </button>

                <button
                  className="btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    updateAlert(a.id, { status: "false_positive" });
                  }}
                >
                  False
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT: Detail */}
      <div className="alerts-detail">
        {selected ? (
          <div className="detail-card">
            <div className="detail-header">
              <div>
                <h3 className="detail-title">{selected.title}</h3>
                <div className="detail-sub">{selected.source.name} • {selected.source.location}</div>
              </div>

              <div className="detail-right">
                <div className="confidence">{Math.round(selected.confidence * 100)}% confidence</div>
                <div className="created">{new Date(selected.createdAt).toLocaleString()}</div>
              </div>
            </div>

            <div className="detail-body">
              <div className="media">
                {selected.source.snapshotDataUrl ? (
                  <img src={selected.source.snapshotDataUrl} alt="snapshot" />
                ) : (
                  <div className="media-empty">No snapshot</div>
                )}
              </div>

              <div className="meta-actions">
                <p><strong>Type:</strong> {selected.type}</p>
                <p><strong>Assigned to:</strong> {selected.assignedTo ?? "—"}</p>

                <div className="action-row">
                  <button className="btn primary" onClick={() => updateAlert(selected.id, { status: "triaged" })}>Acknowledge</button>
                  <button className="btn" onClick={() => { const name = prompt("Assign to (enter name):", selected.assignedTo || "") || ""; if (name) updateAlert(selected.id, { assignedTo: name, status: "in_progress" }); }}>Assign</button>
                  <button className="btn" onClick={() => updateAlert(selected.id, { status: "resolved" })}>Resolve</button>
                  <button className="btn danger" onClick={() => updateAlert(selected.id, { status: "false_positive" })}>Mark False</button>
                </div>

                <div className="ai-reason">
                  <h4>AI Reasoning</h4>
                  <pre>{selected.reasoning}</pre>
                </div>

                <div className="notes">
                  <h4>Notes</h4>
                  <div className="notes-list">
                    {(selected.notes || []).map((n, idx) => (
                      <div key={idx} className="note">
                        <div className="note-meta">{new Date(n.at).toLocaleString()}</div>
                        <div>{n.text}</div>
                      </div>
                    ))}
                  </div>

                  <div className="add-note">
                    <input placeholder="Add note..." value={noteText} onChange={(e) => setNoteText(e.target.value)} />
                    <button className="btn" onClick={() => addNote(selected.id, noteText)}>Add</button>
                  </div>
                </div>

                <div className="delete-row">
                  <button className="link danger" onClick={() => { if (confirm("Delete alert?")) removeAlert(selected.id); }}>Delete Alert</button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="detail-empty">Select an alert to see details</div>
        )}
      </div>
    </div>
  );
}
