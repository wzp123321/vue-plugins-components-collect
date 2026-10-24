#!/usr/bin/env sh

# 确保脚本抛出遇到的错误
set -e

# 清空之前的打包产物
rm -rf packages/dist

# 打包
pnpm build

# 进入打包产物目录
cd packages/

# npm 公共源
publishRegistry="https://registry.npmjs.org/"

# 账户
# sourceAccount="tongao"
# # 密码
# sourcePsw="tongao"

npmSource=`pnpm get registry`
echo "当前npm镜像源是: $npmSource"

if [ "$npmSource" = "$publishRegistry" ];
then
    echo "当前npm源设置正确"
else
    echo "请切换npm源为 $publishRegistry"
    pnpm set registry $publishRegistry
    # pnpm login
fi

version_type=$1

# 版本类型
echo "正在发布到组件库${version_type}...."

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
fi

# 发布
npm config set registry=$publishRegistry
npm publish --registry $publishRegistry --tag $publishTag

if [ $? -eq 0 ]; then
    echo "组件库发布成功...."
    git add package.json
    
    if [ "$2" ]; then
        # git仓库打tag
        git commit -m $2
        git push
    fi  
else
    echo "组件库发布失败...."
fi
