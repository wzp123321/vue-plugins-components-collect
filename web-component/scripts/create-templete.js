import inquirer from 'inquirer';
import sidebar from '../document/.vuepress/config/sidebar.mjs';
import fs from 'fs-extra';
import handlebars from 'handlebars';
import { resolve } from 'path';
/**
 * 组件名转换成kebabCase的命名方式
 * @param {*} string 收集到的组件名，
 * @returns
 */
const getKebabCase = (string) =>
  string
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
/**
 *kebabCase的命名转换成首字母都大写的命名
 * @param {*} str kebabCase格式的命名
 * @returns
 */
const getUpperCase = (str) => {
  str = '-' + str;
  return str.replace(/-([a-z])/g, (all, i) => {
    return i.toUpperCase();
  });
};
/**
 * 控制台交互逻辑函数，收集新组件的相关信息
 * 组件名称只能有英文，其他字符不予通过
 * 英文名称可以适配各种命名规则，最终输出kebab-case的命名方式
 * @returns
 */
let infoCollector = async () => {
  // 过滤掉没有id的分类
  const sidebarRes = sidebar.filter((item) => {
    return item.id != undefined
  })
  let typeChoices = sidebarRes.map((item) => {
    return { value: item.id, name: item.text };
  });
  console.log(typeChoices);
  const meta = await inquirer.prompt([
    {
      type: 'input',
      message: '请输入你要新建的组件名（纯英文,te-case命名方式）：',
      name: 'name',
    },
    {
      type: 'input',
      message: '请输入你要新建的组件名（中文名称）：',
      name: 'zhName',
    },
    {
      type: 'rawlist',
      message: '请选择你组件的分类：',
      name: 'type',
      choices: typeChoices,
    },
    {
      type: 'input',
      message: '请输入组件的功能描述：',
      name: 'desc',
      default: '默认：这是一个新组件',
    },
  ]);
  meta.name = getKebabCase(meta.name);
  if (!meta.name.startsWith('te-')) {
    meta.name = 'te-' + meta.name;
  }
  meta.cname = getUpperCase(meta.name);
  return meta;
};
const meta = await infoCollector();

