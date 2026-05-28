---
slug: drawdown-control
title: 回撤控制
category: 风控与仓位
difficulty: 3
prerequisites: ["max-drawdown", "position-sizing"]
related: []
tags: ["回撤", "风控", "资金管理"]
---

# 回撤控制

> 回撤控制是在市场下跌时限制组合亏损的系统性方法，是量化风控的核心。

## 定义

回撤控制（Drawdown Control）是一套在组合回撤超过阈值时自动降低风险敞口的规则体系。它回答的核心问题是：当市场不好时，如何保护本金？

对程序员来说，回撤控制就像"熔断机制"——当系统负载过高（亏损过大）时，自动降级（减仓），防止系统崩溃（亏光本金）。

## 核心内容

### 为什么需要回撤控制？

1. **心理因素**：回撤超过20%时，大多数人会恐慌割肉
2. **复利效应**：亏50%需要赚100%才能回本，回撤控制保护复利基础
3. **生存第一**：活下来才有机会等到下一个牛市

### 常见的回撤控制方法

#### 1. 最大回撤止损

当组合回撤达到X%时，全部清仓或大幅减仓。

**触发条件**：
$$\text{当前回撤} = \frac{\text{当前净值} - \text{最高净值}}{\text{最高净值}} \leq -X\%$$

#### 2. 逐步减仓法

根据回撤幅度逐步降低仓位：

| 回撤幅度 | 仓位调整 |
|----------|----------|
| -5% | 减仓至80% |
| -10% | 减仓至50% |
| -15% | 减仓至20% |
| -20% | 清仓 |

#### 3. 波动率调整法

当市场波动率上升时，按比例降低仓位：

$$\text{目标仓位} = \text{基准仓位} \times \frac{\text{目标波动率}}{\text{当前波动率}}$$

#### 4. 市场状态判断法

根据市场整体状态调整仓位：
- 牛市（均线多头排列）：满仓
- 震荡市：半仓
- 熊市（均线空头排列）：轻仓或空仓

### 回撤控制与仓位管理的关系

回撤控制是仓位管理的"安全网"：
- 仓位管理：正常情况下的资金分配
- 回撤控制：异常情况下的紧急减仓

## Python 代码

```python
import pandas as pd
import numpy as np

class DrawdownController:
    """回撤控制器"""

    def __init__(self, max_drawdown=-0.20, reduce_steps=None):
        self.max_drawdown = max_drawdown
        self.reduce_steps = reduce_steps or [
            (-0.05, 0.80),  # 回撤5%时，仓位降至80%
            (-0.10, 0.50),  # 回撤10%时，仓位降至50%
            (-0.15, 0.20),  # 回撤15%时，仓位降至20%
            (-0.20, 0.00),  # 回撤20%时，清仓
        ]

    def calculate_drawdown(self, equity_curve):
        """计算回撤序列"""
        peak = equity_curve.cummax()
        drawdown = (equity_curve - peak) / peak
        return drawdown

    def get_target_position(self, current_drawdown):
        """根据回撤确定目标仓位"""
        for dd_threshold, position in self.reduce_steps:
            if current_drawdown <= dd_threshold:
                return position
        return 1.0  # 无回撤时满仓

    def apply_control(self, equity_curve, base_position=1.0):
        """应用回撤控制"""
        drawdown = self.calculate_drawdown(equity_curve)
        target_position = drawdown.apply(self.get_target_position) * base_position
        return target_position

def volatility_adjusted_position(current_vol, target_vol=0.15, base_position=1.0):
    """波动率调整仓位"""
    if current_vol <= 0:
        return base_position
    adjusted = base_position * (target_vol / current_vol)
    return min(adjusted, 1.0)  # 上限100%

def market_regime_position(close, ma_period=60):
    """市场状态判断仓位"""
    ma = close.rolling(ma_period).mean()
    if close.iloc[-1] > ma.iloc[-1]:
        return 1.0  # 牛市满仓
    else:
        return 0.5  # 熊市半仓

# 使用示例
np.random.seed(42)
n = 252
dates = pd.date_range('2023-01-01', periods=n, freq='B')
equity = pd.Series(
    1000000 * (1 + np.random.randn(n) * 0.015).cumprod(),
    index=dates
)

# 回撤控制
dc = DrawdownController(max_drawdown=-0.20)
drawdown = dc.calculate_drawdown(equity)
target_position = dc.apply_control(equity)

print("回撤控制示例：")
print(f"最大回撤: {drawdown.min():.2%}")
print(f"当前回撤: {drawdown.iloc[-1]:.2%}")
print(f"目标仓位: {target_position.iloc[-1]:.0%}")

# 显示回撤与仓位的关系
sample_idx = [0, 50, 100, 150, 200, 250]
print("\n回撤与仓位对照：")
for idx in sample_idx:
    if idx < len(drawdown):
        print(f"  {dates[idx].strftime('%Y-%m-%d')}: "
              f"回撤={drawdown.iloc[idx]:.2%}, "
              f"仓位={target_position.iloc[idx]:.0%}")
```

## 常见误区

1. **"回撤控制会降低收益"** — 短期看确实会，但长期看，避免大幅回撤能保护复利基础，最终收益可能更高。
2. **"回撤阈值设太紧"** — 正常波动也会触发回撤控制，导致频繁减仓。需要根据策略特性合理设置阈值。
3. **"减仓后不加回来"** — 回撤控制是临时措施，市场企稳后应该逐步加回仓位。否则会错过反弹。

## 相关概念

- [最大回撤](/k/max-drawdown) — 回撤控制的目标就是限制最大回撤
- [仓位管理](/k/position-sizing) — 回撤控制是仓位管理的紧急机制
