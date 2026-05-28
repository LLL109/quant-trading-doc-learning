---
slug: dividend-yield
title: 股息率
category: 基本面分析
difficulty: 1
prerequisites: []
related: ["stock"]
tags: ["股息", "分红", "高股息"]
---

# 股息率

> 股息率是每股分红与股价的比值，衡量股票作为"收租资产"的回报水平。

## 定义

股息率（Dividend Yield）是每股年度股息与当前股价的比值。它回答的核心问题是：买这只股票，每年能收到多少分红？

对程序员来说，股息率就像"房租收益率"——你花100万买套房，每年收租5万，租金收益率就是5%。股息率就是股票的"租金收益率"。

## 核心内容

### 股息率的解读

| 股息率 | 评价 | 典型行业 |
|--------|------|----------|
| < 1% | 低分红 | 成长股、科技股 |
| 1%-3% | 一般 | 大部分蓝筹股 |
| 3%-5% | 较高 | 银行、公用事业 |
| > 5% | 高股息 | 煤炭、钢铁、地产 |

### 高股息策略

高股息策略是经典的量化因子之一，核心逻辑：
1. 高股息率通常意味着低估值（股息率=分红/股价，股价低则股息率高）
2. 持续高分红说明公司现金流充裕、经营稳健
3. 股息是实实在在的现金回报，不像股价那样虚无缥缈

### 分红与再投资

股息再投资（DRIP）是长期投资的加速器。假设股息率4%，每年将分红再买入股票，30年后总收益远超不分红的情况。

## 计算公式

$$\text{股息率} = \frac{\text{每股年度股息}}{\text{当前股价}} \times 100\%$$

**派息率（分红比例）：**
$$\text{派息率} = \frac{\text{分红总额}}{\text{净利润}} \times 100\%$$

派息率说明公司把多少利润分给了股东。

## Python 代码

```python
import akshare as ak
import pandas as pd

# 获取A股股息率数据
def get_dividend_yield():
    """获取高股息股票"""
    df = ak.stock_zh_a_spot_em()

    # 计算股息率（使用行情数据中的相关字段）
    # 注意：实时行情数据中可能直接包含股息率字段
    # 或者需要从分红数据中计算

    return df

# 计算股息率
def calc_dividend_yield(annual_dividend, price):
    """计算股息率"""
    return annual_dividend / price * 100

# 示例
price = 15.0        # 股价15元
annual_div = 0.6    # 每股分红0.6元
dy = calc_dividend_yield(annual_div, price)
print(f"股息率 = {annual_div} / {price} = {dy:.2f}%")

# 股息再投资模拟
def dividend_reinvestment_simulation(initial_invest, dividend_yield,
                                      price_growth, years):
    """模拟股息再投资"""
    shares = initial_invest / 100  # 假设初始股价100元
    price = 100
    total_dividends = 0

    for year in range(1, years + 1):
        # 收到分红
        dividend_per_share = price * dividend_yield
        annual_dividend = shares * dividend_per_share
        total_dividends += annual_dividend

        # 用分红买入更多股份
        new_shares = annual_dividend / price
        shares += new_shares

        # 股价增长
        price *= (1 + price_growth)

    final_value = shares * price
    total_return = (final_value / initial_invest - 1) * 100

    return {
        '最终持股数': shares,
        '最终股价': price,
        '最终市值': final_value,
        '累计分红': total_dividends,
        '总收益率': total_return,
    }

# 对比：有再投资 vs 无再投资
result = dividend_reinvestment_simulation(
    initial_invest=100000,  # 10万
    dividend_yield=0.04,    # 4%股息率
    price_growth=0.05,      # 股价年涨5%
    years=20
)

print("\n股息再投资20年模拟：")
for k, v in result.items():
    if '率' in k:
        print(f"  {k}: {v:.1f}%")
    elif '股' in k:
        print(f"  {k}: {v:.1f}股")
    else:
        print(f"  {k}: {v:,.0f}元")
```

## 常见误区

1. **"股息率越高越好"** — 股息率过高（>8%）可能是因为股价暴跌，而不是分红增加。需要判断高股息率是"便宜"还是"陷阱"。
2. **"忽视分红的持续性"** — 一次两次的高分红不代表长期稳定。应该看连续3-5年的分红记录。
3. **"不考虑税收"** — A股分红需要交税（持股超1年免税，1个月以内20%税）。实际到手的股息会打折扣。

## 相关概念

- [股票](/k/stock) — 股息率是股票投资的重要收益来源之一