//组件库描述文件模板
const listTpl = `[{{#each list}}
  {
    "name": "{{name}}",
    "zhName": "{{zhName}}",
    "cname": "{{cname}}",
    "desc": "{{desc}}",
    "type": "{{type}}"
  }{{#if @last}}{{else}},{{/if}}{{/each}}
]`;
//组件库的index.ts模板
const indexLibTpl = `{{#each list}}import { {{cname}} } from './{{name}}';
{{/each}}
const components = [{{#each list}}{{cname}}{{#if @last}}{{else}},{{/if}}{{/each}}];

const tsVuePlugin: any = {
  install(app: any) {
    if (tsVuePlugin.installed) {
      // 判断是否安装，安装过就不继续往下执行
      return;
    }
    tsVuePlugin.installed = true;
    // 遍历注册全局组件
    components.map((component) => {
      app.use(component);
    });
  },
};
export default tsVuePlugin;
export { {{#each list}}{{cname}}{{#if @last}}{{else}},{{/if}}{{/each}} };
`;
// 组件的源码模板--index.ts文件
const sourceIndexTpl = `import {{cname}} from './src/{{name}}.vue';
// @ts-ignore
{{cname}}.install = (app: any) => {
  app.component('{{name}}', {{cname}});
};
export { {{cname}} };`;
// 组件的源码模板--vue文件
const sourceVueTpl = `<script src="./{{name}}.ts" lang="ts"></script>
<template src="./{{name}}.html"></template>
<style scoped src="./{{name}}.scss" lang="scss"></style>`;
// 组件的源码模板--vue.d.ts文件
// const sourceVueDTSTpl = `export declare function render(_ctx: any, _cache: any, $props: any, $setup: any, $data: any, $options: any): import("vue").VNode<import("vue").RendererNode, import("vue").RendererElement, {
//   [key: string]: any;
// }>;
// //# sourceMappingURL={{name}}.vue.d.ts.map`;
// // 组件的源码模板--vue.d.ts.map文件
// const sourceVueDTSMapTpl = `{"version":3,"file":"{{name}}.vue.d.ts","sourceRoot":"","sources":["{{name}}.vue.ts"],"names":[],"mappings":"AAYA,wBAAgB,MAAM,CAAC,IAAI,EAAE,GAAG,EAAC,MAAM,EAAE,GAAG,EAAC,MAAM,EAAE,GAAG,EAAC,MAAM,EAAE,GAAG,EAAC,KAAK,EAAE,GAAG,EAAC,QAAQ,EAAE,GAAG;;GAqB5F"}`;
// 组件源码模板--ts文件
// const sourceTsTpl = `import { onMounted } from 'vue';
// export default {
//   components: {},
//   props: {},
//   setup() {
//     onMounted(() => {});
//     return {};
//   },
// };`;
// // 组件源码模板--scss文件
// const sourceCssTpl = `.{{name}} {
// }`;
// // 组件源码模板--html文件
// const sourceHtmlTpl = `<div class="{{name}}">{{name}}</div>`;
// 组件demo模板
const demoTpl = `<template>
  <{{name}}></{{name}}>
</template>
<script>
  import { {{cname}} } from '../../../packages/components/lib/{{name}}';
  export default {
    name:'{{name}}-demo',
    components: {
      {{cname}}: {{cname}},
    },
    setup() {
    },
  };
</script>
<style scoped lang="scss"></style>
`;
// 组件MD模板
const mdTpl = `# {{zhName}}

{{desc}}

### 基础用法

<br/>

<{{name}}-demo ></{{name}}-demo>

### 代码
<br>

@[code html](./{{name}}-demo.vue)

## API

### 属性（props）

| 属性名 | 说明 | 类型 | 是否必要 | 默认值 |
| ------ | ---- | ---- | -------- | ------ |
| 无     | 无   | 无   | 无       | 无     |

### 插槽（slots）

| 插槽名 | 说明 | 作用域 |
| ------ | ---- | ------ |
| 无     | 无   | 无     |

### 事件（events）

| 事件名 | 说明 | 接受参数 |
| ------ | ---- | -------- |
| 无     | 无   | 无       |
`;
//client.ts模板
const clientTpl = `import { defineClientConfig } from '@vuepress/client';
{{#each list}}import {{cname}}Demo from '../docs/{{name}}/{{name}}-demo.vue';
{{/each}};
const demoList = [{{#each list}}{{cname}}Demo{{#if @last}}{{else}},{{/if}}{{/each}}];
export default defineClientConfig({
  enhance({ app }) {
    demoList.forEach((item) => {
      app.component(item.name, item);
    });
  },
});`;
//sidebar.js模板
const sidebarTpl = `export default [
  {
    text: '快速上手',
    children: [
      {
        text: '安装使用',
        link: '/docs/install',
      },
    ],
  },{{#each list}}
  {
    text: '{{text}}',
    id: '{{id}}',
    children: [
      {{#each children}}
      {
        text: '{{text}}',
        link: '{{link}}',
      },
      {{/each}}
    ],
  },{{/each}}
];`;
/**
 * 用收集到的信息生成组件模板
 * @param {*} info 收集到的信息
 */
