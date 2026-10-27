# 后端设计 · <需求名>

> task_id: `<id>` · 版本: v1 · 依赖契约: `interface-contract.md` v<n> (LOCKED)
> 作者: 04 后端架构师

## 1. 概述

- **目标**：<对应需求 spec 的哪些验收标准>
- **影响服务**：<服务清单>
- **不在本文范围**：<如：前端页面、历史数据清洗>

## 2. 数据模型

### 2.1 表结构

| 表 | 变更 | 说明 |
|---|---|---|
| `t_xxx` | 新增 | |
| `t_yyy` | 加字段 | 非空，默认 0 |

**新增表 DDL**
```sql
CREATE TABLE t_xxx (
  id        VARCHAR(32) NOT NULL COMMENT '主键',
  name      VARCHAR(64) NOT NULL COMMENT '名称',
  status    TINYINT     NOT NULL DEFAULT 0 COMMENT '状态 0-草稿 1-生效',
  create_at DATETIME    NOT NULL,
  PRIMARY KEY (id),
  INDEX idx_status (status)
);
```

### 2.2 索引与容量

- 索引：`idx_status` —— 支撑 §3 的列表查询
- 容量预估：3 年内 < 50w 行，单表足够

## 3. 接口实现

### IF-1 <用途>

- **逻辑**：1. 校验权限 2. 查询 3. 组装响应
- **事务边界**：只读，无事务
- **幂等**：是（天然幂等）
- **慢查询风险**：`status + create_at` 联合过滤走 `idx_status`，预估扫描 < 1w 行

**关键 SQL**
```sql
SELECT id, name, status FROM t_xxx
WHERE status = ? ORDER BY create_at DESC LIMIT ?, ?;
```

### IF-2 <写接口>

- **逻辑**：1. 校验入参 2. 幂等检查 3. 写入 4. 返回
- **事务边界**：单表写入，事务内只包含 INSERT
- **幂等**：基于 `biz_key` 唯一索引，重复请求返回首次结果
- **并发**：唯一索引兜底，冲突返回 `E_DUPLICATE`

## 4. 校验与权限

| 项 | 规则 |
|---|---|
| 入参 | `name` 长度 1-64，去空格后非空 |
| 鉴权点 | `xxx:view` / `xxx:edit` |
| 数据权限 | 按 `tenant_id` 隔离 |

## 5. 异常与兜底

| 场景 | 处理 |
|---|---|
| DB 超时 | 3s 超时，返回 `E_TIMEOUT`，前端可重试 |
| 重复提交 | 唯一索引冲突 → `E_DUPLICATE` |
| 依赖服务不可用 | 降级返回空列表 + 告警 |

## 6. 兼容与迁移

- **老数据**：存量 `t_yyy` 的 `status` 按规则回填，SQL 见附录
- **灰度**：按 `tenant_id` 白名单放量
- **回滚**：本次为新增表 + 加字段，回滚只需摘流量，**无需删表**（保留兼容）

## 7. 非功能

- 性能：IF-1 P95 < 300ms（数据量 < 1w）
- 监控：新增「IF-1 耗时」「写失败率」两个埋点
- 日志：写操作记录操作人与变更前后值

## 8. 契约依赖

| 依赖接口 | 契约版本 | 若变更影响章节 |
|---|---|---|
| IF-1 | v2 | §3 IF-1、§2.2 索引 |

## 9. 变更历史

| 版本 | 变更内容 | 触发 | 日期 |
|---|---|---|---|
| v1 | 初稿 | — | |
