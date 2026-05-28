---
slug: overfitting
title: 过拟合
category: 回测
difficulty: 3
prerequisites: ["backtest-overview"]
related: ["future-function", "backtest-overview", "quant-overview"]
tags: ["回测", "风险", "过拟合"]
---

# 过拟合

> 过拟合是指策略过度适配历史数据，在回测中表现优异但实盘中表现糟糕的现象。

## 定义

过拟合（Overfitting）是量化交易中最常见也最危险的问题。它的本质是：你的策略不是在学习市场的规律，而是在"背诵"历史数据的噪声。

类比：就像一个学生把考试原题背得滚瓜烂熟，考试成绩很好，但换一套新题就不及格了。他学到的不是知识点，而是特定题目的答案。

## 核心内容

### 过拟合的本质

想象你在做曲线拟合：
- 10 个数据点，用 2 次多项式拟合 → 学到真正的趋势
- 10 个数据点，用 9 次多项式拟合 → 完美穿过每个点，但预测新数据极差

策略参数越多、逻辑越复杂，就越容易过拟合。

### 过拟合的常见表现

| 表现 | 说明 |
|------|------|
| 回测收益远超预期 | 年化 50%+ 的策略大概率过拟合 |
| 参数敏感 | 改变一个参数，收益大幅变化 |
| 样本内/外差距大 | 在训练期表现好，测试期表现差 |
| 交易次数少 | 信号太少，没有统计意义 |
| 逻辑无法解释 | 策略为什么有效说不清楚 |

### 导致过拟合的行为

1. **过度优化参数**
   - 反复调整均线周期、阈值等参数
   - 从 5 到 100 逐个测试，选"最优"的
   - 结果：参数恰好适配了历史噪声

2. **过多的规则**
   - "当 MA20 > MA60 且 RSI < 30 且成交量放大 1.5 倍且当天是周三..."
   - 规则越多，适配历史噪声的能力越强

3. **数据窥探**
   - 在同一段数据上反复测试不同策略
   - 即使每次都是"独立"的测试，最终也会找到一个偶然有效的策略

4. **选择性报告**
   - 测试了 100 个策略，只展示最好的那个
   - "最优"策略可能只是 100 次尝试中的幸运者

### 减少过拟合的方法

#### 1. 保持策略简单

- 参数越少越好（理想情况：2-3 个）
- 逻辑越简单越好（能用一句话说清楚的策略更好）
- 交易次数越多越好（更多样本更可靠）

#### 2. 样本外测试

把数据分成两部分：
- **训练集**（如 2015-2020）：用来开发和优化策略
- **测试集**（如 2021-2024）：用来验证策略

只有在训练集和测试集上都表现良好的策略才值得信任。

#### 3. Walk-Forward Analysis（前进分析）

更高级的样本外测试方法：

```
第1轮：用 2015-2017 训练，用 2018 测试
第2轮：用 2016-2018 训练，用 2019 测试
第3轮：用 2017-2019 训练，用 2020 测试
...
```

这种方法模拟了真实的"开发-验证"循环。

#### 4. 参数稳健性测试

- 在参数空间中画出策略表现的"地形图"
- 如果只有某个参数值表现好，其他都不行 → 过拟合
- 如果一片区域都表现不错 → 参数稳健

#### 5. 逻辑合理性检验

问自己：
- 这个策略为什么有效？背后的逻辑是什么？
- 如果我说给别人听，他觉得有道理吗？
- 策略赚的是谁的钱？

## Python 代码

```python
import pandas as pd
import numpy as np

def demonstrate_overfitting():
    """演示过拟合现象"""
    np.random.seed(42)
    n = 500
    dates = pd.date_range('2015-01-01', periods=n, freq='B')
    
    # 生成完全随机的价格数据
    close = pd.Series(
        np.cumsum(np.random.randn(n) * 0.8) + 100,
        index=dates, name='close'
    )
    
    # 在随机数据上"优化"均线参数
    results = []
    for short in range(5, 30):
        for long in range(30, 120):
            ma_s = close.rolling(short).mean()
            ma_l = close.rolling(long).mean()
            signal = (ma_s > ma_l).astype(int)
            position = signal.shift(1)
            returns = position * close.pct_change()
            cumulative = (1 + returns).prod() - 1
            results.append({
                'short': short, 'long': long,
                'return': cumulative
            })
    
    results_df = pd.DataFrame(results)
    best = results_df.loc[results_df['return'].idxmax()]
    
    print("在随机数据上找到的'最优'参数:")
    print(f"  短期均线: {int(best['short'])}, 长期均线: {int(best['long'])}")
    print(f"  收益率: {best['return']:.2%}")
    print()
    print("注意：这些参数在随机数据上都能产生高收益，")
    print("说明参数优化很容易在噪声中找到'规律'。")

def walk_forward_test(close, param_grid, train_days=500, test_days=250):
    """
    Walk-Forward Analysis
    
    Parameters:
    close: 收盘价
    param_grid: 参数列表 [(short, long), ...]
    train_days: 训练集天数
    test_days: 测试集天数
    """
    results = []
    
    start = 0
    while start + train_days + test_days <= len(close):
        train = close.iloc[start:start+train_days]
        test = close.iloc[start+train_days:start+train_days+test_days]
        
        # 在训练集上选最优参数
        best_return = -np.inf
        best_params = None
        
        for short, long in param_grid:
            ma_s = train.rolling(short).mean()
            ma_l = train.rolling(long).mean()
            signal = (ma_s > ma_l).astype(int)
            ret = (signal.shift(1) * train.pct_change()).sum()
            if ret > best_return:
                best_return = ret
                best_params = (short, long)
        
        # 在测试集上用最优参数
        ma_s = test.rolling(best_params[0]).mean()
        ma_l = test.rolling(best_params[1]).mean()
        signal = (ma_s > ma_l).astype(int)
        test_return = (signal.shift(1) * test.pct_change()).sum()
        
        results.append({
            'train_start': train.index[0],
            'test_return': test_return,
            'best_params': best_params
        })
        
        start += test_days
    
    return pd.DataFrame(results)

# 演示
demonstrate_overfitting()
```

## 常见误区

1. **我的策略参数不多就不会过拟合** — 即使只有 2 个参数，如果你测试了 100 种组合并选了最好的，也可能过拟合。关键不在于参数数量，而在于你在数据上做了多少次"选择"。
2. **样本外测试好就不会过拟合** — 如果你反复在样本外数据上测试并调整策略，样本外数据实际上也变成了"样本内"。需要留出真正的"盲测"数据。
3. **过拟合的策略实盘一定会亏** — 过拟合策略在实盘中不一定会亏，只是不能期望它达到回测中的收益水平。降低预期是正确的态度。
4. **复杂策略更容易过拟合** — 这通常是对的，但不是绝对的。关键是策略的自由度相对于数据量的比例。一个复杂策略如果有足够多的数据支持，也不一定会过拟合。

## 相关概念

- [未来函数](/k/future-function) — 另一种回测错误
- [回测概述](/k/backtest-overview) — 回测的基本概念
- [量化交易概述](/k/quant-overview) — 过拟合在量化中的位置
