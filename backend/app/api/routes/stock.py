from pathlib import Path

from fastapi import APIRouter

try:
    from app.services.excel_reader import (
        load_sales_data,
        load_stock_data,
        load_suppliers_data,
    )
    from app.services.stock_predictor import calculate_stock_risk
except ImportError:
    from services.excel_reader import (
        load_sales_data,
        load_stock_data,
        load_suppliers_data,
    )
    from services.stock_predictor import calculate_stock_risk

router = APIRouter()

DATA_DIR = Path(__file__).resolve().parents[2] / "data"
BASE_PATH = DATA_DIR / "mock"


@router.get("/predict-stock")
def predict_stock():
    sales_df = load_sales_data(BASE_PATH / "sales_history.csv")
    stock_df = load_stock_data(BASE_PATH / "stock.csv")
    suppliers_df = load_suppliers_data(BASE_PATH / "suppliers.csv")

    result = calculate_stock_risk(
        sales_df,
        stock_df,
        suppliers_df
    )

    return {
        "status": "success",
        "data": result.to_dict(orient="records")
    }