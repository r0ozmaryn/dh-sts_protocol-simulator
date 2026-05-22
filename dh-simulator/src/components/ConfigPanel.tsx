import React from "react";
import type { SecurityMode, HandshakeStep } from "../types/simulation";

interface ConfigPanelProps {
  pStr: string;
  gStr: string;
  setPStr: (val: string) => void;
  setGStr: (val: string) => void;
  securityMode: SecurityMode;
  currentStep: HandshakeStep;
  onModeChange: (mode: SecurityMode) => void;
  onRunStep: () => void;
  onReset: () => void;
}

export const ConfigPanel: React.FC<ConfigPanelProps> = ({
  pStr, gStr, setPStr, setGStr, securityMode, currentStep, onModeChange, onRunStep, onReset
}) => {

  const modes: { id: SecurityMode; label: string }[] = [
    { id: "PLAIN_DH", label: "Звичайний DH" },
    { id: "PLAIN_DH_MITM", label: "MitM на DH" },
    { id: "STS_SECURE", label: "Звичайний STS" },
    { id: "STS_SECURE_MITM", label: "MitM на STS" },
  ];

  // Маппер кольорів для активного стану кнопок (захист від злітання стилів Tailwind)
  const activeStyles: Record<SecurityMode, string> = {
    PLAIN_DH: "bg-blue-600 text-white shadow",
    PLAIN_DH_MITM: "bg-amber-500 text-slate-950 shadow",
    STS_SECURE: "bg-emerald-600 text-white shadow",
    STS_SECURE_MITM: "bg-red-600 text-white shadow",
  };
  
  const getStepButtonText = () => {
    switch (currentStep) {
      case "NOT_STARTED": return "Запустити Раунд 1 (Аліса -> Боб)";
      case "ROUND_1": return "Запустити Раунд 2 (Боб -> Аліса)";
      case "ROUND_2": return "Запустити Раунд 3 (Аліса -> Боб)";
      case "COMPLETED": return "Хендшейк Завершено";
      case "FAILED": return "Канал Скомпрометовано";
      default: return "Наступний крок";
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl mb-6">
      <h2 className="text-xl font-bold text-teal-400 mb-5 flex items-center gap-2">
        🛠️ Панель Глобальної Конфігурації Протоколу
      </h2>
      
      {/* Повертаємо класичну трьохколонкову сітку з вирівнюванням по нижньому краю */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-end">

        {/* 1. Блок параметрів групи */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Параметри групи (BigInt)</label>
          <div className="flex gap-4">
            <div className="flex-1">
              <span className="text-[10px] text-slate-500 font-mono block mb-1">Просте число (p)</span>
              <input 
                type="text" 
                value={pStr} 
                onChange={(e) => setPStr(e.target.value)} 
                disabled={currentStep !== "NOT_STARTED"}
                className="w-full bg-slate-850 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none focus:border-teal-500 disabled:opacity-50 font-mono text-sm" 
              />
            </div>
            <div className="w-24">
              <span className="text-[10px] text-slate-500 font-mono block mb-1">Генератор (g)</span>
              <input 
                type="text" 
                value={gStr} 
                onChange={(e) => setGStr(e.target.value)} 
                disabled={currentStep !== "NOT_STARTED"}
                className="w-full bg-slate-850 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none focus:border-teal-500 disabled:opacity-50 font-mono text-sm" 
              />
            </div>
          </div>
        </div>

        {/* 2. Повертаємо ідеальний капсульний перемикач */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Вибір аналітичного сценарію</label>
          <div className="flex rounded-lg bg-slate-850 p-1 border border-slate-700 min-h-[38px]">
            {modes.map((m) => (
              <button
                key={m.id}
                onClick={() => onModeChange(m.id)}
                disabled={currentStep !== "NOT_STARTED"}
                className={`flex-1 py-1 px-1 text-[10px] font-semibold rounded-md transition-all uppercase ${
                  securityMode === m.id 
                    ? activeStyles[m.id] 
                    : "text-slate-400 hover:text-slate-200 disabled:opacity-30"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Кнопки керування симуляцією */}
        <div className="flex gap-3">
          <button
            onClick={onRunStep}
            disabled={currentStep === "COMPLETED" || currentStep === "FAILED"}
            className={`flex-1 py-2 px-4 rounded-lg font-bold transition-all text-sm min-h-[38px] ${
              currentStep === "FAILED"
                ? "bg-red-600 text-white cursor-not-allowed"
                : currentStep === "COMPLETED"
                ? "bg-emerald-600 text-white cursor-not-allowed"
                : "bg-teal-500 hover:bg-teal-400 text-slate-950 shadow-lg shadow-teal-500/20"
            }`}
          >
            {getStepButtonText()}
          </button>
          
          <button
            onClick={onReset}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium py-2 px-4 rounded-lg transition-all border border-slate-700 text-sm min-h-[38px]"
          >
            Скинути
          </button>
        </div>

      </div>
    </div>
  );
};