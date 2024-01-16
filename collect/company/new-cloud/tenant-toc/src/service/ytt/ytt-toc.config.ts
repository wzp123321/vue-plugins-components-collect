import { defineConfig } from 'yapi-to-typescript';

/**
 * yapi配置
 * npx ytt -c src/service/ytt/ytt-toc.config.ts
 */
export default defineConfig([
  {
    serverUrl: 'http://192.168.50.24:3000/',
    typesOnly: true, // 是否只生成接口请求内容和返回内容的 TypeSript 类型，是则请求文件和请求函数都不会生成。!!!!
    target: 'typescript',
    reactHooks: {
      enabled: false,
    },
    devEnvName: 'local',
    prodEnvName: 'alifWifi',
    outputFilePath: (interfaceInfo) => `./api/${interfaceInfo._category.name}/index.ts`,
    dataKey: 'data',
    projects: [
      {
        token: '6612b31312870aee928a24aedaead8d80b85cb50377fd8784d532e85fde32145',
        categories: [
          {
            id: 0,
            getRequestFunctionName(interfaceInfo, changeCase) {
              // 以接口全路径生成请求函数名
              return changeCase.camelCase(interfaceInfo.path);

              // 若生成的请求函数名存在语法关键词报错、或想通过某个关键词触发 IDE 自动引入提示，可考虑加前缀，如:
              // return changeCase.camelCase(`api_${interfaceInfo.path}`)

              // 若生成的请求函数名有重复报错，可考虑将接口请求方式纳入生成条件，如:
              // return changeCase.camelCase(`${interfaceInfo.method}_${interfaceInfo.path}`)
            },
          },
        ],
      },
    ],
  },
]);
