/* eslint-disable @typescript-eslint/no-unused-vars */
import { modPow, simpleHash, modInverse } from "./math";

// Інтерфейси для ключів RSA
export interface RSAPublicKey {
  e: bigint;
  n: bigint;
}

export interface RSAPrivateKey {
  d: bigint;
  n: bigint;
}

// Генерація довготривалої пари ключів RSA (для спрощення симулятора беремо невеликі прості)
export function generateRSAKeyPair(p: bigint, q: bigint): { publicKey: RSAPublicKey; privateKey: RSAPrivateKey } {
  const n = p * q;
  const phi = (p - 1n) * (q - 1n);
  const e = 65537n;
  const d = modInverse(e, phi);

  return {
    publicKey: { e, n },
    privateKey: { d, n }
  };
}

// Створення цифрового підпису RSA: S = Hash(message)^d % n
export function signRSA(message: string, privateKey: RSAPrivateKey): bigint {
  const hash = simpleHash(message, privateKey.n);
  return modPow(hash, privateKey.d, privateKey.n);
}

// Верифікація підпису RSA: Hash(message) == S^e % n
export function verifyRSA(message: string, signature: bigint, publicKey: RSAPublicKey): boolean {
  const hash = simpleHash(message, publicKey.n);
  const decryptedHash = modPow(signature, publicKey.e, publicKey.n);
  return hash === decryptedHash;
}

// Симетричне "шифрування" для STS Handshake на базі спільного ключа K (імітація AES)
// Перетворює об'єкт у XOR-кований шістнадцятковий рядок, щоб Єва бачила "кашу"
export function encryptAES(plainText: string, key: bigint): string {
  let result = "";
  const keyStr = key.toString();
  for (let i = 0; i < plainText.length; i++) {
    const charCode = plainText.charCodeAt(i);
    const keyChar = keyStr.charCodeAt(i % keyStr.length);
    // Робимо XOR операцію і переводимо в HEX
    const encrypted = charCode ^ keyChar;
    result += encrypted.toString(16).padStart(2, '0');
  }
  return result;
}

// Дешифрування (XOR операція є зворотною)
export function decryptAES(cipherText: string, key: bigint): string {
  let result = "";
  const keyStr = key.toString();
  try {
    for (let i = 0; i < cipherText.length; i += 2) {
      const hex = cipherText.substring(i, i + 2);
      const charCode = parseInt(hex, 16);
      const keyChar = keyStr.charCodeAt((i / 2) % keyStr.length);
      result += String.fromCharCode(charCode ^ keyChar);
    }
    return result;
  } catch (e) {
    return "[ПОМИЛКА ДЕШИФРУВАННЯ]: Синтаксична деструкція блоку (Хибний ключ)";
  }
}