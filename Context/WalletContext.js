import React, { createContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';

export const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
    const [walletInfo, setWalletInfo] = useState(null);
  
    useEffect(() => {
      const loadWallet = () => {
        const mnemonic = localStorage.getItem("walletMnemonic");
        if (mnemonic) {
          try {
            const wallet = ethers.Wallet.fromMnemonic(mnemonic);
            setWalletInfo({
              address: wallet.address,
              mnemonic: mnemonic,
              privateKey: wallet.privateKey,
            });
          } catch (error) {
            console.error("Failed to create wallet from mnemonic:", error);
          }
        }
      };
  
      window.addEventListener('storage', loadWallet);
      loadWallet();
  
      return () => {
        window.removeEventListener('storage', loadWallet);
      };
    }, []);
  
    return (
      <WalletContext.Provider value={{ walletInfo, setWalletInfo }}>
        {children}
      </WalletContext.Provider>
    );
  };
  
