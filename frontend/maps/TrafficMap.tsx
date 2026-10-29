"use client";

import React, { useState, useRef, useMemo } from "react";
import { Road } from "@/services/api";
import { ZoomIn, ZoomOut, RotateCcw, Filter, Layers, Info, AlertTriangle } from "lucide-react";

interface TrafficMapProps {
  roads: Road[];
  selectedRoad: Road | null;
  onSelectRoad: (road: Road) => void;
  className?: string;
}

export const TrafficMap: React.FC<TrafficMapProps> = ({
  roads,
  selectedRoad,
  onSelectRoad,
  className = "h-[600px]"
}) => {
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hoveredRoad, setHoveredRoad] = useState<Road | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [filterDistrict, setFilterDistrict] = useState<string>("All");
  const [filterLevel, setFilterLevel] = useState<string>("All");

  const containerRef = useRef<HTMLDivElement>(null);

  // Metro City Bounding Box for projection
  // Lat: 19.00 to 19.15, Lng: 72.80 to 72.96
  const bounds = useMemo(() => {
    return {
      minLat: 19.01,
      maxLat: 19.14,
      minLng: 72.81,
      maxLng: 72.95
    };
  }, []);

  const projectCoord = (lat: number, lng: number, width: number, height: number) => {
    const xPct = (lng - bounds.minLng) / (bounds.maxLng - bounds.minLng);
    const yPct = (bounds.maxLat - lat) / (bounds.maxLat - bounds.minLat);
    return {
      x: xPct * width,
      y: yPct * height
    };
  };

  const getRoadColor = (score?: number, level?: string) => {
    if (level === "SEVERE" || (score !== undefined && score >= 80)) return "#EF4444";
    if (level === "HEAVY" || (score !== undefined && score >= 60)) return "#F97316";
    if (level === "MODERATE" || (score !== undefined && score >= 40)) return "#F59E0B";
    if (level === "LIGHT" || (score !== undefined && score >= 20)) return "#06B6D4";
    return "#10B981";
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setTooltipPos({
        x: e.clientX - rect.left + 15,
        y: e.clientY - rect.top + 15
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const filteredRoads = useMemo(() => {
    return roads.filter(r => {
      if (filterDistrict !== "All" && r.district !== filterDistrict) return false;
      if (filterLevel !== "All" && r.congestion_level !== filterLevel) return false;
      return true;
    });
  }, [roads, filterDistrict, filterLevel]);

  const districts = useMemo(() => {
    const set = new Set(roads.map(r => r.district));
    return ["All", ...Array.from(set)];
  }, [roads]);

  return (
    <div 
      ref={containerRef}
      className={`relative w-full overflow-hidden rounded-xl bg-[#070B14] border border-[#1E293B] shadow-2xl ${className}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* City GIS Grid Background & Radial Glow */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 50%, rgba(6, 182, 212, 0.15) 0%, transparent 70%),
            linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: "100% 100%, 40px 40px, 40px 40px"
        }}
      />

      {/* Top Map Toolbar */}
      <div className="absolute top-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-auto">
        <div className="flex items-center gap-2 bg-[#0D1527]/90 backdrop-blur-md border border-slate-700/80 px-3 py-1.5 rounded-lg text-xs">
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-semibold text-slate-200">GIS Telematics Layer</span>
          <span className="text-[10px] font-mono text-cyan-300">({filteredRoads.length} Active Corridors)</span>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 bg-[#0D1527]/90 backdrop-blur-md border border-slate-700/80 p-1 rounded-lg text-xs">
          <div className="flex items-center gap-1 px-2 text-slate-400 text-[11px]">
            <Filter className="w-3 h-3 text-slate-400" />
            <span>District:</span>
            <select
              value={filterDistrict}
              onChange={(e) => setFilterDistrict(e.target.value)}
              className="bg-transparent text-slate-200 text-xs focus:outline-none cursor-pointer"
            >
              {districts.map(d => (
                <option key={d} value={d} className="bg-[#0D1527] text-slate-200">{d}</option>
              ))}
            </select>
          </div>

          <div className="w-[1px] h-4 bg-slate-700" />

          <div className="flex items-center gap-1 px-2 text-slate-400 text-[11px]">
            <span>Level:</span>
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="bg-transparent text-slate-200 text-xs focus:outline-none cursor-pointer"
            >
              <option value="All" className="bg-[#0D1527]">All Levels</option>
              <option value="LOW" className="bg-[#0D1527]">🟢 Low</option>
              <option value="LIGHT" className="bg-[#0D1527]">🔵 Light</option>
              <option value="MODERATE" className="bg-[#0D1527]">🟡 Moderate</option>
              <option value="HEAVY" className="bg-[#0D1527]">🟠 Heavy</option>
              <option value="SEVERE" className="bg-[#0D1527]">🔴 Severe</option>
            </select>
          </div>
        </div>
      </div>

      {/* Map Navigation Controls */}
      <div className="absolute bottom-4 right-4 z-20 flex flex-col gap-1.5 pointer-events-auto">
        <button
          onClick={() => setZoom(prev => Math.min(prev + 0.3, 3.5))}
          className="p-2 rounded-lg bg-[#0D1527]/90 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-all shadow-lg"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoom(prev => Math.max(prev - 0.3, 0.7))}
          className="p-2 rounded-lg bg-[#0D1527]/90 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-all shadow-lg"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={resetView}
          className="p-2 rounded-lg bg-[#0D1527]/90 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-all shadow-lg"
          title="Reset Center"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 z-20 hidden sm:flex items-center gap-3 bg-[#0D1527]/90 backdrop-blur-md border border-slate-800 px-3 py-1.5 rounded-lg text-[10px] text-slate-300 pointer-events-auto">
        <span className="text-slate-400 font-semibold uppercase tracking-wider">Status:</span>
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" /> Low</div>
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#06B6D4]" /> Light</div>
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" /> Moderate</div>
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#F97316]" /> Heavy</div>
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#EF4444] animate-pulse" /> Severe</div>
      </div>

      {/* SVG Vector Render Canvas */}
      <div 
        className="w-full h-full cursor-grab active:cursor-grabbing select-none"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: "center center",
          transition: isDragging ? "none" : "transform 0.15s ease-out"
        }}
      >
        <svg 
          viewBox="0 0 1000 700" 
          className="w-full h-full"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <filter id="glow-severe" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <linearGradient id="corridor-active" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.8" />
            </linearGradient>
          </defs>

          {/* Central Urban Ring Landmark Guides */}
          <circle cx="500" cy="350" r="160" fill="none" stroke="rgba(56, 189, 248, 0.06)" strokeWidth="40" />
          <circle cx="500" cy="350" r="280" fill="none" stroke="rgba(56, 189, 248, 0.04)" strokeWidth="60" />

          {/* Road Corridors */}
          {filteredRoads.map((road) => {
            const isSelected = selectedRoad?.road_id === road.road_id;
            const isHovered = hoveredRoad?.road_id === road.road_id;
            const strokeColor = getRoadColor(road.congestion_score, road.congestion_level);
            const isSevere = road.congestion_level === "SEVERE" || (road.congestion_score || 0) >= 80;

            // Project road polyline
            const pts = (road.coordinates && road.coordinates.length > 0)
              ? road.coordinates.map(c => projectCoord(c[0], c[1], 1000, 700))
              : [
                  projectCoord(road.start_lat, road.start_lng, 1000, 700),
                  projectCoord(road.end_lat, road.end_lng, 1000, 700)
                ];

            const pathD = pts.length === 2
              ? `M ${pts[0].x} ${pts[0].y} L ${pts[1].x} ${pts[1].y}`
              : `M ${pts[0].x} ${pts[0].y} Q ${pts[1].x} ${pts[1].y} ${pts[2].x} ${pts[2].y}`;

            const strokeWidth = isSelected ? 8 : (isHovered ? 6 : (road.road_type === "Expressway" ? 4.5 : 3.2));

            return (
              <g 
                key={road.road_id}
                className="cursor-pointer transition-all duration-150"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectRoad(road);
                }}
                onMouseEnter={() => setHoveredRoad(road)}
                onMouseLeave={() => setHoveredRoad(null)}
              >
                {/* Underglow for active / selected / severe */}
                {(isSelected || isSevere) && (
                  <path
                    d={pathD}
                    fill="none"
                    stroke={isSelected ? "#38BDF8" : strokeColor}
                    strokeWidth={strokeWidth + 6}
                    strokeOpacity={isSelected ? 0.6 : 0.4}
                    strokeLinecap="round"
                    filter={isSevere ? "url(#glow-severe)" : undefined}
                  />
                )}

                {/* Main Road Line */}
                <path
                  d={pathD}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                  strokeOpacity={0.92}
                />

                {/* Node Endpoints */}
                <circle
                  cx={pts[0].x}
                  cy={pts[0].y}
                  r={isSelected ? 5 : 3}
                  fill={strokeColor}
                  stroke="#070B14"
                  strokeWidth={1.5}
                />
                <circle
                  cx={pts[pts.length - 1].x}
                  cy={pts[pts.length - 1].y}
                  r={isSelected ? 5 : 3}
                  fill={strokeColor}
                  stroke="#070B14"
                  strokeWidth={1.5}
                />
              </g>
            );
          })}
        </svg>
      </div>

      {/* Hover Tooltip Overlay */}
      {hoveredRoad && (
        <div 
          className="absolute z-30 pointer-events-none p-3 rounded-lg bg-[#0D1527]/95 border border-cyan-500/40 shadow-2xl backdrop-blur-md text-xs w-64 animate-in fade-in zoom-in-95"
          style={{
            left: `${Math.min(tooltipPos.x, 680)}px`,
            top: `${Math.min(tooltipPos.y, 420)}px`
          }}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-bold text-slate-100 truncate">{hoveredRoad.name}</span>
            <span className="text-[10px] font-mono px-1 rounded bg-slate-800 text-slate-300">
              {hoveredRoad.road_id}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] mb-2">
            <div>
              <span className="text-slate-400 block text-[10px]">Current Status:</span>
              <span 
                className="font-bold uppercase"
                style={{ color: getRoadColor(hoveredRoad.congestion_score, hoveredRoad.congestion_level) }}
              >
                {hoveredRoad.congestion_level || "MODERATE"} ({hoveredRoad.congestion_score || 50}/100)
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Speed / Limit:</span>
              <span className="font-mono text-cyan-300 font-semibold">
                {hoveredRoad.avg_speed || 35} / {hoveredRoad.speed_limit} km/h
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px]">
            <span className="text-slate-400">30-Min AI Forecast:</span>
            <span className="font-mono font-bold text-amber-400">
              {hoveredRoad.pred_30m ? `${hoveredRoad.pred_30m}/100` : "T+30m Available"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
