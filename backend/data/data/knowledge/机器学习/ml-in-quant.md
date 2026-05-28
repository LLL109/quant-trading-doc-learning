---
slug: ml-in-quant
title: ML在量化中的位置
category: 机器学习
difficulty: 2
prerequisites: ["quant-overview"]
related: ["feature-engineering"]
tags: ["机器学习", "量化", "ML"]
---

# ML在量化中的位置

> 机器学习是量化投资的高级工具，适合处理非线性关系和高维数据，但不是万能的。

## 定义

机器学习在量化投资中的应用（Machine Learning in Quantitative Finance）是指使用ML算法来辅助投资决策，包括选股、择时、风控等环节。它回答的核心问题是：ML能为量化投资带来什么？

对程序员来说，ML在量化中的角色就像"高级算法"——当简单的规则（均线、RSI）不够用时，ML能发现更复杂的模式。但ML不是银弹，它有自己的局限性。

## 核心内容

### ML在量化中的应用场景

#### 1. 选股（最常见）

用ML预测股票的未来收益或排名：
- **输入**：财务指标、技术指标、宏观数据
- **输出**：预期收益率或股票排名
- **算法**：XGBoost、LightGBM、神经网络

#### 2. 择时

用ML预测市场方向或波动率：
- **输入**：市场情绪、技术指标、资金流向
- **输出**：上涨/下跌概率
- **算法**：随机森林、LSTM、Transformer

#### 3. 风控

用ML识别异常交易或风险事件：
- **输入**：交易行为、市场状态
- **输出**：风险评分
- **算法**：异常检测、聚类

#### 4. 另类数据处理

用ML处理非结构化数据：
- **新闻情感分析**：NLP提取新闻情绪
- **卫星图像分析**：CV分析停车场车辆
- **社交媒体分析**：舆情监控

### ML vs 传统量化方法

| 维度 | 传统方法 | ML方法 |
|------|----------|--------|
| 关系假设 | 线性、可解释 | 非线性、黑箱 |
| 数据需求 | 低 | 高 |
| 过拟合风险 | 低 | 高 |
| 可解释性 | 高 | 低 |
| 维度处理 | 有限 | 强大 |
| 适用场景 | 因子明确 | 模式复杂 |

### ML在量化中的局限性

1. **信噪比低**：金融数据噪音极大，ML很难学到真正的信号
2. **非平稳性**：市场规律会变化，历史模式可能失效
3. **过拟合**：金融数据维度高、样本少，极易过拟合
4. **可解释性**：黑箱模型难以说服投资者和监管
5. **交易成本**：ML策略通常换手率高，交易成本侵蚀收益

### 什么时候用ML？

| 场景 | 是否适合ML |
|------|------------|
| 数据量大、维度高 | 适合 |
| 关系明显非线性 | 适合 |
| 有明确的经济逻辑 | 不太适合（用传统方法更好） |
| 数据量小 | 不适合 |
| 需要可解释性 | 不适合 |

## Python 代码

```python
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import TimeSeriesSplit
from sklearn.metrics import accuracy_score

# ML在量化选股中的应用示例

def prepare_features(data):
    """准备特征"""
    df = data.copy()

    # 技术指标特征
    df['ma5'] = df['close'].rolling(5).mean()
    df['ma20'] = df['close'].rolling(20).mean()
    df['ma_ratio'] = df['ma5'] / df['ma20']

    # 动量特征
    df['return_5d'] = df['close'].pct_change(5)
    df['return_20d'] = df['close'].pct_change(20)

    # 波动率特征
    df['volatility'] = df['close'].pct_change().rolling(20).std()

    # RSI
    delta = df['close'].diff()
    gain = delta.clip(lower=0).rolling(14).mean()
    loss = (-delta.clip(upper=0)).rolling(14).mean()
    rs = gain / loss
    df['rsi'] = 100 - (100 / (1 + rs))

    return df

def create_labels(df, forward_days=5, threshold=0.02):
    """创建标签（未来收益是否超过阈值）"""
    future_return = df['close'].pct_change(forward_days).shift(-forward_days)
    df['label'] = (future_return > threshold).astype(int)
    return df

def ml_stock_selection(data):
    """ML选股示例"""
    # 准备数据
    df = prepare_features(data)
    df = create_labels(df)
    df = df.dropna()

    # 特征和标签
    feature_cols = ['ma_ratio', 'return_5d', 'return_20d', 'volatility', 'rsi']
    X = df[feature_cols]
    y = df['label']

    # 时间序列交叉验证
    tscv = TimeSeriesSplit(n_splits=5)
    accuracies = []

    for train_idx, test_idx in tscv.split(X):
        X_train, X_test = X.iloc[train_idx], X.iloc[test_idx]
        y_train, y_test = y.iloc[train_idx], y.iloc[test_idx]

        # 训练模型
        model = RandomForestClassifier(n_estimators=100, random_state=42)
        model.fit(X_train, y_train)

        # 预测
        y_pred = model.predict(X_test)
        acc = accuracy_score(y_test, y_pred)
        accuracies.append(acc)

    return {
        '平均准确率': np.mean(accuracies),
        '标准差': np.std(accuracies),
        '特征重要性': dict(zip(feature_cols, model.feature_importances_)),
    }

# 模拟数据
np.random.seed(42)
n = 500
dates = pd.date_range('2020-01-01', periods=n, freq='B')
data = pd.DataFrame({
    'close': 100 * np.exp(np.cumsum(np.random.randn(n) * 0.02)),
    'volume': np.random.randint(1000000, 10000000, n),
}, index=dates)

# 运行ML选股
result = ml_stock_selection(data)

print("ML选股结果：")
print(f"  平均准确率: {result['平均准确率']:.2%}")
print(f"  标准差: {result['标准差']:.2%}")
print(f"\n特征重要性：")
for feature, importance in sorted(result['特征重要性'].items(),
                                   key=lambda x: x[1], reverse=True):
    print(f"  {feature}: {importance:.4f}")

print("\n注意：50%左右的准确率在金融预测中已经是不错的水平")
print("关键不在于准确率多高，而在于预测是否有足够的盈利空间")
```

## 常见误区

1. **"ML能预测股票价格"** — ML很难精确预测价格，但可以预测相对排名或涨跌概率。不要期望ML给你"明天涨跌"的答案。
2. **"模型越复杂越好"** — 在金融领域，简单的模型往往更稳健。深度学习在小数据集上容易过拟合。
3. **"忽略过拟合"** — 金融数据的信噪比极低，必须严格控制过拟合。交叉验证、正则化、特征选择都是必要的。

## 相关概念

- [量化投资概览](/k/quant-overview) — ML是量化投资的工具之一
- [特征工程](/k/feature-engineering) — ML在量化中的核心环节
