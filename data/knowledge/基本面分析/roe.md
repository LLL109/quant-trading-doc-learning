---
slug: roe
title: 净资产收益率ROE
category: 基本面分析
difficulty: 2
prerequisites: []
related: ["eps", "pb"]
tags: ["盈利能力", "ROE", "净资产收益率"]
---

# 净资产收益率ROE

> ROE衡量公司用股东的钱赚钱的效率，是巴菲特最看重的财务指标。

## 定义

净资产收益率（Return on Equity，简称ROE）是净利润与股东权益（净资产）的比值。它回答的核心问题是：股东每投入1元钱，公司能赚回多少利润？

对程序员来说，ROE就像"投资回报率"——你投入100万开公司，年赚30万，ROE就是30%。

## 核心内容

### ROE的解读

| ROE范围 | 评价 | 含义 |
|---------|------|------|
| < 5% | 差 | 不如银行存款 |
| 5%-10% | 一般 | 勉强及格 |
| 10%-15% | 良好 | 盈利能力不错 |
| 15%-20% | 优秀 | 护城河明显 |
| > 20% | 卓越 | 长期价值投资首选 |

### 杜邦分析

ROE可以分解为三个因素（杜邦分析）：

$$\text{ROE} = \text{净利率} \times \text{资产周转率} \times \text{权益乘数}$$

$$= \frac{\text{净利润}}{\text{营收}} \times \frac{\text{营收}}{\text{总资产}} \times \frac{\text{总资产}}{\text{净资产}}$$

**三种高ROE模式：**

1. **高净利率型**：茅台（品牌溢价）
2. **高周转型**：沃尔玛（薄利多销）
3. **高杠杆型**：银行（用别人的钱赚钱）

### ROE的持续性

真正优秀的公司不是偶尔一年ROE高，而是连续多年保持高ROE。巴菲特的标准是：连续10年ROE > 15%。

## 计算公式

$$\text{ROE} = \frac{\text{净利润}}{\text{股东权益}} = \frac{\text{净利润}}{\text{净资产}}$$

**年化ROE（使用平均净资产）：**
$$\text{ROE} = \frac{\text{净利润}}{(\text{期初净资产} + \text{期末净资产}) / 2}$$

## Python 代码

```python
import akshare as ak
import pandas as pd

# 获取个股财务指标
# 使用akshare获取ROE数据
def get_roe_history(symbol):
    """获取股票ROE历史数据"""
    # 获取主要财务指标
    df = ak.stock_financial_abstract_ths(symbol=symbol, indicator="按年度")
    return df

# 示例：获取贵州茅台的财务数据
# 注意：akshare的API可能更新，请查阅最新文档
symbol = "600519"

# 手动计算ROE
def calc_roe(net_profit, equity):
    """计算ROE"""
    return net_profit / equity

# 杜邦分析分解
def dupont_analysis(net_profit, revenue, total_assets, equity):
    """杜邦分析"""
    net_margin = net_profit / revenue
    asset_turnover = revenue / total_assets
    equity_multiplier = total_assets / equity
    roe = net_margin * asset_turnover * equity_multiplier

    return {
        'ROE': roe,
        '净利率': net_margin,
        '资产周转率': asset_turnover,
        '权益乘数': equity_multiplier
    }

# 示例计算
result = dupont_analysis(
    net_profit=750,   # 净利润（亿）
    revenue=1500,     # 营收（亿）
    total_assets=2000, # 总资产（亿）
    equity=1500        # 净资产（亿）
)

print("杜邦分析结果：")
for k, v in result.items():
    if k == 'ROE' or k == '净利率':
        print(f"  {k}: {v:.2%}")
    else:
        print(f"  {k}: {v:.2f}")

# ROE筛选股票
df = ak.stock_zh_a_spot_em()
# 注意：实时行情通常不含ROE，需要从财务数据获取
# 这里仅为演示筛选逻辑
print("ROE > 15% 的股票通常具有较好的投资价值")
```

## 常见误区

1. **"ROE越高越好"** — 过高的ROE（>30%）可能是高杠杆导致的，而不是真正的盈利能力强。银行ROE看起来很高，但大量使用负债，风险也大。
2. **"只看单年ROE"** — 单年ROE可能受一次性收益影响（如卖资产）。应该看连续3-5年的ROE趋势。
3. **"忽略ROE的来源"** — 同样是20%的ROE，靠高净利率实现的（茅台）比靠高杠杆实现的（某些地产公司）质量更高。杜邦分析能帮你分辨。

## 相关概念

- [每股收益EPS](/k/eps) — ROE的分子部分（每股层面）
- [市净率PB](/k/pb) — PB = PE × ROE，ROE是PB的核心驱动因素
