---
title: uuid
lang: zh-CN
---

### 导入

```typescript
import { UuidUtil } from "@zpackage/tools";
```

### 生成一串随机的 uuid 字符串

```typescript
const uuid = UuidUtil.uuid32(); // string
```

### 生成 4 位十六进制随机数

```typescript
const s4 = UuidUtil.s4(); // string
```
