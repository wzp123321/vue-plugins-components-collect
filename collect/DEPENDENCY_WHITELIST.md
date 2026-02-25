# 依赖白名单检查功能

## 功能说明

本项目实现了依赖白名单检查功能，确保只有白名单中的依赖才能被安装，防止未经审查的依赖进入项目。

## 检查时机

依赖白名单会在以下时机自动检查：

### 1. 安装依赖时（preinstall hook）
运行 `pnpm install` 时自动检查 `package.json` 中的所有依赖。

### 2. Git 提交时（pre-commit hook）
执行 `git commit` 时自动检查 `package.json` 中的依赖，确保提交的代码符合依赖白名单要求。

## 使用方法

### 方式一：使用安全安装命令（推荐）

**安装 package.json 中的所有依赖：**
```bash
pnpm run safe-install
```

**安装单个依赖：**
```bash
pnpm run safe-install <package-name>
```

**安装多个依赖：**
```bash
pnpm run safe-install package1 package2 package3
```

**使用其他 pnpm 选项：**
```bash
pnpm run safe-install --save-dev package-name
pnpm run safe-install --global package-name
```

### 方式二：直接使用 pnpm install

**注意：** 当使用 `pnpm i <package-name>` 直接安装单个包时，不会触发 preinstall hook，所以无法拦截安装。

**安装 package.json 中的所有依赖：**
```bash
pnpm install
```

如果所有依赖都在白名单中，会显示：
```
✅ 依赖白名单检查通过！
```

### 添加新依赖的流程

**推荐方式（使用安全安装命令）：**
```bash
# 1. 先在白名单中添加依赖
# 编辑 dependency-whitelist.json，添加新依赖

# 2. 使用安全安装命令安装
pnpm run safe-install <package-name>
```

**传统方式：**
```bash
# 1. 先在白名单中添加依赖
# 编辑 dependency-whitelist.json，添加新依赖

# 2. 在 package.json 中添加依赖
# 编辑 package.json，添加新依赖

# 3. 运行安装命令
pnpm install
```

### 手动检查
```bash
node ./scripts/check-dependencies.js
```

## 文件说明

### dependency-whitelist.json
依赖白名单配置文件，包含所有允许安装的依赖包。

### scripts/check-dependencies.js
依赖检查脚本，可以独立运行或被其他脚本调用。

### scripts/safe-install.js
安全安装脚本，先检查白名单，然后再执行安装。

### .husky/pre-commit
Git pre-commit hook，在提交前检查依赖。

## 错误处理

如果检测到不在白名单中的依赖，会显示错误信息：

```
❌ 依赖白名单检查失败！

以下依赖不在白名单中：

1. some-package@1.0.0

请将以上依赖添加到 dependency-whitelist.json 文件中，或移除它们。

添加新依赖的步骤：
1. 打开 dependency-whitelist.json 文件
2. 在相应的部分（dependencies 或 devDependencies）添加依赖
3. 保存文件并重新运行安装命令
```

## 注意事项

1. **推荐使用安全安装命令**：`pnpm run safe-install` 可以拦截所有安装操作，包括单个包的安装
2. **直接使用 pnpm install 的限制**：`pnpm i <package-name>` 不会触发 preinstall hook，无法拦截单个包的安装
3. 修改 `dependency-whitelist.json` 后，需要同步更新 `package.json` 中的依赖版本
4. 如果需要临时禁用检查，可以设置环境变量 `HUSKY=0` 来跳过 Git hooks
5. 检查会在安装依赖和提交代码时自动执行，确保依赖始终在白名单中

## 调试模式

启用调试模式查看详细信息：
```bash
node ./scripts/check-dependencies.js --debug
```

调试输出：
```
🔍 调试信息：
允许的依赖数量：80
当前的依赖数量：80
✅ 依赖白名单检查通过！
检查的依赖数量：80
```
