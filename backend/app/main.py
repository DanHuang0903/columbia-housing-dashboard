from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.market import router as market_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins = [
        "https://columbia-housing.netlify.app",
        "http://localhost:5173",
        "http://localhost:3000",
        ],
    allow_credentials = True,
    allow_methods = ["*"],
    allow_headers = ["*"],
)
app.include_router(market_router)
