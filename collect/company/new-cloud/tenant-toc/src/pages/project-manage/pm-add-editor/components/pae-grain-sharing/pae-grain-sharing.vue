<template>
  <div class="pae-grain-sharing">
    <!-- 模式 -->
    <te-select
      v-model="grainSharing.type"
      placeholder="请选择"
      @change="updateComponentModelValue"
      :disabled="props.disabledFlag"
    >
      <te-option v-for="way in modeTypeList" :value="way.code" :key="way.code" :label="way.name" />
    </te-select>
    <!-- 配置区 -->
    <section class="pgs-box">
      <!-- 天溯收益 -->
      <div class="pgs-box-wrapper" v-if="mapTiansuType()">
        <te-form-item label="天溯收益" class="pgs-box-wrapper-item">
          <div
            class="pgs-box-wrapper-btn"
            @click="handleFormulaConfigureOpen($event, PM_EGrainSharingObject.天溯)"
            :disabled="props.disabledFlag"
          >
            <span class="pgs-box-wrapper-item-btn">编辑</span>
            <icon-edit-pen class="pgs-box-wrapper-item-btn" />
          </div>
        </te-form-item>
        <te-form-item label="备注" class="pgs-box-wrapper-item-remark">
          <te-input
            :disabled="props.disabledFlag"
            v-model="grainSharing.remark"
            :rows="2"
            :maxlength="200"
            v-inputFilter:search
            type="textarea"
            placeholder="请输入备注内容"
            @blur="updateComponentModelValue"
          />
        </te-form-item>
      </div>
      <!-- 保证伙伴收益型 -->
      <div class="pgs-box-wrapper" v-else>
        <!-- 国网 -->
        <div class="pgs-box-wrapper-item">
          <te-checkbox
            v-model="grainSharing.stateFlag"
            :disabled="props.disabledFlag"
            label="国网/资方"
            name="type"
            @change="handleStateFlagChange"
          />
          <te-checkbox-group
            v-model="grainSharing.stateTypes"
            :disabled="!mapStateChecked() || props.disabledFlag"
            @change="updateComponentModelValue"
          >
            <te-checkbox v-for="item in stateTypeList" name="type" :label="item.code">
              <span>{{ item.name }}</span>
              <icon-edit-pen
                v-show="mapSelfChecked(grainSharing.stateTypes, item.code) && !props.disabledFlag"
                @click="handleFormulaConfigureOpen($event, PM_EGrainSharingObject['国网/资方'], item.code)"
              />
            </te-checkbox>
          </te-checkbox-group>
        </div>
        <!-- 院方 -->
        <div class="pgs-box-wrapper-item">
          <te-checkbox
            v-model="grainSharing.hospitalFlag"
            label="院方"
            name="type"
            :disabled="props.disabledFlag"
            @change="handleHospitalChange"
          />
          <!-- 没有勾选院方或者院方下的选项勾选了一个就处于禁用状态 -->
          <!-- <te-radio-group
            v-model="grainSharing.hospitalTypes"
            :disabled="!mapHospitalChecked()"
            @change="updateComponentModelValue"
          >
            <te-radio v-for="item in hospitalTypeList" name="type" :label="item.code">
              <span>{{ item.name }}</span>
              <icon-edit-pen
                v-show="mapHospitalSelfChecked(grainSharing.hospitalTypes, item.code)"
                @click="handleFormulaConfigureOpen($event, PM_EGrainSharingObject.院方, item.code)"
              />
            </te-radio>
          </te-radio-group> -->
          <te-checkbox-group
            v-model="grainSharing.hospitalTypes"
            :disabled="!mapHospitalChecked() || props.disabledFlag"
            @change="updateComponentModelValue"
          >
            <te-checkbox v-for="item in hospitalTypeList" name="type" :label="item.code">
              <span>{{ item.name }}</span>
              <icon-edit-pen
                v-show="mapHospitalSelfChecked(grainSharing.hospitalTypes, item.code) && !props.disabledFlag"
                @click="handleFormulaConfigureOpen($event, PM_EGrainSharingObject.院方, item.code)"
              />
            </te-checkbox>
          </te-checkbox-group>
        </div>
      </div>
    </section>
    <!-- 公式编辑器 -->
    <pm-formula-editor ref="formulaEditorRef"></pm-formula-editor>
    <!-- 数据配置 -->
    <pm-income-config ref="incomeConfigureRef"></pm-income-config>
  </div>
