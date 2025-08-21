import React, { useState, useEffect } from 'react';
import Sidebar from './sidebar'
import { Layout, theme } from 'antd';
import { ChevronLeftDouble, ChevronRightDouble, Menu02, XClose } from "utils/icons";
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import AppHeader from './header'

const {Content, Footer} = Layout;

const AppLayout = ({ heading, children, _style }) => {
  const [collapsed, setCollapsed] = useState(true);
  const { token: { colorBgContainerAside } } = theme.useToken();
  const [showSidebar, setShowSidebar] = useState(false);

  const {sidebarBehavior} = useSelector((state) => state.app.user_profile);

  useEffect(() => {
    if (sidebarBehavior === 'auto') {
      setCollapsed(false);
      setShowSidebar(true);
    }
  }, [sidebarBehavior]);

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
    setCollapsed(false);
    // document.body.classList.remove('collapsed');
    // document.aside.classList.remove('ant-layout-sider-collapsed');
    // document.aside.classList.remove('collapse');
  };
  return (
    <Layout style={{ minHeight: '100vh' }} >
      <div className={`norga-mobile-menu ${showSidebar ? 'show' : ''}`}>
        <div className='sidebar-mb-overlay'></div>
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      </div>
      <Layout>
        {
          collapsed &&
          <div className="menu-icon collapsed body-level" onClick={() => setCollapsed(!collapsed)}>
            {/* <img src="/images/log-out-01.svg" title="menu-collapsed-icon" /> */}
            <ChevronRightDouble style={{ color: '#697586' }} />
          </div>
        }
        <Content style={{ marginLeft: collapsed ? 80 : 292 }} >
          <div className='main-body-wrapper' style={{ background: '#F8FAFC' }}>
            {/* <AppHeader heading={heading} collapsed={collapsed} setCollapsed={setCollapsed} /> */}
            { children }
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};
export default AppLayout;