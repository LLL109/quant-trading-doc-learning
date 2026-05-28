---
slug: survivorship-bias
title: 幸存者偏差
category: 回测
difficulty: 2
prerequisites: ["backtest-overview"]
related: ["overfitting", "future-function"]
tags: ["回测陷阱", "幸存者偏差"]
---

# 幸存者偏差

> 幸存者偏差是指只看到"幸存"下来的样本，而忽略了已经"消失"的样本，导致对整体情况的错误判断。

## 定义

幸存者偏差（Survivorship Bias）是回测中最常见也最隐蔽的陷阱之一。它指的是：当我们用当前存在的股票历史数据来回测策略时，那些已经退市、被摘牌的股票被排除在外，导致回测结果被系统性地高估。

对程序员来说，这就像只统计中奖者的彩票号码来研究"中奖规律"，而忽略了大量没中奖的号码——结论必然是偏颇的。

## 核心内容

### 为什么会有幸存者偏差？

当前A股市场上有约5000只股票，但过去20年里退市的、被摘牌的、被合并的股票有几百只。这些"消失"的股票通常是表现最差的——亏损的、造假的、经营不善的。

当你用"当前存在的股票"来回测时：
- 你自动排除了那些最差的股票
- 你的回测结果只反映了"幸存者"的表现
- 实际投资时，你可能会买到那些后来"消失"的股票

### 幸存者偏差的量化影响

研究表明，幸存者偏差可能导致：
- 年化收益高估1-3%
- 夏普比率高估0.2-0.5
- 最大回撤被低估

### 哪些策略受影响最大？

| 策略类型 | 影响程度 | 原因 |
|----------|----------|------|
| 低价股策略 | 高 | 退市风险集中在低价股 |
| 小盘股策略 | 高 | 小盘股退市概率更高 |
| 价值陷阱策略 | 高 | 极度低估可能是基本面恶化 |
| 大盘蓝筹策略 | 低 | 大盘蓝筹很少退市 |

### 如何避免幸存者偏差？

1. **使用无幸存者偏差数据**：包含已退市股票的历史数据
2. **使用滚动窗口**：每次选股只用当时可获得的信息
3. **加入退市概率**：在回测中模拟股票退市的可能性
4. **保守估计**：将回测收益打个折扣（如打8折）

## Python 代码

```python
import pandas as pd
import numpy as np

def demonstrate_survivorship_bias():
    """演示幸存者偏差的影响"""

    # 模拟100只股票，其中20只在过程中"退市"
    np.random.seed(42)
    n_stocks = 100
    n_periods = 60  # 5年月度数据

    # 生成股票收益
    returns = np.random.randn(n_stocks, n_periods) * 0.1 + 0.005

    # 模拟退市：表现最差的20只股票在某个时间点"消失"
    cumulative = (1 + pd.DataFrame(returns)).cumprod(axis=1)
    final_value = cumulative.iloc[:, -1]
    delisted_idx = final_value.nsmallest(20).index

    # 设置退市后的收益为-100%（血本无归）
    returns_with_delist = returns.copy()
    for idx in delisted_idx:
        delist_time = np.random.randint(12, n_periods)
        returns_with_delist[idx, delist_time:] = -1.0  # 退市

    # 两种回测方式对比
    # 方式1：只看幸存者（有偏差）
    survivor_returns = pd.DataFrame(returns).drop(delisted_idx)
    survivor_mean = survivor_returns.mean().mean()

    # 方式2：包含退市股票（无偏差）
    all_returns = pd.DataFrame(returns_with_delist)
    all_mean = all_returns.mean().mean()

    print("幸存者偏差演示：")
    print(f"  只看幸存者 - 平均月收益: {survivor_mean:.4f}")
    print(f"  包含退市股 - 平均月收益: {all_mean:.4f}")
    print(f"  偏差幅度: {(survivor_mean - all_mean) / abs(all_mean) * 100:.1f}%")

    # 年化收益对比
    survivor_annual = (1 + survivor_mean) ** 12 - 1
    all_annual = (1 + all_mean) ** 12 - 1
    print(f"\n  幸存者年化收益: {survivor_annual:.2%}")
    print(f"  真实年化收益: {all_annual:.2%}")
    print(f"  高估: {(survivor_annual - all_annual) * 100:.2f}个百分点")

demonstrate_survivorship_bias()

def check_survivorship_bias_in_data(stock_list_current, historical_dates):
    """
    检查数据是否存在幸存者偏差

    Parameters:
    stock_list_current: 当前存在的股票列表
    historical_dates: 历史日期列表

    Returns:
    偏差分析结果
    """
    # 对于每个历史日期，检查当时存在的股票数量
    # 如果数量与当前相同，说明数据可能包含幸存者偏差
    results = []
    for date in historical_dates:
        # 实际应用中需要查询历史股票列表
        # 这里仅展示分析框架
        results.append({
            'date': date,
            'stocks_available': len(stock_list_current),  # 应该是历史数据
            'note': '需要无幸存者偏差数据源'
        })
    return pd.DataFrame(results)

print("\n检查数据质量：")
print("建议使用包含退市股票的专业数据源（如Wind、Tushare Pro）")
```

## 常见误区

1. **"幸存者偏差影响很小"** — 对于小盘股、低价股策略，幸存者偏差可能导致年化收益高估3-5个百分点，这足以让一个亏损策略看起来盈利。
2. **"用指数数据就没事了"** — 指数本身也会调入调出成分股，同样存在幸存者偏差。沪深300指数的长期收益也被高估了。
3. **"忽略行业层面的幸存者偏差"** — 某些行业（如互联网泡沫时期的科技股）可能整批"消失"，行业层面的幸存者偏差也很严重。

## 相关概念

- [回测概览](/k/backtest-overview) — 幸存者偏差是回测需要避免的核心陷阱
- [过拟合](/k/overfitting) — 幸存者偏差和过拟合都会导致回测结果虚高
- [未来函数](/k/future-function) — 回测中的三大陷阱：幸存者偏差、过拟合、未来函数
