"""
Kafka Streaming & Distributed Big Data Telemetry Simulator.
Tracks streaming pipeline health, throughput, partitions, and topics.
"""
from datetime import datetime
import random


class BigDataPipelineStatus:
    @staticmethod
    def get_status():
        now = datetime.utcnow()
        # High-throughput realistic metrics
        events_per_sec = random.randint(13800, 16200)
        p99_latency_ms = random.randint(34, 48)
        
        stages = [
            {
                "id": "sources",
                "name": "Data Sources",
                "type": "Ingestion",
                "status": "ONLINE",
                "details": "110 Road Loop Detectors, 4,200 GPS Probes, Meteorological Radar & City CAD Feeds",
                "throughput": f"{events_per_sec:,} events/sec",
                "health": 99.98
            },
            {
                "id": "kafka",
                "name": "Apache Kafka Cluster",
                "type": "Stream Broker",
                "status": "ONLINE",
                "details": "Topics: `traffic.telematics.raw` (16 partitions), `weather.radar` (4), `incidents.cad` (4)",
                "throughput": f"{int(events_per_sec * 1.05):,} msg/sec",
                "health": 100.0,
                "latency": f"{p99_latency_ms} ms (p99)"
            },
            {
                "id": "spark",
                "name": "PySpark Streaming Core",
                "type": "Distributed Engine",
                "status": "ONLINE",
                "details": "Micro-batch interval: 2.0s, Window aggregation: 15m tumbling, Watermark: 5m",
                "throughput": f"{int(events_per_sec * 0.98):,} records/sec",
                "health": 99.95,
                "active_workers": 12
            },
            {
                "id": "cleaning",
                "name": "Data Validation & Cleansing",
                "type": "ETL Quality",
                "status": "ONLINE",
                "details": "IQR Outlier rejection, coordinate projection, null imputation, timestamp normalization",
                "throughput": "100.0% Cleaned",
                "health": 100.0
            },
            {
                "id": "features",
                "name": "Feature Engineering Store",
                "type": "Feature Pipeline",
                "status": "ONLINE",
                "details": "Lag 15m/30m, rolling speed, density, network neighbor spillover index computed",
                "throughput": "22 Dimensions",
                "health": 99.9
            },
            {
                "id": "ml_models",
                "name": "ML Inference Engine",
                "type": "Model Serving",
                "status": "ONLINE",
                "details": "XGBoost Regressor + Random Forest + SHAP Explainability Engine",
                "throughput": "< 12ms / inference",
                "health": 100.0
            },
            {
                "id": "prediction_api",
                "name": "Prediction REST API",
                "type": "FastAPI Gateway",
                "status": "ONLINE",
                "details": "Serving 15m, 30m, 60m multi-horizon predictions with JSON factors",
                "throughput": "2,400 req/min",
                "health": 100.0
            },
            {
                "id": "dashboard",
                "name": "Traffic Intelligence Command Center",
                "type": "Frontend Next.js",
                "status": "ONLINE",
                "details": "Live WebSocket + polling client data layer connected",
                "throughput": "Real-time",
                "health": 100.0
            }
        ]
        
        return {
            "system_status": "OPTIMAL",
            "global_health": 99.97,
            "total_throughput_eps": events_per_sec,
            "pipeline_latency_ms": p99_latency_ms,
            "architecture": "Kafka 3.6 + PySpark 4.2 + Delta Lake + FastAPI + Next.js 15",
            "stages": stages,
            "last_updated": now.isoformat()
        }
