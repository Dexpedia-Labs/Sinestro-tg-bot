import React, { useState, useEffect, useContext } from "react";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import styles from "./CreateWallet.module.css";
import WalletInfo from "../WalletInfo/WalletInfo";
import WalletLogin from "../WalletLogin/WalletLogin";
import ImportWallet from "../ImportWallet/ImportWallet";
import { ConnectButton } from "thirdweb/react";
import { createWallet, inAppWallet } from "thirdweb/wallets";
import { WalletContext } from "../../Context/WalletContext";
import { THIRDWEB_CLIENT_ID, THIRDWEB_SECRET_KEY } from "../Constants";
import BottomSheetIframe from "../BottomSheet/BottomSheetIframe"; // Assuming you have a component for bottom sheet iframe

const wallets = [
  inAppWallet(),
  createWallet("io.metamask"),
  createWallet("com.coinbase.wallet"),
  createWallet("me.rainbow"),
];

const chains = [
  {
    id: 919,
    name: "Mode TestNet",
    testnet: true,
    rpc: `https://919.rpc.thirdweb.com/${THIRDWEB_SECRET_KEY}`,
  },
  {
    id: 34443,
    name: "Mode Network",
    testnet: false,
    rpc: `https://34443.rpc.thirdweb.com/${THIRDWEB_SECRET_KEY}`,
  },
];

const CreateWalletPage = () => {
  const [walletCreated, setWalletCreated] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showImportWallet, setShowImportWallet] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [iframeSrc, setIframeSrc] = useState('');
  const router = useRouter();
  const { client, setAccount } = useContext(WalletContext);

  useEffect(() => {
    const walletAddress = localStorage.getItem("walletAddress");
    if (walletAddress) {
      setLoading(true);
      // router.push("/dashboard");
    }
  }, [router]);

  const handleBackToCreateWallet = () => {
    setShowLogin(!showLogin);
  };

  const handleOnConnect = async (account) => {
    console.log(account);
    setAccount(account.getAccount());
    const options = {
      client: client,
    };
    const accountInfo = await account?.autoConnect(options);
    localStorage.setItem("walletAddress", accountInfo?.address);
    console.log(accountInfo);
    console.log(account);
    router.push("/dashboard");
  };
  useEffect(() => {
    const originalWindowOpen = window.open;
    window.open = function (url, name, specs) {
      console.log("Opening URL:", url); // Log the URL being opened
      setIframeSrc(url);
      setSheetOpen(true);
      return {
        focus: () => {},
        close: () => setSheetOpen(false),
      };
    };

    return () => {
      window.open = originalWindowOpen;
    };
  }, []);

  return (
    <>
      {!walletCreated ? (
        <>
          <div>
            <Head>
              <title>Create Wallet</title>
              <meta name="description" content="Create a new Ethereum wallet" />
              <meta name="viewport" content="width=device-width, initial-scale=1" />
              <link rel="icon" href="/favicon.ico" />
            </Head>
            <main className={styles.main}>
              {showLogin ? (
                <WalletLogin handleBackToCreateWallet={handleBackToCreateWallet} />
              ) : showImportWallet ? (
                <ImportWallet showImportWallet={showImportWallet} setShowImportWallet={setShowImportWallet} />
              ) : (
                <div className={styles.container}>
                  <div className={styles.logoContainer}>
                    <Image
                      src="/logo.svg"
                      alt="Wallet Icon"
                      width={300}
                      height={50}
                      className={styles.image}
                    />
                    <p className={styles.description}>
                      The next generation of Telegram wallets: Secure, Fast, and seamlessly integrated with the Mode Network for an unparalleled user experience
                    </p>
                    <ConnectButton
                      client={client}
                      connectModal={{
                        size: "compact",
                        title: "Dexpedia",
                        showThirdwebBranding: false,
                        titleIcon: "/flat-logo-1.png",
                        backgroundColor: "#2b73ff",
                        color: "#FFF",
                        marginTop: "10%",
                        width: "87vw",
                      }}
                      connectButton={{
                        style: {
                          backgroundColor: "#2B73FF",
                          color: "#FFF",
                          marginTop: "10%",
                          width: "87vw",
                        },
                      }}
                      chains={chains}
                      wallets={wallets}
                      walletConnect={THIRDWEB_CLIENT_ID}
                      onConnect={handleOnConnect}
                      showThirdwebBranding={false}
                    />
                  </div>
                  <div className={styles.imageContainer}>
                    <span className={styles.blur_bg}></span>
                    <Image
                      src="/logo-icon-texture-top.svg"
                      alt="logo-icon-texture-top"
                      width={147}
                      height={190}
                      className={styles.logo_icon_texture_top}
                    />
                    <Image
                      src="/logo-icon-texture-bottom.svg"
                      alt="logo-icon-texture-top"
                      width={147}
                      height={190}
                      className={styles.logo_icon_texture_bottom}
                    />
                  </div>
                </div>
              )}
            </main>
          </div>
        </>
      ) : (
        <WalletInfo />
      )}
      <BottomSheetIframe open={sheetOpen} url={iframeSrc} onClose={() => setSheetOpen(false)} />
    </>
  );
};

export default CreateWalletPage;
