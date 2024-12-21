import { AES, enc, lib } from 'crypto-js';

const secretKey = process.env.SECRET_KEY_ENC as string;

// Encrypts message using AES with a random IV, key is 256 Bit key
export function encryptMessage(message: string) {
  const key = enc.Utf8.parse(secretKey);
  const iv = lib.WordArray.random(16);

  const encrypted = AES.encrypt(message, key, { iv });

  return {
    encryptedMessage: encrypted.toString(),
    iv: iv.toString(enc.Base64),
  };
}

export function decryptMessage(encryptedMessage: string, iv: string) {
  const key = enc.Utf8.parse(secretKey);
  const ivParsed = enc.Base64.parse(iv);

  const decrypted = AES.decrypt(encryptedMessage, key, { iv: ivParsed });
  return decrypted.toString(enc.Utf8);
}
