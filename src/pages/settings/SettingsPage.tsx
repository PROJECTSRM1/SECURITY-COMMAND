import { useEffect,  useState } from "react";
import "./SettingsPage.css";
type Schema = {
  aiAlerts: {
    enabled: boolean;
    crowdThreshold: number;      // %
    crowdMinDuration: number;    // seconds
    vehicleConfidence: number;   // %
    personConfidence: number;    // %
  };
  officerTracking: {
    enabled: boolean;
    gpsIntervalSeconds: number;  // seconds
    escalateIfOfflineMinutes: number; // minutes
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
    console.error("Save error", e);
  }
}

export default function MinimalSettings(){
  const [settings, setSettings] = useState<Schema>(() => load());
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    setDirty(JSON.stringify(load()) !== JSON.stringify(settings));
  }, [settings]);

  function updateAi<K extends keyof Schema["aiAlerts"]>(k: K, v: Schema["aiAlerts"][K]) {
    setSettings((s) => ({ ...s, aiAlerts: { ...s.aiAlerts, [k]: v } }));
  }
  function updateOfficer<K extends keyof Schema["officerTracking"]>(k: K, v: Schema["officerTracking"][K]) {
    setSettings((s) => ({ ...s, officerTracking: { ...s.officerTracking, [k]: v } }));
  }

  function onSave() {
    save(settings);
    setDirty(false);
    // small UI feedback
    const el = document.createElement("div");
    el.className = "rjb-ms-toast";
    el.textContent = "Settings saved";
    document.body.appendChild(el);
    setTimeout(() => el.classList.add("rjb-ms-toast-visible"), 10);
    setTimeout(() => { el.classList.remove("rjb-ms-toast-visible"); setTimeout(() => el.remove(), 200); }, 1400);
  }

  function onReset() {
    if (!confirm("Reset to defaults?")) return;
    setSettings(DEFAULT);
    save(DEFAULT);
    setDirty(false);
  }

  return (
    <div className="rjb-ms-page">
      <div className="rjb-ms-card">
        <div className="rjb-ms-row header">
          <h1 className="rjb-ms-title">Settings</h1>
          <div className="rjb-ms-sub">Minimal — AI Alerts & Officer Tracking</div>
        </div>

        <section className="rjb-ms-section">
          <div className="rjb-ms-section-head">AI Alerts</div>

          <div className="rjb-ms-field">
            <label>Enable AI Alerts</label>
            <input type="checkbox" checked={settings.aiAlerts.enabled} onChange={(e) => updateAi("enabled", e.target.checked)} />
          </div>

          <div className="rjb-ms-field">
            <label>Crowd global threshold (%)</label>
            <input type="number" min={0} max={100} value={settings.aiAlerts.crowdThreshold} onChange={(e) => updateAi("crowdThreshold", Number(e.target.value))} />
          </div>

          <div className="rjb-ms-field">
            <label>Crowd min duration (s)</label>
            <input type="number" min={0} value={settings.aiAlerts.crowdMinDuration} onChange={(e) => updateAi("crowdMinDuration", Number(e.target.value))} />
          </div>

          <div className="rjb-ms-field">
            <label>Vehicle confidence threshold (%)</label>
            <input type="number" min={0} max={100} value={settings.aiAlerts.vehicleConfidence} onChange={(e) => updateAi("vehicleConfidence", Number(e.target.value))} />
          </div>

          <div className="rjb-ms-field">
            <label>Suspicious person confidence (%)</label>
            <input type="number" min={0} max={100} value={settings.aiAlerts.personConfidence} onChange={(e) => updateAi("personConfidence", Number(e.target.value))} />
          </div>
        </section>

        <section className="rjb-ms-section">
          <div className="rjb-ms-section-head">Officer Tracking</div>

          <div className="rjb-ms-field">
            <label>Enable Officer Tracking</label>
            <input type="checkbox" checked={settings.officerTracking.enabled} onChange={(e) => updateOfficer("enabled", e.target.checked)} />
          </div>

          <div className="rjb-ms-field">
            <label>GPS update interval (s)</label>
            <input type="number" min={5} value={settings.officerTracking.gpsIntervalSeconds} onChange={(e) => updateOfficer("gpsIntervalSeconds", Number(e.target.value))} />
          </div>

          <div className="rjb-ms-field">
            <label>Escalate if offline (minutes)</label>
            <input type="number" min={1} value={settings.officerTracking.escalateIfOfflineMinutes} onChange={(e) => updateOfficer("escalateIfOfflineMinutes", Number(e.target.value))} />
          </div>
        </section>

        <div className="rjb-ms-actions">
          <button className="rjb-ms-btn rjb-ms-btn-ghost" onClick={onReset}>Reset</button>
          <button className="rjb-ms-btn rjb-ms-btn-primary" onClick={onSave} disabled={!dirty}>Save</button>
        </div>

        <div className="rjb-ms-foot">Local key: <code>{LS_KEY}</code></div>
      </div>
    </div>
  );
};

