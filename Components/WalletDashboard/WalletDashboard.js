import React, { useState, useContext, useEffect } from "react";
import { ethers } from "ethers";
import { ThirdwebSDK } from "@thirdweb-dev/sdk";
import { useBuyWithFiatQuote, useSendTransaction } from "thirdweb/react";
import { useRouter } from "next/router";
import Image from "next/image";
import Header from "../Header/Header";
import styles from "./WalletDashboard.module.css";
import { WalletContext } from "../../Context/WalletContext";
import {
  THIRDWEB_CLIENT_ID,
  THIRDWEB_SECRET_KEY,
  TOKEN_OPTIONS,
} from "../Constants";
import {
  NATIVE_TOKEN_ADDRESS,
  createThirdwebClient,
  getContract,
  resolveMethod,
  prepareContractCall,
} from "thirdweb";
import { defineChain } from "thirdweb/chains";
import BalanceContainer from "../BalanceContainer/BalanceContainer";
import ImageContainer from "../ImageContainers/ImageContainer";
import Spinner from "../Spinner/Spinner";
import BuyTokenBottomSheet from "../BottomSheet/BuyTokenBottomSheet";
import OnRampLinkBottomSheet from "../BottomSheet/OnRampLinkBottomSheet";
import StackBottomSheet from "../BottomSheet/StackBottomSheet";
import Toast from "../Toast/Toast";

