/**
 * Centralized API Service for Urban Traffic Intelligence Platform.
 * All dashboard numbers, maps, predictions, analytics, and tables come from this layer.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

export interface KPIs {
  active_roads: number;
  congested_roads: number;
  average_speed_kmh: number;
  vehicles_today: number;
  congestion_index: number;
  congestion_level: string;
  prediction_accuracy: number;
  timestamp: string;
}

export interface FactorContribution {
  factor: string;
  percentage: number;
  value: string;
}

export interface Road {
  road_id: string;
  name: string;
  district: string;
  road_type: string;
  length_km: number;
  lanes: number;
  speed_limit: number;
  capacity_vph: number;
  start_lat: number;
  start_lng: number;
  end_lat: number;
  end_lng: number;
  coordinates: [number, number][];
  connected_roads: string[];
  avg_speed?: number;
  vehicle_count?: number;
  occupancy?: number;
  density_vpk?: number;
  travel_time_sec?: number;
  congestion_score?: number;
  congestion_level?: string;
  pred_15m?: number;
  pred_level_15m?: string;
  pred_30m?: number;
  pred_level_30m?: string;
  pred_60m?: number;
  pred_level_60m?: string;
  predicted_score?: number;
  predicted_level?: string;
  current_score?: number;
  confidence?: number;
  risk_level?: string;
  factors?: FactorContribution[];
  explanation?: string;
}

export interface RoadDetail {
  road: Road;
  history: Array<{
    timestamp: string;
    vehicle_count: number;
    avg_speed: number;
    occupancy: number;
    congestion_score: number;
    congestion_level: string;
  }>;
  vehicles: {
    cars?: number;
    motorcycles?: number;
    buses?: number;
    trucks?: number;
    commercial?: number;
    other?: number;
    total_vehicles?: number;
  };
  predictions: Array<{
    horizon_minutes: number;
    predicted_score: number;
    predicted_level: string;
    confidence: number;
    risk_level: string;
  }>;
  factors: FactorContribution[];
  explanation: string;
  incidents: any[];
  connected_corridors: Array<{
    road_id: string;
    name: string;
    road_type: string;
    avg_speed: number;
    congestion_score: number;
    congestion_level: string;
  }>;
}

export interface HourlyPoint {
  hour: string;
  congestion: number;
  speed: number;
  volume: number;
  occupancy: number;
}

export interface HeatmapHour {
  hour: number;
  hour_label: string;
  score: number;
}

export interface HeatmapDay {
  day: string;
  hours: HeatmapHour[];
}

export interface VehicleIntelligenceData {
  distribution: Array<{ type: string; count: number; percentage: number; color: string }>;
  hourly_breakdown: Array<{ hour: string; cars: number; motorcycles: number; buses: number; trucks: number }>;
  correlations: Array<{ type: string; volume_share: string; avg_corridor_speed: string; congestion_impact: string }>;
  insights: string[];
}

export interface WeatherAnalyticsData {
  current: {
    condition: string;
    temperature_c: number;
    rainfall_mm: number;
    humidity_pct: number;
    visibility_km: number;
    wind_speed_kmh: number;
  };
  by_condition: Array<{ condition: string; avg_speed: number; avg_volume: number; avg_congestion: number; samples: number }>;
  comparisons: Array<{ metric: string; clear: string; light_rain: string; heavy_rain: string; impact: string }>;
  insights: string[];
}

export interface IncidentAnalyticsData {
  incidents: Array<{
    id: string;
    road_id: string;
    road_name: string;
    district: string;
    incident_type: string;
    severity: string;
    description: string;
    start_time: string;
    estimated_end_time?: string;
    lanes_blocked: number;
    speed_impact_pct: number;
    status: string;
    current_speed?: number;
    congestion_score?: number;
  }>;
  recovery_curve: Array<{ timeline: string; speed: number; congestion: number; queue_km: number }>;
  impact_by_type: Array<{ type: string; share: string; avg_speed_drop: string; avg_clearance_min: string }>;
}

export interface PropagationData {
  chains: Array<{
    source: {
      road_id: string;
      name: string;
      district: string;
      congestion_score: number;
      severity: string;
    };
    downstream_impacts: Array<{
      road_id: string;
      name: string;
      current_congestion: number;
      predicted_30m: number;
      propagation_lag: string;
      status: string;
    }>;
    shockwave_velocity: string;
    spillover_risk: string;
  }>;
  timeline: Array<{ time: string; stage: string; desc: string }>;
}

export interface ModelPerformanceData {
  models: Array<{
    id: number;
    model_name: string;
    horizon_minutes: number;
    mae: number;
    rmse: number;
    r2: number;
    accuracy: number;
    precision: number;
    recall: number;
    f1_score: number;
    updated_at: string;
  }>;
  feature_importances: Array<{ feature: string; importance: number }>;
  confusion_matrix: {
    labels: string[];
    matrix: number[][];
  };
  actual_vs_predicted: Array<{ index: number; actual: number; predicted: number; baseline: number }>;
  error_distribution: Array<{ range: string; count: number }>;
  training_framework: string;
  last_trained: string;
}

export interface BigDataStatusData {
  system_status: string;
  global_health: number;
  total_throughput_eps: number;
  pipeline_latency_ms: number;
  architecture: string;
  stages: Array<{
    id: string;
    name: string;
    type: string;
    status: string;
    details: string;
    throughput: string;
    health: number;
    latency?: string;
    active_workers?: number;
  }>;
  last_updated: string;
}

// Fetch helper with error tolerance
async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options?.headers || {})
      }
    });
    if (!res.ok) {
      throw new Error(`API error ${res.status}: ${res.statusText}`);
    }
    return (await res.json()) as T;
  } catch (err) {
    console.error(`Fetch failed for ${endpoint}:`, err);
    throw err;
  }
}

export const api = {
  getStatus: () => fetchAPI<{ status: string; mode: string; data_freshness: string; last_ingested_timestamp: string }>("/system/status"),
  getKPIs: () => fetchAPI<KPIs>("/dashboard/kpis"),
  getRoads: (params?: { district?: string; road_type?: string; status?: string; search?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.district) searchParams.append("district", params.district);
    if (params?.road_type) searchParams.append("road_type", params.road_type);
    if (params?.status) searchParams.append("status", params.status);
    if (params?.search) searchParams.append("search", params.search);
    const query = searchParams.toString() ? `?${searchParams.toString()}` : "";
    return fetchAPI<Road[]>(`/roads${query}`);
  },
  getRoadDetail: (roadId: string) => fetchAPI<RoadDetail>(`/roads/${roadId}`),
  getAnalyticsSummary: () => fetchAPI<any>("/analytics/summary"),
  getHourlyProfile: () => fetchAPI<HourlyPoint[]>("/analytics/hourly"),
  getHeatmap: () => fetchAPI<HeatmapDay[]>("/analytics/heatmap"),
  getVehicleIntelligence: () => fetchAPI<VehicleIntelligenceData>("/analytics/vehicles"),
  getWeatherAnalytics: () => fetchAPI<WeatherAnalyticsData>("/weather"),
  getIncidentsAnalytics: () => fetchAPI<IncidentAnalyticsData>("/incidents"),
  getPropagation: () => fetchAPI<PropagationData>("/propagation"),
  getModelPerformance: () => fetchAPI<ModelPerformanceData>("/model/performance"),
  getPredictions: (horizon: number = 30) => fetchAPI<Road[]>(`/predictions?horizon=${horizon}`),
  getRoadPrediction: (roadId: string) => fetchAPI<any>(`/predictions/${roadId}`),
  simulatePrediction: (params: any) => fetchAPI<any>("/predictions/simulate", {
    method: "POST",
    body: JSON.stringify(params)
  }),
  askAssistant: (message: string) => fetchAPI<{ answer: string; category: string; confidence: number }>("/assistant/query", {
    method: "POST",
    body: JSON.stringify({ message })
  }),
  getPipelineStatus: () => fetchAPI<BigDataStatusData>("/pipeline/status"),
  simulateTick: () => fetchAPI<{ status: string; new_timestamp: string; updated_corridors: number }>("/demo/simulate-tick", {
    method: "POST"
  })
};
