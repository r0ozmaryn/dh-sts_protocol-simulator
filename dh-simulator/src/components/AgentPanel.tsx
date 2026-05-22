import React from "react";
import type { AgentState } from "../types/simulation";

interface AgentPanelProps {
  name: "Alice" | "Bob";
  title: string;
  color: "teal" | "sky";
  agentData: AgentState;
}

export const AgentPanel: React.FC<AgentPanelProps> = ({ name, title, color, agentData }) => {
  const isTeal = color === "teal";

  return (
    <div className={`bg-slate-900 border ${isTeal ? "border-teal-900/50" : "border-sky-900/50"} rounded-xl p-5 shadow-xl`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className={`text-lg font-bold ${isTeal ? "text-teal-400" : "text-sky-400"} flex items-center gap-2`}>
          {isTeal ? "👩‍💻" : "👨‍💻"} {title}
        </h3>
        {agentData.computedSecretKey && (
          <span className={`text-xs px-2 py-0.5 rounded font-mono ${
            agentData.computedSecretKey === "ЗНИЩЕНО" 
              ? "bg-red-500/20 text-red-400 border border-red-500/30"
              : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
          }`}>
            {agentData.computedSecretKey === "ЗНИЩЕНО" ? "🚨 Безпека порушена" : "🔑 Ключ згенеровано"}
          </span>
        )}
      </div>

      <div className="space-y-4 font-mono text-xs">
        <div className="bg-slate-850 p-3 rounded-lg border border-slate-800">
          <div className="text-slate-500 mb-1">Приватний ефемерний секрет ({name === "Alice" ? "a" : "b"}):</div>
          <div className="text-amber-400 truncate font-semibold">
            {agentData.ephemeralPrivate ? agentData.ephemeralPrivate : <span className="text-slate-600 italic">очікування генерації...</span>}
          </div>
        </div>

        <div className="bg-slate-850 p-3 rounded-lg border border-slate-800">
          <div className="text-slate-500 mb-1">Публічна точка групи ({name === "Alice" ? "A" : "B"}):</div>
          <div className="text-slate-300 truncate">
            {agentData.ephemeralPublic ? agentData.ephemeralPublic : <span className="text-slate-600 italic">не обчислено...</span>}
          </div>
        </div>

        <div className="bg-slate-850 p-3 rounded-lg border border-slate-800">
          <div className="text-slate-500 mb-1">Узгоджений сеансовий ключ (K):</div>
          <div className={`truncate font-bold ${agentData.computedSecretKey === "ЗНИЩЕНО" ? "text-red-500" : "text-emerald-400"}`}>
            {agentData.computedSecretKey ? agentData.computedSecretKey : <span className="text-slate-600 italic">не синхронізовано...</span>}
          </div>
        </div>
      </div>
    </div>
  );
};