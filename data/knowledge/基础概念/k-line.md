---
slug: k-line
title: K线图
category: 基础概念
difficulty: 1
prerequisites: ["stock"]
related: ["open-price", "close-price", "high-price", "low-price", "volume"]
tags: ["K线", "技术分析", "价格走势"]
---

# K线图

> K线是用图形化方式记录价格四个关键数据（开盘、收盘、最高、最低）的最经典方法。

## 定义

K线图（Candlestick Chart）起源于日本江户时代的米市交易，后被广泛应用于金融市场。每根K线记录一个时间周期内的四个价格：开盘价、收盘价、最高价、最低价。通过K线的形态和组合，交易者可以分析市场的供需关系和价格趋势。

对程序员来说，K线就像一个"数据可视化组件"——把OHLC（Open, High, Low, Close）四个维度的数据压缩到一根蜡烛形状的图形中。

## 核心内容

### K线的四价

| 价格 | 英文 | 含义 |
|------|------|------|
| 开盘价 | Open | 该时间周期内第一笔成交价 |
| 收盘价 | Close | 该时间周期内最后一笔成交价 |
| 最高价 | High | 该时间周期内的最高成交价 |
| 最低价 | Low | 该时间周期内的最低成交价 |

### 阳线与阴线

**阳线（红色/空心）**：收盘价 > 开盘价，表示该时间段内价格上涨
- 上方实体边界 = 收盘价
- 下方实体边界 = 开盘价

**阴线（绿色/实心）**：收盘价 < 开盘价，表示该时间段内价格下跌
- 上方实体边界 = 开盘价
- 下方实体边界 = 收盘价

### K线的组成部分

一根K线由三部分组成：

1. **实体**（Body）：开盘价和收盘价之间的矩形区域
   - 实体越长，买卖力量越强
   - 阳线实体越长，买方力量越强
   
2. **上影线**（Upper Shadow）：实体上方到最高价的线段
   - 上影线越长，上方卖压越大
   
3. **下影线**（Lower Shadow）：实体下方到最低价的线段
   - 下影线越长，下方支撑越强

### 常见K线形态

**单根K线：**

| 形态 | 特征 | 含义 |
|------|------|------|
| 大阳线 | 长实体，影线短 | 强势上涨信号 |
| 大阴线 | 长实体，影线短 | 强势下跌信号 |
| 十字星 | 实体极小，影线长 | 多空平衡，可能变盘 |
| 锤子线 | 小实体在上方，长下影线 | 下跌后可能见底 |
| 射击之星 | 小实体在下方，长上影线 | 上涨后可能见顶 |
| T字线 | 无上影线，长下影线 | 开盘后下跌后又被拉回 |

**组合形态：**
- **吞没形态**：后一根K线的实体完全包裹前一根，预示趋势反转
- **早晨之星/黄昏之星**：三根K线的组合，分别预示底部反转和顶部反转
- **三连阳/三连阴**：连续三根同向K线，趋势延续信号

### K线周期

K线可以按不同时间周期绘制：
- **1分钟K线**、**5分钟K线**：超短线交易参考
- **日K线**：最常用，每天一根
- **周K线**：每周一根，适合中线
- **月K线**：每月一根，适合长线

### 举例说明

一根日K线：
- 开盘价10.00元，收盘价10.50元，最高价10.80元，最低价9.90元
- 这是一根阳线（收盘>开盘），实体0.50元，上影线0.30元（10.80-10.50），下影线0.10元（10.00-9.90）
- 含义：多方占优，但上方有一定卖压（上影线），下方支撑较弱（下影线短）

## 计算公式

**实体长度：**
$$\text{实体长度} = |\text{收盘价} - \text{开盘价}|$$

**上影线长度：**
$$\text{上影线长度} = \text{最高价} - \max(\text{开盘价}, \text{收盘价})$$

**下影线长度：**
$$\text{下影线长度} = \min(\text{开盘价}, \text{收盘价}) - \text{最低价}$$

**振幅：**
$$\text{振幅} = \frac{\text{最高价} - \text{最低价}}{\text{昨收价}} \times 100\%$$

## Python 代码

```python
import akshare as ak
import pandas as pd
import matplotlib.pyplot as plt
import mplfinance as mpf

# 获取股票K线数据
df = ak.stock_zh_a_hist(symbol="600519", period="daily",
                         start_date="20240101", end_date="20240331",
                         adjust="qfq")
df['日期'] = pd.to_datetime(df['日期'])
df.set_index('日期', inplace=True)
df.rename(columns={'开盘': 'Open', '收盘': 'Close',
                    '最高': 'High', '最低': 'Low',
                    '成交量': 'Volume'}, inplace=True)

# 绘制K线图
mpf.plot(df[['Open', 'High', 'Low', 'Close', 'Volume']],
         type='candle', volume=True,
         style='charles', title='贵州茅台 K线图',
         ylabel='价格（元）')

# 自动识别K线形态
def identify_patterns(row):
    """简单识别K线形态"""
    body = abs(row['Close'] - row['Open'])
    upper_shadow = row['High'] - max(row['Close'], row['Open'])
    lower_shadow = min(row['Close'], row['Open']) - row['Low']

    if body < (row['High'] - row['Low']) * 0.1:
        return '十字星'
    elif lower_shadow > body * 2 and upper_shadow < body * 0.5:
        return '锤子线'
    elif upper_shadow > body * 2 and lower_shadow < body * 0.5:
        return '射击之星'
    elif row['Close'] > row['Open']:
        return '阳线'
    else:
        return '阴线'

df['形态'] = df.apply(identify_patterns, axis=1)
print(df[['Open', 'Close', 'High', 'Low', '形态']].tail(10))
print("\n形态统计:")
print(df['形态'].value_counts())
```

## 常见误区

1. **"红色K线一定是涨，绿色一定是跌"** — 这取决于使用的配色方案。A股行情软件通常红涨绿跌，但国际上很多是绿涨红跌。此外，K线颜色是相对于开盘价而言，而涨跌幅是相对于昨收价，两者可能不一致。
2. **"K线形态能准确预测未来"** — K线形态只是历史数据的可视化，任何单一K线形态都不能保证未来的走势。技术分析需要结合成交量、趋势、支撑阻力等多维度综合判断。
3. **"只看K线就够了"** — K线只反映了价格信息，忽略了成交量、资金流向、基本面等重要因素。完整的分析需要价量配合。

## 相关概念

- [开盘价](/k/open-price) — K线的第一个价格数据
- [收盘价](/k/close-price) — K线最重要的价格数据
- [最高价](/k/high-price) — K线的上影线终点
- [最低价](/k/low-price) — K线的下影线终点
- [成交量](/k/volume) — 与K线配合使用的重要指标
