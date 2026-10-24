#!/usr/bin/env sh

# 确保脚本抛出遇到的错误
set -e

# 清空之前的打包产物
rm -rf packages/dist

# 打包
npm run build:p

# 进入打包产物目录
cd packages/

# npm 公共源
publishRegistry="https://registry.npmjs.org/"

# 账户
# sourceAccount="tongao"
# # 密码
# sourcePsw="tongao"

releaseVersion=$1

# 设置版本号
if [ "$releaseVersion" ]; then
    # sed -i "" "s/\"version\":.*$/\"version\":\"$releaseVersion\",/"

    # 发布到组件库
    if [[ $releaseVersion =~ "-" ]]; then
        echo "正在发布到组件库beta版...."
        npm publish --registry $publishRegistry --tag beta
    else
        echo "正在发布到组件库latest版...."
        npm publish --registry $publishRegistry
    fi

    if [ $? -eq 0 ]; then
        echo "组件库发布成功...."

        if [ "$2" ]; then
            # git仓库打tag
            git commit -m $2
            git push
            git tag $releaseVersion
            git push origin $releaseVersion
        fi  
    else
        echo "组件库发布失败...."
    fi
else
    echo "请先设置版本号。。。"
fi
