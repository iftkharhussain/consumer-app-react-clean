import React from 'react';
import { Tabs } from 'antd';
import styles from './TabCustomProgressBar.module.css';

const TabCustomProgressBar = ({ tabs, activeKey, progressPercentage, style }) => {
    const tabItems = tabs.map((tab, index) => ({
        key: String(index + 1),
        label: (
            <div className={styles.tabLabelWithProgress}>
                <span className={styles.tabLabel}>{tab.label}</span>
                <div className={styles.progressBar}>
                    <div 
                        className={styles.progressFill} 
                        style={{ width: tab.progress || '0%' }} 
                    />
                </div>
            </div>
        ),
    }));

    return (
        <div className={'flex ' + styles.tabsContainer} style={style}>
            <Tabs
                defaultActiveKey={activeKey || "1"}
                items={tabItems}
                className={styles.customTabs}
            />
            <div className={styles.overallProgress}>
                <span className={styles.progressPercentage}>{progressPercentage}%</span>
            </div>
        </div>
    );
};

export default TabCustomProgressBar;