</template>
<script lang="ts" setup>
// 公共库
import { reactive, ref, PropType, onMounted } from 'vue';
// 枚举
import {
  PM_EGrainSharingObject,
  PM_EGrainSharingMode,
  PM_EGrainSharingType,
} from '@/pages/project-manage/constant/enum';
// api
import { CommonICodeName } from '@/service/api';
import { PGS_IGrainSharingVO } from './pae-grain-sharing.api';
import { PM_IContractShareModel } from '../../pm-add-editor.api';
// 组件
import { IconEditPen } from '@arco-iconbox/vue-te';
import pmFormulaEditor from '../../../pm-formula-editor/pm-formula-editor.vue';
import pmIncomeConfig from '../../../pm-income-config/pm-income-config.vue';
// 工具方法
import { FBatchRemoveStorageData, FGetStorageData } from '@/utils/storage';
// emits
const emits = defineEmits(['update:shareModel', 'triggerSave']);
// props
const props = defineProps({
  // 收益分享模式
  shareModel: {
    type: Array as PropType<PM_IContractShareModel[]>,
    default: [],
  },
  // 是否禁用
  disabledFlag: {
    type: Boolean,
    default: false,
  },
});
// 数据
const grainSharing = reactive<PGS_IGrainSharingVO>({
  type: PM_EGrainSharingMode.节能收益天溯分享型,
  remark: '',
  stateFlag: false,
  stateTypes: [],
  hospitalFlag: false,
  hospitalTypes: [],
});
// 模式类型
const modeTypeList: CommonICodeName<number>[] = Object.entries(PM_EGrainSharingMode)
  .filter(([k, v]) => typeof v === 'number')
  ?.map(([k, v]) => {
    return {
      code: +v,
      name: k,
    };
  });
// 国网/资方类型
const stateTypeList: CommonICodeName<number>[] = [
  {
    code: PM_EGrainSharingType.固定收益,
    name: '固定收益',
  },
  {
    code: PM_EGrainSharingType.收益分享,
    name: '收益分享',
  },
];
// 院方类型
const hospitalTypeList: CommonICodeName<number>[] = [
  {
    code: PM_EGrainSharingType.收益分享,
    name: '收益分享',
  },
  {
    code: PM_EGrainSharingType.其他收益,
    name: '其他收益',
  },
];
//  勾选了天溯
const mapTiansuType = () => {
  return grainSharing.type !== null && grainSharing.type === PM_EGrainSharingMode.节能收益天溯分享型;
};
// 是否是勾选了国网/资方
const mapStateChecked = () => {
  return grainSharing.stateFlag;
};
// 是否是勾选了院方
const mapHospitalChecked = () => {
  return grainSharing.hospitalFlag;
};
/**
 * 对应选项是否勾选
 * @param {number[]} list
 * @param {number} code
 * @returns {boolean}
 */
const mapSelfChecked = (list: number[], code: number): boolean => {
  return list.includes(code);
};
/**
 * 对应选项是否勾选
 * @param {number[]} list
 * @param {number} code
 * @returns {boolean}
 */
const mapHospitalSelfChecked = (list: number[], code: number): boolean => {
  return list.includes(code);
};

/**
 * 勾选国网
 * @param value
 */
const handleStateFlagChange = (value: boolean) => {
  if (!value) {
    grainSharing.stateTypes = [];
  }
  updateComponentModelValue();
};
/**
 * 勾选院方
 * @param value
 */
const handleHospitalChange = (value: boolean) => {
  if (!value) {
    grainSharing.hospitalTypes = [];
  }
  updateComponentModelValue();
};

// 公式编辑器组件
const formulaEditorRef = ref();
// 数据配置
const incomeConfigureRef = ref();
/**
 * 打开公式编辑
 * @param {Event} e 事件对象
 * @param {PM_EGrainSharingObject} mode 收益分析模式
 * @param {PM_EGrainSharingType} type 收益分享类型
 * @returns {void}
 */
