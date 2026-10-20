<template>
  <tsm-theme-provider>
    <!-- 测试基本用法 -->
    <tsmbiz-tdf-render
      :data="dsl"
      v-model="formData"
      :select-teleport-to-body="true"
      @submit="submitData"
      @esign-landscape-change="onLandscapeChange"
    />
    <view class="landscape-tip">横屏签字态：{{ isLandscape ? '是' : '否' }}</view>
  </tsm-theme-provider>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const dsl = ref([
  {
    $required: false,
    _fc_drag_tag: 'input',
    _fc_id: 'id_Fs97mu6ndlspboc',
    field: 'F1kxmu6ndlspbnc',
    info: '请输入你的想法',
    name: 'ref_Fd20mu6ndlspbpc',
    title: '输入框',
    type: 'input',
    display: true,
    hidden: false,
  },
  {
    $required: false,
    _fc_drag_tag: 'textarea',
    _fc_id: 'id_F38rmu6ndmpncjc',
    field: 'Ftk6mu6ndmpncic',
    info: '请详细说明下你的想法',
    name: 'ref_Fuuwmu6ndmpnckc',
    props: { type: 'textarea' },
    title: '多行输入框',
    type: 'input',
    display: true,
    hidden: false,
  },
  {
    $required: false,
    _fc_drag_tag: 'inputNumber',
    _fc_id: 'id_Feu6mu6ndnrkdcc',
    field: 'Fps7mu6ndnrkdbc',
    info: '',
    name: 'ref_F14zmu6ndnrkddc',
    title: '计数器',
    type: 'inputNumber',
    display: true,
    hidden: false,
  },
  {
    $required: false,
    _fc_drag_tag: 'radio',
    _fc_id: 'id_Fr94mu6ndov2e9c',
    effect: { fetch: '' },
    field: 'Fcwhmu6ndov2e8c',
    info: '你有什么问题',
    name: 'ref_Fxwdmu6ndov2eac',
    options: [
      { label: '没问题', value: '1' },
      { label: '问题好多', value: '2' },
      { label: '都行', value: '3' },
    ],
    title: '单选框',
    type: 'radio',
    display: true,
    hidden: false,
  },
  {
    $required: false,
    _fc_drag_tag: 'checkbox',
    _fc_id: 'id_Fam9mu6ndq66f4c',
    effect: { fetch: '' },
    field: 'Fi02mu6ndq66f3c',
    info: '请选择你的爱好',
    name: 'ref_F6i0mu6ndq66f5c',
    options: [
      { label: '唱歌', value: '1' },
      { label: '跳舞', value: '2' },
      { label: '乒乓球', value: '3' },
    ],
    title: '多选框',
    type: 'checkbox',
    display: true,
    hidden: false,
  },
  {
    $required: false,
    _fc_drag_tag: 'select',
    _fc_id: 'id_Fdnmmu6ndr9sg3c',
    effect: { fetch: '' },
    field: 'F5h3mu6ndr9sg2c',
    info: '请选择你的想法',
    name: 'ref_F5uwmu6ndr9sg4c',
    options: [
      { label: '选项01', value: '1' },
      { label: '选项02', value: '2' },
      { label: '选项03', value: '3' },
    ],
    title: '选择器',
    type: 'select',
    display: true,
    hidden: false,
  },
  {
    $required: false,
    _fc_drag_tag: 'signaturePad',
    _fc_id: 'id_Fxblmu6ndsl4hgc',
    field: 'Fxb8mu6ndsl4hfc',
    info: '请输入你的签名',
    name: 'ref_Fshrmu6ndsl4hhc',
    title: '手写签名',
    type: 'signaturePad',
    display: true,
    hidden: false,
  },
]);
const formData = ref<Record<string, any>>({
  name: 'jakson',
  Fbvbmqgahyb9aqc: '2',
});

const submitData = () => {
  console.log(formData.value);
};

// 横屏签字态：内部签名板进入旋转横屏签名时为 true，退出为 false
const isLandscape = ref(false);
const onLandscapeChange = (val: boolean) => {
  isLandscape.value = val;
  console.log('tdf-render esign-landscape-change:', val);
};
</script>

<style scoped>
.landscape-tip {
  position: fixed;
  top: 8px;
  left: 8px;
  z-index: 9999;
  padding: 2px 8px;
  font-size: 12px;
  color: #fff;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 4px;
}
.container {
  padding: 20rpx;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.header {
  margin-bottom: 30rpx;
}

.title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.content {
  background-color: #fff;
  border-radius: 12rpx;
  padding: 20rpx;
}

.section {
  margin-bottom: 30rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #666;
  margin-bottom: 20rpx;
}

.btn {
  width: 100%;
  height: 80rpx;
  line-height: 80rpx;
  background-color: #1890ff;
  color: #fff;
  border-radius: 8rpx;
  font-size: 28rpx;
}

.selected-text {
  font-size: 24rpx;
  color: #666;
  line-height: 40rpx;
  white-space: pre-wrap;
}
</style>
