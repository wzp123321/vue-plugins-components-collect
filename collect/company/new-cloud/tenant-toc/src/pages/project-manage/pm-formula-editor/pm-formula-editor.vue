<template>
  <!-- 抽屉 -->
  <te-drawer
    size="100%"
    :title="`编辑收益分享(${mapDialogTitle()})`"
    v-model="visible"
    direction="btt"
    :before-close="handleClose"
  >
    <template #default>
      <div class="pm-formula-editor" v-if="visible">
        <!-- 顶部工具栏 -->
        <pfe-tool-bar></pfe-tool-bar>
        <!-- 指标列表 -->
        <pfe-index-list @editSuccess="handleEditSuccess"></pfe-index-list>
        <!-- 内容区 -->
        <pfe-home></pfe-home>
      </div>
    </template>
    <template #footer>
      <div style="flex: auto">
        <te-button @click="handleClose">取消</te-button>
        <te-button type="primary" @click="handleSubmit">保存</te-button>
      </div>
    </template>
  </te-drawer>
</template>
<script lang="ts" setup>
// 公共库
import { ref, provide } from 'vue';
import { useStore } from 'vuex';
// 组件
import PfeIndexList from './components/pfe-index-list/pfe-index-list.vue';
import PfeHome from './components/pfe-home/pfe-home.vue';
import PfeToolBar from './components/pfe-tool-bar/pfe-tool-bar.vue';
import { TeMessageBox, TeMessage } from '@tiansu/element-plus';
// 服务
import draggableFormulaService from './pm-formula-editor.service';
// api
import { PFE_IGroupInfoList, PFE_IIndexInfoList, PFE_ISaveGroupConfigParams } from './pm-formula-editor.api';
// 枚举
import { PM_EGrainSharingObject, PM_EGrainSharingType } from '../constant/enum';
import { PFE_EPath, PFE_ESymbolType } from './enums/index';
// 工具方法
import { getTenant, makeRange } from '@/utils';
// 常量
import { PFE_SERVICE_BG_ACTIVE_COLOR, PFE_SERVICE_DATA_CLASS_NAME } from './constant';
// 服务请求
import { postRequest } from '@/service/request';
import { replaceSpecificSymbol } from './utils';
// store
const store = useStore();
// provide-传给孙子组件的方法
provide('handleSubmit', () => {
  return new Promise(async (resolve) => {
    if (!validateFormulaFilled() || draggableFormulaService.loading) {
      resolve(false);
      return;
    }
    const res = await handleSaveRequest();
    resolve(res);
  });
});
// 开关
const visible = ref<boolean>(false);
// 保存开关
const saveLoading = ref<boolean>(false);
/**
 * 抽屉顶部title
 * @returns {string}
 */
const mapDialogTitle = (): string => {
  const map = new Map([
    [PM_EGrainSharingObject['国网/资方'], '国网/资方'],
    [PM_EGrainSharingObject.院方, '院方'],
    [PM_EGrainSharingObject.天溯, '天溯'],
  ]);
  return map.get(store.getters.grainSharingMode) ?? '天溯';
};
/**
 * 指标编辑成功后更新所有公式中涉及到的名称
 * @param {string} serialNumber 指标唯一标识
 * @param {string} indexName 更新后的指标名称
 * @returns {void}
 */
const handleEditSuccess = (serialNumber: string, indexName: string): void => {
  draggableFormulaService.updateIndexNameAfterEdit(serialNumber, indexName);
};
/**
 * 打开公式配置抽屉
 * @param {PM_EGrainSharingObject} mode 收益分享模式
 * @param {PM_EGrainSharingType} type 收益分享类型
 * @returns {void}
 */
const handleOpen = (mode: PM_EGrainSharingObject, type: PM_EGrainSharingType): void => {
  console.log('%c✨✨打开公式编辑✨✨', 'font-size: 24px', mode, type);
  visible.value = true;
  store.dispatch('setGrainSharingMode', mode);
  // 查询
  draggableFormulaService.queryGroup();
};
/**
 * 关闭抽屉
 * @returns {void}
 */
const handleClose = (): void => {
  if (store.getters.unSaveFlag) {
    TeMessageBox.confirm('公式尚未保存，请确认是否退出？', '退出', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning',
    })
      .then(() => {
        visible.value = false;
        store.dispatch('setUnSaveFlag', false);
      })
      .catch(() => {
        console.warn('取消保存确认');
      });
  } else {
    visible.value = false;
    store.dispatch('setUnSaveFlag', false);
  }
};
/**
 * 提交保存
 * 先校验数据是否填写完成,如果完整则调用接口
 * @returns {Promise<boolean>}
 */
