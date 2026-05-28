---
slug: first-rotation
title: ETF轮动实战
category: 入门路线
difficulty: 2
prerequisites: ["etf-rotation", "momentum-rotation"]
related: []
tags: ["入门", "ETF", "轮动", "实战"]
---

# ETF轮动实战

> ETF轮动是量化入门的最佳实战策略，简单、可执行、有学术支撑。

## 定义

ETF轮动实战是指实际动手实现一个ETF轮动策略，从数据获取到策略执行的完整流程。它回答的核心问题是：如何用代码实现一个可执行的ETF轮动策略？

对程序员来说，ETF轮动实战就像"做一个完整的Side Project"——不只是写代码，还要考虑数据、执行、监控等实际问题。

## 核心内容

### 为什么ETF轮动适合入门？

1. **品种简单**：ETF数量少，不需要处理海量股票
2. **流动性好**：主要ETF成交量大，滑点小
3. **分散风险**：ETF本身就是一篮子股票
4. **策略简单**：基于动量，逻辑清晰
5. **可执行**：每月调仓一次，不需要高频交易

### ETF轮动的核心逻辑

1. **选择标的池**：如沪深300ETF、创业板ETF、国债ETF等
2. **计算动量**：过去N日的收益率
3. **选择最强**：买入动量最强的1-2只ETF
4. **定期调仓**：每月或每季度调仓一次

### 实战注意事项

#### 1. 标的选择

| ETF类型 | 代表 | 特点 |
|---------|------|------|
| 大盘ETF | 510300（沪深300） | 稳定，波动小 |
| 小盘ETF | 159915（创业板） | 波动大，弹性强 |
| 行业ETF | 512010（医药） | 行业轮动 |
| 债券ETF | 511010（国债） | 低波动，避险 |
| 黄金ETF | 518880（黄金） | 避险资产 |

#### 2. 动量周期选择

| 周期 | 特点 | 适用场景 |
|------|------|----------|
| 20日 | 短期动量 | 灵敏但噪音多 |
| 60日 | 中期动量 | 平衡灵敏度和稳定性 |
| 120日 | 长期动量 | 稳定但滞后 |

#### 3. 调仓频率

- **月度调仓**：最常用，平衡交易成本和策略灵敏度
- **季度调仓**：交易成本最低，但可能错过趋势变化
- **周度调仓**：更灵敏，但交易成本高

## Python 代码

```python
import pandas as pd
import numpy as np

def etf_rotation_backtest():
    """
    ETF轮动策略实战

    使用模拟数据演示完整的ETF轮动流程
    """
    print("=" * 50)
    print("ETF轮动策略实战")
    print("=" * 50)

    # 第1步：准备数据
    print("\n第1步：准备ETF数据...")
    np.random.seed(42)
    n = 500
    dates = pd.date_range('2022-01-01', periods=n, freq='B')

    # 模拟3只ETF的数据
    etfs = {
        '沪深300ETF': 100 * np.exp(np.cumsum(np.random.randn(n) * 0.012)),
        '创业板ETF': 100 * np.exp(np.cumsum(np.random.randn(n) * 0.018)),
        '国债ETF': 100 * np.exp(np.cumsum(np.random.randn(n) * 0.005)),
    }

    data = pd.DataFrame(etfs, index=dates)
    print(f"  ETF数量: {len(etfs)}")
    print(f"  数据周期: {dates[0].strftime('%Y-%m-%d')} 到 {dates[-1].strftime('%Y-%m-%d')}")
    print(f"  ETF列表: {', '.join(etfs.keys())}")

    # 第2步：计算动量
    print("\n第2步：计算动量指标...")
    momentum_window = 60  # 60日动量
    momentum = data.pct_change(momentum_window)
    print(f"  动量周期: {momentum_window} 个交易日")

    # 第3步：生成轮动信号
    print("\n第3步：生成轮动信号...")
    # 每月第一个交易日调仓
    rebalance_dates = data.resample('MS').first().index
    rebalance_dates = [d for d in rebalance_dates if d in data.index]

    positions = pd.DataFrame(0, index=data.index, columns=data.columns)

    for date in rebalance_dates:
        if date in momentum.index:
            # 选择动量最强的ETF
            mom = momentum.loc[date].dropna()
            if len(mom) > 0:
                best_etf = mom.idxmax()
                positions.loc[date:, best_etf] = 1
                print(f"  {date.strftime('%Y-%m-%d')}: 选择 {best_etf} "
                      f"(动量={mom[best_etf]:.2%})")

    # 第4步：计算收益
    print("\n第4步：计算策略收益...")
    returns = data.pct_change()
    strategy_returns = (positions.shift(1) * returns).sum(axis=1)

    # 考虑交易成本
    trades = positions.diff().abs().sum(axis=1)
    cost = trades * 0.002  # 千二手续费
    strategy_returns -= cost

    # 计算净值
    initial_capital = 1000000
    strategy_equity = initial_capital * (1 + strategy_returns).cumprod()
    market_equity = initial_capital * (1 + returns.mean(axis=1)).cumprod()

    # 第5步：分析结果
    print("\n第5步：分析回测结果...")
    print("-" * 50)

    total_return = strategy_equity.iloc[-1] / initial_capital - 1
    market_return = market_equity.iloc[-1] / initial_capital - 1
    annual_return = (1 + total_return) ** (252 / len(data)) - 1
    annual_vol = strategy_returns.std() * np.sqrt(252)
    sharpe = annual_return / annual_vol if annual_vol > 0 else 0

    # 最大回撤
    peak = strategy_equity.cummax()
    drawdown = (strategy_equity - peak) / peak
    max_drawdown = drawdown.min()

    n_trades = int(trades.sum() / 2)

    print(f"  策略总收益: {total_return:.2%}")
    print(f"  市场总收益: {market_return:.2%}")
    print(f"  年化收益: {annual_return:.2%}")
    print(f"  年化波动率: {annual_vol:.2%}")
    print(f"  夏普比率: {sharpe:.2f}")
    print(f"  最大回撤: {max_drawdown:.2%}")
    print(f"  调仓次数: {n_trades}")

    print("\n" + "=" * 50)
    print("ETF轮动策略实战完成！")
    print("=" * 50)

    print("\n下一步建议：")
    print("  1. 用真实ETF数据（AKShare）替换模拟数据")
    print("  2. 尝试不同的动量周期（20/60/120日）")
    print("  3. 增加更多ETF品种（黄金、商品等）")
    print("  4. 添加趋势过滤器（如均线过滤）")
    print("  5. 优化调仓频率（周度/月度/季度）")

    return data, positions, strategy_equity

# 运行ETF轮动实战
data, positions, equity = etf_rotation_backtest()
```

## 常见误区

1. **"只看收益不看风险"** — ETF轮动策略的收益可能不如单只股票高，但风险也更低。要综合考虑风险调整后收益。
2. **"过度优化"** — 不要为了回测好看而过度优化参数。简单的策略往往更稳健。
3. **"忽略交易成本"** — ETF轮动需要定期调仓，交易成本会累积。要确保策略收益能覆盖交易成本。

## 相关概念

- [ETF轮动策略](/k/etf-rotation) — ETF轮动的理论基础
- [动量轮动策略](/k/momentum-rotation) — 动量轮动的原理和方法
