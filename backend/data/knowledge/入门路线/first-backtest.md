---
slug: first-backtest
title: 第一个回测
category: 入门路线
difficulty: 2
prerequisites: ["ma", "backtest-overview"]
related: []
tags: ["入门", "回测", "实战"]
---

# 第一个回测

> 第一个回测是量化投资的"Hello World"，标志着你从理论走向实践。

## 定义

第一个回测是指初学者完成的第一个完整的策略回测，通常是一个简单的均线策略。它回答的核心问题是：如何用代码验证一个交易策略在过去的表现？

对程序员来说，第一个回测就像"Hello World程序"——它不是为了创造价值，而是为了走通整个流程，建立信心。

## 核心内容

### 第一个回测的目标

1. **走通流程**：从数据获取到结果输出的完整流程
2. **理解回测**：理解回测的基本原理和常见陷阱
3. **建立信心**：证明你有能力用代码验证策略

### 推荐的第一个策略：均线交叉

**策略逻辑**：
- 短期均线（如MA20）上穿长期均线（如MA60）→ 买入
- 短期均线下穿长期均线 → 卖出

**为什么选这个策略？**
1. 逻辑简单，容易理解
2. 代码实现简单
3. 有明确的买卖信号
4. 是趋势跟踪的基础

### 回测的完整步骤

```
1. 获取数据
   ↓
2. 计算指标（均线）
   ↓
3. 生成信号（金叉/死叉）
   ↓
4. 计算收益
   ↓
5. 分析结果
```

### 第一个回测的注意事项

1. **不要追求完美**：第一个回测的目标是走通流程，不是创造完美的策略
2. **不要过度优化**：不要花太多时间调参数，先理解原理
3. **注意交易成本**：回测时要考虑手续费和滑点
4. **理解结果含义**：知道夏普比率、最大回撤等指标的含义

## Python 代码

```python
import pandas as pd
import numpy as np

def first_backtest():
    """
    第一个回测：均线交叉策略

    这是量化投资的"Hello World"
    """
    print("=" * 50)
    print("我的第一个量化回测")
    print("=" * 50)

    # 第1步：获取数据（使用模拟数据）
    print("\n第1步：生成模拟数据...")
    np.random.seed(42)
    n = 500
    dates = pd.date_range('2022-01-01', periods=n, freq='B')
    close = 100 * np.exp(np.cumsum(np.random.randn(n) * 0.015))
    data = pd.DataFrame({'close': close}, index=dates)
    print(f"  数据量: {len(data)} 个交易日")

    # 第2步：计算指标
    print("\n第2步：计算均线指标...")
    short_window = 20
    long_window = 60
    data['ma_short'] = data['close'].rolling(short_window).mean()
    data['ma_long'] = data['close'].rolling(long_window).mean()
    print(f"  短期均线: MA{short_window}")
    print(f"  长期均线: MA{long_window}")

    # 第3步：生成信号
    print("\n第3步：生成交易信号...")
    data['signal'] = 0
    data.loc[data['ma_short'] > data['ma_long'], 'signal'] = 1  # 金叉买入
    data.loc[data['ma_short'] <= data['ma_long'], 'signal'] = 0  # 死叉卖出

    # 统计交易次数
    data['trade'] = data['signal'].diff().abs()
    n_trades = int(data['trade'].sum() / 2)
    print(f"  总交易次数: {n_trades} 次")

    # 第4步：计算收益
    print("\n第4步：计算策略收益...")
    data['position'] = data['signal'].shift(1)  # 次日执行
    data['market_return'] = data['close'].pct_change()
    data['strategy_return'] = data['position'] * data['market_return']

    # 考虑交易成本（万2.5手续费 + 千1印花税）
    commission = 0.00025
    stamp_tax = 0.001
    data['cost'] = data['trade'] * (commission + stamp_tax)
    data['strategy_return'] -= data['cost']

    # 计算净值
    data['market_equity'] = 1000000 * (1 + data['market_return']).cumprod()
    data['strategy_equity'] = 1000000 * (1 + data['strategy_return']).cumprod()

    # 第5步：分析结果
    print("\n第5步：分析回测结果...")
    print("-" * 50)

    total_return = data['strategy_equity'].iloc[-1] / 1000000 - 1
    market_return = data['market_equity'].iloc[-1] / 1000000 - 1
    annual_return = (1 + total_return) ** (252 / len(data)) - 1
    annual_vol = data['strategy_return'].std() * np.sqrt(252)
    sharpe = annual_return / annual_vol if annual_vol > 0 else 0

    # 最大回撤
    equity = data['strategy_equity']
    peak = equity.cummax()
    drawdown = (equity - peak) / peak
    max_drawdown = drawdown.min()

    print(f"  策略总收益: {total_return:.2%}")
    print(f"  市场总收益: {market_return:.2%}")
    print(f"  年化收益: {annual_return:.2%}")
    print(f"  年化波动率: {annual_vol:.2%}")
    print(f"  夏普比率: {sharpe:.2f}")
    print(f"  最大回撤: {max_drawdown:.2%}")
    print(f"  交易次数: {n_trades}")

    print("\n" + "=" * 50)
    print("恭喜！你完成了第一个量化回测！")
    print("=" * 50)

    print("\n下一步建议：")
    print("  1. 尝试不同的均线参数（如10/30, 20/60）")
    print("  2. 用真实数据（AKShare）替换模拟数据")
    print("  3. 尝试其他策略（如RSI、布林带）")
    print("  4. 添加止损止盈逻辑")

    return data

# 运行第一个回测
result = first_backtest()
```

## 常见误区

1. **"第一次就要做出赚钱的策略"** — 第一个回测的目标是学习，不是赚钱。即使策略亏钱，只要走通了流程就是成功。
2. **"过度优化参数"** — 不要花太多时间在参数优化上。先理解原理，再优化细节。
3. **"忽略交易成本"** — 不算交易成本的回测结果是虚假的。一定要加上手续费、印花税、滑点。

## 相关概念

- [均线](/k/ma) — 第一个回测通常使用均线策略
- [回测概览](/k/backtest-overview) — 理解回测的基本概念
