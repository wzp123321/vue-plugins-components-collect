# 天溯初始化工程模板

## ts-web-template

### 使用steps

1.切换到公司私有源

```
npm run set-registry
```

2.安转依赖包

```
npm install

```

3.启动开发环境

```
npm run dev

```

4.构建依赖包打包输出目录dist

```
npm run build

```

执行ts类型检查

```
npm run ts-check

```

检查js代码规范以及修复

```
npm run lint

```

检查css代码规范以及修复

```
npm run lint:css

```

代码提交message

```
fix|feat|update: 提交日志
示例: fix: 修复xxxbug

```

## 项目目录结构说明

```
├─public    公共目录不被打包
├─src  项目目录
|  ├─App.vue 根组件
|  ├─main.ts 入口主文件
|  ├─vite-env.d.ts  全局类型声明文件
|  ├─views   页面文件夹
|  |   └HelloWorld.vue 示例组件
|  ├─utils
|  |   ├─httpStatusEnums.ts  http状态
|  |   ├─index.ts   工具库出口文件
|  |   ├─request.ts http请求工具
|  |   └storage.ts  本地缓存工具
|  ├─styles  样式文件夹
|  |   ├─global.scss  全局样式
|  |   ├─index.scss   样式表入口
|  |   ├─reset.scss   重置浏览器css样式
|  |   ├─variable.scss  样式变量文件
|  |   ├─components   组件级全局样式
|  |   |     └index.scss
|  ├─store   pinia状态管理文件
|  |   └user.ts  示例store文件
|  ├─router  路由器
|  |   ├─index.ts  路由入口
|  |   ├─types  路由类型
|  |   |   └typings.d.ts  添加路由类型
|  |   ├─modules  业务路由表模块 （可添加具有模块名称的路由表文件）
|  |   |    ├─global.ts  全局路由表
|  |   |    └routes.ts  示例路由表
|  |   ├─config
|  |   |   └nprogress.ts  路由跳转进度配置
|  ├─directives  指令文件夹
|  |     ├─index.ts  指令安转入口
|  |     ├─directives   指令集合
|  |     |     ├─debounce.ts  防抖指令
|  |     |     └throttle.ts  节流指令
|  ├─components  全局组件文件夹
|  |     ├─ErrorMessage  错误组件
|  |     |      ├─403.vue  404组件
|  |     |      └404.vue  403组件
|  ├─assets
|  |   └vue.svg
|  ├─apis  api调用集合
|  |  ├─login.ts  示例： 登录相关
|  |  └models.ts  ts数据模型
├─.env      开发环境配置
├─.env.production 生产环境配置
├─.eslintignore  eslint忽略文件
├─.eslintrc.json eslint配置文件
├─.gitignore     git忽略文件
├─.prettierignore  prettier忽略文件
├─.prettierrc  prettier配置文件
├─.stylelintignore stylelint忽略文件
├─.stylelintrc    stylelint配置文件
├─commitlint.config.ts commitlint配置文件
├─package-lock.json 项目依赖包版本锁定json文件
├─package.json   项目管理json文件
├─tsconfig.json  项目ts配置文件
├─tsconfig.node.json 项目ts node相关配置文件
├─vite.config.ts 项目打包配置文件
```
