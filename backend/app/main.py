from fastapi import FastAPI
from app.db import test_connection, engine
from sqlalchemy import text
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins = ["*"],
    allow_credentials = False,
    allow_methods = ["*"],
    allow_headers = ["*"],
)

@app.get("/")
def read_root():
    return {"message": "Backend is running"}

@app.get("/db-test")
def db_test():
    return {"db_connection": test_connection()}

@app.get("/data-preview")
def data_preview():
    with engine.connect() as conn:
        result = conn.execute(text("SELECT * FROM housing_metrics LIMIT 5"))
        rows = [dict(row._mapping) for row in result]
        return rows

@app.get("/metrics")
def get_metrics():
    with engine.connect() as conn:
        result = conn.execute(
            text("""
            SELECT DISTINCT metric_name
            FROM housing_metrics
            ORDER BY metric_name
            """)
        )
        rows = [row[0] for row in result]

    return {"metrics": rows}

@app.get("/regions")
def get_regions():
    with engine.connect() as conn:
        result = conn.execute(
            text("""
                SELECT DISTINCT region_name
                FROM housing_metrics
                ORDER BY region_name
            """)
        )
        rows = [row[0] for row in result]
    return {"region": rows}

@app.get("/timeseries")
def get_timeseries(metric_name: str):
    with engine.connect() as conn:
        result = conn.execute(
            text("""
                SELECT region_name, metric_name, date, value
                FROM housing_metrics
                WHERE metric_name = :metric_name
                ORDER BY date
            """),
            {"metric_name": metric_name}
        )
        rows = [dict(row._mapping) for row in result]
    return rows

@app.get("/summary")
def get_summary():
    with engine.connect() as conn:
        result = conn.execute(
            text("""
                SELECT
                    COUNT(*) AS total_rows,
                    MIN(date) AS start_date,
                    MAX(date) AS end_date
                FROM housing_metrics
            """)
        )
        summary_row = dict(result.fetchone()._mapping)

        latest_zhvi_result = conn.execute(
            text("""
                SELECT value, date
                FROM housing_metrics
                WHERE metric_name = 'zhvi'
                ORDER BY date DESC
            """)
        )
        latest_zhvi = dict(latest_zhvi_result.fetchone()._mapping)

        latest_hpi_result = conn.execute(
            text("""
                SELECT value, date
                FROM housing_metrics
                WHERE metric_name = 'hpi'
                ORDER BY date DESC
            """)
        )
        latest_hpi = dict(latest_hpi_result.fetchone()._mapping)

        return{
            "total_rows": summary_row["total_rows"],
            "start_date": str(summary_row["start_date"]),
            "end_date": str(summary_row["end_date"]),
            "latest_zhvi": latest_zhvi,
            "latest_hpi": latest_hpi
        }