---
slug: etf-rotation
title: ETF轮动策略
category: 量化策略
difficulty: 2
prerequisites: ["etf", "momentum-rotation"]
related: ["momentum-rotation", "trend-following", "quant-overview"]
tags: ["ETF", "轮动", "入门策略"]
---

# ETF轮动策略

> ETF轮动是在几个ETF之间根据动量排名轮换持有，是最适合入门的量化策略之一。

## 定义

ETF轮动策略是动量轮动策略在ETF上的具体应用。从几个代表不同市场或行业的ETF中，选择近期表现最好的一个持有，定期调仓。如果所有ETF都在下跌，则切换到债券ETF避险。

类比：你有几个"赛道"可以选（科技、消费、医疗、债券），每隔一段时间看看哪个赛道跑得最快，就把钱放进去。

## 核心内容

### 为什么选 ETF

| 特性 | 优势 |
|------|------|
| 分散风险 | 一只 ETF 包含几十上百只股票 |
| 交易成本低 | 佣金低，无印花税（场内） |
| 流动性好 | 大部分主流 ETF 可以随时买卖 |
| 数据易获取 | 免费数据源即可获取历史行情 |
| 门槛低 | 最低几百元就能交易 |

### 经典 ETF 组合

#### A股入门组合

| ETF | 代码示例 | 跟踪指数 | 特点 |
|-----|----------|----------|------|
| 沪深300ETF | 510300 | 沪深300 | 大盘蓝筹 |
| 中证500ETF | 510500 | 中证500 | 中盘成长 |
| 创业板ETF | 159915 | 创业板指 | 科技成长 |
| 国债ETF | 511010 | 国债指数 | 避险资产 |

#### 进阶组合

加入更多行业ETF：消费、医药、新能源、半导体等，增加轮动空间。

### 策略逻辑（标准版）

```
每月底（或每 N 个交易日）：
1. 计算每个 ETF 过去 60 个交易日的收益率（动量）
2. 如果排名第一的 ETF 动量 > 0：
   → 持有该 ETF
3. 如果所有 ETF 动量都 ≤ 0：
   → 持有国债 ETF（避险）
```

### 参数选择指南

| 参数 | 推荐范围 | 说明 |
|------|----------|------|
| 动量周期 | 20-120天 | 60天最常用 |
| 调仓频率 | 5-40天 | 20天（月度）最常用 |
| ETF数量 | 3-10个 | 太少轮动空间小，太多分散过度 |

### 回测预期

基于历史数据（不保证未来）：
- 年化收益率：10-20%（取决于市场环境）
- 最大回撤：15-30%
- 胜率：40-55%（单次交易）
- 盈亏比：> 2（靠少数大赚覆盖多数小亏）

## Python 代码

