---
slug: candlestick-patterns
title: 常见K线形态
category: 技术分析
difficulty: 2
prerequisites: ["k-line"]
related: ["k-line", "trendline", "ma"]
tags: ["K线", "形态", "反转信号"]
---

# 常见K线形态

> K线形态通过观察单根或多根K线的形状来判断市场情绪和可能的价格走向。

## 定义

K线形态（Candlestick Patterns）是通过观察K线的实体大小、影线长度以及多根K线的组合关系，来判断市场多空力量变化的技术分析方法。起源于日本江户时代的米市交易，由本间宗久发展完善。

类比：K线形态就像"表情符号"——单根K线是市场的一张"脸"，通过观察它的"表情"来猜测市场情绪。

## 核心内容

### 单根K线形态

#### 十字星（Doji）

- **特征**：开盘价 ≈ 收盘价，实体很小或几乎没有
- **含义**：多空力量平衡，市场犹豫不决
- **信号**：出现在趋势末端时，可能预示反转
- **变体**：长腿十字星、蜻蜓十字星、墓碑十字星

#### 锤子线（Hammer）

- **特征**：小实体在上方，下影线长度是实体的 2 倍以上，几乎没有上影线
- **位置**：出现在下跌趋势末端
- **含义**：价格大幅下跌后被买盘拉回，多方开始反击
- **信号**：看涨反转信号

#### 倒锤子线（Inverted Hammer）

- **特征**：小实体在下方，上影线长度是实体的 2 倍以上
- **位置**：出现在下跌趋势末端
- **含义**：尝试上攻但受阻，需次日确认
- **信号**：潜在看涨反转

#### 上吊线（Hanging Man）

- **特征**：与锤子线形状相同，但出现在上涨趋势末端
- **含义**：虽然收盘在高位，但盘中曾大幅下跌，显示抛压
- **信号**：看跌反转信号

### 双根K线形态

#### 看涨吞没（Bullish Engulfing）

- **特征**：第一根阴线，第二根阳线完全"吞没"第一根的实体
- **位置**：下跌趋势末端
- **含义**：多方力量完全压过空方
- **信号**：强烈的看涨反转信号

#### 看跌吞没（Bearish Engulfing）

- **特征**：第一根阳线，第二根阴线完全"吞没"第一根的实体
- **位置**：上涨趋势末端
- **含义**：空方力量完全压过多方
- **信号**：强烈的看跌反转信号

### 三根K线形态

#### 早晨之星（Morning Star）

- **特征**：
  1. 第一根：大阴线（下跌趋势延续）
  2. 第二根：小实体（十字星或小阴/阳线），向下跳空
  3. 第三根：大阳线，收盘价进入第一根实体内部
- **含义**：空方力竭，多方接管
- **信号**：看涨反转信号

#### 黄昏之星（Evening Star）

- **特征**：
  1. 第一根：大阳线（上涨趋势延续）
  2. 第二根：小实体，向上跳空
  3. 第三根：大阴线，收盘价进入第一根实体内部
- **含义**：多方力竭，空方接管
- **信号**：看跌反转信号

#### 三只乌鸦（Three Black Crows）

- **特征**：连续三根阴线，每根的开盘价都在前一根实体内部，收盘价依次走低
- **含义**：空方连续进攻，多方毫无还手之力
- **信号**：强烈的看跌信号

#### 红三兵（Three White Soldiers）

- **特征**：连续三根阳线，每根的开盘价都在前一根实体内部，收盘价依次走高
- **含义**：多方连续进攻，趋势强劲
- **信号**：强烈的看涨信号

## Python 代码

```python
import pandas as pd
import numpy as np

def detect_doji(open_p, close, high, low, threshold=0.1):
    """检测十字星：实体占整个K线比例很小"""
    body = abs(close - open_p)
    total = high - low
    return (body / total) < threshold

def detect_hammer(open_p, close, high, low):
    """检测锤子线：小实体在上方，长下影线"""
    body = abs(close - open_p)
    upper_shadow = high - max(open_p, close)
    lower_shadow = min(open_p, close) - low
    
    return (lower_shadow > 2 * body) & (upper_shadow < body * 0.3)

def detect_engulfing_bull(open_p, close, high, low):
    """检测看涨吞没"""
    prev_bearish = close.shift(1) < open_p.shift(1)  # 前一根是阴线
    curr_bullish = close > open_p  # 当前是阳线
    engulf = (open_p < close.shift(1)) & (close > open_p.shift(1))  # 完全吞没
    
    return prev_bearish & curr_bullish & engulf

def detect_morning_star(open_p, close, high, low):
    """检测早晨之星"""
    # 第一根：大阴线
    first_bearish = (close.shift(2) < open_p.shift(2)) & \
                    (abs(close.shift(2) - open_p.shift(2)) / (high.shift(2) - low.shift(2)) > 0.5)
    # 第二根：小实体
    second_small = abs(close.shift(1) - open_p.shift(1)) / (high.shift(1) - low.shift(1)) < 0.3
    # 第三根：大阳线
    third_bullish = (close > open_p) & \
                    (abs(close - open_p) / (high - low) > 0.5)
    # 第三根收盘进入第一根实体
    third_recover = close > (open_p.shift(2) + close.shift(2)) / 2
    
    return first_bearish & second_small & third_bullish & third_recover

# 使用示例
np.random.seed(42)
n = 200
dates = pd.date_range('2023-01-01', periods=n, freq='B')
base = np.cumsum(np.random.randn(n) * 0.8) + 100
open_p = pd.Series(base + np.random.randn(n) * 0.3, index=dates, name='open')
close = pd.Series(base + np.random.randn(n) * 0.3, index=dates, name='close')
high = pd.Series(np.maximum(open_p, close) + np.abs(np.random.randn(n) * 0.2), index=dates, name='high')
low = pd.Series(np.minimum(open_p, close) - np.abs(np.random.randn(n) * 0.2), index=dates, name='low')

# 检测各种形态
df = pd.DataFrame({'open': open_p, 'close': close, 'high': high, 'low': low})
df['doji'] = detect_doji(open_p, close, high, low)
df['hammer'] = detect_hammer(open_p, close, high, low)
df['engulfing_bull'] = detect_engulfing_bull(open_p, close, high, low)

print(f"十字星: {df['doji'].sum()} 次")
print(f"锤子线: {df['hammer'].sum()} 次")
print(f"看涨吞没: {df['engulfing_bull'].sum()} 次")
```

## 常见误区

1. **看到形态就立刻行动** — K线形态只是"可能"的信号，不是确定的预测。单个形态的准确率通常只有 50-60%，需要结合其他指标确认。
2. **形态识别是完全客观的** — 很多K线形态的定义有模糊地带（比如"小实体"是多小？），不同人可能识别出不同的结果。量化交易中需要严格定义阈值。
3. **忽视形态出现的位置** — 同样的形态出现在不同位置含义不同。锤子线出现在下跌末端是看涨信号，出现在上涨末端就变成了上吊线（看跌信号）。
4. **只看形态不看成交量** — 成交量是确认形态有效性的重要因素。没有成交量配合的形态信号通常较弱。

## 相关概念

- [K线](/k/k-line) — K线形态分析的基础
- [趋势线](/k/trendline) — 与K线形态配合判断趋势
- [均线](/k/ma) — 确认K线形态信号的常用工具
