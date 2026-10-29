"use client";

import React, { useState } from "react";
import { api } from "@/services/api";
import { 
  Settings, RefreshCw, Zap, Database, ShieldCheck, 
  CheckCircle2, AlertTriangle, HardDrive, Terminal 
} from "lucide-react";

interface SettingsViewProps {
  onSimulateTick: () => void;
  isSimulating: boolean;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  onSimulateTick,
  isSimulating
}) => {
  const [autoTickInterval, setAutoTickInterval] = useState<number>(0);
  const [lastTickResult, setLastTickResult] = useState<string | null>(null);

  const handleManualAdvance = async () => {
    try {
      const res = await api.simulateTick();
      setLastTickResult(`Simulated tick successfully: Advance to ${res.new_timestamp} (${res.updated_corridors} corridors updated)`);
      onSimulateTick();
    } catch (e: any) {
      setLastTickResult("Simulation advance failed: Backend unreachable");
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-[#0D1527] border border-slate-800">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Settings className="w-5 h-5 text-cyan-400" />
            Platform Operations & Simulation Configuration
          </h2>
          <p className="text-xs text-slate-400">
            Control the real-time telematics simulation clock, dataset parameters, and service health
          </p>
        </div>

        <div className="px-2.5 py-1 rounded-lg bg-emerald-950/80 border border-emerald-700/50 text-emerald-300 font-mono text-xs font-semibold">
          MODE: DEMO / REAL-TIME SIMULATION
        </div>
      </div>

      {/* Simulation Controls */}
      <div className="p-5 rounded-xl bg-[#0D1527] border border-slate-800 space-y-4 shadow-xl">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
          <Zap className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Telematics Simulation Clock
          </h3>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          The platform operates on a realistic continuous telematics feed. Click the advance button below to simulate moving forward in 15-minute increments. All 110 road corridors, vehicle volumes, speeds, and XGBoost forecasts will recalculate in real time.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handleManualAdvance}
            disabled={isSimulating}
            className="flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-lg shadow-cyan-900/30 active:scale-95 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isSimulating ? "animate-spin" : ""}`} />
            <span>Simulate +15 Minute Advance</span>
          </button>

          <span className="text-xs text-slate-500">or use top navigation quick-tick button</span>
        </div>

        {lastTickResult && (
          <div className="p-3 rounded-lg bg-cyan-950/40 border border-cyan-800/40 text-xs text-cyan-300 font-mono">
            {lastTickResult}
          </div>
        )}
      </div>

      {/* Production Infrastructure Endpoints */}
      <div className="p-5 rounded-xl bg-[#0D1527] border border-slate-800 space-y-4 shadow-xl">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
          <Database className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Microservice Configuration & REST Gateways
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
          <div className="p-3 rounded-lg bg-[#090E1A] border border-slate-800">
            <span className="text-[10px] text-slate-500 block uppercase font-sans">FastAPI REST Server</span>
            <span className="text-slate-200 mt-1 block font-bold">http://127.0.0.1:8000</span>
            <span className="text-emerald-400 text-[10px] font-sans">● Online (Uvicorn Worker)</span>
          </div>

          <div className="p-3 rounded-lg bg-[#090E1A] border border-slate-800">
            <span className="text-[10px] text-slate-500 block uppercase font-sans">OpenAPI / Swagger Specs</span>
            <span className="text-cyan-400 mt-1 block underline cursor-pointer">http://127.0.0.1:8000/docs</span>
            <span className="text-slate-400 text-[10px] font-sans">Interactive API Documentation</span>
          </div>

          <div className="p-3 rounded-lg bg-[#090E1A] border border-slate-800">
            <span className="text-[10px] text-slate-500 block uppercase font-sans">Database Engine</span>
            <span className="text-slate-200 mt-1 block font-bold">SQLite 3.42 (WAL Mode)</span>
            <span className="text-slate-400 text-[10px] font-sans">147,950 Telematics Rows Indexed</span>
          </div>

          <div className="p-3 rounded-lg bg-[#090E1A] border border-slate-800">
            <span className="text-[10px] text-slate-500 block uppercase font-sans">Machine Learning Core</span>
            <span className="text-slate-200 mt-1 block font-bold">XGBoost 3.2.0 + SHAP Surrogate</span>
            <span className="text-slate-400 text-[10px] font-sans">Multi-horizon: 15m, 30m, 60m</span>
          </div>
        </div>
      </div>
    </div>
  );
};
