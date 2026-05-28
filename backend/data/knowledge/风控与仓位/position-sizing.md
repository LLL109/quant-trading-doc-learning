---
slug: position-sizing
title: 仓位管理
category: 风控与仓位
difficulty: 2
prerequisites: []
related: ["stop-loss", "drawdown-control"]
tags: ["仓位", "资金管理", "风控"]
---

# 仓位管理

> 仓位管理决定"买多少"，是风控体系中最核心的环节，比"买什么"更重要。

## 定义

仓位管理（Position Sizing）是决定每笔交易投入多少资金的学问。它回答的核心问题是：在确定了要买什么之后，应该买多少？

对程序员来说，仓位管理就像"资源分配算法"——你有有限的资源（资金），需要合理分配到不同的任务（股票）上，既要追求收益，又要控制风险。

## 核心内容

### 仓位管理的重要性

假设你有100万本金：
- 买10万，亏50% → 亏5万（总资金的5%）
- 买50万，亏50% → 亏25万（总资金的25%）
- 买100万，亏50% → 亏50万（总资金的50%）

同样的选股，不同的仓位，结果天壤之别。

### 常见的仓位管理方法

#### 1. 固定仓位法

每只股票投入固定比例的资金，如每只股票最多10%。

**优点**：简单易执行
**缺点**：不考虑个股风险差异

#### 2. 固定风险法（凯利公式的简化版）

根据止损幅度决定仓位：

$$\text{仓位} = \frac{\text{可承受亏损金额}}{\text{买入价} - \text{止损价}}$$

例如：可承受亏2万，买入价100元，止损价90元：
$$\text{仓位} = \frac{20000}{100 - 90} = 2000股$$

**优点**：每笔交易风险固定
**缺点**：需要明确止损位

#### 3. 波动率倒数法

波动率高的股票给低仓位，波动率低的给高仓位：

$$\text{仓位} \propto \frac{1}{\sigma}$$

**优点**：风险均衡
**缺点**：波动率会变化

#### 4. 凯利公式

$$f^* = \frac{bp - q}{b}$$

其中：b=盈亏比，p=胜率，q=1-p

**优点**：数学上最优
**缺点**：参数估计困难，实际中通常用半凯利

### 仓位管理的纪律

1. **单只股票不超过总资金的20%**：避免单只股票暴雷
2. **同一行业不超过总资金的30%**：避免行业系统性风险
3. **总仓位根据市场环境调整**：牛市可满仓，熊市控制在50%以下

## Python 代码

```python
import numpy as np

def fixed_risk_sizing(capital, risk_per_trade, entry_price, stop_price):
    """
    固定风险法仓位计算

    Parameters:
    capital: 总资金
    risk_per_trade: 每笔交易可承受的风险比例（如0.02表示2%）
    entry_price: 买入价
    stop_price: 止损价

    Returns:
    仓位信息
    """
    risk_amount = capital * risk_per_trade
    risk_per_share = abs(entry_price - stop_price)
    shares = int(risk_amount / risk_per_share / 100) * 100  # 取整到100股
    position_value = shares * entry_price
    position_ratio = position_value / capital

    return {
        '买入股数': shares,
        '买入金额': position_value,
        '仓位比例': f'{position_ratio:.2%}',
        '风险金额': risk_amount,
    }

def volatility_sizing(capital, target_vol, stock_vol, stock_price):
    """
    波动率倒数法仓位计算

    Parameters:
    capital: 总资金
    target_vol: 目标组合波动率
    stock_vol: 个股波动率
    stock_price: 股价

    Returns:
    仓位信息
    """
    weight = target_vol / stock_vol
    position_value = capital * weight
    shares = int(position_value / stock_price / 100) * 100

    return {
        '权重': f'{weight:.2%}',
        '买入股数': shares,
        '买入金额': shares * stock_price,
    }

def kelly_sizing(capital, win_rate, win_loss_ratio, kelly_fraction=0.5):
    """
    凯利公式仓位计算

    Parameters:
    capital: 总资金
    win_rate: 胜率
    win_loss_ratio: 盈亏比
    kelly_fraction: 凯利分数（通常用0.5即半凯利）

    Returns:
    仓位信息
    """
    kelly = (win_rate * win_loss_ratio - (1 - win_rate)) / win_loss_ratio
    kelly = max(0, kelly)  # 不能为负
    adjusted_kelly = kelly * kelly_fraction

    return {
        '凯利比例': f'{kelly:.2%}',
        '调整后比例': f'{adjusted_kelly:.2%}',
        '建议仓位': f'{min(adjusted_kelly, 0.25):.2%}',  # 上限25%
    }

# 使用示例
capital = 1000000  # 100万

# 固定风险法
result1 = fixed_risk_sizing(capital, risk_per_trade=0.02,
                             entry_price=100, stop_price=95)
print("固定风险法：")
for k, v in result1.items():
    print(f"  {k}: {v}")

# 波动率法
result2 = volatility_sizing(capital, target_vol=0.15, stock_vol=0.30,
                             stock_price=100)
print("\n波动率法：")
for k, v in result2.items():
    print(f"  {k}: {v}")

# 凯利公式
result3 = kelly_sizing(capital, win_rate=0.6, win_loss_ratio=2)
print("\n凯利公式：")
for k, v in result3.items():
    print(f"  {k}: {v}")
```

## 常见误区

1. **"满仓干一只"** — 这是赌博不是投资。即使你非常看好一只股票，也可能出现黑天鹅事件（财务造假、政策突变等）。
2. **"越跌越买"** — 不控制仓位的"抄底"可能让你越陷越深。需要有明确的加仓计划和止损纪律。
3. **"忽略总仓位"** — 单只股票仓位控制得好，但总仓位过高（如满仓10只股票），在市场系统性下跌时同样会亏损严重。

## 相关概念

- [止损](/k/stop-loss) — 仓位管理需要配合止损使用
- [回撤控制](/k/drawdown-control) — 仓位管理是控制回撤的核心手段