const handleFormulaConfigureOpen = (e: Event, mode: PM_EGrainSharingObject, type?: PM_EGrainSharingType): void => {
  if (!props.disabledFlag) {
    e.stopPropagation();
    e.preventDefault();
    // 固定收益或者其他收益
    if (type !== undefined && [PM_EGrainSharingType.其他收益, PM_EGrainSharingType.固定收益].includes(type)) {
      if (incomeConfigureRef.value) {
        incomeConfigureRef.value?.openDialog(type, type, false);
      }
    } else {
      if (formulaEditorRef.value) {
        /**
         * 如果初始勾的是天溯,打开时还是天溯
         * 如果初始化勾了国网-收益分享,打开时还是勾了国网-收益分享
         * 如果初始化勾了院方-收益分享,打开时还是勾了院方-收益分享
         */
        // const tsEditFlag = !tsCheckFlag && grainSharing.type === PM_EGrainSharingMode.节能收益天溯分享型;
        // const stateEditFlag = !stateCheckFlag && grainSharing.stateTypes.includes(PM_EGrainSharingType.收益分享);
        // const stateFixEditFlag = !stateFixCheckFlag && grainSharing.stateTypes.includes(PM_EGrainSharingType.固定收益);
        // const hospitalEditFlag = !hospitalCheckFlag && grainSharing.hospitalTypes === PM_EGrainSharingType.收益分享;
        // const hospitalOtherEditFlag =
        //   !hospitalOtherCheckFlag && grainSharing.hospitalTypes === PM_EGrainSharingType.其他收益;
        // if (!tsEditFlag && !stateEditFlag && !hospitalEditFlag) {
        formulaEditorRef.value?.handleOpen(mode, type);
        // } else {
        //   // 确认框
        //   TeMessageBox.confirm('当前修改的项目信息将影响收益分享内容，请先保存再继续编辑收益分享', '保存内容', {
        //     confirmButtonText: '确认',
        //     cancelButtonText: '取消',
        //     type: 'warning',
        //   })
        //     .then(() => {
        //       // 先存下缓存，然后触发信息保存，
        //       FSetStorageData('toc-income-share', JSON.stringify({ mode, type }));
        //       emits('triggerSave');
        //     })
        //     .catch(() => {
        //       // 删除缓存
        //       FBatchRemoveStorageData(['toc-income-share']);
        //     });
        // }
      }
    }
  }
};
/**
 * 修改值
 * @returns {void}
 */
const updateComponentModelValue = (): void => {
  emits('update:shareModel', convertObjectToArray());
};
/**
 * 同步父组件数组，需要将对象转为数组
 * @returns {PM_IContractShareModel[]}
 */
const convertObjectToArray = (): PM_IContractShareModel[] => {
  let list: PM_IContractShareModel[] = [];
  const { type, stateFlag, hospitalTypes, hospitalFlag, stateTypes, remark } = grainSharing;
  if (type === PM_EGrainSharingMode.节能收益天溯分享型) {
    list.push({
      incomeShareModel: type,
      incomeShareObject: PM_EGrainSharingObject.天溯,
      incomeShareType: null,
      remark,
    });
  } else {
    // 国网/资方
    if (stateFlag) {
      // 如果只勾选了国网/资方
      if (!stateTypes?.length) {
        list.push({
          incomeShareModel: type,
          incomeShareObject: PM_EGrainSharingObject['国网/资方'],
          incomeShareType: null,
          remark: remark,
        });
        list.push({
          incomeShareModel: type,
          incomeShareObject: PM_EGrainSharingObject['国网/资方'],
          incomeShareType: null,
          remark: remark,
        });
      } else {
        stateTypes?.forEach((item) => {
          list.push({
            incomeShareModel: type,
            incomeShareObject: PM_EGrainSharingObject['国网/资方'],
            incomeShareType: item,
            remark: '',
          });
        });
      }
    }
    // 院方
    if (hospitalFlag) {
      // 如果只勾选了院方
      if (!hospitalTypes?.length) {
        list.push({
          incomeShareModel: type,
          incomeShareObject: PM_EGrainSharingObject.院方,
          incomeShareType: null,
          remark: '',
        });
        list.push({
          incomeShareModel: type,
          incomeShareObject: PM_EGrainSharingObject.院方,
          incomeShareType: null,
          remark: '',
        });
      } else {
        hospitalTypes?.forEach((item) => {
          list.push({
            incomeShareModel: type,
            incomeShareObject: PM_EGrainSharingObject.院方,
            incomeShareType: item,
            remark: '',
          });
        });
      }
    }
  }
  console.log('list----------------', list);
  return list;
};

/**
 * 将接口返回的数组转为对象
 * @returns {void}
 */
