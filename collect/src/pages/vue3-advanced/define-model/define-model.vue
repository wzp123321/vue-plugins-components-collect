<template>
  <div class="define-model-page">
    <h5>defineModel — 双向绑定新写法</h5>
    <el-alert type="info" :closable="false" style="margin-bottom: 20px">
      Vue 3.4+ 新增 <code>defineModel()</code> 宏，可以直接声明一个双向绑定的 prop，
      替代原来繁琐的 <code>props.modelValue + emit('update:modelValue')</code> 写法。
    </el-alert>

    <el-row :gutter="20">
      <!-- 旧写法 -->
      <el-col :span="12">
        <el-card>
          <template #header>🔴 旧写法（Vue3.3 及以前）</template>
          <pre class="code-block">{{ oldCode }}</pre>
          <el-divider>效果演示</el-divider>
          <p>父组件值：<strong>{{ oldValue }}</strong></p>
          <OldStyleInput v-model="oldValue" />
        </el-card>
      </el-col>

      <!-- 新写法 -->
      <el-col :span="12">
        <el-card>
          <template #header>🟢 新写法（Vue3.4+ defineModel）</template>
          <pre class="code-block">{{ newCode }}</pre>
          <el-divider>效果演示</el-divider>
          <p>父组件值：<strong>{{ newValue }}</strong></p>
          <NewStyleInput v-model="newValue" />
        </el-card>
      </el-col>

      <!-- 多个 model -->
      <el-col :span="24" style="margin-top: 20px">
        <el-card>
          <template #header>✨ 多个 defineModel（同时双向绑定多个值）</template>
          <pre class="code-block">{{ multiModelCode }}</pre>
          <el-divider>效果演示</el-divider>
          <p>姓名：<strong>{{ multiName }}</strong>，年龄：<strong>{{ multiAge }}</strong></p>
          <MultiModelInput v-model:name="multiName" v-model:age="multiAge" />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script lang="ts" setup>
import { ref, defineComponent, h } from 'vue';
import { ElInput } from 'element-plus';

defineOptions({ name: 'DefineModel' });

// ============ 旧写法组件 ============
const OldStyleInput = defineComponent({
  name: 'OldStyleInput',
  props: { modelValue: { type: String, default: '' } },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const handleInput = (val: string) => emit('update:modelValue', val);
    return () => h(ElInput, { modelValue: props.modelValue, placeholder: '旧写法输入框', onInput: handleInput });
  },
});

// ============ 新写法组件 ============
const NewStyleInput = defineComponent({
  name: 'NewStyleInput',
  setup() {
    const model = defineModel<string>({ default: '' });
    return () => h(ElInput, { modelValue: model.value, placeholder: '新写法输入框', onInput: (v: string) => (model.value = v) });
  },
});

// ============ 多 model 组件 ============
const MultiModelInput = defineComponent({
  name: 'MultiModelInput',
  setup() {
    const name = defineModel<string>('name', { default: '' });
    const age = defineModel<number>('age', { default: 0 });
    return () =>
      h('div', { style: 'display:flex;gap:12px' }, [
        h(ElInput, { modelValue: name.value, placeholder: '姓名', style: 'width:200px', onInput: (v: string) => (name.value = v) }),
        h(ElInput, { modelValue: String(age.value), placeholder: '年龄', style: 'width:120px', type: 'number', onInput: (v: string) => (age.value = Number(v)) }),
      ]);
  },
});

const oldValue = ref('Hello');
const newValue = ref('World');
const multiName = ref('张三');
const multiAge = ref(25);

const oldCode = `// 子组件 - 旧写法
const props = defineProps(['modelValue'])
const emit = defineEmits(['update:modelValue'])
// 使用时需要手动 emit
emit('update:modelValue', newVal)`;

const newCode = `// 子组件 - 新写法 (Vue3.4+)
const model = defineModel<string>()
// 直接赋值就能同步到父组件
model.value = newVal`;

const multiModelCode = `// 子组件 - 多个 defineModel
const name = defineModel<string>('name')
const age  = defineModel<number>('age')

// 父组件使用
<MyComp v-model:name="name" v-model:age="age" />`;
</script>

<style lang="less" scoped>
.define-model-page {
  padding: 20px;
  overflow-y: auto;

  .code-block {
    background: #1e1e2e;
    color: #cdd6f4;
    border-radius: 8px;
    padding: 16px;
    font-size: 12px;
    line-height: 1.7;
    overflow-x: auto;
    white-space: pre;
  }
}
</style>
