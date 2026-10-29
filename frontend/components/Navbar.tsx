"use client";

import React, { useState, useEffect } from "react";
import { 
  Search, Bell, Activity, RefreshCw, Zap, Shield, 
  MapPin, CheckCircle, AlertTriangle, X 
} from "lucide-react";
import { api } from "@/services/api";

interface NavbarProps {
  onSearch: (query: string) => void;
  onSimulateTick: () => void;
  isSimulating: boolean;
  activeView: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  onSearch,
  onSimulateTick,
  isSimulating,
  activeView
}) => {
  const [time, setTime] = useState<string>("");
  const [searchVal, setSearchVal] = useState("");
  const [showAlerts, setShowAlerts] = useState(false);
  const [activeAlerts, setActiveAlerts] = useState<any[]>([]);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toTimeString().split(" ")[0] + " UTC");
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Load active critical alerts
    api.getIncidentsAnalytics().then(res => {
      const urgent = res.incidents.filter(i => i.status === "Active" || i.severity === "Critical");
      setActiveAlerts(urgent);
    }).catch(() => {});
  }, [isSimulating]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchVal);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#090E1A]/90 backdrop-blur-md border-b border-[#1E293B] px-4 py-2.5">
      <div className="flex items-center justify-between gap-4">
        {/* Brand / Center Title */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Activity className="w-5 h-5 animate-pulse" />
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 radar-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black tracking-wider text-slate-100 uppercase">
                Urban Traffic Intelligence
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-700/50 text-cyan-300 font-semibold tracking-widest">
                v2.0 AI
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Smart City Mobility Command Center • Real-Time AI Forecasting
            </p>
          </div>
        </div>

        {/* Global Search Bar */}
        <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-md relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search road corridor, ID, or district (e.g. RD-001, Express Highway)..."
            value={searchVal}
            onChange={(e) => {
              setSearchVal(e.target.value);
              onSearch(e.target.value);
            }}
            className="w-full bg-[#0D1527] border border-slate-700/70 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
          />
          {searchVal && (
            <button 
              type="button" 
              onClick={() => { setSearchVal(""); onSearch(""); }}
              className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-200 text-xs"
            >
              ✕
            </button>
          )}
        </form>

        {/* Status Indicators, Simulation & Controls */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          {/* Live Data Badge */}
          <div className="hidden lg:flex items-center gap-2 bg-[#0D1527] border border-emerald-500/20 px-2.5 py-1 rounded-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-[11px] font-mono font-medium text-emerald-400">
              TELEMATICS LIVE
            </span>
          </div>

          {/* Clock */}
          <div className="hidden sm:flex items-center gap-1.5 bg-[#0D1527] border border-slate-800 px-2.5 py-1 rounded-md text-xs font-mono text-cyan-300">
            <span className="text-slate-500">SYS:</span>
            <span>{time || "12:00:00 UTC"}</span>
          </div>

          {/* Quick Simulation Advance Tick */}
          <button
            onClick={onSimulateTick}
            disabled={isSimulating}
            title="Simulate 15-minute telematics advance"
            className="flex items-center gap-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-medium px-3 py-1.5 rounded-lg border border-cyan-400/30 shadow-lg shadow-cyan-900/20 transition-all active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSimulating ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Advance +15m</span>
          </button>

          {/* Alert Bell */}
          <div className="relative">
            <button
              onClick={() => setShowAlerts(!showAlerts)}
              className="relative p-1.5 rounded-lg bg-[#0D1527] border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white transition-colors"
            >
              <Bell className="w-4 h-4" />
              {activeAlerts.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
                  {activeAlerts.length}
                </span>
              )}
            </button>

            {/* Alerts Dropdown Modal */}
            {showAlerts && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#0D1527] border border-slate-700 rounded-xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-semibold text-slate-200">Active Network Alerts</span>
                  </div>
                  <button onClick={() => setShowAlerts(false)} className="text-slate-400 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {activeAlerts.length === 0 ? (
                    <p className="text-xs text-slate-400 py-3 text-center">No critical incidents at this moment.</p>
                  ) : (
                    activeAlerts.map((alert, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-slate-900/80 border border-rose-500/20 text-xs">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-rose-400">{alert.incident_type}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 font-mono">
                            {alert.severity}
                          </span>
                        </div>
                        <p className="text-slate-300 text-[11px] mb-1">{alert.description}</p>
                        <div className="flex items-center justify-between text-[10px] text-slate-500">
                          <span>{alert.road_name} ({alert.road_id})</span>
                          <span>Speed drop: {alert.speed_impact_pct}%</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Operations Hub Selector */}
          <div className="flex items-center gap-2 border-l border-slate-800 pl-3">
            <div className="w-7 h-7 rounded-full bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-300 text-xs font-bold">
              OP
            </div>
            <div className="hidden xl:block text-left">
              <div className="text-[11px] font-semibold text-slate-200 leading-none">Metro Core</div>
              <div className="text-[9px] text-slate-400 leading-none mt-0.5">District Dispatch</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