const installTsTplReplacer = (info) => {
  //生成list.json的数组对象
  const listFileForm = fs.readJsonSync(resolve(`packages/components/lib/list.json`));
  listFileForm.push(info);

  //生成sidebar的对象
  sidebar
    .find((item) => {
      return item.id === info.type;
    })
    .children.push({
      text: info.zhName,
      link: `/docs/${info.name}/${info.name}`,
    });

  // 设置输出路径
  const listFileTo = `packages/components/lib/list.json`;
  const indexLibTo = `packages/components/lib/index.ts`;
  const sourceIndexFileTo = `packages/components/lib/${info.name}/index.ts`;
  const sourceVueFileTo = `packages/components/lib/${info.name}/src/${info.name}.vue`;
  const sourceVueDTSFileTo = `packages/components/lib/${info.name}/src/${info.name}.vue.d.ts`;
  const sourceVueDTSMapFileTo = `packages/components/lib/${info.name}/src/${info.name}.vue.d.ts.map`;
  const sourceHtmlFileTo = `packages/components/lib/${info.name}/src/${info.name}.html`;
  const sourceCssFileTo = `packages/components/lib/${info.name}/src/${info.name}.scss`;
  const sourceTsFileTo = `packages/components/lib/${info.name}/src/${info.name}.ts`;
  const demoFileTo = `document/docs/${info.name}/${info.name}-demo.vue`;
  const mdFileTo = `document/docs/${info.name}/${info.name}.md`;
  const clientFileTo = 'document/.vuepress/client.ts';
  const sidebarFileTo = 'document/.vuepress/config/sidebar.mjs';
  // // 使用 handlebars 替换模板内容
  const listFileContent = handlebars.compile(listTpl)({ list: listFileForm });
  const indexLibContent = handlebars.compile(indexLibTpl)({ list: listFileForm });
  const indexFileContent = handlebars.compile(sourceIndexTpl)(info);
  const sourceVueFileContent = handlebars.compile(sourceVueTpl)(info);
  // const sourceVueDTSFileContent = handlebars.compile(sourceVueDTSTpl)(info);
  // const sourceVueDTSMapFileContent = handlebars.compile(sourceVueDTSMapTpl)(info);
  // const sourceHtmlFileContent = handlebars.compile(sourceHtmlTpl)(info);
  // const sourceCssFileContent = handlebars.compile(sourceCssTpl)(info);
  // const sourceTsFileContent = handlebars.compile(sourceTsTpl)(info);
  const demoFileContent = handlebars.compile(demoTpl)(info);
  const mdFileContent = handlebars.compile(mdTpl)(info);
  const clientContent = handlebars.compile(clientTpl)({ list: listFileForm });
  const sidebarContent = handlebars.compile(sidebarTpl)({ list: sidebar });
  // // 将模板写入输出路径
  fs.outputFile(resolve(listFileTo), listFileContent, (err) => {
    if (err) {
      console.error(err);
    }
  });
  fs.outputFile(resolve(indexLibTo), indexLibContent, (err) => {
    if (err) {
      console.error(err);
    }
  });
  fs.outputFile(resolve(sourceIndexFileTo), indexFileContent, (err) => {
    if (err) {
      console.error(err);
    }
  });
  fs.outputFile(resolve(sourceVueFileTo), sourceVueFileContent, (err) => {
    if (err) {
      console.error(err);
    }
  });
  // fs.outputFile(resolve(sourceVueDTSFileTo), sourceVueDTSFileContent, (err) => {
  //   if (err) {
  //     console.error(err);
  //   }
  // });
  // fs.outputFile(resolve(sourceVueDTSMapFileTo), sourceVueDTSMapFileContent, (err) => {
  //   if (err) {
  //     console.error(err);
  //   }
  // });
  // fs.outputFile(resolve(sourceHtmlFileTo), sourceHtmlFileContent, (err) => {
  //   if (err) {
  //     console.error(err);
  //   }
  // });
  // fs.outputFile(resolve(sourceCssFileTo), sourceCssFileContent, (err) => {
  //   if (err) {
  //     console.error(err);
  //   }
  // });
  // fs.outputFile(resolve(sourceTsFileTo), sourceTsFileContent, (err) => {
  //   if (err) {
  //     console.error(err);
  //   }
  // });
  fs.outputFile(resolve(demoFileTo), demoFileContent, (err) => {
    if (err) {
      console.error(err);
    }
  });
  fs.outputFile(resolve(mdFileTo), mdFileContent, (err) => {
    if (err) {
      console.error(err);
    }
  });
  fs.outputFile(resolve(clientFileTo), clientContent, (err) => {
    if (err) {
      console.error(err);
    }
  });
  fs.outputFile(resolve(sidebarFileTo), sidebarContent, (err) => {
    if (err) {
      console.error(err);
    }
  });
  console.warn(`tips:
  1.请在packages/components/lib/${info.name}/src文件夹下完成组件源码编写；
  2.请在document/docs/${info.name}文件夹完成组件demo和组件文档的编写；`);
};
installTsTplReplacer(meta);
