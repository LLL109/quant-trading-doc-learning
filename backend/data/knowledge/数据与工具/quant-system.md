---
slug: quant-system
title: 量化系统架构
category: 数据与工具
difficulty: 2
prerequisites: ["python-stack"]
related: []
tags: ["系统架构", "量化系统"]
---

# 量化系统架构

> 量化系统架构是将数据、策略、回测、风控、交易等模块整合在一起的软件系统设计。

## 定义

量化系统架构（Quantitative Trading System Architecture）是量化交易平台的整体设计，包括数据流、模块划分、接口设计等。它回答的核心问题是：如何搭建一个完整的量化交易系统？

对程序员来说，量化系统架构就像"微服务架构"——每个模块（数据、策略、回测、风控）都是独立的服务，通过接口通信，最终组合成一个完整的系统。

## 核心内容

### 量化系统的核心模块

```
┌─────────────────────────────────────────────────────────────┐
│                      量化交易系统                              │
├─────────────┬─────────────┬─────────────┬──────────────────┤
│   数据层     │   策略层     │   执行层     │    监控层        │
├─────────────┼─────────────┼─────────────┼──────────────────┤
│ 数据采集     │ 因子计算     │ 订单管理     │ 绩效分析         │
│ 数据清洗     │ 信号生成     │ 风控检查     │ 风险监控         │
│ 数据存储     │ 仓位计算     │ 交易执行     │ 告警通知         │
│ 数据服务     │ 组合优化     │ 成交回报     │ 日志记录         │
└─────────────┴─────────────┴─────────────┴──────────────────┘
```

### 各模块详解

#### 1. 数据层

**职责**：获取、清洗、存储、提供数据

**组件**：
- 数据采集器：从各数据源获取原始数据
- 数据清洗器：处理缺失值、异常值、复权等
- 数据存储：数据库（MySQL/PostgreSQL）或文件（CSV/Parquet）
- 数据服务：提供统一的数据查询接口

#### 2. 策略层

**职责**：生成交易信号

**组件**：
- 因子计算引擎：计算各种选股因子
- 信号生成器：根据因子生成买卖信号
- 仓位计算器：确定每只股票的目标仓位
- 组合优化器：考虑约束条件优化组合

#### 3. 执行层

**职责**：将信号转化为实际交易

**组件**：
- 订单管理：生成、修改、取消订单
- 风控检查：交易前的风险检查
- 交易接口：对接券商交易API
- 成交回报：处理成交确认

#### 4. 监控层

**职责**：监控系统运行状态和策略表现

**组件**：
- 绩效分析：计算收益、风险指标
- 风险监控：实时监控风险敞口
- 告警通知：异常情况告警
- 日志记录：记录系统运行日志

### 数据流设计

```
数据源 → 数据采集 → 数据清洗 → 数据存储
                                    ↓
                              数据查询服务
                                    ↓
                          因子计算 → 信号生成
                                    ↓
                          仓位计算 → 风控检查
                                    ↓
                          订单生成 → 交易执行
                                    ↓
                          成交回报 → 绩效分析
```

### 技术选型建议

| 组件 | 推荐技术 | 备选 |
|------|----------|------|
| 数据存储 | SQLite/MySQL | PostgreSQL, HDF5 |
| 任务调度 | APScheduler | Celery, Airflow |
| 消息队列 | Redis | RabbitMQ, Kafka |
| Web界面 | Flask/FastAPI | Django, Streamlit |
| 监控告警 | 自研 | Grafana, Prometheus |

## Python 代码

