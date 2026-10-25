import CryptoJS from 'crypto-js';

// encrypt

const encrypt = (text: string) => {
  const wordArray = CryptoJS.enc.Utf8.parse(text);
  return CryptoJS.enc.Base64.stringify(wordArray);
};

// decrypt
const decrypt = (text: string) => {
  const parsedWordArray = CryptoJS.enc.Base64.parse(text);
  return parsedWordArray.toString(CryptoJS.enc.Utf8);
};

export default {
  encrypt,
  decrypt,
};
