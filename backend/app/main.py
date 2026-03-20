from fastapi import FastAPI
from app.db import test_connection

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Backend is running"}

@app.get("/db-test")
def db_test():
    return {"db_connection": test_connection()}