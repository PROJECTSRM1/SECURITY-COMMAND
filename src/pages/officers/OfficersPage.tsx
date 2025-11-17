import { useEffect, useMemo, useState } from "react";
import "./OfficersPage.css";

type Officer = {
  id: string;
  name: string;
  badge?: string;
  phone?: string;
  position?: string;
  imei?: string;
  active: boolean;
  lastSeen: string; // ISO timestamp
  notes?: string;
};

const LS_KEY = "rjb_officers_v1";
const SETTINGS_LS = "rjb_settings_v1";

function nowIso() {
  return new Date().toISOString();
}

/* local persistence helpers */
function loadOfficersLocal(): Officer[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Officer[];
  } catch {
    return [];
  }
}
function saveOfficersLocal(list: Officer[]) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(list));
  } catch (e) {
    console.error("Save officers error", e);
  }
}

/* read escalate minutes from settings (fallback default) */
function loadEscalateHours(): number {
  try {
    const raw = localStorage.getItem(SETTINGS_LS);
    if (!raw) return 1; // default 1 hour
    const parsed = JSON.parse(raw);
    return parsed?.officerTracking?.escalateIfOfflineHours ?? 1;
  } catch {
    return 1;
  }
}

/* utility: generate a local id */
function createLocalId() {
  return "local-" + Math.random().toString(36).slice(2, 9);
}

