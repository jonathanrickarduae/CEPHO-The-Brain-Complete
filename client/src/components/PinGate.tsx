import { useState, useEffect } from "react";

const PIN_KEY = "cepho_access_granted";
const CORRECT_PIN = "123$4@";

export function PinGate({ children }: { children: React.ReactNode }) {
  const [unlocked, setUnlocked] = useState(false);
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    const granted = sessionStorage.getItem(PIN_KEY);
    if (granted === "true") {
      setUnlocked(true);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === CORRECT_PIN) {
      sessionStorage.setItem(PIN_KEY, "true");
      setUnlocked(true);
      setError(false);
    } else {
      setError(true);
      setShake(true);
      setPin("");
      setTimeout(() => setShake(false), 600);
    }
  };

  if (unlocked) return <>{children}</>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
      <div className="flex flex-col items-center gap-8">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-purple-900 flex items-center justify-center shadow-lg shadow-purple-900/50">
            <span className="text-white text-2xl font-bold">C</span>
          </div>
          <h1 className="text-white text-2xl font-semibold tracking-tight">CEPHO</h1>
          <p className="text-gray-500 text-sm">Enter your access code to continue</p>
        </div>

        {/* PIN Form */}
        <form
          onSubmit={handleSubmit}
          className={`flex flex-col items-center gap-4 ${shake ? "animate-shake" : ""}`}
          style={shake ? { animation: "shake 0.5s ease-in-out" } : {}}
        >
          <input
            type="password"
            value={pin}
            onChange={(e) => {
              setPin(e.target.value);
              setError(false);
            }}
            placeholder="Access code"
            autoFocus
            className={`w-64 px-4 py-3 rounded-xl bg-white/5 border ${
              error ? "border-red-500 text-red-400" : "border-white/10 text-white"
            } text-center text-lg tracking-widest placeholder:text-gray-600 focus:outline-none focus:border-purple-500 transition-colors`}
          />
          {error && (
            <p className="text-red-400 text-sm">Incorrect access code. Try again.</p>
          )}
          <button
            type="submit"
            className="w-64 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium transition-colors shadow-lg shadow-purple-900/40"
          >
            Enter
          </button>
        </form>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-10px); }
          40% { transform: translateX(10px); }
          60% { transform: translateX(-8px); }
          80% { transform: translateX(8px); }
        }
      `}</style>
    </div>
  );
}
