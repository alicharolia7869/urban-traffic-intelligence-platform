"use client";

import React, { useState, useEffect } from "react";
import { HourlyPoint, api } from "@/services/api";
import { 
  LineChart, Line, BarChart, Bar, AreaChart, Area, 
  XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend, ScatterChart, Scatter 
} from "recharts";
import { 
  TrendingUp, Gauge, Car, Clock, Filter, ArrowUpRight, 
  Layers, BarChart2, Activity, PieChart 
} from "lucide-react";

export const AnalyticsView: React.FC = () => {
  const [hourlyData, setHourlyData] = useState<HourlyPoint[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [metricFilter, setMetricFilter] = useState<string>("all");
  const [dayFilter, setDayFilter] = useState<string>("all");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    Promise.all([
      api.getHourlyProfile(),
      api.getAnalyticsSummary()
    ]).then(([hRes, sRes]) => {
      setHourlyData(hRes);
      setSummary(sRes);
      setLoading(false);
    }).catch(err => {
      console.error("Analytics fetch error:", err);
      setLoading(false);
    });
  }, []);

  // Speed vs Volume scatter points
  const scatterData = hourlyData.map(d => ({
    volume: d.volume,
    speed: d.speed,
    occupancy: d.occupancy,
    hour: d.hour
  }));

  return (
    <div className="space-y-6">
      {/* Analytics Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-[#0D1527] border border-slate-800">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
            Urban Traffic Analytics & Pattern Discovery
          </h2>
          <p className="text-xs text-slate-400">
            Temporal trends, fundamental traffic diagrams, speed distributions, and volume surges
          </p>
        </div>

        {/* Filter Selection */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Trend Focus:</span>
          <select
            value={metricFilter}
            onChange={(e) => setMetricFilter(e.target.value)}
            className="bg-[#090E1A] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Metrics (Speed & Volume)</option>
            <option value="speed">Velocity Only (km/h)</option>
            <option value="congestion">Congestion Score (0–100)</option>
            <option value="occupancy">Road Occupancy (%)</option>
          </select>
        </div>
      </div>

      {/* Summary KPI Highlights */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-3.5 rounded-xl bg-[#0D1527] border border-slate-800">
          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Peak Traffic Hour</span>
          <span className="text-lg font-bold font-mono text-rose-400 mt-1 block">
            {summary?.peak_traffic_hour || "18:00 - 19:00"}
          </span>
          <span className="text-[10px] text-slate-400">Congestion index: {summary?.peak_hour_congestion || 78}/100</span>
        </div>

        <div className="p-3.5 rounded-xl bg-[#0D1527] border border-slate-800">
          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Peak Commuter Day</span>
          <span className="text-lg font-bold font-mono text-amber-400 mt-1 block">
            {summary?.peak_traffic_day || "Friday"}
          </span>
          <span className="text-[10px] text-slate-400">Highest commercial + transit load</span>
        </div>

        <div className="p-3.5 rounded-xl bg-[#0D1527] border border-slate-800">
          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Lowest Traffic Window</span>
          <span className="text-lg font-bold font-mono text-emerald-400 mt-1 block">
            {summary?.lowest_traffic_period || "02:00 - 04:00"}
          </span>
          <span className="text-[10px] text-slate-400">Congestion drops to {summary?.lowest_congestion || 14}/100</span>
        </div>

        <div className="p-3.5 rounded-xl bg-[#0D1527] border border-slate-800">
          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Flow Ratio</span>
          <span className="text-lg font-bold font-mono text-cyan-300 mt-1 block">
            82.4% Free Flow
          </span>
          <span className="text-[10px] text-slate-400">During off-peak daytime hours</span>
        </div>
      </div>

      {/* Primary Chart: 24-Hour Velocity & Congestion Dual Curve */}
      <div className="p-5 rounded-xl bg-[#0D1527] border border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Hourly Velocity, Volume & Occupancy Dynamics
            </h3>
            <p className="text-[11px] text-slate-400">
              24-hour cycle showing the morning rush (08:00) and evening bottleneck (18:00)
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1 text-cyan-400">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" /> Speed (km/h)
            </span>
            <span className="flex items-center gap-1 text-rose-400">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Congestion (0-100)
            </span>
            <span className="flex items-center gap-1 text-blue-400">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Volume
            </span>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={hourlyData}>
              <defs>
                <linearGradient id="areaSpeed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.35}/>
                  <stop offset="95%" stopColor="#06B6D4" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="areaCong" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.35}/>
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
              <XAxis dataKey="hour" stroke="#64748B" fontSize={10} />
              <YAxis yAxisId="left" stroke="#06B6D4" fontSize={10} unit=" km/h" />
              <YAxis yAxisId="right" orientation="right" stroke="#EF4444" fontSize={10} unit="/100" />
              <Tooltip 
                contentStyle={{ backgroundColor: "#0D1527", borderColor: "#334155", fontSize: 11 }}
                formatter={(val: any, name: any) => [
                  name === "speed" ? `${val} km/h` : (name === "congestion" ? `${val}/100` : val),
                  name === "speed" ? "Average Speed" : (name === "congestion" ? "Congestion Score" : "Volume")
                ]}
              />
              <Area yAxisId="left" type="monotone" dataKey="speed" stroke="#06B6D4" fill="url(#areaSpeed)" strokeWidth={2.5} />
              <Area yAxisId="right" type="monotone" dataKey="congestion" stroke="#EF4444" fill="url(#areaCong)" strokeWidth={2.5} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Secondary Row: Speed vs Volume Fundamental Diagram + Occupancy Profile */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Speed vs Volume Fundamental Diagram */}
        <div className="p-5 rounded-xl bg-[#0D1527] border border-slate-800 space-y-3">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Macroscopic Fundamental Diagram (Speed vs Vehicle Volume)
            </h3>
            <p className="text-[11px] text-slate-400">
              As vehicle volume nears capacity, speeds drop sharply following Greenshields model
            </p>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis type="number" dataKey="volume" name="Vehicle Volume" stroke="#64748B" fontSize={10} unit=" vph" />
                <YAxis type="number" dataKey="speed" name="Speed" stroke="#64748B" fontSize={10} unit=" km/h" />
                <Tooltip 
                  cursor={{ strokeDasharray: '3 3' }}
                  contentStyle={{ backgroundColor: "#0D1527", borderColor: "#334155", fontSize: 11 }}
                  formatter={(val: any, name: any) => [
                    name === "Speed" ? `${val} km/h` : val,
                    name
                  ]}
                />
                <Scatter name="Corridor Readings" data={scatterData} fill="#38BDF8" shape="circle" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Road Occupancy Distribution Across 24 Hours */}
        <div className="p-5 rounded-xl bg-[#0D1527] border border-slate-800 space-y-3">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Average Road Occupancy % by Hour
            </h3>
            <p className="text-[11px] text-slate-400">
              Corridor saturation percentage (above 70% induces queue propagation)
            </p>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="hour" stroke="#64748B" fontSize={10} />
                <YAxis stroke="#64748B" fontSize={10} unit="%" />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#0D1527", borderColor: "#334155", fontSize: 11 }}
                  formatter={(val: any) => [`${val}%`, "Occupancy"]}
                />
                <Bar dataKey="occupancy" fill="#F59E0B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
