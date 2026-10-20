#!/usr/bin/env sh

# 确保脚本抛出遇到的错误
set -e

# 清空之前的打包产物
rm -rf packages/dist

# 打包
pnpm build

# 进入打包产物目录
cd packages/

# 天溯npm私服源
tiansuSource="http://192.168.20.200:7049/repository/npm-tiansu/"

# 账户
# sourceAccount="tongao"
# # 密码
# sourcePsw="tongao"

npmSource=`pnpm get registry`
echo "当前npm镜像源是: $npmSource"

if [ "$npmSource" = "$tiansuSource" ];
then
    echo "当前npm源设置正确"
else
    echo "请切换npm源为 $tiansuSource"
    pnpm set registry $tiansuSource
    # pnpm login
fi

version_type=$1

# 版本类型
echo "正在发布到产研组件库${version_type}...."

publishTag="latest"
if [ ${version_type} = "主版本" ]; then
    npm version major
elif [ ${version_type} = "次版本" ]; then
    npm version minor
elif [ ${version_type} = "补丁版本" ]; then
    npm version patch
elif [ ${version_type} = "alpha版本" ]; then
    npm version prerelease --preid=alpha --legacy-peer-deps || true
    publishTag="alpha"
elif [ ${version_type} = "beta版本" ]; then
    npm version prerelease --preid=beta
    publishTag="beta"
fi

# 发布
npm config set registry=$npmSource
npm publish --registry $npmSource --tag $publishTag

if [ $? -eq 0 ]; then
    echo "公司组件库发布成功...."
    git add package.json
    
    if [ "$2" ]; then
        # git仓库打tag
        git commit -m $2
        git push
        # git tag $releaseVersion
        # git push origin $releaseVersion
    fi  
else
    echo "公司组件库发布失败...."
fi

# 设置版本号
# if [ "$releaseVersion" ]; then
#     # sed -i "" "s/\"version\":.*$/\"version\":\"$releaseVersion\",/" package.json
#     git add package.json
    
#     # 发布到天溯组件库
#     if [[ $releaseVersion =~ "-" ]]; then
#         echo "正在发布到公司组件库beta版...."
#         npm publish --registry $tiansuSource --tag beta
#     else
#         echo "正在发布到公司组件库latest版...."
#         npm publish --registry $tiansuSource
#     fi

#     if [ $? -eq 0 ]; then
#         echo "公司组件库发布成功...."

#         if [ "$2" ]; then
#             # git仓库打tag
#             git commit -m $2
#             git push
#             git tag $releaseVersion
#             git push origin $releaseVersion
#         fi  
#     else
#         echo "公司组件库发布失败...."
#     fi
# else
#     echo "请先设置版本号。。。"
# fi