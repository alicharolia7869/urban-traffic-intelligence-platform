"use client";

import React, { useState, useEffect } from "react";
import { WeatherAnalyticsData, api } from "@/services/api";
import { 
  CloudRain, Wind, Droplets, Eye, Thermometer, 
  TrendingDown, ShieldAlert, Sparkles, ArrowDownRight 
} from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export const WeatherImpactView: React.FC = () => {
  const [weather, setWeather] = useState<WeatherAnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    api.getWeatherAnalytics()
      .then(res => {
        setWeather(res);
        setLoading(false);
      })
      .catch(err => {
        console.error("Weather error:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-[#0D1527] border border-slate-800">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <CloudRain className="w-5 h-5 text-cyan-400" />
            Meteorological Impact on Network Velocity & Congestion
          </h2>
          <p className="text-xs text-slate-400">
            Empirical correlation between precipitation bands, surface friction, visibility, and arterial capacity
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#090E1A] border border-slate-800 px-3 py-1.5 rounded-lg text-xs font-mono text-cyan-300">
          <span>Doppler Radar Sync Active</span>
        </div>
      </div>

      {/* Live Weather Widget */}
      {weather?.current && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-[#0D1527] via-[#0A1020] to-[#0D1830] border border-cyan-500/20 shadow-xl">
          <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 block mb-3">
            Current Meteorological Sensor Feeds (Metropolis Weather Station)
          </span>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-3 rounded-xl bg-[#080D1A] border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-semibold">Condition</span>
              <span className="text-base font-bold text-cyan-300 mt-1 block">
                {weather.current.condition}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#080D1A] border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-semibold">Precipitation Rate</span>
              <span className="text-base font-bold font-mono text-blue-400 mt-1 block">
                {weather.current.rainfall_mm} mm/h
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#080D1A] border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-semibold">Temperature</span>
              <span className="text-base font-bold font-mono text-amber-300 mt-1 block">
                {weather.current.temperature_c}°C
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#080D1A] border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-semibold">Humidity</span>
              <span className="text-base font-bold font-mono text-slate-200 mt-1 block">
                {weather.current.humidity_pct}%
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#080D1A] border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-semibold">Visibility</span>
              <span className="text-base font-bold font-mono text-emerald-400 mt-1 block">
                {weather.current.visibility_km} km
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#080D1A] border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-semibold">Wind Velocity</span>
              <span className="text-base font-bold font-mono text-purple-300 mt-1 block">
                {weather.current.wind_speed_kmh} km/h
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Automatic Insights */}
      {weather?.insights && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {weather.insights.map((insight, idx) => (
            <div key={idx} className="p-3.5 rounded-xl bg-[#0D1527] border border-blue-500/20 text-xs text-blue-200 flex items-start gap-2.5">
              <span className="p-1 rounded bg-blue-950 text-blue-400 shrink-0">🌧️</span>
              <p className="leading-relaxed">{insight}</p>
            </div>
          ))}
        </div>
      )}

      {/* Comparative Degradation Matrix (Clear vs Light Rain vs Heavy Rain) */}
      <div className="p-5 rounded-xl bg-[#0D1527] border border-slate-800 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
          Direct Comparative Degradation: Clear vs Light Rain vs Downpour
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#090E1A] border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Mobility Metric</th>
                <th className="py-3 px-4">Clear Skies (Baseline)</th>
                <th className="py-3 px-4">Light Rain (1–5 mm/h)</th>
                <th className="py-3 px-4">Heavy Downpour (&gt;15 mm/h)</th>
                <th className="py-3 px-4">Network Impact Delta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {weather?.comparisons.map((c, i) => (
                <tr key={i} className="hover:bg-slate-800/30">
                  <td className="py-3 px-4 font-semibold text-slate-200">{c.metric}</td>
                  <td className="py-3 px-4 font-mono text-emerald-400">{c.clear}</td>
                  <td className="py-3 px-4 font-mono text-cyan-300">{c.light_rain}</td>
                  <td className="py-3 px-4 font-mono text-rose-400 font-bold">{c.heavy_rain}</td>
                  <td className="py-3 px-4 text-amber-300 font-semibold">{c.impact}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Average Speed by Condition Bar Chart */}
      <div className="p-5 rounded-xl bg-[#0D1527] border border-slate-800 space-y-3">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Observed Velocity Distribution by Meteorological Condition
          </h3>
          <p className="text-[11px] text-slate-400">
            Average recorded vehicular speed across weather states in historical telemetry
          </p>
        </div>

        <div className="h-64 w-full">
          {weather?.by_condition && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weather.by_condition}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="condition" stroke="#64748B" fontSize={10} />
                <YAxis stroke="#64748B" fontSize={10} unit=" km/h" />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#0D1527", borderColor: "#334155", fontSize: 11 }}
                  formatter={(val: any) => [`${val} km/h`, "Average Speed"]}
                />
                <Bar dataKey="avg_speed" fill="#06B6D4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};
