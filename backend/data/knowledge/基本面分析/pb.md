---
slug: pb
title: 市净率PB
category: 基本面分析
difficulty: 1
prerequisites: []
related: ["pe", "roe"]
tags: ["估值", "市净率", "PB"]
---

# 市净率PB

> 市净率衡量股价相对于每股净资产的倍数，适合评估资产密集型企业的估值。

## 定义

市净率（Price-to-Book Ratio，简称PB或P/B）是股票价格与每股净资产的比值。它反映的是：市场愿意为公司每1元净资产支付多少钱。

对程序员来说，PB就像一个"溢价倍数"——PB=1意味着你按账面价值买公司，PB=2意味着你支付了账面价值2倍的价格。

## 核心内容

### PB的解读

| PB范围 | 市场解读 | 适用场景 |
|--------|----------|----------|
| < 1 | 破净，可能低估 | 银行、地产等重资产行业 |
| 1-2 | 合理偏低 | 传统制造业 |
| 2-5 | 合理区间 | 消费、医药 |
| > 5 | 偏高 | 轻资产、科技公司 |

### PB与ROE的关系

PB和ROE（净资产收益率）有密切关系：

$$\text{PB} = \text{PE} \times \text{ROE}$$

这意味着：高ROE的公司理应享受更高的PB，因为同样的净资产能创造更多利润。

### PB的适用场景

**适合用PB的行业：**
- 银行、保险：资产主要是金融资产，账面价值可靠
- 地产：土地和房产有明确市场价值
- 钢铁、煤炭：重资产，账面价值接近实际价值

**不适合用PB的行业：**
- 互联网：核心价值是用户和数据，不在资产负债表上
- 医药：研发管线的价值无法用账面反映
- 品牌消费品：品牌价值是无形资产

## 计算公式

$$\text{PB} = \frac{\text{股价}}{\text{每股净资产}} = \frac{\text{总市值}}{\text{净资产}}$$

其中：
$$\text{净资产} = \text{总资产} - \text{总负债}$$

## Python 代码

```python
import akshare as ak
import pandas as pd

# 获取A股实时行情（含PB）
df = ak.stock_zh_a_spot_em()

# 筛选破净股（PB < 1）
broken_net = df[df['市净率'] < 1][['代码', '名称', '市净率', '最新价']]
broken_net = broken_net.sort_values('市净率')
print("破净股列表：")
print(broken_net.head(20))

# 获取特定股票的PB
target = df[df['代码'] == '600519'][['代码', '名称', '市净率']]
print(f"\n贵州茅台: PB = {target['市净率'].values[0]}")

# 计算PB
price = 1800       # 股价
bvps = 180         # 每股净资产
pb = price / bvps
print(f"PB = {price} / {bvps} = {pb:.2f}")

# PB与ROE的关系验证
pe = 30
roe = 0.30  # 30%
pb_calc = pe * roe
print(f"PB = PE × ROE = {pe} × {roe} = {pb_calc:.1f}")

# 行业PB对比
# 按行业分组计算平均PB
df['市净率'] = pd.to_numeric(df['市净率'], errors='coerce')
# 假设有行业分类数据，这里仅演示逻辑
bank_stocks = df[df['名称'].str.contains('银行', na=False)]
if not bank_stocks.empty:
    print(f"\n银行板块平均PB: {bank_stocks['市净率'].mean():.2f}")
```

## 常见误区

1. **"破净就是便宜"** — 破净（PB<1）可能说明市场认为公司的资产质量有问题，或者盈利能力太差。银行经常破净，但并不意味着银行股一定会涨。
2. **"轻资产公司不能用PB"** — 虽然PB对轻资产公司参考价值较低，但并非完全无用。可以结合行业特征，用修正后的PB（如加上无形资产估值）来评估。
3. **"忽略资产质量"** — PB只看账面价值，不看资产质量。两家PB相同的公司，一家持有优质资产，一家持有不良资产，投资价值完全不同。

## 相关概念

- [市盈率PE](/k/pe) — 用盈利替代净资产的估值指标
- [净资产收益率ROE](/k/roe) — PB的决定因素之一，反映资产的盈利能力
