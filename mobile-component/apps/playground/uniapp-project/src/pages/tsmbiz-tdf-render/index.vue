<template>
  <tsm-theme-provider>
    <!-- 测试基本用法 -->
    <tsmbiz-tdf-render :data="dsl" v-model="formData" @submit="submitData" />
  </tsm-theme-provider>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const dsl = ref([
  {
    type: 'input',
    field: 'name',
    title: '名字',
    info: '',
    $required: '请输入',
    props: {
      placeholder: '请输入名字',
      maxlength: 6,
      showWordimit: true,
    },
    _fc_id: 'id_F8mkmqfz0j5facc',
    name: 'ref_F4gimqfz0j5fadc',
    display: true,
    hidden: false,
    _fc_drag_tag: 'input',
    validate: [
      {
        mode: 'maxLen',
        trigger: 'blur',
        adapter: true,
        maxLen: 6,
      },
      {
        mode: 'email',
        trigger: 'blur',
        adapter: true,
        email: true,
        message: '请输入正确的邮箱格式',
      },
    ],
  },
  {
    type: 'input',
    field: 'remark',
    title: '备注',
    info: '请输入',
    $required: true,
    props: {
      type: 'textarea',
      placeholder: '请输入',
    },
    _fc_id: 'id_Fgubmqfz0jmjafc',
    name: 'ref_F78emqfz0jmjagc',
    display: true,
    hidden: false,
    _fc_drag_tag: 'textarea',
  },
  {
    type: 'radio',
    field: 'Fnacmqg8nfl5ahc',
    title: '单选框',
    info: '',
    effect: {
      fetch: '',
    },
    $required: false,
    options: [
      {
        label: '选项01',
        value: '1',
      },
      {
        label: '选项02',
        value: '2',
      },
      {
        label: '选项03',
        value: '3',
      },
    ],
    _fc_id: 'id_Feh7mqg8nfl6aic',
    name: 'ref_Frmumqg8nfl6ajc',
    display: true,
    hidden: false,
    _fc_drag_tag: 'radio',
  },
  {
    type: 'checkbox',
    field: 'Fn99mqg96vhlakc',
    title: '多选框',
    info: '',
    effect: {
      fetch: '',
    },
    $required: false,
    options: [
      {
        label: '选项01',
        value: '1',
      },
      {
        label: '选项02',
        value: '2',
      },
      {
        label: '选项03',
        value: '3',
      },
    ],
    _fc_id: 'id_Fvt6mqg96vhlalc',
    name: 'ref_Fdqbmqg96vhlamc',
    display: true,
    hidden: false,
    _fc_drag_tag: 'checkbox',
  },
  {
    type: 'rate',
    field: 'Fw35mqg9ee69anc',
    title: '评分',
    info: '',
    $required: '请打分',
    _fc_id: 'id_Ffdlmqg9ee69aoc',
    name: 'ref_Fid6mqg9ee69apc',
    display: true,
    hidden: false,
    _fc_drag_tag: 'rate',
    value: 0,
  },
  {
    type: 'select',
    field: 'Fbvbmqgahyb9aqc',
    title: '城市',
    info: '',
    effect: {
      fetch: '',
    },
    $required: false,
    options: [
      {
        label: '选项01',
        value: '1',
      },
      {
        label: '选项02',
        value: '2',
      },
      {
        label: '选项03',
        value: '3',
      },
    ],
    _fc_id: 'id_Fn1lmqgahyb9arc',
    name: 'ref_Ftelmqgahyb9asc',
    display: true,
    hidden: false,
    _fc_drag_tag: 'select',
    visiable: false,
  },
  {
    type: 'select',
    field: 'select1',
    title: '城市',
    info: '',
    effect: {
      fetch: '',
    },
    $required: false,
    options: [
      {
        label: '选项01',
        value: '1',
      },
      {
        label: '选项02',
        value: '2',
      },
      {
        label: '选项03',
        value: '3',
      },
    ],
    _fc_id: 'id_Fn1lmqgahyb9arc',
    name: 'ref_Ftelmqgahyb9asc',
    display: true,
    hidden: false,
    _fc_drag_tag: 'select',
    visiable: false,
  },
]);
const formData = ref<Record<string, any>>({
  name: 'jakson',
  Fbvbmqgahyb9aqc: '2',
});

const submitData = () => {
  console.log(formData.value);
};
</script>

<style scoped>
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
