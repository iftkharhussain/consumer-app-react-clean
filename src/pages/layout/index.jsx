import React, { useState, useEffect } from 'react';
import Sidebar from './sidebar'
import { Layout, theme } from 'antd';
import { ChevronLeftDouble, ChevronRightDouble, Menu02, XClose } from "utils/icons";
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import AppHeader from './header'
import MobileNavbar from '../../components/mobileNavbar/MobileNavbar';

const { Content, Footer } = Layout;

const AppLayout = ({ heading, children, _style }) => {
  const [collapsed, setCollapsed] = useState(true);
  const { token: { colorBgContainerAside } } = theme.useToken();
  const [showSidebar, setShowSidebar] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);

  const { sidebarBehavior } = useSelector((state) => state.app.user_profile);

  // Detect mobile view
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 1024;
      setIsMobileView(mobile);

      // Add/remove mobile-view class to body
      if (mobile) {
        document.body.classList.add('mobile-view');
      } else {
        document.body.classList.remove('mobile-view');
        setShowSidebar(false); // Close sidebar when switching to desktop
      }
    };

    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle sidebar open/close class on body
  useEffect(() => {
    if (isMobileView) {
      if (showSidebar) {
        document.body.classList.add('sidebar-open');
      } else {
        document.body.classList.remove('sidebar-open');
      }
    }
  }, [showSidebar, isMobileView]);

  useEffect(() => {
    if (sidebarBehavior === 'auto') {
      setCollapsed(false);
      setShowSidebar(true);
    }
  }, [sidebarBehavior]);

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
    if (isMobileView) {
      setCollapsed(false);
    }
  };

  const closeMobileSidebar = () => {
    if (isMobileView) {
      setShowSidebar(false);
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }} >
      {/* Mobile Navbar Header */}
      <MobileNavbar onMenuClick={toggleSidebar} />

      {/* Mobile Sidebar Overlay */}
      {isMobileView && (
        <div
          className="mobile-sidebar-overlay"
          onClick={closeMobileSidebar}
        />
      )}

      <div className={`norga-mobile-menu ${showSidebar ? 'show' : ''}`}>
        <div className='sidebar-mb-overlay'></div>
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} onMobileClose={closeMobileSidebar} />
      </div>
      <Layout>
        {
          collapsed && !isMobileView &&
          <div className="menu-icon collapsed body-level" onClick={() => setCollapsed(!collapsed)}>
            {/* <img src="/images/log-out-01.svg" title="menu-collapsed-icon" /> */}
            <ChevronRightDouble style={{ color: '#697586' }} />
          </div>
        }
        <Content style={{ 
          marginLeft: isMobileView ? 0 : (collapsed ? 80 : 320), 
          minWidth: 0, // Helps with deeply nested flex/overflow elements
          width: isMobileView ? '100%' : `calc(100% - ${collapsed ? 80 : 320}px)`, 
        }} >
          <div
            className='main-body-wrapper'
            style={{
              background: '#F8FAFC',
              padding: _style?.contentPadding ?? (isMobileView ? '16px 0 0' : '32px 32px 0'),
              position: 'relative',
              overflowX: 'auto', // Allows scrolling internal contents instead of globally overlapping the sidebar
              minHeight: '100vh',
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
              ...(_style?.wrapper || {}),
            }}
          >
            {/* <AppHeader heading={heading} collapsed={collapsed} setCollapsed={setCollapsed} /> */}
            {children}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};
export default AppLayout;