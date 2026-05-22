/* eslint-disable react-hooks/set-state-in-effect */
import React, { useEffect, useState } from "react";
import type { SecurityMode, HandshakeStep } from "../types/simulation";

interface ChatModuleProps {
  securityMode: SecurityMode;
  currentStep: HandshakeStep;
}

export const ChatModule: React.FC<ChatModuleProps> = ({ securityMode, currentStep }) => {
  const [message, setMessage] = useState("");
  const [chatLog, setChatLog] = useState<{ sender: string; text: string }[]>([]);
  const [eveIntercepted, setEveIntercepted] = useState<{ label: string; content: string }>({ label: "", content: "" });

  const isCompleted = currentStep === "COMPLETED";
  const isSts = securityMode.startsWith("STS_SECURE");
  const isMitm = securityMode.endsWith("_MITM");

  useEffect(() => {
    if (currentStep === "NOT_STARTED") {
      setChatLog([]);
      setEveIntercepted({ label: "", content: "" });
      setMessage("");
    }
  }, [currentStep]);

  const handleSendMessage = (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const newMsg = { sender: "Аліса", text: message };
    setChatLog(prev => [...prev, newMsg]);

    setTimeout(() => {
      switch (securityMode) {
        case "PLAIN_DH_MITM": {
          setEveIntercepted({ 
            label: "ПЕРЕХОПЛЕНО ТА МОДИФІКОВАНО (MitM)", 
            content: `Plaintext: "${message}" -> Зміна бітів активована.` 
          });
          setChatLog(prev => [...prev, { sender: "Боб (через Єву)", text: `🚨 [МОДИФІКОВАНО ЄВОЮ]: ${message.toUpperCase()} !!!` }]);
          break;
        }

        case "PLAIN_DH": {
          const fakeHexCipher = Array.from({length: 8}, () => Math.floor(Math.random()*16).toString(16)).join("").toUpperCase();
          setEveIntercepted({ 
            label: "ПЕРЕХОПЛЕНО ПАСИВНО (ШИФРОВАНО DH)", 
            content: `0x${fakeHexCipher}... [Зашифровано на K. У Єви немає приватних секретів a або b]` 
          });
          setChatLog(prev => [...prev, { sender: "Боб", text: message }]);
          break; 
        }

        case "STS_SECURE": {
          const fakeBase64Cipher = btoa(unescape(encodeURIComponent(message))).substring(0, 12) + "...==";
          setEveIntercepted({ 
            label: "ПЕРЕХОПЛЕНО ПАСИВНО (ШИФРОВАНО STS)", 
            content: `Ciphertext: ${fakeBase64Cipher} [Криптограма захищена симетричним сеансовим ключем]` 
          });
          setChatLog(prev => [...prev, { sender: "Боб", text: message }]);
          break;
        }
        default:
          break;
      }
    }, 600);

    setMessage("");
  };

  if (!isCompleted) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl text-center text-sm text-slate-500 italic">
        🔒 Чат заблоковано. Для активації передачі прикладних даних необхідно успішно завершити криптографічний хендшейк.
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2 space-y-4">
        <h3 className="text-sm font-bold text-teal-400 font-mono flex items-center gap-2">
          💬 Канал прикладного обміну даними
        </h3>
        
        <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 h-48 overflow-y-auto space-y-2 font-mono text-xs">
          {chatLog.length === 0 ? (
            <span className="text-slate-600 italic">Канал порожній. Напишіть щось від імені Аліси...</span>
          ) : (
            chatLog.map((msg, idx) => (
              <div key={idx} className={`p-2 rounded ${
                msg.sender === "Аліса" ? "bg-teal-950/40 text-teal-300 border border-teal-900/30 text-left" : "bg-sky-950/40 text-sky-300 border border-sky-900/30 text-right"
              }`}>
                <span className="font-bold block text-[10px] uppercase opacity-60">{msg.sender}:</span>
                {msg.text}
              </div>
            ))
          )}
        </div>

        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            placeholder="Введіть секретне повідомлення від Аліси..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-1 bg-slate-850 border border-slate-700 rounded-lg px-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-teal-500"
          />
          <button
            type="submit"
            className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold px-4 py-2 rounded-lg text-sm transition-all"
          >
            Надіслати
          </button>
        </form>
      </div>

      <div className="bg-slate-950 border border-red-950/40 rounded-lg p-4 font-mono text-[10px]">
        <div className="text-red-500 font-bold mb-4 flex items-center gap-1.5">
          Сніффер трафіку Єви:
        </div>
        <div className="space-y-4">
          <div>
            <div className="text-slate-600 mb-1 text-[8px] font-bold">{eveIntercepted.label || "СТАТУС:"}</div>
            <div className={`p-3 rounded bg-slate-900 border border-slate-850 min-h-[80px] break-all ${eveIntercepted.content ? "text-amber-500" : "text-slate-700 italic"}`}>
              {eveIntercepted.content || "Слухаю канал..."}
            </div>
          </div>
          <div className="text-[9px] text-slate-500 leading-relaxed border-t border-slate-900 pt-3 italic">
            {isSts && !isMitm 
              ? "*У звичайному STS режимі Єва перехоплює байти, але не може їх прочитати, оскільки Аліса та Боб використовують секретний ключ, якого немає у зловмисника."
              : "*В MITM режимі Єва або читає трафік, або активно модифікує його, підміняючи біти в реальному часі."}
          </div>
        </div>
      </div>
    </div>
  );
};