
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  Layout,
  Input,
  Dropdown,
  Typography,
  Space,
  AutoComplete,
  Avatar,
  Grid,
  message,
  Menu,
  Modal,
  Button,
} from "antd";
import {
  BellOutlined,
  SearchOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  ExclamationCircleOutlined,
  AlertOutlined,
} from "@ant-design/icons";
import BrandLogo from "../../assets/favIcon.png";
import { useNavigate } from "react-router-dom";
// import { Label } from "recharts";

const { Header } = Layout;
const { Text } = Typography;
const { useBreakpoint } = Grid;
const { confirm } = Modal;

/* ------------------ WithActions (toast renderer) ------------------ */
function WithActions({ closeToast, data }: any) {
  return (
    <div className="flex flex-col w-full">
      <div style={{ padding: "5px 0px" }}>
        <AlertOutlined style={{ color: "red" }} /> {data?.title}
      </div>

      {data?.body && (
        <div className="pl-5 mt-1" style={{ fontSize: 12, color: "#475569" }}>
          {data.body}
        </div>
      )}

      <div className="pl-5 mt-2">
        <div className="flex items-center gap-2">
          <Button
            type="primary"
            onClick={() => {
              if (data?.alertId) {
                // send an event for other components to track or open the alert
                window.dispatchEvent(new CustomEvent("rjb:track-on-map", { detail: { id: data.alertId } }));
              }
              closeToast?.();
            }}
            className="transition-all border-none text-sm font-semibold bg-transparent border rounded-md py-2 text-indigo-600 active:scale-[.95]"
          >
            📍 Track in map
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ------------------ HeaderBar ------------------ */
const HeaderBar: React.FC = () => {
  const screens = useBreakpoint();
  const navigate = useNavigate();

  const [userData, setUserData] = useState<any>(null);
  const [searchValue, setSearchValue] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState<any[]>([]);

  // local wrapper (keeps one appearance entry if used locally)
  const notify = (msg: any) =>
    toast(WithActions as any, {
      data: {
        title: msg,
      },
      closeButton: false,
      autoClose: 5000,
      hideProgressBar: false,
    });

  /* ---------- Global toast listener that renders WithActions (RESPECTS SETTINGS) ---------- */
  useEffect(() => {
    function onGlobalToast(e: Event) {
      const detail = (e as CustomEvent).detail || {};
      const title = detail.title || "Alert";
      const body = detail.body;
      const alertId = detail.alertId;

      try {
        const raw = localStorage.getItem("rjb_settings_v1");
        const settings = raw ? JSON.parse(raw) : null;
        const toastEnabled = settings?.aiAlerts?.toastNotifications ?? true;
        if (!toastEnabled) {
          return;
        }
      } catch (err) {
      }

      try {
        toast(WithActions as any, {
          data: { title, body, alertId },
          closeButton: false,
          autoClose: 6000,
          hideProgressBar: false,
        });
      } catch (err) {
        notify(title + (body ? ` — ${body}` : ""));
        console.error("Global toast render failed:", err);
      }
    }

    window.addEventListener("rjb:toast", onGlobalToast as EventListener);
    return () => window.removeEventListener("rjb:toast", onGlobalToast as EventListener);
  }, []);

  useEffect(() => {
    const freqSeconds = 8; // change frequency here if desired
    let timer: number | null = null;

    function uid() {
      return Math.random().toString(36).slice(2, 9);
    }
    function nowIso() {
      return new Date().toISOString();
    }
    function mapSeverity(confPct: number) {
      if (confPct >= 90) return "critical";
      if (confPct >= 80) return "high";
      if (confPct >= 70) return "medium";
      return "low";
    }
    function createMockAlert() {
      const samples = [
        "/assets/susp1.webp",
        "/assets/susp2.webp",
        "/assets/susp3.webp",
        "/assets/susp4.webp",
        "/assets/susp5.webp",
        "/assets/susp6.webp",
      ];
      const snap = samples[Math.floor(Math.random() * samples.length)];

      const confidence = +(0.6 + Math.random() * 0.4).toFixed(2);
      const confPct = Math.round(confidence * 100);
      const severity = mapSeverity(confPct);
      const title = severity === "critical" ? "Intrusion detected" : severity === "high" ? "Suspicious activity" : "Motion detected";

      const sourceName = ["Camera A1", "Gate Cam 2", "Perimeter 5"][Math.floor(Math.random() * 3)];
      const location = ["Gate 1", "Inner Hall", "Perimeter Fence"][Math.floor(Math.random() * 3)];

      return {
        id: uid(),
        title,
        type: "vision",
        severity,
        confidence,
        createdAt: nowIso(),
        status: "new",
        source: { name: sourceName, location, snapshotDataUrl: snap },
        assignedTo: null,
        notes: [],
        reasoning: `Model confidence ${confPct}%`,
      };
    }

    function loadAlertsLocal() {
      try {
        const raw = localStorage.getItem("rjb_alerts_v1");
        return raw ? JSON.parse(raw) : [];
      } catch {
        return [];
      }
    }
    function saveAlertsLocal(list: any[]) {
      try {
        localStorage.setItem("rjb_alerts_v1", JSON.stringify(list));
      } catch (e) {
        console.warn("saveAlertsLocal error", e);
      }
    }

    function tick() {
      try {
        const a = createMockAlert();
        const existing = loadAlertsLocal();
        const updated = [a, ...existing].slice(0, 200);
        saveAlertsLocal(updated);

        const title = a.title;
        const body = `${a.source.name ?? ""}${a.source.location ? " • " + a.source.location : ""}`;
        window.dispatchEvent(new CustomEvent("rjb:toast", { detail: { title, body, alertId: a.id } }));

        // optional: other listeners (badge counters, panel) can listen to this
        window.dispatchEvent(new CustomEvent("rjb:new-alert", { detail: a }));
      } catch (err) {
        console.warn("alerts simulator tick error", err);
      }
    }

    // start
    tick();
    timer = window.setInterval(tick, Math.max(500, freqSeconds * 1000));

    return () => {
      if (timer) clearInterval(timer);
    };
  }, []);

  /* ---------- load user ---------- */
  useEffect(() => {
    const userDetails = JSON.parse(localStorage.getItem("userData") || "null");
    if (userDetails) setUserData(userDetails);
  }, []);

  /* ---------- search + pages ---------- */
  const pages = [{ label: "Dashboard", path: "/app/dashboard" },
     { label: "Analytics & Reports", path: "/app/analytics" },
    { label: "AI Alerts", path: "/app/ai-alerts" },
    { label: "Settings", path: "/app/settings" },
    {label: "Vehicle Recognition", path: "/app/cctv-ai-feeds" },
    { label: "Crowded People", path: "/app/crowded-people" },
    { label: "Gate Pass & Visitors", path: "/app/gate-pass" },
    { label: "Officers", path: "/app/officers" },
    { label: "Officer Tracking", path: "/app/officers-track" },
  ];

  const handleSearch = (value: string) => {
    const noSpaces = value.replace(/\s/g, "");
    setSearchValue(noSpaces);

    if (!noSpaces) {
      setSearchSuggestions([]);
      return;
    }

    const filtered = pages.filter((page) => page.label.toLowerCase().includes(noSpaces.toLowerCase()));
    setSearchSuggestions(filtered);
  };

  const handleSelect = (value: string) => {
    const selected = pages.find((page) => page.label.toLowerCase() === value.toLowerCase());
    if (selected) {
      navigate(selected.path);
      setSearchValue("");
      setSearchSuggestions([]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === " ") e.preventDefault();
    if (e.key === "Enter" && searchSuggestions.length > 0) {
      handleSelect(searchSuggestions[0].label);
    }
  };

  /* ---------- Logout modal ---------- */
  const handleLogout = () => {
    confirm({
      title: "Are you sure you want to log out?",
      icon: <ExclamationCircleOutlined />,
      okText: "Yes",
      okType: "default",
      cancelText: "No",
      okButtonProps: {
        style: { backgroundColor: "#0a3b5e", color: "#fff" },
      },
      cancelButtonProps: {
        style: { backgroundColor: "#0a3b5e", color: "#fff" },
      },
      onOk() {
        localStorage.removeItem("userData");
        message.success("Logged out successfully!");
        navigate("/login");
      },
      onCancel() {
        message.info("Logout cancelled");
      },
    });
  };

  const userMenu = (
    <Menu
      onClick={({ key }) => {
        if (key === "logout") handleLogout();
      }}
      items={[
        { key: "profile", icon: <UserOutlined />, label: "Profile" },
        { key: "settings", icon: <SettingOutlined />, label: "Settings" },
        { key: "logout", icon: <LogoutOutlined />, label: "Logout" },
      ]}
    />
  );

  return (
    <Header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: screens.xs ? "0 12px" : "0 24px",
        position: "sticky",
        top: 0,
        zIndex: 1000,
        height: "64px",
        lineHeight: "64px",
        flexWrap: "wrap",
        boxShadow: "rgba(149, 157, 165, 0.2) 0px 8px 24px",
        paddingBottom: "20px",
        overflow: "hidden",
        background: "#fff",
      }}
    >
      {/* Logo */}
      <Space align="center" style={{ gap: screens.xs ? 8 : 12 }}>
        <img
          src={BrandLogo}
          alt="Logo"
          style={{
            width: screens.xs ? 36 : 48,
            height: screens.xs ? 36 : 48,
            paddingTop: 14,
            borderRadius: "50%",
            objectFit: "cover",
          }}
        />
        <Text
          style={{
            fontSize: screens.lg ? 28 : 24,
            fontWeight: 700,
            WebkitBackgroundClip: "text",
            color: "rgb(81 153 205)",
          }}
        >
          RJB Security Command
        </Text>
      </Space>

      {/* Search */}
      <Space size="middle" align="center">
        <AutoComplete
          options={searchSuggestions.map((item) => ({ value: item.label }))}
          value={searchValue}
          onSearch={handleSearch}
          onSelect={handleSelect}
          filterOption={false}
          style={{ width: screens.xl ? 360 : screens.lg ? 320 : 280 }}
        >
          <Input
            prefix={<SearchOutlined style={{ color: "#94a3b8" }} />}
            placeholder="Search pages..."
            value={searchValue}
            onChange={(e) => handleSearch(e.target.value)}
            onKeyDown={handleKeyPress}
            style={{
              borderRadius: 10,
              backgroundColor: "#f1f5f9",
              borderColor: "#e5e7eb",
              fontWeight: 500,
              color: "#334155",
              height: "36px",
            }}
          />
        </AutoComplete>
      </Space>

      {/* Notifications + Avatar */}
      <Space size="middle" align="center">
        <BellOutlined style={{ fontSize: 25, color: "#475569", cursor: "pointer" }} />
        <Dropdown overlay={userMenu} trigger={["click"]}>
          <Space
            style={{
              cursor: "pointer",
              gap: 6,
              display: "flex",
              alignItems: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                lineHeight: 1.1,
              }}
            >
              <Text
                style={{
                  fontWeight: 600,
                  fontSize: screens.md ? 14 : 12,
                }}
              >
                {userData?.email?.split("@")[0] || "Admin User"}
              </Text>
              <Text type="secondary" style={{ fontSize: screens.md ? 12 : 10 }}>
                police
              </Text>
            </div>
            <Avatar
              style={{
                fontWeight: "bold",
                border: "2px solid white",
              }}
            >
              {(userData?.email ? userData.email.charAt(0) : "A").toUpperCase()}
            </Avatar>
          </Space>
        </Dropdown>
      </Space>
    </Header>
  );
};

export default HeaderBar;
