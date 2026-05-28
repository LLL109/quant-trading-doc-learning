---
slug: balance-sheet
title: 资产负债表
category: 基本面分析
difficulty: 2
prerequisites: []
related: ["income-statement", "cash-flow"]
tags: ["财务报表", "资产负债表"]
---

# 资产负债表

> 资产负债表是公司在某一时点的"财务快照"，展示公司拥有什么（资产）、欠了多少（负债）、净值多少（净资产）。

## 定义

资产负债表（Balance Sheet）是三大财务报表之一，反映公司在特定日期的财务状况。它遵循一个基本等式：

$$\text{资产} = \text{负债} + \text{股东权益}$$

对程序员来说，资产负债表就像一个"资源清单"——左边列你拥有的东西，右边列你欠别人的东西和真正属于你的净值。

## 核心内容

### 三大组成部分

#### 1. 资产（Assets）——公司拥有的资源

**流动资产（一年内可变现）：**
- 货币资金：银行存款、现金
- 应收账款：客户欠公司的钱
- 存货：原材料、在产品、产成品
- 交易性金融资产：短期投资

**非流动资产（长期持有）：**
- 固定资产：厂房、设备
- 无形资产：专利、商标、土地使用权
- 商誉：收购溢价

#### 2. 负债（Liabilities）——公司欠别人的

**流动负债（一年内需偿还）：**
- 短期借款
- 应付账款：欠供应商的钱
- 预收账款：客户预付的钱

**非流动负债（长期债务）：**
- 长期借款
- 应付债券

#### 3. 股东权益（Equity）——属于股东的净值

- 股本：发行股票收到的钱
- 资本公积：股票溢价
- 盈余公积：从利润中提取
- 未分配利润：累计留存收益

### 关键分析指标

| 指标 | 公式 | 含义 |
|------|------|------|
| 资产负债率 | 负债/资产 | 财务杠杆水平 |
| 流动比率 | 流动资产/流动负债 | 短期偿债能力 |
| 速动比率 | (流动资产-存货)/流动负债 | 更严格的短期偿债能力 |

## Python 代码

```python
import akshare as ak
import pandas as pd

# 获取资产负债表数据
def get_balance_sheet(symbol):
    """获取资产负债表关键数据"""
    # akshare提供多种财务报表接口
    # 请查阅最新文档获取正确的API
    try:
        df = ak.stock_financial_report_sina(stock=symbol, symbol="资产负债表")
        return df
    except Exception as e:
        print(f"获取数据失败: {e}")
        return None

# 手动分析资产负债表结构
def analyze_balance_sheet(total_assets, current_assets, total_liabilities,
                          current_liabilities, equity):
    """分析资产负债表关键指标"""
    results = {
        '资产负债率': total_liabilities / total_assets,
        '流动比率': current_assets / current_liabilities,
        '净资产': total_assets - total_liabilities,
    }

    # 判断财务健康状况
    debt_ratio = results['资产负债率']
    if debt_ratio < 0.4:
        results['财务评价'] = '保守稳健'
    elif debt_ratio < 0.6:
        results['财务评价'] = '适中'
    elif debt_ratio < 0.7:
        results['财务评价'] = '偏高'
    else:
        results['财务评价'] = '高风险'

    return results

# 示例：分析一家公司
result = analyze_balance_sheet(
    total_assets=2000,     # 总资产2000亿
    current_assets=1200,   # 流动资产1200亿
    total_liabilities=800, # 总负债800亿
    current_liabilities=600, # 流动负债600亿
    equity=1200            # 净资产1200亿
)

print("资产负债表分析：")
for k, v in result.items():
    if isinstance(v, float):
        print(f"  {k}: {v:.2%}" if '率' in k else f"  {k}: {v:.0f}亿")
    else:
        print(f"  {k}: {v}")
```

## 常见误区

1. **"资产越多越好"** — 资产的质量比数量更重要。应收账款太多可能是收不回来的坏账，存货太多可能是滞销品。
2. **"负债都是坏事"** — 适度负债可以提高ROE（杠杆效应）。关键是负债的成本是否低于资产的收益率。
3. **"只看总数不看结构"** — 两家总资产相同的公司，一家主要是现金，一家主要是商誉，投资价值完全不同。

## 相关概念

- [利润表](/k/income-statement) — 利润表记录一段时间的经营成果
- [现金流量表](/k/cash-flow) — 现金流量表记录现金的流入流出
