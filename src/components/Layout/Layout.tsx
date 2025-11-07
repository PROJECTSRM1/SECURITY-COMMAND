import React from 'react';
import {
  NotificationOutlined,
  // UserOutlined,
  LogoutOutlined,
  // HeatMapOutlined,
  // AppstoreAddOutlined,
  // GatewayOutlined,
  // SettingOutlined,
  PicCenterOutlined,
  ExclamationCircleOutlined,
  PieChartOutlined,
  MenuUnfoldOutlined,
  // RobotOutlined
} from '@ant-design/icons';
import { GiPoliceOfficerHead } from "react-icons/gi";
import { HiMiniUserGroup } from "react-icons/hi2";
import { MdOutlineDashboardCustomize } from "react-icons/md";
import { GiIndiaGate } from "react-icons/gi";
import { Layout, Menu, theme, Modal, message } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import HeaderBar from '../header/header';
// import { Path } from 'leaflet';

const { Content, Sider } = Layout;
const { confirm } = Modal;

const MenuItems = [
  { menuIcon: MenuUnfoldOutlined, label: 'Menu' },
  { menuIcon: MdOutlineDashboardCustomize, label: 'Dashboard', path: '/app/dashboard' },
    {
      key: 'Live Map',
      menuIcon: HiMiniUserGroup,
      label: 'Crowded People',
      path:'/app/crowded-people'
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
      path:'/app/gate-pass'
    },
    {
      key: 'CCTV AI Feeds',
      label: 'Vehicle Recognition',
      menuIcon: PicCenterOutlined,
      path:'/app/cctv-ai-feeds'
    },
    {
      key: 'Analytics & Reports',
      label: 'Analytics & Reports',
      menuIcon: PieChartOutlined,
    },
    {
      key: 'AI Alerts',
      label: 'AI Alerts',
      menuIcon: NotificationOutlined,
    },
    // {
    //   key: 'System Health',
    //   label: 'System Health',
    //   menuIcon: RobotOutlined,
    // },
    // {
    //   key: 'Admin',
    //   label: 'Admin',
    //   menuIcon: SettingOutlined,
    // },
  { menuIcon: LogoutOutlined, label: 'Logout' },
];


const LayoutComponent: React.FC = () => {
  const { token: { colorBgContainer, borderRadiusLG } } = theme.useToken();
  // const [userDetails, setUserDetails] = React.useState<any>(null);
  const [collapsed, setCollapsed] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const menuData = (menu: any) => menu.map((ele: any) => ({
    key: ele.path || ele.label,
    icon: React.createElement(ele.menuIcon),
    label: ele.label
  }));

  const items = menuData(MenuItems);

  // **Logout modal same as header**
  const handleLogout = () => {
    confirm({
      title: 'Are you sure you want to log out?',
      icon: <ExclamationCircleOutlined />,
      okText: 'Yes',
      cancelText: 'No',
      okType: 'default',
      okButtonProps: {
        style: { backgroundColor: '#0a3b5e', color: '#fff' },
      },
      cancelButtonProps: {
        style: { backgroundColor: '#0a3b5e', color: '#fff' },
      },
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
    if(e.key === "Menu"){
      setCollapsed(!collapsed)
      return;
    }

    const selected = [...MenuItems].find(item => item.path === e.key);
    if (selected?.path) navigate(selected.path);
  };

  return (
    <Layout style={{ height: '100%', overflow: 'hidden' }}>
      <HeaderBar />
      <Layout>
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={setCollapsed}
          trigger={null}
          width={200}
          style={{ background: colorBgContainer }}
        >
          {/* <div style={{ padding: 10, textAlign: 'right' }}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ fontSize: 18, color: '#000' }}
            />
          </div> */}

          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            onClick={onClick}
            style={{
              height: '100%',
              borderInlineEnd: 0,
              background: colorBgContainer,
            }}
            items={items}
            theme="light"
            inlineCollapsed={collapsed}
          />
        </Sider>
        <Layout style={{  display: 'flex', flexDirection: 'column' }}>
          <Content style={{ margin: 0, borderRadius: borderRadiusLG, flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default LayoutComponent;
