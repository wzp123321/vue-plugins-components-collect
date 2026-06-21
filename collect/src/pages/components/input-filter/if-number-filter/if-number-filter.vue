<!--
  * if-number-filter
  * 数字模式 v-inputFilter:number 指令 demo（14 个场景）
  * 事件日志通过 log prop 上抛到父组件统一展示
-->
<template>
  <div class="if-number-filter">
    <el-divider>数字过滤（v-inputFilter:number）</el-divider>

    <!-- ⑦ 基础位数 -->
    <div class="module">
      <h5>⑦ 数字 - 基础位数（integral=4, decimal=2）</h5>
      <el-input
        v-model="n1Value"
        placeholder="试输入 12345.6789 → 应被截到 1234.67"
        v-inputFilter:number="{ integral: 4, decimal: 2, zeroFlag: true }"
      />
    </div>

    <!-- ⑧ 符号开关 -->
    <div class="module">
      <h5>⑧ 数字 - 符号开关（negativeFlag / allowPlus / zeroFlag）</h5>
      <div class="row">
        <span>允许负数</span>
        <el-switch v-model="n2.negativeFlag" />
        <span>允许正号</span>
        <el-switch v-model="n2.allowPlus" />
        <span>允许 0</span>
        <el-switch v-model="n2.zeroFlag" />
      </div>
      <el-input
        v-model="n2Value"
        placeholder="试输入 -123 / +456 / 0"
        v-inputFilter:number="{
          integral: 6,
          decimal: 2,
          negativeFlag: n2.negativeFlag,
          allowPlus: n2.allowPlus,
          zeroFlag: n2.zeroFlag,
        }"
      />
    </div>

    <!-- ⑨ min / max 夹回 -->
    <div class="module">
      <h5>⑨ 数字 - min / max 夹回（min=0, max=100）</h5>
      <el-input
        v-model="n3Value"
        placeholder="试输入 50 / 150 / -10 → 应夹回 100 / 0"
        v-inputFilter:number="{
          integral: 6,
          decimal: 2,
          min: 0,
          max: 100,
          zeroFlag: true,
        }"
      />
    </div>

    <!-- ⑩ min 越界回调 -->
    <div class="module">
      <h5>⑩ 数字 - 越界回调（输入 -5 → 触发 onClamp）</h5>
      <el-input
        v-model="n4Value"
        placeholder="输入小于 0 的值会触发 onClamp"
        v-inputFilter:number="{
          integral: 6,
          decimal: 2,
          min: 0,
          max: 1000,
          negativeFlag: true,
          zeroFlag: true,
          onClamp: (e) => log('n4 clamp', e),
          onInvalidate: (e) => log('n4 invalidate', e),
        }"
      />
    </div>

    <!-- ⑪ max 越界回调 -->
    <div class="module">
      <h5>⑪ 数字 - 越界回调（输入 99999 → 触发 onClamp，夹回 1000）</h5>
      <el-input
        v-model="n5Value"
        placeholder="输入大于 1000 的值会触发 onClamp"
        v-inputFilter:number="{
          integral: 6,
          decimal: 2,
          max: 1000,
          zeroFlag: true,
          onClamp: (e) => log('n5 clamp', e),
          onInvalidate: (e) => log('n5 invalidate', e),
        }"
      />
    </div>

    <!-- ⑫ 大整数 -->
    <div class="module">
      <h5>⑫ 数字 - 大整数（integral=12, decimal=0）</h5>
      <el-input
        v-model="n6Value"
        placeholder="试输入 1234567890123 → 应保留 12 位整数"
        v-inputFilter:number="{ integral: 12, decimal: 0, zeroFlag: true, allowPlus: true }"
      />
    </div>

    <!-- ⑬ 小数位数截断 -->
    <div class="module">
      <h5>⑬ 数字 - 小数位数截断（输入 0.123456789 → 应保留 0.123456）</h5>
      <el-input
        v-model="n7Value"
        placeholder="试输入 0.123456789 → 应保留 0.123456"
        v-inputFilter:number="{ integral: 4, decimal: 6, zeroFlag: true }"
      />
    </div>

    <!-- ⑭ 零标志 -->
    <div class="module">
      <h5>⑭ 数字 - 零标志（zeroFlag=false 首位 0 会被清掉）</h5>
      <div class="row">
        <el-tag type="info">当前 zeroFlag = false</el-tag>
        <el-tag type="success">输入 0.5 → 应保留 .5（首字符不是 0 也不是符号）</el-tag>
      </div>
      <el-input
        v-model="n8Value"
        placeholder='输入 "0123" → "123"，"0.5" → "0.5"'
        v-inputFilter:number="{ integral: 6, decimal: 2, zeroFlag: false }"
      />
    </div>

    <!-- ⑮ 中间非法符号 -->
    <div class="module">
      <h5>⑮ 数字 - 中间非法符号修复（试输入 1-2 / -1-2 / 1+2）</h5>
      <div class="row">
        <el-tag type="info">negativeFlag + allowPlus 同时开启</el-tag>
        <el-tag type="success">修复：中间非法 - / + 会被剔除</el-tag>
      </div>
      <el-input
        v-model="n9Value"
        placeholder="如 -1-2 / 1+2 会被规范化为 -12 / +12"
        v-inputFilter:number="{
          integral: 6,
          decimal: 2,
          negativeFlag: true,
          allowPlus: true,
          zeroFlag: true,
          onInvalidate: (e) => log('n9 invalidate', e),
        }"
      />
    </div>

    <!-- ⑯ .5 自动补 0 -->
    <div class="module">
      <h5>⑯ 数字 - 边界：".5" 自动补 0（输入 ".5" → "0.5"）</h5>
      <el-input
        v-model="n10Value"
        placeholder="试输入 .5 / .25 / ..5"
        v-inputFilter:number="{ integral: 4, decimal: 2, zeroFlag: true }"
      />
    </div>

    <!-- ⑰ 末尾小数点保留 -->
    <div class="module">
      <h5>⑰ 数字 - 边界：末尾小数点保留（输入 "1." → "1."）</h5>
      <el-input
        v-model="n11Value"
        placeholder='输入 "1." 后停手，再键入 "5" 会变 "1.5"'
        v-inputFilter:number="{ integral: 4, decimal: 2, zeroFlag: true }"
      />
    </div>

    <!-- ⑱ 负零归一 -->
    <div class="module">
      <h5>⑱ 数字 - 边界：负零归一（"-0" / "+0" / "00.5" → "0" / "0.5"）</h5>
      <el-input
        v-model="n12Value"
        placeholder='试输入 -0 / +0 / 0.0 / 00.5'
        v-inputFilter:number="{
          integral: 4,
          decimal: 2,
          negativeFlag: true,
          allowPlus: true,
          zeroFlag: true,
          onInvalidate: (e) => log('n12 invalidate', e),
        }"
      />
    </div>

    <!-- ⑲ 千分位 / 字母混入 -->
    <div class="module">
      <h5>⑲ 数字 - 边界：千分位 / 字母混入（粘贴 "1,234.5abc" → "1234.5"）</h5>
      <div class="row">
        <el-tag type="info">尝试复制 "1,234.5abc" 粘贴进来</el-tag>
      </div>
      <el-input
        v-model="n13Value"
        placeholder="可粘贴混合内容验证清洗兜底"
        v-inputFilter:number="{
          integral: 8,
          decimal: 3,
          zeroFlag: true,
          allowPlus: true,
          negativeFlag: true,
        }"
      />
    </div>

    <!-- ⑳ 空串 / 单符号 -->
    <div class="module">
      <h5>⑳ 数字 - 边界：空串 / 单符号（输入 "" 合法 / "-" 留符号等待后续）</h5>
      <el-input
        v-model="n14Value"
        placeholder="试输入 - / + / -. / . — 看是否合法过渡"
        v-inputFilter:number="{
          integral: 4,
          decimal: 2,
          negativeFlag: true,
          allowPlus: true,
          zeroFlag: true,
          onInvalidate: (e) => log('n14 invalidate', e),
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

const log = props.log;

const n2 = reactive({
  negativeFlag: true,
  allowPlus: false,
  zeroFlag: true,
});

const n1Value = ref<string>('');
const n2Value = ref<string>('');
const n3Value = ref<string>('');
const n4Value = ref<string>('');
const n5Value = ref<string>('');
const n6Value = ref<string>('');
const n7Value = ref<string>('');
const n8Value = ref<string>('');
const n9Value = ref<string>('');
const n10Value = ref<string>('');
const n11Value = ref<string>('');
const n12Value = ref<string>('');
const n13Value = ref<string>('');
const n14Value = ref<string>('');
</script>

<style lang="less" scoped>
.if-number-filter {
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
