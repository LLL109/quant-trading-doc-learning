---
slug: golden-cross
title: 金叉
category: 技术分析
difficulty: 2
prerequisites: ["sma", "ema"]
related: ["death-cross", "macd", "ma"]
tags: ["买入信号", "均线交叉", "趋势"]
---

# 金叉

> 金叉是短期均线从下方上穿长期均线形成的交叉，被视为看涨信号。

## 定义

金叉（Golden Cross）是指短期移动平均线向上穿越长期移动平均线的交叉点。在技术分析中，这被解读为多方力量增强、趋势可能由跌转涨的信号。

类比：就像一个班级的"近期平均分"超过了"长期平均分"，说明最近表现变好了，可能进入上升通道。

## 核心内容

### 典型金叉组合

| 组合 | 适用场景 | 信号频率 |
|------|----------|----------|
| MA5 上穿 MA20 | 短线 | 频繁，噪音多 |
| MA10 上穿 MA30 | 短中线 | 较频繁 |
| MA20 上穿 MA60 | 中线 | 适中 |
| MA50 上穿 MA200 | 长线（最经典） | 罕见，信号强 |

最经典的金叉是 **MA50 上穿 MA200**（也叫"黄金交叉"），在美股市场中被视为牛市确认信号。

### 金叉的形成过程

1. **下跌或盘整阶段**：短期均线在长期均线之下
2. **价格企稳反弹**：短期均线开始走平或转向
3. **交叉发生**：短期均线向上穿越长期均线 → 金叉形成
4. **确认阶段**：交叉后价格继续上涨，两条均线都向上发散

### 为什么金叉有效（部分情况下）

- 短期均线代表近期市场平均成本
- 长期均线代表较长期的平均成本
- 当短期成本超过长期成本，说明近期买入的人开始盈利
- 盈利效应可能吸引更多买盘，推动价格继续上涨

### 金叉的局限性

在震荡市中，价格上下波动会导致短期均线反复穿越长期均线，产生大量假信号。每次金叉买入、死叉卖出，结果可能是反复小亏。

## Python 代码

```python
import pandas as pd
import numpy as np

def detect_golden_cross(df, short_period=20, long_period=60):
    """
    检测金叉信号
    
    Parameters:
    df: DataFrame，需包含 'close' 列
    short_period: 短期均线周期
    long_period: 长期均线周期
    
    Returns:
    DataFrame，增加 ma_short, ma_long, golden_cross 列
    """
    df = df.copy()
    df['ma_short'] = df['close'].rolling(window=short_period).mean()
    df['ma_long'] = df['close'].rolling(window=long_period).mean()
    
    # 判断金叉：今天短期均线 >= 长期均线，昨天短期均线 < 长期均线
    df['golden_cross'] = (
        (df['ma_short'] >= df['ma_long']) & 
        (df['ma_short'].shift(1) < df['ma_long'].shift(1))
    )
    
    return df

# 使用示例
np.random.seed(42)
dates = pd.date_range('2023-01-01', periods=300, freq='B')
prices = pd.Series(
    np.cumsum(np.random.randn(300) * 0.8) + 100,
    index=dates, name='close'
)
df = pd.DataFrame({'close': prices})

# 检测 MA20/MA60 金叉
result = detect_golden_cross(df, short_period=20, long_period=60)

# 打印所有金叉日期
golden_dates = result[result['golden_cross']]
print(f"共检测到 {len(golden_dates)} 次金叉")
print(golden_dates[['close', 'ma_short', 'ma_long']])
```

## 常见误区

1. **金叉出现就该买入** — 金叉只是历史数据计算的结果，不能保证未来上涨。在震荡市中金叉可能是假信号。需要结合成交量、市场环境综合判断。
2. **所有金叉效果一样** — 不同周期组合的金叉含义差异很大。MA50 上穿 MA200 的信号远比 MA5 上穿 MA10 可靠，但出现频率也低得多。
3. **金叉是精确的买卖点** — 金叉确认时价格可能已经涨了一段，它更适合确认趋势方向，而不是精确定位买入点。
4. **只看金叉不看死叉** — 只关注买入信号不关注卖出信号，会导致"会买不会卖"。完整的交易系统需要同时定义进出场规则。

## 相关概念

- [死叉](/k/death-cross) — 金叉的反向信号，看跌
- [MACD](/k/macd) — MACD 金叉是更常用的交叉信号
- [SMA](/k/sma) — 金叉使用的基础均线类型
- [EMA](/k/ema) — 也可用于构建金叉信号
