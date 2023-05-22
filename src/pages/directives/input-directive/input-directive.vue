<!--
 * @Author: wanzp
 * @Date: 2023-05-22 21:24:52
 * @LastEditors: wanzp
 * @LastEditTime: 2023-05-22 22:18:59
 * @Description: 
-->
<template>
  <div class="input-directive">
    <div class="module">
      <h5>文本过滤（默认）</h5>
      <div class="flex-row-start-center" style="padding: 16px 0">
        <label class="mr8">是否允许中文</label>
        <el-switch v-model="textFilterParams.allowChinese" @change="handleTextClear" />
        <label class="mr8 ml16">是否允许空格</label>
        <el-switch v-model="textFilterParams.allowSpace" @change="handleTextClear" />
        <label class="mr8 ml16">自定义正则</label>
        <span>{{ regText }}</span>
      </div>
      <input
        type="text"
        v-model="testText"
        v-inputFilter:text="{
          ...textFilterParams,
          regExp: new RegExp(String.raw`[${regText}${characters}]`, 'g'),
        }"
      />
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref } from 'vue';
import { IDirectiveTextBindingVO } from '../../../directives/directive-filter/directive-filter.api';

const testText = ref<string>('');
const textFilterParams = ref<IDirectiveTextBindingVO>({
  regExp: null,
  allowChinese: false,
  allowSpace: false,
});
const regText = ref<string>(String.raw`\`\\;\'\"<>`);
const characters: string = '';

function handleTextClear() {
  testText.value = '';
}
</script>
<style lang="less" scoped>
.input-directive {
  width: 100%;
  height: 100%;
  display: flex;
  flex-wrap: wrap;
  gap: 16px;

  .module {
    height: 200px;
  }
}
</style>
