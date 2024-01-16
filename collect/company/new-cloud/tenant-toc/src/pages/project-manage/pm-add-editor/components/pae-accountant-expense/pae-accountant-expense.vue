<template>
  <div class="pae-accountant-expense">
    <te-checkbox-group v-model="cFeeNodeType" @change="handleCheckChange">
      <te-checkbox v-for="item in feeNodeTypes" :label="item.code" name="type">
        <span>{{ item.name }}</span>
        <icon-edit-pen
          v-show="mapConfigureShow(item.code) && !mapConfigureEnergyShow(item.code)"
          @click="handleConfigureDialogShow($event, item.code)"
        />
        <te-popover
          v-if="mapConfigureShow(item.code) && mapConfigureEnergyShow(item.code)"
          placement="top"
          title="编辑院方部分缴费"
          popper-class="pac-popover"
          :width="width"
          trigger="click"
          :teleported="false"
          v-model:visible="visible"
          @before-enter="handlePopoverShow"
        >
          <template #reference>
            <icon-edit-pen @click="handleReferenceStop" />
          </template>
          <el-form class="pac-popover-form" label-width="136px">
            <el-form-item required label="院方缴费能源类型">
              <te-checkbox-group v-model="selectedCodes">
                <te-checkbox
                  v-for="item in allEnergyCodeList"
                  :label="item.code"
                  name="type"
                  class="pac-popover-form-checkbox"
                >
                  {{ item.name }}
                </te-checkbox>
              </te-checkbox-group>
            </el-form-item>
            <div class="pac-popover-form-button">
              <te-button @click="handleCancel">取消</te-button>
              <te-button type="primary" @click="handleSubmit">确定</te-button>
            </div>
          </el-form>
        </te-popover>
      </te-checkbox>
    </te-checkbox-group>
  </div>
  <!-- 数据配置 -->
  <pm-income-config ref="incomeConfigureRef"></pm-income-config>
</template>
<script lang="ts" setup>
// 公共库
import { PropType, onMounted, ref, nextTick, watch } from 'vue';
// api
import { CommonICodeName } from '@/service/api';
import { EnergyCode } from '@/pages/project-manage/services/project-manage.api';
import { PM_IFeeNodeTypeVO } from '../../pm-add-editor.api';
// 枚举
import { PM_EPath, PM_IFeeNodeType } from '../../../constant/enum';
// 组件
import { IconEditPen } from '@arco-iconbox/vue-te';
import pmIncomeConfig from '../../../pm-income-config/pm-income-config.vue';
import { TeMessage } from '@tiansu/element-plus';
// 工具方法
import { FBatchRemoveStorageData, FGetStorageData, FSetStorageData } from '@/utils/storage';
import { postRequest } from '@/service/request';
import { getTenant } from '@/utils';
// emits
const emits = defineEmits(['update:feeNodeType', 'triggerSave']);
// props
const props = defineProps({
  // 核算涉及费用
  feeNodeType: {
    type: Array as PropType<PM_IFeeNodeTypeVO[]>,
    default: [],
  },
  // 勾选的能源类型
  selectedEnergyList: {
    type: Array as PropType<string[]>,
    default: [],
  },
  // 全量能源类型列表
  energyCodeList: {
    type: Array as PropType<EnergyCode[]>,
    default: [],
  },
  // code-name Map
  energyCodeNameMap: {
    type: Object,
  },
});
// 托管类型
const feeNodeTypes: CommonICodeName<PM_IFeeNodeType>[] = Object.entries(PM_IFeeNodeType)
  .filter(([k, v]) => typeof v === 'number')
  .map(([k, v]) => {
    return {
      code: v as PM_IFeeNodeType,
      name: k,
    };
  });
/**
 * 展示图标
 * @param {PM_IFeeNodeType} code
 * @returns {boolean}
 */
