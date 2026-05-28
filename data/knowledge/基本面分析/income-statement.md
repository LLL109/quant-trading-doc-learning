---
slug: income-statement
title: 利润表
category: 基本面分析
difficulty: 2
prerequisites: []
related: ["balance-sheet", "cash-flow"]
tags: ["财务报表", "利润表", "损益表"]
---

# 利润表

> 利润表记录公司在一段时间内的收入、成本和利润，展示公司"赚了多少钱"。

## 定义

利润表（Income Statement，又称损益表）是三大财务报表之一，反映公司在一定期间内的经营成果。它从收入出发，逐层扣除各项成本费用，最终得出净利润。

对程序员来说，利润表就像一个"流水账"——先算总收入，再一层层扣成本、费用、税，最后剩多少就是净利润。

## 核心内容

### 利润表的层次结构

```
营业收入（卖产品/服务收到的钱）
  - 营业成本（生产成本）
  = 毛利润
  - 销售费用（广告、销售人员工资）
  - 管理费用（管理层工资、办公费）
  - 研发费用
  - 财务费用（利息支出-利息收入）
  = 营业利润
  + 营业外收入（卖资产、政府补贴）
  - 营业外支出
  = 利润总额
  - 所得税
  = 净利润
```

### 关键利润率指标

| 指标 | 公式 | 含义 |
|------|------|------|
| 毛利率 | 毛利润/营业收入 | 产品本身的盈利能力 |
| 净利率 | 净利润/营业收入 | 扣除所有费用后的最终盈利能力 |
| 营业利润率 | 营业利润/营业收入 | 主营业务的盈利能力 |

### 利润质量分析

1. **扣非净利润**：扣除非经常性损益后的净利润，更能反映主业盈利能力
2. **经营性利润占比**：营业利润占利润总额的比例越高越好
3. **现金流覆盖率**：经营现金流/净利润，大于1说明利润有现金支撑

## 计算公式

$$\text{毛利率} = \frac{\text{营业收入} - \text{营业成本}}{\text{营业收入}}$$

$$\text{净利率} = \frac{\text{净利润}}{\text{营业收入}}$$

$$\text{三费占比} = \frac{\text{销售费用} + \text{管理费用} + \text{财务费用}}{\text{营业收入}}$$

## Python 代码

```python
import akshare as ak
import pandas as pd

# 获取利润表数据
def get_income_statement(symbol):
    """获取利润表"""
    try:
        df = ak.stock_financial_report_sina(stock=symbol, symbol="利润表")
        return df
    except Exception as e:
        print(f"获取数据失败: {e}")
        return None

# 利润表结构分析
def analyze_income_statement(revenue, cogs, selling_exp, admin_exp,
                             finance_exp, rd_exp, other_income,
                             other_expense, tax):
    """分析利润表"""
    gross_profit = revenue - cogs
    operating_profit = gross_profit - selling_exp - admin_exp - finance_exp - rd_exp
    profit_before_tax = operating_profit + other_income - other_expense
    net_profit = profit_before_tax - tax

    return {
        '营业收入': revenue,
        '营业成本': cogs,
        '毛利润': gross_profit,
        '毛利率': gross_profit / revenue,
        '销售费用': selling_exp,
        '管理费用': admin_exp,
        '研发费用': rd_exp,
        '财务费用': finance_exp,
        '三费占比': (selling_exp + admin_exp + finance_exp) / revenue,
        '营业利润': operating_profit,
        '营业利润率': operating_profit / revenue,
        '净利润': net_profit,
        '净利率': net_profit / revenue,
    }

# 示例
result = analyze_income_statement(
    revenue=1500,       # 营收1500亿
    cogs=150,           # 成本150亿
    selling_exp=30,     # 销售费用
    admin_exp=80,       # 管理费用
    finance_exp=-10,    # 财务费用（负数表示利息收入大于支出）
    rd_exp=10,          # 研发费用
    other_income=5,
    other_expense=2,
    tax=200             # 所得税
)

print("利润表分析：")
for k, v in result.items():
    if '率' in k or '占比' in k:
        print(f"  {k}: {v:.2%}")
    else:
        print(f"  {k}: {v:.0f}亿")
```

## 常见误区

1. **"只看净利润"** — 净利润可能被非经常性损益美化。应该关注扣非净利润和经营性现金流。
2. **"利润增长就是好"** — 利润增长需要看来源。靠压缩研发投入带来的利润增长是不可持续的。
3. **"毛利率高就是好公司"** — 毛利率高但费用控制差的公司，净利率可能很低。需要看完整的利润链条。

## 相关概念

- [资产负债表](/k/balance-sheet) — 资产负债表是时点数据，利润表是时期数据
- [现金流量表](/k/cash-flow) — 利润表用权责发生制，现金流量表用收付实现制
