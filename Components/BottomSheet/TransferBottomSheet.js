import React, { useState } from "react";
import styles from "./BottomSheet.module.css";
import { Sheet } from "react-modal-sheet";
import { IoCloseCircleOutline } from "react-icons/io5";

const TransferBottomSheet = ({ showTransferModal, setShowTransferModal, handleTransfer, loading, setAmount, setRecipient, recipient, amount }) => {


  const handleTransferClick = () => {
    handleTransfer();
  };

  return (
    <div>
      <Sheet
        isOpen={showTransferModal}
        onClose={() => setShowTransferModal(false)}
        snapPoints={[500, 400, 100, 0]}
      >
        <Sheet.Container
          style={{
            backgroundColor: "#000",
            color: "#fff",
            border: "1px solid #fff",
          }}
        >
          <Sheet.Header />
          <div className={styles.modalContent}>
            <IoCloseCircleOutline
              color="#fff"
              onClick={() => setShowTransferModal(false)}
              style={{ cursor: "pointer" }}
            />
            <h2>Transfer Tokens</h2>
            <input
              type="text"
              className={styles.input}
              placeholder="Recipient Address"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
            />
            <input
              type="text"
              className={styles.input}
              placeholder="Enter amount to transfer"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <button
              className={styles.confirmButton}
              onClick={handleTransferClick}
              disabled={loading}
            >
              {loading ? "Transferring..." : "Transfer"}
            </button>
          </div>
        </Sheet.Container>
        <Sheet.Backdrop />
      </Sheet>
    </div>
  );
};

export default TransferBottomSheet;
