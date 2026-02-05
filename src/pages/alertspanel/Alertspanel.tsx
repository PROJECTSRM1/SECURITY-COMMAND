
import { useEffect, useMemo, useRef, useState } from "react";
// import "./AlertsPanel.css";

// import snap1 from "../../assets/susp1.webp";
// import snap2 from "../../assets/susp2.webp";
// import snap3 from "../../assets/susp3.webp";
// import snap4 from "../../assets/susp4.webp";
// import snap5 from "../../assets/susp5.webp";
// import snap6 from "../../assets/susp6.webp";

/* ---------- Default Alert Snapshots ---------- */

const SNAPSHOT_BY_TYPE: Record<string, string> = {
  intrusion: "https://tse1.mm.bing.net/th/id/OIP.XVwIKo_qikYHxROdUz0TIAHaEm?w=850&h=528&rs=1&pid=ImgDetMain&o=7&rm=3",

  motion: "https://www.mdpi.com/electronics/electronics-10-02974/article_deploy/html/images/electronics-10-02974-g003.png",

  suspicious:
    "https://www.researchgate.net/publication/363857453/figure/fig1/AS:11431281128945338@1679454722658/Challenges-in-crowd-counting-tasks-The-red-boxes-are-heads-of-different-scales-and-the_Q320.jpg"
};


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

// const SNAP_SAMPLES = [snap1, snap2, snap3, snap4, snap5, snap6];
function getSnapshotByType(alert: AlertRecord) {

  const text = `${alert.title} ${alert.type}`.toLowerCase();

  if (text.includes("intrusion"))
    return SNAPSHOT_BY_TYPE.intrusion;

  if (text.includes("motion"))
    return SNAPSHOT_BY_TYPE.motion;

  if (text.includes("suspicious"))
    return SNAPSHOT_BY_TYPE.suspicious;

  return SNAPSHOT_BY_TYPE.motion;
}



/* ---------- Helpers ---------- */
function nowIso() {
  return new Date().toISOString();
}

/* defensive loader */
function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_LS);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/* ---------- Stronger snapshot mapper ---------- */
function mapSnapshotUrl(url?: string | null) {
  if (!url) return null;

  try {
    const asStr = String(url).trim();

    // if it's already an absolute URL (http(s): or data:) just return it
    if (/^(data:|https?:\/\/)/i.test(asStr)) return asStr;

    // As a last-ditch, if the stored value looks like '/assets/susp1.webp', try prefixing with location.origin + that path
    if (asStr.startsWith("/")) {
      const tryUrl = window.location.origin + asStr;
      return tryUrl;
    }

    return null;
  } catch {
    return null;
  }
}

/* ---------- Load & map stored alerts helper ---------- */
function loadAndMapStoredAlerts(): AlertRecord[] {
  try {
    const raw = localStorage.getItem(LS);
    const list: AlertRecord[] = raw ? JSON.parse(raw) : [];
    const mapped = list.map((a) => {
      const mappedSnap = mapSnapshotUrl(a.source?.snapshotDataUrl as any) ?? a.source?.snapshotDataUrl ?? null;
      return { ...a, source: { ...a.source, snapshotDataUrl: mappedSnap } };
    });
    return mapped;
  } catch {
    return [];
  }
}

