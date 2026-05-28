---
slug: backtest-framework
title: Python回测框架
category: 回测
difficulty: 2
prerequisites: ["backtest-overview"]
related: ["quant-overview"]
tags: ["回测", "Python", "框架"]
---

# Python回测框架

> Python回测框架是量化策略开发的基础设施，帮助你快速验证策略想法。

## 定义

Python回测框架是用Python编写的、用于模拟策略历史表现的软件框架。它处理了数据管理、订单撮合、收益计算等繁琐细节，让你专注于策略逻辑本身。

对程序员来说，回测框架就像"单元测试框架"——你写策略逻辑（测试用例），框架帮你运行并给出结果（测试报告）。

## 核心内容

### 主流Python回测框架

| 框架 | 特点 | 适合人群 |
|------|------|----------|
| Backtrader | 功能全面，社区活跃 | 入门到进阶 |
| Zipline | Quantopian开源，工业级 | 有编程基础 |
| vnpy | 国产，支持实盘 | 国内交易者 |
| Backtest.py | 简洁轻量 | 快速验证想法 |
| 自研框架 | 完全可控 | 有经验的开发者 |

### 回测框架的核心组件

```
┌─────────────┐
│   数据管理   │ ← 获取、清洗、存储历史数据
├─────────────┤
│   策略引擎   │ ← 执行你的交易逻辑
├─────────────┤
│   订单撮合   │ ← 模拟真实交易（考虑滑点、手续费）
├─────────────┤
│   风控模块   │ ← 仓位限制、止损止盈
├─────────────┤
│   绩效分析   │ ← 计算收益、夏普、回撤等指标
└─────────────┘
```

### 回测的关键参数

| 参数 | 说明 | 建议值 |
|------|------|--------|
| 初始资金 | 模拟的起始资金 | 100万 |
| 手续费 | 每笔交易的费用 | 万2.5 |
| 印花税 | 卖出时的税 | 千1 |
| 滑点 | 实际成交价与预期的偏差 | 1-2个tick |
| 基准 | 用于比较的基准 | 沪深300 |

## Python 代码

```python
import pandas as pd
import numpy as np

class SimpleBacktest:
    """简单回测框架"""

    def __init__(self, initial_capital=1000000, commission=0.00025,
                 slippage=0.001):
        self.initial_capital = initial_capital
        self.commission = commission
        self.slippage = slippage

    def run(self, data, signal):
        """
        运行回测

        Parameters:
        data: DataFrame with 'close' column
        signal: Series with 1(买入), -1(卖出), 0(持有)

        Returns:
        DataFrame with backtest results
        """
        df = data.copy()
        df['signal'] = signal
        df['position'] = df['signal'].shift(1).fillna(0)

        # 计算收益
        df['market_return'] = df['close'].pct_change()
        df['strategy_return'] = df['position'] * df['market_return']

        # 考虑交易成本
        df['trade'] = df['position'].diff().abs()
        df['cost'] = df['trade'] * (self.commission + self.slippage)
        df['strategy_return'] -= df['cost']

        # 计算净值
        df['market_equity'] = self.initial_capital * (1 + df['market_return']).cumprod()
        df['strategy_equity'] = self.initial_capital * (1 + df['strategy_return']).cumprod()

        return df

    def analyze(self, results):
        """分析回测结果"""
        strategy_returns = results['strategy_return'].dropna()
        market_returns = results['market_return'].dropna()

        # 计算关键指标
        total_return = results['strategy_equity'].iloc[-1] / self.initial_capital - 1
        annual_return = (1 + total_return) ** (252 / len(strategy_returns)) - 1
        annual_vol = strategy_returns.std() * np.sqrt(252)
        sharpe = annual_return / annual_vol if annual_vol > 0 else 0

        # 最大回撤
        equity = results['strategy_equity']
        peak = equity.cummax()
        drawdown = (equity - peak) / peak
        max_drawdown = drawdown.min()

        # 胜率
        trades = strategy_returns[strategy_returns != 0]
        win_rate = (trades > 0).mean() if len(trades) > 0 else 0

        return {
            '总收益': f'{total_return:.2%}',
            '年化收益': f'{annual_return:.2%}',
            '年化波动率': f'{annual_vol:.2%}',
            '夏普比率': f'{sharpe:.2f}',
            '最大回撤': f'{max_drawdown:.2%}',
            '胜率': f'{win_rate:.2%}',
            '交易次数': int(results['trade'].sum() / 2),
        }

# 使用示例
def ma_crossover_strategy(data, short_window=20, long_window=60):
    """均线交叉策略信号"""
    ma_short = data['close'].rolling(short_window).mean()
    ma_long = data['close'].rolling(long_window).mean()
    signal = (ma_short > ma_long).astype(int)
    return signal

# 生成模拟数据
np.random.seed(42)
n = 500
dates = pd.date_range('2022-01-01', periods=n, freq='B')
close = 100 * np.exp(np.cumsum(np.random.randn(n) * 0.015))
data = pd.DataFrame({'close': close}, index=dates)

# 运行回测
bt = SimpleBacktest(initial_capital=1000000, commission=0.00025, slippage=0.001)
signal = ma_crossover_strategy(data)
results = bt.run(data, signal)
analysis = bt.analyze(results)

print("回测结果：")
for k, v in analysis.items():
    print(f"  {k}: {v}")
```

## 常见误区

1. **"回测赚钱实盘就赚钱"** — 回测是理想化的模拟，实盘有更多不确定性（流动性、极端行情、系统故障）。回测结果需要打折看待。
2. **"忽略交易成本"** — 高频策略的交易成本可能吃掉大部分利润。回测时一定要考虑手续费、滑点、印花税。
3. **"框架越复杂越好"** — 对于学习和验证想法，简单框架就够了。过于复杂的框架可能让你花更多时间在框架上而不是策略上。

## 相关概念

- [回测概览](/k/backtest-overview) — 回测框架是回测的工具载体
- [量化系统架构](/k/quant-system) — 回测框架是量化系统的核心组件
