<!--
 * @Author: wanzp
 * @Date: 2023-05-22 21:24:52
 * @LastEditors: wanzp
 * @LastEditTime: 2026-06-12 12:00:00
 * @Description: v-inputFilter 指令完整 demo（覆盖文本 / 数字 / 回调全场景）
-->
<template>
  <div class="input-directive">
    <!-- ============ 文本模式 ============ -->
    <div class="module">
      <h5>① 文本 - 基础开关（默认安全字符 + 中文 / 空格开关）</h5>
      <div class="row">
        <span>允许中文</span>
        <el-switch v-model="t1.allowChinese" />
        <span>允许空格</span>
        <el-switch v-model="t1.allowSpace" />
      </div>
      <el-input v-model="t1Value" placeholder='试试输入 \ ; &#39; " < > 符号和中文' clearable v-inputFilter:text="t1" />
    </div>

    <div class="module">
      <h5>② 文本 - 自定义 denylist 正则（去除数字）</h5>
      <el-input v-model="t2Value" placeholder="数字会被实时剔除" v-inputFilter:text="{ regExp: /[0-9]/g }" />
    </div>

    <div class="module">
      <h5>③ 文本 - 白名单 allowPattern（只允许字母+数字）</h5>
      <el-input
        v-model="t3Value"
        placeholder="只能输入字母和数字"
        v-inputFilter:text="{ allowPattern: /[A-Za-z0-9]/g }"
      />
    </div>

    <div class="module">
      <h5>④ 文本 - maxLength 截断（最多 8 位）</h5>
      <el-input
        v-model="t4Value"
        placeholder="输入超过 8 位会截断"
        maxlength="100"
        v-inputFilter:text="{ maxLength: 8, onClamp: (e) => log('t4 clamp', e) }"
      />
    </div>

    <div class="module">
      <h5>⑤ 文本 - 大写转换 transform: 'upper'</h5>
      <el-input v-model="t5Value" placeholder="输入自动转大写" v-inputFilter:text="{ transform: 'upper' }" />
    </div>

    <div class="module">
      <h5>⑥ 文本 - 自定义 transform 函数（去首尾空格 + 替换 @ 为 #）</h5>
      <el-input
        v-model="t6Value"
        placeholder="例如：  hello@world  →  hello#world"
        v-inputFilter:text="{
          transform: (s) => s.trim().replace(/@/g, '#'),
        }"
      />
    </div>

    <!-- ============ 数字模式 ============ -->
    <div class="module">
      <h5>⑦ 数字 - 基础（整数 6 位 + 小数 2 位）</h5>
      <el-input v-model="n1Value" placeholder="如 123456.78" v-inputFilter:number="{ integral: 6, decimal: 2 }" />
    </div>

    <div class="module">
      <h5>⑧ 数字 - 负数（integral: 4 / decimal: 2 / negativeFlag）</h5>
      <el-input
        v-model="n2Value"
        placeholder="如 -12.34"
        v-inputFilter:number="{ integral: 4, decimal: 2, negativeFlag: true }"
      />
    </div>

    <div class="module">
      <h5>⑨ 数字 - 允许 0（zeroFlag: true + decimal: 2）</h5>
      <el-input
        v-model="n3Value"
        placeholder="可输入 0 / 0.5"
        v-inputFilter:number="{ integral: 4, decimal: 2, zeroFlag: true }"
      />
    </div>

    <div class="module">
      <h5>⑩ 数字 - 不允许 0（zeroFlag: false + decimal: 2）</h5>
      <div class="row">
        <el-tag type="success">修复：现在 0.5 / 0.25 仍然合法</el-tag>
      </div>
      <el-input
        v-model="n4Value"
        placeholder="输入 0.5 / 0.25 / 0.1 试试"
        v-inputFilter:number="{
          integral: 4,
          decimal: 2,
          zeroFlag: false,
          onInvalidate: (e) => log('n4 invalidate', e),
        }"
      />
    </div>

    <div class="module">
      <h5>⑪ 数字 - min / max 夹回（min=0, max=100, decimal=0）</h5>
      <el-input
        v-model="n5Value"
        placeholder="< 0 变 0，> 100 变 100"
        v-inputFilter:number="{ integral: 4, decimal: 0, min: 0, max: 100, onClamp: (e) => log('n5 clamp', e) }"
      />
    </div>

    <div class="module">
      <h5>⑫ 数字 - 允许 + 前缀（allowPlus: true）</h5>
      <el-input
        v-model="n6Value"
        placeholder="可输入 +12.34"
        v-inputFilter:number="{ integral: 4, decimal: 2, allowPlus: true, zeroFlag: true }"
      />
    </div>

    <div class="module">
      <h5>⑬ 数字 - 整数（decimal=0，禁止小数点）</h5>
      <el-input
        v-model="n7Value"
        placeholder="只允许整数"
        v-inputFilter:number="{ integral: 8, decimal: 0, zeroFlag: true }"
      />
    </div>

    <div class="module">
      <h5>⑭ 数字 - 负数 + 0 + min/max 综合（典型金额输入）</h5>
      <el-input
        v-model="n8Value"
        placeholder="-1000.00 ~ 1000.00"
        v-inputFilter:number="{
          integral: 6,
          decimal: 2,
          negativeFlag: true,
          zeroFlag: true,
          min: -1000,
          max: 1000,
          onClamp: (e) => log('n8 clamp', e),
          onInvalidate: (e) => log('n8 invalidate', e),
        }"
      />
    </div>

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

    <div class="module">
      <h5>⑯ 数字 - 边界：".5" 自动补 0（输入 ".5" → "0.5"）</h5>
      <el-input
        v-model="n10Value"
        placeholder="试输入 .5 / .25 / ..5"
        v-inputFilter:number="{ integral: 4, decimal: 2, zeroFlag: true }"
      />
    </div>

    <div class="module">
      <h5>⑰ 数字 - 边界：末尾小数点保留（输入 "1." → "1."，再输入 "5" → "1.5"）</h5>
      <el-input
        v-model="n11Value"
        placeholder='输入 "1." 后停手，再键入 "5" 会变 "1.5"'
        v-inputFilter:number="{ integral: 4, decimal: 2, zeroFlag: true }"
      />
    </div>

    <div class="module">
      <h5>⑱ 数字 - 边界：负零归一（输入 "-0" / "+0" → "0"，再 "0.0" → "0"）</h5>
      <el-input
        v-model="n12Value"
        placeholder="试输入 -0 / +0 / 0.0 / 00.5"
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

    <div class="module">
      <h5>⑲ 数字 - 边界：千分位 / 字母混入（粘贴 "1,234.5abc" → "1234.5"）</h5>
      <div class="row">
        <el-tag type="info">尝试复制 "1,234.5abc" 粘贴进来</el-tag>
      </div>
      <el-input
        v-model="n13Value"
        placeholder="可粘贴混合内容验证清洗兜底"
        v-inputFilter:number="{ integral: 8, decimal: 3, zeroFlag: true, allowPlus: true, negativeFlag: true }"
      />
    </div>

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

    <div class="module">
      <h5>㉑ arg 缺省 fallback：v-inputFilter="{}" 走文本（默认安全字符）</h5>
      <div class="row">
        <el-tag type="info">无 :text / :number arg，根据字段嗅探模式</el-tag>
      </div>
      <el-input v-model="f1Value" placeholder='试试输入 \ ; &#39; " < > 等符号' v-inputFilter="{}" />
    </div>

    <div class="module">
      <h5>㉒ arg 缺省 fallback：v-inputFilter="{ integral: 4, decimal: 2 }" 走数字</h5>
      <div class="row">
        <el-tag type="info">只要带数字特征字段，自动识别为数字模式</el-tag>
      </div>
      <el-input
        v-model="f2Value"
        placeholder="嗅探为数字模式，等价 v-inputFilter:number"
        v-inputFilter="{ integral: 4, decimal: 2, zeroFlag: true }"
      />
    </div>

    <!-- ============ 事件日志 ============ -->
    <div class="module log">
      <h5>事件日志（onClamp / onInvalidate）</h5>
      <el-button size="small" @click="logs = []">清空</el-button>
      <pre>{{ logs.length === 0 ? '（暂无事件）' : logs.join('\n') }}</pre>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue';
