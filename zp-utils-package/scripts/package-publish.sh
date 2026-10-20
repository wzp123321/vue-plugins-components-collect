#!/usr/bin/env sh

# 确保脚本抛出遇到的错误
set -e

# 清空之前的打包产物
rm -rf packages/dist

# 打包
npm run build:p

# 进入打包产物目录
cd packages/

# 天溯npm私服源
tiansuSource="http://192.168.20.200:7049/repository/npm-tiansu/"
# 能源npm源
# energyNpmSource="http://192.168.20.208:8081/nexus/repository/npm-public/"
# 账户
# sourceAccount="tongao"
# # 密码
# sourcePsw="tongao"

# npmSource=`npm get registry`
# echo "当前npm镜像源是: $npmSource"

# if [ "$npmSource" = "$tiansuSource" ];
# then
#     echo "当前npm源设置正确"
# else
#     echo "请切换npm源为 $tiansuSource"
#     npm set registry $tiansuSource
#     npm login
# fi

releaseVersion=$1

# 设置版本号
if [ "$releaseVersion" ]; then
    # sed -i "" "s/\"version\":.*$/\"version\":\"$releaseVersion\",/" package.json

    # 发布到天溯组件库
    if [[ $releaseVersion =~ "-" ]]; then
        echo "正在发布到公司组件库beta版...."
        npm publish --registry $tiansuSource --tag beta
    else
        echo "正在发布到公司组件库latest版...."
        npm publish --registry $tiansuSource
    fi

    if [ $? -eq 0 ]; then
        echo "公司组件库发布成功...."

        if [ "$2" ]; then
            # git仓库打tag
            git commit -m $2
            git push
            git tag $releaseVersion
            git push origin $releaseVersion
        fi  
    else
        echo "公司组件库发布失败...."
    fi

    # echo "正在发布到能源内部组件库...."
    # if [ "$npmSource" = "$energyNpmSource" ];
    # then
    #     echo "当前npm源设置正确"
    # else
    #     echo "请切换npm源为 $energyNpmSource"
    #     npm set registry $energyNpmSource
    #     npm login
    # fi

    # npm publish --registry $energyNpmSource
    
    # if [ $? -eq 0 ]; then
    #     echo "能源组件库发布成功...."
    # else
    #     echo "能源组件库发布失败...."
    # fi
else
    echo "请先设置版本号。。。"
fi