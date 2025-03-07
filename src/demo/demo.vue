<template>
  <el-button type="primary" @click="submit">确认</el-button>

  <div class="editor-container">
    <TreeCom class="editor-tree" :data="state.paramsData" @node-click="insertTag"></TreeCom>
    <div class="editor-content">
      <div class="editor-main" ref="editorRef"></div>
      <div class="fn">
        <div class="fn-list">
          <TreeCom
            :default-expand-all="true"
            :data="state.fnData"
            @node-click="insertFn"
            @mouseenter="hoverFn"
          ></TreeCom>
        </div>
        <div class="fn-desc">
          <DescCom v-bind="state.info"></DescCom>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts"></script>
<script lang="ts" setup>
import { nextTick, reactive, onMounted } from 'vue';
import TreeCom from './components/tree.vue';
import DescCom from './components/desc.vue';
import { useCodemirror, functionDescription } from '.';

interface Tree {
  label: string;
  id: string;
  children?: Tree[];
}

const state = reactive({
  visible: false,
  paramsData: [
    {
      label: '参数1',
      id: '1',
    },
    {
      label: '参数2',
      id: '2',
    },
    {
      label: '参数3',
      id: '3',
    },
  ],
  fnData: [
    {
      label: '常用函数',
      id: '1',
      children: [
        {
          label: 'SUM',
          desc: '求和',
          id: '1-1',
        },
        {
          label: 'IF',
          desc: '条件判断',
          id: '1-2',
        },
      ],
    },
  ],
  info: {},
});

const { view, editorRef, init, destroyed, insertText } = useCodemirror();
/**
 * @description 插入标签
 */
const insertTag = (data: Tree) => {
  if (!data.children) {
    insertText(`${data.id}.${data.label}`);
  }
};
/**
 * @description 插入函数
 */
const insertFn = (data: Tree) => {
  if (!data.children) {
    insertText(`${data.label}`, 'fn');
  }
};
/**
 * @description 鼠标悬停展示函数描述
 */
const hoverFn = (data: Tree) => {
  const info = functionDescription(data.label);
  if (info) {
    state.info = info;
  }
};

const convertToObjects = (content: string) => {
  // 使用正则表达式匹配并转换内容
  const regex = /\[\[([0-9]+)\.([^\]]+)\]\]|([^\[\]]+)/g;
  const result = [];
  let match;

  while ((match = regex.exec(content)) !== null) {
    if (match[1] && match[2]) {
      // 匹配到 ID 和参数名
      result.push({ id: match[1], name: match[2] });
    } else if (match[3]) {
      // 匹配到其他文本
      result.push({ text: match[3] });
    }
  }

  console.log(result);
};
/**
 * @description 获取数据
 */
const submit = () => {
  const data = view.value?.state.doc;
  convertToObjects(data);
  console.log('获取数据', data);
};

onMounted(() => {
  destroyed();
});

onMounted(() => {
  nextTick(() => {
    init();
  });
});
</script>

<style lang="less" scoped>
.editor-container {
  position: relative;
  .editor-tree {
    width: 200px;
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
  }
  .editor-content {
    margin-left: 210px;
    display: flex;
    flex-direction: column;
    .editor-main {
      border: 1px solid #ccc;
      height: 200px;
    }
    .fn {
      display: flex;
      height: 200px;
      > div {
        flex: 1;
        border: 1px solid #ccc;
      }
    }
  }
}
:deep(.cm-focused) {
  outline: none;
}
:deep(.cm-gutters) {
  display: none;
}
</style>
