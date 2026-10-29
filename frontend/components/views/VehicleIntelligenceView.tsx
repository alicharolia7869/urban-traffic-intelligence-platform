"use client";

import React, { useState, useEffect } from "react";
import { VehicleIntelligenceData, api } from "@/services/api";
import { 
  Car, Shield, Info, TrendingUp, Sparkles, BarChart2, 
  Layers, CheckCircle, Clock 
} from "lucide-react";
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend, Cell 
} from "recharts";

export const VehicleIntelligenceView: React.FC = () => {
  const [data, setData] = useState<VehicleIntelligenceData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    api.getVehicleIntelligence()
      .then(res => {
        setData(res);
        setLoading(false);
      })
      .catch(err => {
        console.error("Vehicle intelligence error:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-[#0D1527] border border-slate-800">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Car className="w-5 h-5 text-cyan-400" />
            Multimodal Vehicle Classification & Corridor Mix
          </h2>
          <p className="text-xs text-slate-400">
            Automated sensor breakdown of passenger cars, motorcycles, heavy freight, transit buses, and delivery units
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#090E1A] border border-cyan-500/20 px-3 py-1.5 rounded-lg text-xs font-mono text-cyan-300">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Loop & Video Telematics Active</span>
        </div>
      </div>

      {/* Dynamic AI Insights generated from actual data */}
      {data?.insights && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {data.insights.map((insight, idx) => (
            <div key={idx} className="p-3.5 rounded-xl bg-[#0D1527] border border-cyan-500/20 flex items-start gap-2.5 text-xs text-cyan-200">
              <span className="p-1 rounded bg-cyan-950 text-cyan-400 shrink-0">💡</span>
              <p className="leading-relaxed">{insight}</p>
            </div>
          ))}
        </div>
      )}

      {/* Modal Distribution Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {data?.distribution.map((item) => (
          <div key={item.type} className="p-3.5 rounded-xl bg-[#0D1527] border border-slate-800 space-y-1">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block truncate">
              {item.type}
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold font-mono text-slate-100">{item.percentage}%</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
              <div 
                className="h-full rounded-full"
                style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
              />
            </div>
            <span className="text-[9px] font-mono text-slate-500 block pt-1">
              {item.count.toLocaleString()} observed units
            </span>
          </div>
        ))}
      </div>

      {/* Hourly Vehicle Mix Bar Chart */}
      <div className="p-5 rounded-xl bg-[#0D1527] border border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Hourly Modal Volume Stack (Cars, Motorcycles, Buses, Heavy Freight)
            </h3>
            <p className="text-[11px] text-slate-400">
              Vehicle type distribution changing between commuter rush hours and midday freight delivery windows
            </p>
          </div>
        </div>

        <div className="h-72 w-full">
          {data?.hourly_breakdown && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.hourly_breakdown}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="hour" stroke="#64748B" fontSize={10} />
                <YAxis stroke="#64748B" fontSize={10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#0D1527", borderColor: "#334155", fontSize: 11 }}
                />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                <Bar dataKey="cars" name="Cars" fill="#3B82F6" stackId="a" />
                <Bar dataKey="motorcycles" name="Motorcycles" fill="#06B6D4" stackId="a" />
                <Bar dataKey="buses" name="Buses" fill="#10B981" stackId="a" />
                <Bar dataKey="trucks" name="Heavy Trucks" fill="#F59E0B" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Vehicle Type vs Speed & Congestion Impact Correlation Table */}
      <div className="p-5 rounded-xl bg-[#0D1527] border border-slate-800">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">
          Vehicle Category Speed & Queue Dissipation Dynamics
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#090E1A] border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Vehicle Category</th>
                <th className="py-2.5 px-3">Volume Share</th>
                <th className="py-2.5 px-3">Average Corridor Speed</th>
                <th className="py-2.5 px-3">Congestion Impact Behavior</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {data?.correlations.map((row) => (
                <tr key={row.type} className="hover:bg-slate-800/30">
                  <td className="py-2.5 px-3 font-semibold text-slate-200">{row.type}</td>
                  <td className="py-2.5 px-3 font-mono text-cyan-300">{row.volume_share}</td>
                  <td className="py-2.5 px-3 font-mono text-emerald-400">{row.avg_corridor_speed}</td>
                  <td className="py-2.5 px-3 text-slate-400">{row.congestion_impact}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