const convertArrayToObject = (): void => {
  const tsFlag = props.shareModel?.[0]?.incomeShareModel === PM_EGrainSharingMode.节能收益天溯分享型;
  const type = tsFlag ? PM_EGrainSharingMode.节能收益天溯分享型 : PM_EGrainSharingMode.保证伙伴收益型;
  grainSharing.type = type;

  grainSharing.remark = tsFlag ? props?.shareModel?.[0]?.remark : '';
  // 国网是否勾选
  grainSharing.stateFlag =
    props.shareModel?.findIndex(
      (item) =>
        item.incomeShareModel === PM_EGrainSharingMode.保证伙伴收益型 &&
        item.incomeShareObject === PM_EGrainSharingObject['国网/资方'],
    ) !== -1;
  // 国网-勾选项
  grainSharing.stateTypes = [];
  props.shareModel.forEach((item) => {
    if (
      item.incomeShareModel === PM_EGrainSharingMode.保证伙伴收益型 &&
      item.incomeShareObject === PM_EGrainSharingObject['国网/资方'] &&
      item.incomeShareType !== null
    ) {
      grainSharing.stateTypes.push(item.incomeShareType);
    }
  });

  grainSharing.hospitalFlag =
    props.shareModel?.findIndex(
      (item) =>
        item.incomeShareModel === PM_EGrainSharingMode.保证伙伴收益型 &&
        item.incomeShareObject === PM_EGrainSharingObject.院方,
    ) !== -1;

  grainSharing.hospitalTypes = [];
  props.shareModel.forEach((item) => {
    if (
      item.incomeShareModel === PM_EGrainSharingMode.保证伙伴收益型 &&
      item.incomeShareObject === PM_EGrainSharingObject.院方 &&
      item.incomeShareType !== null
    ) {
      grainSharing.hospitalTypes.push(item.incomeShareType);
    }
  });
};
/**
 * 初始化
 */
onMounted(() => {
  convertArrayToObject();

  // 获取本地是否有缓存打开公式编辑器数据的参数
  if (!!FGetStorageData('toc-income-share')) {
    const params = JSON.parse(FGetStorageData('toc-income-share') ?? '{}');
    FBatchRemoveStorageData(['toc-income-share']);
    if (
      params?.type !== undefined &&
      [PM_EGrainSharingType.其他收益, PM_EGrainSharingType.固定收益].includes(params?.type)
    ) {
      if (incomeConfigureRef.value) {
        incomeConfigureRef.value?.openDialog(params?.type, params?.type, false);
      }
    } else {
      formulaEditorRef.value?.handleOpen(params?.mode, params?.type);
    }
  }
});
</script>
<style lang="less" scoped>
.pae-grain-sharing {
  .te-select {
    width: 100%;
  }

  .pgs-box {
    width: 100%;
    margin-top: var(--te-space-8);
    border: 1px solid var(--te-border-color-lighter);
    border-radius: var(--te-space-4);
    background-color: var(--te-fill-color-lighter);
    padding: var(--te-space-12) var(--te-space-16);

    .pgs-box-wrapper-btn {
      display: flex;
      align-items: center;
    }

    .pgs-box-wrapper-item {
      display: flex;
      align-items: center;

      > .te-checkbox {
        width: 82px;
        min-width: 82px;
      }

      :deep(.te-checkbox) {
        margin-right: var(--te-space-20);

        .te-checkbox__label {
          display: flex;
          align-items: center;

          svg {
            margin-left: 10px;
          }
        }
      }
      :deep(.te-radio) {
        margin-right: var(--te-space-20);

        .te-radio__label {
          display: flex;
          align-items: center;

          svg {
            margin-left: 10px;
          }
        }
      }

      .pgs-box-wrapper-item-remark {
        margin-top: var(--te-space-12);
      }

      .pgs-box-wrapper-item-btn {
        cursor: pointer;
        color: var(--te-color-primary);
      }

      .pgs-box-wrapper-item-btn + .pgs-box-wrapper-item-btn {
        margin-left: var(--te-space-8);
      }

      :deep(.te-checkbox:last-child) {
        margin-right: 0;
      }
    }
  }
}
</style>
<style lang="less">
@media screen and (max-width: 1800px) {
  .pae-grain-sharing {
    .te-checkbox,
    .te-radio {
      margin-right: 14px !important;
    }
  }
}
@media screen and (max-width: 1750px) {
  .pae-grain-sharing {
    .te-checkbox,
    .te-radio {
      margin-right: var(--te-space-8) !important;
    }
  }
}
</style>
