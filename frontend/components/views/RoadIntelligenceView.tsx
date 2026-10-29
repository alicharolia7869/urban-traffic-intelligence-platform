"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Road, api } from "@/services/api";
import { 
  Route, Search, ArrowUpDown, ChevronDown, ChevronUp, 
  Filter, AlertTriangle, ExternalLink, ShieldCheck, Compass 
} from "lucide-react";

interface RoadIntelligenceViewProps {
  onSelectRoad: (road: Road) => void;
}

type SortField = "name" | "vehicle_count" | "avg_speed" | "occupancy" | "congestion_score" | "pred_30m";

export const RoadIntelligenceView: React.FC<RoadIntelligenceViewProps> = ({ onSelectRoad }) => {
  const [roads, setRoads] = useState<Road[]>([]);
  const [search, setSearch] = useState<string>("");
  const [districtFilter, setDistrictFilter] = useState<string>("All");
  const [typeFilter, setTypeFilter] = useState<string>("All");
  const [sortField, setSortField] = useState<SortField>("congestion_score");
  const [sortAsc, setSortAsc] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    api.getRoads()
      .then(res => {
        setRoads(res);
        setLoading(false);
      })
      .catch(err => {
        console.error("Roads error:", err);
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

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false); // default desc
    }
  };

  const filteredAndSortedRoads = useMemo(() => {
    return roads
      .filter(r => {
        if (districtFilter !== "All" && r.district !== districtFilter) return false;
        if (typeFilter !== "All" && r.road_type !== typeFilter) return false;
        if (search) {
          const q = search.toLowerCase();
          return r.name.toLowerCase().includes(q) || r.road_id.toLowerCase().includes(q) || r.district.toLowerCase().includes(q);
        }
        return true;
      })
      .sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];

        if (typeof valA === "string") {
          valA = (valA as string).toLowerCase();
          valB = (valB as string).toLowerCase();
        }

        if (valA === undefined || valA === null) valA = 0;
        if (valB === undefined || valB === null) valB = 0;

        if (valA < valB) return sortAsc ? -1 : 1;
        if (valA > valB) return sortAsc ? 1 : -1;
        return 0;
      });
  }, [roads, search, districtFilter, typeFilter, sortField, sortAsc]);

  const districts = ["All", ...Array.from(new Set(roads.map(r => r.district)))];
  const roadTypes = ["All", "Expressway", "Arterial", "Boulevard", "Collector"];

  return (
    <div className="space-y-4">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-[#0D1527] border border-slate-800">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Route className="w-5 h-5 text-cyan-400" />
            Road Corridor Intelligence & Performance Rankings
          </h2>
          <p className="text-xs text-slate-400">
            Real-time congestion scores, speeds, occupancy, capacity, and 30-min AI risk levels for all {roads.length} corridors
          </p>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search corridor or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-[#090E1A] border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-48"
            />
          </div>

          {/* District filter */}
          <select
            value={districtFilter}
            onChange={(e) => setDistrictFilter(e.target.value)}
            className="bg-[#090E1A] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            {districts.map(d => (
              <option key={d} value={d}>{d === "All" ? "All Districts" : d}</option>
            ))}
          </select>

          {/* Type filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-[#090E1A] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            {roadTypes.map(t => (
              <option key={t} value={t}>{t === "All" ? "All Road Types" : t}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Ranking Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-[#0D1527] shadow-xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#090E1A] border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider select-none">
            <tr>
              <th className="py-3 px-4 cursor-pointer hover:text-slate-200" onClick={() => handleSort("name")}>
                <div className="flex items-center gap-1.5">
                  <span>Corridor Name / ID</span>
                  {sortField === "name" && (sortAsc ? <ChevronUp className="w-3.5 h-3.5 text-cyan-400" /> : <ChevronDown className="w-3.5 h-3.5 text-cyan-400" />)}
                </div>
              </th>
              <th className="py-3 px-3">Type & District</th>
              <th className="py-3 px-3 cursor-pointer hover:text-slate-200" onClick={() => handleSort("vehicle_count")}>
                <div className="flex items-center gap-1.5">
                  <span>Volume (Vehicles)</span>
                  {sortField === "vehicle_count" && (sortAsc ? <ChevronUp className="w-3.5 h-3.5 text-cyan-400" /> : <ChevronDown className="w-3.5 h-3.5 text-cyan-400" />)}
                </div>
              </th>
              <th className="py-3 px-3 cursor-pointer hover:text-slate-200" onClick={() => handleSort("avg_speed")}>
                <div className="flex items-center gap-1.5">
                  <span>Speed (km/h)</span>
                  {sortField === "avg_speed" && (sortAsc ? <ChevronUp className="w-3.5 h-3.5 text-cyan-400" /> : <ChevronDown className="w-3.5 h-3.5 text-cyan-400" />)}
                </div>
              </th>
              <th className="py-3 px-3 cursor-pointer hover:text-slate-200" onClick={() => handleSort("occupancy")}>
                <div className="flex items-center gap-1.5">
                  <span>Occupancy</span>
                  {sortField === "occupancy" && (sortAsc ? <ChevronUp className="w-3.5 h-3.5 text-cyan-400" /> : <ChevronDown className="w-3.5 h-3.5 text-cyan-400" />)}
                </div>
              </th>
              <th className="py-3 px-3 cursor-pointer hover:text-slate-200" onClick={() => handleSort("congestion_score")}>
                <div className="flex items-center gap-1.5">
                  <span>Congestion Score</span>
                  {sortField === "congestion_score" && (sortAsc ? <ChevronUp className="w-3.5 h-3.5 text-cyan-400" /> : <ChevronDown className="w-3.5 h-3.5 text-cyan-400" />)}
                </div>
              </th>
              <th className="py-3 px-3">Risk Level</th>
              <th className="py-3 px-3 cursor-pointer hover:text-slate-200" onClick={() => handleSort("pred_30m")}>
                <div className="flex items-center gap-1.5">
                  <span>T+30m Forecast</span>
                  {sortField === "pred_30m" && (sortAsc ? <ChevronUp className="w-3.5 h-3.5 text-cyan-400" /> : <ChevronDown className="w-3.5 h-3.5 text-cyan-400" />)}
                </div>
              </th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredAndSortedRoads.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-slate-500">
                  No matching road corridors found.
                </td>
              </tr>
            ) : (
              filteredAndSortedRoads.map((road) => (
                <tr
                  key={road.road_id}
                  onClick={() => onSelectRoad(road)}
                  className="hover:bg-slate-800/40 cursor-pointer transition-colors group"
                >
                  {/* Name / ID */}
                  <td className="py-3 px-4">
                    <span className="font-semibold text-slate-200 group-hover:text-cyan-300 block">
                      {road.name}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">{road.road_id}</span>
                  </td>

                  {/* Type / District */}
                  <td className="py-3 px-3">
                    <span className="text-slate-300 block">{road.district}</span>
                    <span className="text-[10px] text-cyan-400/80">{road.road_type}</span>
                  </td>

                  {/* Volume */}
                  <td className="py-3 px-3 font-mono text-slate-200">
                    {(road.vehicle_count || 1200).toLocaleString()}
                    <span className="text-[10px] text-slate-500 block">/ {road.capacity_vph} vph</span>
                  </td>

                  {/* Speed */}
                  <td className="py-3 px-3 font-mono">
                    <span className="font-bold text-cyan-300">{road.avg_speed || 35}</span>
                    <span className="text-[10px] text-slate-500"> / {road.speed_limit} km/h</span>
                  </td>

                  {/* Occupancy */}
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-slate-300">{road.occupancy || 45}%</span>
                    </div>
                    <div className="w-16 bg-slate-800 h-1 rounded-full overflow-hidden mt-1">
                      <div 
                        className="bg-amber-400 h-full"
                        style={{ width: `${Math.min(100, road.occupancy || 45)}%` }}
                      />
                    </div>
                  </td>

                  {/* Congestion Score */}
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <span 
                        className="font-bold font-mono text-sm"
                        style={{ color: getScoreColor(road.congestion_score, road.congestion_level) }}
                      >
                        {road.congestion_score || 50}
                      </span>
                      <span 
                        className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider"
                        style={{
                          backgroundColor: `${getScoreColor(road.congestion_score, road.congestion_level)}15`,
                          color: getScoreColor(road.congestion_score, road.congestion_level)
                        }}
                      >
                        {road.congestion_level || "MOD"}
                      </span>
                    </div>
                  </td>

                  {/* Risk Level */}
                  <td className="py-3 px-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                      road.risk_level === "Severe" 
                        ? "bg-rose-950 text-rose-300 border border-rose-800" 
                        : (road.risk_level === "Elevated" 
                            ? "bg-amber-950 text-amber-300 border border-amber-800"
                            : "bg-slate-800 text-slate-300")
                    }`}>
                      {road.risk_level || "Moderate"}
                    </span>
                  </td>

                  {/* Predicted 30m */}
                  <td className="py-3 px-3 font-mono font-bold">
                    <span style={{ color: getScoreColor(road.pred_30m, road.pred_level_30m) }}>
                      {road.pred_30m || 55}/100
                    </span>
                    <span className="text-[10px] text-slate-500 block">{road.pred_level_30m || "MOD"}</span>
                  </td>

                  {/* Action */}
                  <td className="py-3 px-4 text-right">
                    <span className="text-cyan-400 group-hover:text-cyan-300 text-xs font-medium inline-flex items-center gap-1">
                      Inspect <ExternalLink className="w-3 h-3" />
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
