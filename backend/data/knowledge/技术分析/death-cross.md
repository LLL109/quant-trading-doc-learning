---
slug: death-cross
title: 死叉
category: 技术分析
difficulty: 2
prerequisites: ["sma", "ema"]
related: ["golden-cross", "macd", "ma"]
tags: ["卖出信号", "均线交叉", "趋势"]
---

# 死叉

> 死叉是短期均线从上方下穿长期均线形成的交叉，被视为看跌信号。

## 定义

死叉（Death Cross）是金叉的镜像——短期移动平均线向下穿越长期移动平均线。这被解读为空方力量增强、趋势可能由涨转跌的信号。

类比：班级的"近期平均分"跌破了"长期平均分"，说明最近表现下滑，可能进入下降通道。

## 核心内容

### 死叉的形成过程

1. **上涨或盘整阶段**：短期均线在长期均线之上
2. **价格开始回落**：短期均线开始走平或转向向下
3. **交叉发生**：短期均线向下穿越长期均线 → 死叉形成
4. **确认阶段**：交叉后价格继续下跌，两条均线都向下发散

### 死叉 vs 金叉对比

| 特性 | 金叉 | 死叉 |
|------|------|------|
| 方向 | 短期均线上穿长期 | 短期均线下穿长期 |
| 信号 | 看涨/买入 | 看跌/卖出 |
| 经典组合 | MA50 上穿 MA200 | MA50 下穿 MA200 |
| 市场含义 | 牛市确认 | 熊市确认 |

### 死叉的特殊含义

MA50 下穿 MA200 的死叉在历史上往往伴随着较大级别的下跌。从统计数据看，美股历史上出现这种死叉后，市场在未来 6-12 个月的表现通常较弱。

但这并不意味着出现死叉就应该清仓——死叉确认时，市场可能已经跌了不少。

### 死叉后的常见走势

- **V 型反转**：死叉后很快又金叉回来（假信号）
- **持续下跌**：死叉后均线向下发散，价格持续走低（真信号）
- **横盘整理**：死叉后价格在低位震荡，均线粘合

## Python 代码

```python
import pandas as pd
import numpy as np

def detect_death_cross(df, short_period=20, long_period=60):
    """
    检测死叉信号
    
    Parameters:
    df: DataFrame，需包含 'close' 列
    short_period: 短期均线周期
    long_period: 长期均线周期
    
    Returns:
    DataFrame，增加 ma_short, ma_long, death_cross 列
    """
    df = df.copy()
    df['ma_short'] = df['close'].rolling(window=short_period).mean()
    df['ma_long'] = df['close'].rolling(window=long_period).mean()
    
    # 判断死叉：今天短期均线 <= 长期均线，昨天短期均线 > 长期均线
    df['death_cross'] = (
        (df['ma_short'] <= df['ma_long']) & 
        (df['ma_short'].shift(1) > df['ma_long'].shift(1))
    )
    
    return df

def detect_all_crosses(df, short_period=20, long_period=60):
    """同时检测金叉和死叉"""
    df = detect_death_cross(df, short_period, long_period)
    
    df['golden_cross'] = (
        (df['ma_short'] >= df['ma_long']) & 
        (df['ma_short'].shift(1) < df['ma_long'].shift(1))
    )
    
    # 信号汇总
    df['signal'] = 'none'
    df.loc[df['golden_cross'], 'signal'] = 'golden_cross'
    df.loc[df['death_cross'], 'signal'] = 'death_cross'
    
    return df

# 使用示例
np.random.seed(42)
dates = pd.date_range('2023-01-01', periods=300, freq='B')
prices = pd.Series(
    np.cumsum(np.random.randn(300) * 0.8) + 100,
    index=dates, name='close'
)
df = pd.DataFrame({'close': prices})

result = detect_all_crosses(df, short_period=20, long_period=60)
signals = result[result['signal'] != 'none']
print(signals[['close', 'ma_short', 'ma_long', 'signal']])
```

## 常见误区

1. **死叉出现就应该立刻卖出** — 死叉确认时价格可能已经跌了相当幅度。而且死叉也可能是假信号，需要结合其他指标确认。
2. **死叉一定比金叉更可靠** — 没有证据表明死叉信号比金叉更准确。两者都可能产生假信号，都需要配合其他分析方法。
3. **忽略交易成本** — 如果金叉买、死叉卖，在震荡市中会频繁交易，手续费和滑点可能吃掉大部分利润。
4. **死叉和金叉是精确的点** — 交叉发生在一个时间点，但趋势转变是一个过程。不要追求精确的交叉点，而应关注整体趋势。

## 相关概念

- [金叉](/k/golden-cross) — 死叉的反向信号，看涨
- [MACD](/k/macd) — MACD 也有金叉死叉概念
- [SMA](/k/sma) — 死叉使用的基础均线类型
- [趋势线](/k/trendline) — 另一种趋势判断工具