const mapConfigureShow = (code: PM_IFeeNodeType): boolean => {
  return (
    [PM_IFeeNodeType.运维服务费, PM_IFeeNodeType.设备维保服务费, PM_IFeeNodeType.院方部分缴费].includes(code) &&
    cFeeNodeType.value.includes(code)
  );
};
/**
 * 展示配置能源类型
 * @param code
 * @returns {boolean}
 */
const mapConfigureEnergyShow = (code: PM_IFeeNodeType): boolean => {
  return [PM_IFeeNodeType.院方部分缴费].includes(code);
};
// 数据
const cFeeNodeType = ref<number[]>([]);

// 表单是否改动过
let serviceCheckFlag = false;
let deviceCheckFlag = false;
/**
 * 核算涉及服务change
 */
const handleCheckChange = (value: PM_IFeeNodeType[]) => {
  updateFeeNodeValue();
};
/**
 * 更新父组件数据
 */
const updateFeeNodeValue = () => {
  cFeeNodeType.value = cFeeNodeType.value?.sort((a, b) => {
    return Number(a) - Number(b);
  });
  let list: PM_IFeeNodeTypeVO[] = [];
  // 能源类型过滤空，进行排序
  cFeeNodeType.value.forEach((item) => {
    list.push({
      feeType: +item,
      energyCodes:
        +item === PM_IFeeNodeType.院方部分缴费
          ? selectedCodes.value
              ?.filter((item) => item !== '')
              ?.sort(
                (a, b) =>
                  props.energyCodeList.findIndex((cItem) => cItem.code === a) -
                  props.energyCodeList.findIndex((cItem) => cItem.code === b),
              )
              ?.join(',')
          : '',
    });
  });
  // 排序
  emits('update:feeNodeType', list);
  console.log('%c✨✨核算涉及服务change✨✨', 'font-size: 24px', list);
};

// 弹框
const incomeConfigureRef = ref();
/**
 * 打开弹框
 * @param {Event} e 事件对象
 * @param {PM_IFeeNodeType} type 类型
 */
const handleConfigureDialogShow = (e: Event, type: PM_IFeeNodeType) => {
  e.stopPropagation();
  e.preventDefault();

  if (incomeConfigureRef.value) {
    incomeConfigureRef.value?.openDialog(type, type, false);
  }

  // const serviceEditFlag = !serviceCheckFlag && cFeeNodeType.value.includes(PM_IFeeNodeType.运维服务费);
  // const deviceEditFlag = !deviceCheckFlag && cFeeNodeType.value.includes(PM_IFeeNodeType.设备维保服务费);
  // // 没有改动，直接打开编辑公式
  // if (
  //   (PM_IFeeNodeType.运维服务费 === type && !serviceEditFlag) ||
  //   (PM_IFeeNodeType.设备维保服务费 === type && !deviceEditFlag)
  // ) {
  //   if (incomeConfigureRef.value) {
  //     incomeConfigureRef.value?.openDialog(type, type, false);
  //   }
  // } else {
  //   // 是否框
  //   TeMessageBox.confirm('请先保存项目信息再继续编辑内容', '保存内容', {
  //     confirmButtonText: '确认',
  //     cancelButtonText: '取消',
  //     type: 'warning',
  //   })
  //     .then(() => {
  //       // 先存下缓存，然后触发信息保存，
  //       FSetStorageData('toc-accountant-expense', JSON.stringify({ type }));
  //       emits('triggerSave');
  //     })
  //     .catch(() => {
  //       // 删除缓存
  //       FBatchRemoveStorageData(['toc-accountant-expense']);
  //     });
  // }
};

// 弹出层开关
const visible = ref<boolean>(false);
// 宽度
const width = ref<number>(402);
// 选中的能源类型
const selectedCodes = ref<string[]>([]);
// 展示的能源类型列表
const allEnergyCodeList = ref<EnergyCode[]>([]);
/**
 * 打开弹出层
 */
