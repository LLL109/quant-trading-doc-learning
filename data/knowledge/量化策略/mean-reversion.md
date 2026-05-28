---
slug: mean-reversion
title: 均值回归策略
category: 量化策略
difficulty: 3
prerequisites: ["boll", "rsi"]
related: ["trend-following"]
tags: ["均值回归", "反转", "策略"]
---

# 均值回归策略

> 均值回归的核心假设是"价格偏离均值后会回归"，策略目标是在价格过度偏离时反向交易。

## 定义

均值回归（Mean Reversion）是与趋势跟踪相对的另一大类策略。它的核心思想是：当价格偏离其"正常水平"（均值）太远时，有较大概率回归均值。简单说就是"涨多了会跌，跌多了会涨"。

类比：就像橡皮筋——拉得越远，反弹的力越大。但问题是，你不知道它会被拉多远，也不知道什么时候会反弹。

## 核心内容

### 核心假设

1. **均值存在**：价格围绕某个"合理水平"波动
2. **偏离会回归**：价格偏离均值后，有较大概率回归
3. **偏离程度可测**：可以用统计方法衡量偏离程度

### 常见的均值回归方法

#### 1. 布林带回归

- **规则**：价格触及布林带上轨做空，触及下轨做多
- **参数**：20日均线 ± 2倍标准差
- **优点**：自适应波动率
- **缺点**：趋势行情中会连续止损

```python
# 布林带均值回归信号
ma = close.rolling(20).mean()
std = close.rolling(20).std()
upper = ma + 2 * std
lower = ma - 2 * std
# 价格低于下轨买入，高于上轨卖出
signal = 0
signal[close < lower] = 1   # 买入
signal[close > upper] = -1  # 卖出
```

#### 2. RSI超买超卖

- **规则**：RSI < 30买入，RSI > 70卖出
- **参数**：14日RSI
- **优点**：有明确的超买超卖区间
- **缺点**：强趋势中RSI可能长期处于极端区域

#### 3. Z-Score回归

- **规则**：计算价格相对于均值的Z-Score，超过阈值反向交易
- **公式**：$Z = \frac{X - \mu}{\sigma}$
- **优点**：统计上更严谨
- **缺点**：需要选择合适的窗口期

#### 4. 配对交易（统计套利）

- **规则**：找到两只高度相关的股票，当价差偏离均值时做多/做空
- **优点**：市场中性，不受大盘影响
- **缺点**：相关性可能突然失效

### 与趋势跟踪的对比

| 维度 | 均值回归 | 趋势跟踪 |
|------|----------|----------|
| 核心逻辑 | 涨多了跌，跌多了涨 | 涨了还涨，跌了还跌 |
| 适合市场 | 震荡市 | 趋势市 |
| 盈利模式 | 频繁小赚，偶尔大亏 | 频繁小亏，偶尔大赚 |
| 最大风险 | 趋势行情中连续止损 | 震荡市中反复止损 |

## Python 代码

```python
import pandas as pd
import numpy as np

def mean_reversion_bollinger(close, window=20, num_std=2):
    """
    布林带均值回归策略

    Parameters:
    close: 收盘价序列
    window: 均线周期
    num_std: 标准差倍数

    Returns:
    DataFrame with strategy results
    """
    df = pd.DataFrame({'close': close})

    # 计算布林带
    df['ma'] = close.rolling(window=window).mean()
    df['std'] = close.rolling(window=window).std()
    df['upper'] = df['ma'] + num_std * df['std']
    df['lower'] = df['ma'] - num_std * df['std']

    # 生成信号：低于下轨买入，高于上轨卖出
    df['signal'] = 0
    df.loc[close < df['lower'], 'signal'] = 1
    df.loc[close > df['upper'], 'signal'] = -1

    # 持仓：保持到回归均值
    df['position'] = 0
    position = 0
    for i in range(len(df)):
        if df['signal'].iloc[i] == 1:
            position = 1
        elif df['signal'].iloc[i] == -1:
            position = -1
        elif position == 1 and close.iloc[i] > df['ma'].iloc[i]:
            position = 0
        elif position == -1 and close.iloc[i] < df['ma'].iloc[i]:
            position = 0
        df.iloc[i, df.columns.get_loc('position')] = position

    df['position'] = df['position'].shift(1)

    # 计算收益
    df['market_return'] = close.pct_change()
    df['strategy_return'] = df['position'] * df['market_return']

    return df

def mean_reversion_rsi(close, period=14, oversold=30, overbought=70):
    """
    RSI均值回归策略

    Parameters:
    close: 收盘价序列
    period: RSI周期
    oversold: 超卖阈值
    overbought: 超买阈值

    Returns:
    DataFrame with strategy results
    """
    df = pd.DataFrame({'close': close})

    # 计算RSI
    delta = close.diff()
    gain = delta.clip(lower=0)
    loss = -delta.clip(upper=0)
    avg_gain = gain.rolling(window=period).mean()
    avg_loss = loss.rolling(window=period).mean()
    rs = avg_gain / avg_loss
    df['rsi'] = 100 - (100 / (1 + rs))

    # 生成信号
    df['signal'] = 0
    df.loc[df['rsi'] < oversold, 'signal'] = 1
    df.loc[df['rsi'] > overbought, 'signal'] = -1

    # 简单持仓逻辑
    df['position'] = df['signal'].replace(0, np.nan).ffill().fillna(0)
    df['position'] = df['position'].shift(1)

    # 计算收益
    df['market_return'] = close.pct_change()
    df['strategy_return'] = df['position'] * df['market_return']

    return df

# 使用示例
np.random.seed(42)
n = 500
dates = pd.date_range('2020-01-01', periods=n, freq='B')
# 模拟震荡市价格
returns = np.random.randn(n) * 0.015
close = pd.Series(100 * np.exp(np.cumsum(returns)), index=dates, name='close')

result = mean_reversion_bollinger(close)
print(f"均值回归策略收益: {(1 + result['strategy_return']).cumprod().iloc[-1]-1:.2%}")
print(f"市场收益: {(1 + result['market_return']).cumprod().iloc[-1]-1:.2%}")
```

## 常见误区

1. **"均值回归在任何市场都有效"** — 在强趋势行情中，价格可能持续偏离均值，导致均值回归策略连续止损。需要有止损机制。
2. **"忽略均值的变化"** — 均值本身也在变化（如公司基本面恶化导致股价中枢下移）。不能简单假设均值固定不变。
3. **"过度交易"** — 均值回归策略通常交易频率较高，需要考虑交易成本对收益的侵蚀。

## 相关概念

- [布林带](/k/boll) — 均值回归的常用工具
- [RSI](/k/rsi) — RSI超买超卖是均值回归的经典信号
- [趋势跟踪策略](/k/trend-following) — 均值回归的"对立面"