import { ElButton, ElInput, ElSwitch, ElTag } from 'element-plus';
import type {
  IFilterCallbackInfo,
  IDirectiveNumberBindingVO,
  IDirectiveTextBindingVO,
} from '../../../directives/directive-filter/directive-filter.api';

defineOptions({
  components: { ElInput, ElSwitch, ElTag, ElButton },
});

/* ---------- 文本 ---------- */
const t1 = reactive<IDirectiveTextBindingVO>({
  allowChinese: true,
  allowSpace: true,
});
const t1Value = ref<string>('');

const t2Value = ref<string>('');

const t3Value = ref<string>('');

const t4Value = ref<string>('');

const t5Value = ref<string>('');

const t6Value = ref<string>('');

/* ---------- 数字 ---------- */
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

const f1Value = ref<string>('');

const f2Value = ref<string>('');

/* ---------- 事件日志 ---------- */
const logs = ref<string[]>([]);

const log = (label: string, info: IFilterCallbackInfo): void => {
  const time = new Date().toLocaleTimeString();
  logs.value.unshift(`[${time}] [${label}] type=${info.eventType} "${info.original}" → "${info.cleaned}"  (${info.reason})`);
  // 最多保留 30 条
  if (logs.value.length > 30) logs.value.length = 30;
};
</script>

<style lang="less" scoped>
.input-directive {
  width: 100%;
  height: 100%;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;
  box-sizing: border-box;

  .module {
    border: 1px solid #ebeef5;
    border-radius: 6px;
    padding: 12px 16px;
    background: #fafbfc;

    h5 {
      margin: 0 0 8px;
      font-size: 14px;
      color: #303133;
    }

    .row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
      font-size: 12px;
      color: #606266;
    }
  }

  .module.log pre {
    margin: 8px 0 0;
    padding: 8px;
    background: #1e1e1e;
    color: #d4d4d4;
    border-radius: 4px;
    font-size: 12px;
    line-height: 1.5;
    max-height: 200px;
    overflow-y: auto;
    white-space: pre-wrap;
  }
}
</style>
