---
slug: macd
title: MACD指标
category: 技术分析
difficulty: 2
prerequisites: ["ema"]
related: ["ema", "golden-cross", "death-cross", "rsi"]
tags: ["趋势指标", "动量", "背离"]
---

# MACD指标

> MACD 由两条 EMA 的差值构成，用于判断趋势方向和动量强弱。

## 定义

MACD（Moving Average Convergence Divergence，移动平均收敛/发散指标）由 Gerald Appel 在 1970 年代发明。它由三个部分组成：

- **DIF 线（MACD 线）**：EMA(12) - EMA(26)，快线
- **DEA 线（信号线）**：DIF 的 EMA(9)，慢线
- **MACD 柱状图**：(DIF - DEA) × 2，红绿柱

类比：DIF 是短期速度，DEA 是平均速度。当短期速度超过平均速度时（DIF > DEA），说明在加速上涨。

## 核心内容

### MACD 的三个组成部分

1. **DIF（快线）**：短期 EMA(12) 减去长期 EMA(26)
   - DIF > 0：短期均线在长期均线之上，偏多
   - DIF < 0：短期均线在长期均线之下，偏空

2. **DEA（慢线）**：DIF 的 9 日 EMA
   - 相当于 DIF 的"平滑版本"

3. **柱状图**：DIF 与 DEA 的差值，放大显示
   - 红柱（正值）：DIF > DEA，多方力量
   - 绿柱（负值）：DIF < DEA，空方力量

### MACD 金叉与死叉

- **金叉**：DIF 从下方上穿 DEA → 买入信号
- **死叉**：DIF 从上方下穿 DEA → 卖出信号

在零轴上方的金叉比零轴下方的金叉更可靠（因为大趋势本身就是向上的）。

### MACD 背离

背离是 MACD 最有价值的信号之一：

- **顶背离**：价格创新高，但 DIF 没有创新高 → 上涨动能减弱，可能见顶
- **底背离**：价格创新低，但 DIF 没有创新低 → 下跌动能减弱，可能见底

背离信号比交叉信号更提前，但也更容易出现"背离之后还有背离"的情况。

### MACD 的局限性

- 本质是趋势指标，在震荡市中表现差
- 信号有滞后性（基于 EMA）
- 背离信号可能提前很多，实际转折点难以把握

## 计算公式

$$DIF = EMA_{12} - EMA_{26}$$

$$DEA = EMA_9(DIF)$$

$$MACD_{柱} = 2 \times (DIF - DEA)$$

其中 EMA 的计算公式为：

$$EMA_t = \alpha \cdot P_t + (1-\alpha) \cdot EMA_{t-1}, \quad \alpha = \frac{2}{N+1}$$

## Python 代码

```python
import pandas as pd
import numpy as np

def calc_macd(close, fast=12, slow=26, signal=9):
    """
    计算 MACD 指标
    
    Parameters:
    close: 收盘价序列
    fast: 快线周期，默认 12
    slow: 慢线周期，默认 26
    signal: 信号线周期，默认 9
    
    Returns:
    DataFrame with columns: dif, dea, macd_hist
    """
    ema_fast = close.ewm(span=fast, adjust=False).mean()
    ema_slow = close.ewm(span=slow, adjust=False).mean()
    
    dif = ema_fast - ema_slow
    dea = dif.ewm(span=signal, adjust=False).mean()
    macd_hist = 2 * (dif - dea)
    
    return pd.DataFrame({
        'dif': dif,
        'dea': dea,
        'macd_hist': macd_hist
    }, index=close.index)

def detect_macd_cross(close, fast=12, slow=26, signal=9):
    """检测 MACD 金叉和死叉"""
    macd = calc_macd(close, fast, slow, signal)
    
    # 金叉：DIF 上穿 DEA
    macd['golden_cross'] = (
        (macd['dif'] >= macd['dea']) & 
        (macd['dif'].shift(1) < macd['dea'].shift(1))
    )
    
    # 死叉：DIF 下穿 DEA
    macd['death_cross'] = (
        (macd['dif'] <= macd['dea']) & 
        (macd['dif'].shift(1) > macd['dea'].shift(1))
    )
    
    return macd

# 使用示例
np.random.seed(42)
dates = pd.date_range('2023-01-01', periods=200, freq='B')
close = pd.Series(
    np.cumsum(np.random.randn(200) * 0.8) + 100,
    index=dates, name='close'
)

macd = calc_macd(close)
print(macd.tail(10))
```

## 常见误区

1. **MACD 金叉就是买入信号** — MACD 金叉在趋势行情中有效，但在震荡市中会频繁出现假信号。零轴上方的金叉比零轴下方的更可靠。
2. **背离一定会导致反转** — 背离只说明动能减弱，不保证价格一定反转。可能出现"背离之后还有背离"的情况，价格继续创新高/新低。
3. **MACD 适用于所有市场环境** — MACD 是趋势指标，在震荡市中表现很差。如果你的市场处于横盘整理状态，MACD 会给你很多假信号。
4. **柱状图的绝对值有意义** — 柱状图的绝对大小取决于价格水平和波动率。100 元股票的柱状图和 1000 元股票的不能直接比较。重要的是柱状图的变化趋势。

## 相关概念

- [EMA](/k/ema) — MACD 的基础构建模块
- [金叉](/k/golden-cross) — MACD 的金叉信号
- [死叉](/k/death-cross) — MACD 的死叉信号
- [RSI](/k/rsi) — 另一个常用的动量指标
