---
slug: sharpe-ratio
title: 夏普比率
category: 收益与风险
difficulty: 2
prerequisites: ["annualized-return", "volatility"]
related: ["annualized-return", "volatility", "calmar-ratio", "alpha"]
tags: ["夏普比率", "风险调整收益", "Sharpe"]
---

# 夏普比率

> 夏普比率衡量每承担一单位风险所获得的超额收益，是评估策略性价比的核心指标。

## 定义

夏普比率（Sharpe Ratio）是由诺贝尔奖得主威廉·夏普提出的，用于衡量投资组合相对于无风险资产的超额收益与波动率的比值。它回答的核心问题是：每承担一单位风险，我能获得多少额外回报？

对程序员来说，夏普比率就像"性价比"指标——不是单纯看性能（收益），也不是单纯看成本（风险），而是看两者的比值。

## 核心内容

### 夏普比率公式

$$\text{Sharpe Ratio} = \frac{R_p - R_f}{\sigma_p}$$

其中：
- $R_p$：投资组合的年化收益率
- $R_f$：无风险利率（通常用国债收益率或银行存款利率）
- $\sigma_p$：投资组合的年化波动率

### 无风险利率

在中国，常用的无风险利率：
- 1年期定期存款利率：约1.5%-2.5%
- 10年期国债收益率：约2.5%-3.5%
- 3个月Shibor：约2%-3%

实际应用中，常取2%-3%作为无风险利率的近似值。

### 夏普比率的解读

| 夏普比率 | 评价 | 含义 |
|---------|------|------|
| < 0 | 差 | 收益还不如无风险资产 |
| 0 - 0.5 | 一般 | 承担的风险未获得足够补偿 |
| 0.5 - 1.0 | 良好 | 风险调整后收益尚可 |
| 1.0 - 2.0 | 优秀 | 每单位风险获得不错的超额收益 |
| 2.0 - 3.0 | 非常优秀 | 罕见的高水平策略 |
| > 3.0 | 卓越 | 极其罕见，需要验证是否有过拟合 |

### 举例说明

**策略A：** 年化收益30%，年化波动率20%
$$\text{Sharpe}_A = \frac{30\% - 3\%}{20\%} = 1.35$$

**策略B：** 年化收益15%，年化波动率8%
$$\text{Sharpe}_B = \frac{15\% - 3\%}{8\%} = 1.50$$

虽然策略A收益更高，但策略B的夏普比率更高——意味着策略B每承担一单位风险获得的超额收益更多，性价比更好。

### 夏普比率的局限性

1. **假设收益率正态分布**：实际收益率常有"肥尾"特征（极端事件比正态分布预测的更频繁）
2. **不区分上行和下行波动**：上行波动也会增加波动率，但实际上投资者喜欢上行波动
3. **对时间窗口敏感**：不同计算周期的夏普比率可能差异很大
4. **历史夏普不等于未来**：过拟合的策略可能有很高的历史夏普但未来表现差

## 计算公式

**标准夏普比率：**
$$\text{Sharpe} = \frac{R_p - R_f}{\sigma_p}$$

**日频计算（常用方法）：**
$$\text{Sharpe}_{\text{年化}} = \frac{\bar{R}_{\text{日}} - R_{f,\text{日}}}{\sigma_{\text{日}}} \times \sqrt{252}$$

其中 $\bar{R}_{\text{日}}$ 是日均收益率，$R_{f,\text{日}} = \frac{R_f}{252}$ 是日无风险利率。

**信息比率（类似概念）：**
$$\text{IR} = \frac{R_p - R_{\text{基准}}}{\sigma(R_p - R_{\text{基准}})}$$

用基准收益率替代无风险利率，衡量相对基准的超额收益。

## Python 代码

```python
import akshare as ak
import pandas as pd
import numpy as np

# 获取股票/基金数据
df = ak.stock_zh_a_hist(symbol="600519", period="daily",
                         start_date="20220101", end_date="20240630",
                         adjust="qfq")

# 计算日收益率
df['日收益率'] = df['收盘'].pct_change().dropna()
returns = df['日收益率'].dropna()

# 无风险利率（年化3%）
rf_annual = 0.03
rf_daily = rf_annual / 252

# 计算夏普比率
def calc_sharpe(returns, rf_annual=0.03):
    """计算年化夏普比率"""
    rf_daily = rf_annual / 252
    excess_returns = returns - rf_daily
    sharpe = excess_returns.mean() / returns.std() * np.sqrt(252)
    return sharpe

sharpe = calc_sharpe(returns)
print(f"夏普比率: {sharpe:.2f}")

# 分解计算过程
annual_return = returns.mean() * 252
annual_vol = returns.std() * np.sqrt(252)
print(f"年化收益率: {annual_return:.2%}")
print(f"年化波动率: {annual_vol:.2%}")
print(f"无风险利率: {rf_annual:.2%}")
print(f"夏普比率 = ({annual_return:.2%} - {rf_annual:.2%}) / {annual_vol:.2%} = {sharpe:.2f}")

# 滚动夏普比率
window = 60  # 60日滚动窗口
df['滚动夏普'] = (df['日收益率'].rolling(window).mean() - rf_daily) / df['日收益率'].rolling(window).std() * np.sqrt(252)

# 对比不同策略的夏普比率
symbols = {'贵州茅台': '600519', '招商银行': '600036', '宁德时代': '300750'}
for name, code in symbols.items():
    try:
        tmp = ak.stock_zh_a_hist(symbol=code, period="daily",
                                  start_date="20220101", end_date="20240630",
                                  adjust="qfq")
        tmp_ret = tmp['收盘'].pct_change().dropna()
        s = calc_sharpe(tmp_ret)
        print(f"{name}: 夏普比率 = {s:.2f}")
    except:
        pass
```

## 常见误区

1. **"夏普比率越高越好"** — 夏普比率超过3的策略通常值得怀疑，可能是过拟合、数据窥探或利用了某些不可持续的市场异常。需要验证策略的鲁棒性。
2. **"夏普比率可以直接跨资产比较"** — 不同资产类别的波动率特征不同（股票vs债券vs商品），夏普比率的"正常范围"也不同。应该在同类资产或策略中比较。
3. **"忽略无风险利率的变化"** — 在高利率环境下（无风险利率高），夏普比率会降低，但这不一定说明策略变差了。应该在不同时期使用对应的无风险利率。

## 相关概念

- [年化收益率](/k/annualized-return) — 夏普比率的分子部分
- [波动率](/k/volatility) — 夏普比率的分母部分
- [卡玛比率](/k/calmar-ratio) — 用最大回撤替代波动率的风险调整指标
- [Alpha超额收益](/k/alpha) — 夏普比率在CAPM框架下的特殊形式
