// import { useEffect,  useState } from "react";
// import "./SettingsPage.css";
// type Schema = {
//   aiAlerts: {
//     enabled: boolean;
//     crowdThreshold: number;      // %
//     crowdMinDuration: number;    // seconds
//     vehicleConfidence: number;   // %
//     personConfidence: number;    // %
//   };
//   officerTracking: {
//     enabled: boolean;
//     gpsIntervalSeconds: number;  // seconds
//     escalateIfOfflineMinutes: number; // minutes
//   };
// };

// const LS_KEY = "rjb_settings_v1";

// const DEFAULT: Schema = {
//   aiAlerts: {
//     enabled: true,
//     crowdThreshold: 75,
//     crowdMinDuration: 30,
//     vehicleConfidence: 85,
//     personConfidence: 70,
//   },
//   officerTracking: {
//     enabled: true,
//     gpsIntervalSeconds: 15,
//     escalateIfOfflineMinutes: 10,
//   },
// };

// function load(): Schema {
//   try {
//     const raw = localStorage.getItem(LS_KEY);
//     if (!raw) return DEFAULT;
//     const parsed = JSON.parse(raw);
//     return {
//       aiAlerts: { ...DEFAULT.aiAlerts, ...(parsed?.aiAlerts || {}) },
//       officerTracking: { ...DEFAULT.officerTracking, ...(parsed?.officerTracking || {}) },
//     };
//   } catch {
//     return DEFAULT;
//   }
// }

// function save(obj: Schema) {
//   try {
//     localStorage.setItem(LS_KEY, JSON.stringify(obj));
//   } catch (e) {
//     console.error("Save error", e);
//   }
// }

// export default function MinimalSettings(){
//   const [settings, setSettings] = useState<Schema>(() => load());
//   const [dirty, setDirty] = useState(false);

//   useEffect(() => {
//     setDirty(JSON.stringify(load()) !== JSON.stringify(settings));
//   }, [settings]);

//   function updateAi<K extends keyof Schema["aiAlerts"]>(k: K, v: Schema["aiAlerts"][K]) {
//     setSettings((s) => ({ ...s, aiAlerts: { ...s.aiAlerts, [k]: v } }));
//   }
//   function updateOfficer<K extends keyof Schema["officerTracking"]>(k: K, v: Schema["officerTracking"][K]) {
//     setSettings((s) => ({ ...s, officerTracking: { ...s.officerTracking, [k]: v } }));
//   }

//   function onSave() {
//     save(settings);
//     setDirty(false);
//     // small UI feedback
//     const el = document.createElement("div");
//     el.className = "rjb-ms-toast";
//     el.textContent = "Settings saved";
//     document.body.appendChild(el);
//     setTimeout(() => el.classList.add("rjb-ms-toast-visible"), 10);
//     setTimeout(() => { el.classList.remove("rjb-ms-toast-visible"); setTimeout(() => el.remove(), 200); }, 1400);
//   }

//   function onReset() {
//     if (!confirm("Reset to defaults?")) return;
//     setSettings(DEFAULT);
//     save(DEFAULT);
//     setDirty(false);
//   }

//   return (
//     <div className="rjb-ms-page">
//       <div className="rjb-ms-card">
//         <div className="rjb-ms-row header">
//           <h1 className="rjb-ms-title">Settings</h1>
//           <div className="rjb-ms-sub">Minimal — AI Alerts & Officer Tracking</div>
//         </div>

//         <section className="rjb-ms-section">
//           <div className="rjb-ms-section-head">AI Alerts</div>

//           <div className="rjb-ms-field">
//             <label>Enable AI Alerts</label>
//             <input type="checkbox" checked={settings.aiAlerts.enabled} onChange={(e) => updateAi("enabled", e.target.checked)} />
//           </div>

//           <div className="rjb-ms-field">
//             <label>Crowd global threshold (%)</label>
//             <input type="number" min={0} max={100} value={settings.aiAlerts.crowdThreshold} onChange={(e) => updateAi("crowdThreshold", Number(e.target.value))} />
//           </div>

//           <div className="rjb-ms-field">
//             <label>Crowd min duration (s)</label>
//             <input type="number" min={0} value={settings.aiAlerts.crowdMinDuration} onChange={(e) => updateAi("crowdMinDuration", Number(e.target.value))} />
//           </div>

//           <div className="rjb-ms-field">
//             <label>Vehicle confidence threshold (%)</label>
//             <input type="number" min={0} max={100} value={settings.aiAlerts.vehicleConfidence} onChange={(e) => updateAi("vehicleConfidence", Number(e.target.value))} />
//           </div>

