<template>
  <div class="copy-clone-page">
    <h5>深拷贝 & 浅拷贝</h5>

    <el-row :gutter="16">
      <!-- 浅拷贝演示 -->
      <el-col :span="12">
        <el-card>
          <template #header>❗ 浅拷贝的问题（共享引用）</template>
          <div class="demo-section">
            <div class="obj-display">
              <div>原始对象：<code>{{ JSON.stringify(original) }}</code></div>
              <div>浅拷贝：<code>{{ JSON.stringify(shallow) }}</code></div>
            </div>
            <el-button size="small" type="warning" @click="mutateShallow">修改浅拷贝的 nested.x</el-button>
            <div class="result-hint" v-if="shallowMutated">
              ⚠️ 原始对象的 nested.x 也变了！（{{ original.nested.x }}）两者共享同一个引用。
            </div>
            <el-button size="small" @click="resetShallow">重置</el-button>
          </div>
          <pre class="code-block">{{ shallowCode }}</pre>
        </el-card>
      </el-col>

      <!-- 深拷贝方案对比 -->
      <el-col :span="12">
        <el-card>
          <template #header>✅ 深拷贝方案对比</template>
          <el-table :data="deepCopyMethods" size="small" border>
            <el-table-column prop="method" label="方案" width="140" />
            <el-table-column prop="pro" label="优点" />
            <el-table-column prop="con" label="缺点" />
          </el-table>
        </el-card>
      </el-col>

      <!-- 手写深拷贝 -->
      <el-col :span="12" style="margin-top:16px">
        <el-card>
          <template #header>🔨 手写深拷贝（处理循环引用）</template>
          <div class="demo-section">
            <el-button type="primary" size="small" @click="testDeepClone">测试深拷贝</el-button>
            <div v-if="deepResult" class="result-hint success">{{ deepResult }}</div>
          </div>
          <pre class="code-block">{{ deepCloneCode }}</pre>
        </el-card>
      </el-col>

      <!-- structuredClone -->
      <el-col :span="12" style="margin-top:16px">
        <el-card>
          <template #header>🌟 现代方案：structuredClone（推荐）</template>
          <div class="demo-section">
            <el-button type="success" size="small" @click="testStructuredClone">测试 structuredClone</el-button>
            <div v-if="structuredResult" class="result-hint success">{{ structuredResult }}</div>
          </div>
          <pre class="code-block">{{ structuredCode }}</pre>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue';

defineOptions({ name: 'CopyClone' });

const original = reactive({ name: '原始', value: 1, nested: { x: 10 }, arr: [1, 2, 3] });
const shallow = ref({ ...original });
const shallowMutated = ref(false);

const mutateShallow = () => {
  shallow.value.nested.x = 999;
  shallowMutated.value = true;
};
const resetShallow = () => {
  original.nested.x = 10;
  shallow.value = { ...original };
  shallowMutated.value = false;
};

const deepCopyMethods = [
  { method: 'JSON.parse/stringify', pro: '简单快速', con: '不支持 undefined/函数/Date/循环引用' },
  { method: 'structuredClone', pro: '原生支持，支持 Date/Map/Set', con: '不支持函数、DOM、原型链' },
  { method: 'lodash cloneDeep', pro: '功能完整，处理所有类型', con: '需要引入外部库' },
  { method: '手写递归', pro: '完全可控，可自定义', con: '实现复杂，需处理循环引用' },
];

const deepResult = ref('');
const structuredResult = ref('');

