import CryptoJS from 'crypto-js';

export const hashStr = (str: string) => {
  return CryptoJS.SHA256(str).toString(CryptoJS.enc.Hex);
};
