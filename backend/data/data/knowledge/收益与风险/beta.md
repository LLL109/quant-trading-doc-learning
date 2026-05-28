---
slug: beta
title: Beta系统性风险
category: 收益与风险
difficulty: 3
prerequisites: ["volatility"]
related: ["alpha", "volatility", "sharpe-ratio", "return-rate"]
tags: ["Beta", "系统性风险", "CAPM", "对冲"]
---

# Beta系统性风险

> Beta衡量的是投资组合对市场整体波动的敏感度，是CAPM模型中衡量系统性风险的核心指标。

## 定义

Beta（β）是资本资产定价模型（CAPM）中衡量资产系统性风险的指标，表示资产收益率对市场收益率的敏感程度。Beta=1表示资产与市场同步波动，Beta>1表示资产波动大于市场，Beta<1表示波动小于市场。

对程序员来说，Beta就像一个"负载系数"——当系统负载（市场）增加1%时，你的服务响应时间（股价）会变化多少。

## 核心内容

### Beta的含义

$$\beta_i = \frac{\text{Cov}(R_i, R_m)}{\text{Var}(R_m)}$$

| Beta值 | 含义 | 举例 |
|--------|------|------|
| β = 0 | 与市场无关 | 现金、国债 |
| 0 < β < 1 | 波动小于市场 | 公用事业股、消费必需品 |
| β = 1 | 与市场同步 | 沪深300ETF |
| β > 1 | 波动大于市场 | 科技股、券商股 |
| β < 0 | 与市场反向 | 少数避险资产 |

### 系统性风险 vs 非系统性风险

| 风险类型 | 系统性风险（不可分散） | 非系统性风险（可分散） |
|---------|---------------------|---------------------|
| 定义 | 影响整个市场的风险 | 只影响个别资产的风险 |
| 度量 | Beta | 残差波动率 |
| 举例 | 经济衰退、利率变化、疫情 | 公司丑闻、产品失败、管理层变动 |
| 分散化 | 无法通过分散投资消除 | 可以通过持有多种资产消除 |

### Beta的估计

最常用的方法是OLS回归：
$$R_i - R_f = \alpha + \beta \times (R_m - R_f) + \epsilon$$

注意事项：
1. **时间窗口**：通常用1-3年的日数据或周数据
2. **市场指数选择**：A股常用沪深300或中证全指
3. **频率**：日频数据噪声大，周频更稳定
4. **调整Beta**：原始Beta有向1回归的趋势，Bloomberg使用调整Beta = 0.67 * 原始Beta + 0.33

### Beta的应用

1. **风险评估**：Beta=1.5的股票，在市场下跌10%时预期下跌15%
2. **对冲策略**：用Beta计算需要多少反向头寸来对冲市场风险
3. **组合构建**：通过调整Beta来控制组合的市场暴露
4. **预期收益**：CAPM中用于计算资产的合理预期收益

### 举例说明

假设某股票Beta=1.3：
- 市场上涨1%，该股票预期上涨 1.3 x 1% = 1.3%
- 市场下跌1%，该股票预期下跌 1.3 x 1% = 1.3%
- 市场下跌10%，该股票预期下跌 1.3 x 10% = 13%

如果你持有100万元该股票，想对冲市场风险：
- 需要做空 100万 x 1.3 = 130万元的沪深300期货
- 这样市场涨跌对你的影响被抵消，只剩下Alpha收益

## 计算公式

**Beta：**
$$\beta = \frac{\text{Cov}(R_i, R_m)}{\text{Var}(R_m)} = \frac{\sigma_{i,m}}{\sigma_m^2}$$

**相关系数与Beta的关系：**
$$\beta_i = \rho_{i,m} \times \frac{\sigma_i}{\sigma_m}$$

其中 $\rho_{i,m}$ 是资产i与市场的相关系数，$\sigma_i$ 和 $\sigma_m$ 分别是资产和市场的波动率。

**组合Beta：**
$$\beta_p = \sum_{i=1}^{n} w_i \times \beta_i$$

