<template>
  <el-popover
    popper-class="add-select-popper"
    placement="bottom"
    :width="211"
    :offset="8"
    :show-arrow="false"
    v-model:visible="addSelect.visible"
    trigger="click"
    :teleported="false"
    @hide="addSelect.hide"
  >
    <template #reference>
      <div class="add-select">
        <input type="text" v-model="addSelect.value" @input="addSelect.input" @blur="handleInputBlur" />
        <i :class="['iconfont icon-xiangxiajiantou', addSelect.visible ? 'expanded' : '']"></i>
      </div>
    </template>
    <ul v-show="addSelect.list?.length">
      <li
        v-for="(item, index) in addSelect.list"
        :key="'li' + index"
        :class="{ selected: item === addSelect.value }"
        @click="handleSelect(item)"
      >
        {{ item }}
      </li>
    </ul>
    <div v-show="addSelect.list?.length === 0" class="asp-nodata">
      <img src="../../../assets/images/common/common-data-none.svg" />
      <p>暂无数据</p>
    </div>
  </el-popover>
</template>
<script lang="ts" setup>
import { onMounted } from 'vue';
const emit = defineEmits(['select']);
import addSelect from './add-select.service';

onMounted(() => {
  const list = ['测试', '测试1'];
  addSelect.show('测试', list);
});

const handleInputBlur = () => {
  if (addSelect.value !== addSelect.originValue) {
    console.warn('-------------', addSelect.value);
    emit('select', addSelect.value);
  }
};

const handleSelect = (value: string) => {
  addSelect.select(value);
  if (addSelect.value !== addSelect.originValue) {
    console.warn('-------------', addSelect.value);
    emit('select', addSelect.value);
  }
};
</script>
<style lang="less" scoped>
.add-select {
  width: 211px;
  height: 32px;

  background-color: #fff;
  border: 1px solid rgba(0, 0, 0, 0.15);

  box-sizing: border-box;

  input {
    height: 30px;
    line-height: 30px;

    font-size: 14px;

    border: none;

    &:focus {
      box-shadow: none;
    }
  }

  i.iconfont {
    display: inline-block;
    font-size: 14px;
    color: var(--color-text-secondary);

    transform: rotate(0deg);
    transition: all 233ms;
  }

  i.iconfont.expanded {
    transform: rotate(180deg);
    transition: all 233ms;
  }
}

.el-popover.el-popper.add-select-popper {
  padding: 0 !import;

  ul {
    list-style: none;
    margin-bottom: 0;

    > li {
      display: block;
      list-style: none;

      height: 32px;

      font-size: 14px;
      color: var(--color-text-primary);

      padding: 5px 12px;

      &.selected {
        background-color: var(--color-hover);
        color: var(--color-text-title);
      }

      &:not(.selected):hover {
        background-color: rgba(0, 0, 0, 0.04);
        transition: all 233ms;
      }
    }
  }

  .asp-nodata {
    display: flex;
    flex-direction: column;

    justify-content: center;
    align-items: center;

    img {
      width: 64px;
      height: 41px;
    }

    p {
      color: var(--color-text-disable);
      font-size: 14px;
      margin-top: 8px;
    }
  }
}
</style>
