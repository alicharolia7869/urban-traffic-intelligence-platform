"use client";

import React, { useEffect, useState } from "react";
import { KPIs, Road, HourlyPoint, api } from "@/services/api";
import { TrafficMap } from "@/maps/TrafficMap";
import { 
  Activity, Gauge, TrendingUp, AlertTriangle, Car, 
  ArrowUpRight, Clock, ShieldCheck, Sparkles, CloudRain,
  ChevronRight, ArrowDownRight, Compass
} from "lucide-react";
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar 
} from "recharts";

interface DashboardViewProps {
  onSelectRoad: (road: Road) => void;
  onNavigate: (viewId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onSelectRoad,
  onNavigate
}) => {
  const [kpis, setKpis] = useState<KPIs | null>(null);
  const [roads, setRoads] = useState<Road[]>([]);
  const [hourly, setHourly] = useState<HourlyPoint[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    Promise.all([
      api.getKPIs(),
      api.getRoads(),
      api.getHourlyProfile(),
      api.getAnalyticsSummary(),
      api.getWeatherAnalytics()
    ]).then(([kpiRes, roadsRes, hourlyRes, sumRes, weatherRes]) => {
      setKpis(kpiRes);
      setRoads(roadsRes);
      setHourly(hourlyRes);
      setSummary(sumRes);
      setWeather(weatherRes);
      setLoading(false);
    }).catch(err => {
      console.error("Dashboard data error:", err);
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

  const highRiskRoads = roads
    .filter(r => (r.congestion_score || 0) >= 55 || (r.pred_30m || 0) >= 60)
    .sort((a, b) => (b.congestion_score || 0) - (a.congestion_score || 0))
    .slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-[#0D1527] via-[#0A1020] to-[#0D1830] border border-cyan-500/20 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 radar-pulse" />
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase">
              Urban Traffic Intelligence
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 border border-cyan-700/50 text-cyan-300 font-bold">
              METROPOLIS GRID
            </span>
          </div>
          <p className="text-xs text-slate-400">
            AI-powered real-time traffic analysis and congestion forecasting • Connected Telematics Nodes: {roads.length}
          </p>
        </div>

        {/* Live Weather Quick Tag */}
        {weather?.current && (
          <div className="flex items-center gap-3 bg-[#080D1A]/80 border border-slate-800 px-3.5 py-2 rounded-xl text-xs">
            <div className="p-2 rounded-lg bg-blue-500/10 text-cyan-400">
              <CloudRain className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-200">{weather.current.condition}</span>
                <span className="font-mono text-cyan-300">{weather.current.temperature_c}°C</span>
              </div>
              <span className="text-[10px] text-slate-400">
                Rainfall: {weather.current.rainfall_mm} mm/h • Visibility: {weather.current.visibility_km} km
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 6 Top KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Active Roads */}
        <div className="p-4 rounded-xl bg-[#0D1527] border border-slate-800/80 glass-panel-hover">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Active Roads</span>
            <Compass className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black font-mono text-slate-100">
            {kpis?.active_roads || 110}
          </div>
          <div className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1 font-medium">
            <span>● 100% Monitored</span>
          </div>
        </div>

        {/* Congested Roads */}
        <div className="p-4 rounded-xl bg-[#0D1527] border border-slate-800/80 glass-panel-hover">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Congested Roads</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black font-mono text-amber-400">
            {kpis?.congested_roads || 18}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Score ≥ 60/100 threshold
          </div>
        </div>

        {/* Average Speed */}
        <div className="p-4 rounded-xl bg-[#0D1527] border border-slate-800/80 glass-panel-hover">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Average Speed</span>
            <Gauge className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black font-mono text-cyan-300">
              {kpis?.average_speed_kmh || 32.8}
            </span>
            <span className="text-xs text-slate-500 font-medium">km/h</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Citywide corridor average
          </div>
        </div>

        {/* Total Vehicles */}
        <div className="p-4 rounded-xl bg-[#0D1527] border border-slate-800/80 glass-panel-hover">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Vehicles Today</span>
            <Car className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black font-mono text-blue-300">
            {kpis?.vehicles_today?.toLocaleString() || "125,056"}
          </div>
          <div className="text-[10px] text-cyan-400 mt-1 flex items-center gap-1 font-mono">
            <ArrowUpRight className="w-3 h-3" /> Peak commuter flow
          </div>
        </div>

        {/* Congestion Index */}
        <div className="p-4 rounded-xl bg-[#0D1527] border border-slate-800/80 glass-panel-hover">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Congestion Index</span>
            <Activity className="w-4 h-4 text-rose-400" />
          </div>
          <div className="flex items-baseline gap-1">
            <span 
              className="text-2xl font-black font-mono"
              style={{ color: getScoreColor(kpis?.congestion_index || 45) }}
            >
              {kpis?.congestion_index || 45.2}
            </span>
            <span className="text-xs text-slate-500">/100</span>
          </div>
          <div className="text-[10px] uppercase font-bold text-slate-300 mt-1">
            {kpis?.congestion_level || "MODERATE"}
          </div>
        </div>

        {/* Prediction Accuracy */}
        <div className="p-4 rounded-xl bg-[#0D1527] border border-slate-800/80 glass-panel-hover">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Model Accuracy</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black font-mono text-emerald-400">
            {kpis?.prediction_accuracy || 93.6}%
          </div>
          <div className="text-[10px] text-slate-400 mt-1 font-mono">
            XGBoost Test Set R²
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Map + Real-time Diagnostics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Column (2 spans) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-100">
                Citywide GIS Telematics Map
              </h2>
            </div>
            <button
              onClick={() => onNavigate("live_traffic")}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium transition-colors"
            >
              Full GIS View <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <TrafficMap
            roads={roads}
            selectedRoad={null}
            onSelectRoad={onSelectRoad}
            className="h-[460px]"
          />
        </div>

        {/* Right Side: Congestion Distribution & High-Risk Corridors */}
        <div className="space-y-4">
          {/* Congestion Level Breakdown */}
          <div className="p-4 rounded-xl bg-[#0D1527] border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Network State Distribution
              </h3>
              <span className="text-[10px] text-slate-400">All Corridors</span>
            </div>

            <div className="space-y-2">
              {(summary?.congestion_distribution || [
                { level: "LOW", count: 48, color: "#10B981" },
                { level: "LIGHT", count: 28, color: "#06B6D4" },
                { level: "MODERATE", count: 18, color: "#F59E0B" },
                { level: "HEAVY", count: 12, color: "#F97316" },
                { level: "SEVERE", count: 4, color: "#EF4444" }
              ]).map((item: any) => (
                <div key={item.level} className="text-xs">
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span className="font-semibold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                      {item.level}
                    </span>
                    <span className="font-mono text-slate-400">
                      {item.count} roads ({Math.round((item.count / (roads.length || 110)) * 100)}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-800/80 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all"
                      style={{ 
                        width: `${Math.round((item.count / (roads.length || 110)) * 100)}%`,
                        backgroundColor: item.color 
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* High Congestion / Risk Watchlist */}
          <div className="p-4 rounded-xl bg-[#0D1527] border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Critical Corridors Watchlist
                </h3>
              </div>
              <button 
                onClick={() => onNavigate("roads")} 
                className="text-[10px] text-cyan-400 hover:text-cyan-300"
              >
                View 110 Roads
              </button>
            </div>

            <div className="space-y-2">
              {highRiskRoads.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">Network free-flowing.</p>
              ) : (
                highRiskRoads.map((r) => (
                  <div
                    key={r.road_id}
                    onClick={() => onSelectRoad(r)}
                    className="p-2.5 rounded-lg bg-slate-900/70 hover:bg-slate-800/80 border border-slate-800 hover:border-cyan-500/40 cursor-pointer transition-all flex items-center justify-between group"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-slate-100 group-hover:text-cyan-300 truncate block">
                          {r.name}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {r.district} • {r.avg_speed || 30} km/h
                      </span>
                    </div>

                    <div className="text-right shrink-0">
                      <div 
                        className="text-xs font-bold font-mono"
                        style={{ color: getScoreColor(r.congestion_score || 50) }}
                      >
                        {r.congestion_score || 50}/100
                      </div>
                      <div className="text-[10px] font-mono text-amber-400">
                        T+30m: {r.pred_30m || 55}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 24-Hour Velocity vs Congestion Dual Trend Chart */}
      <div className="p-5 rounded-2xl bg-[#0D1527] border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Citywide 24-Hour Velocity & Congestion Profile
            </h3>
            <p className="text-[11px] text-slate-400">
              Average road speed versus normalized congestion index across all 110 sensor corridors
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-cyan-400">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" /> Avg Speed (km/h)
            </span>
            <span className="flex items-center gap-1.5 text-rose-400">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Congestion Score
            </span>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={hourly}>
              <defs>
                <linearGradient id="hourSpeed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.35}/>
                  <stop offset="95%" stopColor="#06B6D4" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="hourCong" x1="0" y1="0" x2="0" y2="1">
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
                  name === "speed" ? `${val} km/h` : `${val}/100`,
                  name === "speed" ? "Average Speed" : "Congestion Index"
                ]}
              />
              <Area yAxisId="left" type="monotone" dataKey="speed" stroke="#06B6D4" fillOpacity={1} fill="url(#hourSpeed)" strokeWidth={2} />
              <Area yAxisId="right" type="monotone" dataKey="congestion" stroke="#EF4444" fillOpacity={1} fill="url(#hourCong)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
