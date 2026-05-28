---
slug: bond
title: 债券
category: 基础概念
difficulty: 1
prerequisites: []
related: ["convertible-bond", "fund", "stock"]
tags: ["债券", "固定收益", "利率"]
---

# 债券

> 债券是借款人向投资者出具的"借条"，承诺按期支付利息并到期归还本金。

## 定义

债券（Bond）是政府、金融机构、企业等为筹集资金而发行的、承诺按一定利率支付利息并按约定条件偿还本金的债权债务凭证。购买债券相当于把钱借给发行方，发行方承诺在未来按期还本付息。

对程序员来说，债券就像一个"带有明确回报承诺的定期存款"——你知道利息是多少、什么时候到期，风险比股票低得多。

## 核心内容

### 债券的核心要素

| 要素 | 说明 | 举例 |
|------|------|------|
| 面值 | 债券的票面价值，通常100元 | 100元 |
| 票面利率 | 每年支付的利息占面值的比例 | 3.5% |
| 到期日 | 债券归还本金的日期 | 2030年6月1日 |
| 付息方式 | 利息支付频率 | 每年一次、每半年一次 |
| 发行价格 | 债券实际出售的价格 | 可能高于或低于面值 |

### 债券分类

**按发行主体分：**

1. **国债**：中央政府发行，信用最高，利率较低
   - 记账式国债：可在交易所交易
   - 储蓄国债：面向个人，不可交易

2. **地方政府债**：地方政府发行，信用略低于国债

3. **企业债/公司债**：企业发行，利率较高但风险也较高
   - 企业债：由发改委审批
   - 公司债：由证监会审批

4. **金融债**：银行等金融机构发行

**按特征分：**
- **固定利率债券**：票面利率固定不变
- **浮动利率债券**：利率随基准利率调整
- **零息债券**：不付利息，以低于面值的价格发行，到期按面值偿还

### 债券价格与收益率的关系

债券价格和市场利率呈反向关系：
- 市场利率上升 → 已发行债券的价格下跌（因为新债券利率更高，旧债券吸引力下降）
- 市场利率下降 → 已发行债券的价格上升

### 举例说明

假设你买了一张面值100元、票面利率5%、期限5年的国债：
- 每年获得利息：100 x 5% = 5元
- 5年共获得利息：5 x 5 = 25元
- 到期收回本金100元
- 总收益 = 25元（不含再投资收益）

如果市场利率上升到6%，你的债券在二级市场会贬值（因为新发行的债券给6%，你的只给5%）。

## 计算公式

**债券当前收益率：**
$$\text{当前收益率} = \frac{\text{年利息}}{\text{当前市场价格}} \times 100\%$$

**到期收益率（YTM）：**
$$P = \sum_{t=1}^{n} \frac{C}{(1+y)^t} + \frac{F}{(1+y)^n}$$

其中 $P$ 是当前价格，$C$ 是每期利息，$F$ 是面值，$y$ 是到期收益率，$n$ 是剩余期数。

**久期（Duration）：**
$$D = \frac{\sum_{t=1}^{n} t \times \frac{C}{(1+y)^t} + n \times \frac{F}{(1+y)^n}}{P}$$

久期衡量债券价格对利率变化的敏感度，久期越长，利率风险越大。

## Python 代码

```python
import numpy as np
import pandas as pd
import akshare as ak

# 获取国债收益率数据
bond_yield = ak.bond_zh_us_rate(start_date="20240101")
print(bond_yield[['日期', '中国国债收益率2年', '中国国债收益率5年', '中国国债收益率10年']].tail())

# 计算债券当前收益率
def current_yield(annual_coupon, market_price):
    """计算当前收益率"""
    return annual_coupon / market_price

# 示例：面值100元，票面利率5%，当前市价98元
cy = current_yield(5, 98)
print(f"当前收益率: {cy:.2%}")

# 计算到期收益率（用数值方法求解）
def bond_price(ytm, coupon, face_value, periods):
    """给定YTM计算债券价格"""
    price = 0
    for t in range(1, periods + 1):
        price += coupon / (1 + ytm) ** t
    price += face_value / (1 + ytm) ** periods
    return price

def calc_ytm(price, coupon, face_value, periods, guess=0.05):
    """用牛顿法计算到期收益率"""
    ytm = guess
    for _ in range(100):
        p = bond_price(ytm, coupon, face_value, periods)
        dp = sum(-t * coupon / (1 + ytm)**(t+1) for t in range(1, periods+1))
        dp += -periods * face_value / (1 + ytm)**(periods+1)
        ytm = ytm - (p - price) / dp
        if abs(p - price) < 1e-8:
            break
    return ytm

# 示例：面值100，票息5%，5年期，当前价格97元
ytm = calc_ytm(price=97, coupon=5, face_value=100, periods=5)
print(f"到期收益率: {ytm:.2%}")

# 计算久期
def calc_duration(ytm, coupon, face_value, periods):
    """计算麦考利久期"""
    p = bond_price(ytm, coupon, face_value, periods)
    weighted_sum = sum(t * coupon / (1+ytm)**t for t in range(1, periods+1))
    weighted_sum += periods * face_value / (1+ytm)**periods
    return weighted_sum / p

dur = calc_duration(ytm, 5, 100, 5)
print(f"久期: {dur:.2f}年")
```

## 常见误区

1. **"债券没有风险"** — 债券面临利率风险（价格随利率波动）、信用风险（发行方违约）、流动性风险（无法及时卖出）。国债虽然信用风险极低，但利率风险依然存在。
2. **"票面利率就是实际收益"** — 票面利率只决定你每期收到的利息金额。如果买入价格不等于面值，实际收益率（到期收益率）与票面利率不同。
3. **"持有到期就不会亏"** — 虽然持有到期可以收回本金和利息，但如果考虑通胀因素，实际购买力可能下降。此外，提前卖出可能面临价格损失。

## 相关概念

- [可转债](/k/convertible-bond) — 可转换为股票的特殊债券
- [基金](/k/fund) — 债券基金是投资债券的便捷方式
- [股票](/k/stock) — 与债券互补的投资品种
