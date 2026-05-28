# 知识内容结构清单

> 每个知识点 = 一个独立页面 (`/k/{slug}`)
> 知识点之间通过 `[标题](/k/slug)` 语法互相链接

---

## 一、基础概念 (15个)

| # | slug | 标题 | 难度 | 前置知识 |
|---|------|------|------|---------|
| 1 | stock | 股票 | 1 | - |
| 2 | stock-market | 股票市场与交易所 | 1 | stock |
| 3 | a-share-rules | A股交易规则 | 1 | stock-market |
| 4 | etf | ETF基金 | 1 | stock |
| 5 | bond | 债券 | 1 | - |
| 6 | fund | 基金 | 1 | - |
| 7 | futures | 期货 | 2 | stock |
| 8 | convertible-bond | 可转债 | 2 | bond, stock |
| 9 | k-line | K线图 | 1 | stock |
| 10 | open-price | 开盘价 | 1 | k-line |
| 11 | close-price | 收盘价 | 1 | k-line |
| 12 | high-price | 最高价 | 1 | k-line |
| 13 | low-price | 最低价 | 1 | k-line |
| 14 | volume | 成交量 | 1 | stock |
| 15 | turnover | 换手率 | 1 | volume |

---

## 二、收益与风险 (10个)

| # | slug | 标题 | 难度 | 前置知识 |
|---|------|------|------|---------|
| 1 | return-rate | 收益率 | 1 | - |
| 2 | annualized-return | 年化收益率 | 1 | return-rate |
| 3 | volatility | 波动率 | 2 | return-rate |
| 4 | max-drawdown | 最大回撤 | 2 | return-rate |
| 5 | sharpe-ratio | 夏普比率 | 2 | annualized-return, volatility |
| 6 | calmar-ratio | 卡玛比率 | 2 | annualized-return, max-drawdown |
| 7 | win-rate | 胜率 | 1 | return-rate |
| 8 | profit-loss-ratio | 盈亏比 | 2 | win-rate |
| 9 | alpha | Alpha超额收益 | 3 | sharpe-ratio |
| 10 | beta | Beta系统性风险 | 3 | volatility |

---

## 三、技术分析 (15个)

| # | slug | 标题 | 难度 | 前置知识 |
|---|------|------|------|---------|
| 1 | ma | 均线 | 1 | close-price |
| 2 | sma | 简单移动平均线 SMA | 1 | ma |
| 3 | ema | 指数移动平均线 EMA | 2 | ma |
| 4 | golden-cross | 金叉 | 2 | sma, ema |
| 5 | death-cross | 死叉 | 2 | sma, ema |
| 6 | macd | MACD指标 | 2 | ema |
| 7 | rsi | RSI相对强弱指标 | 2 | close-price |
| 8 | boll | 布林带 BOLL | 2 | sma, volatility |
| 9 | kdj | KDJ指标 | 2 | k-line |
| 10 | trendline | 趋势线 | 2 | k-line |
| 11 | support | 支撑位 | 2 | trendline |
| 12 | resistance | 阻力位 | 2 | trendline |
| 13 | candlestick-patterns | 常见K线形态 | 2 | k-line |
| 14 | head-shoulders | 头肩顶/底形态 | 3 | trendline |
| 15 | divergence | 背离 | 3 | macd, rsi |

---

## 四、基本面分析 (10个)

| # | slug | 标题 | 难度 | 前置知识 |
|---|------|------|------|---------|
| 1 | pe | 市盈率 PE | 1 | stock |
| 2 | pb | 市净率 PB | 1 | stock |
| 3 | roe | 净资产收益率 ROE | 2 | stock |
| 4 | eps | 每股收益 EPS | 1 | stock |
| 5 | balance-sheet | 资产负债表 | 2 | - |
| 6 | income-statement | 利润表 | 2 | - |
| 7 | cash-flow | 现金流量表 | 2 | - |
| 8 | dividend-yield | 股息率 | 1 | stock |
| 9 | debt-ratio | 资产负债率 | 2 | balance-sheet |
| 10 | gross-margin | 毛利率 | 2 | income-statement |

---

## 五、量化策略 (10个)

| # | slug | 标题 | 难度 | 前置知识 |
|---|------|------|------|---------|
| 1 | quant-overview | 量化交易概述 | 1 | - |
| 2 | trend-following | 趋势跟踪策略 | 2 | ma, golden-cross |
| 3 | mean-reversion | 均值回归策略 | 3 | boll, rsi |
| 4 | momentum-rotation | 动量轮动策略 | 2 | return-rate |
| 5 | multi-factor | 多因子选股 | 3 | pe, pb, roe |
| 6 | arbitrage | 套利策略 | 3 | - |
| 7 | pair-trading | 配对交易 | 3 | mean-reversion |
| 8 | index-timing | 指数择时 | 2 | ma, trend-following |
| 9 | etf-rotation | ETF轮动策略 | 2 | etf, momentum-rotation |
| 10 | high-frequency | 高频交易(了解) | 4 | - |