其中 $w_i$ 是各资产的权重。

## Python 代码

```python
import akshare as ak
import pandas as pd
import numpy as np
from scipy import stats

# 获取个股数据
stock = ak.stock_zh_a_hist(symbol="600519", period="daily",
                            start_date="20220101", end_date="20240630",
                            adjust="qfq")

# 获取市场指数数据（沪深300）
market = ak.stock_zh_index_daily(symbol="sh000300")
market = market[(market['date'] >= '2022-01-01') & (market['date'] <= '2024-06-30')]

# 计算收益率
stock['stock_return'] = stock['收盘'].pct_change()
stock['日期'] = pd.to_datetime(stock['日期'])
market['market_return'] = market['close'].pct_change()
market['date'] = pd.to_datetime(market['date'])

# 合并数据
merged = pd.merge(stock[['日期', 'stock_return']], market[['date', 'market_return']],
                   left_on='日期', right_on='date', how='inner').dropna()

# 方法1：直接用公式计算
cov_matrix = merged[['stock_return', 'market_return']].cov()
beta_formula = cov_matrix.iloc[0, 1] / cov_matrix.iloc[1, 1]
print(f"Beta (公式法): {beta_formula:.3f}")

# 方法2：OLS回归
slope, intercept, r_value, p_value, std_err = stats.linregress(
    merged['market_return'], merged['stock_return'])
print(f"Beta (回归法): {slope:.3f}")
print(f"Alpha (日): {intercept:.6f}")
print(f"R-squared: {r_value**2:.3f}")

# 计算相关系数
corr = merged['stock_return'].corr(merged['market_return'])
print(f"\n相关系数: {corr:.3f}")

# 验证：Beta = 相关系数 * (个股波动率/市场波动率)
stock_vol = merged['stock_return'].std()
market_vol = merged['market_return'].std()
beta_from_corr = corr * stock_vol / market_vol
print(f"Beta (相关系数法): {beta_from_corr:.3f}")

# 对冲比例计算
portfolio_value = 1000000  # 100万
hedge_value = portfolio_value * slope
print(f"\n持仓市值: {portfolio_value:,.0f}元")
print(f"需要对冲金额: {hedge_value:,.0f}元")
print(f"对冲比例: {slope:.2f}")

# 多只股票的Beta比较
symbols = {'贵州茅台': '600519', '招商银行': '600036', '宁德时代': '300750'}
print("\n各股票Beta:")
for name, code in symbols.items():
    try:
        tmp = ak.stock_zh_a_hist(symbol=code, period="daily",
                                  start_date="20220101", end_date="20240630",
                                  adjust="qfq")
        tmp['ret'] = tmp['收盘'].pct_change()
        tmp['日期'] = pd.to_datetime(tmp['日期'])
        m = pd.merge(tmp[['日期', 'ret']], market[['date', 'market_return']],
                      left_on='日期', right_on='date', how='inner').dropna()
        s, _, _, _, _ = stats.linregress(m['market_return'], m['ret'])
        print(f"  {name}: Beta = {s:.3f}")
    except:
        pass
```

## 常见误区

1. **"Beta是固定的"** — Beta会随时间变化。公司业务变化、市场环境变化都会影响Beta。应该使用滚动窗口更新Beta估计。
2. **"低Beta就安全"** — 低Beta意味着系统性风险低，但非系统性风险可能很高。一只Beta=0.5的股票可能因为公司特定事件暴跌50%。Beta只衡量与市场相关的风险。
3. **"Beta=0就没有风险"** — Beta=0只意味着没有系统性风险，但资产可能有其他风险（利率风险、流动性风险、信用风险等）。现金的Beta接近0，但也不是完全没有风险（通胀风险）。

## 相关概念

- [Alpha超额收益](/k/alpha) — 与Beta共同构成CAPM模型
- [波动率](/k/volatility) — Beta是通过收益率波动计算的
- [夏普比率](/k/sharpe-ratio) — 综合考虑收益与风险
- [收益率](/k/return-rate) — Beta计算的基础数据
