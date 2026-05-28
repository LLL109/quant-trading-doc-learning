---
slug: learning-roadmap
title: 学习路线
category: 入门路线
difficulty: 1
prerequisites: []
related: ["quant-overview", "backtest-overview", "trend-following", "momentum-rotation"]
tags: ["入门", "学习", "路线图"]
---

# 学习路线

> 量化交易学习分 5 个阶段：理解基础 → 写回测 → 做 3 个策略 → 做风控 → 再学 ML。

## 定义

这是一份面向程序员的量化交易学习路线图。它把量化交易的学习过程分解为 5 个阶段，每个阶段有明确的目标和产出。目标是让你从零开始，在 3-6 个月内能够独立开发和运行简单的量化策略。

## 核心内容

### 阶段 1：理解基础（1-2 周）

**目标**：理解股票市场的基本概念，能看懂行情数据。

**学习内容**：
- 股票、ETF、期货是什么
- K 线（OHLCV）数据结构
- 复权价格（前复权、后复权）的含义
- 涨跌幅、收益率的计算
- 市值、PE、PB 等基本面指标

**产出**：
- 能用 Python 读取和绘制 K 线图
- 理解 DataFrame 格式的行情数据
- 能计算简单的收益率指标

**推荐资源**：
- 《股票大作手回忆录》（了解市场本质）
- Tushare / AKShare（免费 A 股数据接口）
- matplotlib / mplfinance（K 线绘图）

```python
# 阶段 1 的典型代码
import akshare as ak
import mplfinance as mpf

# 获取数据
df = ak.stock_zh_a_hist(symbol="000001", period="daily", 
                         start_date="20230101", end_date="20231231")
df.columns = ['date', 'open', 'close', 'high', 'low', 'volume', 
              'turnover', 'amplitude', 'pct_change', 'change', 'turnover_rate']
df['date'] = pd.to_datetime(df['date'])
df.set_index('date', inplace=True)

# 绘制 K 线
mpf.plot(df, type='candle', volume=True, title='平安银行')
```

---

### 阶段 2：写回测（2-3 周）

**目标**：能独立写一个回测框架，理解回测的原理和陷阱。

**学习内容**：
- 回测的基本逻辑（逐日模拟）
- 信号生成、持仓计算、收益计算
- 未来函数和过拟合的概念
- 关键指标的计算（年化收益、最大回撤、夏普比率）
- 手续费和滑点的处理

**产出**：
- 自己写一个简单的回测框架（不用框架库）
- 理解为什么不能用当天收盘价当天买入
- 能计算和解读基本的绩效指标

**推荐路径**：
1. 先自己从零写回测（理解原理）
2. 再学习 backtrader / zipline（了解专业框架）
3. 最终可以基于 pandas 自己写轻量回测

```python
# 阶段 2 的典型代码：自己写回测
def backtest_simple(close, signal, commission=0.001):
    position = signal.shift(1).fillna(0)  # 信号延迟一天
    returns = position * close.pct_change()
    
    # 扣除手续费
    trades = position.diff().abs()
    cost = trades * commission
    net_returns = returns - cost
    
    cumulative = (1 + net_returns).cumprod()
    
    # 计算最大回撤
    drawdown = (cumulative / cumulative.cummax()) - 1
    max_drawdown = drawdown.min()
    
    print(f"总收益: {cumulative.iloc[-1]-1:.2%}")
    print(f"最大回撤: {max_drawdown:.2%}")
```

---

### 阶段 3：做 3 个策略（4-6 周）

**目标**：独立开发 3 个不同类型的策略，理解策略设计的核心思想。

**策略 1：均线趋势策略（2 周）**
- MA20/MA60 金叉死叉
- 理解趋势跟踪的逻辑
- 学会在震荡市中的局限性

**策略 2：动量轮动策略（2 周）**
- 选 3-5 个 ETF
- 60 日动量排名，月度调仓
- 加入债券切换（负动量保护）

**策略 3：RSI 均值回归策略（1-2 周）**
- RSI < 30 买入，RSI > 70 卖出
- 理解均值回归的逻辑
- 对比趋势策略和均值回归策略的差异

**产出**：
- 3 个完整的策略代码
- 每个策略的回测报告
- 对策略类型的深入理解

---

### 阶段 4：做风控（2-3 周）

**目标**：理解风险控制的重要性，能在策略中加入风控模块。

