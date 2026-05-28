---
slug: momentum-rotation
title: 动量轮动策略
category: 量化策略
difficulty: 2
prerequisites: ["return-rate"]
related: ["etf-rotation", "trend-following", "quant-overview"]
tags: ["动量", "轮动", "策略"]
---

# 动量轮动策略

> 动量轮动的核心假设是"强者恒强"，买入近期表现最好的资产，定期轮换。

## 定义

动量轮动策略（Momentum Rotation）是一种基于"动量效应"的资产配置策略。它从一组候选资产中，选择近期涨幅最大的（动量最强的）买入持有，每隔一段时间重新排名并调仓。

类比：就像选跑步比赛的选手——你押注最近几场比赛成绩最好的选手，认为他下场比赛大概率还是最强的。

## 核心内容

### 动量效应

动量效应（Momentum Effect）是金融学中被广泛验证的"异象"：

- 过去 3-12 个月表现好的股票/资产，未来 3-12 个月倾向于继续表现好
- 过去表现差的，未来倾向于继续差

这个效应在全球股市、商品市场、外汇市场都被观察到，是学术界认可度较高的市场规律之一。

### 策略逻辑

1. **选资产池**：选择一组可交易的资产（如行业ETF、大盘指数ETF）
2. **计算动量**：计算每个资产过去 N 天的收益率
3. **排名选择**：选择动量最强的 1 个或前几个资产
4. **买入持有**：买入选中的资产
5. **定期调仓**：每隔 M 天（如 20 天/月度）重新计算排名并调仓

### 动量周期选择

| 动量周期 | 特点 | 适用场景 |
|----------|------|----------|
| 20日（1个月） | 反应快，噪音多 | 短线轮动 |
| 60日（3个月） | 较平衡 | 常用选择 |
| 120日（6个月） | 更稳定，滞后大 | 中长线 |
| 250日（1年） | 非常稳定 | 长线配置 |

研究表明，3-12 个月的动量周期效果较好，太短（< 1个月）容易反转，太长（> 12个月）容易追在顶部。

### 负动量保护

动量策略的一个重要改进是"负动量保护"：

- 如果所有候选资产的动量都是负数（都在下跌），说明市场整体不好
- 此时应该空仓或切换到安全资产（如债券、货币基金）
- 这可以大幅减少在熊市中的回撤

### 调仓频率

- **每日调仓**：交易成本太高，不推荐
- **每周调仓**：较频繁，适合有交易条件的
- **每月调仓**：最常见的选择，平衡了信号更新和交易成本
- **每季度调仓**：更稳定，但可能错过快速变化

## 计算公式

$$Momentum_i = \frac{P_{t}^{(i)} - P_{t-N}^{(i)}}{P_{t-N}^{(i)}} = \frac{P_{t}^{(i)}}{P_{t-N}^{(i)}} - 1$$

其中：
- $P_t^{(i)}$：资产 $i$ 在第 $t$ 天的价格
- $N$：动量回看周期（如 60 天）
- $Momentum_i$：资产 $i$ 的 N 日动量（即 N 日收益率）

选择 $Momentum$ 最大的资产持有。

## Python 代码

