---
slug: win-rate
title: 胜率
category: 收益与风险
difficulty: 1
prerequisites: ["return-rate"]
related: ["profit-loss-ratio", "return-rate", "sharpe-ratio"]
tags: ["胜率", "盈亏分析", "交易统计"]
---

# 胜率

> 胜率是盈利交易占总交易次数的比例，但高胜率并不一定意味着赚钱。

## 定义

胜率（Win Rate）是指在所有交易中，盈利交易次数占总交易次数的百分比。它是衡量交易策略盈利能力的一个直观但不完整的指标——因为胜率只告诉你"赢了多少次"，没有告诉你"每次赢多少"。

对程序员来说，胜率就像单元测试的"通过率"——99%的测试通过看起来很好，但如果失败的1%是最关键的功能，那整体质量可能很差。

## 核心内容

### 胜率的计算

$$\text{胜率} = \frac{\text{盈利交易次数}}{\text{总交易次数}} \times 100\%$$

### 胜率的常见水平

| 策略类型 | 典型胜率 | 说明 |
|---------|---------|------|
| 趋势跟踪 | 30%-40% | 靠少数大赢利覆盖多次小亏损 |
| 均值回归 | 55%-70% | 靠多数小盈利积累收益 |
| 日内交易 | 50%-60% | 需要配合严格的止损 |
| 价值投资 | 50%-60% | 长期持有，单次交易周期长 |

### 高胜率不一定赚钱

关键在于**期望值**：

$$\text{期望收益} = \text{胜率} \times \text{平均盈利} - (1 - \text{胜率}) \times \text{平均亏损}$$

**例子：**
- 策略A：胜率90%，平均盈利100元，平均亏损2000元
  - 期望收益 = 0.9 x 100 - 0.1 x 2000 = 90 - 200 = -110元
  - 虽然胜率90%，但长期必亏！

- 策略B：胜率30%，平均盈利500元，平均亏损100元
  - 期望收益 = 0.3 x 500 - 0.7 x 100 = 150 - 70 = 80元
  - 虽然胜率只有30%，但长期稳定盈利！

### 胜率与盈亏比的关系

要实现正期望值（长期盈利），胜率和盈亏比需要满足：

$$\text{胜率} > \frac{1}{1 + \text{盈亏比}}$$

| 盈亏比 | 最低要求胜率 |
|--------|------------|
| 1:1 | 50% |
| 2:1 | 33.3% |
| 3:1 | 25% |
| 4:1 | 20% |

### 举例说明

某量化策略过去100次交易：
- 盈利交易：45次，平均盈利500元
- 亏损交易：55次，平均亏损300元
- 胜率 = 45/100 = 45%
- 盈亏比 = 500/300 = 1.67
- 期望收益 = 0.45 x 500 - 0.55 x 300 = 225 - 165 = 60元/次
- 总收益 = 60 x 100 = 6000元

虽然胜率只有45%（不到一半），但由于盈亏比大于1，整体仍然盈利。

## 计算公式

**胜率：**
$$\text{胜率} = \frac{N_{\text{盈利}}}{N_{\text{总}}} \times 100\%$$

**期望收益：**
$$E = W \times \bar{P} - (1 - W) \times \bar{L}$$

其中 $W$ 是胜率，$\bar{P}$ 是平均盈利，$\bar{L}$ 是平均亏损。

## Python 代码

```python
import akshare as ak
import pandas as pd
import numpy as np

# 模拟一个交易策略的交易记录
np.random.seed(42)
n_trades = 200
returns = np.random.normal(0.002, 0.03, n_trades)  # 模拟日收益率

# 定义交易：收益率>0为盈利，<0为亏损
profits = returns[returns > 0]
losses = returns[returns < 0]

# 计算胜率
win_rate = len(profits) / len(returns)
print(f"总交易次数: {len(returns)}")
print(f"盈利次数: {len(profits)}, 亏损次数: {len(losses)}")
print(f"胜率: {win_rate:.2%}")

# 计算平均盈亏
avg_profit = profits.mean()
avg_loss = abs(losses.mean())
profit_loss_ratio = avg_profit / avg_loss
print(f"\n平均盈利: {avg_profit:.4f}")
print(f"平均亏损: {avg_loss:.4f}")
print(f"盈亏比: {profit_loss_ratio:.2f}")

# 计算期望收益
expected = win_rate * avg_profit - (1 - win_rate) * avg_loss
print(f"\n每笔期望收益: {expected:.4f}")
print(f"总期望收益: {expected * len(returns):.4f}")

# 用真实股票数据做交易模拟
df = ak.stock_zh_a_hist(symbol="600519", period="daily",
                         start_date="20220101", end_date="20240630",
                         adjust="qfq")
df['日收益率'] = df['收盘'].pct_change()
df['信号'] = 0
df.loc[df['日收益率'] > 0.02, '信号'] = 1   # 大涨后持有
df.loc[df['日收益率'] < -0.02, '信号'] = -1  # 大跌后做空

# 模拟交易盈亏
df['策略收益'] = df['信号'].shift(1) * df['日收益率']
trades = df[df['信号'] != 0]['策略收益']
win_trades = trades[trades > 0]
lose_trades = trades[trades < 0]
print(f"\n模拟策略统计:")
print(f"  总交易: {len(trades)}, 盈利: {len(win_trades)}, 亏损: {len(lose_trades)}")
print(f"  胜率: {len(win_trades)/len(trades):.2%}")
```

## 常见误区

1. **"高胜率就是好策略"** — 胜率必须结合盈亏比来看。90%胜率的策略可能每次只赚1元，但亏损时亏100元，长期必亏。
2. **"胜率会保持稳定"** — 胜率受市场环境影响很大。牛市中趋势策略胜率可能60%，熊市可能只有25%。用历史胜率预测未来需要谨慎。
3. **"胜率50%就是抛硬币"** — 胜率50%的策略完全可以盈利，只要盈亏比大于1。关键不是赢多少次，而是每次赢多少、亏多少。

## 相关概念

- [盈亏比](/k/profit-loss-ratio) — 与胜率共同决定策略的期望收益
- [收益率](/k/return-rate) — 胜率分析的基础数据
- [夏普比率](/k/sharpe-ratio) — 更全面的风险调整收益指标
