import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import styles from "./WalletSwap.module.css";
import { TOKENS_PAIR_FOR_SWAP, numberToBigNumberFixed } from "../Constants";
import IUniswapV2Router02 from "@uniswap/v2-periphery/build/IUniswapV2Router02.json";
import Toast from "../Toast/Toast";
function WalletSwap() {
  const [tokenList, setTokenList] = useState([]);
  const [tokenAAddress, setTokenAAddress] = useState("");
  const [tokenBAddress, setTokenBAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: null, type: null });
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [signer, setSigner] = useState(null);
  const [provider, setProvider] = useState(null);
  useEffect(() => {
    const initializeWallet = async () => {
      try {
        const walletMnemonic = localStorage.getItem("walletMnemonic");
        if (!walletMnemonic) throw new Error("Wallet mnemonic not found.");

        const mainnetProvider = new ethers.providers.JsonRpcProvider(
          "https://mainnet.mode.network"
        );

        const wallet = ethers.Wallet.fromMnemonic(walletMnemonic);
        const connectedWallet = wallet.connect(mainnetProvider);
        setProvider(mainnetProvider);
        setSigner(connectedWallet);
        setIsWalletConnected(true);
      } catch (error) {
        console.error("Failed to connect wallet:", error);
        setMessage({
          text: "Failed to connect wallet. Please try again.",
          type: "error",
        });
      }
    };

    const fetchTokenList = async () => {
      try {
        setTokenList(TOKENS_PAIR_FOR_SWAP);
      } catch (error) {
        console.error("Failed to fetch token list:", error);
        setMessage({
          text: "Failed to fetch token list. Please try again.",
          type: "error",
        });
      }
    };

    initializeWallet();
    fetchTokenList();
  }, []);

  const handleApproveAndSwap = async () => {
    setLoading(true);
    setMessage({ text: null, type: null });

    try {
      if (!provider || !signer) {
        throw new Error("Provider or signer not available.");
      }
      if (!tokenAAddress || !tokenBAddress || !amount) {
        throw new Error("Missing required inputs.");
      }
      const tokenAInfo = tokenList.find(
        (token) => token.contractAddress === tokenAAddress
      );
      const tokenBInfo = tokenList.find(
        (token) => token.contractAddress === tokenBAddress
      );
      if (!tokenAInfo || !tokenBInfo) {
        throw new Error("Tokens not found in available token list.");
      }

      const tokenAContract = new ethers.Contract(
        tokenAInfo.contractAddress,
        ["function approve(address spender, uint256 amount) returns (bool)"],
        signer
      );

      const tokenAmountIn = numberToBigNumberFixed(
        +amount,
        tokenAInfo.decimals
      );
      const deadline = Math.floor(Date.now() / 1000) + 60 * 20;
      const path = [tokenAAddress, tokenBAddress];
      const gasLimit = ethers.BigNumber.from("800000");

      const routerContract = new ethers.Contract(
        "0x5D61c537393cf21893BE619E36fC94cd73C77DD3",
        IUniswapV2Router02.abi,
        signer
      );
      console.log(routerContract);
      let amountsOut;
        amountsOut = [
          ethers.BigNumber.from("1000000000000000000"),
          ethers.BigNumber.from("2000000000000000000"), 
        ];
      // } else {
      //   amountsOut = await routerContract.getAmountsOut(tokenAmountIn, path);
      // }
      console.log(
        "Amounts Out:",
        amountsOut.map((amount) => amount.toString())
      );

      const tokenAmountOutMin = amountsOut[1].sub(amountsOut[1].div(10));

      if (tokenAAddress === "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE") {
        const wethContract = new ethers.Contract(
          "0x4200000000000000000000000000000000000006",
          ["function deposit() payable"],
          signer
        );
        await wethContract.deposit({ value: tokenAmountIn });
      }

      const approveTx = await tokenAContract.approve(
        "0x5D61c537393cf21893BE619E36fC94cd73C77DD3",
        tokenAmountIn
      );
      await approveTx.wait();

      let tx;
      if (tokenAAddress === "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE") {
        console.log("In 1st condition");
        tx =
          await routerContract.swapExactETHForTokensSupportingFeeOnTransferTokens(
            tokenAmountOutMin,
            path,
            signer.address,
            deadline,
            { value: tokenAmountIn, gasLimit }
          );
      } else if (
        tokenBAddress === "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"
      ) {
        console.log("In 2nd condition");
        tx =
          await routerContract.swapExactTokensForETHSupportingFeeOnTransferTokens(
            tokenAmountIn,
            tokenAmountOutMin,
            path,
            signer.address,
            deadline,
            { gasLimit }
          );
      } else {
        tx =
          await routerContract.swapExactTokensForTokensSupportingFeeOnTransferTokens(
            tokenAmountIn,
            tokenAmountOutMin,
            path,
            signer.address,
            deadline,
            { gasLimit }
          );
      }

      const receipt = await tx.wait();
      console.log("Swap transaction receipt:", receipt);

      setMessage({ text: "Swap successful", type: "success" });
    } catch (error) {
      console.error("Error while swapping:", error);
      let errorMsg =
        "Transaction failed. Please check your transaction details and try again.";
      if (error.code === "INSUFFICIENT_FUNDS") {
        errorMsg =
          "Insufficient funds for gas * price + value. Please check your balance and try again.";
      } else if (error.code === "UNPREDICTABLE_GAS_LIMIT") {
        errorMsg = "Unpredictable gas limit. Please try again later.";
      } else if (error.code === "NETWORK_ERROR") {
        errorMsg = "Network error. Please check your connection and try again.";
      }
      setMessage({ text: errorMsg, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseToast = () => {
    setMessage({ text: null, type: null });
  };

  return (
    <div className={styles.swapContainer}>
      <Toast
        message={message.text}
        type={message.type}
        onClose={handleCloseToast}
      />
      <h2 className={styles.title}>Token Swap</h2>
      {isWalletConnected ? (
        <>
          <div className={styles.inputGroup}>
            <label htmlFor="tokenAAddress" className={styles.label}>
              Token A:
            </label>
            <select
              id="tokenAAddress"
              className={styles.input}
              value={tokenAAddress}
              onChange={(e) => setTokenAAddress(e.target.value)}
            >
              <option value="">Select Token A</option>
              {tokenList.map((token, index) => (
                <option
                  key={`${token.contractAddress}-${index}`}
                  value={token.contractAddress}
                >
                  {token.name} ({token.symbol})
                </option>
              ))}
            </select>
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="tokenBAddress" className={styles.label}>
              Token B:
            </label>
            <select
              id="tokenBAddress"
              className={styles.input}
              value={tokenBAddress}
              onChange={(e) => setTokenBAddress(e.target.value)}
            >
              <option value="">Select Token B</option>
              {tokenList.map((token, index) => (
                <option
                  key={`${token.contractAddress}-${index}`}
                  value={token.contractAddress}
                >
                  {token.name} ({token.symbol})
                </option>
              ))}
            </select>
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="amount" className={styles.label}>
              Amount:
            </label>
            <input
              type="number"
              id="amount"
              className={styles.input}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <button
            className={styles.swapButton}
            onClick={handleApproveAndSwap}
            disabled={loading}
          >
            {loading ? "Swapping..." : "Approve and Swap"}
          </button>
        </>
      ) : (
        <p>Please connect your wallet to proceed.</p>
      )}
    </div>
  );
}

export default WalletSwap;
