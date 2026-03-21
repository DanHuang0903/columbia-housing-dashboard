# Columbia Housing Dashboard

A full-stack project analyzing housing trends in Columbia, MO.

## Tech Stack
- React (Vite)
- FastAPI
- PostgreSQL (Neon)
- pandas

## Data Sources
- Zillow Research (ZHVI)
- FRED (HPI)

## Features
- Data pipeline with pandas
- PostgreSQL storage
- FastAPI backend
- API endpoints for housing data

## Project Structure
backend/ → FastAPI + data pipeline
frontend/ → React app
data/ → raw + processed data

## Setup Backend
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload

## API Example
GET /data-preview

## Future Work

- Add Missouri comparison
- Build React charts
- Add filters by metric and region