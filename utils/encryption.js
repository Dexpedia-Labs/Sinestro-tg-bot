import CryptoJS from 'crypto-js';

const secretKey = process.env.NEXT_PUBLIC_SECRET_KEY || 'default_secret_key';

export const encryptMnemonic = (mnemonic) => {
    console.log(mnemonic);
  return CryptoJS.AES.encrypt(mnemonic, secretKey).toString();
};

export const decryptMnemonic = (ciphertext) => {
  const bytes = CryptoJS.AES.decrypt(ciphertext, secretKey);
  return bytes.toString(CryptoJS.enc.Utf8);
};
