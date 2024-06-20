import React, { useState, useEffect } from "react";
import styles from "./UserProfile.module.css";
import { ethers } from "ethers";
import { FaUser, FaStickyNote, FaArrowLeft, FaCopy } from "react-icons/fa";
import { useRouter } from "next/router";
import copy from "copy-to-clipboard";

function SeedPhraseInfo({ privateKey, mnemonic, onBack }) {
  const [copiedText, setCopiedText] = useState(null);
  const [isBlurred, setIsBlurred] = useState({
    seedPhrase: true,
    privateKey: true,
  });

  const handleCopy = (text) => {
    copy(text);
    setCopiedText(text);
    setTimeout(() => {
      setCopiedText(null);
    }, 2000);
  };

  const toggleBlur = (section) => {
    setIsBlurred((prevState) => ({
      ...prevState,
      [section]: !prevState[section],
    }));
  };

  return (
    <div className={styles.walletInfo}>
      {/* Seed Phrase Container */}
      <div className={styles.seedPhraseContainer}>
        <div className={styles.labelWithIcon}>
          <FaStickyNote className={styles.icon} />
          <h3>Seed Phrase</h3>
          <div className={styles.copyIcon} onClick={() => handleCopy(mnemonic)}>
            <FaCopy />
          </div>
        </div>
        <div className={styles.seedPhraseContent}>
          <p
            className={`${styles.seedPhraseText} ${
              isBlurred.seedPhrase ? styles.blurred : ""
            }`}
            onClick={() => toggleBlur("seedPhrase")}
          >
            {mnemonic}
          </p>
          {copiedText === mnemonic && (
            <span className={styles.copiedText}>Copied!</span>
          )}
        </div>
      </div>

      {/* Private Key Container */}
      <div className={styles.seedPhraseContainer}>
        <div className={styles.labelWithIcon}>
          <FaStickyNote className={styles.icon} />
          <h3>Private Key</h3>
          <div className={styles.copyIcon} onClick={() => handleCopy(privateKey)}>
            <FaCopy />
          </div>
        </div>
        <div className={styles.seedPhraseContent}>
          <p
            className={`${styles.seedPhraseText} ${
              isBlurred.privateKey ? styles.blurred : ""
            }`}
            onClick={() => toggleBlur("privateKey")}
          >
            {privateKey}
          </p>
          {copiedText === privateKey && (
            <span className={styles.copiedText}>Copied!</span>
          )}
        </div>
      </div>
    </div>
  );
}


function UserProfile() {
  const [walletInfo, setWalletInfo] = useState(null);
  const [showSeedPhraseInfo, setShowSeedPhraseInfo] = useState(false);
  const router = useRouter();
  useEffect(() => {
    const mnemonic = localStorage.getItem("walletMnemonic");
    if (mnemonic) {
      const wallet = ethers.Wallet.fromMnemonic(mnemonic);
      setWalletInfo({
        mnemonic: mnemonic,
        privateKey: wallet.privateKey,
      });
    } else {
      console.error("Mnemonic not found in local storage");
    }
  }, []);
  useEffect(() => {
    const tele = window.Telegram.WebApp;
    if (tele) {
      tele.ready();
      tele.expand();
      tele.viewportStableHeight;
      console.log(tele);
    }
  }, []);
  const backToDashboard = () => {
  };
  const toggleSeedPhraseInfo = () => {
    setShowSeedPhraseInfo(!showSeedPhraseInfo);
  };
  const logout = () => {
    localStorage.removeItem("walletMnemonic");
    localStorage.removeItem("walletAddress");
    localStorage.removeItem("walletPublicKey");
    router.push("/");
  };
  return (
    <div className={styles.container}>
      <div className={styles.walletInfo}>
        {!showSeedPhraseInfo && (
          <>
            <div className={styles.backButton} onClick={backToDashboard}>
              <FaArrowLeft />
            </div>{" "}
            <div className={styles.seedPhraseContainer}>
              <div className={styles.labelWithIcon}>
                <FaUser className={styles.icon} />
                <h3>Address</h3>
              </div>
              <p>{walletInfo && walletInfo.address}</p>
            </div>
            <div
              className={styles.seedPhraseContainer}
              onClick={toggleSeedPhraseInfo}
            >
              <div className={styles.labelWithIcon}>
                <FaStickyNote className={styles.icon} />
                <h3>Seed Phrase</h3>
              </div>
            </div>
            <div className={styles.buttonContainer}>
              <button onClick={logout} className={styles.button}>
                Logout
              </button>
            </div>
          </>
        )}
        {showSeedPhraseInfo && (
          <SeedPhraseInfo
            privateKey={walletInfo && walletInfo.privateKey}
            mnemonic={walletInfo && walletInfo.mnemonic}
            onBack={toggleSeedPhraseInfo}
          />
        )}
      </div>
    </div>
  );
}

export default UserProfile;
