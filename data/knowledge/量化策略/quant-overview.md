---
slug: quant-overview
title: 量化交易概述
category: 量化策略
difficulty: 1
prerequisites: []
related: ["trend-following", "momentum-rotation", "backtest-overview"]
tags: ["入门", "概述", "量化交易"]
---

# 量化交易概述

> 量化交易是用数学模型和程序代码代替人脑做交易决策的方法。

## 定义

量化交易（Quantitative Trading）是指利用数学模型、统计分析和计算机程序来发现交易机会、执行交易决策的方式。核心思想是：把交易逻辑写成代码，让机器按照规则自动执行，排除人的情绪干扰。

对程序员来说，量化交易就是把"我觉得这只股票会涨"变成"当条件 A 且条件 B 且条件 C 同时满足时买入"。

## 核心内容

### 量化交易的完整流程

```
数据获取 → 数据清洗 → 策略开发 → 历史回测 → 风险控制 → 模拟交易 → 实盘交易
```

每个环节的含义：

1. **数据获取**：获取股票、ETF、期货的历史行情数据（OHLCV）
2. **数据清洗**：处理缺失值、复权价格、去除异常数据
3. **策略开发**：设计买卖规则（比如"MA20 上穿 MA60 买入"）
4. **历史回测**：用历史数据模拟策略表现，计算收益、回撤等指标
5. **风险控制**：设定止损、仓位管理、最大回撤限制
6. **模拟交易**：用实时行情但不真实下单，验证策略在当前市场的表现
7. **实盘交易**：真实资金交易

### 量化交易的核心优势

| 优势 | 说明 |
|------|------|
| 纪律性 | 严格按规则执行，不会因为恐惧或贪婪改变决策 |
| 可回测 | 任何策略都可以用历史数据验证 |
| 可复现 | 相同条件必然产生相同结果 |
| 高效率 | 可以同时监控数千只股票 |
| 可优化 | 可以系统性地调整参数和逻辑 |

### 量化交易的风险

| 风险 | 说明 |
|------|------|
| 过拟合 | 策略在历史数据上表现好，实盘不行 |
| 市场变化 | 过去有效的策略可能失效 |
| 技术风险 | 程序 bug、网络中断、数据错误 |
| 黑天鹅 | 极端事件可能超出模型预期 |
| 流动性 | 实际交易价格可能与回测假设不同 |

### 量化交易的主要类型

1. **趋势跟踪**：跟随趋势方向交易（均线策略、通道突破）
2. **均值回归**：价格偏离均值后回归（配对交易、布林带策略）
3. **统计套利**：利用统计关系的临时失衡获利
4. **高频交易**：毫秒级交易，需要极低延迟（不适合个人）
5. **机器学习**：用 ML 模型预测价格（需要大量数据和算力）

### 不适合新手的方向

- 高频交易（需要专业设备和数据源）
- 期权定价（需要深厚的数学功底）
- 统计套利（需要复杂的模型和快速执行）
- 机器学习预测（容易过拟合，需要大量经验）

**新手建议从趋势跟踪策略开始**，如均线策略、动量轮动，逻辑简单、容易理解。

## Python 代码

```python
# 量化交易的基本框架示例
import pandas as pd

def simple_ma_strategy(df, short_window=20, long_window=60):
    """
    最简单的均线策略框架
    
    Parameters:
    df: DataFrame，需包含 'close' 列
    short_window: 短期均线周期
    long_window: 长期均线周期
    
    Returns:
    DataFrame，增加信号和持仓列
    """
    df = df.copy()
    
    # 第1步：计算指标
    df['ma_short'] = df['close'].rolling(window=short_window).mean()
    df['ma_long'] = df['close'].rolling(window=long_window).mean()
    
    # 第2步：生成信号（1=买入，0=空仓，-1=卖出）
    df['signal'] = 0
    df.loc[df['ma_short'] > df['ma_long'], 'signal'] = 1  # 短均线在上→持有
    df.loc[df['ma_short'] <= df['ma_long'], 'signal'] = 0  # 短均线在下→空仓
    
    # 第3步：计算持仓（signal 从 0→1 是买入，从 1→0 是卖出）
    df['position'] = df['signal'].shift(1)  # 次日执行，避免未来函数
    
    # 第4步：计算策略收益
    df['market_return'] = df['close'].pct_change()
    df['strategy_return'] = df['position'] * df['market_return']
    
    # 第5步：计算累计收益
    df['cumulative_market'] = (1 + df['market_return']).cumprod()
    df['cumulative_strategy'] = (1 + df['strategy_return']).cumprod()
    
    return df

# 使用示例
import numpy as np
np.random.seed(42)
dates = pd.date_range('2020-01-01', periods=500, freq='B')
prices = pd.Series(np.cumsum(np.random.randn(500) * 0.8) + 100, index=dates, name='close')
df = pd.DataFrame({'close': prices})

result = simple_ma_strategy(df)

# 查看策略表现
total_return = result['cumulative_strategy'].iloc[-1] - 1
print(f"策略累计收益: {total_return:.2%}")
print(f"市场累计收益: {result['cumulative_market'].iloc[-1] - 1:.2%}")
```

## 常见误区

1. **量化交易就是"躺赚"** — 量化交易需要持续维护和优化。市场环境变化后，策略可能失效，需要不断迭代。
2. **回测收益高就是好策略** — 高回测收益很可能是过拟合的结果。真正的检验是样本外表现和实盘表现。
3. **越复杂越好** — 简单策略往往比复杂策略更稳健。复杂策略更容易过拟合，也更难维护和调试。
4. **量化交易不需要理解市场** — 量化只是工具，理解市场逻辑才能设计出好策略。盲目调参数不如理解为什么这个策略可能有效。

## 相关概念

- [趋势跟踪策略](/k/trend-following) — 最适合新手的量化策略类型
- [动量轮动策略](/k/momentum-rotation) — 经典的量化策略
- [回测概述](/k/backtest-overview) — 量化策略验证的核心环节
