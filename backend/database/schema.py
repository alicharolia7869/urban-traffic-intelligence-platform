"""
SQLAlchemy database models for Urban Traffic Intelligence Platform.
Defines tables for roads, traffic readings, weather, incidents, vehicle breakdowns, predictions, and model metrics.
"""
from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Float, DateTime, Text, ForeignKey, Index
)
from sqlalchemy.orm import relationship
from backend.database.db import Base


class Road(Base):
    __tablename__ = "roads"

    road_id = Column(String(32), primary_key=True, index=True)
    name = Column(String(128), nullable=False, index=True)
    district = Column(String(64), nullable=False, index=True)
    road_type = Column(String(32), nullable=False)  # Expressway, Arterial, Collector, Boulevard
    length_km = Column(Float, nullable=False)
    lanes = Column(Integer, nullable=False, default=3)
    speed_limit = Column(Float, nullable=False, default=60.0)
    capacity_vph = Column(Integer, nullable=False, default=2400)
    start_lat = Column(Float, nullable=False)
    start_lng = Column(Float, nullable=False)
    end_lat = Column(Float, nullable=False)
    end_lng = Column(Float, nullable=False)
    coordinates_json = Column(Text, nullable=False)  # GeoJSON / list of [lat, lng]
    connected_roads_json = Column(Text, nullable=False)  # Connected network edges

    # Relationships
    readings = relationship("TrafficReading", back_populates="road", cascade="all, delete-orphan")
    incidents = relationship("Incident", back_populates="road")
    vehicle_records = relationship("VehicleData", back_populates="road")
    predictions = relationship("Prediction", back_populates="road")


class TrafficReading(Base):
    __tablename__ = "traffic_readings"

    id = Column(Integer, primary_key=True, autoincrement=True)
    road_id = Column(String(32), ForeignKey("roads.road_id"), nullable=False, index=True)
    timestamp = Column(DateTime, nullable=False, index=True)
    vehicle_count = Column(Integer, nullable=False)
    avg_speed = Column(Float, nullable=False)
    occupancy = Column(Float, nullable=False)
    travel_time_sec = Column(Float, nullable=False)
    density_vpk = Column(Float, nullable=False)  # vehicles per km
    congestion_score = Column(Float, nullable=False)  # 0 to 100
    congestion_level = Column(String(16), nullable=False, index=True)  # LOW, LIGHT, MODERATE, HEAVY, SEVERE

    road = relationship("Road", back_populates="readings")

    __table_args__ = (
        Index("idx_road_timestamp", "road_id", "timestamp"),
        Index("idx_congestion_level", "congestion_level"),
    )


class Weather(Base):
    __tablename__ = "weather"

    id = Column(Integer, primary_key=True, autoincrement=True)
    timestamp = Column(DateTime, nullable=False, index=True)
    condition = Column(String(32), nullable=False)  # Clear, Overcast, Light Rain, Heavy Rain, Fog, Thunderstorm
    temperature_c = Column(Float, nullable=False)
    rainfall_mm = Column(Float, nullable=False)
    humidity_pct = Column(Float, nullable=False)
    visibility_km = Column(Float, nullable=False)
    wind_speed_kmh = Column(Float, nullable=False)


class Incident(Base):
    __tablename__ = "incidents"

    id = Column(String(32), primary_key=True)
    road_id = Column(String(32), ForeignKey("roads.road_id"), nullable=False, index=True)
    incident_type = Column(String(32), nullable=False)  # Accident, Road Work, Road Closure, Vehicle Breakdown, Public Event
    severity = Column(String(16), nullable=False)  # Low, Medium, High, Critical
    description = Column(Text, nullable=False)
    start_time = Column(DateTime, nullable=False, index=True)
    estimated_end_time = Column(DateTime, nullable=True)
    lanes_blocked = Column(Integer, nullable=False, default=1)
    speed_impact_pct = Column(Float, nullable=False, default=30.0)
    status = Column(String(16), nullable=False, default="Active")  # Active, Resolved

    road = relationship("Road", back_populates="incidents")


class VehicleData(Base):
    __tablename__ = "vehicle_data"

    id = Column(Integer, primary_key=True, autoincrement=True)
    road_id = Column(String(32), ForeignKey("roads.road_id"), nullable=False, index=True)
    timestamp = Column(DateTime, nullable=False, index=True)
    cars = Column(Integer, nullable=False)
    motorcycles = Column(Integer, nullable=False)
    buses = Column(Integer, nullable=False)
    trucks = Column(Integer, nullable=False)
    commercial = Column(Integer, nullable=False)
    other = Column(Integer, nullable=False)
    total_vehicles = Column(Integer, nullable=False)

    road = relationship("Road", back_populates="vehicle_records")


class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    road_id = Column(String(32), ForeignKey("roads.road_id"), nullable=False, index=True)
    generated_at = Column(DateTime, nullable=False, default=datetime.utcnow, index=True)
    horizon_minutes = Column(Integer, nullable=False)  # 15, 30, 60
    predicted_score = Column(Float, nullable=False)
    predicted_level = Column(String(16), nullable=False)
    confidence = Column(Float, nullable=False)  # 0.0 - 1.0
    risk_level = Column(String(16), nullable=False)  # Low, Moderate, Elevated, Severe
    factors_json = Column(Text, nullable=False)  # Feature contribution weights & metrics
    explanation = Column(Text, nullable=False)

    road = relationship("Road", back_populates="predictions")


class ModelMetric(Base):
    __tablename__ = "model_metrics"

    id = Column(Integer, primary_key=True, autoincrement=True)
    model_name = Column(String(64), nullable=False)
    horizon_minutes = Column(Integer, nullable=False)
    mae = Column(Float, nullable=False)
    rmse = Column(Float, nullable=False)
    r2 = Column(Float, nullable=False)
    accuracy = Column(Float, nullable=False)
    precision = Column(Float, nullable=False)
    recall = Column(Float, nullable=False)
    f1_score = Column(Float, nullable=False)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow)
