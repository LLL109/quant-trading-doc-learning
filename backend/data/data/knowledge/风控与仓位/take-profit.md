---
slug: take-profit
title: 止盈
category: 风控与仓位
difficulty: 2
prerequisites: ["position-sizing"]
related: ["stop-loss"]
tags: ["止盈", "风控"]
---

# 止盈

> 止盈是在盈利达到目标时主动卖出的纪律，是将"纸面利润"变为"实际利润"的关键操作。

## 定义

止盈（Take-Profit）是当投资盈利达到预设目标时，主动卖出以锁定利润的操作。它回答的核心问题是：这笔交易赚多少才满意？

对程序员来说，止盈就像"缓存过期策略"——利润就像缓存中的数据，你需要在合适的时候"持久化"（卖出），而不是一直放在内存里（持有），因为内存可能随时被清空（市场回调）。

## 核心内容

### 为什么需要止盈？

1. **利润回吐**：不及时止盈，盈利可能变成亏损
2. **资金效率**：锁定利润后，资金可以投入新的机会
3. **心理因素**：及时获利了结能增强交易信心

### 常见的止盈方法

#### 1. 固定比例止盈

盈利达到买入价的X%时止盈，如+20%或+30%。

**优点**：简单明确
**缺点**：可能错过大行情

#### 2. 移动止盈（Trailing Stop）

以最高价回撤X%作为止盈位：

$$\text{止盈价} = \text{最高价} \times (1 - \text{回撤比例})$$

**优点**：能抓住趋势行情
**缺点**：在震荡市中可能被频繁触发

#### 3. 目标位止盈

根据技术分析（阻力位、目标涨幅）设定止盈位。

**优点**：有技术依据
**缺点**：目标位的判断有主观性

#### 4. 分批止盈

达到不同目标时分批卖出，如+15%卖1/3，+30%卖1/3，剩余持有。

**优点**：平衡锁定利润和追求收益
**缺点**：操作复杂

### 止盈与止损的配合

经典的盈亏比管理：

$$\text{盈亏比} = \frac{\text{止盈幅度}}{\text{止损幅度}}$$

通常建议盈亏比 > 2:1，即止盈目标至少是止损幅度的2倍。

## 计算公式

**固定比例止盈：**
$$\text{止盈价} = \text{买入价} \times (1 + \text{止盈比例})$$

**移动止盈：**
$$\text{止盈价} = \max(\text{历史最高价}) \times (1 - \text{回撤比例})$$

**盈亏比：**
$$\text{盈亏比} = \frac{\text{止盈价} - \text{买入价}}{\text{买入价} - \text{止损价}}$$

## Python 代码

```python
import pandas as pd
import numpy as np

def fixed_take_profit(entry_price, profit_pct=0.20):
    """固定比例止盈"""
    target_price = entry_price * (1 + profit_pct)
    return {
        '买入价': entry_price,
        '止盈价': target_price,
        '目标盈利': f'{profit_pct:.0%}',
    }

def trailing_stop_strategy(prices, trail_pct=0.10):
    """
    移动止盈策略

    Parameters:
    prices: 价格序列
    trail_pct: 回撤比例

    Returns:
    交易记录
    """
    trades = []
    position = None
    highest = 0

    for i in range(len(prices)):
        price = prices[i]

        if position is None:
            # 买入
            position = {'entry': price, 'entry_idx': i}
            highest = price
        else:
            # 更新最高价
            highest = max(highest, price)
            # 计算移动止盈价
            stop_price = highest * (1 - trail_pct)

            if price <= stop_price:
                # 触发止盈
                pnl = (price - position['entry']) / position['entry']
                trades.append({
                    'entry': position['entry'],
                    'exit': price,
                    'highest': highest,
                    'pnl': pnl,
                    'type': '移动止盈' if pnl > 0 else '移动止损'
                })
                position = None

    return pd.DataFrame(trades)

def calculate_risk_reward(entry, stop, target):
    """计算盈亏比"""
    risk = entry - stop
    reward = target - entry
    rr_ratio = reward / risk if risk > 0 else float('inf')
    return {
        '买入价': entry,
        '止损价': stop,
        '止盈价': target,
        '风险': f'{risk:.2f}',
        '收益': f'{reward:.2f}',
        '盈亏比': f'{rr_ratio:.1f}:1',
    }

# 使用示例
entry_price = 50

# 固定止盈
tp1 = fixed_take_profit(entry_price, profit_pct=0.20)
print("固定止盈：")
for k, v in tp1.items():
    print(f"  {k}: {v}")

# 盈亏比计算
rr = calculate_risk_reward(entry=50, stop=47, target=56)
print("\n盈亏比分析：")
for k, v in rr.items():
    print(f"  {k}: {v}")

# 移动止盈回测
np.random.seed(42)
prices = 50 * np.exp(np.cumsum(np.random.randn(100) * 0.02))
trades = trailing_stop_strategy(prices, trail_pct=0.08)
print(f"\n移动止盈交易统计：")
print(f"交易次数: {len(trades)}")
if not trades.empty:
    print(f"平均收益: {trades['pnl'].mean():.2%}")
    print(f"胜率: {(trades['pnl'] > 0).mean():.0%}")
```

## 常见误区

1. **"止盈太早"** — 赚一点就跑，错过了大行情。趋势行情中应该用移动止盈，让利润奔跑。
2. **"不止盈等翻倍"** — 贪心不足蛇吞象。达到合理目标就应该考虑止盈，至少应该上移止损保护利润。
3. **"止盈后立即买入"** — 止盈后应该冷静观察，不要急于寻找下一个机会。频繁交易会增加成本和犯错概率。

## 相关概念

- [止损](/k/stop-loss) — 止盈和止损是一对，需要配合使用
- [仓位管理](/k/position-sizing) — 仓位管理决定"买多少"，止盈止损决定"何时卖"