//           <div className="rjb-ms-field">
//             <label>Suspicious person confidence (%)</label>
//             <input type="number" min={0} max={100} value={settings.aiAlerts.personConfidence} onChange={(e) => updateAi("personConfidence", Number(e.target.value))} />
//           </div>
//         </section>

//         <section className="rjb-ms-section">
//           <div className="rjb-ms-section-head">Officer Tracking</div>

//           <div className="rjb-ms-field">
//             <label>Enable Officer Tracking</label>
//             <input type="checkbox" checked={settings.officerTracking.enabled} onChange={(e) => updateOfficer("enabled", e.target.checked)} />
//           </div>

//           <div className="rjb-ms-field">
//             <label>GPS update interval (s)</label>
//             <input type="number" min={5} value={settings.officerTracking.gpsIntervalSeconds} onChange={(e) => updateOfficer("gpsIntervalSeconds", Number(e.target.value))} />
//           </div>

//           <div className="rjb-ms-field">
//             <label>Escalate if offline (minutes)</label>
//             <input type="number" min={1} value={settings.officerTracking.escalateIfOfflineMinutes} onChange={(e) => updateOfficer("escalateIfOfflineMinutes", Number(e.target.value))} />
//           </div>
//         </section>

//         <div className="rjb-ms-actions">
//           <button className="rjb-ms-btn rjb-ms-btn-ghost" onClick={onReset}>Reset</button>
//           <button className="rjb-ms-btn rjb-ms-btn-primary" onClick={onSave} disabled={!dirty}>Save</button>
//         </div>

//         <div className="rjb-ms-foot">Local key: <code>{LS_KEY}</code></div>
//       </div>
//     </div>
//   );
// };
// MinimalSettings.tsx
import { useEffect, useRef, useState } from "react";
import "./SettingsPage.css";

type Schema = {
  aiAlerts: {
    enabled: boolean;
    crowdThreshold: number;      
    crowdMinDuration: number;    
    vehicleConfidence: number;   
    personConfidence: number;    
  };
  officerTracking: {
    enabled: boolean;
    gpsIntervalSeconds: number;  
    escalateIfOfflineMinutes: number; 
  };
};

const LS_KEY = "rjb_settings_v1";

const DEFAULT: Schema = {
  aiAlerts: {
    enabled: true,
    crowdThreshold: 75,
    crowdMinDuration: 30,
    vehicleConfidence: 85,
    personConfidence: 70,
  },
  officerTracking: {
    enabled: true,
    gpsIntervalSeconds: 15,
    escalateIfOfflineMinutes: 10,
  },
};

function load(): Schema {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return DEFAULT;
    const parsed = JSON.parse(raw);
    return {
      aiAlerts: { ...DEFAULT.aiAlerts, ...(parsed?.aiAlerts || {}) },
      officerTracking: { ...DEFAULT.officerTracking, ...(parsed?.officerTracking || {}) },
    };
  } catch {
    return DEFAULT;
  }
}

function save(obj: Schema) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(obj));
  } catch (e) {
    // keep console error for debugging but don't break UI
    // eslint-disable-next-line no-console
    console.error("Save error", e);
  }
}

/* Helper: parse safe number and clamp */
const safeNumber = (value: string | number, fallback = 0) => {
  if (typeof value === "number") return isNaN(value) ? fallback : value;
  if (value === "" || value == null) return fallback;
  const n = Number(value);
  return isNaN(n) ? fallback : n;
};
const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

