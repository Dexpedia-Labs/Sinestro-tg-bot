import React from "react";
import styles from "./BottomSheet.module.css";
import { Sheet } from "react-modal-sheet";
import { IoCloseCircleOutline } from "react-icons/io5";
function StackBottomSheet({
  showStakingModal,
  setShowStakingModal,
  setStakingAmount,
  stakingAmount,
  loading,
  handleStaking,
}) {
  return (
    <div>
      <Sheet
        isOpen={showStakingModal}
        onClose={() => setShowStakingModal(false)}
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
              onClick={() => setShowStakingModal(false)}
              style={{ cursor: "pointer" }}
            />
            <h2>Stake Tokens</h2>
            <input
              type="text"
              className={styles.input}
              placeholder="Enter amount to stake"
              value={stakingAmount}
              onChange={(e) => setStakingAmount(e.target.value)}
            />
            <button
              className={styles.confirmButton}
              onClick={handleStaking}
              disabled={loading}
            >
              {loading ? "Staking..." : "Stake"}
            </button>
          </div>
        </Sheet.Container>
        <Sheet.Backdrop />
      </Sheet>
    </div>
  );
}

export default StackBottomSheet;
