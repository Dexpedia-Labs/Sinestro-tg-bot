import React, { useState, useContext } from "react";
import { useBuyWithFiatQuote } from "thirdweb/react";
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
const WalletDashboard = () => {
  const router = useRouter();
  const {
    walletInfo,
    tokens,
    signer,
    balance,
    sdk,
    getBalance,
    client,
    toastMessage,
    setToastMessage,
    toastType,
    setToastType,
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

  const { data: quote, error: quoteError } = useBuyWithFiatQuote({
    client,
    fromCurrencySymbol: "USD",
    toChainId: 1,
    toAmount: amount || 10,
    toTokenAddress: tokenAddress || NATIVE_TOKEN_ADDRESS,
    toAddress: walletInfo?.address,
    isTestMode: false,
  });

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

  return (
    <div className={styles.dashboard}>
      {showUserProfile ? (
        <UserProfile handleCloseUserProfile={handleCloseUserProfile} />
      ) : (
        walletInfo && (
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
                <div className={styles.btn}>
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
                        <div>
                          {" "}
                          <Image
                            src={token?.icon}
                            width={30}
                            height={30}
                            alt="token"
                          />{" "}
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
      {!walletInfo && (
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

      <Toast
        message={toastMessage}
        type={toastType}
        onClose={() => setToastMessage("")}
      />
    </div>
  );
};

export default WalletDashboard;