export default function MinimalSettings() {
  // load once
  const initialSettings = useRef<Schema>(load());
  const [settings, setSettings] = useState<Schema>(initialSettings.current);
  const [dirty, setDirty] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    setDirty(JSON.stringify(initialSettings.current) !== JSON.stringify(settings));
  }, [settings]);

  /* autosave on unload (optional safety) */
  useEffect(() => {
    const onBefore = () => save(settings);
    window.addEventListener("beforeunload", onBefore);
    return () => window.removeEventListener("beforeunload", onBefore);
  }, [settings]);

  function updateAi<K extends keyof Schema["aiAlerts"]>(k: K, v: Schema["aiAlerts"][K]) {
    setSettings((s) => ({ ...s, aiAlerts: { ...s.aiAlerts, [k]: v } }));
  }
  function updateOfficer<K extends keyof Schema["officerTracking"]>(k: K, v: Schema["officerTracking"][K]) {
    setSettings((s) => ({ ...s, officerTracking: { ...s.officerTracking, [k]: v } }));
  }

  function onSave() {
    // minimal validation/clamps
    const s: Schema = {
      aiAlerts: {
        enabled: settings.aiAlerts.enabled,
        crowdThreshold: clamp(
          safeNumber(settings.aiAlerts.crowdThreshold, DEFAULT.aiAlerts.crowdThreshold),
          0,
          100
        ),
        crowdMinDuration: Math.max(0, safeNumber(settings.aiAlerts.crowdMinDuration, DEFAULT.aiAlerts.crowdMinDuration)),
        vehicleConfidence: clamp(
          safeNumber(settings.aiAlerts.vehicleConfidence, DEFAULT.aiAlerts.vehicleConfidence),
          0,
          100
        ),
        personConfidence: clamp(
          safeNumber(settings.aiAlerts.personConfidence, DEFAULT.aiAlerts.personConfidence),
          0,
          100
        ),
      },
      officerTracking: {
        enabled: settings.officerTracking.enabled,
        gpsIntervalSeconds: Math.max(1, safeNumber(settings.officerTracking.gpsIntervalSeconds, DEFAULT.officerTracking.gpsIntervalSeconds)),
        escalateIfOfflineMinutes: Math.max(1, safeNumber(settings.officerTracking.escalateIfOfflineMinutes, DEFAULT.officerTracking.escalateIfOfflineMinutes)),
      },
    };

    setSettings(s);
    save(s);
    initialSettings.current = s;
    setDirty(false);

    // small UI feedback (toast)
    const el = document.createElement("div");
    el.className = "rjb-ms-toast";
    el.textContent = "Settings saved";
    document.body.appendChild(el);
    // show then hide
    setTimeout(() => el.classList.add("rjb-ms-toast-visible"), 10);
    setTimeout(() => { el.classList.remove("rjb-ms-toast-visible"); setTimeout(() => el.remove(), 200); }, 1400);
  }

  function onReset() {
    if (!confirm("Reset to defaults?")) return;
    setSettings(DEFAULT);
    save(DEFAULT);
    initialSettings.current = DEFAULT;
    setDirty(false);
  }

  return (
    <div className="rjb-ms-page">
      <div className="rjb-ms-card" role="region" aria-label="Settings">
        <div className="rjb-ms-row header">
          <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
            <h1 className="rjb-ms-title">Settings</h1>
            <div className="rjb-ms-sub">Minimal — AI Alerts & Officer Tracking</div>
          </div>

          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div style={{ fontSize: 12, color: "#6b7280" }}>
              Local key: <code style={{ background: "#f3f4f6", padding: "2px 6px", borderRadius: 6 }}>{LS_KEY}</code>
            </div>
          </div>
        </div>

        <section className="rjb-ms-section" aria-labelledby="ai-alerts-heading">
          <div className="rjb-ms-section-head" id="ai-alerts-heading">AI Alerts</div>

          <div className="rjb-ms-field">
            <label htmlFor="ai-enabled">Enable AI Alerts</label>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
              <label className="rjb-checkbox-label">
                <input
                  id="ai-enabled"
                  type="checkbox"
                  checked={settings.aiAlerts.enabled}
                  onChange={(e) => updateAi("enabled", e.target.checked)}
                />
              </label>
            </div>
          </div>

          <div className="rjb-ms-field">
            <label htmlFor="crowdThreshold">Crowd global threshold (%)</label>
            <input
              id="crowdThreshold"
              type="number"
              min={0}
              max={100}
              value={settings.aiAlerts.crowdThreshold}
              onChange={(e) => updateAi("crowdThreshold", clamp(safeNumber(e.target.value, 0), 0, 100))}
              disabled={!settings.aiAlerts.enabled}
              aria-disabled={!settings.aiAlerts.enabled}
            />
          </div>

          <div className="rjb-ms-field">
            <label htmlFor="crowdDuration">Crowd min duration (s)</label>
            <input
              id="crowdDuration"
              type="number"
              min={0}
              value={settings.aiAlerts.crowdMinDuration}
              onChange={(e) => updateAi("crowdMinDuration", Math.max(0, safeNumber(e.target.value, 0)))}
              disabled={!settings.aiAlerts.enabled}
              aria-disabled={!settings.aiAlerts.enabled}
            />
          </div>

          <div className="rjb-ms-field">
            <label htmlFor="vehicleConf">Vehicle confidence threshold (%)</label>
            <input
              id="vehicleConf"
              type="number"
              min={0}
              max={100}
              value={settings.aiAlerts.vehicleConfidence}
              onChange={(e) => updateAi("vehicleConfidence", clamp(safeNumber(e.target.value, 0), 0, 100))}
              disabled={!settings.aiAlerts.enabled}
              aria-disabled={!settings.aiAlerts.enabled}
            />
          </div>

          <div className="rjb-ms-field">
            <label htmlFor="personConf">Suspicious person confidence (%)</label>
            <input
              id="personConf"
              type="number"
              min={0}
              max={100}
              value={settings.aiAlerts.personConfidence}
              onChange={(e) => updateAi("personConfidence", clamp(safeNumber(e.target.value, 0), 0, 100))}
              disabled={!settings.aiAlerts.enabled}
              aria-disabled={!settings.aiAlerts.enabled}
            />
          </div>
        </section>

        <section className="rjb-ms-section" aria-labelledby="officer-tracking-heading">
          <div className="rjb-ms-section-head" id="officer-tracking-heading">Officer Tracking</div>

          <div className="rjb-ms-field">
            <label htmlFor="officer-enabled">Enable Officer Tracking</label>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
              <label className="rjb-checkbox-label">
                <input
                  id="officer-enabled"
                  type="checkbox"
                  checked={settings.officerTracking.enabled}
                  onChange={(e) => updateOfficer("enabled", e.target.checked)}
                />
              </label>
            </div>
          </div>

          <div className="rjb-ms-field">
            <label htmlFor="gpsInterval">GPS update interval (s)</label>
            <input
              id="gpsInterval"
              type="number"
              min={5}
              value={settings.officerTracking.gpsIntervalSeconds}
              onChange={(e) => updateOfficer("gpsIntervalSeconds", Math.max(1, safeNumber(e.target.value, 5)))}
              disabled={!settings.officerTracking.enabled}
              aria-disabled={!settings.officerTracking.enabled}
            />
          </div>

          <div className="rjb-ms-field">
            <label htmlFor="escalateIfOffline">Escalate if offline (minutes)</label>
            <input
              id="escalateIfOffline"
              type="number"
              min={1}
              value={settings.officerTracking.escalateIfOfflineMinutes}
              onChange={(e) => updateOfficer("escalateIfOfflineMinutes", Math.max(1, safeNumber(e.target.value, 1)))}
              disabled={!settings.officerTracking.enabled}
              aria-disabled={!settings.officerTracking.enabled}
            />
          </div>
        </section>

        <div className="rjb-ms-actions">
          <button className="rjb-ms-btn rjb-ms-btn-ghost" onClick={onReset}>Reset</button>

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              className="rjb-help-btn rjb-ms-btn"
              onClick={() => setShowHelp(true)}
              aria-label="Open help"
            >
              Help
            </button>

            <button
              className="rjb-ms-btn rjb-ms-btn-primary"
              onClick={onSave}
              disabled={!dirty}
            >
              Save
            </button>
          </div>
        </div>
      </div>

      {/* Help Modal */}
      {showHelp && (
        <div
          className="rjb-help-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Settings help"
          onClick={() => setShowHelp(false)}
        >
          <div className="rjb-help-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Settings Help Guide</h2>

            <div className="rjb-help-section">
              <h3>AI Alerts</h3>

              <p><strong>Enable AI Alerts</strong><br />
              Turns the AI alert system on or off. If disabled, the system will not generate any alerts.</p>

              <p><strong>Crowd Global Threshold (%)</strong><br />
              Percentage of camera area occupied by people before declaring a crowd alert. Higher → fewer alerts, Lower → more sensitive.</p>

              <p><strong>Crowd Minimum Duration (seconds)</strong><br />
              How long the crowd must stay above the threshold before an alert is triggered. Prevents short/false positives.</p>

              <p><strong>Vehicle Confidence Threshold (%)</strong><br />
              Minimum AI confidence required to report a vehicle detection.</p>

              <p><strong>Suspicious Person Confidence (%)</strong><br />
              Minimum AI confidence required to report a suspicious person detection.</p>
            </div>

            <div className="rjb-help-section">
              <h3>Officer Tracking</h3>

              <p><strong>Enable Officer Tracking</strong><br />
              Enables GPS tracking for officers on duty. If off, no location updates are monitored.</p>

              <p><strong>GPS Update Interval (seconds)</strong><br />
              Frequency at which an officer's device sends location updates. Lower = more realtime but higher battery/network usage.</p>

              <p><strong>Escalate if Offline (minutes)</strong><br />
              If an officer does not send GPS data for this duration, the system will raise an escalation alert.</p>
            </div>

            <button className="rjb-help-close" onClick={() => setShowHelp(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