const handlePopoverShow = () => {
  allEnergyCodeList.value = props.energyCodeList?.filter((item) => props.selectedEnergyList.includes(item.code));
  initSelectedCode();

  nextTick(() => {
    width.value = 136 + 12 + 12 * 2; // 文本宽度+文本右内边距+弹框边距
    document.querySelectorAll('.pac-popover-form-checkbox')?.forEach((item) => {
      const w = item.scrollWidth;
      width.value += w + 30;
    });
    width.value = width.value - 30; // 最后一个没有右边距
  });
};
/**
 * 阻止点击事件
 * @param event
 */
const handleReferenceStop = (event: Event) => {
  event.stopPropagation();
  event.preventDefault();
};
/**
 * 取消
 */
const handleCancel = () => {
  visible.value = false;
};
/**
 * 提交保存
 */
const handleSubmit = async () => {
  if (!selectedCodes.value.length) {
    TeMessage.error('请选择能源类型');
    return;
  }
  if (await handleEnergySave()) {
    updateFeeNodeValue();
    visible.value = false;
  }
};
/**
 * 能源类型保存
 * @returns {Promise<boolean>}
 */
const handleEnergySave = (): Promise<boolean> => {
  return new Promise(async (resolve) => {
    try {
      const params = {
        tenantId: getTenant().tenantId,
        feeType: PM_IFeeNodeType.院方部分缴费,
        energyCodes: selectedCodes.value?.length ? selectedCodes.value?.join(',') : '',
      };
      const res = await postRequest(PM_EPath.保存院方部分缴费能源类型, params);
      if (res?.success) {
        resolve(true);
      } else {
        resolve(false);
      }
    } catch (error) {
      resolve(false);
    }
  });
};
/**
 * 初始化选中能源类型
 */
const initSelectedCode = () => {
  props.feeNodeType.forEach((item) => {
    if (+item.feeType === PM_IFeeNodeType.院方部分缴费) {
      selectedCodes.value = item.energyCodes?.split(',')?.filter((item) => item !== '');
    }
  });
};
// 监听能源类型勾选修改
watch(
  () => props.selectedEnergyList,
  (newVal) => {
    props.feeNodeType.forEach((item) => {
      if (+item.feeType === PM_IFeeNodeType.院方部分缴费) {
        let codes = item.energyCodes?.split(',')?.filter((item) => item !== '');
        codes = codes.filter((item: string) => newVal.includes(item));
        item.energyCodes = codes.join(',');
        selectedCodes.value = item.energyCodes?.split(',') ?? [];
      }
    });
    // 更新父组件数据
    updateFeeNodeValue();
  },
);
/**
 * 初始化
 */
onMounted(() => {
  cFeeNodeType.value =
    props.feeNodeType?.map((item) => {
      return +item.feeType;
    }) ?? [];
  serviceCheckFlag = cFeeNodeType.value.includes(PM_IFeeNodeType.运维服务费);
  deviceCheckFlag = cFeeNodeType.value.includes(PM_IFeeNodeType.设备维保服务费);
  initSelectedCode();

  // 获取本地是否有缓存打开公式编辑器数据的参数
  if (!!FGetStorageData('toc-accountant-expense')) {
    const params = JSON.parse(FGetStorageData('toc-accountant-expense') ?? '{}');
    FBatchRemoveStorageData(['toc-accountant-expense']);
    if (incomeConfigureRef.value) {
      incomeConfigureRef.value?.openDialog(+params?.type, +params?.type, false);
    }
  }
});
</script>
<style lang="less" scoped>
.pae-accountant-expense {
  > :deep(.te-checkbox-group) {
    display: flex;
    flex-wrap: wrap;
    row-gap: var(--te-space-8);

    > .te-checkbox {
      width: 50%;
      margin-right: 0;
    }

    .te-checkbox__label {
      display: flex;
      align-items: center;
      gap: var(--te-space-8);
    }
  }

  :deep(.pac-popover-form) .pac-popover-form-button {
    display: flex;
    justify-content: flex-end;
  }
}
</style>