export default function OfficersPage() {
  const [officers, setOfficers] = useState<Officer[]>(() => loadOfficersLocal());
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "online" | "offline">("all");
  const [editing, setEditing] = useState<Officer | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedView, setSelectedView] = useState<Officer | null>(null);
  const [loading, setLoading] = useState(false);
  const [nowTick, setNowTick] = useState(Date.now());
  const escalateIfOfflineHours = useMemo(() => loadEscalateHours(), [nowTick]);

  // for pure local mode we load from localStorage on mount
  useEffect(() => {
    setLoading(true);
    const local = loadOfficersLocal();
    setOfficers(local);
    setLoading(false);
  }, []);

  // persist whenever officers change
  useEffect(() => {
    saveOfficersLocal(officers);
  }, [officers]);

  // tick to update online/offline status
  useEffect(() => {
    const t = setInterval(() => setNowTick(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);

  // ---- FIXED: compare in HOURS, not minutes ----
  function isOnline(o: Officer) {
    const last = new Date(o.lastSeen).getTime();
    const diffHours = (Date.now() - last) / 1000 / 60 / 60; // hours
    return diffHours <= escalateIfOfflineHours;
  }

  const visible = officers.filter((o) => {
    const q = query.trim().toLowerCase();
    if (q && !(o.name.toLowerCase().includes(q) || (o.badge || "").toLowerCase().includes(q) || (o.phone || "").includes(q) || (o.position || "").toLowerCase().includes(q))) return false;
    if (filter === "online") return isOnline(o);
    if (filter === "offline") return !isOnline(o);
    return true;
  });

  function handleAddNew() {
    setEditing({
      id: "new",
      name: "",
      badge: "",
      phone: "",
      position: "",
      imei: "",
      active: true,
      lastSeen: nowIso(),
      notes: "",
    });
    setShowModal(true);
  }

  function handleEdit(off: Officer) {
    setEditing(off);
    setShowModal(true);
  }

  function handleSaveEdited(o: Officer) {
    // new
    if (o.id === "new") {
      const newOfficer: Officer = {
        ...o,
        id: createLocalId(),
        lastSeen: o.lastSeen || nowIso(),
      };
      setOfficers((s) => [newOfficer, ...s]);
      saveOfficersLocal([newOfficer, ...officers]);
      console.log("Created officer locally:", newOfficer);
    } else {
      // update existing
      setOfficers((s) => {
        const updated = s.map((it) => (it.id === o.id ? { ...it, ...o } : it));
        saveOfficersLocal(updated);
        return updated;
      });
      console.log("Updated officer locally:", o);
    }
    setShowModal(false);
    setEditing(null);
  }

  function handleDelete(id: string) {
    if (!confirm("Delete officer?")) return;
    const updated = officers.filter((x) => x.id !== id);
    setOfficers(updated);
    saveOfficersLocal(updated);
  }

  function handlePing(o: Officer) {
    const updated: Officer = { ...o, lastSeen: nowIso() };
    setOfficers((s) => {
      const newList = s.map((it) => (it.id === o.id ? updated : it));
      saveOfficersLocal(newList);
      return newList;
    });
    console.log("Ping — updated lastSeen locally for", o.id);
  }

  function exportCsv() {
    const headers = ["id", "name", "badge", "phone", "position", "imei", "active", "lastSeen", "notes"];
    const rows = [headers.join(",")].concat(
      officers.map((o) =>
        [
          o.id,
          `"${(o.name || "").replace(/"/g, '""')}"`,
          `"${(o.badge || "").replace(/"/g, '""')}"`,
          `"${(o.phone || "").replace(/"/g, '""')}"`,
          `"${(o.position || "").replace(/"/g, '""')}"`,
          `"${(o.imei || "").replace(/"/g, '""')}"`,
          o.active ? "1" : "0",
          o.lastSeen,
          `"${(o.notes || "").replace(/"/g, '""')}"`,
        ].join(",")
      )
    );
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rjb_officers_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    console.log("Exported CSV for officers.");
  }

  return (
    <div className="rjb-ops-page">
      <div className="rjb-ops-card">
        <div className="rjb-ops-row head">
          <h2>Officers</h2>

          <div className="rjb-ops-controls">
            <input
              className="rjb-ops-search"
              placeholder="Search by name, badge, position or phone..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search officers"
            />

            <select value={filter} onChange={(e) => setFilter(e.target.value as any)} aria-label="Filter officers">
              <option value="all">All</option>
              <option value="online">Online</option>
              <option value="offline">Offline</option>
            </select>

            <button className="rjb-ops-btn" onClick={handleAddNew}>Add Officer</button>
            <button className="rjb-ops-btn rjb-ops-btn-ghost" onClick={exportCsv}>Export CSV</button>
            
          </div>
        </div>

        <div className="rjb-ops-list">
          {loading ? (
            <div className="rjb-ops-empty">Loading officers...</div>
          ) : visible.length === 0 ? (
            <div className="rjb-ops-empty">No officers found.</div>
          ) : (
            visible.map((o) => {
              const online = isOnline(o);

              // compute a friendly 'last seen' label (minutes / hours / days)
              const diffMs = Date.now() - new Date(o.lastSeen).getTime();
              const lastAgoMin = Math.round(diffMs / 1000 / 60);
              let lastAgoLabel = "just now";
              if (lastAgoMin < 1) lastAgoLabel = "just now";
              else if (lastAgoMin < 60) lastAgoLabel = `${lastAgoMin} min ago`;
              else if (lastAgoMin < 60 * 24) lastAgoLabel = `${Math.round(lastAgoMin / 60)} hr ago`;
              else lastAgoLabel = `${Math.round(lastAgoMin / 1440)} day(s) ago`;

              return (
                <div key={o.id} className="rjb-ops-item">
                  <div className="rjb-ops-main">
                    <div className="rjb-ops-avatar">{(o.name || " — ").split(" ").map(n => n[0]).slice(0,2).join("")}</div>
                    <div className="rjb-ops-meta">
                      <div className="rjb-ops-name">{o.name} {o.badge ? <span className="rjb-ops-badge">{o.badge}</span> : null}</div>
                      <div className="rjb-ops-sub">Phone: {o.phone || "—"} • Position: {o.position || "—"}</div>
                      <div className="rjb-ops-sub">IMEI: {o.imei || "—"}</div>
                    </div>
                  </div>

                  <div className="rjb-ops-status">
                    <div className={`rjb-ops-dot ${online ? "online" : "offline"}`} title={online ? "Online" : "Offline"} />
                    <div className="rjb-ops-last">{online ? "Active" : lastAgoLabel}</div>
                  </div>

                  <div className="rjb-ops-actions">
                    <button className="rjb-ops-action" onClick={() => handlePing(o)} title="Ping (update last seen)">Ping</button>
                    <button className="rjb-ops-action" onClick={() => handleEdit(o)} title="Edit">Edit</button>
                    <button className="rjb-ops-action" onClick={() => setSelectedView(o)} title="View details">View</button>
                    <button className="rjb-ops-action rjb-ops-action-danger" onClick={() => handleDelete(o.id)} title="Delete">Delete</button>
                    <button className="rjb-ops-action" onClick={() => setOfficers(prev => prev.map(p => p.id === o.id ? { ...p, active: !p.active } : p))}>
                      {o.active ? "Deactivate" : "Activate"}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Edit / Add Modal */}
      {showModal && editing && (
        <OfficerModal
          officer={editing}
          onClose={() => { setShowModal(false); setEditing(null); }}
          onSave={(o) => handleSaveEdited(o)}
        />
      )}

      {/* Small viewer for selected officer */}
      {selectedView && (
        <div className="rjb-ops-overlay" onClick={() => setSelectedView(null)}>
          <div className="rjb-ops-map" onClick={(e) => e.stopPropagation()}>
            <h3>{selectedView.name} — {selectedView.badge}</h3>
            <div className="rjb-ops-map-area">
              <div><strong>Phone:</strong> {selectedView.phone || "—"}</div>
              <div><strong>Position:</strong> {selectedView.position || "—"}</div>
              <div><strong>IMEI:</strong> {selectedView.imei || "—"}</div>
              <div style={{ marginTop: 12 }}>This area can be used for more details later.</div>
            </div>

            <div style={{ marginTop: 12, textAlign: "right" }}>
              <button className="rjb-ops-btn" onClick={() => setSelectedView(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* Officer modal component (small, local to file) */
function OfficerModal({ officer, onClose, onSave }: { officer: Officer; onClose: () => void; onSave: (o: Officer) => void }) {
  const [local, setLocal] = useState<Officer>(officer);

  useEffect(() => setLocal(officer), [officer]);

  function setField<K extends keyof Officer>(k: K, v: Officer[K]) {
    setLocal((s) => ({ ...s, [k]: v }));
  }

  function save() {
    if (!local.name || local.name.trim() === "") {
      alert("Name is required");
      return;
    }
    const normalized: Officer = {
      ...local,
      name: local.name.trim(),
      lastSeen: local.lastSeen || nowIso(),
    };
    onSave(normalized);
  }

  return (
    <div className="rjb-ops-overlay" onClick={onClose}>
      <div className="rjb-ops-modal" onClick={(e) => e.stopPropagation()}>
        <h3>{officer.id === "new" ? "Add Officer" : "Edit Officer"}</h3>

        <label className="rjb-ops-label">Name</label>
        <input className="rjb-ops-input" value={local.name} onChange={(e) => setField("name", e.target.value)} />

        <label className="rjb-ops-label">Badge</label>
        <input className="rjb-ops-input" value={local.badge || ""} onChange={(e) => setField("badge", e.target.value)} />

        <label className="rjb-ops-label">Phone</label>
        <input className="rjb-ops-input" value={local.phone || ""} onChange={(e) => setField("phone", e.target.value)} />

        <label className="rjb-ops-label">Position</label>
        <input className="rjb-ops-input" value={local.position || ""} onChange={(e) => setField("position", e.target.value)} />

        <label className="rjb-ops-label">IMEI</label>
        <input className="rjb-ops-input" value={local.imei || ""} onChange={(e) => setField("imei", e.target.value)} />

        <label className="rjb-ops-label">Notes</label>
        <textarea className="rjb-ops-textarea" value={local.notes || ""} onChange={(e) => setField("notes", e.target.value)} />

        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 12 }}>
          <button className="rjb-ops-btn rjb-ops-btn-ghost" onClick={onClose}>Cancel</button>
          <button className="rjb-ops-btn" onClick={save}>{officer.id === "new" ? "Add" : "Save"}</button>
        </div>
      </div>
    </div>
  );
}