```python
import pandas as pd
import numpy as np

def momentum_rotation(prices, lookback=60, top_n=1, rebalance_days=20):
    """
    动量轮动策略
    
    Parameters:
    prices: DataFrame，每列是一个资产的收盘价，索引是日期
    lookback: 动量回看周期，默认 60 天
    top_n: 选择动量最强的前 N 个资产，默认 1
    rebalance_days: 调仓间隔天数，默认 20 天（月度）
    
    Returns:
    DataFrame with portfolio returns and holdings
    """
    # 计算动量（过去 N 天收益率）
    momentum = prices.pct_change(periods=lookback)
    
    # 初始化持仓
    weights = pd.DataFrame(0, index=prices.index, columns=prices.columns)
    
    # 调仓日列表
    rebalance_dates = prices.index[lookback::rebalance_days]
    
    for date in rebalance_dates:
        if date not in momentum.index:
            continue
        
        # 获取当天的动量排名
        mom_today = momentum.loc[date].dropna()
        if len(mom_today) == 0:
            continue
        
        # 选择动量最强的 top_n 个
        top_assets = mom_today.nlargest(top_n).index
        weights.loc[date, top_assets] = 1.0 / top_n
    
    # 持仓向前填充
    weights = weights.replace(0, np.nan).ffill().fillna(0)
    
    # 计算策略收益
    returns = prices.pct_change()
    portfolio_return = (weights.shift(1) * returns).sum(axis=1)
    
    result = pd.DataFrame({
        'strategy_return': portfolio_return,
        'cumulative': (1 + portfolio_return).cumprod()
    }, index=prices.index)
    
    return result, weights

def momentum_with_bond_switch(prices, bond_returns, lookback=60, rebalance_days=20):
    """
    带债券切换的动量轮动策略（负动量保护）
    
    当所有资产动量都为负时，切换到债券
    """
    momentum = prices.pct_change(periods=lookback)
    
    weights = pd.DataFrame(0, index=prices.index, columns=prices.columns)
    bond_weight = pd.Series(0, index=prices.index)
    
    rebalance_dates = prices.index[lookback::rebalance_days]
    
    for date in rebalance_dates:
        if date not in momentum.index:
            continue
        
        mom_today = momentum.loc[date].dropna()
        if len(mom_today) == 0:
            continue
        
        # 检查是否有正动量的资产
        positive_mom = mom_today[mom_today > 0]
        
        if len(positive_mom) > 0:
            # 有正动量资产，选择最强的
            top_asset = positive_mom.idxmax()
            weights.loc[date, top_asset] = 1.0
        else:
            # 全部负动量，切换到债券
            bond_weight.loc[date] = 1.0
    
    # 填充
    weights = weights.replace(0, np.nan).ffill().fillna(0)
    bond_weight = bond_weight.replace(0, np.nan).ffill().fillna(0)
    
    returns = prices.pct_change()
    portfolio_return = (weights.shift(1) * returns).sum(axis=1) + bond_weight.shift(1) * bond_returns
    
    return portfolio_return

# 使用示例
np.random.seed(42)
n = 500
dates = pd.date_range('2020-01-01', periods=n, freq='B')

# 模拟 5 个不同行业 ETF
etf_names = ['沪深300', '中证500', '创业板', '消费', '科技']
prices = pd.DataFrame(index=dates)
for name in etf_names:
    returns = np.random.randn(n) * 0.015 + 0.0002
    prices[name] = 100 * np.exp(np.cumsum(returns))

result, holdings = momentum_rotation(prices, lookback=60, top_n=1)
print(f"策略累计收益: {result['cumulative'].iloc[-1]-1:.2%}")
print(f"\n最近10天持仓:")
print(holdings.tail(10))
```

## 常见误区

1. **动量策略就是追涨杀跌** — 虽然都是买涨的，但动量策略有严格的规则和风控，而散户的追涨杀跌往往受情绪驱动。动量策略的核心是"系统性地追随强者"。
2. **动量周期越短越好** — 太短的动量周期（如 5 天）容易遇到短期反转效应。学术研究显示 3-12 个月的动量效果最好。
3. **不需要负动量保护** — 没有债券切换的纯动量策略在熊市中会遭受严重回撤。加入"全负切债券"的规则可以大幅改善风险收益比。
4. **动量策略没有风险** — 动量策略最怕的是"动量崩溃"——市场风格突然逆转，强势股暴跌、弱势股暴涨。这种情况不常见但破坏力很大。

## 相关概念

- [ETF轮动策略](/k/etf-rotation) — 动量轮动在ETF上的具体应用
- [趋势跟踪策略](/k/trend-following) — 另一种追随趋势的方法
- [收益率](/k/return-rate) — 动量计算的基础