const handleSubmit = (): Promise<boolean> => {
  return new Promise(async (resolve) => {
    if (!validateFormulaFilled() || draggableFormulaService.loading) {
      resolve(false);
      return;
    }
    const res = await handleSaveRequest();
    if (res) {
      draggableFormulaService.queryGroup();
    }
    resolve(res);
  });
};
/**
 * 校验公式数据是否完整
 * @returns {boolean}
 */
const validateFormulaFilled = (): boolean => {
  if (draggableFormulaService?.groupList?.length !== 0) {
    if (mapGroupPeriodFill()) {
      TeMessage.error('适用托管期未选择完整，请修改后重试');
      return false;
    }
    if (mapGroupPeriodCross()) {
      TeMessage.error('适用托管周期不能重叠，请修改后重试');
      return false;
    }
    if (mapFormulaFill()) {
      TeMessage.error('判断条件及对应公式填写不完整，请修改后重试');
      return false;
    }
    if (mapNumberIndexFill()) {
      TeMessage.error('公式中有数字字段未填写，请修改后重试');
      return false;
    }
    // 维护数据公式不完整
    if (mapServiceDataFormulaFill()) {
      TeMessage.error('维护数据内容不完整，请修改后重试');
      // 滚动-动画
      const element = document.querySelector(`.${PFE_SERVICE_DATA_CLASS_NAME}`);
      if (element) {
        // 滚动到顶部
        element.scrollIntoView({
          block: 'start',
          behavior: 'auto',
        });
        // 背景高亮
        element.animate(
          [
            {
              backgroundColor: PFE_SERVICE_BG_ACTIVE_COLOR,
            },
          ],
          2000,
        );
      }
      return false;
    }
    return true;
  }
  return true;
};
/**
 * 调用保存接口
 * @returns {Promise<boolean>}
 */
const handleSaveRequest = (): Promise<boolean> => {
  return new Promise(async (resolve) => {
    if (saveLoading.value) {
      return resolve(false);
    }
    try {
      saveLoading.value = true;
      const params = mapSaveParams();
      console.log('%c✨✨保存公式信息✨✨', 'font-size: 24px', params);
      const res = await postRequest(PFE_EPath.编辑公式组信息与指标配置信息, params);
      if (res?.success) {
        resolve(true);
        TeMessage.success(res?.message ?? '操作成功');
        store.dispatch('setUnSaveFlag', false);
      } else {
        resolve(false);
        TeMessage.error(res?.message ?? '操作失败');
      }
    } catch (error) {
      resolve(false);
      TeMessage.error('操作失败');
    } finally {
      saveLoading.value = false;
    }
  });
};
/**
 * 拼接保存接口所需入参
 * @returns {PFE_ISaveGroupConfigParams}
 */
const mapSaveParams = (): PFE_ISaveGroupConfigParams => {
  const indexInfoList = mapSaveIndexList();
  const groupInfoList = mapSaveGroupInfoList();
  const formulaSerialNumber = draggableFormulaService?.formulaSerialNumber ?? '';
  const { tenantId } = getTenant();
  return {
    indexInfoList,
    groupInfoList,
    formulaSerialNumber,
    tenantId,
  };
};
/**
 * 拼接保存-维护数据指标列表
 * @returns {PFE_IIndexInfoList[]}
 */
const mapSaveIndexList = (): PFE_IIndexInfoList[] => {
  // 维护数据---指标列表
  return draggableFormulaService?.serviceDataIndexList?.map((serviceData) => {
    return {
      indexName: replaceSpecificSymbol(serviceData?.indexName),
      serialNumber: replaceSpecificSymbol(serviceData?.serialNumber),
      indexType: serviceData?.indexType,
      selectFlag: serviceData?.selectFlag ?? false,
      formulaComponentList:
        serviceData?.formulaComponentList?.map((formula) => ({
          id: formula?.id,
          indexType: formula?.indexType,
          indexName: replaceSpecificSymbol(formula?.indexName),
          serialNumber: replaceSpecificSymbol(formula?.serialNumber),
        })) ?? [],
    };
  });
};
/**
 * 拼接保存-公式列表
 * @returns {PFE_IGroupInfoList[]}
 */
