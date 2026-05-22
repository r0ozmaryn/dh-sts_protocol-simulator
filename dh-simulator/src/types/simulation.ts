/* eslint-disable @typescript-eslint/no-explicit-any */
export type SecurityMode = 
  | "PLAIN_DH"
  | "PLAIN_DH_MITM"
  | "STS_SECURE"
  | "STS_SECURE_MITM";

export type HandshakeStep =
  | "NOT_STARTED"
  | "ROUND_1"
  | "ROUND_2"
  | "ROUND_3"
  | "COMPLETED"
  | "FAILED";


// Повідомлення M1 (Alice -> Bob)
export interface PacketM1 {
  A: string;        // Ефемерний відкритий ключ Аліси (як рядок BigInt)
}

// Повідомлення M2 (Bob -> Alice)
export interface PacketM2 {
  B: string;        // Ефемерний відкритий ключ Боба (як рядок BigInt)
  C_B: string;      // Симетрично зашифрований блок (ЕЦП Боба + його сертифікат/ідентифікатор)
}

// Повідомлення M3 (Alice -> Bob)
export interface PacketM3 {
  C_A: string;      // Симетрично зашифрований блок (ЕЦП Аліси + її сертифікат/ідентифікатор)
}

export interface NetworkLog {
  id: string;
  sender: "Alice" | "Bob" | "Eve" | "System";
  receiver: "Alice" | "Bob" | "Eve" | "System";
  type: "info" | "warning" | "success" | "danger";
  message: string;
}

export interface AgentState {
  ephemeralPrivate: string;
  ephemeralPublic: string;
  computedSecretKey: string;
  isAuthenticated: boolean;
}

export interface SimulationState {
  securityMode: SecurityMode;
  currentStep: HandshakeStep;
  
  alice: AgentState;
  bob: AgentState;
  eve: {
    fake_e1_private: string; // ДОДАТИ: таємне число e1
    fake_e2_private: string; // ДОДАТИ: таємне число e2
    interceptedA: string;
    interceptedB: string;
    fakeE1: string;
    fakeE2: string;
    computedKeyWithAlice: string;
    computedKeyWithBob: string;
    encryptedPackage: string; 
  };
  logs: NetworkLog[];
  errorMessage?: string;
}