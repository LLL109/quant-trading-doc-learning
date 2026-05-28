---
slug: stop-loss
title: 止损
category: 风控与仓位
difficulty: 2
prerequisites: ["position-sizing"]
related: ["take-profit"]
tags: ["止损", "风控"]
---

# 止损

> 止损是在亏损扩大前及时退出的纪律，是保护本金的最后一道防线。

## 定义

止损（Stop-Loss）是当投资亏损达到预设阈值时，强制卖出以限制损失的操作。它回答的核心问题是：这笔交易最多能亏多少钱？

对程序员来说，止损就像"异常处理"——当程序运行出错（亏损超过阈值）时，执行catch块（卖出），而不是让程序崩溃（亏光本金）。

## 核心内容

### 为什么止损如此重要？

假设你亏了50%：
- 亏50%后，需要涨100%才能回本
- 亏30%后，需要涨43%才能回本
- 亏10%后，需要涨11%才能回本

亏损越大，回本越难。止损的目的就是把亏损控制在可恢复的范围内。

### 常见的止损方法

#### 1. 固定比例止损

亏损达到买入价的X%时止损，如-7%或-10%。

**优点**：简单明确
**缺点**：不考虑个股波动率差异

#### 2. 技术位止损

跌破关键支撑位（如均线、前低、趋势线）时止损。

**优点**：有技术依据
**缺点**：支撑位的判断有主观性

#### 3. ATR止损

以N倍ATR（平均真实波幅）作为止损距离：

$$\text{止损价} = \text{买入价} - N \times \text{ATR}$$

**优点**：自适应波动率
**缺点**：需要计算ATR

#### 4. 时间止损

买入后N天内未达到预期，无论盈亏都卖出。

**优点**：避免资金长期占用
**缺点**：可能错过后续行情

### 止损的纪律

1. **买入前就设好止损位**：不要等亏了再想止损
2. **止损不可撤销**：设了就要执行，不要"再等等看"
3. **止损后不要立即回补**：止损说明判断可能有误，冷静分析后再决定

## 计算公式

**固定比例止损：**
$$\text{止损价} = \text{买入价} \times (1 - \text{止损比例})$$

**ATR止损：**
$$\text{止损价} = \text{买入价} - N \times \text{ATR}_{14}$$

**最大可亏损股数（配合仓位管理）：**
$$\text{最大股数} = \frac{\text{总资金} \times \text{单笔风险比例}}{\text{买入价} - \text{止损价}}$$

## Python 代码

```python
import pandas as pd
import numpy as np

def fixed_percentage_stop(entry_price, stop_pct=0.07):
    """固定比例止损"""
    stop_price = entry_price * (1 - stop_pct)
    return {
        '买入价': entry_price,
        '止损价': stop_price,
        '止损幅度': f'{stop_pct:.0%}',
    }

def atr_stop(entry_price, atr, multiplier=2):
    """ATR止损"""
    stop_price = entry_price - multiplier * atr
    stop_pct = (entry_price - stop_price) / entry_price
    return {
        '买入价': entry_price,
        'ATR': atr,
        '止损价': stop_price,
        '止损幅度': f'{stop_pct:.2%}',
    }

def calculate_position_with_stop(capital, risk_pct, entry_price, stop_price):
    """根据止损位计算仓位"""
    risk_amount = capital * risk_pct
    risk_per_share = entry_price - stop_price
    shares = int(risk_amount / risk_per_share / 100) * 100
    return shares

# 使用示例
capital = 1000000
entry_price = 50

# 固定比例止损
stop1 = fixed_percentage_stop(entry_price, stop_pct=0.07)
print("固定比例止损：")
for k, v in stop1.items():
    print(f"  {k}: {v}")

# ATR止损
atr = 2.5
stop2 = atr_stop(entry_price, atr, multiplier=2)
print("\nATR止损：")
for k, v in stop2.items():
    print(f"  {k}: {v}")

# 计算仓位
shares = calculate_position_with_stop(capital, risk_pct=0.02,
                                      entry_price=entry_price,
                                      stop_price=stop2['止损价'])
print(f"\n建议买入: {shares}股，金额: {shares * entry_price:,.0f}元")

# 止损回测分析
def analyze_stop_loss(prices, stop_pct=0.07):
    """分析止损效果"""
    trades = []
    position = None

    for i in range(1, len(prices)):
        if position is None:
            # 买入
            position = {'entry': prices[i], 'entry_idx': i}
        else:
            # 检查止损
            pnl = (prices[i] - position['entry']) / position['entry']
            if pnl <= -stop_pct:
                trades.append({
                    'entry': position['entry'],
                    'exit': prices[i],
                    'pnl': pnl,
                    'type': '止损'
                })
                position = None

    return pd.DataFrame(trades)

# 模拟数据
np.random.seed(42)
prices = 100 * np.exp(np.cumsum(np.random.randn(252) * 0.02))
trades = analyze_stop_loss(prices, stop_pct=0.07)
print(f"\n止损分析：共{len(trades)}次止损")
if not trades.empty:
    print(f"平均止损亏损: {trades['pnl'].mean():.2%}")
```

## 常见误区

1. **"止损了就亏了"** — 止损不是亏钱，是保命。不止损可能从小亏变大亏，甚至亏光。
2. **"止损设太紧"** — 止损设太紧（如-3%）会被正常波动触发，导致频繁止损。需要根据个股波动率合理设置。
3. **"止损后不反思"** — 止损后应该分析原因：是策略问题、市场问题还是运气问题。盲目重新买入可能重蹈覆辙。

## 相关概念

- [仓位管理](/k/position-sizing) — 止损和仓位管理配合使用，确定"买多少"
- [止盈](/k/take-profit) — 止盈是止损的"对称操作"
