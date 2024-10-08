import React, { useState, useContext, useEffect } from "react";
import {
  AutoConnect,
  ConnectEmbed,
  useActiveAccount,
  useBuyWithFiatQuote,
} from "thirdweb/react";
import { useRouter } from "next/router";
import Image from "next/image";
import Header from "../Header/Header";
import styles from "./WalletDashboard.module.css";
import { WalletContext } from "../../Context/WalletContext";
import { NATIVE_TOKEN_ADDRESS } from "thirdweb";
import SendTokens from "../SendTokens/SendTokens";
import ImageContainer from "../ImageContainers/ImageContainer";
import BuyTokenBottomSheet from "../BottomSheet/BuyTokenBottomSheet";
import OnRampLinkBottomSheet from "../BottomSheet/OnRampLinkBottomSheet";
import Toast from "../Toast/Toast";
import UserProfile from "../UserProfile/UserProfile";
import { IoIosArrowRoundDown, IoIosArrowRoundUp } from "react-icons/io";
import { FaWallet } from "react-icons/fa6";
import { BiSolidMessageRoundedDots } from "react-icons/bi";
import LoadingScreen from "../LoadingScreen/LoadingScreen";
import TransactionHistory from "../TransactionHistory/TransactionHistory";
import PortfolioBottomSheet from "../BottomSheet/PortfolioBottomSheet";
import QRCode from "../QRCode/QRCode";
import { createWallet, inAppWallet } from "thirdweb/wallets";
import { ethers } from "ethers";
import { EmbeddedWalletSdk } from "@thirdweb-dev/wallets";
import { CHAINS, THIRDWEB_CLIENT_ID, THIRDWEB_SECRET_KEY } from "../Constants";
import { useActiveWalletChain } from "thirdweb/react";

