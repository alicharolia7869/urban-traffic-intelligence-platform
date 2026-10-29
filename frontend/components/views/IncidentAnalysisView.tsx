"use client";

import React, { useState, useEffect } from "react";
import { IncidentAnalyticsData, api } from "@/services/api";
import { 
  AlertTriangle, Clock, ShieldAlert, ArrowDown, Activity, 
  CheckCircle2, HardHat, Car, Flame, Shield 
} from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export const IncidentAnalysisView: React.FC = () => {
  const [data, setData] = useState<IncidentAnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    api.getIncidentsAnalytics()
      .then(res => {
        setData(res);
        setLoading(false);
      })
      .catch(err => {
        console.error("Incidents error:", err);
        setLoading(false);
      });
  }, []);

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "Critical":
        return "bg-rose-950 text-rose-300 border-rose-800";
      case "High":
        return "bg-orange-950 text-orange-300 border-orange-800";
      case "Medium":
        return "bg-amber-950 text-amber-300 border-amber-800";
      default:
        return "bg-slate-800 text-slate-300 border-slate-700";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-[#0D1527] border border-slate-800">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-400" />
            Network Incident Intelligence & Bottleneck Clearance
          </h2>
          <p className="text-xs text-slate-400">
            Real-time incident dispatch logs, lane blockage tracking, and empirical velocity recovery curves
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-cyan-300">
          <Activity className="w-4 h-4 text-cyan-400" />
          <span>CAD Dispatch System Integrated</span>
        </div>
      </div>

      {/* Before / During / After Recovery Curve (Prompt Requirement #18) */}
      <div className="p-5 rounded-xl bg-[#0D1527] border border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Corridor Velocity & Queue Dissipation Recovery Profile
            </h3>
            <p className="text-[11px] text-slate-400">
              Timeline illustrating speed drop upon lane blockage, queue shockwave, and post-clearance recovery
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-cyan-400">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" /> Speed (km/h)
            </span>
            <span className="flex items-center gap-1.5 text-rose-400">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Congestion Score
            </span>
          </div>
        </div>

        <div className="h-64 w-full">
          {data?.recovery_curve && (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.recovery_curve}>
                <defs>
                  <linearGradient id="incSpeed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#06B6D4" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="incCong" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="timeline" stroke="#64748B" fontSize={10} />
                <YAxis stroke="#64748B" fontSize={10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#0D1527", borderColor: "#334155", fontSize: 11 }}
                  formatter={(val: any, name: any) => [
                    name === "speed" ? `${val} km/h` : `${val}/100`,
                    name === "speed" ? "Average Speed" : "Congestion Index"
                  ]}
                />
                <Area type="monotone" dataKey="speed" stroke="#06B6D4" fill="url(#incSpeed)" strokeWidth={2.5} />
                <Area type="monotone" dataKey="congestion" stroke="#EF4444" fill="url(#incCong)" strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Incident Impact Breakdown by Type */}
      <div className="p-5 rounded-xl bg-[#0D1527] border border-slate-800 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
          Historical Incident Degradation & Clearance Duration by Category
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {data?.impact_by_type.map((t) => (
            <div key={t.type} className="p-3.5 rounded-xl bg-[#090E1A] border border-slate-800 space-y-1">
              <span className="text-xs font-bold text-slate-200 block truncate">{t.type}</span>
              <div className="pt-1 text-[11px] space-y-0.5">
                <div className="flex justify-between text-slate-400">
                  <span>Frequency:</span>
                  <span className="font-mono text-cyan-300 font-semibold">{t.share}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Velocity Loss:</span>
                  <span className="font-mono text-rose-400 font-bold">{t.avg_speed_drop}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Avg Clearance:</span>
                  <span className="font-mono text-amber-300 font-semibold">{t.avg_clearance_min}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Live Incident Dispatch Log */}
      <div className="p-5 rounded-xl bg-[#0D1527] border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Active & Recent CAD Incident Dispatch Feed
          </h3>
          <span className="text-[10px] font-mono text-slate-400">
            {data?.incidents.length || 0} Incident Records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#090E1A] border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3">ID & Status</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Corridor & District</th>
                <th className="py-2.5 px-3">Lanes Blocked</th>
                <th className="py-2.5 px-3">Speed Loss</th>
                <th className="py-2.5 px-3">Dispatch Time</th>
                <th className="py-2.5 px-3">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {data?.incidents.map((inc) => (
                <tr key={inc.id} className="hover:bg-slate-800/30">
                  <td className="py-2.5 px-3">
                    <span className="font-mono font-semibold text-slate-200 block">{inc.id}</span>
                    <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                      inc.status === "Active" ? "bg-rose-950 text-rose-300 animate-pulse" : "bg-slate-800 text-slate-400"
                    }`}>
                      {inc.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded border font-semibold ${getSeverityBadge(inc.severity)}`}>
                      {inc.incident_type}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="font-semibold text-slate-200 block">{inc.road_name}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{inc.district}</span>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-amber-300 font-semibold">
                    {inc.lanes_blocked} Lane(s)
                  </td>
                  <td className="py-2.5 px-3 font-mono text-rose-400 font-bold">
                    -{inc.speed_impact_pct}%
                  </td>
                  <td className="py-2.5 px-3 text-[11px] text-slate-400 font-mono">
                    {inc.start_time}
                  </td>
                  <td className="py-2.5 px-3 text-slate-300 text-[11px] max-w-xs truncate">
                    {inc.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
