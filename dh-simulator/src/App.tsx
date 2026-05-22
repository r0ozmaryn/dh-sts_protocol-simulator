import { useState } from "react";
import { useSTSExchange } from "./hooks/useSTSExchange";
import { ConfigPanel } from "./components/ConfigPanel";
import { AgentPanel } from "./components/AgentPanel";
import { HackerConsole } from "./components/HackerConsole";
import { ChatModule } from "./components/ChatModule";

function App() {
  const [pStr, setPStr] = useState("997");
  const [gStr, setGStr] = useState("7");

  const { state, runRound1, runRound2, runRound3, resetSimulation } = useSTSExchange(pStr, gStr);

  const handleRunNextStep = () => {
    switch (state.currentStep) {
      case "NOT_STARTED":
        runRound1();
        break;
      case "ROUND_1":
        runRound2();
        break;
      case "ROUND_2":
        runRound3();
        break;
      default:
        break;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans selection:bg-teal-500/30">
      <header className="mb-6 max-w-7xl mx-auto border-b border-slate-900 pb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-sky-400 font-mono tracking-tight">
            DH/STS PROTOCOL SIMULATOR
          </h1>
          <p className="text-xs text-slate-500 font-mono mt-1">
            Аналітичне моделювання стійкості до MitM-атак (Модель Долєва-Яо)
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto space-y-6">
        <ConfigPanel
          pStr={pStr}
          gStr={gStr}
          setPStr={setPStr}
          setGStr={setGStr}
          securityMode={state.securityMode}
          currentStep={state.currentStep}
          onModeChange={(mode) => resetSimulation(mode)}
          onRunStep={handleRunNextStep}
          onReset={() => resetSimulation(state.securityMode)}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <AgentPanel
            name="Alice"
            title="Клієнтський вузол: Alice (Аліса)"
            color="teal"
            agentData={state.alice}
          />

          <HackerConsole
            securityMode={state.securityMode}
            currentStep={state.currentStep}
            eveState={state.eve}
          />

          <AgentPanel
            name="Bob"
            title="Серверний вузол: Bob (Боб)"
            color="sky"
            agentData={state.bob}
          />
        </div>

        <ChatModule
          securityMode={state.securityMode}
          currentStep={state.currentStep}
        />

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
          <h3 className="text-sm font-bold text-slate-400 font-mono mb-4 flex items-center gap-2">
            <span>📋</span> Логи віртуального мережевого каналу зв'язку (Трафік)
          </h3>
          
          <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
            {state.logs.length === 0 ? (
              <div className="text-slate-600 font-mono text-xs italic text-center py-4">
                Канал зв'язку вільний. Натисніть кнопку запуску кроку для генерації пакетів.
              </div>
            ) : (
              state.logs.map((log) => (
                <div
                  key={log.id}
                  className={`p-3 rounded-lg border text-xs font-mono transition-all duration-300 ${
                    log.type === "success"
                      ? "bg-emerald-950/30 border-emerald-900/40 text-emerald-400"
                      : log.type === "warning"
                      ? "bg-amber-950/30 border-amber-900/40 text-amber-400"
                      : log.type === "danger"
                      ? "bg-red-950/30 border-red-900/40 text-red-400"
                      : "bg-slate-850 border-slate-800 text-slate-300"
                  }`}
                >
                  <div className="flex justify-between items-center opacity-60 text-[10px] mb-1 font-bold uppercase tracking-wider">
                    <span>Маршрут: {log.sender} ➔ {log.receiver}</span>
                  </div>
                  <div>{log.message}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;