---

## 六、回测 (10个)

| # | slug | 标题 | 难度 | 前置知识 |
|---|------|------|------|---------|
| 1 | backtest-overview | 回测概述 | 1 | quant-overview |
| 2 | future-function | 未来函数 | 2 | backtest-overview |
| 3 | survivorship-bias | 幸存者偏差 | 2 | backtest-overview |
| 4 | overfitting | 过拟合 | 3 | backtest-overview |
| 5 | in-sample-out-sample | 样本内与样本外 | 2 | backtest-overview |
| 6 | walk-forward | Walk-forward验证 | 3 | in-sample-out-sample |
| 7 | parameter-sensitivity | 参数敏感性分析 | 3 | overfitting |
| 8 | backtest-costs | 回测中的交易成本 | 2 | backtest-overview |
| 9 | backtest-pitfalls | 回测常见陷阱 | 2 | future-function, survivorship-bias |
| 10 | backtest-framework | Python回测框架 | 2 | backtest-overview |

---

## 七、风控与仓位 (8个)

| # | slug | 标题 | 难度 | 前置知识 |
|---|------|------|------|---------|
| 1 | position-sizing | 仓位管理概述 | 2 | - |
| 2 | fixed-position | 固定仓位 | 1 | position-sizing |
| 3 | equal-weight | 等权配置 | 1 | position-sizing |
| 4 | volatility-target | 波动率目标仓位 | 3 | volatility, position-sizing |
| 5 | stop-loss | 止损 | 2 | position-sizing |
| 6 | take-profit | 止盈 | 2 | position-sizing |
| 7 | drawdown-control | 回撤控制 | 3 | max-drawdown |
| 8 | trading-costs | 交易成本详解 | 2 | - |

---

## 八、数据与工具 (8个)

| # | slug | 标题 | 难度 | 前置知识 |
|---|------|------|------|---------|
| 1 | data-sources | 数据来源概述 | 1 | - |
| 2 | akshare | AKShare使用 | 1 | data-sources |
| 3 | tushare | Tushare使用 | 1 | data-sources |
| 4 | data-quality | 数据质量问题 | 2 | data-sources |
| 5 | price-adjustment | 前复权后复权 | 2 | close-price |
| 6 | missing-data | 缺失数据处理 | 2 | data-quality |
| 7 | python-stack | Python量化技术栈 | 1 | - |
| 8 | quant-system | 个人量化系统架构 | 2 | python-stack |

---

## 九、机器学习 (8个)

| # | slug | 标题 | 难度 | 前置知识 |
|---|------|------|------|---------|
| 1 | ml-in-quant | 机器学习在量化中的位置 | 2 | quant-overview |
| 2 | feature-engineering | 特征工程 | 3 | ml-in-quant |
| 3 | label-design | 标签设计 | 3 | ml-in-quant |
| 4 | linear-models | 线性模型 | 2 | ml-in-quant |
| 5 | tree-models | 树模型 (RF/XGBoost/LightGBM) | 3 | ml-in-quant |
| 6 | ml-overfitting | ML中的过拟合 | 3 | overfitting, ml-in-quant |
| 7 | ml-signal-filter | ML做信号过滤 | 3 | feature-engineering |
| 8 | ml-ranking | ML做排序选股 | 3 | feature-engineering, multi-factor |

---

## 十、入门路线 (5个)

| # | slug | 标题 | 难度 | 前置知识 |
|---|------|------|------|---------|
| 1 | learning-roadmap | 学习路线总览 | 1 | - |
| 2 | first-backtest | 第一个回测: 双均线 | 2 | ma, backtest-overview |
| 3 | first-rotation | 第一个策略: ETF轮动 | 2 | etf-rotation, momentum-rotation |
| 4 | first-risk | 第一次风控实践 | 2 | stop-loss, position-sizing |
| 5 | quant-principles | 量化交易十大原则 | 1 | - |

---

## 关联关系统计

| 关系类型 | 数量 | 说明 |
|---------|------|------|
| 前置知识 (prerequisite) | ~120 | 学习A前应先学B |
| 相关概念 (related) | ~80 | 同分类或相关联的概念 |
| 知识点总数 | 99 | 10个分类 |

---

## 内容编写优先级

**P0 (必须先写，约 40 个)**:
- 基础概念全部 15 个
- 收益与风险: return-rate, annualized-return, volatility, max-drawdown, sharpe-ratio
- 技术分析: ma, sma, ema, golden-cross, macd, rsi, boll
- 基本面: pe, pb, roe
- 量化策略: quant-overview, trend-following, momentum-rotation, etf-rotation
- 回测: backtest-overview, overfitting, future-function
- 入门路线: learning-roadmap, quant-principles

**P1 (第二优先)**:
- 技术分析剩余
- 回测剩余
- 风控全部
- 数据工具全部

**P2 (最后补充)**:
- 基本面剩余
- 机器学习全部
- 入门路线实战项目
