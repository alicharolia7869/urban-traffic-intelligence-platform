"use client";

import React, { useState, useEffect } from "react";
import { Road, api } from "@/services/api";
import { TrafficMap } from "@/maps/TrafficMap";
import { 
  Search, Filter, MapPin, Gauge, Clock, TrendingUp, AlertTriangle, 
  Layers, Compass, Info, ChevronRight, Activity 
} from "lucide-react";

interface LiveTrafficViewProps {
  onSelectRoad: (road: Road) => void;
}

export const LiveTrafficView: React.FC<LiveTrafficViewProps> = ({ onSelectRoad }) => {
  const [roads, setRoads] = useState<Road[]>([]);
  const [selectedRoad, setSelectedRoad] = useState<Road | null>(null);
  const [search, setSearch] = useState<string>("");
  const [districtFilter, setDistrictFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    api.getRoads()
      .then(res => {
        setRoads(res);
        if (res.length > 0) setSelectedRoad(res[0]);
        setLoading(false);
      })
      .catch(err => {
        console.error("Live traffic roads error:", err);
        setLoading(false);
      });
  }, []);

  const getScoreColor = (score?: number, level?: string) => {
    if (level === "SEVERE" || (score !== undefined && score >= 80)) return "#EF4444";
    if (level === "HEAVY" || (score !== undefined && score >= 60)) return "#F97316";
    if (level === "MODERATE" || (score !== undefined && score >= 40)) return "#F59E0B";
    if (level === "LIGHT" || (score !== undefined && score >= 20)) return "#06B6D4";
    return "#10B981";
  };

  const filteredRoads = roads.filter(r => {
    if (districtFilter !== "All" && r.district !== districtFilter) return false;
    if (statusFilter !== "All" && r.congestion_level !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return r.name.toLowerCase().includes(q) || r.road_id.toLowerCase().includes(q) || r.district.toLowerCase().includes(q);
    }
    return true;
  });

  const districts = ["All", ...Array.from(new Set(roads.map(r => r.district)))];

  const handleRoadClick = (road: Road) => {
    setSelectedRoad(road);
    onSelectRoad(road);
  };

  return (
    <div className="space-y-4">
      {/* Top Bar Filter & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-xl bg-[#0D1527] border border-slate-800">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Compass className="w-5 h-5 text-cyan-400" />
            Live GIS Telematics Network Map
          </h2>
          <p className="text-xs text-slate-400">
            Real-time sensory speeds, volume, occupancy, and 15/30/60-min multi-horizon forecasts
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search corridor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-[#090E1A] border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-44"
            />
          </div>

          {/* District */}
          <select
            value={districtFilter}
            onChange={(e) => setDistrictFilter(e.target.value)}
            className="bg-[#090E1A] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            {districts.map(d => (
              <option key={d} value={d}>{d === "All" ? "All Districts" : d}</option>
            ))}
          </select>

          {/* Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#090E1A] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="All">All Statuses</option>
            <option value="LOW">🟢 Low</option>
            <option value="LIGHT">🔵 Light</option>
            <option value="MODERATE">🟡 Moderate</option>
            <option value="HEAVY">🟠 Heavy</option>
            <option value="SEVERE">🔴 Severe</option>
          </select>
        </div>
      </div>

      {/* Main Grid: Left Map + Right Corridor Browser & Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Map Panel (8 cols) */}
        <div className="lg:col-span-8 flex flex-col">
          <TrafficMap
            roads={filteredRoads}
            selectedRoad={selectedRoad}
            onSelectRoad={handleRoadClick}
            className="h-[640px] w-full"
          />
        </div>

        {/* Right Corridor Details & List (4 cols) */}
        <div className="lg:col-span-4 flex flex-col space-y-4">
          {/* Selected Corridor Live Telemetry Box */}
          {selectedRoad ? (
            <div className="p-4 rounded-xl bg-[#0D1527] border border-cyan-500/40 shadow-xl space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-100">{selectedRoad.name}</h3>
                  <span className="text-[10px] font-mono text-cyan-400 block mt-0.5">
                    {selectedRoad.road_id} • {selectedRoad.road_type} • {selectedRoad.district}
                  </span>
                </div>
                <div 
                  className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider font-mono border"
                  style={{
                    backgroundColor: `${getScoreColor(selectedRoad.congestion_score, selectedRoad.congestion_level)}15`,
                    borderColor: `${getScoreColor(selectedRoad.congestion_score, selectedRoad.congestion_level)}50`,
                    color: getScoreColor(selectedRoad.congestion_score, selectedRoad.congestion_level)
                  }}
                >
                  {selectedRoad.congestion_level || "MODERATE"}
                </div>
              </div>

              {/* Status Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded-lg bg-[#090E1A] border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Current Velocity</span>
                  <span className="text-base font-bold font-mono text-cyan-300">
                    {selectedRoad.avg_speed || 32} km/h
                  </span>
                  <span className="text-[9px] text-slate-500 block">Limit: {selectedRoad.speed_limit} km/h</span>
                </div>

                <div className="p-2 rounded-lg bg-[#090E1A] border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Congestion Score</span>
                  <span 
                    className="text-base font-bold font-mono"
                    style={{ color: getScoreColor(selectedRoad.congestion_score) }}
                  >
                    {selectedRoad.congestion_score || 50}/100
                  </span>
                  <span className="text-[9px] text-slate-500 block">Occupancy: {selectedRoad.occupancy || 45}%</span>
                </div>

                <div className="p-2 rounded-lg bg-[#090E1A] border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Vehicles Count</span>
                  <span className="text-base font-bold font-mono text-slate-200">
                    {(selectedRoad.vehicle_count || 1200).toLocaleString()}
                  </span>
                  <span className="text-[9px] text-slate-500 block">Cap: {selectedRoad.capacity_vph} vph</span>
                </div>

                <div className="p-2 rounded-lg bg-[#090E1A] border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Travel Time</span>
                  <span className="text-base font-bold font-mono text-emerald-300">
                    {Math.round(((selectedRoad.travel_time_sec || 300) / 60) * 10) / 10} min
                  </span>
                  <span className="text-[9px] text-slate-500 block">{selectedRoad.length_km} km length</span>
                </div>
              </div>

              {/* Multi-Horizon Forecasting Section (Requirement #7) */}
              <div className="pt-2 border-t border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  AI Congestion Forecast Horizons
                </span>
                <div className="grid grid-cols-3 gap-1.5 text-center">
                  <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                    <span className="text-[9px] text-slate-400 block">15 Min</span>
                    <span 
                      className="text-xs font-bold font-mono block"
                      style={{ color: getScoreColor(selectedRoad.pred_15m) }}
                    >
                      {selectedRoad.pred_15m || 48}
                    </span>
                    <span className="text-[9px] font-semibold text-slate-400">{selectedRoad.pred_level_15m || "MOD"}</span>
                  </div>

                  <div className="p-2 rounded-lg bg-cyan-950/40 border border-cyan-800/40">
                    <span className="text-[9px] text-cyan-300 block font-semibold">30 Min</span>
                    <span 
                      className="text-xs font-bold font-mono block"
                      style={{ color: getScoreColor(selectedRoad.pred_30m) }}
                    >
                      {selectedRoad.pred_30m || 58}
                    </span>
                    <span className="text-[9px] font-semibold text-slate-400">{selectedRoad.pred_level_30m || "HEAVY"}</span>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                    <span className="text-[9px] text-slate-400 block">60 Min</span>
                    <span 
                      className="text-xs font-bold font-mono block"
                      style={{ color: getScoreColor(selectedRoad.pred_60m) }}
                    >
                      {selectedRoad.pred_60m || 52}
                    </span>
                    <span className="text-[9px] font-semibold text-slate-400">{selectedRoad.pred_level_60m || "MOD"}</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => onSelectRoad(selectedRoad)}
                className="w-full py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-lg shadow-cyan-900/20"
              >
                Inspect Telematics & XAI Factors <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="p-6 rounded-xl bg-[#0D1527] border border-slate-800 text-center text-xs text-slate-400">
              Click any road segment on the map to inspect live metrics.
            </div>
          )}

          {/* Quick Corridor Selection List */}
          <div className="flex-1 p-3 rounded-xl bg-[#0D1527] border border-slate-800 flex flex-col max-h-[300px] overflow-hidden">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                Corridors ({filteredRoads.length})
              </span>
              <span className="text-[10px] text-slate-500">Sorted by Congestion</span>
            </div>

            <div className="overflow-y-auto space-y-1.5 flex-1 pr-1">
              {filteredRoads.map((r) => (
                <div
                  key={r.road_id}
                  onClick={() => handleRoadClick(r)}
                  className={`p-2 rounded-lg cursor-pointer transition-all flex items-center justify-between text-xs border ${
                    selectedRoad?.road_id === r.road_id
                      ? "bg-cyan-500/15 border-cyan-500/40 text-cyan-200"
                      : "bg-[#090E1A]/80 border-slate-800 hover:border-slate-700 text-slate-300"
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <span className="font-semibold block truncate text-[11px]">{r.name}</span>
                    <span className="text-[10px] text-slate-500">{r.road_id} • {r.avg_speed || 35} km/h</span>
                  </div>

                  <div 
                    className="font-bold font-mono text-xs shrink-0"
                    style={{ color: getScoreColor(r.congestion_score, r.congestion_level) }}
                  >
                    {r.congestion_score || 45}/100
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
