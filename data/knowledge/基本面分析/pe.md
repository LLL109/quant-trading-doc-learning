---
slug: pe
title: 市盈率PE
category: 基本面分析
difficulty: 1
prerequisites: []
related: ["pb", "eps"]
tags: ["估值", "市盈率", "PE"]
---

# 市盈率PE

> 市盈率是最常用的股票估值指标，表示投资者愿意为每1元净利润支付的价格。

## 定义

市盈率（Price-to-Earnings Ratio，简称PE或P/E）是股票价格与每股收益的比值。它回答的核心问题是：按照当前盈利水平，多少年能收回投资成本？

对程序员来说，PE就像一个"投资回本年数"的估算器。PE=20意味着理论上需要20年才能通过盈利收回投资成本（假设盈利不变）。

## 核心内容

### PE的两种计算方式

1. **静态PE**：使用上一完整财年的EPS
2. **滚动PE（TTM）**：使用最近12个月的EPS（更常用）

### PE的解读

| PE范围 | 市场解读 | 典型行业 |
|--------|----------|----------|
| < 10 | 低估或衰退 | 银行、钢铁、地产 |
| 10-20 | 合理区间 | 消费、医药、公用事业 |
| 20-40 | 偏高但可能合理 | 科技、新能源 |
| > 40 | 高估或高成长 | 互联网、生物科技 |

### PE的局限性

1. **不适用于亏损公司**：亏损时EPS为负，PE无意义
2. **周期股失真**：周期行业在盈利高峰时PE反而最低，此时可能是卖出信号
3. **增长预期未反映**：高增长公司PE高但不一定贵，低增长公司PE低但不一定便宜

### PE与PEG

PEG = PE / 净利润增长率，是PE的改进版：

$$\text{PEG} = \frac{\text{PE}}{\text{净利润增长率(\%)}}$$

PEG < 1 通常被认为估值合理，PEG > 1 可能高估。

## 计算公式

$$\text{PE} = \frac{\text{股价}}{\text{每股收益(EPS)}} = \frac{\text{总市值}}{\text{净利润}}$$

**市盈率倒数（盈利收益率）：**
$$E/P = \frac{1}{\text{PE}}$$

盈利收益率可以与债券收益率、银行利率直接比较。

## Python 代码

```python
import akshare as ak
import pandas as pd

# 获取个股基本信息（含PE）
stock_info = ak.stock_individual_info_em(symbol="600519")
print(stock_info)

# 获取A股实时行情（含PE、PB等）
df = ak.stock_zh_a_spot_em()
# 筛选特定股票
target = df[df['代码'] == '600519'][['代码', '名称', '市盈率-动态']]
print(target)

# 计算PE
price = 1800  # 当前股价
eps = 50      # 每股收益
pe = price / eps
print(f"PE = {price} / {eps} = {pe:.1f}")

# 比较不同股票的PE
symbols = ['600519', '000858', '601318']
for code in symbols:
    row = df[df['代码'] == code]
    if not row.empty:
        name = row['名称'].values[0]
        pe_val = row['市盈率-动态'].values[0]
        print(f"{name}({code}): PE = {pe_val}")

# PE百分位分析（判断当前PE处于历史什么位置）
def pe_percentile(symbol, years=5):
    """计算PE在历史中的百分位"""
    df_hist = ak.stock_zh_a_hist(symbol=symbol, period="monthly",
                                  start_date=f"{2024-years}0101",
                                  end_date="20241231", adjust="qfq")
    # 注意：实际PE历史数据需要从其他数据源获取
    # 这里仅为演示计算逻辑
    pe_values = pd.Series(range(100))  # 模拟数据
    current_pe = pe_values.iloc[-1]
    percentile = (pe_values < current_pe).sum() / len(pe_values) * 100
    return percentile
```

## 常见误区

1. **"PE越低越好"** — 低PE可能是因为公司基本面恶化（价值陷阱），而不是被低估。需要结合行业特征和增长前景判断。
2. **"直接用PE跨行业比较"** — 不同行业的PE中枢差异很大。银行PE=6不代表比科技股PE=30更值得买，两者的盈利模式和增长预期完全不同。
3. **"忽略PE的变化趋势"** — PE从30降到15可能不是估值修复，而是盈利下滑导致的"被动降PE"。需要同时关注股价和盈利的变化方向。

## 相关概念

- [市净率PB](/k/pb) — 另一个常用的估值指标，用净资产替代盈利
- [每股收益EPS](/k/eps) — PE的分母，直接影响PE高低
