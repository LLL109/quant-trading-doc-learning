---
slug: trend-following
title: 趋势跟踪策略
category: 量化策略
difficulty: 2
prerequisites: ["ma", "golden-cross"]
related: ["momentum-rotation", "etf-rotation", "quant-overview"]
tags: ["趋势", "策略", "均线"]
---

# 趋势跟踪策略

> 趋势跟踪的核心假设是"趋势一旦形成就倾向于持续"，策略目标是抓住趋势的中间段。

## 定义

趋势跟踪（Trend Following）是最古老、最经典的量化策略类型。它的核心思想非常简单：当价格呈现上升趋势时做多，当趋势反转时离场。不预测顶部和底部，只吃趋势中间最确定的一段。

类比：就像冲浪——你不需要预测海浪什么时候来，只需要在浪起来的时候站上去，浪要结束的时候跳下来。

## 核心内容

### 核心假设

1. **趋势存在**：市场价格不是完全随机的，存在可识别的趋势
2. **趋势持续**：一旦趋势形成，有较大概率继续一段时间
3. **无法预测转折**：不试图预测趋势何时结束，只在确认结束后离场

### 常见的趋势跟踪方法

#### 1. 均线突破

- **规则**：价格上穿 N 日均线买入，下穿卖出
- **参数**：N 通常取 20、60、120
- **优点**：简单直观
- **缺点**：在震荡市中反复止损

```python
# 均线突破策略信号
signal = (close > close.rolling(60).mean()).astype(int)
```

#### 2. 均线交叉

- **规则**：短期均线上穿长期均线买入（金叉），下穿卖出（死叉）
- **参数**：常用 20/60、50/200
- **优点**：信号比均线突破更少
- **缺点**：更滞后

#### 3. 通道突破（唐奇安通道）

- **规则**：价格突破 N 日最高价买入，跌破 N 日最低价卖出
- **参数**：N 通常取 20（Donchian Channel）
- **优点**：直接基于价格极值
- **缺点**：假突破较多

```python
# 唐奇安通道突破
upper = high.rolling(20).max()
lower = low.rolling(20).min()
```

#### 4. ATR 通道

- **规则**：在均线基础上加减 N 倍 ATR（平均真实波幅）作为通道
- **优点**：自适应波动率
- **缺点**：参数更多

### 适合的品种

| 品种 | 适合程度 | 原因 |
|------|----------|------|
| ETF（指数型） | 非常适合 | 趋势明显，分散风险 |
| 期货 | 非常适合 | 可以做空，杠杆灵活 |
| 大盘股 | 适合 | 流动性好，趋势较稳定 |
| 小盘股 | 不太适合 | 波动大，假信号多 |
| 加密货币 | 争议大 | 趋势强但波动极端 |

### 震荡市的困境

趋势跟踪策略最大的敌人是震荡市——价格在一个区间内反复波动，均线频繁交叉，导致反复止损。

解决思路：
- 用过滤器识别震荡市（如 ADX < 20）
- 在震荡市中降低仓位或停止交易
- 接受震荡市的小亏损，靠趋势行情的大盈利覆盖

## Python 代码

```python
import pandas as pd
import numpy as np

def trend_following_ma(close, short_window=20, long_window=60):
    """
    均线交叉趋势跟踪策略
    
    Parameters:
    close: 收盘价序列
    short_window: 短期均线周期
    long_window: 长期均线周期
    
    Returns:
    DataFrame with strategy results
    """
    df = pd.DataFrame({'close': close})
    
    # 计算均线
    df['ma_short'] = close.rolling(window=short_window).mean()
    df['ma_long'] = close.rolling(window=long_window).mean()
    
    # 生成信号：短均线 > 长均线 → 持有，否则空仓
    df['signal'] = (df['ma_short'] > df['ma_long']).astype(int)
    
    # 持仓（次日执行）
    df['position'] = df['signal'].shift(1)
    
    # 计算收益
    df['market_return'] = close.pct_change()
    df['strategy_return'] = df['position'] * df['market_return']
    df['cumulative_market'] = (1 + df['market_return']).cumprod()
    df['cumulative_strategy'] = (1 + df['strategy_return']).cumprod()
    
    return df

def trend_following_donchian(high, low, close, n=20):
    """
    唐奇安通道突破策略
    
    Parameters:
    high, low, close: 最高价、最低价、收盘价
    n: 通道周期
    
    Returns:
    DataFrame with strategy results
    """
    df = pd.DataFrame({'high': high, 'low': low, 'close': close})
    
    # 计算通道
    df['upper'] = high.rolling(window=n).max().shift(1)  # 昨日的 N 日最高
    df['lower'] = low.rolling(window=n).min().shift(1)   # 昨日的 N 日最低
    
    # 信号：突破上轨买入，跌破下轨卖出
    df['signal'] = 0
    df.loc[close > df['upper'], 'signal'] = 1
    df.loc[close < df['lower'], 'signal'] = 0
    
    # 保持持仓直到触发卖出
    df['signal'] = df['signal'].replace(0, np.nan).ffill().fillna(0)
    df['position'] = df['signal'].shift(1)
    
    # 计算收益
    df['market_return'] = close.pct_change()
    df['strategy_return'] = df['position'] * df['market_return']
    
    return df

# 使用示例
np.random.seed(42)
n = 500
dates = pd.date_range('2020-01-01', periods=n, freq='B')
# 模拟一个有趋势的价格序列
returns = np.random.randn(n) * 0.01
returns[100:200] += 0.005  # 上涨趋势
returns[300:400] -= 0.005  # 下跌趋势
close = pd.Series(100 * np.exp(np.cumsum(returns)), index=dates, name='close')

result = trend_following_ma(close)
print(f"策略收益: {result['cumulative_strategy'].iloc[-1]-1:.2%}")
print(f"市场收益: {result['cumulative_market'].iloc[-1]-1:.2%}")
```

## 常见误区

1. **趋势跟踪在任何市场都有效** — 趋势跟踪在震荡市中会反复亏损。它的盈利模式是"多次小亏 + 少次大赚"，需要忍受连续亏损的痛苦。
2. **越短周期越好** — 短周期趋势跟踪信号多但噪音也多，交易成本高。长周期信号少但更可靠。选择周期需要与你的持仓风格匹配。
3. **不需要止损** — 趋势跟踪策略本身就有止损机制（趋势反转就离场），但需要严格执行。犹豫不决会导致小亏变大亏。
4. **追求精确的参数** — 均线周期用 19 还是 21 区别不大。重要的是策略逻辑是否合理，而不是参数是否"最优"。

## 相关概念

- [均线](/k/ma) — 趋势跟踪的核心工具
- [金叉](/k/golden-cross) — 趋势跟踪的买入信号
- [动量轮动策略](/k/momentum-rotation) — 另一种趋势策略
- [ETF轮动策略](/k/etf-rotation) — 趋势跟踪在ETF上的应用
