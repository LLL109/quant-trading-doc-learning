---
slug: sma
title: 简单移动平均线
category: 技术分析
difficulty: 1
prerequisites: ["ma"]
related: ["ema", "golden-cross", "death-cross"]
tags: ["均线", "SMA", "基础指标"]
---

# 简单移动平均线

> SMA 就是对最近 N 个收盘价取算术平均，每个价格权重相等。

## 定义

简单移动平均线（Simple Moving Average，SMA）是最基本的均线类型。它把过去 N 个交易日的收盘价加起来，除以 N，得到当天的 SMA 值。

类比：就像你算最近 5 次考试的平均分，每次考试权重一样，都是 1/5。

## 核心内容

### 计算过程（直观理解）

假设某股票最近 5 天收盘价是：10, 11, 12, 13, 14

SMA(5) = (10 + 11 + 12 + 13 + 14) / 5 = 12.0

第 6 天收盘价变成 15，那么：
- 最新的一组：11, 12, 13, 14, 15
- SMA(5) = (11 + 12 + 13 + 14 + 15) / 5 = 13.0

注意：窗口"滑动"了——丢掉最早的 10，加入最新的 15。

### 等权重的含义

SMA 对窗口内每个价格赋予相同的权重 1/N。这意味着 20 天前的价格和昨天的价格对当前 SMA 的影响完全一样。

这个特性既是优点也是缺点：
- **优点**：简单、稳定、不容易被单日异常波动影响
- **缺点**：对最新价格变化反应慢，存在滞后性

### 滞后性

SMA 的周期越长，滞后越严重。举个极端例子：

假设一只股票在 100 元横盘了 250 天，然后突然连续暴涨 10 天到 200 元。
- SMA(5) 很快就跟到接近 200（5 天后就到位）
- SMA(250) 才涨到 104（250 天里只有 10 天是 200，其余 240 天是 100）

这就是为什么长周期 SMA 适合判断大趋势，但不适合捕捉快速反转。

### 选用建议

| 交易风格 | 推荐 SMA 周期 | 说明 |
|----------|--------------|------|
| 日内/超短线 | 5, 10 | 反应快，但噪音多 |
| 短线 | 10, 20 | 平衡灵敏度和稳定性 |
| 中线 | 20, 60 | 过滤日常波动，看趋势 |
| 长线 | 120, 250 | 判断牛熊大方向 |

## 计算公式

$$SMA_N(t) = \frac{P_t + P_{t-1} + P_{t-2} + \cdots + P_{t-N+1}}{N} = \frac{1}{N}\sum_{i=0}^{N-1}P_{t-i}$$

其中：
- $P_t$：第 $t$ 天的收盘价
- $N$：均线周期（天数）
- $SMA_N(t)$：第 $t$ 天的 N 日简单移动平均值

## Python 代码

```python
import pandas as pd
import numpy as np

# 创建示例数据：30 天收盘价
np.random.seed(42)
dates = pd.date_range('2024-01-01', periods=30, freq='B')
prices = pd.Series(np.cumsum(np.random.randn(30) * 0.5) + 100, index=dates, name='close')

# 方法1：pandas rolling（推荐）
sma_5 = prices.rolling(window=5).mean()
sma_20 = prices.rolling(window=20).mean()

# 方法2：手动计算（帮助理解原理）
def sma_manual(series, n):
    """手动实现 SMA，理解底层逻辑"""
    result = pd.Series(index=series.index, dtype=float)
    for i in range(n - 1, len(series)):
        result.iloc[i] = series.iloc[i - n + 1:i + 1].mean()
    return result

sma_5_manual = sma_manual(prices, 5)

# 验证两种方法结果一致
print(sma_5.dropna().equals(sma_5_manual.dropna()))  # True

# 实际应用：判断价格与 SMA 的关系
df = pd.DataFrame({'close': prices, 'sma_20': sma_20})
df['above_sma'] = df['close'] > df['sma_20']
print(df.tail(10))
```

## 常见误区

1. **SMA 能预测价格走势** — SMA 只是过去价格的平均值，没有任何预测能力。它告诉你的是"过去 N 天的平均成本是多少"，不是"明天会涨还是会跌"。
2. **SMA 金叉就该买** — 在震荡市中，短期 SMA 和长期 SMA 会频繁交叉，每次交叉都操作的话，手续费就能把利润吃光。金叉信号在趋势行情中才比较可靠。
3. **周期选择有"正确答案"** — 不存在放之四海皆准的最优周期。5 日均线适合做短线的人，250 日均线适合做长线的人。选择取决于你的交易风格和持仓周期。
4. **SMA 支撑/阻力是精确的价位** — 均线支撑不是一个精确的点，而是一个区域。价格可能在 SMA 上方几个点就反弹，也可能略微跌破后才反弹。

## 相关概念

- [EMA](/k/ema) — 指数移动平均线，近期价格权重更大
- [金叉](/k/golden-cross) — 短期 SMA 上穿长期 SMA
- [死叉](/k/death-cross) — 短期 SMA 下穿长期 SMA
- [布林带](/k/boll) — 以 SMA 为中轨构建的波动率通道
