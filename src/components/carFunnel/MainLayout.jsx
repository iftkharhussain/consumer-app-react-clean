/* eslint-disable */
import React from 'react';
import { Layout } from 'antd';
import HeaderActions from './common/HeaderActions';

const { Content } = Layout;

const MainLayout = ({ children, hideActions = false }) => {
    return (
        <Layout style={{ minHeight: '100vh', background: 'transparent', position: 'relative' }}>
            <Content style={{
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                maxWidth: '835px',
                margin: '0 auto',
                width: '100%'
            }}>
                {!hideActions && <HeaderActions />}
                {children}
            </Content>
        </Layout>
    );
};

export default MainLayout;
