
import React from 'react';
import {
  NotificationOutlined,
  LogoutOutlined,
  PicCenterOutlined,
  ExclamationCircleOutlined,
  PieChartOutlined,
  MenuUnfoldOutlined,
  SettingOutlined,
} from '@ant-design/icons';

import { GiPoliceOfficerHead } from "react-icons/gi";
import { FaUserShield } from "react-icons/fa";
import { HiMiniUserGroup } from "react-icons/hi2";
import { MdOutlineDashboardCustomize } from "react-icons/md";
import { GiIndiaGate } from "react-icons/gi";

import { Layout, Menu, Modal, message } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

import HeaderBar from '../header/header';

const { Content, Sider } = Layout;
const { confirm } = Modal;

const MenuItems = [
  { menuIcon: MenuUnfoldOutlined, label: 'Menu' },
  { menuIcon: MdOutlineDashboardCustomize, label: 'Dashboard', path: '/app/dashboard' },
  {
    key: 'Live Map',
    menuIcon: HiMiniUserGroup,
    label: 'Crowded People',
    path: '/app/crowded-people'
  },
  {
    key: 'Officers',
    menuIcon: FaUserShield,
    label: 'Officers',
    path: '/app/officers'
  },
  {
    key: 'Officer Tracking',
    menuIcon: GiPoliceOfficerHead,
    label: 'Officer Tracking',
    path: '/app/officers-track'
  },
  {
    key: 'Gate Pass & Visitors',
    label: 'Gate Pass & Visitors',
    menuIcon: GiIndiaGate,
    path: '/app/gate-pass'
  },
  {
    key: 'CCTV AI Feeds',
    label: 'Vehicle Recognition',
    menuIcon: PicCenterOutlined,
    path: '/app/cctv-ai-feeds'
  },
  {
    key: 'Analytics & Reports',
    label: 'Analytics & Reports',
    menuIcon: PieChartOutlined,
    path: '/app/analytics'
  },
  {
    key: 'AI Alerts',
    label: 'AI Alerts',
    menuIcon: NotificationOutlined,
    path: '/app/ai-alerts'
  },
  {
    key: 'Settings',
    label: 'Settings',
    menuIcon: SettingOutlined,
    path: '/app/settings'
  },
  { menuIcon: LogoutOutlined, label: 'Logout' },
];

const LayoutComponent: React.FC = () => {
  const [collapsed, setCollapsed] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const menuData = (menu: any) =>
    menu.map((ele: any) => ({
      key: ele.path || ele.label,
      icon: React.createElement(ele.menuIcon),
      label: ele.label
    }));

  const items = menuData(MenuItems);

  // Logout modal (styled by rjb-lay scoped CSS)
  const handleLogout = () => {
    confirm({
      title: 'Are you sure you want to log out?',
      icon: <ExclamationCircleOutlined />,
      okText: 'Yes',
      cancelText: 'No',
      onOk() {
        localStorage.removeItem('userData');
        message.success('Logged out successfully!');
        navigate('/login');
      },
      onCancel() {
        message.info('Logout cancelled');
      },
    });
  };

  const onClick = (e: any) => {
    if (e.key === 'Logout') {
      handleLogout();
      return;
    }

    if (e.key === 'Menu') {
      setCollapsed(!collapsed);
      return;
    }

    const selected = MenuItems.find((item) => item.path === e.key);
    if (selected?.path) navigate(selected.path);
  };

  return (
    <div className="rjb-lay">
      <Layout>
        <HeaderBar />

        <Layout>
          <Sider
            collapsible
            collapsed={collapsed}
            onCollapse={setCollapsed}
            trigger={null}
            width={200}
            className="rjb-lay__sider"
          >
            <Menu
              mode="inline"
              selectedKeys={[location.pathname]}
              onClick={onClick}
              items={items}
              theme="light"
              inlineCollapsed={collapsed}
              className="rjb-lay__menu"
            />
          </Sider>

          <Layout className="rjb-lay__main">
            <Content className="rjb-lay__content">
              <Outlet />
            </Content>
          </Layout>
        </Layout>
      </Layout>
    </div>
  );
};

export default LayoutComponent;
