from fastapi import APIRouter, Query
from typing import Optional
from pydantic import BaseModel

from app.services.market_data import (
    get_stock_kline, search_stock,
    calculate_ma, calculate_macd, calculate_rsi, calculate_boll,
)

router = APIRouter(prefix="/api/market", tags=["market"])


class KlinePoint(BaseModel):
    date: str
    open: float
    high: float
    low: float
    close: float
    volume: float
    amount: Optional[float] = None
    turnover: Optional[float] = None
    pct_change: Optional[float] = None


@router.get("/kline", response_model=list[KlinePoint])
def get_kline(
    code: str = Query("000001", description="股票代码"),
    period: str = Query("daily", description="周期: daily/weekly/monthly"),
    start_date: Optional[str] = Query(None, description="开始日期 YYYYMMDD"),
    end_date: Optional[str] = Query(None, description="结束日期 YYYYMMDD"),
):
    df = get_stock_kline(code, period, start_date, end_date)
    records = df.to_dict("records")
    return [KlinePoint(**{k: v for k, v in r.items() if k in KlinePoint.model_fields}) for r in records]


@router.get("/indicators")
def get_indicators(
    code: str = Query("000001"),
    period: str = Query("daily"),
    indicators: str = Query("ma,macd,rsi,boll", description="逗号分隔的指标列表"),
):
    df = get_stock_kline(code, period)
    indicator_list = [i.strip() for i in indicators.split(",")]

    result = {"dates": df["date"].astype(str).tolist()}

    if "ma" in indicator_list:
        df = calculate_ma(df)
        result["ma"] = {
            f"ma{p}": df[f"ma{p}"].dropna().tolist()
            for p in [5, 10, 20, 60]
        }

    if "macd" in indicator_list:
        df = calculate_macd(df)
        result["macd"] = {
            "dif": df["dif"].dropna().tolist(),
            "dea": df["dea"].dropna().tolist(),
            "bar": df["macd_bar"].dropna().tolist(),
        }

    if "rsi" in indicator_list:
        df = calculate_rsi(df)
        result["rsi"] = {"rsi": df["rsi"].dropna().tolist()}

    if "boll" in indicator_list:
        df = calculate_boll(df)
        result["boll"] = {
            "upper": df["boll_upper"].dropna().tolist(),
            "mid": df["boll_mid"].dropna().tolist(),
            "lower": df["boll_lower"].dropna().tolist(),
        }

    return result


@router.get("/search")
def search_stocks(q: str = Query(..., min_length=1)):
    return search_stock(q)
