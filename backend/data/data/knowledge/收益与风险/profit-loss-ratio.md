---
slug: profit-loss-ratio
title: 盈亏比
category: 收益与风险
difficulty: 2
prerequisites: ["win-rate"]
related: ["win-rate", "return-rate", "sharpe-ratio"]
tags: ["盈亏比", "期望值", "风险管理"]
---

# 盈亏比

> 盈亏比是平均盈利与平均亏损的比值，与胜率共同决定策略的长期期望收益。

## 定义

盈亏比（Profit/Loss Ratio，简称P/L Ratio或赔率）是指交易策略中平均盈利金额与平均亏损金额的比值。它反映了"赚的时候赚多少，亏的时候亏多少"。

对程序员来说，盈亏比就像代码的"异常处理成本比"——正常运行时的收益和异常发生时的损失之间的关系。

## 核心内容

### 盈亏比的计算

$$\text{盈亏比} = \frac{\text{平均盈利}}{\text{平均亏损}}$$

- 盈亏比 > 1：平均每次赚的比亏的多
- 盈亏比 < 1：平均每次亏的比赚的多
- 盈亏比 = 1：平均每次赚亏一样多

### 期望值公式

盈亏比和胜率共同决定了策略的期望收益：

$$\text{期望值} = W \times \bar{P} - (1-W) \times \bar{L}$$

其中：
- $W$ = 胜率
- $\bar{P}$ = 平均盈利
- $\bar{L}$ = 平均亏损

用盈亏比表示：
$$\text{期望值} = \bar{L} \times [W \times k - (1-W)]$$

其中 $k = \bar{P}/\bar{L}$ 是盈亏比。

### 盈亏比与胜率的组合

策略盈利的条件：$W \times k > (1-W)$，即：

$$W > \frac{1}{1+k}$$

或者等价地：

$$k > \frac{1-W}{W}$$

| 胜率 | 最低盈亏比 | 策略类型举例 |
|------|-----------|------------|
| 20% | 4.0 | 长线趋势跟踪 |
| 30% | 2.33 | 中线趋势策略 |
| 40% | 1.50 | 波段交易 |
| 50% | 1.00 | 随机+止损 |
| 60% | 0.67 | 均值回归 |
| 70% | 0.43 | 高频做市 |
| 80% | 0.25 | 日内剥头皮 |

### 常见的盈亏比策略

**高胜率低盈亏比**（多数小赚，少数大亏）：
- 优点：心理压力小，多数交易都是赚钱的
- 缺点：一次大亏可能抹掉多次小赚
- 例子：卖出期权、网格交易

**低胜率高盈亏比**（多数小亏，少数大赚）：
- 优点：风控清晰，每次亏损有限
- 缺点：连续亏损时心理压力大
- 例子：趋势跟踪、突破策略

### 举例说明

**场景A：高频交易**
- 胜率60%，平均盈利0.5%，平均亏损0.3%
- 盈亏比 = 0.5/0.3 = 1.67
- 期望值 = 0.6 x 0.5% - 0.4 x 0.3% = 0.18%
- 每100次交易预期收益18%

**场景B：趋势跟踪**
- 胜率35%，平均盈利8%，平均亏损2%
- 盈亏比 = 8/2 = 4.0
- 期望值 = 0.35 x 8% - 0.65 x 2% = 1.5%
- 每100次交易预期收益150%

虽然场景B胜率低得多，但盈亏比高，总体期望收益更好。

## 计算公式

**盈亏比：**
$$k = \frac{\bar{P}}{\bar{L}} = \frac{\frac{1}{N_P}\sum_{i \in \text{盈利}} P_i}{\frac{1}{N_L}\sum_{j \in \text{亏损}} |L_j|}$$

**期望收益：**
$$E = W \times \bar{P} - (1-W) \times \bar{L}$$

**凯利公式（最优仓位比例）：**
$$f^* = \frac{W \times k - (1-W)}{k} = W - \frac{1-W}{k}$$

## Python 代码

```python
import akshare as ak
import pandas as pd
import numpy as np

# 获取股票数据并模拟交易
df = ak.stock_zh_a_hist(symbol="600519", period="daily",
                         start_date="20220101", end_date="20240630",
                         adjust="qfq")

df['日收益率'] = df['收盘'].pct_change()
df['MA5'] = df['收盘'].rolling(5).mean()
df['MA20'] = df['收盘'].rolling(20).mean()

# 简单均线策略：MA5上穿MA20买入，下穿卖出
df['信号'] = 0
df.loc[df['MA5'] > df['MA20'], '信号'] = 1
df.loc[df['MA5'] <= df['MA20'], '信号'] = -1
df['持仓'] = df['信号'].shift(1)
df['策略收益'] = df['持仓'] * df['日收益率']

# 计算盈亏统计
profit_trades = df[df['策略收益'] > 0]['策略收益']
loss_trades = df[df['策略收益'] < 0]['策略收益']

win_rate = len(profit_trades) / (len(profit_trades) + len(loss_trades))
avg_profit = profit_trades.mean()
avg_loss = abs(loss_trades.mean())
pl_ratio = avg_profit / avg_loss

print(f"总交易日: {len(profit_trades) + len(loss_trades)}")
print(f"盈利日: {len(profit_trades)}, 亏损日: {len(loss_trades)}")
print(f"胜率: {win_rate:.2%}")
print(f"平均盈利: {avg_profit:.4%}")
print(f"平均亏损: {avg_loss:.4%}")
print(f"盈亏比: {pl_ratio:.2f}")

# 期望收益
expected = win_rate * avg_profit - (1 - win_rate) * avg_loss
print(f"每日期望收益: {expected:.4%}")

# 凯利公式最优仓位
kelly = win_rate - (1 - win_rate) / pl_ratio
print(f"凯利最优仓位: {kelly:.2%}")

# 不同盈亏比下的最低胜率要求
ratios = [0.5, 1.0, 1.5, 2.0, 3.0, 4.0]
print("\n盈亏比与最低胜率要求:")
for r in ratios:
    min_wr = 1 / (1 + r)
    print(f"  盈亏比 {r:.1f} -> 最低胜率 {min_wr:.2%}")
```

## 常见误区

1. **"高胜率比高盈亏比更重要"** — 两者同样重要。凯利公式告诉我们，最优策略是胜率和盈亏比的平衡。片面追求高胜率可能导致盈亏比极低，一次大亏就回吐所有利润。
2. **"盈亏比可以无限提高"** — 通过放宽止损、收紧止盈可以提高盈亏比，但这会降低胜率。存在一个最优的止损止盈比例使得期望收益最大化。
3. **"历史盈亏比等于未来"** — 市场环境变化会影响盈亏比。趋势行情中趋势策略盈亏比高，震荡行情中则低。需要在不同市场环境下测试。

## 相关概念

- [胜率](/k/win-rate) — 与盈亏比共同决定策略期望值
- [收益率](/k/return-rate) — 盈亏分析的基础数据
- [夏普比率](/k/sharpe-ratio) — 更综合的风险调整收益指标
