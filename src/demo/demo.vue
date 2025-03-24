<template>
  <div>
    <div class="top-buttons">
      <div>工具栏：</div>
      <el-button v-for="item in buttonList" :key="item.value" type="primary" @click="getValue(item.value)">
        {{ item.label }}
      </el-button>
    </div>
    <div ref="textRef" id="editor" :contenteditable="true" @blur="onBlur"></div>
    <button @click="getSpan({ label: '商品价格', value: '[V2]' })">商品价格</button>
    <button @click="getSpan({ label: '商品数量', value: '[V1]' })">商品数量</button>
    <button @click="getTextAndParams">获取公式</button>
  </div>
</template>

<script lang="ts" setup>
import { ref, shallowRef, onMounted } from 'vue';

const textRef = ref<any>(null);
const selection = shallowRef<any>(null);
const range = shallowRef<any>(null);
const props = defineProps({
  isEdit: {
    type: Boolean,
    default: false,
  },
  textValue: {
    type: String,
    default: '',
  },
});
const buttonList = [
  { label: '+', value: '+' },
  { label: '-', value: '-' },
  { label: '×', value: '*' },
  { label: '÷', value: '/' },
  { label: '<', value: '<' },
  { label: '>', value: '>' },
  { label: '>=', value: '>=' },
  { label: '<=', value: '<=' },
  { label: '=', value: '=' },
  { label: '()', value: '()' },
  { label: '%', value: '%' },
  { label: '与', value: '&' },
  { label: '或', value: '|' },
];
const dataList = [
  { label: '商品价格', value: 'price' },
  { label: '商品数量', value: 'num' },
];
/**
 * 重置光标位置
 * */
const resetCursor = () => {
  const parentElement = document.getElementById('editor') as HTMLElement; // 获取结束节点的父元素
  const ran = document.createRange();
  ran.selectNodeContents(parentElement);
  ran.collapse(false);
  const sel = window.getSelection();
  if (sel) {
    sel?.removeAllRanges();
    sel?.addRange(ran);
    range.value = sel.getRangeAt(0);
  }
};
/**
 * 失焦后重置光标位置，这里不重置位置，会造成bug，例如点击生成的span光标消失，再次点击生成span的按钮，会在最后光标停留的span标签里面再插入span，就会造成bug
 */
const onBlur = () => {
  selection.value = window.getSelection();
  range.value = selection.value?.getRangeAt(0);
  // 如果最后的光标停留在text节点，那么就把光标移动至editor的最后面
  if (range.value.endContainer.nodeType === Node.TEXT_NODE) {
    // 检查结束节点是否为文本节点
    resetCursor();
  }
};

/**
 *  点击工具栏按钮添加文本节点
 */
const getValue = (value: any) => {
  // 创建一个文本节点
  const textNode = document.createTextNode(value);
  // 在光标位置插入文本节点
  range.value?.insertNode(textNode);
  // 移动光标到文本节点的末尾
  range.value?.setStartAfter(textNode);
  // 折叠光标到文本节点的末尾
  range.value?.collapse(true);
  // 移除所有选区 不移除selection会到聚焦点击的文本
  selection.value?.removeAllRanges();
  // 添加选区
  selection.value?.addRange(range.value);
};

/**
 *  点击参数生成span标签
 */
const getSpan = (params: any) => {
  // 创建前缀
  const prefix = `<span contenteditable="false" disabled="disabled" class="fn-param" data-param="${params.value}">`;
  // 创建后缀
  const suffix = '</span>';
  // 创建span元素
  const el = document.createElement('span') as any;
  // 将前缀和后缀插入span元素
  el.innerHTML = prefix + params.label + suffix;
  // 去掉外层的span

  const frag = document.createDocumentFragment();
  const node = frag.appendChild(el.firstChild);

  // 插入tag
  range.value?.insertNode(node);
  // 设置光标
  range.value?.setStartAfter(node);
  range.value?.collapse(true);
  // 不移除selection会到聚焦点击的文本
  selection.value?.removeAllRanges();
  // 添加选区
  selection.value?.addRange(range.value);
};

/**
 * 获取构建的html里面的文本和参数
 */
const getTextAndParams = () => {
  // 获取文本中的参数元素
  const editor = document.getElementById('editor') as any;
  let result = '';
  // 遍历编辑器的子节点，包括文本节点
  editor.childNodes.forEach((node: any) => {
    if (node.nodeType === Node.TEXT_NODE) {
      result += node.textContent; // 获取文本节点内容
    } else if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'SPAN') {
      result += node.dataset.param; // 获取 span 的 data-param 属性值
    }
  });

  // 返回文本
  const data = {
    value: result,
    label: textRef.value?.innerText,
  };
  console.log(data, data.value.split(/(\[.*?\])/).filter(Boolean));
  return data;
};
const reviewFn = (data: string) => {
  // 拆分公式并处理每个部分
  const parts = data.split(/(\W)/); // 按照非字母字符分割公式
  console.log(parts);
  for (let i = 0; i < parts.length; i++) {
    const index = dataList.findIndex((item) => item.value === parts[i]);
    if (index > -1) {
      getSpan(dataList[index]);
    } else {
      getValue(parts[i]);
    }
  }
};
onMounted(() => {
  resetCursor();
  if (props.textValue) {
    reviewFn(props.textValue);
  }
});
</script>

<style lang="less" scoped>
#editor {
  width: 100%;
  height: 150px;
  padding: 10px;
  box-sizing: border-box;
  overflow: auto;
  background-color: #f5f5f5;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 20px;
  word-break: break-all;
  outline: none;
}
.top-buttons {
  margin: 5px;
  display: flex;
  align-items: center;
}
:deep(.fn-param) {
  padding: 4px;
  background: #0e66b720;
  border-radius: 5px;
  color: #0e66b7;
  margin: 4px;
  display: inline-block;
}
</style>
