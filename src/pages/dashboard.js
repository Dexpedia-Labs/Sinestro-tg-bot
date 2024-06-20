import React, { useState, useEffect } from "react";
import WalletDashboard from "../../Components/WalletDashboard/WalletDashboard";
import WalletSwap from "../../Components/WalletSwap/WalletSwap";
import Dapps from "../../Components/Dapps/Dapps";
import styles from "../../src/styles/Dashboard.module.css";
import { BiHomeAlt } from "react-icons/bi";
import { CgArrowsExchange } from "react-icons/cg";
import { TbWorld } from "react-icons/tb";
const Dashboard = () => {
  useEffect(() => {
    const tele = window.Telegram.WebApp;
    if (tele) {
      tele.ready();
      tele.expand();
    }
  }, []);
  const tabs = {
    HOME: "home",
    SWAP: "swap",
    DAPPS: "dapps",
  };

  const getInitialTab = () => {
    if (typeof window !== "undefined" && window.localStorage) {
      return localStorage.getItem("activeTab") || tabs.HOME;
    }
    return tabs.HOME;
  };

  const [activeTab, setActiveTab] = useState(getInitialTab);

  const renderTabContent = () => {
    switch (activeTab) {
      case tabs.HOME:
        return <WalletDashboard />;
      case tabs.SWAP:
        return <WalletSwap />;
      case tabs.DAPPS:
        return <Dapps />;
      default:
        return <WalletDashboard />;
    }
  };

  return (
    <div className={styles.dashboard}>
      <div className={styles.dashboardRenderedContent}>
        {renderTabContent()}
        </div>
      <div className={styles.tabBar}>
        <div
          className={`${styles.tab} ${
            activeTab === tabs.HOME ? styles.active : ""
          }`}
          onClick={() => setActiveTab(tabs.HOME)}
        >
          <BiHomeAlt className={styles.icon} />
          <span className={styles.tabLabel}>Home</span>
        </div>
        <div
          className={`${styles.tab} ${
            activeTab === tabs.SWAP ? styles.active : ""
          }`}
          onClick={() => setActiveTab(tabs.SWAP)}
        >
          <CgArrowsExchange className={styles.icon} />
          <span className={styles.tabLabel}>Swap</span>
        </div>
        <div
          className={`${styles.tab} ${
            activeTab === tabs.DAPPS ? styles.active : ""
          }`}
          onClick={() => setActiveTab(tabs.DAPPS)}
        >
          <TbWorld className={styles.icon} />
          <span className={styles.tabLabel}>DApps</span>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
