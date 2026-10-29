"""
Feature Engineering Engine for Urban Traffic Forecasting.
Computes temporal, lag, rolling, spatial network, weather, and incident features.
"""
import pandas as pd
import numpy as np


class TrafficFeatureBuilder:
    def __init__(self):
        self.feature_names = [
            "hour",
            "day_of_week",
            "is_weekend",
            "is_rush_hour",
            "capacity_vph",
            "lanes",
            "speed_limit",
            "vehicle_count",
            "avg_speed",
            "occupancy",
            "density_vpk",
            "current_congestion",
            "lag_15m_congestion",
            "lag_30m_congestion",
            "lag_15m_speed",
            "rolling_avg_speed_1h",
            "rolling_avg_congestion_1h",
            "neighbor_congestion",
            "rainfall_mm",
            "visibility_km",
            "has_incident",
            "incident_lanes_blocked"
        ]

    def build_features(self, readings_df: pd.DataFrame, roads_df: pd.DataFrame, 
                       weather_df: pd.DataFrame = None, incidents_df: pd.DataFrame = None) -> pd.DataFrame:
        df = readings_df.copy()
        df["timestamp"] = pd.to_datetime(df["timestamp"])
        df = df.sort_values(by=["road_id", "timestamp"]).reset_index(drop=True)

        # 1. Temporal features
        df["hour"] = df["timestamp"].dt.hour
        df["minute"] = df["timestamp"].dt.minute
        df["day_of_week"] = df["timestamp"].dt.dayofweek
        df["is_weekend"] = (df["day_of_week"] >= 5).astype(int)
        
        # Rush hour flag: Morning (07:30 to 10:00) or Evening (17:00 to 20:00) on weekdays
        m_rush = (df["hour"] >= 7) & (df["hour"] < 10)
        e_rush = (df["hour"] >= 17) & (df["hour"] < 20)
        df["is_rush_hour"] = ((m_rush | e_rush) & (df["is_weekend"] == 0)).astype(int)

        # 2. Road metadata merge
        if "capacity_vph" not in df.columns:
            road_meta = roads_df[["road_id", "capacity_vph", "lanes", "speed_limit", "connected_roads_json"]]
            df = df.merge(road_meta, on="road_id", how="left")

        df["current_congestion"] = df["congestion_score"]

        # 3. Time-lag features per road (grouped)
        df["lag_15m_congestion"] = df.groupby("road_id")["congestion_score"].shift(1).fillna(df["congestion_score"])
        df["lag_30m_congestion"] = df.groupby("road_id")["congestion_score"].shift(2).fillna(df["lag_15m_congestion"])
        df["lag_15m_speed"] = df.groupby("road_id")["avg_speed"].shift(1).fillna(df["avg_speed"])

        # 4. Rolling window features (4 intervals = 1 hour)
        df["rolling_avg_speed_1h"] = (
            df.groupby("road_id")["avg_speed"]
            .transform(lambda x: x.rolling(4, min_periods=1).mean())
        )
        df["rolling_avg_congestion_1h"] = (
            df.groupby("road_id")["congestion_score"]
            .transform(lambda x: x.rolling(4, min_periods=1).mean())
        )

        # 5. Spatial Neighbor Network Congestion
        # Approximate using group average at the same timestamp across related roads
        time_mean_congestion = df.groupby("timestamp")["congestion_score"].transform("mean")
        df["neighbor_congestion"] = 0.6 * df["current_congestion"] + 0.4 * time_mean_congestion

        # 6. Weather features merge
        if weather_df is not None and not weather_df.empty:
            w_df = weather_df.copy()
            w_df["timestamp"] = pd.to_datetime(w_df["timestamp"])
            # Nearest timestamp merge or backward fill
            df = pd.merge_asof(
                df.sort_values("timestamp"),
                w_df[["timestamp", "rainfall_mm", "visibility_km", "temperature_c"]].sort_values("timestamp"),
                on="timestamp",
                direction="backward"
            )
        else:
            df["rainfall_mm"] = 0.0
            df["visibility_km"] = 10.0
            df["temperature_c"] = 28.0

        # 7. Incident features
        df["has_incident"] = 0
        df["incident_lanes_blocked"] = 0
        if incidents_df is not None and not incidents_df.empty:
            inc_active = incidents_df[incidents_df["status"] == "Active"]
            for _, inc in inc_active.iterrows():
                inc_road = inc["road_id"]
                mask = df["road_id"] == inc_road
                df.loc[mask, "has_incident"] = 1
                df.loc[mask, "incident_lanes_blocked"] = int(inc.get("lanes_blocked", 1))

        # 8. Future prediction targets (1 step = 15m, 2 steps = 30m, 4 steps = 60m)
        df["target_15m"] = df.groupby("road_id")["congestion_score"].shift(-1)
        df["target_30m"] = df.groupby("road_id")["congestion_score"].shift(-2)
        df["target_60m"] = df.groupby("road_id")["congestion_score"].shift(-4)

        # Fill forward for edge samples
        df["target_15m"] = df["target_15m"].fillna(df["congestion_score"])
        df["target_30m"] = df["target_30m"].fillna(df["target_15m"])
        df["target_60m"] = df["target_60m"].fillna(df["target_30m"])

        return df
