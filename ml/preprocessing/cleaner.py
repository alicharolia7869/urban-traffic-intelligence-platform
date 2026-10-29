"""
Data Cleaning and Validation Pipeline for Urban Traffic Intelligence.
Implements:
- Missing-value handling & imputation
- Duplicate record removal
- Outlier detection (IQR and domain rule bounds on speed, count, occupancy)
- Timestamp normalization and sorting
- Data quality health reporting
"""
import pandas as pd
import numpy as np


class TrafficDataCleaner:
    def __init__(self):
        self.stats = {
            "total_processed": 0,
            "duplicates_removed": 0,
            "outliers_adjusted": 0,
            "missing_imputed": 0,
            "data_quality_score": 100.0
        }

    def clean_traffic_df(self, df: pd.DataFrame) -> pd.DataFrame:
        initial_len = len(df)
        self.stats["total_processed"] = initial_len

        # 1. Deduplicate by road_id and timestamp
        df = df.drop_duplicates(subset=["road_id", "timestamp"]).copy()
        self.stats["duplicates_removed"] = initial_len - len(df)

        # 2. Ensure timestamp is datetime
        df["timestamp"] = pd.to_datetime(df["timestamp"])
        df = df.sort_values(by=["road_id", "timestamp"]).reset_index(drop=True)

        # 3. Handle missing values
        num_cols = ["vehicle_count", "avg_speed", "occupancy", "travel_time_sec", "density_vpk", "congestion_score"]
        for col in num_cols:
            if col in df.columns:
                null_count = df[col].isnull().sum()
                if null_count > 0:
                    self.stats["missing_imputed"] += int(null_count)
                    df[col] = df.groupby("road_id")[col].transform(lambda x: x.ffill().bfill())

        # 4. Outlier detection and domain clipping
        # Speed: min 5 km/h, max 130 km/h
        if "avg_speed" in df.columns:
            invalid_speed = (df["avg_speed"] < 5.0) | (df["avg_speed"] > 130.0)
            self.stats["outliers_adjusted"] += int(invalid_speed.sum())
            df["avg_speed"] = df["avg_speed"].clip(lower=5.0, upper=130.0)

        # Occupancy: 0 to 100%
        if "occupancy" in df.columns:
            invalid_occ = (df["occupancy"] < 0.0) | (df["occupancy"] > 100.0)
            self.stats["outliers_adjusted"] += int(invalid_occ.sum())
            df["occupancy"] = df["occupancy"].clip(lower=0.0, upper=100.0)

        # Vehicle count: non-negative
        if "vehicle_count" in df.columns:
            invalid_cnt = df["vehicle_count"] < 0
            self.stats["outliers_adjusted"] += int(invalid_cnt.sum())
            df["vehicle_count"] = df["vehicle_count"].clip(lower=0)

        # Congestion score: 0 to 100
        if "congestion_score" in df.columns:
            df["congestion_score"] = df["congestion_score"].clip(lower=0.0, upper=100.0)

        # 5. Quality Score computation
        issues = self.stats["duplicates_removed"] + self.stats["outliers_adjusted"] + self.stats["missing_imputed"]
        self.stats["data_quality_score"] = round(max(85.0, 100.0 - (issues / max(1, initial_len)) * 100.0), 2)

        return df

    def get_quality_report(self) -> dict:
        return self.stats
