---
slug: walk-forward
title: Walk-forward验证
category: 回测
difficulty: 3
prerequisites: ["backtest-overview"]
related: ["overfitting"]
tags: ["回测方法", "Walk-forward", "验证"]
---

# Walk-forward验证

> Walk-forward验证是通过滚动窗口的方式训练和测试策略，模拟真实的"先学习后预测"过程。

## 定义

Walk-forward验证（Walk-Forward Optimization，WFO）是一种防止过拟合的回测方法。它将历史数据分成多个"训练窗口"和"测试窗口"，在训练窗口上优化参数，在测试窗口上验证效果，然后向前滚动，重复这个过程。

对程序员来说，Walk-forward就像"交叉验证的时间序列版"——但不能随机打乱顺序，因为时间序列有先后关系。

## 核心内容

### 标准Walk-forward流程

```
数据: |----训练1----|--测试1--|----训练2----|--测试2--|----训练3----|--测试3--|
时间: 2018        2020      2020        2022      2022        2024
```

1. 在训练窗口1上优化参数，得到最优参数A
2. 用参数A在测试窗口1上回测，记录结果
3. 在训练窗口2上优化参数，得到最优参数B
4. 用参数B在测试窗口2上回测，记录结果
5. 重复...
6. 汇总所有测试窗口的结果作为策略的真实表现

### Walk-forward的优势

1. **防止过拟合**：参数是在训练集上优化的，测试集是"未见过"的数据
2. **模拟真实交易**：你不可能知道未来的数据，Walk-forward模拟了这种不确定性
3. **参数自适应**：每个时期使用不同的最优参数，适应市场变化

### Walk-forward的变体

| 变体 | 说明 | 适用场景 |
|------|------|----------|
| 滚动窗口 | 训练窗口固定长度，向前滚动 | 市场变化快 |
| 扩展窗口 | 训练窗口从起点开始，逐步扩展 | 数据量少 |
| 固定窗口 | 训练和测试窗口长度固定 | 标准做法 |

### Walk-forward与其他验证方法

| 方法 | 说明 | 问题 |
|------|------|------|
| 全样本回测 | 用全部数据回测 | 严重过拟合 |
| 简单划分 | 前80%训练，后20%测试 | 只有一次测试 |
| Walk-forward | 滚动训练和测试 | 计算量大但更可靠 |

## 计算公式

**Walk-forward效率（WFE）：**
$$\text{WFE} = \frac{\text{OOS收益}}{\text{IS收益}}$$

其中：
- OOS（Out-of-Sample）：样本外（测试集）收益
- IS（In-Sample）：样本内（训练集）收益

WFE > 50% 通常被认为是可接受的。

## Python 代码

```python
import pandas as pd
import numpy as np

def walk_forward_validation(data, strategy_func, optimize_func,
                            train_window=252, test_window=63, step=63):
    """
    Walk-forward验证框架

    Parameters:
    data: DataFrame with price data
    strategy_func: 策略函数，接受(data, params)返回收益
    optimize_func: 参数优化函数，接受(data)返回最优参数
    train_window: 训练窗口长度（交易日）
    test_window: 测试窗口长度
    step: 向前滚动步长

    Returns:
    DataFrame with OOS results
    """
    results = []
    n = len(data)

    start = 0
    while start + train_window + test_window <= n:
        # 划分训练集和测试集
        train_end = start + train_window
        test_end = train_end + test_window

        train_data = data.iloc[start:train_end]
        test_data = data.iloc[train_end:test_end]

        # 在训练集上优化参数
        best_params = optimize_func(train_data)

        # 在测试集上验证
        test_returns = strategy_func(test_data, best_params)

        results.append({
            'train_start': train_data.index[0],
            'train_end': train_data.index[-1],
            'test_start': test_data.index[0],
            'test_end': test_data.index[-1],
            'params': best_params,
            'test_return': (1 + test_returns).prod() - 1,
            'test_sharpe': test_returns.mean() / test_returns.std() * np.sqrt(252)
                if test_returns.std() > 0 else 0,
        })

        start += step

    return pd.DataFrame(results)

# 简单的均值回归策略
def mean_reversion_strategy(data, params):
    """均值回归策略"""
    window = params['window']
    threshold = params['threshold']

    ma = data['close'].rolling(window).mean()
    std = data['close'].rolling(window).std()
    z_score = (data['close'] - ma) / std

    signal = pd.Series(0, index=data.index)
    signal[z_score < -threshold] = 1    # 超卖买入
    signal[z_score > threshold] = -1    # 超买卖出

    position = signal.shift(1)
    returns = data['close'].pct_change() * position
    return returns.fillna(0)

def optimize_params(data):
    """参数优化（网格搜索）"""
    best_sharpe = -np.inf
    best_params = None

    for window in [10, 20, 30]:
        for threshold in [1.5, 2.0, 2.5]:
            params = {'window': window, 'threshold': threshold}
            returns = mean_reversion_strategy(data, params)
            sharpe = returns.mean() / returns.std() * np.sqrt(252) if returns.std() > 0 else 0

            if sharpe > best_sharpe:
                best_sharpe = sharpe
                best_params = params

    return best_params

# 模拟数据
np.random.seed(42)
n = 1000
dates = pd.date_range('2020-01-01', periods=n, freq='B')
close = 100 * np.exp(np.cumsum(np.random.randn(n) * 0.015))
data = pd.DataFrame({'close': close}, index=dates)

# 运行Walk-forward验证
wfo_results = walk_forward_validation(
    data, mean_reversion_strategy, optimize_func=optimize_params,
    train_window=252, test_window=63, step=63
)

print("Walk-forward验证结果：")
print(wfo_results[['test_start', 'test_end', 'params', 'test_return', 'test_sharpe']])

avg_oos_return = wfo_results['test_return'].mean()
print(f"\n平均OOS收益: {avg_oos_return:.2%}")
print(f"OOS收益>0的比例: {(wfo_results['test_return'] > 0).mean():.0%}")
```

## 常见误区

1. **"测试窗口太短"** — 测试窗口太短会导致结果噪音大，无法判断策略是否有效。通常测试窗口至少3-6个月。
2. **"参数优化与回测用同样的数据"** — 这就是过拟合。参数优化只能用训练集数据，测试集必须是"未见过"的数据。
3. **"忽略Walk-forward的计算成本"** — Walk-forward需要多次训练和测试，计算量是普通回测的N倍。但对于防止过拟合来说，这个成本是值得的。

## 相关概念

- [回测概览](/k/backtest-overview) — Walk-forward是回测验证的高级方法
- [过拟合](/k/overfitting) — Walk-forward的核心目的是防止过拟合
