# 天溯web端组件库

## 项目结构

```
├─.eslintrc.js
├─.gitignore
├─babel.config.js
├─env.d.ts
├─jsconfig.json
├─npminstall-debug.log
├─package-lock.json
├─package.json
├─README.md
├─tsconfig.json
├─vue.config.js
├─public
├─scripts // 脚本工具目录
|    ├─create-templete.js // 新建组件模板脚本
|    ├─docs-deploy.sh // 组件库文档部署脚本
|    ├─gulpfile.ts // 打包、压缩css文件的配置
|    ├─package-publish.sh // 组件库发布脚本
|    ├─buildjs.webpack.config.js // webpack打包js的配置
├─packages
|    ├─package.json // 发布到npm私服的配置文件
|    ├─components 
|    |     ├─lib // 组件源码
|    |     ├─css // 组件样式
├─example // 测试组件效果，后期可接入jest单元测试，以测试驱动模式来开发新组件
|    ├─App.vue
|    ├─main.d.ts
|    ├─main.d.ts.map
|    └main.ts
├─docs // 组件库文档
|  ├─README.md
|  ├─componentDocs
|  |       ├─install.md // 安装页面
|  |       ├─package-normal-link.md // 常用链接页面
|  |       ├─package-push.md // 提交流程页面
|  |       ├─package-usage.md // 使用说明页面
|  |       ├─ts-card // card组件目录
|  |       |    ├─ts-card-demo.vue // card组件使用样例，通过客户端配置文件client.ts将该组件渲染到对应组件的md文件中，文件内容会显示在对应组件md上
|  |       |    └ts-card.md // 组件说明页面
|  ├─.vitepress
|  |     ├─client.ts // 客户端配置文件
|  |     ├─config.ts // vuepress模板配置文件
|  |     ├─public // 静态资源目录
|  |     |   ├─images
|  |     |   |   ├─hero.png
|  |     |   |   └hero1.png
|  |     ├─config // 子区块配置文件
|  |     |   └sidebar.mjs // 侧边栏配置文件
```

## 常用命令

打包js和css样式

```
pnpm build
```

打包js

```
pnpm build:js
```

打包样式

```
pnpm build:css
```

文档调试

```
pnpm docs:dev
```

文档打包

```
pnpm docs:build
```

文档部署

```
pnpm docs:deploy
```

新建组件模板

```
pnpm ct
```

组件库发布

```
pnpm package:publish
```

## 关于基础组件库element-plus的修改

- 包名修改为`@tiansu/element-plus`发布到npm私服，解决老项目中两种`npm`镜像库安装问题：配置npm以`tiansu`开头的包走私服镜像
  ```
  npm config set @tiansu:registry=http://192.168.20.200:7049/repository/npm-tiansu/
  ```
- 修改包内部绝对路径引用`element-plus`为`@tiansu/element-plus`
- 修改`namespace`命名空间为`te`
- 修改组件名前缀为`te`
- 由于element组件库内样式选择器未全部使用`namespace`变量，所以还需手动修改部分css样式选择器中的`el`为`te`
- 修改样式常量名称（颜色、字号等）前缀为`te`
- 修改浅色、暗色两个模块下 主要、成功、警示、危险四个大类的样式值
- 暂时先将字体样式名称为`13`号字体的值变为`14`号大小，后续观察涉及到的组件样式是否展示异常
