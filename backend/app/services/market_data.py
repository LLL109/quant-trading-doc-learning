import akshare as ak
import pandas as pd
from functools import lru_cache
from datetime import datetime, timedelta


def get_stock_kline(symbol: str = "000001", period: str = "daily",
                    start_date: str = None, end_date: str = None,
                    adjust: str = "qfq") -> pd.DataFrame:
    """
    获取股票K线数据

    Args:
        symbol: 股票代码，如 "000001"
        period: 周期 "daily"/"weekly"/"monthly"
        start_date: 开始日期 "20240101"
        end_date: 结束日期 "20241231"
        adjust: 复权类型 "qfq"(前复权)/"hfq"(后复权)/""(不复权)
    """
    if not start_date:
        start_date = (datetime.now() - timedelta(days=365)).strftime("%Y%m%d")
    if not end_date:
        end_date = datetime.now().strftime("%Y%m%d")

    df = ak.stock_zh_a_hist(
        symbol=symbol,
        period=period,
        start_date=start_date,
        end_date=end_date,
        adjust=adjust,
    )

    # 统一列名
    df = df.rename(columns={
        "日期": "date",
        "开盘": "open",
        "收盘": "close",
        "最高": "high",
        "最低": "low",
        "成交量": "volume",
        "成交额": "amount",
        "换手率": "turnover",
        "涨跌幅": "pct_change",
    })

    return df


def search_stock(query: str) -> list:
    """搜索股票"""
    try:
        # 获取实时行情用于搜索
        df = ak.stock_zh_a_spot_em()
        mask = df["名称"].str.contains(query, na=False) | df["代码"].str.contains(query, na=False)
        results = df[mask].head(10)
        return [
            {"code": row["代码"], "name": row["名称"], "price": row.get("最新价", 0)}
            for _, row in results.iterrows()
        ]
    except Exception:
        return []


def calculate_ma(df: pd.DataFrame, periods: list = [5, 10, 20, 60]) -> pd.DataFrame:
    """计算移动平均线"""
    for p in periods:
        df[f"ma{p}"] = df["close"].rolling(window=p).mean()
    return df


def calculate_macd(df: pd.DataFrame, fast: int = 12, slow: int = 26, signal: int = 9) -> pd.DataFrame:
    """计算MACD"""
    ema_fast = df["close"].ewm(span=fast, adjust=False).mean()
    ema_slow = df["close"].ewm(span=slow, adjust=False).mean()
    df["dif"] = ema_fast - ema_slow
    df["dea"] = df["dif"].ewm(span=signal, adjust=False).mean()
    df["macd_bar"] = 2 * (df["dif"] - df["dea"])
    return df


def calculate_rsi(df: pd.DataFrame, period: int = 14) -> pd.DataFrame:
    """计算RSI"""
    delta = df["close"].diff()
    gain = delta.where(delta > 0, 0)
    loss = -delta.where(delta < 0, 0)
    avg_gain = gain.rolling(window=period).mean()
    avg_loss = loss.rolling(window=period).mean()
    rs = avg_gain / avg_loss
    df["rsi"] = 100 - (100 / (1 + rs))
    return df


def calculate_boll(df: pd.DataFrame, period: int = 20, std_dev: int = 2) -> pd.DataFrame:
    """计算布林带"""
    df["boll_mid"] = df["close"].rolling(window=period).mean()
    std = df["close"].rolling(window=period).std()
    df["boll_upper"] = df["boll_mid"] + std_dev * std
    df["boll_lower"] = df["boll_mid"] - std_dev * std
    return df
