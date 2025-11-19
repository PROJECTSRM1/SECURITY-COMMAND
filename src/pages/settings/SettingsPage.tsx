
import { useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { toggleTheme } from "../../app/features/theme/themeSlice";
// import "./SettingsPage.css";

type Schema = {
  aiAlerts: {
    enabled: boolean;
    crowdThreshold: number;
    crowdMinDuration: number;
    vehicleConfidence: number;
    personConfidence: number;
    toastNotifications: boolean;
  };
  officerTracking: {
    enabled: boolean;
    gpsIntervalSeconds: number;
    escalateIfOfflineMinutes: number;
  };
  themeDark?: boolean;
};

const LS_KEY = "rjb_settings_v1";

const DEFAULT: Schema = {
  aiAlerts: {
    enabled: true,
    crowdThreshold: 75,
    crowdMinDuration: 30,
    vehicleConfidence: 85,
    personConfidence: 70,
    toastNotifications: true,
  },
  officerTracking: {
    enabled: true,
    gpsIntervalSeconds: 15,
    escalateIfOfflineMinutes: 10,
  },
  themeDark: false,
};

function load(): Schema {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return DEFAULT;
    const parsed = JSON.parse(raw);
    return {
      aiAlerts: { ...DEFAULT.aiAlerts, ...(parsed?.aiAlerts || {}) },
      officerTracking: { ...DEFAULT.officerTracking, ...(parsed?.officerTracking || {}) },
      themeDark: typeof parsed?.themeDark === "boolean" ? parsed.themeDark : DEFAULT.themeDark,
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

const safeNumber = (v: any, fallback = 0) => {
  const n = Number(v);
  return isNaN(n) ? fallback : n;
};

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

export default function MinimalSettings() {
  const dispatch = useAppDispatch();
  const reduxDark = useAppSelector((s) => (s as any).theme?.dark ?? false);

  const initialSettings = useRef<Schema>(load());
  const [settings, setSettings] = useState<Schema>(initialSettings.current);
  const [dirty, setDirty] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    setDirty(JSON.stringify(initialSettings.current) !== JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    const onBefore = () => save(settings);
    window.addEventListener("beforeunload", onBefore);
    return () => window.removeEventListener("beforeunload", onBefore);
  }, [settings]);

  /* On mount: ensure Redux theme matches stored settings (runs once) */
  useEffect(() => {
    if (typeof initialSettings.current.themeDark === "boolean" && initialSettings.current.themeDark !== reduxDark) {
      dispatch(toggleTheme());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function updateAi<K extends keyof Schema["aiAlerts"]>(k: K, v: any) {
    setSettings((s) => ({ ...s, aiAlerts: { ...s.aiAlerts, [k]: v } }));
  }

  function updateOfficer<K extends keyof Schema["officerTracking"]>(k: K, v: any) {
    setSettings((s) => ({ ...s, officerTracking: { ...s.officerTracking, [k]: v } }));
  }

  function onSave() {
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
        toastNotifications: settings.aiAlerts.toastNotifications ?? DEFAULT.aiAlerts.toastNotifications,
      },
      officerTracking: {
        enabled: settings.officerTracking.enabled,
        gpsIntervalSeconds: Math.max(1, safeNumber(settings.officerTracking.gpsIntervalSeconds, DEFAULT.officerTracking.gpsIntervalSeconds)),
        escalateIfOfflineMinutes: Math.max(1, safeNumber(settings.officerTracking.escalateIfOfflineMinutes, DEFAULT.officerTracking.escalateIfOfflineMinutes)),
      },
      themeDark: settings.themeDark ?? DEFAULT.themeDark,
    };

    setSettings(s);
    save(s);
    initialSettings.current = s;
    setDirty(false);

    // small UI feedback (toast-like)
    const el = document.createElement("div");
    el.className = "rjb-ms-toast";
    el.textContent = "Settings saved";
    document.body.appendChild(el);
    setTimeout(() => el.classList.add("rjb-ms-toast-visible"), 10);
    setTimeout(() => {
      el.classList.remove("rjb-ms-toast-visible");
      setTimeout(() => el.remove(), 200);
    }, 1400);

    // final sync: ensure redux matches saved preference
    if ((s.themeDark ?? DEFAULT.themeDark) !== reduxDark) {
      dispatch(toggleTheme());
    }
  }

  function onReset() {
    if (!confirm("Reset to defaults?")) return;
    setSettings(DEFAULT);
    save(DEFAULT);
    initialSettings.current = DEFAULT;
    setDirty(false);

    if ((DEFAULT.themeDark ?? false) !== reduxDark) {
      dispatch(toggleTheme());
    }
  }

  return (
    <div className="rjb-ms-page">
      <div className="rjb-ms-card" role="region" aria-label="Settings">
        <div className="rjb-ms-row header">
          <div>
            <h1 className="rjb-ms-title">Settings</h1>
            <div className="rjb-ms-sub">Minimal — AI Alerts & Officer Tracking</div>
          </div>

          <div className="rjb-ms-sub">
            Local key: <code>{LS_KEY}</code>
          </div>
        </div>

        {/* AI ALERTS */}
        <section className="rjb-ms-section" aria-labelledby="ai-alerts-heading">
          <div className="rjb-ms-section-head" id="ai-alerts-heading">AI Alerts</div>

          <div className="rjb-ms-field">
            <label htmlFor="ai-enabled">Enable AI Alerts</label>
            <label className="rjb-checkbox-label">
              <input
                id="ai-enabled"
                type="checkbox"
                checked={settings.aiAlerts.enabled}
                onChange={(e) => updateAi("enabled", e.target.checked)}
              />
            </label>
          </div>

          <div className="rjb-ms-field">
            <label htmlFor="toastToggle">Enable Toast Notifications</label>
            <label className="rjb-checkbox-label">
              <input
                id="toastToggle"
                type="checkbox"
                checked={settings.aiAlerts.toastNotifications}
                disabled={!settings.aiAlerts.enabled}
                onChange={(e) => updateAi("toastNotifications", e.target.checked)}
              />
            </label>
          </div>

          <div className="rjb-ms-field">
            <label htmlFor="crowdThreshold">Crowd global threshold (%)</label>
            <input
              id="crowdThreshold"
              type="number"
              min={0}
              max={100}
              value={settings.aiAlerts.crowdThreshold}
              disabled={!settings.aiAlerts.enabled}
              onChange={(e) => updateAi("crowdThreshold", clamp(safeNumber(e.target.value, 0), 0, 100))}
            />
          </div>

          <div className="rjb-ms-field">
            <label htmlFor="crowdDuration">Crowd min duration (s)</label>
            <input
              id="crowdDuration"
              type="number"
              min={0}
              value={settings.aiAlerts.crowdMinDuration}
              disabled={!settings.aiAlerts.enabled}
              onChange={(e) => updateAi("crowdMinDuration", Math.max(0, safeNumber(e.target.value, 0)))}
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
              disabled={!settings.aiAlerts.enabled}
              onChange={(e) => updateAi("vehicleConfidence", clamp(safeNumber(e.target.value, 0), 0, 100))}
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
              disabled={!settings.aiAlerts.enabled}
              onChange={(e) => updateAi("personConfidence", clamp(safeNumber(e.target.value, 0), 0, 100))}
            />
          </div>
        </section>

        {/* OFFICER TRACKING */}
        <section className="rjb-ms-section" aria-labelledby="officer-tracking-heading">
          <div className="rjb-ms-section-head" id="officer-tracking-heading">Officer Tracking</div>

          <div className="rjb-ms-field">
            <label htmlFor="officer-enabled">Enable Officer Tracking</label>
            <label className="rjb-checkbox-label">
              <input
                id="officer-enabled"
                type="checkbox"
                checked={settings.officerTracking.enabled}
                onChange={(e) => updateOfficer("enabled", e.target.checked)}
              />
            </label>
          </div>

          <div className="rjb-ms-field">
            <label htmlFor="gpsInterval">GPS update interval (s)</label>
            <input
              id="gpsInterval"
              type="number"
              min={5}
              value={settings.officerTracking.gpsIntervalSeconds}
              disabled={!settings.officerTracking.enabled}
              onChange={(e) => updateOfficer("gpsIntervalSeconds", Math.max(1, safeNumber(e.target.value)))}
            />
          </div>

          <div className="rjb-ms-field">
            <label htmlFor="escalateIfOffline">Escalate if offline (minutes)</label>
            <input
              id="escalateIfOffline"
              type="number"
              min={1}
              value={settings.officerTracking.escalateIfOfflineMinutes}
              disabled={!settings.officerTracking.enabled}
              onChange={(e) => updateOfficer("escalateIfOfflineMinutes", Math.max(1, safeNumber(e.target.value)))}
            />
          </div>
        </section>

        {/* THEME SECTION */}
        <section className="rjb-ms-section" aria-labelledby="theme-heading">
          <div className="rjb-ms-section-head" id="theme-heading">Theme</div>

          <div className="rjb-ms-field">
            <label htmlFor="theme-dark-toggle">Dark Mode</label>
            <label className="rjb-checkbox-label">
              <input
                id="theme-dark-toggle"
                type="checkbox"
                checked={!!settings.themeDark}
                onChange={(e) => {
                  const v = e.target.checked;
                  setSettings((s) => ({ ...s, themeDark: v }));
                  // dispatch toggle immediately so App wrapper flips class
                  if (v !== reduxDark) dispatch(toggleTheme());
                }}
              />
            </label>
          </div>
        </section>

        {/* ACTIONS */}
        <div className="rjb-ms-actions">
          <button className="rjb-ms-btn rjb-ms-btn-ghost" onClick={onReset}>
            Reset
          </button>

          <button
            className="rjb-ms-btn rjb-ms-btn-primary"
            onClick={onSave}
            disabled={!dirty}
          >
            Save
          </button>

          <button
            className="rjb-help-btn"
            onClick={() => setShowHelp(true)}
          >
            Help
          </button>
        </div>
      </div>

      {showHelp && (
        <div
          className="rjb-help-overlay"
          role="dialog"
          aria-modal="true"
          onClick={() => setShowHelp(false)}
        >
          <div className="rjb-help-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Settings Help Guide</h2>

            <div className="rjb-help-section">
              <h3>AI Alerts</h3>
              <p>Enable or disable the alerting system and tune confidence thresholds.</p>
            </div>

            <div className="rjb-help-section">
              <h3>Officer Tracking</h3>
              <p>Control GPS update frequency and escalation timings.</p>
            </div>

            <button className="rjb-help-close" onClick={() => setShowHelp(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
