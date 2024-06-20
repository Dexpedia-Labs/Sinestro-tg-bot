import React, { useState } from "react";
import styles from "./Header.module.css";
import { RiSettingsLine } from "react-icons/ri";
import { FaQrcode } from "react-icons/fa6";
import { BiSolidBell } from "react-icons/bi";
import UserProfile from "../UserProfile/UserProfile";

const Header = () => {
  const [showUserProfile, setShowUserProfile] = useState(false);

  const handleSettingsClick = () => {
    setShowUserProfile((prevState) => !prevState);
  };

  return (
    <>
      <div className={styles.header}>
        <div className={styles.iconsContainer}>
          <FaQrcode className={styles.icon} />
          <BiSolidBell className={styles.icon} />
          <RiSettingsLine
            className={styles.icon}
            onClick={handleSettingsClick}
          />
        </div>
      </div>
      {showUserProfile && <UserProfile />}
    </>
  );
};

export default Header;
