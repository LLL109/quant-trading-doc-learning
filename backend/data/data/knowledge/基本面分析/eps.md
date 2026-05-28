---
slug: eps
title: 每股收益EPS
category: 基本面分析
difficulty: 1
prerequisites: []
related: ["pe"]
tags: ["盈利", "每股收益", "EPS"]
---

# 每股收益EPS

> EPS表示公司每一股股票对应的净利润，是计算PE的基础，也是衡量公司盈利能力的核心指标。

## 定义

每股收益（Earnings Per Share，简称EPS）是归属于普通股股东的净利润除以总股本。它回答的核心问题是：一股股票能分到多少利润？

对程序员来说，EPS就像"每份股份的利润分成"——公司赚了100亿，总股本10亿股，那每股就赚了10元。

## 核心内容

### EPS的两种口径

1. **基本EPS**：直接用净利润除以总股本
2. **稀释EPS**：考虑可转债、期权等潜在稀释因素后的EPS（更保守）

### EPS的增长比绝对值更重要

一家EPS为5元的公司，如果每年增长20%，5年后EPS将达到12.4元。另一家EPS为10元的公司，如果每年只增长5%，5年后EPS只有12.8元。增长速度才是关键。

### EPS与分红

EPS是分红的上限——公司不可能把超过EPS的钱分给股东（长期来看）。但实际分红通常远低于EPS，剩余部分用于再投资。

## 计算公式

$$\text{EPS} = \frac{\text{净利润} - \text{优先股股利}}{\text{总股本}}$$

**加权平均EPS（更准确）：**
$$\text{EPS} = \frac{\text{净利润}}{\text{加权平均股本}}$$

因为年内可能有增发、回购等导致股本变化，所以用加权平均更准确。

## Python 代码

```python
import akshare as ak
import pandas as pd

# 计算EPS
def calc_eps(net_profit, shares):
    """计算每股收益"""
    return net_profit / shares

# 示例
net_profit = 750e8  # 净利润750亿
shares = 12.56e8    # 总股本12.56亿
eps = calc_eps(net_profit, shares)
print(f"EPS = {net_profit/1e8}亿 / {shares/1e8}亿 = {eps:.2f}元")

# EPS增长率
def eps_growth_rate(eps_current, eps_previous):
    """计算EPS增长率"""
    return (eps_current - eps_previous) / abs(eps_previous)

# 连续多年EPS增长
eps_history = [25.0, 30.0, 36.0, 43.0, 52.0]  # 5年EPS
years = [2019, 2020, 2021, 2022, 2023]

print("\nEPS历史及增长率：")
for i in range(len(eps_history)):
    if i == 0:
        print(f"  {years[i]}: EPS = {eps_history[i]:.2f}")
    else:
        growth = eps_growth_rate(eps_history[i], eps_history[i-1])
        print(f"  {years[i]}: EPS = {eps_history[i]:.2f}, 增长 {growth:.1%}")

# CAGR（复合增长率）
cagr = (eps_history[-1] / eps_history[0]) ** (1 / (len(eps_history) - 1)) - 1
print(f"\nEPS复合增长率(CAGR): {cagr:.1%}")

# 从PE和股价反推EPS
price = 1800
pe = 30
eps_calc = price / pe
print(f"\n股价{price}元, PE={pe}, 推算EPS = {eps_calc:.2f}元")
```

## 常见误区

1. **"EPS高就是好公司"** — EPS的绝对值受股本大小影响。一家总股本100亿股、EPS 1元的公司，可能比总股本1亿股、EPS 5元的公司赚得多得多。应该结合PE和增长率看。
2. **"忽略非经常性损益"** — 公司卖一栋楼可能大幅提高当年EPS，但这不是可持续的盈利。应该关注扣非EPS（扣除非经常性损益后的EPS）。
3. **"用过去EPS预测未来"** — EPS可能因为行业周期、竞争格局变化而波动。历史EPS只是参考，不能简单外推。

## 相关概念

- [市盈率PE](/k/pe) — PE = 股价 / EPS，EPS是PE的分母
