# 练习题扩充方案

## 目标

将练习题覆盖率从 17%（11/66）提升到 100%，每个知识点 3-5 道题，总计约 250 道。

## 数据格式

沿用现有 `basic.json` 格式，每个文件结构：

```json
[
  {
    "knowledge_slug": "知识点slug",
    "questions": [
      {
        "question": "题目文本",
        "question_type": "choice | true_false | fill",
        "options": ["A. ...", "B. ...", "C. ...", "D. ..."],  // choice 类型必须
        "answer": "B" | "对" | "填空答案",
        "explanation": "解析文本"
      }
    ]
  }
]
```

## 题型说明

| 类型 | 说明 | answer 格式 |
|------|------|-------------|
| `choice` | 单选题，4 个选项 | A/B/C/D |
| `true_false` | 判断题 | "对" 或 "错" |
| `fill` | 填空题，答案唯一 | 字符串 |

## 文件规划

| 文件 | 分类 | 知识点数 | 预计题数 | 状态 |
|------|------|---------|---------|------|
| `basic.json` | 基础概念 | 15 | ~60 | 已有3题，需扩充 |
| `technical.json` | 技术分析 | 11 | ~45 | 新建 |
| `fundamental.json` | 基本面分析 | 8 | ~32 | 新建 |
| `risk-return.json` | 收益与风险 | 10 | ~40 | 新建 |
| `strategy.json` | 量化策略 | 6 | ~24 | 新建 |
| `backtest.json` | 回测 | 6 | ~24 | 新建 |
| `risk-control.json` | 风控与仓位 | 5 | ~20 | 新建 |
| `tools.json` | 数据与工具 | 4 | ~16 | 新建 |
| `roadmap.json` | 入门路线 | 1 | ~4 | 新建 |

## 题目质量要求

1. **解析必须详细**：不只说"选B"，要解释为什么对、为什么错
2. **干扰项要合理**：错误选项应该是常见误解，不能一眼排除
3. **难度分布**：每个知识点的题目中，简单:中等:困难 ≈ 4:4:2
4. **关联知识点**：解析中可以引用其他知识点，加深理解
5. **A股场景**：题目尽量用A股市场的例子（如涨跌停10%、T+1等）

## 各分类覆盖清单

### 基础概念 (basic.json)
stock, k-line, etf, fund, bond, convertible-bond, futures, stock-market, a-share-rules, open-price, close-price, high-price, low-price, volume, turnover

### 技术分析 (technical.json)
ma, sma, ema, macd, rsi, kdj, boll, trendline, golden-cross, death-cross, candlestick-patterns

### 基本面分析 (fundamental.json)
pe, pb, roe, eps, dividend-yield, balance-sheet, income-statement, cash-flow

### 收益与风险 (risk-return.json)
return-rate, annualized-return, volatility, sharpe-ratio, max-drawdown, alpha, beta, calmar-ratio, win-rate, profit-loss-ratio

### 量化策略 (strategy.json)
quant-overview, trend-following, mean-reversion, momentum-rotation, multi-factor, etf-rotation

### 回测 (backtest.json)
backtest-overview, backtest-framework, overfitting, future-function, survivorship-bias, walk-forward

### 风控与仓位 (risk-control.json)
stop-loss, take-profit, position-sizing, drawdown-control, trading-costs

### 数据与工具 (tools.json)
data-sources, akshare, python-stack, quant-system

### 入门路线 (roadmap.json)
learning-roadmap
