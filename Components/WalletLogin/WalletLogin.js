import React, { useState } from "react";
import { useRouter } from "next/router";
import { ethers } from "ethers";
import styles from "./Login.module.css";

const WalletLogin = () => {
  const [seedPhrase, setSeedPhrase] = useState("");
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleLogin = (e) => {
    e.preventDefault();
    setError(null);

    try {
      const recreatedWallet = ethers.Wallet.fromMnemonic(seedPhrase);
      const address = recreatedWallet?.address;
      const publicKey = recreatedWallet?.publicKey;
      localStorage.setItem("walletMnemonic", seedPhrase);
      localStorage.setItem("walletAddress", address);
      localStorage.setItem("walletPublicKey", publicKey);
      router.push("/dashboard");
    } catch (err) {
      setError(
        "Error logging in. Please check your seed phrase and try again."
      );
      console.error("Error logging in:", err);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <h1>Login</h1>
      <form onSubmit={handleLogin} className={styles.form}>
        <div className={styles.inputContainer}>
          <label className={styles.label}>Seed Phrase</label>
          <textarea
            value={seedPhrase}
            onChange={(e) => setSeedPhrase(e.target.value)}
            required
            className={styles.textarea}
          />
        </div>
        {error && <p className={styles.error}>{error}</p>}
        <button className={styles.button} type="submit">
          Login
        </button>
      </form>
    </div>
  );
};
export default WalletLogin;
