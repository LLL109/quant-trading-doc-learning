---
slug: trading-costs
title: 交易成本
category: 风控与仓位
difficulty: 2
prerequisites: []
related: ["backtest-overview"]
tags: ["交易成本", "手续费", "滑点"]
---

# 交易成本

> 交易成本是每次买卖股票必须支付的费用，是量化策略收益的"隐形杀手"。

## 定义

交易成本（Trading Costs）是进行股票交易时产生的各种费用，包括手续费、印花税、滑点等。它回答的核心问题是：这笔交易的真实成本是多少？

对程序员来说，交易成本就像"API调用费用"——每次调用都有成本，调用次数越多，总成本越高。如果你的"API"调用太频繁，可能赚的钱还不够付费用。

## 核心内容

### A股交易成本构成

| 费用类型 | 比例 | 说明 |
|----------|------|------|
| 券商佣金 | 万2.5（最低5元） | 买卖都收 |
| 印花税 | 千1 | 只卖出时收 |
| 过户费 | 十万分之一 | 买卖都收 |
| 滑点 | 1-2个tick | 隐性成本 |

### 交易成本的计算

假设买入10万元股票，再卖出：

**买入成本：**
- 佣金：100000 × 0.00025 = 25元
- 过户费：100000 × 0.00001 = 1元
- 买入成本合计：26元

**卖出成本：**
- 佣金：100000 × 0.00025 = 25元
- 印花税：100000 × 0.001 = 100元
- 过户费：100000 × 0.00001 = 1元
- 卖出成本合计：126元

**总成本：152元，占资金的0.152%**

### 交易成本对策略的影响

| 换手率（月） | 年交易成本 | 对年化收益的影响 |
|--------------|------------|------------------|
| 100% | 1.8% | 减少1.8% |
| 200% | 3.6% | 减少3.6% |
| 500% | 9.0% | 减少9.0% |
| 1000% | 18.0% | 减少18.0% |

高换手率策略必须有足够的alpha来覆盖交易成本。

### 滑点的估算

滑点是由于市场流动性不足导致的实际成交价与预期价格的偏差：

- **小盘股**：滑点可能达到0.3%-0.5%
- **大盘股**：滑点通常在0.05%-0.1%
- **涨停/跌停**：可能无法成交

## 计算公式

**单次交易成本：**
$$\text{成本} = \text{成交金额} \times (\text{佣金率} + \text{印花税率} + \text{过户费率} + \text{滑点率})$$

**年化交易成本：**
$$\text{年化成本} = \text{单次成本率} \times 2 \times \text{月换手率} \times 12$$

**盈亏平衡换手率：**
$$\text{最大换手率} = \frac{\text{预期年化alpha}}{\text{单次成本率} \times 2 \times 12}$$

## Python 代码

```python
import numpy as np

def calculate_trading_cost(amount, commission_rate=0.00025,
                           stamp_tax_rate=0.001, transfer_rate=0.00001,
                           slippage_rate=0.001, is_sell=False):
    """
    计算交易成本

    Parameters:
    amount: 成交金额
    commission_rate: 佣金费率
    stamp_tax_rate: 印花税率（仅卖出）
    transfer_rate: 过户费率
    slippage_rate: 滑点率
    is_sell: 是否为卖出

    Returns:
    成本明细
    """
    commission = max(amount * commission_rate, 5)  # 最低5元
    stamp_tax = amount * stamp_tax_rate if is_sell else 0
    transfer_fee = amount * transfer_rate
    slippage = amount * slippage_rate
    total = commission + stamp_tax + transfer_fee + slippage

    return {
        '佣金': commission,
        '印花税': stamp_tax,
        '过户费': transfer_fee,
        '滑点': slippage,
        '总成本': total,
        '成本率': f'{total / amount:.4%}',
    }

def annual_cost_impact(monthly_turnover, cost_per_trade=0.0015):
    """
    计算年化交易成本影响

    Parameters:
    monthly_turnover: 月换手率（如2.0表示月换手200%）
    cost_per_trade: 单次交易成本率

    Returns:
    年化成本
    """
    # 每次换仓包含买入和卖出
    annual_cost = monthly_turnover * 12 * cost_per_trade * 2
    return annual_cost

def breakeven_alpha(cost_per_trade, monthly_turnover):
    """计算盈亏平衡所需的alpha"""
    return annual_cost_impact(monthly_turnover, cost_per_trade)

# 使用示例
print("交易成本计算示例：")
print("=" * 40)

# 买入成本
buy_cost = calculate_trading_cost(100000, is_sell=False)
print(f"\n买入10万元：")
for k, v in buy_cost.items():
    print(f"  {k}: {v:.2f}" if isinstance(v, float) else f"  {k}: {v}")

# 卖出成本
sell_cost = calculate_trading_cost(100000, is_sell=True)
print(f"\n卖出10万元：")
for k, v in sell_cost.items():
    print(f"  {k}: {v:.2f}" if isinstance(v, float) else f"  {k}: {v}")

# 年化成本影响
print("\n年化交易成本影响：")
for turnover in [1, 2, 5, 10]:
    cost = annual_cost_impact(turnover)
    print(f"  月换手{turnover*100:.0f}%: 年化成本 {cost:.2%}")

# 盈亏平衡分析
print("\n盈亏平衡所需alpha：")
for turnover in [1, 2, 5]:
    alpha = breakeven_alpha(0.0015, turnover)
    print(f"  月换手{turnover*100:.0f}%: 需要 {alpha:.2%} 的年化alpha")
```

## 常见误区

1. **"忽略滑点"** — 回测时只算手续费不算滑点，会导致实盘收益低于回测。特别是小盘股策略，滑点可能比手续费还大。
2. **"低估交易频率"** — 看似单次成本不高，但高频交易累积起来很可观。月换手500%的策略，年化交易成本可能高达9%。
3. **"追求最低佣金"** — 佣金只是交易成本的一部分，印花税和滑点才是大头。不要为了省佣金而选择不靠谱的小券商。

## 相关概念

- [回测概览](/k/backtest-overview) — 交易成本是回测必须考虑的因素