const mapSaveGroupInfoList = (): PFE_IGroupInfoList[] => {
  return draggableFormulaService?.groupList?.map((group) => {
    return {
      groupId: group?.groupId ?? '',
      startPeriod: group?.startPeriod ?? null,
      endPeriod: group?.endPeriod ?? null,
      formulaList:
        group?.conditionList?.map((condition) => {
          return {
            indexName: replaceSpecificSymbol(condition?.indexName) ?? '',
            serialNumber: replaceSpecificSymbol(condition?.serialNumber) ?? '',
            logicalType: condition?.logicalType ?? '',
            formulaComponentList:
              condition?.computationalFormulas?.map((computational) => {
                return {
                  id: computational?.id ?? '',
                  indexType: computational?.indexType ?? '',
                  indexName: replaceSpecificSymbol(computational?.indexName) ?? '',
                  serialNumber: replaceSpecificSymbol(computational?.serialNumber) ?? '',
                };
              }) ?? [],
            conditionList:
              condition?.judgementConditions?.map((judgement) => {
                const conditionFormulaComponentList =
                  judgement?.conditionFormulaComponentList?.map((conditionFormula) => {
                    return {
                      id: conditionFormula?.id ?? '',
                      indexType: conditionFormula?.indexType ?? '',
                      indexName: replaceSpecificSymbol(conditionFormula?.indexName) ?? '',
                      serialNumber: replaceSpecificSymbol(conditionFormula?.serialNumber) ?? '',
                    };
                  }) ?? [];

                return {
                  conditionFormulaComponentList,
                };
              }) ?? [],
          };
        }) ?? [],
    };
  });
};
/**
 * 判断条件组托管期是否完整
 * @returns {boolean}
 */
const mapGroupPeriodFill = (): boolean => {
  return (
    draggableFormulaService?.groupList?.length !== 0 &&
    draggableFormulaService?.groupList?.some((item) => {
      return !item.startPeriod || !item.endPeriod;
    })
  );
};
/**
 * 判断条件组托管期是否有交叉
 * @returns {boolean}
 */
const mapGroupPeriodCross = (): boolean => {
  let list: number[] = [];
  draggableFormulaService?.groupList?.forEach((item) => {
    list = [...list, ...makeRange(Number(item.startPeriod), Number(item.endPeriod))];
  });
  return list?.length !== Array.from(new Set(list))?.length;
};
/**
 * 判断公式是否填写完整
 * @returns {boolean}
 */
const mapFormulaFill = (): boolean => {
  return (
    draggableFormulaService?.groupList?.length !== 0 &&
    draggableFormulaService?.groupList?.some((item) => {
      return item.conditionList?.some((cItem) => {
        return cItem.computationalFormulas?.length === 0 || cItem.judgementConditions?.length === 0;
      });
    })
  );
};
/**
 * 判断数字指标填写是否完整
 * @returns {boolean}
 */
const mapNumberIndexFill = (): boolean => {
  return (
    draggableFormulaService?.groupList?.length !== 0 &&
    draggableFormulaService?.groupList?.some((item) => {
      return (
        item?.conditionList?.some((cItem) => {
          // 公式列表&判断条件是否填写完整
          return (
            cItem?.computationalFormulas?.some((computational) => {
              return computational?.indexName === '' || computational?.indexName === null;
            }) ||
            cItem?.judgementConditions?.some((judgement) => {
              return judgement?.conditionFormulaComponentList?.some((conditionFormula) => {
                return conditionFormula?.indexName === '' || conditionFormula?.indexName === null;
              });
            })
          );
        }) ||
        draggableFormulaService?.serviceDataIndexList?.some((item) => {
          return item.indexName === '' || item.indexName === null;
        })
      );
    })
  );
};
/**
 * 判断维护数据公式是否完整
 * @returns {boolean}
 */
const mapServiceDataFormulaFill = (): boolean => {
  return (
    draggableFormulaService?.serviceDataIndexList?.length !== 0 &&
    draggableFormulaService?.serviceDataIndexList?.some((item) => {
      return item.indexType === PFE_ESymbolType.运算 && item.formulaComponentList?.length === 0;
    })
  );
};
// 对外暴露的方法
defineExpose({
  handleOpen,
  handleClose,
});
</script>
<style lang="less" scoped>
.pm-formula-editor {
  width: 100%;
  height: 100%;
  overflow: hidden;

  background-color: var(--te-bg-color-overlay);
  display: grid;
  grid-template-columns: 212px auto;
  grid-template-rows: var(--te-space-48) auto;
  border: 1px solid var(--te-border-color-lighter);
  border-radius: var(--te-space-4);

  .pfe-tool-bar {
    grid-column-start: 1;
    grid-column-end: 4;
  }

  .pfe-home {
    grid-column-start: 2;
    grid-column-end: 4;
  }
}
</style>
