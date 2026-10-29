"use client";

import React, { useState, useEffect } from "react";
import { PropagationData, api } from "@/services/api";
import { Network, ArrowDown, Activity, AlertTriangle, Clock, Layers, Zap } from "lucide-react";

export const PropagationView: React.FC = () => {
  const [data, setData] = useState<PropagationData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    api.getPropagation()
      .then(res => {
        setData(res);
        setLoading(false);
      })
      .catch(err => {
        console.error("Propagation error:", err);
        setLoading(false);
      });
  }, []);

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
            <Network className="w-5 h-5 text-cyan-400" />
            Congestion Propagation & Shockwave Dynamics
          </h2>
          <p className="text-xs text-slate-400">
            Network graph modeling how severe bottlenecks cascade upstream and infiltrate connected feeder corridors
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#090E1A] border border-cyan-500/20 px-3 py-1.5 rounded-lg text-xs font-mono text-cyan-300">
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
          <span>Graph Neural Network Node Edges</span>
        </div>
      </div>

      {/* Propagation Chains Visualization (Prompt Requirement #16) */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
          Active Cascading Propagation Corridors
        </h3>

        {data?.chains.map((chain, cIdx) => (
          <div key={cIdx} className="p-5 rounded-xl bg-[#0D1527] border border-slate-800 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
              <div className="flex items-center gap-2.5">
                <span className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  <AlertTriangle className="w-4 h-4" />
                </span>
                <div>
                  <h4 className="text-sm font-bold text-slate-100">{chain.source.name}</h4>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Origin Bottleneck Node: {chain.source.road_id} • {chain.source.district}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs font-mono">
                <span className="text-slate-400">Shockwave Speed: <strong className="text-amber-300">{chain.shockwave_velocity}</strong></span>
                <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 font-bold">
                  {chain.spillover_risk} Spillover Risk
                </span>
              </div>
            </div>

            {/* Visual Node Chain: Source -> Intermediate -> Downstream Predicted */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
              {/* Node 1: Source */}
              <div className="p-4 rounded-xl bg-[#090E1A] border border-rose-500/40 relative">
                <div className="flex items-center justify-between text-xs text-rose-400 font-bold uppercase mb-1">
                  <span>1. Source Bottleneck</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-rose-950 text-rose-300">
                    CURRENT
                  </span>
                </div>
                <div className="font-semibold text-slate-100 text-sm truncate">{chain.source.name}</div>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-2xl font-black font-mono text-rose-400">
                    {chain.source.congestion_score}/100
                  </span>
                  <span className="text-xs font-bold text-rose-300">CRITICAL</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Vehicle density exceeding corridor throughput</p>
              </div>

              {/* Arrow Connector */}
              <div className="hidden md:flex flex-col items-center justify-center">
                <span className="text-[10px] font-mono text-cyan-400 mb-1">Downstream Cascade</span>
                <div className="w-full flex items-center justify-center text-cyan-400">
                  <div className="h-[2px] w-16 bg-gradient-to-r from-rose-500 to-amber-500" />
                  <span className="text-sm font-black">▶</span>
                </div>
                <span className="text-[9px] text-slate-500 mt-1">~12 min shockwave lag</span>
              </div>

              {/* Node 2 & 3: Affected Feeder Corridors */}
              <div className="space-y-2">
                {chain.downstream_impacts.map((down, dIdx) => (
                  <div key={dIdx} className="p-3 rounded-lg bg-[#090E1A] border border-amber-500/30">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-200 truncate">{down.name}</span>
                      <span className="text-[10px] font-mono text-amber-400 font-bold">
                        T+30m: {down.predicted_30m}/100
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                      <span>Current: {down.current_congestion}/100</span>
                      <span className="text-cyan-300 font-semibold">{down.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Propagation Timeline (Prompt Requirement #16) */}
      <div className="p-5 rounded-xl bg-[#0D1527] border border-slate-800 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
          Cascading Shockwave Timeline Stages
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {data?.timeline.map((step, idx) => (
            <div key={idx} className="p-3.5 rounded-xl bg-[#090E1A] border border-slate-800 space-y-1.5 relative overflow-hidden">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono font-bold text-cyan-400">{step.time}</span>
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
              </div>
              <h4 className="text-xs font-bold text-slate-200">{step.stage}</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
