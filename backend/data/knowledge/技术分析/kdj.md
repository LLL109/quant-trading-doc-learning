---
slug: kdj
title: KDJ指标
category: 技术分析
difficulty: 2
prerequisites: ["k-line"]
related: ["rsi", "macd", "boll"]
tags: ["超买超卖", "随机指标", "短线"]
---

# KDJ指标

> KDJ 是一种随机指标，通过比较收盘价与近期价格区间的位置来判断超买超卖。

## 定义

KDJ 指标由 George Lane 在 1950 年代提出，也叫"随机指标"（Stochastic Oscillator）。它由三条线组成：

- **K 线**：快速随机指标，对价格变化最敏感
- **D 线**：K 线的平滑版本（K 的 3 日移动平均）
- **J 线**：K 和 D 的放大版，J = 3K - 2D

类比：想象你在爬山，KDJ 衡量的是你当前所在位置相对于你最近走过的最低点和最高点的位置。如果接近山顶（超买），可能需要休息；如果接近山谷（超卖），可能快到反弹的时候了。

## 标签

超买超卖, 随机指标, 短线

## 核心内容

### 计算逻辑

KDJ 的核心是 RSV（Raw Stochastic Value，未成熟随机值）：

$$RSV = \frac{C - L_9}{H_9 - L_9} \times 100$$

其中：
- C = 今日收盘价
- $L_9$ = 最近 9 日最低价
- $H_9$ = 最近 9 日最高价

RSV 的含义：当前收盘价在最近 9 天的价格区间中处于什么位置。100 表示在最高点，0 表示在最低点。

### 三条线的含义

| 指标 | 取值范围 | 超买 | 超卖 | 特点 |
|------|----------|------|------|------|
| K | 0-100 | > 80 | < 20 | 最灵敏 |
| D | 0-100 | > 80 | < 20 | 较平滑 |
| J | 可超出 0-100 | > 100 | < 0 | 最灵敏，可能超范围 |

### KDJ 的用法

1. **超买超卖**：
   - K > 80 且 D > 80：超买区，考虑卖出
   - K < 20 且 D < 20：超卖区，考虑买入

2. **金叉/死叉**：
   - K 上穿 D（且在超卖区）：买入信号
   - K 下穿 D（且在超买区）：卖出信号

3. **J 值极端**：
   - J > 100：价格可能过热
   - J < 0：价格可能过冷

4. **背离**：
   - 价格创新高，K/D 未创新高：顶背离
   - 价格创新低，K/D 未创新低：底背离

### KDJ 的特点

- 比 RSI 更灵敏，信号更频繁
- 适合短线和震荡市
- 在趋势行情中容易钝化（长期停留在超买/超卖区）
- 参数 9,3,3 是最常用的设置

## 计算公式

$$RSV = \frac{C - L_9}{H_9 - L_9} \times 100$$

$$K_t = \frac{2}{3}K_{t-1} + \frac{1}{3}RSV_t$$

$$D_t = \frac{2}{3}D_{t-1} + \frac{1}{3}K_t$$

$$J_t = 3K_t - 2D_t$$

初始值：$K_0 = D_0 = 50$

## Python 代码

```python
import pandas as pd
import numpy as np

def calc_kdj(high, low, close, n=9, m1=3, m2=3):
    """
    计算 KDJ 指标
    
    Parameters:
    high: 最高价序列
    low: 最低价序列
    close: 收盘价序列
    n: RSV 周期，默认 9
    m1: K 平滑周期，默认 3
    m2: D 平滑周期，默认 3
    
    Returns:
    DataFrame with columns: K, D, J, RSV
    """
    # 计算 RSV
    low_n = low.rolling(window=n, min_periods=1).min()
    high_n = high.rolling(window=n, min_periods=1).max()
    
    rsv = (close - low_n) / (high_n - low_n) * 100
    rsv = rsv.fillna(50)  # 处理除零情况
    
    # 计算 K, D
    k = pd.Series(index=close.index, dtype=float)
    d = pd.Series(index=close.index, dtype=float)
    
    k.iloc[0] = 50
    d.iloc[0] = 50
    
    for i in range(1, len(close)):
        k.iloc[i] = (2/3) * k.iloc[i-1] + (1/3) * rsv.iloc[i]
        d.iloc[i] = (2/3) * d.iloc[i-1] + (1/3) * k.iloc[i]
    
    j = 3 * k - 2 * d
    
    return pd.DataFrame({
        'K': k,
        'D': d,
        'J': j,
        'RSV': rsv
    }, index=close.index)

# 使用示例
np.random.seed(42)
n = 200
dates = pd.date_range('2023-01-01', periods=n, freq='B')
base = np.cumsum(np.random.randn(n) * 0.8) + 100
high = pd.Series(base + np.abs(np.random.randn(n) * 0.3), index=dates, name='high')
low = pd.Series(base - np.abs(np.random.randn(n) * 0.3), index=dates, name='low')
close = pd.Series(base, index=dates, name='close')

kdj = calc_kdj(high, low, close)

# 超买超卖信号
oversold = (kdj['K'] < 20) & (kdj['D'] < 20)
overbought = (kdj['K'] > 80) & (kdj['D'] > 80)

print(f"超买信号次数: {overbought.sum()}")
print(f"超卖信号次数: {oversold.sum()}")
print(kdj.tail(10))
```

## 常见误区

1. **KDJ 适用于所有行情** — KDJ 是震荡指标，在趋势行情中会"钝化"（长期停留在超买或超卖区），产生大量假信号。趋势行情应优先使用 MACD 等趋势指标。
2. **J 值超出 100 或低于 0 就是错的** — J 值完全可能超出 0-100 范围，这是它的设计特性，不代表计算错误。J > 100 说明极度过热，J < 0 说明极度过冷。
3. **KDJ 金叉死叉频繁交易** — KDJ 非常灵敏，金叉死叉信号很多。如果每次都操作，交易成本会很高。应该只在超买/超卖区域的交叉才更有意义。
4. **只看 K 和 D，忽略 J** — J 线是最灵敏的，往往最先发出信号。特别是在 J 值极端时（>100 或 <0），是重要的警示信号。

## 相关概念

- [RSI](/k/rsi) — 另一个超买超卖指标，更平滑
- [MACD](/k/macd) — 趋势指标，与 KDJ 互补
- [K线](/k/k-line) — KDJ 计算需要 K 线数据
