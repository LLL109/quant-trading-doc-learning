---
slug: backtest-overview
title: 回测概述
category: 回测
difficulty: 1
prerequisites: ["quant-overview"]
related: ["overfitting", "future-function", "quant-overview"]
tags: ["回测", "入门", "验证"]
---

# 回测概述

> 回测是用历史数据模拟策略表现的过程，目的是发现策略的缺陷，而不是证明策略能赚钱。

## 定义

回测（Backtesting）是指把一套交易策略放到历史行情数据上"假装"执行一遍，看看如果过去这么做会赚多少钱（或亏多少钱）。它是量化交易开发中最重要的环节之一。

类比：回测就像飞机的风洞测试——在真正飞上天之前，先在实验室里模拟各种条件看看飞机能不能扛住。

## 核心内容

### 回测的目的

**回测的目的不是证明策略能赚钱，而是发现策略在什么情况下会亏钱。**

一个好的回测应该告诉你：
- 策略在牛市/熊市/震荡市中分别表现如何
- 最大回撤是多少，在什么时候发生
- 策略的收益来自哪里（哪些交易贡献了大部分利润）
- 策略在什么市场环境下会失效

### 回测的基本流程

```
1. 获取历史数据
   ↓
2. 定义策略规则（买卖条件）
   ↓
3. 按时间顺序逐日模拟
   - 检查今天是否触发买入/卖出信号
   - 计算持仓和收益
   ↓
4. 计算绩效指标
   ↓
5. 分析结果，改进策略
```

### 关键绩效指标

| 指标 | 含义 | 优秀标准 |
|------|------|----------|
| 年化收益率 | 每年的平均回报 | > 15% |
| 最大回撤 | 从最高点到最低点的最大跌幅 | < 20% |
| 夏普比率 | 承担单位风险获得的超额收益 | > 1.0 |
| 胜率 | 盈利交易占总交易的比例 | > 45% |
| 盈亏比 | 平均盈利 / 平均亏损 | > 1.5 |
| 年化波动率 | 收益率的标准差（年化） | 越低越好 |
| 交易次数 | 总共交易了多少次 | 不能太少 |

### 回测的常见陷阱

1. **未来函数**：使用了当时不可能知道的数据（详见 future-function）
2. **过拟合**：过度优化参数以适应历史数据（详见 overfitting）
3. **忽略交易成本**：佣金、印花税、滑点会显著影响收益
4. **幸存者偏差**：只用现在还在交易的股票，忽略了已退市的
5. **数据窥探**：反复在同一段数据上优化，导致隐性过拟合

### 回测框架要素

一个完整的回测需要考虑：

- **初始资金**：10 万？100 万？会影响仓位计算
- **手续费**：佣金率、印花税
- **滑点**：实际成交价与理论价的偏差
- **涨跌停限制**：A 股有 10%/20% 的涨跌停
- **分红复权**：需要使用复权价格
- **仓位管理**：满仓？半仓？分批建仓？

## Python 代码

```python
import pandas as pd
import numpy as np

class SimpleBacktest:
    """简单回测框架"""
    
    def __init__(self, initial_capital=100000, commission_rate=0.0003, 
                 stamp_tax=0.001, slippage=0.001):
        """
        Parameters:
        initial_capital: 初始资金
        commission_rate: 佣金率（单边）
        stamp_tax: 印花税（卖出时收取）
        slippage: 滑点（单边）
        """
        self.initial_capital = initial_capital
        self.commission_rate = commission_rate
        self.stamp_tax = stamp_tax
        self.slippage = slippage
    
    def run(self, close, signal):
        """
        运行回测
        
        Parameters:
        close: 收盘价序列
        signal: 信号序列（1=持有，0=空仓）
        
        Returns:
        DataFrame with backtest results
        """
        df = pd.DataFrame({'close': close, 'signal': signal})
        
        # 持仓（次日执行信号）
        df['position'] = df['signal'].shift(1).fillna(0)
        
        # 计算收益率
        df['market_return'] = df['close'].pct_change()
        df['strategy_return'] = df['position'] * df['market_return']
        
        # 计算交易成本
        df['trade'] = df['position'].diff().abs()  # 换仓比例
        df['cost'] = df['trade'] * (self.commission_rate + self.slippage)
        # 卖出时还有印花税
        sell_mask = df['position'].diff() < 0
        df.loc[sell_mask, 'cost'] += df.loc[sell_mask, 'trade'] * self.stamp_tax
        
        # 扣除成本后的策略收益
        df['net_return'] = df['strategy_return'] - df['cost']
        
        # 累计收益
        df['cumulative_market'] = (1 + df['market_return']).cumprod()
        df['cumulative_strategy'] = (1 + df['net_return']).cumprod()
        
        # 资金曲线
        df['capital'] = self.initial_capital * df['cumulative_strategy']
        
        return df
    
    def analyze(self, result):
        """分析回测结果"""
        returns = result['net_return'].dropna()
        
        total_return = result['cumulative_strategy'].iloc[-1] - 1
        years = len(returns) / 250
        annual_return = (1 + total_return) ** (1/years) - 1
        annual_vol = returns.std() * np.sqrt(250)
        sharpe = (annual_return - 0.03) / annual_vol if annual_vol > 0 else 0
        
        # 最大回撤
        cummax = result['cumulative_strategy'].cummax()
        drawdown = (result['cumulative_strategy'] - cummax) / cummax
        max_drawdown = drawdown.min()
        
        # 交易统计
        trades = result['trade'].sum() / 2  # 买卖各算一次
        
        return {
            'total_return': f'{total_return:.2%}',
            'annual_return': f'{annual_return:.2%}',
            'annual_volatility': f'{annual_vol:.2%}',
            'sharpe_ratio': f'{sharpe:.2f}',
            'max_drawdown': f'{max_drawdown:.2%}',
            'total_trades': int(trades)
        }

# 使用示例
np.random.seed(42)
n = 500
dates = pd.date_range('2020-01-01', periods=n, freq='B')
close = pd.Series(np.cumsum(np.random.randn(n) * 0.8) + 100, index=dates, name='close')

# 简单均线策略信号
ma20 = close.rolling(20).mean()
signal = (close > ma20).astype(int)

bt = SimpleBacktest(initial_capital=100000)
result = bt.run(close, signal)
metrics = bt.analyze(result)

print("回测结果:")
for k, v in metrics.items():
    print(f"  {k}: {v}")
```

## 常见误区

1. **回测收益高就是好策略** — 回测收益高很可能是过拟合的结果。真正重要的是样本外表现和策略逻辑是否合理。
2. **忽略交易成本** — 不计手续费和滑点的回测是自欺欺人。A 股买卖一次的综合成本约 0.15%-0.2%，频繁交易的策略会被成本拖垮。
3. **用收盘价回测日内交易** — 如果策略需要在盘中买卖，不能假设能在收盘价成交。需要使用分钟数据或至少考虑开盘价。
4. **交易次数太少** — 如果回测期间只有 5 次交易，结果完全没有统计意义。至少需要 50-100 次交易才能初步验证策略。

## 相关概念

- [过拟合](/k/overfitting) — 回测中最需要警惕的问题
- [未来函数](/k/future-function) — 回测中的致命错误
- [量化交易概述](/k/quant-overview) — 回测在量化流程中的位置
