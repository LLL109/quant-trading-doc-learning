---
slug: boll
title: 布林带
category: 技术分析
difficulty: 2
prerequisites: ["sma", "volatility"]
related: ["rsi", "ma", "sma"]
tags: ["波动率", "通道", "突破"]
---

# 布林带

> 布林带由中轨（SMA20）和上下轨（中轨加减 2 倍标准差）构成，用于衡量价格波动范围。

## 定义

布林带（Bollinger Bands）由 John Bollinger 在 1980 年代发明。它由三条线组成：

- **中轨**：20 日简单移动平均线（SMA20）
- **上轨**：中轨 + 2 倍标准差
- **下轨**：中轨 - 2 倍标准差

类比：想象一条高速公路，中轨是车道中心线，上下轨是路肩。正常情况下车在路肩之间行驶（95% 的概率），如果冲出路面就说明有异常。

## 核心内容

### 布林带的统计学基础

布林带基于正态分布假设：
- 价格落在 ±1σ 范围内的概率约 68%
- 价格落在 ±2σ 范围内的概率约 95%
- 价格落在 ±3σ 范围内的概率约 99.7%

所以当价格触及上轨或下轨时，说明价格处于统计上的"极端"位置。

### 布林带的三个形态

1. **开口（扩张）**：上下轨距离快速增大
   - 含义：波动率上升，通常在突破时出现
   - 操作：关注突破方向

2. **收口（收缩）**：上下轨距离快速缩小
   - 含义：波动率下降，市场在蓄力
   - 操作：准备迎接突破（方向未知）

3. **平行（稳定）**：上下轨距离保持稳定
   - 含义：波动率稳定，趋势可能持续

### 常见用法

1. **回归中轨**：价格触及上/下轨后，有较大概率回归中轨（均值回归）
2. **突破交易**：价格突破上轨可能是上涨信号，突破下轨可能是下跌信号
3. **缩口后突破**：布林带收窄到极致后，往往会出现大幅波动
4. **带宽指标**：(上轨-下轨)/中轨，衡量波动率水平

### 布林带与趋势

- 价格沿上轨运行 → 强势上涨
- 价格沿下轨运行 → 弱势下跌
- 价格在中轨附近震荡 → 无明显趋势

## 计算公式

$$\text{中轨} = SMA_{20} = \frac{1}{20}\sum_{i=0}^{19}P_{t-i}$$

$$\text{上轨} = SMA_{20} + 2\sigma_{20}$$

$$\text{下轨} = SMA_{20} - 2\sigma_{20}$$

$$\sigma_{20} = \sqrt{\frac{1}{20}\sum_{i=0}^{19}(P_{t-i} - SMA_{20})^2}$$

其中 $\sigma_{20}$ 是最近 20 个交易日收盘价的标准差。

$$\text{带宽} = \frac{\text{上轨} - \text{下轨}}{\text{中轨}}$$

## Python 代码

```python
import pandas as pd
import numpy as np

def calc_bollinger(close, period=20, num_std=2):
    """
    计算布林带
    
    Parameters:
    close: 收盘价序列
    period: 中轨周期，默认 20
    num_std: 标准差倍数，默认 2
    
    Returns:
    DataFrame with columns: middle, upper, lower, bandwidth
    """
    middle = close.rolling(window=period).mean()
    std = close.rolling(window=period).std(ddof=0)  # 总体标准差
    
    upper = middle + num_std * std
    lower = middle - num_std * std
    bandwidth = (upper - lower) / middle
    
    return pd.DataFrame({
        'middle': middle,
        'upper': upper,
        'lower': lower,
        'bandwidth': bandwidth,
        'std': std
    }, index=close.index)

# 使用示例
np.random.seed(42)
dates = pd.date_range('2023-01-01', periods=200, freq='B')
close = pd.Series(
    np.cumsum(np.random.randn(200) * 0.8) + 100,
    index=dates, name='close'
)

boll = calc_bollinger(close)

# 判断价格位置
df = pd.DataFrame({'close': close})
df = pd.concat([df, boll], axis=1)

# 价格与布林带的关系
df['position'] = 'middle'
df.loc[df['close'] > df['upper'], 'position'] = 'above_upper'
df.loc[df['close'] < df['lower'], 'position'] = 'below_lower'

# 统计各位置出现的频率
print(df['position'].value_counts(normalize=True))

# 缩口检测
df['bandwidth_pct'] = df['bandwidth'].rank(pct=True)  # 带宽百分位
squeeze = df['bandwidth_pct'] < 0.1  # 带宽处于历史低位 10%
print(f"缩口天数: {squeeze.sum()}")
```

## 常见误区

1. **价格触及上轨就应该卖** — 在强势上涨中，价格可以沿着上轨持续运行（"走轨"）。触及上轨只是说明价格处于统计高位，不意味着一定要回落。
2. **布林带可以预测方向** — 布林带衡量的是波动率和价格位置，不能预测突破方向。缩口之后可能向上突破也可能向下突破。
3. **标准差倍数固定用 2** — 2 倍标准差是默认值，但不同市场和品种可能需要调整。波动率高的品种可能需要 2.5 或 3 倍。
4. **忽视趋势只看位置** — 在趋势行情中用均值回归策略（碰到上轨就卖）会错失大段利润。需要先判断是否有趋势，再决定策略。

## 相关概念

- [SMA](/k/sma) — 布林带中轨的计算基础
- [RSI](/k/rsi) — 与布林带配合判断超买超卖
- [均线](/k/ma) — 布林带的核心组件
