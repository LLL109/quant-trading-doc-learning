---
slug: future-function
title: 未来函数
category: 回测
difficulty: 2
prerequisites: ["backtest-overview"]
related: ["overfitting", "backtest-overview", "quant-overview"]
tags: ["回测", "错误", "未来函数"]
---

# 未来函数

> 未来函数是指在回测中使用了当时不可能知道的信息，导致回测结果失真。

## 定义

未来函数（Future Function / Look-Ahead Bias）是指在策略回测中，使用了在实际交易时点不可能获得的信息。这会导致回测结果看起来很好，但实盘中完全无法复现。

类比：就像考试时偷看了答案再答题，成绩当然好，但这不代表你真的学会了。回测中的未来函数就是"偷看答案"。

## 核心内容

### 常见的未来函数错误

#### 1. 用当天收盘价在当天买入

这是最常见也最容易犯的错误：

```python
# 错误！用今天的收盘价决定今天的持仓
signal = (close > ma20)  # 今天的信号
position = signal         # 当天就持仓
```

问题：你在今天收盘前不可能知道今天的收盘价。正确做法是用今天的信号决定明天的持仓。

```python
# 正确：信号延迟一天执行
signal = (close > ma20)
position = signal.shift(1)  # 明天才持仓
```

#### 2. 用当天的最高/最低价做交易决策

```python
# 错误！如果今天最低价跌破止损线就卖出
if low.iloc[i] < stop_loss:
    sell_at = stop_loss  # 假设在止损价卖出
```

问题：你在盘中不知道今天的最低价是多少，只有收盘后才知道。实际执行时只能设止损单，不能"穿越"到最低点卖出。

#### 3. 使用未来的财务数据

```python
# 错误！用当前季度的财报数据做当前的交易决策
if pe_ratio < 15:  # PE 用的是当前季度的利润
    buy()
```

问题：财报有发布延迟（通常 1-3 个月），你不可能在季度初就知道这个季度的利润。

#### 4. 使用未来才知道的成分股

```python
# 错误！用现在的指数成分股回测过去
for stock in current_index_stocks:
    backtest(stock)
```

问题：指数成分股会调整，5 年前的成分股和现在不一样。用现在的成分股回测 5 年前的数据，就自动选中了"幸存者"。

#### 5. 用全量数据计算指标

```python
# 错误！用整个数据集的最大最小值做归一化
normalized = (data - data.min()) / (data.max() - data.min())
```

问题：你在第一天不可能知道未来的最大最小值。应该用滚动窗口的方式计算。

### 如何发现未来函数

1. **时间线检查**：逐行检查代码，问自己"在 t 时刻，这个数据真的能获得吗？"
2. **延迟测试**：把所有信号延迟一天执行，如果收益大幅下降，可能存在未来函数
3. **实时模拟**：用模拟交易跟踪策略，如果实盘和回测差距大，可能有未来函数
4. **代码审查**：让别人检查你的代码，自己容易当局者迷

### 未来函数 vs 过拟合

| 特性 | 未来函数 | 过拟合 |
|------|----------|--------|
| 本质 | 使用了不可能获得的数据 | 过度适配历史噪声 |
| 严重程度 | 致命错误 | 严重问题 |
| 实盘表现 | 完全无法复现 | 表现下降但可能仍有效 |
| 发现难度 | 相对容易（代码审查） | 较难（需要统计方法） |
| 修复方法 | 修正代码逻辑 | 简化策略、样本外测试 |

## Python 代码

```python
import pandas as pd
import numpy as np

def demonstrate_future_function():
    """演示未来函数的影响"""
    np.random.seed(42)
    n = 200
    dates = pd.date_range('2020-01-01', periods=n, freq='B')
    close = pd.Series(np.cumsum(np.random.randn(n) * 0.8) + 100, 
                      index=dates, name='close')
    
    # 策略：价格在均线上方时持有
    ma20 = close.rolling(20).mean()
    
    # 错误版本：用当天信号决定当天持仓（未来函数）
    signal_wrong = (close > ma20).astype(int)
    returns_wrong = signal_wrong * close.pct_change()
    
    # 正确版本：信号延迟一天执行
    signal_correct = (close > ma20).astype(int).shift(1)
    returns_correct = signal_correct * close.pct_change()
    
    cum_wrong = (1 + returns_wrong).prod() - 1
    cum_correct = (1 + returns_correct).prod() - 1
    
    print(f"错误版本（未来函数）收益: {cum_wrong:.2%}")
    print(f"正确版本（信号延迟）收益: {cum_correct:.2%}")
    print(f"差异: {cum_wrong - cum_correct:.2%}")
    print()
    print("差异说明：未来函数让回测收益虚高")

def check_signal_timing(signal, close):
    """
    检查信号是否存在时间偏移问题
    
    Parameters:
    signal: 信号序列（1=买入，0=卖出）
    close: 收盘价
    
    Returns:
    dict with analysis results
    """
    # 方法1：比较信号当天和次日的收益
    same_day_return = (signal * close.pct_change()).mean()
    next_day_return = (signal.shift(1) * close.pct_change()).mean()
    
    # 方法2：如果信号与当天收益高度相关，可能有未来函数
    correlation = signal.corr(close.pct_change())
    
    return {
        'same_day_return': f'{same_day_return:.6f}',
        'next_day_return': f'{next_day_return:.6f}',
        'signal_return_correlation': f'{correlation:.4f}',
        'potential_issue': abs(correlation) > 0.3
    }

def safe_backtest(close, signal_func, **kwargs):
    """
    安全的回测模板（避免未来函数）
    
    Parameters:
    close: 收盘价
    signal_func: 信号生成函数
    """
    # 1. 生成信号（可能使用历史数据）
    signal = signal_func(close, **kwargs)
    
    # 2. 关键：信号延迟一天执行
    position = signal.shift(1).fillna(0)
    
    # 3. 计算收益
    returns = position * close.pct_change()
    
    return pd.DataFrame({
        'signal': signal,
        'position': position,
        'return': returns,
        'cumulative': (1 + returns).cumprod()
    }, index=close.index)

# 使用示例
demonstrate_future_function()

print("\n--- 信号时序检查 ---")
close = pd.Series(np.cumsum(np.random.randn(200) * 0.8) + 100)
signal = (close > close.rolling(20).mean()).astype(int)
result = check_signal_timing(signal, close)
for k, v in result.items():
    print(f"  {k}: {v}")
```

## 常见误区

1. **我用了 shift(1) 就不会有未来函数** — shift(1) 可以解决"当天信号当天执行"的问题，但不能解决所有未来函数问题。比如用全量数据计算指标、用未来财报数据等，shift(1) 帮不了。
2. **回测框架自动处理了就不会有** — 很多回测框架确实会自动处理信号延迟，但用未来数据计算指标这种问题框架无法自动检测。
3. **未来函数会让收益更高** — 通常如此，但不是绝对的。有时候未来函数会让信号更"犹豫"（因为包含了反转信息），反而降低收益。关键是它让回测结果不可信。
4. **只有新手才会犯这个错误** — 未来函数非常隐蔽，即使是经验丰富的开发者也可能犯错。特别是在处理复权价格、成分股调整、财务数据时。

## 相关概念

- [过拟合](/k/overfitting) — 另一种回测陷阱
- [回测概述](/k/backtest-overview) — 回测的基本概念
- [量化交易概述](/k/quant-overview) — 量化交易的整体框架
