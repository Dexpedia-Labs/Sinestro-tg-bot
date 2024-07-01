import React, { useState } from "react";
import styles from "./Header.module.css";
import { FaGear } from "react-icons/fa6";
import { BiSolidBell } from "react-icons/bi";
import { IoEyeOffOutline, IoEyeOutline } from "react-icons/io5";
import { BiSolidCopy } from "react-icons/bi";

const Header = ({
  balance,
  isBalanceVisible,
  toggleBalanceVisibility,
  handleShowUserProfile,
}) => {
  return (
    <>
      <div className={styles.header}>
        <div className={styles.balanceContent}>
          <div>
            {isBalanceVisible ? (
              <IoEyeOutline
                className={styles.eye_on}
                size={20}
                onClick={toggleBalanceVisibility}
              />
            ) : (
              <IoEyeOffOutline
                className={styles.eye_off}
                size={20}
                onClick={toggleBalanceVisibility}
              />
            )}
          </div>
          <div className={styles.balance}>
            <p>{isBalanceVisible ? `${balance} ETH` : "****"}</p>
          </div>
        </div>
        <div className={styles.iconsContainer}>
          <BiSolidCopy className={styles.icon} />
          <BiSolidBell className={styles.icon} />
          <FaGear className={styles.icon} onClick={handleShowUserProfile} />
        </div>
      </div>
    </>
  );
};

export default Header;
