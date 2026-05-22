/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prefer-const */
import { useState, useCallback } from "react";
import type { SimulationState, SecurityMode, NetworkLog } from "../types/simulation";
import { modPow } from "../crypto/math";
import { signRSA, encryptAES, decryptAES, generateRSAKeyPair, verifyRSA } from "../crypto/primitives";

// const aliceRSA = generateRSAKeyPair(61n, 53n);
const bobRSA = generateRSAKeyPair(47n, 43n);

const INITIAL_STATE: SimulationState = {
  securityMode: "PLAIN_DH",
  currentStep: "NOT_STARTED",
  errorMessage: "",
  alice: { ephemeralPrivate: "", ephemeralPublic: "", computedSecretKey: "", isAuthenticated: false },
  bob: { ephemeralPrivate: "", ephemeralPublic: "", computedSecretKey: "", isAuthenticated: false},
  eve: {
    fake_e1_private: "",
    fake_e2_private: "",
    interceptedA: "",
    interceptedB: "",
    fakeE1: "",
    fakeE2: "",
    computedKeyWithAlice: "",
    computedKeyWithBob: "",
    encryptedPackage: ""
  },
  logs: []
};

export function useSTSExchange(pStr: string, gStr: string) {
  const [state, setState] = useState<SimulationState>(INITIAL_STATE);

  const createLog = (
    sender: NetworkLog["sender"],
    receiver: NetworkLog["receiver"],
    type: NetworkLog["type"],
    message: string
  ): NetworkLog => ({
    id: Math.random().toString(36).substring(7),
    sender, receiver, type, message
  });

  const resetSimulation = useCallback((mode: SecurityMode) => {
    setState({
      ...INITIAL_STATE,
      securityMode: mode
    });
  }, []);

  // КРОК 1: Аліса генерує свій секрет і відправляє відкритий ключ A
  const runRound1 = useCallback(() => {
    setState(prev => {
      const p = BigInt(pStr);
      const g = BigInt(gStr);
      const mode = prev.securityMode;

      // Аліса генерує свій ефемерний секрет 'a'
      const a = BigInt(Math.floor(Math.random() * 900) + 100);
      const A = modPow(g, a, p);

      let newLogs: NetworkLog[] = [
        createLog("Alice", "System", "info", `Аліса ініціювала сесію. Сгенеровано приватний секрет a = ${a}`),
        createLog("Alice", "Bob", "info", `Аліса відправляє пакет M1 з точкою групи A = ${A}`)
      ];

      // Визначаємо поведінку Єви залежно від наявності атаки в режимі
      const isMitm = mode === "PLAIN_DH_MITM" || mode === "STS_SECURE_MITM";
      const e1 = BigInt(Math.floor(Math.random() * 900) + 100);
      const E1 = isMitm ? modPow(g, e1, p) : A; // Хакер підміняє, або пасивний дріт копіює

      if (isMitm) {
        newLogs.push(createLog("Eve", "System", "warning", `[MitM АКТИВОВАНО]: Єва перехопила точку Аліси A = ${A}`));
        newLogs.push(createLog("Eve", "Bob", "danger", `[ФАБРИКАЦІЯ]: Єва згенерувала таємний ефемерний e1 = ${e1} і підсунула Бобу точку E1 = ${E1}`));
      } else {
        newLogs.push(createLog("Eve", "Bob", "info", `[ПАСИВНИЙ ТРАНЗИТ]: Пакет Аліси пішов далі без змін.`));
      }

      return {
        ...prev,
        currentStep: "ROUND_1",
        alice: { ...prev.alice, ephemeralPrivate: a.toString(), ephemeralPublic: A.toString() },
        eve: {
          ...prev.eve,
          fake_e1_private: isMitm ? e1.toString() : "",
          fakeE1: E1.toString(),
          interceptedA: A.toString()
        },
        logs: [...prev.logs, ...newLogs]
      };
    });
  }, [pStr, gStr]);

  // КРОК 2: Боб приймає те, що прийшло від Єви (думаючи, що це Аліса), рахує К, підпис і відправляє відповідь
  const runRound2 = useCallback(() => {
    setState(prev => {
      const p = BigInt(pStr);
      const g = BigInt(gStr);
      const mode = prev.securityMode;

      const b = BigInt(Math.floor(Math.random() * 900) + 100);
      const B = modPow(g, b, p);

      // Боб бере те, що прийшло з віртуального каналу (fakeE1)
      const receivedByBob = BigInt(prev.eve.fakeE1);
      const K_Bob = modPow(receivedByBob, b, p);

      let newLogs: NetworkLog[] = [
        createLog("Bob", "Alice", "info", `Боб згенерував локальний таємний секрет b = ${b}`),
        createLog("Bob", "Alice", "success", `Боб обчислив ефемерний відкритий ключ B = g^b mod p = ${B}`),
        createLog("Bob", "Alice", "info", `Боб обчислив сеансовий ключ K_Bob = ${K_Bob}`)
      ];

      // Визначаємо поведінку Єви для другого кроку
      const isMitm = mode === "PLAIN_DH_MITM" || mode === "STS_SECURE_MITM";
      const e2 = BigInt(Math.floor(Math.random() * 900) + 100);
      const E2 = isMitm ? modPow(g, e2, p) : B;

      const K_Eve_Bob = isMitm ? modPow(B, BigInt(prev.eve.fake_e1_private), p) : BigInt(0);

      if (isMitm) {
        newLogs.push(createLog("Eve", "System", "warning", `[MitM АКТИВОВАНО]: Єва перехопила точку Боба B = ${B}`));
        newLogs.push(createLog("Eve", "System", "success", `[КОНТУР ЄВА-БОБ]: Єва успішно вирахувала сеансовый ключ K_EB = ${K_Eve_Bob}`));
        newLogs.push(createLog("Eve", "Alice", "danger", `[ФАБРИКАЦІЯ]: Єва підсунула Алісі свою точку E2 = ${E2}`));
      } else {
        newLogs.push(createLog("Eve", "Alice", "info", `[ПАСИВНИЙ ТРАНЗИТ]: Пакет Боба передається до Аліси в чистому вигляді.`));
      }

      // ФОРМУВАННЯ КРИПТОГРАМИ В РЕЖИМАХ STS
      let generatedPackage = "";
      const isSts = mode === "STS_SECURE" || mode === "STS_SECURE_MITM";

      if (isSts) {
        const tokenToSignByBob = `${B},${receivedByBob}`;
        const bobSignature = signRSA(tokenToSignByBob, bobRSA.privateKey);
        generatedPackage = encryptAES(bobSignature.toString(), K_Bob);
        newLogs.push(createLog("Bob", "Alice", "success", `[STS АВТЕНТИФІКАЦІЯ]: Боб наклав ЕЦП RSA та зашифрував його ключем K_Bob.`));
      }

      return {
        ...prev,
        currentStep: "ROUND_2",
        bob: { ...prev.bob, ephemeralPrivate: b.toString(), ephemeralPublic: B.toString(), computedSecretKey: K_Bob.toString() },
        eve: {
          ...prev.eve,
          fake_e2_private: isMitm ? e2.toString() : "",
          fakeE2: E2.toString(),
          interceptedB: B.toString(),
          computedKeyWithBob: isMitm ? K_Eve_Bob.toString() : "",
          encryptedPackage: generatedPackage
        },
        logs: [...prev.logs, ...newLogs]
      };
    });
  }, [pStr, gStr]);

// --- РАУНД 3: АЛІСА ВЕРИФІКУЄ ТА ФІНАЛІЗУЄ СЕСІЮ ---
  const runRound3 = useCallback(() => {
    setState(prev => {
      const p = BigInt(pStr);
      const mode = prev.securityMode;
      const a = BigInt(prev.alice.ephemeralPrivate);
      const receivedByAlice = BigInt(prev.eve.fakeE2);
      
      const K_Alice = modPow(receivedByAlice, a, p);

      const isMitm = mode === "PLAIN_DH_MITM" || mode === "STS_SECURE_MITM";
      const isSts = mode === "STS_SECURE" || mode === "STS_SECURE_MITM";

      const K_Eve_Alice = isMitm ? modPow(BigInt(prev.eve.interceptedA), BigInt(prev.eve.fake_e2_private), p) : BigInt(0);

      let newLogs: NetworkLog[] = [
        createLog("Alice", "Bob", "info", `Аліса обчислила свій сеансовий ключ K_Alice = ${K_Alice}`)
      ];

      if (isSts) {
        newLogs.push(createLog("Alice", "Bob", "info", "[STS ВЕРИФІКАЦІЯ]: Аліса запускає дешифрування блоку C_B за допомогою K_Alice..."));
        
        let isSignatureValid;
        let decryptedSignatureStr = "";

        try {
          decryptedSignatureStr = decryptAES(prev.eve.encryptedPackage, K_Alice);
          
          const tokenExpectedByAlice = `${receivedByAlice},${prev.alice.ephemeralPublic}`;

          isSignatureValid = verifyRSA(tokenExpectedByAlice, BigInt(decryptedSignatureStr), bobRSA.publicKey);
        } catch (e) {
          isSignatureValid = false;
        }

        if (!isSignatureValid) {
          const tokenExpectedByAlice = `${receivedByAlice},${prev.alice.ephemeralPublic}`;
          
          newLogs.push(createLog("Alice", "Bob", "danger", `[КРИПТОГРАФІЧНЕ ВИКЛЮЧЕННЯ]: Signature Verification Failed! Розшифрований блок [${decryptedSignatureStr}] не відповідає токену сесії Аліси [${tokenExpectedByAlice}].`));
          newLogs.push(createLog("Alice", "Bob", "danger", "[БЛОКУВАННЯ КАНАЛУ]: Автентифікацію провалено через деструкцію криптограми. Сесію аварійно закрито!"));

          return {
            ...prev,
            currentStep: "FAILED",
            errorMessage: "Signature Verification Failed: Active MitM Attack Detected by STS Protocol!",
            alice: { ...prev.alice, computedSecretKey: "ЗНИЩЕНО" },
            logs: [...prev.logs, ...newLogs]
          };
        }
        
        newLogs.push(createLog("Alice", "System", "success", "[STS УСПІХ]: ЕЦП Боба успішно пройшов верифікацію! Сторони автентифіковані."));
        return {
          ...prev,
          currentStep: "COMPLETED",
          alice: { ...prev.alice, computedSecretKey: K_Alice.toString(), isAuthenticated: true },
          bob: { ...prev.bob, isAuthenticated: true },
          logs: [...prev.logs, ...newLogs]
        };
      }

      // --- ГІЛКИ ДЛЯ АНОНІМНОГО РЕЖИМУ (PLAIN_DH) ---
      if (isMitm) {
        // Режим PLAIN_DH_MITM (Атака успішна)
        newLogs.push(createLog("Alice", "Bob", "success", "Анонімний Діффі-Хеллман завершено. Аліса зафіксувала ключ."));
        newLogs.push(createLog("Eve", "System", "success", `[АТАКА УСПІШНА]: Побудовано міст перехоплення трафіку! K_AE = ${K_Eve_Alice}, K_EB = ${prev.eve.computedKeyWithBob}`));
        return {
          ...prev,
          currentStep: "COMPLETED",
          alice: { ...prev.alice, computedSecretKey: K_Alice.toString() },
          eve: { ...prev.eve, computedKeyWithAlice: K_Eve_Alice.toString() },
          logs: [...prev.logs, ...newLogs]
        };
      } else {
        // Режим PLAIN_DH (Чесний анонімний обмін)
        newLogs.push(createLog("Alice", "Bob", "success", "Чесний анонімний Діффі-Хеллман успішно завершено. Ключі сторін синхронні."));
        return {
          ...prev,
          currentStep: "COMPLETED",
          alice: { ...prev.alice, computedSecretKey: K_Alice.toString() },
          logs: [...prev.logs, ...newLogs]
        };
      }
    });
  }, [pStr]);

  return { state, runRound1, runRound2, runRound3, resetSimulation };
}