const WalletDashboard = () => {
  const router = useRouter();
  const { walletInfo } = useContext(WalletContext);
  const [balance, setBalance] = useState("0.0");
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const [sdk, setSdk] = useState(null);
  const [signer, setSigner] = useState(null);
  const [tokenAddress, setTokenAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [transactionType, setTransactionType] = useState("buy");
  const [loading, setLoading] = useState(false);
  const [tokenBalances, setTokenBalances] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showStakingModal, setShowStakingModal] = useState(false);
  const [activeTab, setActiveTab] = useState("Tokens");
  const [onRampLink, setOnRampLink] = useState("");
  const [showOnRamp, setShowOnRamp] = useState(false);
  const [stakingAmount, setStakingAmount] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("");
  const provider = new ethers.providers.JsonRpcProvider(
    "https://mainnet.mode.network"
  );
  const client = createThirdwebClient({
    clientId: THIRDWEB_CLIENT_ID,
    secretKey: THIRDWEB_SECRET_KEY,
  });

  const { data: quote, error: quoteError } = useBuyWithFiatQuote({
    client,
    fromCurrencySymbol: "USD",
    toChainId: 1,
    toAmount: amount || 10,
    toTokenAddress: tokenAddress || NATIVE_TOKEN_ADDRESS,
    toAddress: walletInfo?.address,
    isTestMode: false,
  });

  const contract = getContract({
    address: "0x74B847b308BD89Ef15639E6e4a2544E4b8b8C6B4",
    chain: defineChain(34443),
    client,
  });

  const {
    mutate: sendTransaction,
    isLoading,
    isError,
    error: stakeError,
  } = useSendTransaction();

  useEffect(() => {
    const initializeSdk = async () => {
      if (walletInfo?.privateKey) {
        try {
          const sdkInstance = ThirdwebSDK.fromPrivateKey(
            walletInfo.privateKey,
            "https://mainnet.mode.network",
            {
              clientId: THIRDWEB_CLIENT_ID,
              secretKey: THIRDWEB_SECRET_KEY,
            }
          );
          setSdk(sdkInstance);
          const activeSigner = sdkInstance.getSigner();
          if (activeSigner) {
            setSigner(activeSigner);
            await getBalance(walletInfo?.address, sdkInstance);
            await getOwnedTokens(walletInfo?.address, sdkInstance);
          } else {
            console.error("No active signer found.");
          }
        } catch (error) {
          console.error("Failed to initialize SDK:", error);
        }
      }
    };
    if (walletInfo) initializeSdk();
  }, [walletInfo]);

  const getBalance = async (address, sdk) => {
    try {
      const balance = await provider.getBalance(address);
      setBalance(ethers.utils.formatEther(balance));
    } catch (error) {
      console.error("Failed to get balance:", error);
    }
  };

  const getOwnedTokens = async (address, sdk) => {
    try {
      const balances = await Promise.all(
        TOKEN_OPTIONS.map(async (token) => {
          let tokenBalance;
          if (token.value === NATIVE_TOKEN_ADDRESS) {
            tokenBalance = await sdk.wallet.balance();
          } else {
            tokenBalance = await sdk.wallet.balance(token.value);
          }
          return {
            name: token.label,
            balance: ethers.utils.formatEther(tokenBalance.value),
          };
        })
      );
      setTokenBalances(balances);
    } catch (error) {
      console.error("Failed to get token balances:", error);
    }
  };

  const handleFiatPurchase = async () => {
    if (sdk && walletInfo?.address && tokenAddress && amount && amount >= 10) {
      setLoading(true);
      try {
        if (quote) {
          setOnRampLink(quote.onRampLink);
          setShowOnRamp(true);
          getBalance(walletInfo.address, sdk);
        }
      } catch (error) {
        console.error("Fiat purchase failed:", error);
        setToastMessage("Purchase failed! Please check the console for more details.");
        setToastType("error");
      } finally {
        setLoading(false);
      }
    } else {
      alert(
        "Please ensure the SDK is initialized, an address, token, and amount are provided and the amount is at least $10."
      );
    }
  };

  const buyTokens = () => {
    setTransactionType("buy");
    setShowModal(true);
    setShowOnRamp(false);
  };

  const handleStaking = async () => {
    if (!signer || !sdk) {
      console.error("Signer or SDK not found.");
      setToastMessage("Signer or SDK not found.");
      setToastType("error");
      return;
    }

    try {
      setLoading(true);
      const stakingAmountInWei = ethers.utils.parseEther(stakingAmount.toString());

      // Step 1: Approve spending of tokens by the staking contract
      const tokenContractAddress = "0xdfc7c877a950e49d2610114102175a06c2e3167a";
      const modeLockContractAddress = "0x74B847b308BD89Ef15639E6e4a2544E4b8b8C6B4";
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
        [
          "function lock(uint256 amount) external",
        ],
        signer
      );
      const lockTx = await modeLockContract.lock(stakingAmountInWei);
      await lockTx.wait();

      console.log("Staking successful!");

      // Update balance after staking
      await getBalance(walletInfo?.address, sdk);
      await getOwnedTokens(walletInfo?.address, sdk);

      setToastMessage("Staking successful!");
      setToastType("success");

    } catch (error) {
      console.error("Staking failed:", error);
      setToastMessage("Staking failed.");
      setToastType("error");
    } finally {
      setLoading(false);
    }
  };

  const handleClaimMode = async () => {
    localStorage.removeItem("walletAddress");
    router.push("/");
  };

  return (
    <div className={styles.dashboard}>
      {walletInfo ? (
        <div className={styles.dashboard}>
          <Header />
          <div className={styles.dashboardContainer}>
            <div className={styles.tabs}>
              <div
                className={`${styles.tab} ${
                  transactionType === "buy" ? styles.activeTab : ""
                }`}
                onClick={buyTokens}
              >
                <p>Buy</p>
              </div>
              <div
                className={`${styles.tab} ${
                  transactionType === "sell" ? styles.activeTab : ""
                }`}
                onClick={() => setTransactionType("sell")}
              >
                <p>Sell</p>
              </div>
            </div>
            <BalanceContainer
              balance={balance}
              isBalanceVisible={isBalanceVisible}
              setIsBalanceVisible={setIsBalanceVisible}
              signer={signer}
              contract={contract}
            />
            <ImageContainer
              setShowStakingModal={setShowStakingModal}
              handleClaimMode={handleClaimMode}
            />
            <div className={styles.switchableTabs}>
              <div
                className={`${styles.switchableTab} ${
                  activeTab === "Tokens" ? styles.activeTab : ""
                }`}
                onClick={() => setActiveTab("Tokens")}
              >
                <p className={styles.claimInfo}>Tokens</p>
              </div>
              <div
                className={`${styles.switchableTab} ${
                  activeTab === "NFTs" ? styles.activeTab : ""
                }`}
                onClick={() => setActiveTab("NFTs")}
              >
                <p className={styles.claimInfo}>NFTs</p>
              </div>
              <div
                className={styles.activeIndicator}
                style={{
                  backgroundColor: "#2b73ff",
                  width: activeTab === "Tokens" ? "17%" : "15%",
                  left: activeTab === "Tokens" ? "2%" : "21%",
                }}
              ></div>
            </div>
            <div className={styles.hotContainer}>
              <div className={styles.hotInfo}>
                <div className={styles.hotIcon}>
                  <Image
                    src="/fireIcon.png"
                    layout="fixed"
                    width={50}
                    height={50}
                    alt="fireIcon"
                    className={styles.fireIcon}
                  />
                </div>
                <div className={styles.hotText}>
                  <p>MODE</p>
                  <p>0.0</p>
                </div>
              </div>
              <p className={styles.claimInfo}>Claim 0.01 (Free)</p>
            </div>
          </div>
        </div>
      ) : (
        <div className={styles.noWallet}>
          <p>No wallet connected. Please connect your wallet.</p>
        </div>
      )}

      {showModal && !showOnRamp && (
        <BuyTokenBottomSheet
          setTokenAddress={setTokenAddress}
          setAmount={setAmount}
          setShowModal={setShowModal}
          showModal={showModal}
          handleFiatPurchase={handleFiatPurchase}
          loading={loading}
          tokenAddress={tokenAddress}
          amount={amount}
          transactionType={transactionType}
        />
      )}

      {showOnRamp && (
        <OnRampLinkBottomSheet
          showModal={showModal}
          setShowModal={setShowModal}
          onRampLink={onRampLink}
          transactionType={transactionType}
        />
      )}

      {showStakingModal && (
        <StackBottomSheet
          showStakingModal={showStakingModal}
          setShowStakingModal={setShowStakingModal}
          setStakingAmount={setStakingAmount}
          stakingAmount={stakingAmount}
          loading={loading}
          handleStaking={handleStaking}
        />
      )}

      <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage("")} />
    </div>
  );
};

export default WalletDashboard;
