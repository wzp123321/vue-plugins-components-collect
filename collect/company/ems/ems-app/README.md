# 一、开发说明

## 1.安装

```
npm install
```

## 2.启动

```
npm run dev:h5
```

## 3.打包

```
npm run build:h5
```

## 4.组件

```
uni-ui
@tiansu/ts-mobile-package
```

## 5.目录结构说明

```
├─src    应用配置，用来配置App全局样式以及监听应用生命周期
|  ├─api    http请求封装
|  		├─model.ts    全局interface
|  		└─request.ts  http请求全局配置、请求、响应拦截
|  ├─assets    存放静态资源文件（如图片、音视频等）
|  		├─images     图片
|  ├─components    全局组件
|  		├─common-navigation-bar    顶部导航栏
|  ├─config    公共配置
|  		├─config.ts    通用
|  		├─enum.ts    枚举
|  		├─request.ts     请求配置
|  		├─session-key.ts    缓存key
|  ├─core    核心功能
|  		├─nativeBridge.ts    桥连接服务
|  		└─registerComponents.ts   注册全局组件
|  ├─pages    页面
|  ├─store    全局状态管理
|  		├─modules.ts    模块化
|  		└─index.ts   store
|  ├─uni_modules    uni-ui组件(需要用到的组件可以在uni插件库单独安装到目录下)
|  ├─utils    工具方法
|  		├─authorization.ts    重放工具方法
|  		└─index.ts   公共工具方法
|  		└─storage.ts   缓存工具方法
├───App.vue    应用配置，用来配置App全局样式以及监听应用生命周期
├───env.d.ts    类型声明
├───main.ts    入口文件，用来初始化vue实例、定义全局组件
├───manifest.json    配置应用名称、appid、logo、版本打包信息
├───pages.json    配置页面路由、导航条、选项卡等页面类信息
├───shime-uni.d.ts    类型声明
├─.env    全局配置字段
├─.env.development    开发全局配置字段
├─.env.production    生产全局配置字段
├─.gitignore    git忽略文件配置
├─prettierrc.json    格式化配置
├─index.html    html文件
├─package.json    工程信息以及依赖版本
├─package-lock.json    依赖关联关系文件
├─tsconfig.json    typescript配置文件
├─vite.config.ts    vite配置文件
```
