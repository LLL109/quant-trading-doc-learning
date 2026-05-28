---
slug: tree-models
title: 树模型
category: 机器学习
difficulty: 3
prerequisites: ["ml-in-quant"]
related: []
tags: ["树模型", "XGBoost", "LightGBM", "随机森林"]
---

# 树模型

> 树模型是量化投资中最常用的机器学习算法，以XGBoost和LightGBM为代表。

## 定义

树模型（Tree-based Models）是一类基于决策树的机器学习算法，包括随机森林、XGBoost、LightGBM等。它回答的核心问题是：在量化选股中，应该用什么算法？

对程序员来说，树模型就像"嵌套的if-else规则"——每个节点是一个条件判断，最终的叶子节点是预测结果。通过组合大量简单的规则，树模型能捕捉复杂的非线性关系。

## 核心内容

### 常见的树模型

#### 1. 决策树（Decision Tree）

最基础的树模型，通过一系列条件判断进行预测。

**优点**：可解释性强
**缺点**：容易过拟合

#### 2. 随机森林（Random Forest）

多棵决策树的集成，通过投票或平均得到最终结果。

**优点**：减少过拟合
**缺点**：计算量大

#### 3. XGBoost

梯度提升树的高效实现，是量化竞赛中的常胜将军。

**优点**：精度高、速度快、内置正则化
**缺点**：参数多、需要调参

#### 4. LightGBM

微软开源的梯度提升框架，比XGBoost更快。

**优点**：速度快、内存小、支持类别特征
**缺点**：小数据集可能过拟合

### 树模型在量化中的优势

1. **处理非线性关系**：股价与因子之间通常不是线性关系
2. **特征交互**：自动捕捉因子之间的交互效应
3. **鲁棒性**：对缺失值、异常值不敏感
4. **特征重要性**：可以输出特征重要性排序

### 树模型的局限性

1. **外推能力差**：树模型不能预测训练数据范围之外的值
2. **时序性弱**：标准树模型不考虑时间顺序
3. **过拟合风险**：金融数据信噪比低，树模型容易学到噪音

### 树模型 vs 线性模型

| 维度 | 线性模型 | 树模型 |
|------|----------|--------|
| 关系假设 | 线性 | 非线性 |
| 特征交互 | 手动构建 | 自动捕捉 |
| 可解释性 | 高 | 中等 |
| 过拟合风险 | 低 | 较高 |
| 训练速度 | 快 | 较慢 |

## Python 代码

```python
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.model_selection import TimeSeriesSplit
from sklearn.metrics import accuracy_score, classification_report

# 尝试导入XGBoost和LightGBM
try:
    from xgboost import XGBClassifier
    HAS_XGBOOST = True
except ImportError:
    HAS_XGBOOST = False
    print("XGBoost未安装，使用sklearn的GBM替代")

try:
    from lightgbm import LGBMClassifier
    HAS_LIGHTGBM = True
except ImportError:
    HAS_LIGHTGBM = False
    print("LightGBM未安装，使用sklearn的GBM替代")

def prepare_data(data, forward_days=5, threshold=0.02):
    """准备特征和标签"""
    df = data.copy()

    # 特征
    df['return_5d'] = df['close'].pct_change(5)
    df['return_20d'] = df['close'].pct_change(20)
    df['volatility'] = df['close'].pct_change().rolling(20).std()
    df['volume_ratio'] = df['volume'] / df['volume'].rolling(20).mean()
    df['ma_ratio'] = (df['close'].rolling(5).mean() /
                      df['close'].rolling(20).mean())

    # RSI
    delta = df['close'].diff()
    gain = delta.clip(lower=0).rolling(14).mean()
    loss = (-delta.clip(upper=0)).rolling(14).mean()
    rs = gain / loss
    df['rsi'] = 100 - (100 / (1 + rs))

    # 标签
    future_return = df['close'].pct_change(forward_days).shift(-forward_days)
    df['label'] = (future_return > threshold).astype(int)

    df = df.dropna()
    return df

def train_tree_models(X_train, y_train, X_test, y_test):
    """训练多种树模型"""
    models = {
        'RandomForest': RandomForestClassifier(
            n_estimators=100, max_depth=5, random_state=42
        ),
        'GradientBoosting': GradientBoostingClassifier(
            n_estimators=100, max_depth=3, random_state=42
        ),
    }

    if HAS_XGBOOST:
        models['XGBoost'] = XGBClassifier(
            n_estimators=100, max_depth=3, learning_rate=0.1,
            random_state=42, use_label_encoder=False, eval_metric='logloss'
        )

    if HAS_LIGHTGBM:
        models['LightGBM'] = LGBMClassifier(
            n_estimators=100, max_depth=3, learning_rate=0.1,
            random_state=42, verbose=-1
        )

    results = {}
    for name, model in models.items():
        model.fit(X_train, y_train)
        y_pred = model.predict(X_test)
        accuracy = accuracy_score(y_test, y_pred)
        results[name] = {
            'model': model,
            'accuracy': accuracy,
            'predictions': y_pred,
        }

    return results

def get_feature_importance(model, feature_names):
    """获取特征重要性"""
    importance = model.feature_importances_
    return dict(zip(feature_names, importance))

# 使用示例
np.random.seed(42)
n = 500
dates = pd.date_range('2020-01-01', periods=n, freq='B')
data = pd.DataFrame({
    'close': 100 * np.exp(np.cumsum(np.random.randn(n) * 0.02)),
    'volume': np.random.randint(1000000, 10000000, n),
}, index=dates)

# 准备数据
dataset = prepare_data(data)
feature_cols = ['return_5d', 'return_20d', 'volatility',
                'volume_ratio', 'ma_ratio', 'rsi']
X = dataset[feature_cols]
y = dataset['label']

# 时间序列分割
tscv = TimeSeriesSplit(n_splits=5)
all_results = []

for train_idx, test_idx in tscv.split(X):
    X_train, X_test = X.iloc[train_idx], X.iloc[test_idx]
    y_train, y_test = y.iloc[train_idx], y.iloc[test_idx]

    results = train_tree_models(X_train, y_train, X_test, y_test)
    all_results.append(results)

# 汇总结果
print("树模型比较：")
print("=" * 50)
for model_name in all_results[0].keys():
    accuracies = [r[model_name]['accuracy'] for r in all_results]
    print(f"{model_name}:")
    print(f"  平均准确率: {np.mean(accuracies):.2%}")
    print(f"  标准差: {np.std(accuracies):.2%}")

# 特征重要性
print("\n特征重要性（最后一个fold的模型）：")
best_model = all_results[-1]['RandomForest']['model']
importance = get_feature_importance(best_model, feature_cols)
for feature, imp in sorted(importance.items(), key=lambda x: x[1], reverse=True):
    print(f"  {feature}: {imp:.4f}")
```

## 常见误区

1. **"XGBoost永远最好"** — 没有永远最好的算法。在某些数据集上，随机森林可能比XGBoost更稳定。应该多个模型对比。
2. **"不调参直接用"** — 默认参数通常不是最优的。需要通过交叉验证来选择合适的参数（树深度、学习率、正则化系数等）。
3. **"忽略过拟合"** — 树模型在小数据集上很容易过拟合。需要限制树深度、使用正则化、早停等技巧。

## 相关概念

- [ML在量化中的位置](/k/ml-in-quant) — 树模型是ML在量化中最常用的算法
