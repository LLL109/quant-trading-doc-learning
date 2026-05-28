---
slug: akshare
title: AKShare使用
category: 数据与工具
difficulty: 1
prerequisites: ["data-sources"]
related: []
tags: ["AKShare", "数据", "Python"]
---

# AKShare使用

> AKShare是最推荐的Python量化入门数据源，免费开源，覆盖A股全品种。

## 定义

AKShare是一个开源的Python财经数据接口库，提供A股、港股、美股、期货、基金、宏观等多品种数据。它回答的核心问题是：如何用Python免费获取高质量的金融数据？

对程序员来说，AKShare就像一个"金融数据SDK"——你不需要自己写爬虫，直接调用API就能获取数据。

## 核心内容

### AKShare的安装与使用

```bash
pip install akshare
```

### 常用数据接口

#### 1. A股日线行情

```python
import akshare as ak

# 获取个股历史行情
df = ak.stock_zh_a_hist(symbol="600519", period="daily",
                         start_date="20230101", end_date="20241231",
                         adjust="qfq")  # 前复权
```

#### 2. A股实时行情

```python
# 获取所有A股实时行情
df = ak.stock_zh_a_spot_em()
```

#### 3. 财务数据

```python
# 获取个股财务指标
df = ak.stock_financial_abstract_ths(symbol="600519", indicator="按年度")
```

#### 4. 指数数据

```python
# 获取沪深300指数
df = ak.stock_zh_index_daily(symbol="sh000300")
```

#### 5. ETF数据

```python
# 获取ETF行情
df = ak.fund_etf_hist_sina(symbol="sh510300")
```

### AKShare的优势

1. **完全免费**：不需要注册、不需要token
2. **持续更新**：社区活跃，接口不断丰富
3. **Python原生**：返回pandas DataFrame，无缝对接量化流程
4. **覆盖全面**：A股、港股、美股、期货、基金、宏观等

### AKShare的局限

1. **数据频率**：主要是日线，分钟线数据有限
2. **历史深度**：部分数据历史不够长
3. **稳定性**：依赖数据源网站，偶尔会变动
4. **无Level2数据**：需要付费数据源

## Python 代码

```python
import akshare as ak
import pandas as pd

# AKShare完整使用示例

def get_stock_data(symbol="600519", start_date="20230101", end_date="20241231"):
    """
    获取股票数据的完整示例

    Parameters:
    symbol: 股票代码
    start_date: 开始日期
    end_date: 结束日期

    Returns:
    DataFrame with stock data
    """
    # 获取日线行情（前复权）
    df = ak.stock_zh_a_hist(
        symbol=symbol,
        period="daily",
        start_date=start_date,
        end_date=end_date,
        adjust="qfq"
    )

    # 重命名列（方便使用）
    df = df.rename(columns={
        '日期': 'date',
        '开盘': 'open',
        '收盘': 'close',
        '最高': 'high',
        '最低': 'low',
        '成交量': 'volume',
        '成交额': 'amount',
        '振幅': 'amplitude',
        '涨跌幅': 'pct_change',
        '涨跌额': 'change',
        '换手率': 'turnover'
    })

    df['date'] = pd.to_datetime(df['date'])
    df = df.set_index('date')

    return df

def get_multiple_stocks(symbols, start_date="20230101"):
    """批量获取多只股票数据"""
    all_data = {}
    for symbol in symbols:
        try:
            df = get_stock_data(symbol, start_date)
            all_data[symbol] = df
            print(f"获取 {symbol} 成功，共 {len(df)} 条")
        except Exception as e:
            print(f"获取 {symbol} 失败: {e}")
    return all_data

def get_index_data(symbol="sh000300"):
    """获取指数数据"""
    df = ak.stock_zh_index_daily(symbol=symbol)
    df['date'] = pd.to_datetime(df['date'])
    df = df.set_index('date')
    return df

# 使用示例
print("AKShare使用示例：")
print("=" * 40)

# 获取单只股票
try:
    df = get_stock_data("600519", "20240101", "20241231")
    print(f"\n贵州茅台数据：")
    print(f"  数据量: {len(df)} 条")
    print(f"  时间范围: {df.index[0]} 到 {df.index[-1]}")
    print(f"  最新收盘价: {df['close'].iloc[-1]:.2f}")
except Exception as e:
    print(f"获取数据失败: {e}")

# 批量获取
symbols = ["600519", "000858", "601318"]
print(f"\n批量获取 {len(symbols)} 只股票...")
# stocks = get_multiple_stocks(symbols)
```

## 常见误区

1. **"AKShare数据永远正确"** — 任何数据源都可能有错误，获取数据后应该做基本的质量检查。
2. **"不处理复权"** — `adjust`参数很重要，不复权的价格序列在分红送股后会断崖式下跌，导致回测错误。
3. **"频繁调用被封"** — AKShare虽然免费，但调用太频繁可能被数据源网站封IP。建议加适当的延时。

## 相关概念

- [数据来源](/k/data-sources) — AKShare是众多数据源之一
