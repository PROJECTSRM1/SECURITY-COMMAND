import  { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import "./AnalyticsReports.css";



/* ---------- Types ---------- */
type VisitorEntry = {
  id: string;
  fullName: string;
  idProof: string;
  mobile: string;
  purpose: string;
  accessArea: string;
  entry: string; // ISO datetime
  validTill: string; // ISO datetime
  photoDataUrl?: string | null;
  createdAt?: number;
};

type AlertSeverity = "critical" | "high" | "medium" | "low";
type AlertRecord = {
  id: string;
  title: string;
  type: string;
  severity: AlertSeverity;
  confidence: number;
  createdAt: string; // ISO
  status: string;
  source?: { name?: string; location?: string; snapshotDataUrl?: string | null };
};

const LS_VISITORS = "rjb_gatepass_visitors_v1";
const LS_ALERTS = "rjb_alerts_v1";

/* ---------- Helpers ---------- */
function safeParse<T>(raw: string | null, fallback: T): T {
  try {
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function isoDateOnly(iso?: string) {
  if (!iso) return "";
  return iso.slice(0, 10); // YYYY-MM-DD
}

/* CSV export */
function downloadCSV(filename: string, headers: string[], rows: (string | number)[][]) {
  const csv =
    [headers.join(",")].concat(
      rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
    ).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/* ---------- Component ---------- */
export default function AnalyticsReports() {
  // date filters
  const [fromDate, setFromDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 13);
    return d.toISOString().slice(0, 10);
  });
  const [toDate, setToDate] = useState<string>(() => new Date().toISOString().slice(0, 10));

  // raw data
  const [visitors, setVisitors] = useState<VisitorEntry[]>([]);
  const [alerts, setAlerts] = useState<AlertRecord[]>([]);

  // pagination
  const [page, setPage] = useState<number>(1);
  const rowsPerPage = 10;

  useEffect(() => {
    const rawV = localStorage.getItem(LS_VISITORS);
    const rawA = localStorage.getItem(LS_ALERTS);

    const demoVisitors: VisitorEntry[] = [
      // fallback example if none in localStorage
      {
        id: "demo-1",
        fullName: "Demo User",
        idProof: "ID-111",
        mobile: "9000000000",
        purpose: "Visitor",
        accessArea: "Outer Hall",
        entry: new Date().toISOString(),
        validTill: new Date(Date.now() + 3600 * 1000).toISOString(),
        createdAt: Date.now(),
        photoDataUrl: null,
      },
    ];

    const demoAlerts: AlertRecord[] = [
      {
        id: "demo-a1",
        title: "Suspicious motion",
        type: "vision",
        severity: "high",
        confidence: 0.87,
        createdAt: new Date().toISOString(),
        status: "new",
        source: { name: "Camera A1", location: "Gate 2", snapshotDataUrl: null },
      },
    ];

    setVisitors(safeParse<VisitorEntry[]>(rawV, demoVisitors));
    setAlerts(safeParse<AlertRecord[]>(rawA, demoAlerts));
  }, []);

  /* ---------- Filtering data by selected dates ---------- */
  const filteredVisitors = useMemo(() => {
    const f = new Date(fromDate);
    const t = new Date(toDate);
    t.setHours(23, 59, 59, 999);
    return visitors.filter((v) => {
      const dt = new Date(v.entry);
      return dt >= f && dt <= t;
    });
  }, [visitors, fromDate, toDate]);

  const filteredAlerts = useMemo(() => {
    const f = new Date(fromDate);
    const t = new Date(toDate);
    t.setHours(23, 59, 59, 999);
    return alerts.filter((a) => {
      const dt = new Date(a.createdAt);
      return dt >= f && dt <= t;
    });
  }, [alerts, fromDate, toDate]);

  /* ---------- KPIs ---------- */
  const kpis = useMemo(() => {
    const totalVisitors = filteredVisitors.length;
    const totalAlerts = filteredAlerts.length;
    const bySeverity = filteredAlerts.reduce<Record<AlertSeverity, number>>(
      (acc, r) => {
        acc[r.severity] = (acc[r.severity] || 0) + 1;
        return acc;
      },
      { critical: 0, high: 0, medium: 0, low: 0 }
    );
    return { totalVisitors, totalAlerts, bySeverity };
  }, [filteredVisitors, filteredAlerts]);

  /* ---------- Time series for chart (daily counts) ---------- */
  const timeSeries = useMemo(() => {
    const start = new Date(fromDate);
    const end = new Date(toDate);
    // build array of dates inclusive
    const days: string[] = [];
    const cur = new Date(start);
    while (cur <= end) {
      days.push(cur.toISOString().slice(0, 10));
      cur.setDate(cur.getDate() + 1);
    }

    const visitorsMap: Record<string, number> = {};
    const alertsMap: Record<string, number> = {};
    days.forEach((d) => {
      visitorsMap[d] = 0;
      alertsMap[d] = 0;
    });

    filteredVisitors.forEach((v) => {
      const d = isoDateOnly(v.entry);
      if (visitorsMap[d] !== undefined) visitorsMap[d] += 1;
    });
    filteredAlerts.forEach((a) => {
      const d = isoDateOnly(a.createdAt);
      if (alertsMap[d] !== undefined) alertsMap[d] += 1;
    });

    return days.map((d) => ({ date: d, visitors: visitorsMap[d] || 0, alerts: alertsMap[d] || 0 }));
  }, [fromDate, toDate, filteredVisitors, filteredAlerts]);

  /* ---------- Pie data for alerts severity ---------- */
  const pieData = useMemo(() => {
    return [
      { name: "Critical", value: kpis.bySeverity.critical, key: "critical" },
      { name: "High", value: kpis.bySeverity.high, key: "high" },
      { name: "Medium", value: kpis.bySeverity.medium, key: "medium" },
      { name: "Low", value: kpis.bySeverity.low, key: "low" },
    ].filter((d) => d.value > 0);
  }, [kpis.bySeverity]);

  const PIE_COLORS = ["#ef4444", "#f97316", "#facc15", "#60a5fa"];

  /* ---------- Table rows (combined recent events) ---------- */
  const combinedRows = useMemo(() => {
    // combine visitors and alerts by time descending
    const vRows = filteredVisitors.map((v) => ({
      id: v.id,
      kind: "visitor" as const,
      when: v.entry,
      summary: `${v.fullName} — ${v.purpose}`,
      meta: v.accessArea,
    }));
    const aRows = filteredAlerts.map((a) => ({
      id: a.id,
      kind: "alert" as const,
      when: a.createdAt,
      summary: `${a.title} [${a.severity.toUpperCase()}]`,
      meta: a.source?.name ?? a.type,
    }));
    return [...vRows, ...aRows].sort((a, b) => +new Date(b.when) - +new Date(a.when));
  }, [filteredVisitors, filteredAlerts]);

  const totalPages = Math.max(1, Math.ceil(combinedRows.length / rowsPerPage));
  const visibleRows = combinedRows.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  /* ---------- Exports ---------- */
  const exportVisitorsCSV = () => {
    const headers = ["id", "fullName", "idProof", "mobile", "purpose", "accessArea", "entry", "validTill"];
    const rows = filteredVisitors.map((v) => [
      v.id,
      v.fullName,
      v.idProof,
      v.mobile,
      v.purpose,
      v.accessArea,
      v.entry,
      v.validTill,
    ]);
    downloadCSV(`visitors_${fromDate}_to_${toDate}.csv`, headers, rows);
  };

  const exportAlertsCSV = () => {
    const headers = ["id", "title", "type", "severity", "confidence", "createdAt", "status", "sourceName", "sourceLocation"];
    const rows = filteredAlerts.map((a) => [
      a.id,
      a.title,
      a.type,
      a.severity,
      a.confidence,
      a.createdAt,
      a.status,
      a.source?.name ?? "",
      a.source?.location ?? "",
    ]);
    downloadCSV(`alerts_${fromDate}_to_${toDate}.csv`, headers, rows);
  };

  const exportCombinedCSV = () => {
    const headers = ["id", "kind", "when", "summary", "meta"];
    const rows = combinedRows.map((r) => [r.id, r.kind, r.when, r.summary, r.meta]);
    downloadCSV(`events_${fromDate}_to_${toDate}.csv`, headers, rows);
  };

  /* ---------- UI ---------- */
  return (
    <div className="rjb-ar-root">
      <header className="rjb-ar-header">
        <h2>Analytics & Reports</h2>
        <div className="rjb-ar-filters">
          <label>
            From <input type="date" value={fromDate} onChange={(e) => { setFromDate(e.target.value); setPage(1); }} />
          </label>
          <label>
            To <input type="date" value={toDate} onChange={(e) => { setToDate(e.target.value); setPage(1); }} />
          </label>
          <button className="rjb-btn" onClick={() => { setFromDate(new Date(Date.now() - 13 * 86400000).toISOString().slice(0,10)); setToDate(new Date().toISOString().slice(0,10)); }}>
            Last 14d
          </button>
        </div>
      </header>

      <section className="rjb-ar-kpis">
        <div className="rjb-kpi">
          <div className="rjb-kpi-title">Visitors</div>
          <div className="rjb-kpi-value">{kpis.totalVisitors}</div>
          <div className="rjb-kpi-sub">In selected period</div>
        </div>
        <div className="rjb-kpi">
          <div className="rjb-kpi-title">Alerts</div>
          <div className="rjb-kpi-value">{kpis.totalAlerts}</div>
          <div className="rjb-kpi-sub">AI events</div>
        </div>
        <div className="rjb-kpi">
          <div className="rjb-kpi-title">Critical</div>
          <div className="rjb-kpi-value">{kpis.bySeverity.critical}</div>
          <div className="rjb-kpi-sub">Critical alerts</div>
        </div>
        <div className="rjb-kpi">
          <div className="rjb-kpi-title">Avg / day (visitors)</div>
          <div className="rjb-kpi-value">{Math.round((kpis.totalVisitors / Math.max(1, timeSeries.length)) * 10) / 10}</div>
          <div className="rjb-kpi-sub">Daily avg</div>
        </div>
      </section>

      <section className="rjb-ar-charts">
        <div className="rjb-chart-card">
          <h4>Daily — Visitors vs Alerts</h4>
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeSeries} margin={{ left: 0, right: 10, top: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="visitors" stroke="#2563eb" dot={false} />
                <Line type="monotone" dataKey="alerts" stroke="#ef4444" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rjb-chart-card">
          <h4>Alerts by Severity</h4>
          <div style={{ height: 260, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {pieData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={80} label>
                    {pieData.map((entry, idx) => (
                      <Cell key={entry.key} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="rjb-empty">No alerts in range</div>
            )}
          </div>
        </div>
      </section>

      <section className="rjb-ar-table-card">
        <div className="rjb-table-head">
          <h4>Events (visitors & alerts)</h4>
          <div className="rjb-table-actions">
            <button className="rjb-btn" onClick={exportVisitorsCSV}>Export Visitors</button>
            <button className="rjb-btn" onClick={exportAlertsCSV}>Export Alerts</button>
            <button className="rjb-btn-primary" onClick={exportCombinedCSV}>Export All</button>
          </div>
        </div>

        <div className="rjb-events-table-wrap">
          <table className="rjb-events-table">
            <thead>
              <tr>
                <th>When</th>
                <th>Kind</th>
                <th>Summary</th>
                <th>Meta</th>
              </tr>
            </thead>
            <tbody>
              {visibleRows.length === 0 && (
                <tr><td colSpan={4} className="rjb-empty-row">No events in selected dates.</td></tr>
              )}
              {visibleRows.map((r) => (
                <tr key={r.id}>
                  <td>{new Date(r.when).toLocaleString()}</td>
                  <td className={`rjb-badge ${r.kind}`}>{r.kind}</td>
                  <td>{r.summary}</td>
                  <td>{r.meta}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rjb-pagination">
          <div>Showing {visibleRows.length} of {combinedRows.length}</div>
          <div>
            <button className="rjb-btn" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Prev</button>
            <span className="rjb-page">{page} / {totalPages}</span>
            <button className="rjb-btn" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</button>
          </div>
        </div>
      </section>
    </div>
  );
}
