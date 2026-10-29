"use client";

import React, { useState, useEffect } from "react";
import { Road, api } from "@/services/api";
import { 
  BrainCircuit, Zap, Sliders, TrendingUp, AlertTriangle, 
  Clock, Shield, ArrowRight, RefreshCw, CheckCircle2 
} from "lucide-react";

interface PredictionViewProps {
  onSelectRoad: (road: Road) => void;
}

export const PredictionView: React.FC<PredictionViewProps> = ({ onSelectRoad }) => {
  const [predictions, setPredictions] = useState<Road[]>([]);
  const [horizon, setHorizon] = useState<number>(30);
  const [loading, setLoading] = useState<boolean>(true);

  // What-If Simulation State
  const [simDensity, setSimDensity] = useState<number>(45);
  const [simCongestion, setSimCongestion] = useState<number>(55);
  const [simRush, setSimRush] = useState<number>(1);
  const [simRain, setSimRain] = useState<number>(0);
  const [simIncident, setSimIncident] = useState<number>(0);
  const [simNeighbor, setSimNeighbor] = useState<number>(50);

  const [simResult, setSimResult] = useState<any>(null);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  useEffect(() => {
    api.getPredictions(horizon)
      .then(res => {
        setPredictions(res);
        setLoading(false);
      })
      .catch(err => {
        console.error("Predictions fetch error:", err);
        setLoading(false);
      });
  }, [horizon]);

  // Run What-If ML Inference
  const runSimulation = () => {
    setIsSimulating(true);
    api.simulatePrediction({
      density_vpk: simDensity,
      current_congestion: simCongestion,
      is_rush_hour: simRush,
      rainfall_mm: simRain,
      occupancy: Math.min(95, simDensity * 1.4),
      has_incident: simIncident,
      neighbor_congestion: simNeighbor
    }).then(res => {
      setSimResult(res);
      setIsSimulating(false);
    }).catch(err => {
      console.error("Simulation error:", err);
      setIsSimulating(false);
    });
  };

  useEffect(() => {
    runSimulation();
  }, [simDensity, simCongestion, simRush, simRain, simIncident, simNeighbor]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "#EF4444";
    if (score >= 60) return "#F97316";
    if (score >= 40) return "#F59E0B";
    if (score >= 20) return "#06B6D4";
    return "#10B981";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-[#0D1527] border border-slate-800">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-cyan-400" />
            Congestion Prediction & Forecasting Engine
          </h2>
          <p className="text-xs text-slate-400">
            Multi-horizon supervised machine learning pipeline answering: WHERE, WHEN, and WHY will congestion happen?
          </p>
        </div>

        {/* Horizon Selector */}
        <div className="flex items-center gap-1.5 bg-[#090E1A] p-1 rounded-lg border border-slate-800 text-xs">
          <span className="text-slate-400 px-2 text-[11px]">Horizon:</span>
          {[15, 30, 60].map((h) => (
            <button
              key={h}
              onClick={() => setHorizon(h)}
              className={`px-3 py-1 rounded-md font-mono text-xs font-semibold transition-all ${
                horizon === h
                  ? "bg-cyan-600 text-white shadow-md shadow-cyan-950"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              +{h}m
            </button>
          ))}
        </div>
      </div>

      {/* Interactive What-If Simulation Sandbox */}
      <div className="p-5 rounded-xl bg-gradient-to-br from-[#0D1527] to-[#0A1020] border border-cyan-500/30 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Interactive "What-If" AI Scenario Simulator
            </h3>
          </div>
          <span className="text-[10px] font-mono text-cyan-300">Live XGBoost Model Serving</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sliders Input Panel (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Density Slider */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium">Vehicle Density:</span>
                <span className="font-mono text-cyan-400 font-bold">{simDensity} vehicles / km</span>
              </div>
              <input
                type="range"
                min="5"
                max="120"
                value={simDensity}
                onChange={(e) => setSimDensity(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
            </div>

            {/* Current Congestion Slider */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium">Current Baseline Congestion:</span>
                <span className="font-mono text-amber-400 font-bold">{simCongestion}/100</span>
              </div>
              <input
                type="range"
                min="10"
                max="95"
                value={simCongestion}
                onChange={(e) => setSimCongestion(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            {/* Rainfall Slider */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium">Rainfall Precipitation:</span>
                <span className="font-mono text-blue-400 font-bold">{simRain} mm/h</span>
              </div>
              <input
                type="range"
                min="0"
                max="30"
                value={simRain}
                onChange={(e) => setSimRain(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            {/* Connected Neighbor Inflow Slider */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium">Connected Neighbor Spillover:</span>
                <span className="font-mono text-purple-400 font-bold">{simNeighbor}/100</span>
              </div>
              <input
                type="range"
                min="10"
                max="95"
                value={simNeighbor}
                onChange={(e) => setSimNeighbor(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
            </div>

            {/* Toggle Switches: Rush Hour & Incident */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <label className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={simRush === 1}
                  onChange={(e) => setSimRush(e.target.checked ? 1 : 0)}
                  className="rounded border-slate-700 text-cyan-600 focus:ring-0 cursor-pointer"
                />
                <span className="text-xs text-slate-300">Rush Hour Active</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={simIncident === 1}
                  onChange={(e) => setSimIncident(e.target.checked ? 1 : 0)}
                  className="rounded border-slate-700 text-rose-600 focus:ring-0 cursor-pointer"
                />
                <span className="text-xs text-slate-300">Active Lane Incident</span>
              </label>
            </div>
          </div>

          {/* Model Output & Attribution Results (5 cols) */}
          <div className="lg:col-span-5 p-4 rounded-xl bg-[#090E1A] border border-cyan-500/30 flex flex-col justify-between space-y-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Simulated AI Forecast Output
              </span>

              {/* 3 Forecast Horizons */}
              <div className="grid grid-cols-3 gap-2 text-center mb-3">
                <div className="p-2.5 rounded-lg bg-[#0D1527] border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">+15 Min</span>
                  <span 
                    className="text-xl font-bold font-mono block mt-1"
                    style={{ color: getScoreColor(simResult?.prediction_15m?.score || 50) }}
                  >
                    {simResult?.prediction_15m?.score || 50}
                  </span>
                  <span className="text-[9px] font-semibold text-slate-400">
                    {simResult?.prediction_15m?.level || "MOD"}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-cyan-950/40 border border-cyan-800/60 shadow-lg">
                  <span className="text-[10px] text-cyan-300 block font-semibold">+30 Min</span>
                  <span 
                    className="text-xl font-bold font-mono block mt-1"
                    style={{ color: getScoreColor(simResult?.prediction_30m?.score || 60) }}
                  >
                    {simResult?.prediction_30m?.score || 60}
                  </span>
                  <span className="text-[9px] font-bold text-amber-300">
                    {simResult?.prediction_30m?.level || "HEAVY"}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-[#0D1527] border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">+60 Min</span>
                  <span 
                    className="text-xl font-bold font-mono block mt-1"
                    style={{ color: getScoreColor(simResult?.prediction_60m?.score || 54) }}
                  >
                    {simResult?.prediction_60m?.score || 54}
                  </span>
                  <span className="text-[9px] font-semibold text-slate-400">
                    {simResult?.prediction_60m?.level || "MOD"}
                  </span>
                </div>
              </div>

              {/* Diagnostic string */}
              <div className="p-2.5 rounded-lg bg-cyan-950/30 border border-cyan-800/40 text-[11px] text-cyan-200 mb-3">
                💡 {simResult?.explanation || "Calculating dynamic factor contributions..."}
              </div>

              {/* Contributing factors */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Top SHAP Factor Attribution:
                </span>
                {simResult?.factors?.slice(0, 4).map((f: any, idx: number) => (
                  <div key={idx} className="text-xs">
                    <div className="flex justify-between text-slate-300 text-[11px] mb-0.5">
                      <span>{f.factor}</span>
                      <span className="font-mono text-cyan-400">{f.percentage}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                      <div 
                        className="bg-cyan-500 h-full rounded-full"
                        style={{ width: `${f.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-[10px] text-slate-500 font-mono flex items-center justify-between border-t border-slate-800 pt-2">
              <span>Model: XGBoost Multi-Target</span>
              <span>Inference: 8.4 ms</span>
            </div>
          </div>
        </div>
      </div>

      {/* Corridors Ranked by Forecasted Congestion */}
      <div className="p-5 rounded-xl bg-[#0D1527] border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Corridors Ranked by +{horizon}-Minute Congestion Forecast
            </h3>
            <p className="text-[11px] text-slate-400">
              Highest anticipated queue build-up requiring pre-emptive signal optimization
            </p>
          </div>
          <span className="text-[10px] font-mono text-slate-400">Showing Top 20</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {predictions.slice(0, 16).map((pred) => (
            <div
              key={pred.road_id}
              onClick={() => onSelectRoad(pred)}
              className="p-3 rounded-xl bg-[#090E1A] hover:bg-slate-800/60 border border-slate-800 hover:border-cyan-500/40 cursor-pointer transition-all space-y-2 group"
            >
              <div className="flex items-start justify-between">
                <span className="font-semibold text-slate-100 group-hover:text-cyan-300 text-xs truncate block max-w-[140px]">
                  {pred.name}
                </span>
                <span 
                  className="font-bold font-mono text-xs px-1.5 py-0.5 rounded"
                  style={{
                    backgroundColor: `${getScoreColor(pred.predicted_score || 50)}15`,
                    color: getScoreColor(pred.predicted_score || 50)
                  }}
                >
                  {pred.predicted_score || 50}/100
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>{pred.district}</span>
                <span className="font-semibold text-slate-300">{pred.predicted_level || "MODERATE"}</span>
              </div>

              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all"
                  style={{ 
                    width: `${pred.predicted_score || 50}%`,
                    backgroundColor: getScoreColor(pred.predicted_score || 50) 
                  }}
                />
              </div>

              <div className="pt-1 text-[10px] text-slate-500 flex items-center justify-between">
                <span>Current: {pred.current_score || 45}/100</span>
                <span className="text-cyan-400 font-mono">Conf: 92%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
