---
slug: trendline
title: 趋势线
category: 技术分析
difficulty: 2
prerequisites: ["k-line"]
related: ["ma", "golden-cross", "death-cross"]
tags: ["趋势", "支撑阻力", "图形分析"]
---

# 趋势线

> 趋势线是连接价格高点或低点形成的直线，用于判断趋势方向和支撑阻力。

## 定义

趋势线（Trendline）是技术分析中最基础的图形工具之一。通过连接一系列价格高点或低点，画出一条直线，来直观地展示价格的运动方向。

类比：就像在地图上画一条路线，告诉你大致的行进方向。价格可能偶尔偏离路线，但只要不"破线"，大方向就没变。

## 核心内容

### 上升趋势线

- **画法**：连接两个或更多个依次抬高的**低点**
- **含义**：价格低点不断抬高，说明买方力量强于卖方
- **作用**：作为支撑线，价格回调到趋势线附近可能反弹
- **确认条件**：至少需要两个低点，第三个低点在趋势线上反弹则确认有效

### 下降趋势线

- **画法**：连接两个或更多个依次降低的**高点**
- **含义**：价格高点不断降低，说明卖方力量强于买方
- **作用**：作为阻力线，价格反弹到趋势线附近可能回落
- **确认条件**：至少需要两个高点，第三个高点在趋势线受阻则确认有效

### 趋势线的有效性

趋势线的有效性取决于：
1. **触及次数**：被价格触及的次数越多，趋势线越有效
2. **持续时间**：存在时间越长，趋势线越有效
3. **角度**：角度过陡的趋势线容易被突破
4. **成交量**：在趋势线上反弹时伴随放量，确认更可靠

### 趋势线的突破

- **有效突破**：价格收盘价突破趋势线（不是盘中瞬间穿越），且伴随成交量放大
- **假突破**：价格短暂穿越趋势线后又回来，成交量没有明显放大
- **突破确认**：通常需要连续 2-3 天收盘价在趋势线另一侧

### 趋势线的转换

当趋势线被有效突破后，原来的支撑线可能变成阻力线（或反过来），这叫"支撑阻力转换"。

## Python 代码

```python
import pandas as pd
import numpy as np
from scipy import stats

def find_pivots(high, low, n=5):
    """
    寻找价格的高点和低点（枢轴点）
    
    Parameters:
    high: 最高价序列
    low: 最低价序列
    n: 每侧需要 n 个点来确认枢轴
    
    Returns:
    pivot_high, pivot_low: 布尔序列，标记枢轴位置
    """
    pivot_high = pd.Series(False, index=high.index)
    pivot_low = pd.Series(False, index=low.index)
    
    for i in range(n, len(high) - n):
        # 高点：当前 high 比左右 n 个点都高
        if high.iloc[i] == high.iloc[i-n:i+n+1].max():
            pivot_high.iloc[i] = True
        # 低点：当前 low 比左右 n 个点都低
        if low.iloc[i] == low.iloc[i-n:i+n+1].min():
            pivot_low.iloc[i] = True
    
    return pivot_high, pivot_low

def fit_trendline(dates, prices):
    """
    拟合趋势线（线性回归）
    
    Parameters:
    dates: 日期序列
    prices: 价格序列
    
    Returns:
    slope, intercept, r_squared
    """
    x = np.arange(len(dates))
    y = prices.values
    slope, intercept, r_value, p_value, std_err = stats.linregress(x, y)
    return slope, intercept, r_value**2

# 使用示例
np.random.seed(42)
n = 100
dates = pd.date_range('2023-01-01', periods=n, freq='B')
# 模拟上升趋势
base = np.linspace(100, 120, n) + np.random.randn(n) * 2
high = pd.Series(base + np.abs(np.random.randn(n)), index=dates, name='high')
low = pd.Series(base - np.abs(np.random.randn(n)), index=dates, name='low')
close = pd.Series(base, index=dates, name='close')

# 寻找枢轴点
pivot_high, pivot_low = find_pivots(high, low, n=5)
print(f"高点枢轴数量: {pivot_high.sum()}")
print(f"低点枢轴数量: {pivot_low.sum()}")

# 用低点拟合上升趋势线
low_points = low[pivot_low]
if len(low_points) >= 2:
    slope, intercept, r2 = fit_trendline(low_points.index, low_points)
    print(f"趋势线斜率: {slope:.4f}")
    print(f"R²: {r2:.4f}")
```

## 常见误区

1. **趋势线必须精确连接每个点** — 趋势线不是精确的数学线，它是一个区域。价格可以在趋势线附近几个点的范围内波动，不必完全精确触及。
2. **趋势线可以无限延伸** — 趋势线的有效性会随时间减弱。一条存在了 6 个月的趋势线比存在 6 天的更可靠，但也不会永远有效。
3. **突破趋势线就一定要反向操作** — 需要区分有效突破和假突破。盘中短暂穿越不算突破，需要收盘价确认，最好还有成交量配合。
4. **趋势线角度越陡越好** — 过于陡峭的趋势线（超过 45 度）很难持续，容易被突破。45 度左右的趋势线通常更可持续。

## 相关概念

- [均线](/k/ma) — 另一种趋势判断工具
- [金叉](/k/golden-cross) — 趋势转变的信号
- [死叉](/k/death-cross) — 趋势转变的信号
- [K线](/k/k-line) — 趋势线连接的基本元素
