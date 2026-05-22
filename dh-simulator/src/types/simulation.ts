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
    fake_e1_private: string;
    fake_e2_private: string;
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