```python
from dataclasses import dataclass
from typing import List, Dict, Optional
from datetime import datetime
import pandas as pd
import numpy as np

# 数据模型定义
@dataclass
class Signal:
    """交易信号"""
    symbol: str
    direction: int  # 1: 买入, -1: 卖出
    weight: float   # 目标权重
    timestamp: datetime
    reason: str

@dataclass
class Order:
    """订单"""
    symbol: str
    side: str  # 'buy' or 'sell'
    quantity: int
    price: float
    order_type: str  # 'market' or 'limit'
    timestamp: datetime

# 数据层
class DataService:
    """数据服务"""

    def __init__(self):
        self.cache = {}

    def get_daily_data(self, symbol: str, start_date: str, end_date: str) -> pd.DataFrame:
        """获取日线数据"""
        # 实际实现中会从数据库或API获取
        # 这里返回模拟数据
        dates = pd.date_range(start_date, end_date, freq='B')
        np.random.seed(hash(symbol) % 2**32)
        prices = 100 * np.exp(np.cumsum(np.random.randn(len(dates)) * 0.02))
        return pd.DataFrame({
            'close': prices,
            'open': prices * (1 + np.random.randn(len(dates)) * 0.01),
            'high': prices * (1 + abs(np.random.randn(len(dates)) * 0.015)),
            'low': prices * (1 - abs(np.random.randn(len(dates)) * 0.015)),
            'volume': np.random.randint(1000000, 10000000, len(dates)),
        }, index=dates)

# 策略层
class StrategyEngine:
    """策略引擎"""

    def __init__(self, data_service: DataService):
        self.data_service = data_service

    def calculate_signals(self, symbols: List[str], date: str) -> List[Signal]:
        """计算交易信号"""
        signals = []
        for symbol in symbols:
            df = self.data_service.get_daily_data(symbol, "2023-01-01", date)
            if len(df) < 20:
                continue

            # 简单均线策略
            ma5 = df['close'].rolling(5).mean().iloc[-1]
            ma20 = df['close'].rolling(20).mean().iloc[-1]

            if ma5 > ma20:
                signals.append(Signal(
                    symbol=symbol,
                    direction=1,
                    weight=0.1,
                    timestamp=datetime.now(),
                    reason="MA5 > MA20"
                ))

        return signals

# 风控层
class RiskManager:
    """风控管理器"""

    def __init__(self, max_position=0.2, max_drawdown=-0.2):
        self.max_position = max_position
        self.max_drawdown = max_drawdown

    def check_signal(self, signal: Signal, current_positions: Dict) -> bool:
        """检查信号是否通过风控"""
        # 检查单只股票仓位上限
        current_weight = current_positions.get(signal.symbol, 0)
        if current_weight + signal.weight > self.max_position:
            return False
        return True

# 系统整合
class QuantSystem:
    """量化系统主类"""

    def __init__(self):
        self.data_service = DataService()
        self.strategy = StrategyEngine(self.data_service)
        self.risk_manager = RiskManager()

    def run_daily(self, symbols: List[str], date: str):
        """每日运行流程"""
        # 1. 计算信号
        signals = self.strategy.calculate_signals(symbols, date)
        print(f"生成 {len(signals)} 个信号")

        # 2. 风控检查
        approved_signals = []
        for signal in signals:
            if self.risk_manager.check_signal(signal, {}):
                approved_signals.append(signal)
        print(f"通过风控 {len(approved_signals)} 个信号")

        # 3. 生成订单
        orders = self.generate_orders(approved_signals)
        print(f"生成 {len(orders)} 个订单")

        return orders

    def generate_orders(self, signals: List[Signal]) -> List[Order]:
        """将信号转化为订单"""
        orders = []
        for signal in signals:
            orders.append(Order(
                symbol=signal.symbol,
                side='buy' if signal.direction == 1 else 'sell',
                quantity=1000,
                price=0,  # 市价单
                order_type='market',
                timestamp=datetime.now()
            ))
        return orders

# 使用示例
print("量化系统架构示例：")
print("=" * 40)

system = QuantSystem()
symbols = ['600519', '000858', '601318']
orders = system.run_daily(symbols, "2024-12-31")

print(f"\n订单详情：")
for order in orders:
    print(f"  {order.symbol}: {order.side} {order.quantity}股")
```

## 常见误区

1. **"一开始就追求大而全"** — 量化系统应该从小开始，逐步迭代。先实现核心功能（数据+策略+回测），再添加风控、监控等模块。
2. **"过度设计"** — 个人量化不需要企业级架构。SQLite + pandas + 简单脚本就能开始，不需要微服务、消息队列等重型架构。
3. **"忽略数据质量"** — 再好的策略也救不了垃圾数据。数据层应该是系统中最可靠的部分。

## 相关概念

- [Python量化技术栈](/k/python-stack) — 量化系统的构建依赖Python技术栈
