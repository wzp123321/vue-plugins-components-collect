# Dockerfile
# 用于构建 VitePress 文档站点
#

FROM harbor.tiansu.com:8443/base/nginx:1.23.1-alpine

LABEL PROJECT="ts-mobile-ui-docs" \
      AUTHOR="lvli"

# 设置工作目录
WORKDIR /usr/share/nginx/html
# 清除工作目录
RUN rm -rf /usr/share/nginx/html/*
# 解压制品至指定目录，调整目录地址为项目名

COPY .vitepress/dist/ /usr/share/nginx/html/
