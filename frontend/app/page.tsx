"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { RoadDetailModal } from "@/components/RoadDetailModal";
import { Road, api } from "@/services/api";

import { DashboardView } from "@/components/views/DashboardView";
import { LiveTrafficView } from "@/components/views/LiveTrafficView";
import { AnalyticsView } from "@/components/views/AnalyticsView";
import { RoadIntelligenceView } from "@/components/views/RoadIntelligenceView";
import { VehicleIntelligenceView } from "@/components/views/VehicleIntelligenceView";
import { TimeIntelligenceView } from "@/components/views/TimeIntelligenceView";
import { PredictionView } from "@/components/views/PredictionView";
import { ExplainableAIView } from "@/components/views/ExplainableAIView";
import { PropagationView } from "@/components/views/PropagationView";
import { WeatherImpactView } from "@/components/views/WeatherImpactView";
import { IncidentAnalysisView } from "@/components/views/IncidentAnalysisView";
import { AIAssistantView } from "@/components/views/AIAssistantView";
import { ModelPerformanceView } from "@/components/views/ModelPerformanceView";
import { DataPipelineView } from "@/components/views/DataPipelineView";
import { SettingsView } from "@/components/views/SettingsView";

export default function Home() {
  const [activeView, setActiveView] = useState<string>("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [selectedRoad, setSelectedRoad] = useState<Road | null>(null);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  const handleSearch = (query: string) => {
    if (query.trim().length > 0) {
      if (activeView !== "roads" && activeView !== "live_traffic") {
        setActiveView("roads");
      }
    }
  };

  const handleSimulateTick = async () => {
    setIsSimulating(true);
    try {
      await api.simulateTick();
      setRefreshTrigger(prev => prev + 1);
    } catch (e) {
      console.error("Simulation tick failed:", e);
    } finally {
      setIsSimulating(false);
    }
  };

  const renderActiveView = () => {
    switch (activeView) {
      case "dashboard":
        return (
          <DashboardView 
            key={refreshTrigger}
            onSelectRoad={(road) => setSelectedRoad(road)} 
            onNavigate={(viewId) => setActiveView(viewId)} 
          />
        );
      case "live_traffic":
        return (
          <LiveTrafficView 
            key={refreshTrigger}
            onSelectRoad={(road) => setSelectedRoad(road)} 
          />
        );
      case "analytics":
        return <AnalyticsView key={refreshTrigger} />;
      case "roads":
        return (
          <RoadIntelligenceView 
            key={refreshTrigger}
            onSelectRoad={(road) => setSelectedRoad(road)} 
          />
        );
      case "vehicles":
        return <VehicleIntelligenceView key={refreshTrigger} />;
      case "time":
        return <TimeIntelligenceView key={refreshTrigger} />;
      case "predictions":
        return (
          <PredictionView 
            key={refreshTrigger}
            onSelectRoad={(road) => setSelectedRoad(road)} 
          />
        );
      case "explainable_ai":
        return <ExplainableAIView key={refreshTrigger} />;
      case "propagation":
        return <PropagationView key={refreshTrigger} />;
      case "weather":
        return <WeatherImpactView key={refreshTrigger} />;
      case "incidents":
        return <IncidentAnalysisView key={refreshTrigger} />;
      case "assistant":
        return <AIAssistantView key={refreshTrigger} />;
      case "models":
        return <ModelPerformanceView key={refreshTrigger} />;
      case "pipeline":
        return <DataPipelineView key={refreshTrigger} />;
      case "settings":
        return (
          <SettingsView 
            key={refreshTrigger}
            onSimulateTick={handleSimulateTick} 
            isSimulating={isSimulating} 
          />
        );
      default:
        return (
          <DashboardView 
            key={refreshTrigger}
            onSelectRoad={(road) => setSelectedRoad(road)} 
            onNavigate={(viewId) => setActiveView(viewId)} 
          />
        );
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#070B14] text-slate-100 font-sans">
      {/* Top Navbar */}
      <Navbar
        onSearch={handleSearch}
        onSimulateTick={handleSimulateTick}
        isSimulating={isSimulating}
        activeView={activeView}
      />

      {/* Main Layout Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          activeView={activeView}
          onSelectView={(v) => setActiveView(v)}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        {/* Content View Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#070B14]">
          <div className="max-w-7xl mx-auto pb-12">
            {renderActiveView()}
          </div>
        </main>
      </div>

      {/* Deep Road Detail Modal */}
      {selectedRoad && (
        <RoadDetailModal
          road={selectedRoad}
          onClose={() => setSelectedRoad(null)}
        />
      )}
    </div>
  );
}
