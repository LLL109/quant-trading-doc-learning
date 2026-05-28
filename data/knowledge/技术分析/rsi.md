---
slug: rsi
title: RSI相对强弱指标
category: 技术分析
difficulty: 2
prerequisites: ["close-price"]
related: ["macd", "kdj", "boll"]
tags: ["动量", "超买超卖", "震荡指标"]
---

# RSI相对强弱指标

> RSI 衡量一段时间内上涨幅度与下跌幅度的比值，范围 0-100，用于判断超买超卖。

## 定义

RSI（Relative Strength Index，相对强弱指标）由 J. Welles Wilder 在 1978 年提出。它通过比较一段时间内价格上涨和下跌的幅度，来判断市场是否处于"超买"或"超卖"状态。

类比：想象一个弹簧，RSI 告诉你弹簧被拉伸（超买）或压缩（超卖）到了什么程度。拉伸过度可能会回弹，压缩过度可能会弹起。

## 核心内容

### RSI 的取值范围

| RSI 区间 | 市场状态 | 含义 |
|----------|----------|------|
| 80-100 | 极度超买 | 短期涨幅过大，可能回调 |
| 70-80 | 超买 | 上涨动能可能减弱 |
| 50 | 中性 | 多空平衡 |
| 20-30 | 超卖 | 下跌动能可能减弱 |
| 0-20 | 极度超卖 | 短期跌幅过大，可能反弹 |

### 常用周期

- **RSI(14)**：最常用，Wilder 原始推荐的周期
- **RSI(6)**：更灵敏，适合短线
- **RSI(21)**：更平滑，适合中线

### RSI 的用法

1. **超买超卖**：RSI > 70 考虑卖出，RSI < 30 考虑买入
2. **RSI 背离**：
   - 价格创新高，RSI 未创新高 → 顶背离（看跌）
   - 价格创新低，RSI 未创新低 → 底背离（看涨）
3. **RSI 中轴**：RSI > 50 偏多，RSI < 50 偏空

### 重要注意事项

在强趋势行情中，RSI 可能长期处于超买或超卖区域：
- 强势上涨行情中，RSI 可能连续数周在 70 以上
- 弱势下跌行情中，RSI 可能连续数周在 30 以下

所以不能简单地认为 RSI > 70 就要跌、RSI < 30 就要涨。

## 计算公式

$$RSI = 100 - \frac{100}{1 + RS}$$

$$RS = \frac{\text{N日平均上涨幅度}}{\text{N日平均下跌幅度}}$$

具体计算步骤：
1. 计算每日涨跌幅：$\Delta_t = P_t - P_{t-1}$
2. 分离上涨和下跌：
   - $U_t = \max(\Delta_t, 0)$（上涨幅度，下跌记为 0）
   - $D_t = \max(-\Delta_t, 0)$（下跌幅度，上涨记为 0）
3. 计算 N 日平均：通常用 EMA 或 Wilder 平滑法
4. 计算 RS 和 RSI

## Python 代码

```python
import pandas as pd
import numpy as np

def calc_rsi(close, period=14):
    """
    计算 RSI 指标
    
    Parameters:
    close: 收盘价序列
    period: RSI 周期，默认 14
    
    Returns:
    RSI 序列
    """
    delta = close.diff()
    
    gain = delta.where(delta > 0, 0.0)
    loss = (-delta).where(delta < 0, 0.0)
    
    # 使用 Wilder 平滑法（等效于 alpha=1/period 的 EMA）
    avg_gain = gain.ewm(alpha=1/period, min_periods=period, adjust=False).mean()
    avg_loss = loss.ewm(alpha=1/period, min_periods=period, adjust=False).mean()
    
    rs = avg_gain / avg_loss
    rsi = 100 - (100 / (1 + rs))
    
    return rsi

def calc_rsi_simple(close, period=14):
    """
    简化版 RSI 计算（使用 rolling mean）
    适合初学者理解原理
    """
    delta = close.diff()
    gain = delta.where(delta > 0, 0.0)
    loss = (-delta).where(delta < 0, 0.0)
    
    avg_gain = gain.rolling(window=period).mean()
    avg_loss = loss.rolling(window=period).mean()
    
    rs = avg_gain / avg_loss
    rsi = 100 - (100 / (1 + rs))
    
    return rsi

# 使用示例
np.random.seed(42)
dates = pd.date_range('2023-01-01', periods=200, freq='B')
close = pd.Series(
    np.cumsum(np.random.randn(200) * 0.8) + 100,
    index=dates, name='close'
)

rsi_14 = calc_rsi(close, period=14)
rsi_6 = calc_rsi(close, period=6)

# 超买超卖信号
oversold = rsi_14 < 30
overbought = rsi_14 > 70

print(f"RSI(14) 最新值: {rsi_14.iloc[-1]:.2f}")
print(f"超买信号次数: {overbought.sum()}")
print(f"超卖信号次数: {oversold.sum()}")
```

## 常见误区

1. **RSI > 70 一定要卖** — 在强势上涨行情中，RSI 可能长期在 70 以上。如果趋势很强，RSI 超买只说明涨幅大，不说明马上要跌。
2. **RSI < 30 一定要买** — 同样，在弱势下跌中 RSI 可能长期在 30 以下。抄底需要其他信号配合。
3. **RSI 背离一定会反转** — 背离只说明动能变化，"背离之后还有背离"很常见。背离信号需要等待价格确认。
4. **RSI 可以单独使用** — RSI 是震荡指标，最好与趋势指标（如均线、MACD）配合使用。单独使用 RSI 在趋势行情中效果差。

## 相关概念

- [MACD](/k/macd) — 趋势指标，与 RSI 互补
- [KDJ](/k/kdj) — 另一个超买超卖指标
- [布林带](/k/boll) — 波动率指标，与 RSI 配合使用
