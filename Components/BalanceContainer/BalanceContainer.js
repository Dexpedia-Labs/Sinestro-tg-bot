import React, { useState } from "react";
import styles from "./BalanceContainer.module.css";
import { IoEyeOutline } from "react-icons/io5";
import TransferBottomSheet from "../BottomSheet/TransferBottomSheet";
import { ethers } from "ethers";
import { createThirdwebClient, getContract, prepareContractCall, resolveMethod } from "thirdweb";
import { THIRDWEB_CLIENT_ID, THIRDWEB_SECRET_KEY } from "../Constants";
import { defineChain } from "thirdweb/chains";
import Toast from '../Toast/Toast';

const client = createThirdwebClient({
  clientId: THIRDWEB_CLIENT_ID,
  secretKey: THIRDWEB_SECRET_KEY,
});

const contract = getContract({
  client,
  chain: defineChain(34443),
  address: "0xdfc7c877a950e49d2610114102175a06c2e3167a",
});

const BalanceContainer = ({ balance, isBalanceVisible, setIsBalanceVisible, signer }) => {
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("");

  const toggleBalanceVisibility = () => {
    setIsBalanceVisible(!isBalanceVisible);
  };

  const handleTransfer = async () => {
    try {
      if (!signer) {
        console.error("Signer not available.");
        setToastMessage("Signer not available.");
        setToastType("error");
        return;
      }
      const amountInWei = ethers.utils.parseEther(amount.toString());
      const transaction = await prepareContractCall({
        contract,
        method: resolveMethod('transfer'),
        params: [recipient, amountInWei],
      });

      const tx = {
        to: transaction.to,
        data: await transaction.data(),
        value: 0,
        gasLimit: 200000,
      };

      const txResponse = await signer.sendTransaction(tx);
      console.log("Transfer TX Hash:", txResponse.hash);

      setShowTransferModal(false);
      setToastMessage("Transfer successful!");
      setToastType("success");
    } catch (error) {
      console.error("Transfer failed:", error);
      setToastMessage("Transfer failed.");
      setToastType("error");
    }
  };

  return (
    <div className={styles.balanceContainer}>
      <div className={styles.balanceHeader}>
        <span>Total Balance</span>
      </div>
      <div className={styles.balanceContent}>
        <div className={styles.balance}>
          <p>{isBalanceVisible ? `${balance}` : "****"}</p>
        </div>
        <IoEyeOutline size={20} onClick={toggleBalanceVisibility} />
      </div>
      <button className={styles.transferButton} onClick={() => setShowTransferModal(true)}>
        Transfer
      </button>
      <TransferBottomSheet
        showTransferModal={showTransferModal}
        setShowTransferModal={setShowTransferModal}
        handleTransfer={handleTransfer}
        loading={false}
        setRecipient={setRecipient}
        setAmount={setAmount}
        amount={amount}
        recipient={recipient}
      />
      <Toast 
        message={toastMessage} 
        type={toastType} 
        onClose={() => setToastMessage("")} 
      />
    </div>
  );
};

export default BalanceContainer;
