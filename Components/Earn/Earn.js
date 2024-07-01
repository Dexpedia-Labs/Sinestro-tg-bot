import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import styles from "./Earn.module.css";
import Image from "next/image";
import { FaArrowRightLong } from "react-icons/fa6";
import { WalletContext } from "../../Context/WalletContext";
import StackBottomSheet from "../BottomSheet/StackBottomSheet";
import { ethers } from "ethers";
import Toast from "../Toast/Toast";

function Earn() {
  const [tokenData, setTokenData] = useState([]);
  const [stakingAmount, setStakingAmount] = useState("");

  const {
    walletInfo,
    showStakingModal,
    setShowStakingModal,
    signer,
    sdk,
    getBalance,
    setToastMessage,
    setToastType,
    toastMessage,
    toastType,
  } = useContext(WalletContext);
  useEffect(() => {
    const fetchTokenAPR = async () => {
      try {
        const response = await axios.get(
          "https://api.coingecko.com/api/v3/coins/markets",
          {
            params: {
              vs_currency: "usd",
              ids: "bitcoin,ethereum,cardano,tron,gnosis,weth",
              order: "market_cap_desc",
              per_page: 6,
              sparkline: false,
            },
          }
        );

        if (response.data && Array.isArray(response.data)) {
          const formattedData = response.data.map((token) => ({
            symbol: token.symbol.toUpperCase(),
            iconUrl: token.image,
            aprChange: token.price_change_percentage_24h,
          }));
          setTokenData(formattedData);
        }
      } catch (error) {
        console.error("Error fetching APR data:", error);
      }
    };

    fetchTokenAPR();
  }, []);

  const handleStaking = async () => {
    if (!signer || !sdk) {
      console.error("Signer or SDK not found.");
      setToastMessage("Signer or SDK not found.");
      setToastType("error");
      return;
    }

    try {
      const stakingAmountInWei = ethers.utils.parseEther(
        stakingAmount.toString()
      );

      // Step 1: Approve spending of tokens by the staking contract
      const tokenContractAddress = "0xdfc7c877a950e49d2610114102175a06c2e3167a";
      const modeLockContractAddress =
        "0x74B847b308BD89Ef15639E6e4a2544E4b8b8C6B4";
      const tokenContract = new ethers.Contract(
        tokenContractAddress,
        [
          "function approve(address spender, uint256 amount) external returns (bool)",
        ],
        signer
      );
      const approvalTx = await tokenContract.approve(
        modeLockContractAddress,
        stakingAmountInWei.toString()
      );
      await approvalTx.wait();

      // Step 2: Lock tokens in the ModeLock contract
      const modeLockContract = new ethers.Contract(
        modeLockContractAddress,
        ["function lock(uint256 amount) external"],
        signer
      );
      const lockTx = await modeLockContract.lock(stakingAmountInWei);
      await lockTx.wait();

      console.log("Staking successful!");

      await getBalance(walletInfo?.address, sdk);
      setToastMessage("Staking successful!");
      setToastType("success");
    } catch (error) {
      console.error("Staking failed:", error);
      setToastMessage("Staking failed.");
      setToastType("error");
    }
  };
  return (
    <div className={styles.container}>
      <div className={styles.titleContainer}>
        <h2 className={styles.title}>EARN</h2>

        <p>Native Staking</p>
      </div>
      <div className={styles.stakingContainer}>
        <Image
          src="/flat-logo.svg"
          alt="flat-logo"
          width={35}
          height={60}
          className={styles.logo_icon_texture_top}
        />
        <div className={styles.stakingContainerInfo}>
          <p className={styles.stakingContainerTitle}>
            Stake you ETH with trust
          </p>
          <div
            onClick={() => setShowStakingModal(true)}
            className={styles.stakeButton}
          >
            <p>Stake Now </p>
            <FaArrowRightLong />
          </div>
        </div>
      </div>
      <div className={styles.tokenList}>
        {tokenData &&
          tokenData.map((token, index) => (
            <div key={index} className={styles.tokenItem}>
              <img
                src={token.iconUrl}
                alt={`${token?.symbol} Icon`}
                className={styles.tokenIcon}
              />
              <div className={styles.tokenInfo}>
                <div className={styles.tokenSymbol}>{token?.symbol}</div>
                <div
                  className={`${styles.tokenApr} ${
                    token?.aprChange >= 0 ? styles.green : styles.red
                  }`}
                >
                  APR {token?.aprChange.toFixed(2)}%
                </div>
              </div>
            </div>
          ))}
      </div>
      {showStakingModal && (
        <StackBottomSheet
          showStakingModal={showStakingModal}
          setShowStakingModal={setShowStakingModal}
          setStakingAmount={setStakingAmount}
          stakingAmount={stakingAmount}
          handleStaking={handleStaking}
        />
      )}
      <Toast
        message={toastMessage}
        type={toastType}
        onClose={() => setToastMessage("")}
      />
    </div>
  );
}

export default Earn;
