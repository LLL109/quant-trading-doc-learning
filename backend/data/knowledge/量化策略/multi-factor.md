---
slug: multi-factor
title: 多因子选股
category: 量化策略
difficulty: 3
prerequisites: ["pe", "pb", "roe"]
related: ["quant-overview"]
tags: ["多因子", "选股", "因子投资"]
---

# 多因子选股

> 多因子选股通过组合多个有效的选股因子，构建跑赢基准的股票组合。

## 定义

多因子选股（Multi-Factor Stock Selection）是量化投资中最主流的策略框架。它的核心思想是：找到能够持续产生超额收益的"因子"（如低估值、高质量、动量等），然后综合多个因子来选股。

对程序员来说，多因子选股就像一个"多维度评分系统"——给每只股票在多个维度打分，最后综合排名，选分数最高的那批。

## 核心内容

### 常见的因子类别

#### 1. 价值因子（Value）

寻找被低估的股票：
- PE（市盈率）：越低越好
- PB（市净率）：越低越好
- 股息率：越高越好
- EV/EBITDA：越低越好

#### 2. 质量因子（Quality）

寻找基本面优质的公司：
- ROE（净资产收益率）：越高越好
- 毛利率：越高越好
- 资产负债率：越低越好
- 现金流质量：经营现金流/净利润 > 1

#### 3. 动量因子（Momentum）

寻找趋势向上的股票：
- 过去3/6/12个月涨幅：越高越好（但避开最近1个月）
- 相对强弱：跑赢同行的股票

#### 4. 低波因子（Low Volatility）

寻找波动较小的股票：
- 过去60日波动率：越低越好
- Beta：越低越好

### 因子构建流程

1. **因子计算**：对每只股票计算各因子值
2. **因子标准化**：Z-Score或排序百分位
3. **因子加权**：确定各因子的权重
4. **综合评分**：加权求和得到总分
5. **选股**：选总分最高的N只股票

### 因子有效性检验

| 检验方法 | 说明 |
|----------|------|
| IC分析 | 因子值与未来收益的相关系数 |
| 分层回测 | 按因子值分5组，比较各组收益 |
| 换手率 | 因子排名的稳定性 |
| 衰减分析 | 因子预测能力的持续时间 |

## 计算公式

**因子标准化（Z-Score）：**
$$Z_i = \frac{X_i - \bar{X}}{\sigma_X}$$

**综合评分：**
$$\text{Score}_i = \sum_{j=1}^{n} w_j \times Z_{ij}$$

其中 $w_j$ 是第 $j$ 个因子的权重，$Z_{ij}$ 是股票 $i$ 在因子 $j$ 上的标准分。

## Python 代码

```python
import pandas as pd
import numpy as np

class MultiFactorModel:
    """多因子选股模型"""

    def __init__(self, factor_weights=None):
        self.factor_weights = factor_weights or {
            'pe': -0.3,      # PE越低越好（负权重）
            'pb': -0.2,      # PB越低越好
            'roe': 0.3,      # ROE越高越好
            'momentum': 0.2, # 动量越高越好
        }

    def normalize_factor(self, series, method='zscore'):
        """因子标准化"""
        if method == 'zscore':
            return (series - series.mean()) / series.std()
        elif method == 'rank':
            return series.rank(pct=True)
        return series

    def calculate_score(self, df):
        """计算综合评分"""
        score = pd.Series(0, index=df.index)

        for factor, weight in self.factor_weights.items():
            if factor in df.columns:
                normalized = self.normalize_factor(df[factor])
                score += weight * normalized

        return score

    def select_stocks(self, df, top_n=20):
        """选股"""
        df['score'] = self.calculate_score(df)
        selected = df.nlargest(top_n, 'score')
        return selected

# 示例使用
def multi_factor_example():
    """多因子选股示例"""
    # 模拟股票数据
    np.random.seed(42)
    n_stocks = 100
    data = pd.DataFrame({
        'code': [f'{600000+i:06d}' for i in range(n_stocks)],
        'name': [f'股票{i}' for i in range(n_stocks)],
        'pe': np.random.uniform(5, 50, n_stocks),
        'pb': np.random.uniform(0.5, 5, n_stocks),
        'roe': np.random.uniform(0.05, 0.30, n_stocks),
        'momentum': np.random.uniform(-0.2, 0.3, n_stocks),
    })

    # 创建模型并选股
    model = MultiFactorModel()
    selected = model.select_stocks(data, top_n=10)

    print("多因子选股结果（Top 10）：")
    print(selected[['code', 'name', 'pe', 'pb', 'roe', 'momentum', 'score']])

    # 回测框架
    def backtest_factor(data_dict, years=3):
        """简化的因子回测"""
        results = []
        for year in range(years):
            # 每年调仓一次
            selected = model.select_stocks(data_dict[year], top_n=20)
            # 假设等权持有，计算收益
            avg_return = selected['future_return'].mean() if 'future_return' in selected.columns else 0
            results.append({
                'year': year,
                'selected_return': avg_return,
                'benchmark_return': data_dict[year]['future_return'].mean() if 'future_return' in data_dict[year].columns else 0
            })
        return pd.DataFrame(results)

# 运行示例
multi_factor_example()
```

## 常见误区

1. **"因子越多越好"** — 因子之间可能存在共线性，加入太多因子不会增加信息，反而会增加噪音。通常3-5个因子就足够。
2. **"忽略因子的时变性"** — 因子的有效性会随市场环境变化。价值因子在成长股牛市中可能失效。需要动态调整因子权重。
3. **"过拟合因子权重"** — 通过历史数据优化出的"最优"因子权重，可能是过拟合的结果。应该用经济逻辑而非纯数据驱动来确定权重。

## 相关概念

- [市盈率PE](/k/pe) — 价值因子的核心
- [市净率PB](/k/pb) — 价值因子的补充
- [净资产收益率ROE](/k/roe) — 质量因子的核心
- [量化投资概览](/k/quant-overview) — 多因子选股是量化的主流方法