```python
import pandas as pd
import numpy as np

def etf_rotation_strategy(prices, lookback=60, rebalance_days=20, bond_col=None):
    """
    ETF 轮动策略（标准版）
    
    Parameters:
    prices: DataFrame，每列是一个 ETF 的收盘价
    lookback: 动量周期，默认 60 天
    rebalance_days: 调仓间隔，默认 20 天
    bond_col: 债券 ETF 列名，None 则所有负动量时清仓
    
    Returns:
    dict with strategy results
    """
    etf_cols = [c for c in prices.columns if c != bond_col]
    
    # 计算动量
    momentum = prices[etf_cols].pct_change(periods=lookback)
    
    # 初始化持仓
    holdings = pd.Series(0, index=prices.index)
    selected = pd.Series(dtype=str, index=prices.index)
    
    # 调仓日
    rebalance_dates = prices.index[lookback::rebalance_days]
    
    current_hold = None
    for i, date in enumerate(prices.index):
        if date in rebalance_dates:
            mom = momentum.loc[date].dropna()
            if len(mom) == 0:
                continue
            
            best = mom.idxmax()
            best_mom = mom.max()
            
            if best_mom > 0:
                current_hold = best
            elif bond_col is not None:
                current_hold = bond_col
            else:
                current_hold = None
        
        if current_hold is not None:
            holdings.loc[date] = 1
            selected.loc[date] = current_hold
    
    # 计算收益
    returns = prices.pct_change()
    
    # 按持仓计算收益
    strategy_return = pd.Series(0, index=prices.index)
    for etf in prices.columns:
        mask = selected == etf
        strategy_return[mask] = returns.loc[mask, etf]
    
    # 持仓延迟一天（避免未来函数）
    strategy_return = strategy_return.shift(1)
    
    result = pd.DataFrame({
        'strategy_return': strategy_return,
        'cumulative_strategy': (1 + strategy_return).cumprod(),
        'selected_etf': selected
    }, index=prices.index)
    
    return result

def analyze_performance(result, risk_free_rate=0.03):
    """分析策略表现"""
    returns = result['strategy_return'].dropna()
    
    # 年化收益
    total_return = result['cumulative_strategy'].iloc[-1] - 1
    years = len(returns) / 250
    annual_return = (1 + total_return) ** (1/years) - 1
    
    # 年化波动率
    annual_vol = returns.std() * np.sqrt(250)
    
    # 夏普比率
    sharpe = (annual_return - risk_free_rate) / annual_vol
    
    # 最大回撤
    cummax = result['cumulative_strategy'].cummax()
    drawdown = (result['cumulative_strategy'] - cummax) / cummax
    max_drawdown = drawdown.min()
    
    return {
        'total_return': f'{total_return:.2%}',
        'annual_return': f'{annual_return:.2%}',
        'annual_volatility': f'{annual_vol:.2%}',
        'sharpe_ratio': f'{sharpe:.2f}',
        'max_drawdown': f'{max_drawdown:.2%}'
    }

# 使用示例
np.random.seed(42)
n = 500
dates = pd.date_range('2020-01-01', periods=n, freq='B')

# 模拟 3 个股票 ETF + 1 个债券 ETF
prices = pd.DataFrame(index=dates)
for name, drift in [('沪深300', 0.0003), ('中证500', 0.0002), ('创业板', 0.0004)]:
    r = np.random.randn(n) * 0.015 + drift
    prices[name] = 100 * np.exp(np.cumsum(r))

# 债券 ETF：低波动，稳定正收益
bond_r = np.random.randn(n) * 0.002 + 0.00015
prices['国债ETF'] = 100 * np.exp(np.cumsum(bond_r))

result = etf_rotation_strategy(prices, lookback=60, rebalance_days=20, bond_col='国债ETF')
metrics = analyze_performance(result)
print("策略表现:")
for k, v in metrics.items():
    print(f"  {k}: {v}")

print(f"\n最近持仓:")
print(result[['selected_etf', 'cumulative_strategy']].tail(10))
```

## 常见误区

1. **选的 ETF 越多越好** — ETF 太多会分散化过度，每个 ETF 仓位太小，轮动效果被稀释。3-6 个代表不同风格的 ETF 就足够了。
2. **只看收益不看回撤** — 一个年化 20% 但最大回撤 50% 的策略，不如年化 15% 但最大回撤 20% 的策略。回撤管理比追求高收益更重要。
3. **频繁调仓** — 调仓太频繁会增加交易成本，而且动量信号本身就需要一定时间才能体现。月度调仓通常是最优的平衡点。
4. **忽视债券切换** — 不做负动量保护的纯股票轮动，在熊市中可能回撤 40%+。加入债券切换可以大幅降低最大回撤。
5. **用回测收益做预期** — 历史回测不代表未来。市场环境变化后，策略表现可能与历史差异很大。保持合理预期很重要。

## 相关概念

- [动量轮动策略](/k/momentum-rotation) — ETF轮动的理论基础
- [趋势跟踪策略](/k/trend-following) — 另一种适合ETF的策略
- [ETF](/k/etf) — ETF的基础知识
