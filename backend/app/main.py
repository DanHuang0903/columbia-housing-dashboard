from fastapi import FastAPI
from app.db import test_connection, engine
from sqlalchemy import text

app = FastAPI()

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