/* ---------- Component ---------- */
export default function AlertsPanel() {
  // load alerts from localStorage initially (mapped)
  const [alerts, setAlerts] = useState<AlertRecord[]>(() => loadAndMapStoredAlerts());

  const [, setSettings] = useState<any>(() => loadSettings());

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<{ severity: "all" | Severity; status: "all" | Status; q: string }>({
    severity: "all",
    status: "all",
    q: "",
  });
  const [noteText, setNoteText] = useState<string>("");

  // track incoming alert IDs to avoid duplicates
  const receivedIdsRef = useRef<Set<string>>(new Set(alerts.map((a) => a.id)));

  // persist alerts whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(LS, JSON.stringify(alerts));
    } catch (err) {
      // ignore
    }
    // keep received IDs in sync
    receivedIdsRef.current = new Set(alerts.map((a) => a.id));
  }, [alerts]);

  /* ---------- NEW: refs to list items so we can scroll selected into view ---------- */
  const itemRefs = useRef<Map<string, HTMLDivElement | null>>(new Map());
  // optional: ref to the whole list container (if you want to scroll container)
  const listContainerRef = useRef<HTMLDivElement | null>(null);
  // optional: ref to detail panel (if you want to scroll that into view on mobile)
  const detailRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onNewAlert(e: Event) {
      const detail = (e as CustomEvent).detail;
      if (!detail || !detail.id) return;
      const incoming: AlertRecord = detail;

      // map snapshot if needed
      const mappedSnapshot = mapSnapshotUrl(incoming.source?.snapshotDataUrl as any);

      // prevent duplicates
      if (receivedIdsRef.current.has(incoming.id)) return;

      const normalized: AlertRecord = {
        ...incoming,
        source: { ...incoming.source, snapshotDataUrl: mappedSnapshot ?? incoming.source?.snapshotDataUrl ?? null },
      };

      // add to top
      setAlerts((s) => {
        const next = [normalized, ...s].slice(0, 200);
        return next;
      });
    }

    function onStorage(e: StorageEvent) {
      if (e.key === LS) {
        try {
          const raw = localStorage.getItem(LS);
          const list: AlertRecord[] = raw ? JSON.parse(raw) : [];
          const mapped = list.map((a) => ({
            ...a,
            source: {
              ...a.source,
              snapshotDataUrl: mapSnapshotUrl(a.source?.snapshotDataUrl as any) ?? a.source?.snapshotDataUrl ?? null,
            },
          }));
          setAlerts(mapped);
        } catch {
          // ignore
        }
      }

      if (e.key === SETTINGS_LS) {
        const s = loadSettings();
        setSettings(s);
      }
    }

    window.addEventListener("rjb:new-alert", onNewAlert as EventListener);
    window.addEventListener("storage", onStorage as EventListener);

    return () => {
      window.removeEventListener("rjb:new-alert", onNewAlert as EventListener);
      window.removeEventListener("storage", onStorage as EventListener);
    };
  }, []);

  /* ---------- RUN whenever alerts change: fill missing snapshots with random sample ---------- */
  useEffect(() => {
    if (!alerts || alerts.length === 0) return;
    const missing = alerts.filter((a) => !a.source?.snapshotDataUrl);
    if (missing.length === 0) return;

    setAlerts((prev) =>
      prev.map((a) => {
        if (a.source?.snapshotDataUrl) return a;
        // const snap = SNAP_SAMPLES[Math.floor(Math.random() * SNAP_SAMPLES.length)];
        const snap = getSnapshotByType(a);


        return { ...a, source: { ...a.source, snapshotDataUrl: snap } };
      })
    );
  }, [alerts]);

  /* ---------- Debug: show snapshotDataUrl samples in console (remove when happy) ---------- */
  useEffect(() => {
    try {
      console.group("[Alerts Debug] snapshotDataUrl check");
      console.log("total alerts:", alerts.length);
      const samples = alerts.slice(0, 12).map((a) => ({ id: a.id, src: a.source?.snapshotDataUrl }));
      console.table(samples);
      const nullCount = alerts.filter((a) => !a.source?.snapshotDataUrl).length;
      console.log("missing snapshotDataUrl:", nullCount);
      console.groupEnd();
    } catch {
      // ignore
    }
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

  /* ---------- Filtering ---------- */
  const filtered = useMemo(() => {
    return alerts.filter((a) => {
      if (filter.severity !== "all" && a.severity !== filter.severity) return false;
      if (filter.status !== "all" && a.status !== filter.status) return false;
      if (
        filter.q &&
        !(`${a.title} ${a.type} ${a.source.name} ${a.source.location}`.toLowerCase().includes(filter.q.toLowerCase()))
      )
        return false;
      return true;
    });
  }, [alerts, filter]);

  const selected = alerts.find((a) => a.id === selectedId) ?? null;

  const assignResolveRef = useRef<((v: string | null) => void) | null>(null);
  const [assignPromptOpen, setAssignPromptOpen] = useState(false);
  const [assignPromptValue, setAssignPromptValue] = useState("");
  const [assignPromptMessage, setAssignPromptMessage] = useState<string | undefined>(undefined);

  function promptAssign(message?: string, defaultValue?: string): Promise<string | null> {
    setAssignPromptMessage(message);
    setAssignPromptValue(defaultValue ?? "");
    setAssignPromptOpen(true);
    return new Promise((res) => {
      assignResolveRef.current = res;
    });
  }

  function closeAssignPrompt(result: string | null) {
    const r = assignResolveRef.current;
    assignResolveRef.current = null;
    setAssignPromptOpen(false);
    setAssignPromptValue("");
    setAssignPromptMessage(undefined);
    if (r) r(result);
  }

  /* ---------- NEW: scroll selected into view on mobile ---------- */
  useEffect(() => {
    if (!selectedId) return;

    // Mobile only
    if (window.innerWidth > 768) return;

    // Scroll to the TOP of the detail card only
    const detailCard = document.querySelector(".rjb-detail-card");

    if (detailCard) {
      detailCard.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [selectedId]);

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

        <div className="rjb-alerts-list-body" ref={listContainerRef}>
          {filtered.length === 0 && <div className="rjb-empty">No alerts — waiting for events...</div>}

          {filtered.map((a) => (
            <div
              key={a.id}
              // ---------- NOTE: set a ref for each item so we can scroll to it ----------
              ref={(el) => {
                // keep map in sync; set null if element unmounted
                itemRefs.current.set(a.id, el);
              }}
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
                <button
                  className="rjb-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    updateAlert(a.id, { status: "triaged" });
                  }}
                >
                  Acknowledge
                </button>

                <button
                  className="rjb-btn"
                  onClick={async (e) => {
                    e.stopPropagation();
                    const name = (await promptAssign("Assign to (enter name):", a.assignedTo || "")) || "";
                    if (name) updateAlert(a.id, { assignedTo: name, status: "in_progress" });
                  }}
                >
                  Assign
                </button>

                <button
                  className="rjb-btn"
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

      <div className="rjb-alerts-detail" /* optional ref to scroll detail into view */ ref={detailRef}>
        {selected ? (
          <div className="rjb-detail-card">
            <div className="rjb-detail-header rjb-detail-header-flex">
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
                  <img
  src={selected.source.snapshotDataUrl || getSnapshotByType(selected)}
  alt="snapshot"
  onError={(e) => {
    const img = e.currentTarget as HTMLImageElement;
    img.src = getSnapshotByType(selected);
  }}
/>

                ) : (
                  <div className="rjb-media-empty">No snapshot</div>
                )}
              </div>

              <div className="rjb-meta-actions">
                <p><strong>Type:</strong> {selected.type}</p>
                <p><strong>Assigned to:</strong> {selected.assignedTo ?? "—"}</p>

                <div className="rjb-action-row">
                  <button className="rjb-btn primary" onClick={() => updateAlert(selected.id, { status: "triaged" })}>Acknowledge</button>

                  {/* Assign inside detail also uses promptAssign */}
                  <button
                    className="rjb-btn"
                    onClick={async () => {
                      const name = (await promptAssign("Assign to (enter name):", selected.assignedTo || "")) || "";
                      if (name) updateAlert(selected.id, { assignedTo: name, status: "in_progress" });
                    }}
                  >
                    Assign
                  </button>

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

      {/* ---------- In-component assign modal markup ---------- */}
      {assignPromptOpen && (
        <div className="rjb-assign-backdrop" onClick={() => closeAssignPrompt(null)}>
          <div className="rjb-assign-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Assign">
            <div className="rjb-assign-title">{assignPromptMessage ?? "Assign to (enter name):"}</div>

            <div className="rjb-assign-center">
              <input
                className="rjb-assign-input"
                value={assignPromptValue}
                onChange={(e) => setAssignPromptValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") closeAssignPrompt(assignPromptValue.trim() === "" ? null : assignPromptValue.trim());
                  if (e.key === "Escape") closeAssignPrompt(null);
                }}
                placeholder="Enter name..."
                autoFocus
              />
            </div>

            <div className="rjb-assign-actions">
              <button className="rjb-assign-btn rjb-assign-cancel" onClick={() => closeAssignPrompt(null)}>Cancel</button>
              <button className="rjb-assign-btn rjb-assign-ok" onClick={() => closeAssignPrompt(assignPromptValue.trim() === "" ? null : assignPromptValue.trim())}>OK</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
