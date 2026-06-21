<!--
  * input-filter
  * v-inputFilter 指令 demo 主页
  * - 文本模式 6 个场景（子组件 if-text-filter）
  * - 数字模式 14 个场景（子组件 if-number-filter）
  * - arg 缺省 fallback 2 个场景
  * - 统一事件日志面板
-->
<template>
  <div class="input-filter">
    <el-divider>v-inputFilter 指令 demo</el-divider>

    <!-- arg 缺省 fallback -->
    <div class="module">
      <h5>㉑ arg 缺省 fallback：v-inputFilter="{}" → 文本（默认安全字符）</h5>
      <div class="row">
        <el-tag type="info">无 :text / :number arg，根据字段嗅探模式</el-tag>
      </div>
      <el-input v-model="f1Value" :placeholder="textHint1" v-inputFilter="{}" />
    </div>

    <div class="module">
      <h5>㉒ arg 缺省 fallback：v-inputFilter="{ integral: 4, decimal: 2 }" → 数字（自动嗅探）</h5>
      <div class="row">
        <el-tag type="info">只要带数字特征字段，自动识别为数字模式</el-tag>
      </div>
      <el-input
        v-model="f2Value"
        placeholder="嗅探为数字模式，等价 v-inputFilter:number"
        v-inputFilter="{ integral: 4, decimal: 2, zeroFlag: true }"
      />
    </div>

    <if-text-input-filter :log="log" />
    <if-number-input-filter :log="log" />

    <!-- 事件日志 -->
    <div class="module log">
      <h5>事件日志（onClamp / onInvalidate，最多 30 条）</h5>
      <el-button size="small" @click="logs = []">清空</el-button>
      <pre>{{ logs.length === 0 ? '（暂无事件）' : logs.join('\n') }}</pre>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { ElButton, ElDivider, ElInput, ElTag } from 'element-plus';
import type { IFilterCallbackInfo } from '../../../directives/directive-filter/directive-filter.api';
import TextInputFilter from './if-text-filter/if-text-filter.vue';
import NumberInputFilter from './if-number-filter/if-number-filter.vue';

const logs = ref<string[]>([]);
const f1Value = ref<string>('');
const f2Value = ref<string>('');

const textHint1 = '试试输入 \\ ; \' " < > 等符号';

const log = (label: string, info: IFilterCallbackInfo): void => {
  const time = new Date().toLocaleTimeString();
  logs.value.unshift(`[${time}] [${label}] type=${info.eventType} "${info.original}" → "${info.cleaned}"  (${info.reason})`);
  if (logs.value.length > 30) logs.value.length = 30;
};
</script>

<style lang="less" scoped>
.input-filter {
  width: 100%;
  height: 100%;
  padding: 16px;
  background-color: var(--color-default);
  overflow-y: auto;

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
  .if-text-filter {
    margin-bottom: 40px;
  }
  .log pre {
    max-height: 240px;
    overflow: auto;
    padding: 12px;
    background: #1e1e1e;
    color: #d4d4d4;
    border-radius: 4px;
    font-size: 12px;
    line-height: 1.6;
    margin-top: 12px;
  }
}
</style>