// 手写深拷贝（处理循环引用）
function deepClone<T>(value: T, seen = new WeakMap()): T {
  if (value === null || typeof value !== 'object') return value;
  if (seen.has(value as object)) return seen.get(value as object);
  if (value instanceof Date) return new Date(value.getTime()) as unknown as T;
  if (value instanceof RegExp) return new RegExp(value.source, value.flags) as unknown as T;
  if (value instanceof Map) {
    const cloned = new Map();
    seen.set(value as object, cloned);
    value.forEach((v, k) => cloned.set(deepClone(k, seen), deepClone(v, seen)));
    return cloned as unknown as T;
  }
  if (value instanceof Set) {
    const cloned = new Set();
    seen.set(value as object, cloned);
    value.forEach((v) => cloned.add(deepClone(v, seen)));
    return cloned as unknown as T;
  }
  if (Array.isArray(value)) {
    const cloned: any[] = [];
    seen.set(value as object, cloned);
    value.forEach((item, i) => { cloned[i] = deepClone(item, seen); });
    return cloned as unknown as T;
  }
  const cloned = Object.create(Object.getPrototypeOf(value));
  seen.set(value as object, cloned);
  Object.keys(value as object).forEach((key) => {
    (cloned as any)[key] = deepClone((value as any)[key], seen);
  });
  return cloned;
}

const testDeepClone = () => {
  const obj = { a: 1, date: new Date(), arr: [1, [2, 3]], nested: { x: 42 } };
  const cloned = deepClone(obj);
  cloned.nested.x = 999;
  deepResult.value = `✅ 深拷贝成功！原始 nested.x = ${obj.nested.x}（未被影响），克隆的 nested.x = ${cloned.nested.x}，Date 类型正确: ${cloned.date instanceof Date}`;
};

const testStructuredClone = () => {
  const obj = { name: 'test', date: new Date(), map: new Map([['a', 1]]), arr: [1, [2, 3]] };
  const cloned = structuredClone(obj);
  cloned.arr[1] = [99];
  structuredResult.value = `✅ structuredClone 成功！原始 arr[1] = ${JSON.stringify(obj.arr[1])}（未被影响），Date: ${cloned.date instanceof Date}，Map size: ${cloned.map.size}`;
};

const shallowCode = `// 浅拷贝的几种方式
const shallow1 = { ...obj }           // spread
const shallow2 = Object.assign({}, obj)
const shallow3 = obj.slice()          // 数组

// ⚠️ 嵌套对象仍然共享引用！
const original = { a: 1, nested: { x: 10 } }
const copied = { ...original }
copied.nested.x = 999
console.log(original.nested.x)  // 999 ← 被影响了！`;

const deepCloneCode = `function deepClone(value, seen = new WeakMap()) {
  if (value === null || typeof value !== 'object') return value
  if (seen.has(value)) return seen.get(value)  // 处理循环引用

  if (value instanceof Date) return new Date(value)
  if (value instanceof Map) {
    const map = new Map()
    seen.set(value, map)
    value.forEach((v, k) => map.set(deepClone(k, seen), deepClone(v, seen)))
    return map
  }

  const cloned = Array.isArray(value) ? [] : Object.create(Object.getPrototypeOf(value))
  seen.set(value, cloned)  // 先记录再递归，防止循环引用

  for (const key of Object.keys(value)) {
    cloned[key] = deepClone(value[key], seen)
  }
  return cloned
}`;

const structuredCode = `// 原生 structuredClone（Chrome 98+, Node 17+）
const cloned = structuredClone(obj)

// 支持的类型：
// ✅ Date, RegExp, Map, Set, ArrayBuffer
// ✅ 嵌套对象和数组
// ✅ 循环引用
// ❌ 函数（会报错）
// ❌ DOM 节点
// ❌ 原型链上的方法

// 转移 ArrayBuffer（零拷贝，提升性能）
const buffer = new ArrayBuffer(1024)
const clonedBuffer = structuredClone(buffer, { transfer: [buffer] })`;
</script>

<style lang="less" scoped>
.copy-clone-page { padding: 20px; overflow-y: auto; }
.demo-section { display: flex; flex-direction: column; gap: 10px; margin-bottom: 12px; }
.obj-display { background: #f5f7fa; padding: 10px; border-radius: 6px; font-size: 12px; code { color: #409eff; } }
.result-hint { padding: 8px 12px; border-radius: 6px; font-size: 12px; background: #fdf6ec; color: #e6a23c; &.success { background: #f0f9eb; color: #67c23a; } }
.code-block {
  background: #1e1e2e; color: #cdd6f4; border-radius: 8px;
  padding: 14px; font-size: 11px; line-height: 1.7; overflow-x: auto; white-space: pre;
}
</style>
