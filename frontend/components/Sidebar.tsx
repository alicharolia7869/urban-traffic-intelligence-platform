"use client";

import React from "react";
import { 
  LayoutDashboard, 
  Map, 
  LineChart, 
  Route, 
  Car, 
  BrainCircuit, 
  Clock, 
  Sparkles, 
  Network, 
  CloudRain, 
  AlertTriangle, 
  Bot, 
  Cpu, 
  Database, 
  Settings,
  ChevronRight
} from "lucide-react";

interface SidebarProps {
  activeView: string;
  onSelectView: (view: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onSelectView,
  collapsed,
  onToggleCollapse
}) => {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, badge: "Live" },
    { id: "live_traffic", label: "Live Traffic", icon: Map, badge: "GIS" },
    { id: "analytics", label: "Traffic Analytics", icon: LineChart },
    { id: "roads", label: "Road Intelligence", icon: Route, count: "110" },
    { id: "vehicles", label: "Vehicle Intelligence", icon: Car },
    { id: "time", label: "Time Intelligence", icon: Clock },
    { id: "predictions", label: "Congestion Prediction", icon: BrainCircuit, badge: "AI" },
    { id: "explainable_ai", label: "Explainable AI (XAI)", icon: Sparkles },
    { id: "propagation", label: "Congestion Propagation", icon: Network },
    { id: "weather", label: "Weather Impact", icon: CloudRain },
    { id: "incidents", label: "Incident Analysis", icon: AlertTriangle },
    { id: "assistant", label: "AI Traffic Assistant", icon: Bot, badge: "Chat" },
    { id: "models", label: "Model Performance", icon: Cpu },
    { id: "pipeline", label: "Data Pipeline", icon: Database, badge: "Kafka/Spark" },
    { id: "settings", label: "Settings & Simulation", icon: Settings },
  ];

  return (
    <aside 
      className={`relative z-30 flex flex-col bg-[#080D18] border-r border-[#1E293B] transition-all duration-300 ease-in-out shrink-0 select-none ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Navigation List */}
      <div className="flex-1 py-3 px-2 overflow-y-auto space-y-1">
        <div className={`px-2 py-1 text-[10px] font-semibold tracking-wider text-slate-500 uppercase ${collapsed ? "text-center" : ""}`}>
          {collapsed ? "•••" : "COMMAND MODULES"}
        </div>

        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectView(item.id)}
              className={`group flex items-center w-full px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-md shadow-cyan-950/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent"
              } ${collapsed ? "justify-center" : "justify-between"}`}
              title={collapsed ? item.label : undefined}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                  isActive ? "text-cyan-400" : "text-slate-400 group-hover:text-slate-200"
                }`} />
                {!collapsed && (
                  <span className="truncate">{item.label}</span>
                )}
              </div>

              {!collapsed && (
                <div className="flex items-center gap-1.5 shrink-0">
                  {item.badge && (
                    <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold ${
                      isActive 
                        ? "bg-cyan-950 text-cyan-300 border border-cyan-700/50" 
                        : "bg-slate-800 text-slate-400"
                    }`}>
                      {item.badge}
                    </span>
                  )}
                  {item.count && (
                    <span className="text-[10px] font-mono text-slate-500">
                      {item.count}
                    </span>
                  )}
                  {isActive && (
                    <ChevronRight className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer / Toggle & Status */}
      <div className="p-2 border-t border-[#1E293B] bg-[#070B14]">
        <button
          onClick={onToggleCollapse}
          className="flex items-center justify-center w-full py-1.5 rounded-md hover:bg-slate-800/60 text-slate-400 hover:text-slate-200 text-xs transition-colors"
        >
          {collapsed ? "▶" : "◀ Collapse Sidebar"}
        </button>

        {!collapsed && (
          <div className="mt-2 p-2 rounded-lg bg-[#0D1527] border border-slate-800/80 text-[10px]">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span>Cluster State:</span>
              <span className="text-emerald-400 font-semibold font-mono">HEALTHY</span>
            </div>
            <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full w-[94%]" />
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
