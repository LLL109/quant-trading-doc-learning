---
slug: ema
title: 指数移动平均线
category: 技术分析
difficulty: 2
prerequisites: ["ma"]
related: ["sma", "macd", "golden-cross"]
tags: ["均线", "EMA", "趋势"]
---

# 指数移动平均线

> EMA 对近期价格赋予更大权重，比 SMA 对价格变化的反应更灵敏。

## 定义

指数移动平均线（Exponential Moving Average，EMA）是 SMA 的改进版本。它用指数递减的权重来计算平均值——越近的价格权重越大，越远的价格权重越小，而且理论上所有历史价格都有贡献（虽然老数据的权重趋近于零）。

类比：想象你评价一家餐厅，你更看重最近一次去的体验，5 年前去的那次几乎不影响你的评价。这就是 EMA 的权重分配逻辑。

## 核心内容

### EMA vs SMA 对比

| 特性 | SMA | EMA |
|------|-----|-----|
| 权重分配 | 等权重 | 指数递减 |
| 对近期价格敏感度 | 低 | 高 |
| 滞后性 | 更大 | 更小 |
| 噪音过滤 | 更好 | 更差 |
| 计算复杂度 | 简单 | 需要递归 |

### 平滑系数 α

EMA 的"衰减速度"由平滑系数 α 决定：

- α 越大 → 越重视最新价格 → 曲线越贴近价格
- α 越小 → 越平滑 → 滞后越大

对于周期 N，α = 2/(N+1)。例如：
- EMA(12) → α = 2/13 ≈ 0.154
- EMA(26) → α = 2/27 ≈ 0.074

### 实际影响对比

假设股价从 100 突然跳到 110（第一天就涨了 10 元）：

| 指标 | 第1天 | 第2天（价格保持110） | 第5天 |
|------|-------|---------------------|-------|
| SMA(10) | 101 | 102 | 105 |
| EMA(10) | 101.8 | 103.5 | 107.2 |

EMA 从第一天就更接近 110，因为它给最新价格的权重更大。

### 何时用 EMA

- 需要快速捕捉趋势变化 → EMA 更合适
- 短线交易（1-5 天持仓）→ EMA 信号更及时
- MACD 指标就是基于 EMA 构建的

### 何时用 SMA

- 需要过滤噪音 → SMA 更稳定
- 中长线持仓 → 不需要太灵敏
- 布林带用的是 SMA（20日）

## 计算公式

$$EMA_t = \alpha \cdot P_t + (1 - \alpha) \cdot EMA_{t-1}$$

展开后：

$$EMA_t = \alpha \left[ P_t + (1-\alpha)P_{t-1} + (1-\alpha)^2 P_{t-2} + (1-\alpha)^3 P_{t-3} + \cdots \right]$$

其中 $\alpha = \frac{2}{N+1}$，$N$ 为等效周期。

注意：EMA 需要一个初始值，通常用前 N 天的 SMA 作为起始 EMA。

## Python 代码

```python
import pandas as pd
import numpy as np

# 创建示例数据
np.random.seed(42)
dates = pd.date_range('2024-01-01', periods=100, freq='B')
prices = pd.Series(np.cumsum(np.random.randn(100) * 0.8) + 100, index=dates, name='close')

# pandas 计算 EMA（推荐方式）
# span 参数对应"周期 N"
ema_12 = prices.ewm(span=12, adjust=False).mean()
ema_26 = prices.ewm(span=26, adjust=False).mean()

# 手动实现 EMA（理解原理）
def ema_manual(series, n):
    alpha = 2 / (n + 1)
    result = pd.Series(index=series.index, dtype=float)
    # 用前 n 个值的 SMA 作为初始值
    result.iloc[n - 1] = series.iloc[:n].mean()
    # 递推计算
    for i in range(n, len(series)):
        result.iloc[i] = alpha * series.iloc[i] + (1 - alpha) * result.iloc[i - 1]
    return result

ema_12_manual = ema_manual(prices, 12)

# 对比 SMA 和 EMA
sma_12 = prices.rolling(window=12).mean()

# 可视化对比
comparison = pd.DataFrame({
    'close': prices,
    'SMA_12': sma_12,
    'EMA_12': ema_12
})
print(comparison.tail(10))
```

## 常见误区

1. **EMA 一定比 SMA 好** — EMA 更灵敏是双刃剑。在震荡市中，EMA 会产生更多假信号。没有"更好"的均线类型，只有更适合你策略的。
2. **EMA 没有滞后性** — EMA 滞后性比 SMA 小，但依然存在。任何基于历史数据的均线都不可能完全没有滞后。
3. **EMA 周期和 SMA 周期可以直接对比** — EMA(20) 和 SMA(20) 的曲线形态不同，因为权重分配不同。EMA(20) 的行为更接近 SMA(12-15) 左右。
4. **可以直接用 EMA 预测价格** — EMA 只是另一种平均方式，不提供预测功能。它描述的是经过指数加权的"平均成本"。

## 相关概念

- [SMA](/k/sma) — 简单移动平均线，等权重版本
- [MACD](/k/macd) — 基于 EMA(12) 和 EMA(26) 的差值构建
- [金叉](/k/golden-cross) — EMA 交叉信号
- [均线](/k/ma) — 均线的总体概念
