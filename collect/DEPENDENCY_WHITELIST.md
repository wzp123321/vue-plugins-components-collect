# 依赖白名单检查功能

## 功能说明

本项目实现了依赖白名单检查功能，确保只有白名单中的依赖才能被安装，防止未经审查的依赖进入项目。

## 支持的包管理器

- npm
- pnpm
- yarn

## 检查时机

### 1. 安装依赖时（preinstall hook）
- 执行 `npm install`、`pnpm install` 或 `yarn install` 时自动检查 `package.json` 中的所有依赖
- 执行 `npm install <package>`、`pnpm install <package>` 或 `yarn add <package>` 时，虽然不会直接触发 preinstall hook，但是当执行 `npm install`、`pnpm install` 或 `yarn install` 时，会检查所有依赖，包括新安装的依赖

### 2. Git 提交时（pre-commit hook）
执行 `git commit` 时自动检查 `package.json` 中的依赖，确保提交的代码符合依赖白名单要求

## 实现原理

1. **preinstall hook**：在 `package.json` 中设置 `preinstall` 脚本，执行依赖白名单检查
2. **git pre-commit hook**：在 `.husky/pre-commit` 中设置依赖白名单检查
3. **检查脚本**：`scripts/check-dependencies.js` 脚本会检查要安装的依赖或 `package.json` 中的依赖是否在白名单中

## 使用方法

### 安装依赖

**安装所有依赖：**
```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install
```

**安装单个依赖：**
```bash
# npm
npm install <package-name>

# pnpm
pnpm install <package-name>

# yarn
yarn add <package-name>
```

### 添加新依赖

1. **在白名单中添加依赖**：编辑 `dependency-whitelist.json` 文件，在相应的部分（dependencies 或 devDependencies）添加新依赖
2. **安装依赖**：使用上述命令安装依赖

## 错误处理

如果检测到不在白名单中的依赖，会显示错误信息：

```
❌ 依赖白名单检查失败！

以下依赖不在白名单中：

1. ant-design-vue

请将以上依赖添加到 dependency-whitelist.json 文件中，或移除它们。

添加新依赖的步骤：
1. 打开 dependency-whitelist.json 文件
2. 在相应的部分（dependencies 或 devDependencies）添加依赖
3. 保存文件并重新运行安装命令
```

## 注意事项

1. **关于 `install <package>` 的特殊情况**：当执行 `npm install <package>`、`pnpm install <package>` 或 `yarn add <package>` 时，不会直接触发 preinstall hook，但是当执行 `npm install`、`pnpm install` 或 `yarn install` 时，会检查所有依赖，包括新安装的依赖
2. **git pre-commit hook**：即使通过 `npm install <package>`、`pnpm install <package>` 或 `yarn add <package>` 安装了不在白名单中的依赖，也无法提交代码，因为 git pre-commit hook 会检查依赖白名单
3. **白名单配置**：修改 `dependency-whitelist.json` 文件后，需要同步更新 `package.json` 中的依赖版本
4. **调试模式**：可以使用 `--debug` 参数查看详细的检查信息

## 调试模式

启用调试模式查看详细信息：
```bash
node ./scripts/check-dependencies.js --debug
```

调试输出：
```
🔍 调试信息：
允许的依赖数量：80
要检查的依赖数量：80
✅ 依赖白名单检查通过！
检查的依赖数量：80
```
