from fastapi import FastAPI

try:
    from app.api.routes.stock import router as stock_router
except ImportError:
    from api.routes.stock import router as stock_router

app = FastAPI(
    title="Palmo Intelligent Automation API",
    version="1.0.0"
)

app.include_router(stock_router, prefix="/stock", tags=["stock"])


@app.get("/")
def root():
    return {
        "message": "Palmo backend is running",
        "endpoints": ["/stock/predict-stock"]
    }
