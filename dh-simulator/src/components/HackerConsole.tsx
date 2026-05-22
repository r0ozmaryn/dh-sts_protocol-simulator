import React from "react";
import type { SimulationState } from "../types/simulation";

interface EveConsoleProps {
  eveState: SimulationState["eve"];
  securityMode: SimulationState["securityMode"];
  currentStep: SimulationState["currentStep"];
}

export const HackerConsole: React.FC<EveConsoleProps> = ({ securityMode, currentStep, eveState }) => {
  const isMitmActive = securityMode === "PLAIN_DH_MITM" || securityMode === "STS_SECURE_MITM";
  const isFailed = currentStep === "FAILED";
  const isCompleted = currentStep === "COMPLETED";
  const isPlainDH = securityMode === "PLAIN_DH" || securityMode === "PLAIN_DH_MITM";

  const isAttackSuccessful = isCompleted && securityMode === "PLAIN_DH_MITM";

  return (
    <div className={`bg-slate-950 border rounded-xl p-5 shadow-2xl relative overflow-hidden transition-all duration-500 ${
      isMitmActive 
        ? "border-red-950/40" 
        : "border-slate-800 opacity-30 grayscale select-none pointer-events-none"
    }`}>
      
      {!isMitmActive && (
        <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-[1px] flex flex-col items-center justify-center z-10 p-4 text-center">
          <span className="text-2xl mb-1">🔒</span>
          <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">
            Канал чистий / Єва пасивна
          </div>
        </div>
      )}

      <div className="absolute top-0 right-0 p-3 opacity-10 text-4xl pointer-events-none">😈</div>
      
      <div className="flex justify-between items-center mb-4 border-b border-red-950/30 pb-2">
        <h3 className="text-lg font-bold text-red-500 flex items-center gap-2 font-mono">
          Консоль Активного Втручання (Єва)
        </h3>
        <span className={`text-xs px-2 py-0.5 rounded font-mono font-bold ${
          isFailed 
            ? "bg-red-500 text-white" 
            : isAttackSuccessful
            ? "bg-red-600 text-white animate-pulse"
            : isCompleted && !isPlainDH
            ? "bg-slate-800 text-slate-500"
            : eveState.interceptedA 
            ? "bg-amber-500 text-slate-950 animate-pulse" 
            : "bg-slate-800 text-slate-400"
        }`}>
          {isFailed 
            ? "❌ АТАКУ ЗАБЛОКОВАНО STS" 
            : isAttackSuccessful
            ? "💀 АТАКА УСПІШНА (Канал у руках Єви)"
            : isCompleted
            ? "💤 Сесію завершено"
            : eveState.interceptedA 
            ? "📡 Перехоплення трафіку..." 
            : "💤 Очікування пакетів..."}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs mb-4">
        <div className="bg-slate-900 p-3 rounded-lg border border-red-950/20 space-y-2">
          <div className="text-red-400 font-bold mb-1 border-b border-slate-800 pb-1">Перехоплені відкриті ключі:</div>
          <div>
            <span className="text-slate-500">Перехоплено в Аліси (A):</span>
            <div className="text-amber-500 truncate">{eveState.interceptedA || <span className="text-slate-700 italic">немає даних</span>}</div>
          </div>
          <div>
            <span className="text-slate-500">Перехоплено в Боба (B):</span>
            <div className="text-amber-500 truncate">{eveState.interceptedB || <span className="text-slate-700 italic">немає даних</span>}</div>
          </div>
        </div>

        <div className="bg-slate-900 p-3 rounded-lg border border-red-950/20 space-y-2">
          <div className="text-red-400 font-bold mb-1 border-b border-slate-800 pb-1">Згенеровані підміни:</div>
          <div>
            <span className="text-slate-500">Фейковий ключ для Боба (E1):</span>
            <div className="text-red-400 truncate">{eveState.fakeE1 || <span className="text-slate-700 italic">не активовано</span>}</div>
          </div>
          <div>
            <span className="text-slate-500">Фейковий ключ для Аліси (E2):</span>
            <div className="text-red-400 truncate">{eveState.fakeE2 || <span className="text-slate-700 italic">не активовано</span>}</div>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 p-3 rounded-lg border border-red-950/30 font-mono text-xs">
        <div className="text-red-400 font-bold mb-2 border-b border-slate-800 pb-1">Сформовані шпигунські контури (Ключі перехоплення):</div>
        
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-slate-500 mb-1">
              <span>Контур 1: Взаємодія [Аліса ↔ Єва]</span>
              <span className={isAttackSuccessful ? "text-red-500 font-bold" : "text-slate-600"}>
                {isAttackSuccessful ? "🔓 Активний (ЧИТАННЯ)" : "🔒 Розірвано/Немає зв'язку"}
              </span>
            </div>
            <div className={`p-2 rounded bg-slate-950 font-bold ${isAttackSuccessful ? "text-red-400 border border-red-900/40" : "text-slate-700"}`}>
              Ключ контуру K_AE = {isAttackSuccessful && eveState.computedKeyWithAlice ? eveState.computedKeyWithAlice : "❌ НЕ УЗГОДЖЕНО"}
            </div>
          </div>

          <div>
            <div className="flex justify-between text-slate-500 mb-1">
              <span>Контур 2: Взаємодія [Єва ↔ Боб]</span>
              <span className={eveState.computedKeyWithBob ? "text-red-500 font-bold" : "text-slate-600"}>
                {eveState.computedKeyWithBob ? "🔓 Активний (ЧИТАННЯ)" : "🔒 Розірвано/Немає зв'язку"}
              </span>
            </div>
            <div className={`p-2 rounded bg-slate-950 font-bold ${eveState.computedKeyWithBob ? "text-red-400 border border-red-900/40" : "text-slate-700"}`}>
              Ключ контуру K_EB = {eveState.computedKeyWithBob ? eveState.computedKeyWithBob : "❌ НЕ УЗГОДЖЕНО"}
            </div>
          </div>
        </div>

        {isFailed && (
          <div className="mt-4 p-3 bg-red-950/40 border border-red-800/40 rounded-lg text-red-400 text-center font-bold animate-pulse">
            🛡️ Алгоритм STS виявив деструктивну зміну токенів! Спробу фабрикації підпису RSA відхилено. Контур розірвано.
          </div>
        )}
      </div>
    </div>
  );
};