**学习内容**：
- 止损（固定止损、ATR 止损、移动止损）
- 仓位管理（固定仓位、凯利公式、风险平价）
- 最大回撤控制（回撤超过阈值减仓）
- 相关性管理（避免持仓高度相关）
- 资金管理（不要把所有钱都放进一个策略）

**产出**：
- 给阶段 3 的策略加入止损机制
- 实现简单的仓位管理
- 理解"先控制风险，再追求收益"的理念

```python
# 阶段 4 的典型代码：ATR 止损
def atr_stop_loss(close, high, low, period=14, multiplier=2):
    """ATR 止损"""
    tr = pd.DataFrame({
        'hl': high - low,
        'hc': abs(high - close.shift(1)),
        'lc': abs(low - close.shift(1))
    }).max(axis=1)
    
    atr = tr.rolling(period).mean()
    stop_loss = close - multiplier * atr  # 买入价 - 2倍ATR
    
    return stop_loss
```

---

### 阶段 5：进阶方向（持续学习）

**目标**：根据兴趣选择深入方向。

**方向 A：机器学习**
- 用 sklearn/xgboost 做特征预测
- 注意：ML 策略非常容易过拟合
- 建议先做好传统策略再尝试 ML

**方向 B：多因子选股**
- 价值因子（PE、PB）
- 动量因子（过去收益率）
- 质量因子（ROE、毛利率）
- 因子组合和权重优化

**方向 C：实盘交易**
- 券商 API 接入（如华泰、中信）
- 自动化下单系统
- 实盘监控和报警

**方向 D：另类数据**
- 新闻情绪分析
- 社交媒体数据
- 卫星图像数据

### 学习时间表总结

| 阶段 | 时间 | 核心任务 | 难度 |
|------|------|----------|------|
| 1. 理解基础 | 1-2 周 | 会读数据、会画图 | 入门 |
| 2. 写回测 | 2-3 周 | 自己写回测框架 | 初级 |
| 3. 做 3 策略 | 4-6 周 | 3 个完整策略 | 中级 |
| 4. 做风控 | 2-3 周 | 止损、仓位管理 | 中级 |
| 5. 进阶方向 | 持续 | ML/多因子/实盘 | 高级 |

## Python 代码

```python
# 学习路线各阶段的检查清单
roadmap = {
    "阶段1_理解基础": [
        "能用 Python 读取股票数据",
        "能绘制 K 线图",
        "理解复权价格",
        "能计算收益率",
    ],
    "阶段2_写回测": [
        "自己写过回测框架",
        "理解未来函数",
        "能计算年化收益、夏普比率、最大回撤",
        "知道过拟合是什么",
    ],
    "阶段3_做策略": [
        "完成均线趋势策略",
        "完成动量轮动策略",
        "完成 RSI 均值回归策略",
        "每个策略有完整回测报告",
    ],
    "阶段4_做风控": [
        "实现止损机制",
        "实现仓位管理",
        "理解回撤控制",
        "理解资金管理原则",
    ],
    "阶段5_进阶": [
        "选择一个深入方向",
        "持续学习和实践",
    ]
}

# 打印检查清单
for stage, items in roadmap.items():
    print(f"\n{stage}:")
    for item in items:
        print(f"  [ ] {item}")
```

## 常见误区

1. **跳过基础直接学 ML** — 很多程序员觉得传统策略"太简单"，想直接上机器学习。但如果不理解市场基础和策略逻辑，ML 模型只会成为过拟合的重灾区。
2. **花太多时间在回测框架上** — 回测框架重要，但不需要从零造轮子。理解原理后可以用成熟的框架（backtrader、zipline），把精力放在策略开发上。
3. **追求复杂策略** — 简单策略（如均线、动量）往往比复杂策略更稳健。不要为了"高级"而复杂化。先把简单策略做好，再考虑复杂化。
4. **忽视风控直接实盘** — 没有风控的策略就像没有刹车的车。即使回测很好，实盘中一次极端行情就可能爆仓。
5. **把量化交易当"圣杯"** — 量化交易不是躺赚机器。它需要持续学习、维护和优化。市场在变，策略也需要跟着变。

## 相关概念

- [量化交易概述](/k/quant-overview) — 量化交易的全景图
- [回测概述](/k/backtest-overview) — 阶段 2 的核心内容
- [趋势跟踪策略](/k/trend-following) — 阶段 3 的第一个策略
- [动量轮动策略](/k/momentum-rotation) — 阶段 3 的第二个策略
