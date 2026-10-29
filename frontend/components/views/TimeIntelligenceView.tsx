"use client";

import React, { useState, useEffect } from "react";
import { HeatmapDay, api } from "@/services/api";
import { Clock, Calendar, ArrowUpRight, Flame, Moon, Sun, Info } from "lucide-react";

export const TimeIntelligenceView: React.FC = () => {
  const [heatmap, setHeatmap] = useState<HeatmapDay[]>([]);
  const [hoveredCell, setHoveredCell] = useState<{ day: string; hour: number; score: number } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    api.getHeatmap()
      .then(res => {
        setHeatmap(res);
        setLoading(false);
      })
      .catch(err => {
        console.error("Heatmap error:", err);
        setLoading(false);
      });
  }, []);

  const getHeatmapColor = (score: number) => {
    // 0 to 100 color scale
    if (score >= 80) return "bg-[#EF4444] text-white"; // Severe Red
    if (score >= 65) return "bg-[#F97316] text-white"; // Heavy Orange
    if (score >= 50) return "bg-[#F59E0B] text-slate-900"; // Moderate Amber
    if (score >= 35) return "bg-[#06B6D4] text-slate-900"; // Light Cyan
    if (score >= 20) return "bg-[#0284C7] text-white"; // Blue
    return "bg-[#0F172A] text-slate-500 border border-slate-800"; // Low Dark
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-[#0D1527] border border-slate-800">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Clock className="w-5 h-5 text-cyan-400" />
            Time Intelligence & Commuter Rush Patterns
          </h2>
          <p className="text-xs text-slate-400">
            Multi-week temporal distribution matrix mapping hourly rush windows against day-of-week trends
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-cyan-300">
          <Calendar className="w-4 h-4 text-cyan-400" />
          <span>7 Days × 24 Hours Temporal Grid</span>
        </div>
      </div>

      {/* Critical Temporal Windows Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl bg-[#0D1527] border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Morning Inflow Peak</span>
            <Sun className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-xl font-bold font-mono text-amber-400">07:30 – 09:45</span>
          <p className="text-[11px] text-slate-400 mt-1">
            CBD & Tech Hub ingress corridors peak at 76/100 congestion.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#0D1527] border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Evening Outflow Peak</span>
            <Flame className="w-4 h-4 text-rose-400" />
          </div>
          <span className="text-xl font-bold font-mono text-rose-400">17:15 – 19:45</span>
          <p className="text-[11px] text-slate-400 mt-1">
            Severe bottlenecks on outbound freeways reaching 88/100 index.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#0D1527] border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Weekend Shift</span>
            <Calendar className="w-4 h-4 text-cyan-400" />
          </div>
          <span className="text-xl font-bold font-mono text-cyan-300">13:30 – 18:00</span>
          <p className="text-[11px] text-slate-400 mt-1">
            Commute shifts to harbor districts, beaches, and leisure arteries.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#0D1527] border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Late Night Quiescence</span>
            <Moon className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-xl font-bold font-mono text-emerald-400">01:30 – 05:00</span>
          <p className="text-[11px] text-slate-400 mt-1">
            Low density (&lt;16/100). Prime window for heavy logistics and road work.
          </p>
        </div>
      </div>

      {/* The 7 Days x 24 Hours Traffic Heatmap Grid */}
      <div className="p-5 rounded-xl bg-[#0D1527] border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Corridor Congestion Heatmap Matrix (Monday – Sunday)
            </h3>
            <p className="text-[11px] text-slate-400">
              Color intensity depicts average congestion score (0–100) across all metropolitan road links
            </p>
          </div>

          {/* Color Scale Legend */}
          <div className="flex items-center gap-1.5 text-[10px]">
            <span className="text-slate-400">Low</span>
            <div className="w-4 h-4 rounded bg-[#0F172A] border border-slate-700" />
            <div className="w-4 h-4 rounded bg-[#0284C7]" />
            <div className="w-4 h-4 rounded bg-[#06B6D4]" />
            <div className="w-4 h-4 rounded bg-[#F59E0B]" />
            <div className="w-4 h-4 rounded bg-[#F97316]" />
            <div className="w-4 h-4 rounded bg-[#EF4444]" />
            <span className="text-slate-400">Severe</span>
          </div>
        </div>

        {/* Heatmap Grid Table */}
        <div className="overflow-x-auto pb-2">
          <div className="min-w-[760px]">
            {/* Hour header */}
            <div className="grid grid-cols-[100px_repeat(24,1fr)] gap-1 mb-1 text-center text-[10px] font-mono text-slate-400 select-none">
              <div className="text-left font-semibold text-slate-400 pl-2">Day / Hour</div>
              {Array.from({ length: 24 }).map((_, h) => (
                <div key={h} className="truncate">
                  {h % 2 === 0 ? `${h}h` : ""}
                </div>
              ))}
            </div>

            {/* Days rows */}
            <div className="space-y-1">
              {heatmap.map((dayRow) => (
                <div key={dayRow.day} className="grid grid-cols-[100px_repeat(24,1fr)] gap-1 items-center">
                  <div className="text-xs font-semibold text-slate-300 truncate pl-2 select-none">
                    {dayRow.day}
                  </div>

                  {dayRow.hours.map((cell) => {
                    const colorClass = getHeatmapColor(cell.score);

                    return (
                      <div
                        key={cell.hour}
                        onMouseEnter={() => setHoveredCell({ day: dayRow.day, hour: cell.hour, score: cell.score })}
                        onMouseLeave={() => setHoveredCell(null)}
                        className={`h-7 rounded flex items-center justify-center text-[9px] font-mono font-bold cursor-pointer transition-transform hover:scale-110 hover:z-10 shadow-sm ${colorClass}`}
                        title={`${dayRow.day} at ${cell.hour_label}: Congestion ${cell.score}/100`}
                      >
                        {Math.round(cell.score)}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Hover Inspector Banner */}
        <div className="p-2.5 rounded-lg bg-[#090E1A] border border-slate-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-300">
            <Info className="w-4 h-4 text-cyan-400" />
            {hoveredCell ? (
              <span>
                Selected: <strong className="text-cyan-300">{hoveredCell.day} at {hoveredCell.hour.toString().padStart(2, "0")}:00</strong> • Average Congestion Index: <strong className="text-amber-400">{hoveredCell.score}/100</strong>
              </span>
            ) : (
              <span className="text-slate-500">Hover over any hourly cell on the matrix to view specific details.</span>
            )}
          </div>
          <span className="text-[10px] font-mono text-slate-500">Calculated over 147k records</span>
        </div>
      </div>
    </div>
  );
};
