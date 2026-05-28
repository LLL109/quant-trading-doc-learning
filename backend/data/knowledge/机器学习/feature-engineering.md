---
slug: feature-engineering
title: 特征工程
category: 机器学习
difficulty: 3
prerequisites: ["ml-in-quant"]
related: []
tags: ["特征工程", "机器学习", "因子"]
---

# 特征工程

> 特征工程是将原始数据转化为模型可用的特征的过程，是ML在量化中最重要的环节。

## 定义

特征工程（Feature Engineering）是将原始金融数据转化为机器学习模型可以使用的特征的过程。它回答的核心问题是：给模型喂什么数据？

对程序员来说，特征工程就像"数据预处理管道"——原始数据（股价、成交量）需要经过一系列转换（计算指标、标准化、去极值）才能被模型使用。

## 核心内容

### 常见的特征类型

#### 1. 价格特征

从价格数据衍生的特征：
- 收益率：日收益率、周收益率、月收益率
- 动量：过去N日累计收益
- 波动率：过去N日收益率的标准差
- 技术指标：RSI、MACD、布林带

#### 2. 成交量特征

从成交量数据衍生的特征：
- 量比：当日成交量 / 过去N日平均成交量
- 量价关系：价涨量增、价跌量缩等
- 换手率：成交量 / 流通股本

#### 3. 基本面特征

从财务数据衍生的特征：
- 估值因子：PE、PB、PS
- 盈利因子：ROE、毛利率、净利率
- 成长因子：营收增长率、利润增长率
- 质量因子：资产负债率、现金流覆盖率

#### 4. 市场特征

从市场整体数据衍生的特征：
- 市场情绪：涨跌家数比、涨停板数量
- 资金流向：北向资金、主力资金
- 行业轮动：行业相对强弱

### 特征处理的关键步骤

#### 1. 去极值（Winsorize）

将极端值限制在合理范围内：
```python
def winsorize(series, n_std=3):
    mean = series.mean()
    std = series.std()
    lower = mean - n_std * std
    upper = mean + n_std * std
    return series.clip(lower, upper)
```

#### 2. 标准化（Standardize）

将特征转化为均值为0、标准差为1的分布：
```python
def standardize(series):
    return (series - series.mean()) / series.std()
```

#### 3. 中性化（Neutralize）

去除行业和市值的影响：
```python
def neutralize(factor, industry, market_cap):
    # 回归：factor = a + b*market_cap + industry_dummy + residual
    # residual即为中性化后的因子
    pass
```

#### 4. 缺失值处理

- 前向填充：用前一天的值填充
- 行业均值填充：用同行业均值填充
- 删除：直接删除缺失样本

### 特征选择方法

| 方法 | 说明 | 优缺点 |
|------|------|--------|
| 相关性分析 | 去掉高度相关的特征 | 简单但可能遗漏非线性关系 |
| 特征重要性 | 用模型评估特征重要性 | 需要训练模型 |
| L1正则化 | Lasso自动选择特征 | 自动化但可能不稳定 |
| 递归消除 | 逐步删除最不重要的特征 | 计算量大 |

## Python 代码

```python
import pandas as pd
import numpy as np

class FeatureEngineer:
    """特征工程类"""

    def __init__(self):
        self.feature_names = []

    def add_price_features(self, df):
        """添加价格特征"""
        # 收益率
        for period in [1, 5, 10, 20]:
            col_name = f'return_{period}d'
            df[col_name] = df['close'].pct_change(period)
            self.feature_names.append(col_name)

        # 波动率
        df['volatility_20d'] = df['close'].pct_change().rolling(20).std()
        self.feature_names.append('volatility_20d')

        # 动量
        df['momentum_60d'] = df['close'].pct_change(60)
        self.feature_names.append('momentum_60d')

        return df

    def add_volume_features(self, df):
        """添加成交量特征"""
        # 量比
        df['volume_ratio'] = df['volume'] / df['volume'].rolling(20).mean()
        self.feature_names.append('volume_ratio')

        # 量价相关性
        df['price_volume_corr'] = df['close'].rolling(20).corr(df['volume'])
        self.feature_names.append('price_volume_corr')

        return df

    def add_technical_features(self, df):
        """添加技术指标特征"""
        # RSI
        delta = df['close'].diff()
        gain = delta.clip(lower=0).rolling(14).mean()
        loss = (-delta.clip(upper=0)).rolling(14).mean()
        rs = gain / loss
        df['rsi'] = 100 - (100 / (1 + rs))
        self.feature_names.append('rsi')

        # 布林带位置
        ma = df['close'].rolling(20).mean()
        std = df['close'].rolling(20).std()
        df['bb_position'] = (df['close'] - ma) / (2 * std)
        self.feature_names.append('bb_position')

        # 均线比值
        df['ma_ratio_5_20'] = (df['close'].rolling(5).mean() /
                                df['close'].rolling(20).mean())
        self.feature_names.append('ma_ratio_5_20')

        return df

    def process_features(self, df, winsorize_std=3):
        """处理特征：去极值、标准化"""
        for col in self.feature_names:
            if col in df.columns:
                # 去极值
                mean = df[col].mean()
                std = df[col].std()
                df[col] = df[col].clip(mean - winsorize_std * std,
                                        mean + winsorize_std * std)

                # 标准化
                df[col] = (df[col] - df[col].mean()) / df[col].std()

        return df

    def create_label(self, df, forward_days=5, threshold=0.02):
        """创建标签"""
        future_return = df['close'].pct_change(forward_days).shift(-forward_days)
        df['label'] = (future_return > threshold).astype(int)
        return df

    def build_dataset(self, df):
        """构建完整的数据集"""
        df = self.add_price_features(df)
        df = self.add_volume_features(df)
        df = self.add_technical_features(df)
        df = self.process_features(df)
        df = self.create_label(df)
        df = df.dropna()
        return df

# 使用示例
np.random.seed(42)
n = 500
dates = pd.date_range('2020-01-01', periods=n, freq='B')
data = pd.DataFrame({
    'close': 100 * np.exp(np.cumsum(np.random.randn(n) * 0.02)),
    'volume': np.random.randint(1000000, 10000000, n),
}, index=dates)

fe = FeatureEngineer()
dataset = fe.build_dataset(data)

print("特征工程示例：")
print(f"  特征数量: {len(fe.feature_names)}")
print(f"  样本数量: {len(dataset)}")
print(f"  标签分布: {dataset['label'].value_counts().to_dict()}")
print(f"\n特征列表：")
for feature in fe.feature_names:
    print(f"  - {feature}")
```

## 常见误区

1. **"特征越多越好"** — 过多的特征会导致维度灾难和过拟合。通常10-20个有效特征就足够。
2. **"使用未来数据"** — 特征计算时很容易不小心使用了未来数据（如用当天的收盘价计算当天的信号）。必须严格区分历史数据和当前数据。
3. **"忽略特征的经济逻辑"** — 纯数据驱动的特征可能只是噪音。好的特征应该有经济逻辑支撑。

## 相关概念

- [ML在量化中的位置](/k/ml-in-quant) — 特征工程是ML在量化中的核心环节