const wallets = [
  inAppWallet(),
  createWallet("io.metamask"),
  createWallet("com.coinbase.wallet"),
  createWallet("me.rainbow"),
];
const WalletDashboard = () => {
  const router = useRouter();
  const {
    walletInfo,
    tokens,
    balance,
    getBalance,
    client,
    toastMessage,
    setToastMessage,
    toastType,
    setToastType,
    account,
  } = useContext(WalletContext);
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const [tokenAddress, setTokenAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [transactionType, setTransactionType] = useState("buy");
  const [loading, setLoading] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [onRampLink, setOnRampLink] = useState("");
  const [showOnRamp, setShowOnRamp] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [showTransactionHistory, setShowTransactionHistory] = useState(false);
  const [showPortfolio, setShowPortfolio] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const activeAccount = useActiveAccount();
  const [signer, setSigner] = useState();
  const [sdk, setSdk] = useState();
  const activeChain = useActiveWalletChain();
  

  const { data: quote, error: quoteError } = useBuyWithFiatQuote({
    client,
    fromCurrencySymbol: "USD",
    toChainId: 1,
    toAmount: amount || 10,
    toTokenAddress: tokenAddress || NATIVE_TOKEN_ADDRESS,
    toAddress: activeAccount?.address,
    isTestMode: true,

  });

  useEffect(() => {
    if (activeAccount && activeChain) {
      const rpcBaseUrl = activeChain?.rpc.split('${')[0];
      const provider = new ethers.providers.JsonRpcProvider(
        rpcBaseUrl
      );
      const thirdwebEmbeddedWallet = new EmbeddedWalletSdk({
        clientId: THIRDWEB_CLIENT_ID,
        chain: CHAINS,
      });
      setSdk(thirdwebEmbeddedWallet);
      const activeSigner = provider.getSigner(activeAccount.address);
      setSigner(activeSigner);
    }
  }, [activeAccount, activeChain]);

  useEffect(() => {
    if (walletInfo?.address && sdk) {
      getBalance(account.address, sdk);
      const interval = setInterval(() => {
        getBalance(walletInfo.address, sdk);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [walletInfo, sdk]);

  const handleFiatPurchase = async () => {
    if (
      sdk &&
      activeAccount?.address &&
      tokenAddress &&
      amount &&
      amount >=  10
    ) {
      setLoading(true);
      try {
        if (quote) {
          setOnRampLink(quote.onRampLink);
          setShowOnRamp(true);
          await getBalance(walletInfo.address, sdk);
        }
      } catch (error) {
        console.error("Fiat purchase failed:", error);
        setToastMessage(
          "Purchase failed! Please check the console for more details."
        );
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

  const handleClaimMode = async () => {
    localStorage.removeItem("walletAddress");
    router.push("/");
  };

  const toggleBalanceVisibility = () => {
    setIsBalanceVisible(!isBalanceVisible);
  };

  const handleShowUserProfile = () => {
    setShowUserProfile(true);
  };

  const handleCloseUserProfile = () => {
    setShowUserProfile(false);
  };

  const handleCloseHistory = () => {
    setShowTransactionHistory(false);
  };

  const handleShowPortfolio = () => {
    setShowPortfolio(true);
    setShowModal(true);
  };
  const handleCloseQRCode = () => {
    setShowQRCode(false);
  };
  return (
    <div className={styles.dashboard}>
      <AutoConnect client={client} timeout={15000} wallets={wallets} />

      {showUserProfile ? (
        <UserProfile handleCloseUserProfile={handleCloseUserProfile} />
      ) : showTransactionHistory ? (
        <TransactionHistory handleCloseHistory={handleCloseHistory} />
      ) : showQRCode ? (
        <QRCode handleCloseQRCode={handleCloseQRCode} />
      ) : (
        activeAccount && (
          <div className={styles.container}>
            <div>
              <h2 className={styles.heading}>HOME</h2>
            </div>
            {!showUserProfile && (
              <Header
                balance={balance}
                toggleBalanceVisibility={toggleBalanceVisibility}
                isBalanceVisible={isBalanceVisible}
                handleShowUserProfile={handleShowUserProfile}
                setShowPortfolio={handleShowPortfolio}
                setShowQRCode={setShowQRCode}
              />
            )}
            <div className={styles.dashboardContainer}>
              <ImageContainer handleClaimMode={handleClaimMode} />
              <div className={styles.btns_grp}>
                <div
                  className={styles.btn}
                  onClick={() => setShowTransferModal(true)}
                >
                  <IoIosArrowRoundUp className={styles.buttonDiv} />
                  <p>Send</p>
                </div>
                <div className={styles.btn}>
                  <IoIosArrowRoundDown className={styles.buttonDiv} />
                  <p>Receive</p>
                </div>
                <div className={styles.btn} onClick={buyTokens}>
                  <FaWallet className={styles.buttonDiv} />
                  <p>Buy</p>
                </div>
                <div
                  className={styles.btn}
                  onClick={() => setShowTransactionHistory(true)}
                >
                  <BiSolidMessageRoundedDots className={styles.buttonDiv} />
                  <p>Messages</p>
                </div>
              </div>
              <div className={styles.switchableTabs}>
                <p className={styles.claimInfo}>Assets</p>
              </div>
              <div>
                {/* tokens list map  */}
                <div className={styles.hotInfo}>
                  {tokens.map((token, index) => (
                    <div key={index} className={styles.tokenInfo}>
                      <div className={styles.token_left_detail}>
                        <div className={styles.token_icon}>
                          <Image
                            src={token?.icon}
                            width={30}
                            height={30}
                            alt="token"
                          />
                          <div className={styles.token_marker}>
                            <span className={styles.marker_text}>M</span>
                          </div>
                        </div>
                        <div className={styles.token_mid_info}>
                          <div className={styles.tokenSymbol}>
                            {token.symbol}
                          </div>
                          <div className={styles.amount_sec}>
                            <span className={styles.running_value}>
                              {token.aprChange
                                ? `${token.aprChange.toFixed(2)}%`
                                : "0.00%"}
                            </span>
                            <span className={styles.actual_price}>$0.62</span>
                          </div>
                        </div>
                      </div>
                      <div className={styles.tokenValue}>
                        {parseFloat(token.value) / Math.pow(10, token.decimals)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )
      )}
      {!activeAccount && (
        <div className={styles.noWallet}>
          <p>No wallet connected. Please connect your wallet.</p>
        </div>
      )}
      {showTransferModal && (
        <SendTokens
          signer={signer}
          address={walletInfo?.address}
          showTransferModal={showTransferModal}
          setShowTransferModal={setShowTransferModal}
          tokens={tokens}
        />
      )}
      {showModal && showPortfolio && (
        <PortfolioBottomSheet
          showModal={showModal}
          setShowModal={setShowModal}
        />
      )}
      {showModal && !showPortfolio && !showOnRamp && (
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
      <Toast
        message={toastMessage}
        type={toastType}
        onClose={() => setToastMessage("")}
      />
    </div>
  );
};

export default WalletDashboard;
