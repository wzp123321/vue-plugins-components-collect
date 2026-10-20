#!/usr/bin/env sh

# 确保脚本抛出遇到的错误
set -e

# 清空之前的打包产物
rm -rf docs/.vuepress/dist

# 生成静态文件
npm run docs:build

# 进入生成的文件夹
# cd docs/.vuepress/dist

# 如果是发布到自定义域名
# echo '192.168.50.195' > CNAME

# git init
# git add -A
# git commit -m 'deploy'

# 如果你想要部署到 https://USERNAME.github.io
# git push -f git@192.168.20.76:web/ts-package-document-dist.git master

# 如果发布到 https://USERNAME.github.io/<REPO>  REPO=github上的项目
# git push -f git@github.com:USERNAME/<REPO>.git master:gh-pages