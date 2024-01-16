<template>
  <ul class="daar-energycode-radio" id="daar-energycode-radio">
    <li
      v-for="(item, index) in energyCodeList"
      :key="'energycode-' + index"
      :class="{ selected: energyCode === item.code, first: index === 0, last: index === energyCodeList.length - 1 }"
      @click="handleSelect(item.code, item.name, item.unit)"
    >
      {{ item.name }}
    </li>
  </ul>
</template>
<script lang="ts" setup>
import { PropType } from 'vue';
import { Daar_IEnergyVO } from '../daar-abnormal-threshold-configure/daar-abnormal-threshold-configure.api';

const emit = defineEmits(['setEnergyCode']);

const props = defineProps({
  energyCode: {
    type: String,
    default: '',
  },
  energyCodeList: {
    type: Array as PropType<Daar_IEnergyVO[]>,
    default: [],
  },
});

function handleSelect(value: string, name: string, unit: string) {
  if (value !== props.energyCode) {
    emit('setEnergyCode', value, name, unit);
  }
}
</script>
<style lang="less" scoped>
#daar-energycode-radio {
  display: flex;
  align-items: center;
  border-radius: 4px;

  li {
    position: relative;
    cursor: pointer;
    display: inline-block;
    padding: 7px 16px;
    border-right: 1px solid var(--color-text-border);
    border-top: 1px solid var(--color-text-border);
    border-bottom: 1px solid var(--color-text-border);

    &.first {
      border-left: 1px solid var(--color-text-border);
      border-radius: 4px 0 0 4px;
    }

    &.last {
      border-radius: 0 4px 4px 0;
    }
  }

  li.selected {
    color: var(--color-primary);
    transition: all 233ms;

    &::before {
      display: inline-block;

      content: '';
      width: 100%;
      height: 100%;
      border: 1px solid var(--color-primary);

      position: absolute;
      top: -1px;
      left: -1px;
    }

    &.first::before {
      border-radius: 4px 0 0 4px;
    }

    &.last::before {
      border-radius: 0 4px 4px 0;
    }
  }
}
</style>
