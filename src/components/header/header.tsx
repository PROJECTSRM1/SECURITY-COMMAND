import React, { useState, useEffect } from "react";
import { toast } from 'react-toastify';
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
  AlertOutlined
} from "@ant-design/icons";
import BrandLogo from "../../assets/favIcon.png";
import { useNavigate } from "react-router-dom";

const { Header } = Layout;
const { Text } = Typography;
const { useBreakpoint } = Grid;
const { confirm } = Modal;

function WithActions({ closeToast, data }: any) {
  return (
    <div className="flex flex-col w-full">
      <div style={{padding:'5px 0px'}}>
        <AlertOutlined style={{color:'red'}} /> {data.title}
      </div>

      <div className="pl-5 mt-2">

        <div className="flex items-center gap-2">
          <Button type="primary"
            onClick={closeToast}
            className="transition-all border-none text-sm font-semibold bg-transparent border rounded-md py-2 text-indigo-600 active:scale-[.95] "
          >
            📍 Track in map
          </Button>
        </div>
      </div>
    </div>
  );
}

const HeaderBar: React.FC = () => {
  const screens = useBreakpoint();
  const navigate = useNavigate();

  const [userData, setUserData] = useState<any>(null);
  const [searchValue, setSearchValue] = useState("");
  const [notifyMsg, setNotifyMsg] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState<any[]>([]);

  const notify = (msg:any) => toast(WithActions, {
      data: {
        title: msg,
      },
      closeButton: false,
      autoClose: 5000,
      hideProgressBar: false,
    });

  useEffect(() => {
    const userDetails = JSON.parse(localStorage.getItem("userData") || "null");
    if (userDetails) setUserData(userDetails);
  }, []);

  useEffect(()=>{
    const timeout = setTimeout(()=>{
      setNotifyMsg(notifyMsg !== "Suspisious Activities" ? 'Suspisious Activities': 'Devices Offline')
      notify(notifyMsg !== "Suspisious Activities" ? 'Suspisious Activities': 'Devices Offline')
    },5000)

    return () => clearTimeout(timeout);
  },[notifyMsg])

  const pages = [
    { label: "Dashboard", path: "/app/dashboard" },
  ];

  const handleSearch = (value: string) => {
    const noSpaces = value.replace(/\s/g, "");
    setSearchValue(noSpaces);

    if (!noSpaces) {
      setSearchSuggestions([]);
      return;
    }

    const filtered = pages.filter((page) =>
      page.label.toLowerCase().includes(noSpaces.toLowerCase())
    );

    setSearchSuggestions(filtered);
  };

  const handleSelect = (value: string) => {
    const selected = pages.find(
      (page) => page.label.toLowerCase() === value.toLowerCase()
    );
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

  // **Logout modal with custom color**
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
        boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px',
        paddingBottom: '20px',
        overflow: "hidden",
        background:"#fff"
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
        {/* {!screens.xs && (
          <Text
            style={{
              fontSize: screens.lg ? 28 : 24,
              fontWeight: 700,
              // background: "linear-gradient(90deg, #0D9488, #14b8a6)",
              WebkitBackgroundClip: "text",
              color: "#0a3b5e",
            }}
          >
            RJB Security Command
          </Text>
        )} */}
      </Space>

      {/* Search  */}
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
        <BellOutlined
          style={{ fontSize: 25, color: "#475569", cursor: "pointer" }}
        />
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
                {userData?.email?.split('@')[0] || "Admin User"}
              </Text>
              <Text type="secondary" style={{ fontSize: screens.md ? 12 : 10 }}>
                police
              </Text>
            </div>
            <Avatar
              style={{
                fontWeight: "bold",
                border: "2px solid white"
              }}
            >
              {(userData?.email
                ? userData.email.charAt(0)
                : "A"
              ).toUpperCase()}
            </Avatar>
          </Space>
        </Dropdown>
      </Space>
    </Header>
  );
};

export default HeaderBar;
