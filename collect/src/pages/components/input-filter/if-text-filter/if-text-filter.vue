<!--
  * if-text-filter
  * 文本模式 v-inputFilter 指令 demo（6 个场景）
  * 事件日志通过 log prop 上抛到父组件统一展示
-->
<template>
  <div class="if-text-filter">
    <el-divider>文本过滤（v-inputFilter:text）</el-divider>

    <!-- ① 文本 - 基础开关 -->
    <div class="module">
      <h5>① 文本 - 基础开关（默认安全字符 + 中文 / 空格开关）</h5>
      <div class="row">
        <span>允许中文</span>
        <el-switch v-model="t1.allowChinese" />
        <span>允许空格</span>
        <el-switch v-model="t1.allowSpace" />
      </div>
      <el-input
        v-model="t1Value"
        placeholder="试试输入特殊符号"
        clearable
        v-inputFilter:text="{
          allowChinese: t1.allowChinese,
          allowSpace: t1.allowSpace,
          onClamp: (e: any) => log('t1 clamp', e),
          onInvalidate: (e: any) => log('t1 invalidate', e),
        }"
      />
    </div>

    <!-- ② 文本 - 自定义 regExp（denylist） -->
    <div class="module">
      <h5>② 文本 - 自定义 regExp（denylist，例如剔除所有数字）</h5>
      <el-input
        v-model="t2Value"
        placeholder="试输入 abc123def → 应剩 abcdef"
        v-inputFilter:text="{
          regExp: /\d/g,
          onClamp: (e: any) => log('t2 clamp', e),
        }"
      />
    </div>

    <!-- ③ 文本 - 白名单 allowPattern -->
    <div class="module">
      <h5>③ 文本 - 白名单 allowPattern（只允许 a-z 小写字母）</h5>
      <el-input
        v-model="t3Value"
        placeholder="试输入 AbC123def → 应剩 def"
        v-inputFilter:text="{
          allowPattern: /[a-z]/g,
          onInvalidate: (e: any) => log('t3 invalidate', e),
        }"
      />
    </div>

    <!-- ④ 文本 - maxLength 限制 -->
    <div class="module">
      <h5>④ 文本 - maxLength 限制（最多 6 字符）</h5>
      <el-input
        v-model="t4Value"
        placeholder="试输入 1234567890 → 应被截到 6 位"
        v-inputFilter:text="{
          maxLength: 6,
          onClamp: (e: any) => log('t4 clamp', e),
        }"
      />
    </div>

    <!-- ⑤ 文本 - transform 大小写转换 -->
    <div class="module">
      <h5>⑤ 文本 - transform 大小写（输入 Hello → HELLO）</h5>
      <el-input
        v-model="t5Value"
        placeholder="输入任意大小写字母，将被转大写"
        v-inputFilter:text="{
          transform: 'upper',
          allowPattern: /[a-zA-Z]/g,
          onClamp: (e: any) => log('t5 clamp', e),
        }"
      />
    </div>

    <!-- ⑥ 文本 - 粘贴 / 拖拽清洗兜底 -->
    <div class="module">
      <h5>⑥ 文本 - 粘贴 / 拖拽清洗兜底（粘贴 "Hello123&lt;script&gt;" → "Hello123script"）</h5>
      <div class="row">
        <el-tag type="info">复制混合内容粘贴进来验证清洗</el-tag>
      </div>
      <el-input
        v-model="t6Value"
        placeholder="可粘贴带特殊符号 / 数字的混合内容"
        v-inputFilter:text="{
          onClamp: (e: any) => log('t6 clamp', e),
          onInvalidate: (e: any) => log('t6 invalidate', e),
        }"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue';
import { ElDivider, ElInput, ElSwitch, ElTag } from 'element-plus';
import type { IFilterCallbackInfo } from '../../../../directives/directive-filter/directive-filter.api';

interface IFilterLog {
  (label: string, info: IFilterCallbackInfo): void;
}

const props = defineProps<{
  log: IFilterLog;
}>();

/* eslint-disable @typescript-eslint/no-unused-vars */
const log = props.log;

const t1 = reactive({
  allowChinese: true,
  allowSpace: true,
});

const t1Value = ref<string>('');
const t2Value = ref<string>('');
const t3Value = ref<string>('');
const t4Value = ref<string>('');
const t5Value = ref<string>('');
const t6Value = ref<string>('');
</script>

<style lang="less" scoped>
.if-text-filter {
  h5 {
    font-size: 18px;
    color: var(--color-text-primary);
    margin: 0 0 12px;
  }
  .module {
    margin-bottom: 24px;
    .row {
      display: flex;
      gap: 12px;
      align-items: center;
      margin-bottom: 12px;
    }
  }
}
</style>
