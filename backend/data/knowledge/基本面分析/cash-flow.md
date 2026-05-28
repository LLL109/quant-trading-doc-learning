---
slug: cash-flow
title: 现金流量表
category: 基本面分析
difficulty: 2
prerequisites: []
related: ["balance-sheet", "income-statement"]
tags: ["财务报表", "现金流"]
---

# 现金流量表

> 现金流量表记录公司现金的流入和流出，是检验利润真实性的"照妖镜"。

## 定义

现金流量表（Cash Flow Statement）是三大财务报表之一，反映公司在一定期间内现金的来源和去向。与利润表不同，现金流量表采用收付实现制，只记录实际收到和付出的现金。

对程序员来说，如果利润表是"应计制的账面收入"，那现金流量表就是"实际到账的钱"。利润可以被操纵，但现金流很难造假。

## 核心内容

### 三大现金流分类

#### 1. 经营活动现金流（CFO）

公司主业产生的现金流入流出：
- 流入：销售商品收到的现金、收到的税费返还
- 流出：购买原材料支付的现金、支付给员工的工资、交的税

**核心指标：经营现金流净额**

#### 2. 投资活动现金流（CFI）

公司投资相关的现金：
- 流入：收回投资、处置资产
- 流出：购买固定资产、对外投资

**投资现金流通常为负**，说明公司在扩张。

#### 3. 筹资活动现金流（CFF）

公司融资相关的现金：
- 流入：借款、发行股票
- 流出：偿还债务、分红、回购股票

### 现金流组合判断公司状态

| 经营 | 投资 | 筹资 | 公司状态 |
|------|------|------|----------|
| + | - | + | 成长期：主业赚钱，在扩张，同时融资 |
| + | - | - | 成熟期：主业赚钱，在扩张，同时还债/分红 |
| + | + | - | 收缩期：主业赚钱，卖资产，大量还债 |
| - | - | + | 初创期/衰退期：主业亏钱，靠融资维持 |

## 计算公式

**自由现金流（FCF）：**
$$\text{FCF} = \text{经营现金流净额} - \text{资本支出}$$

自由现金流是公司真正可自由支配的现金，是分红和回购的来源。

**现金流覆盖比：**
$$\text{现金流覆盖比} = \frac{\text{经营现金流净额}}{\text{净利润}}$$

大于1说明利润有现金支撑，利润质量高。

## Python 代码

```python
import akshare as ak
import pandas as pd

# 获取现金流量表
def get_cash_flow(symbol):
    """获取现金流量表"""
    try:
        df = ak.stock_financial_report_sina(stock=symbol, symbol="现金流量表")
        return df
    except Exception as e:
        print(f"获取数据失败: {e}")
        return None

# 现金流分析
def analyze_cash_flow(operating_cf, investing_cf, financing_cf,
                      net_profit, capex):
    """分析现金流"""
    fcf = operating_cf - capex
    cf_coverage = operating_cf / net_profit if net_profit != 0 else float('inf')

    # 判断公司状态
    if operating_cf > 0 and investing_cf < 0 and financing_cf > 0:
        status = "成长期"
    elif operating_cf > 0 and investing_cf < 0 and financing_cf < 0:
        status = "成熟期"
    elif operating_cf > 0 and investing_cf > 0 and financing_cf < 0:
        status = "收缩期"
    elif operating_cf < 0:
        status = "初创期或衰退期"
    else:
        status = "其他"

    return {
        '经营现金流': operating_cf,
        '投资现金流': investing_cf,
        '筹资现金流': financing_cf,
        '自由现金流': fcf,
        '现金流覆盖比': cf_coverage,
        '公司状态': status,
    }

# 示例
result = analyze_cash_flow(
    operating_cf=800,   # 经营现金流800亿
    investing_cf=-200,  # 投资现金流-200亿
    financing_cf=-300,  # 筹资现金流-300亿
    net_profit=750,     # 净利润750亿
    capex=150           # 资本支出150亿
)

print("现金流分析：")
for k, v in result.items():
    if '比' in k:
        print(f"  {k}: {v:.2f}")
    elif isinstance(v, (int, float)):
        print(f"  {k}: {v:.0f}亿")
    else:
        print(f"  {k}: {v}")

# 现金流质量判断
if result['现金流覆盖比'] > 1:
    print("\n结论：利润质量高，经营现金流覆盖净利润")
else:
    print("\n结论：利润质量存疑，经营现金流不足以覆盖净利润")
```

## 常见误区

1. **"经营现金流为正就安全"** — 经营现金流可能因为延迟付款（应付账款大增）而暂时为正，但这实际上是"赊账"，不是真正的现金流入。
2. **"投资现金流为负不好" — 投资现金流为负通常说明公司在扩张（买设备、建厂房），这在成长期是好事。关键是投资的回报率是否高于资本成本。
3. **"忽视现金流与利润的背离"** — 如果一家公司利润很高但经营现金流很低甚至为负，需要高度警惕。可能是应收账款堆积、存货积压，或者利润被美化了。

## 相关概念

- [资产负债表](/k/balance-sheet) — 三大报表的起点，反映时点财务状况
- [利润表](/k/income-statement) — 利润表用权责发生制，现金流表用收付实现制
