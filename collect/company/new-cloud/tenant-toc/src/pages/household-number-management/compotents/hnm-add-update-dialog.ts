import { defineComponent, reactive, ref, computed, watch, nextTick } from 'vue';
import { ElForm } from 'element-plus';
import useCurrentInstance from '@/utils/use-current-instance';
import { getTenant } from '@/utils/index';

import HouseholdNumberManagementService from '../services/household-number-management.service';
import CommonService from '../../../service/pkg/index';
import { treeTypeList } from '../constant/index';
import ProjectManageService from '../../project-manage/services/project-manage.service';

interface formType {
  houseNumber: string;
  energyType: undefined | string;
  associatedNode: number[];
  hostingArea: undefined | string | null;
  radioValue: string;
  hostingAreaName: undefined | string | null;
}
interface energyType {
  code: string;
  name: string;
  unit?: string;
}
let time = 0;

export default defineComponent({
  name: 'HnmAddUpdateDialog',
  props: ['rows', 'energyList', 'num', 'ShowHostingAreaList'],
  directives: {
    /**
     * 过滤公式输入框
     */
    filterHouseholdNumber: {
      mounted(el) {
        const ele: any = el.tagName === 'INPUT' ? el : el.querySelector('input');
        const handleInput = (e: InputEvent) => {
          if (Math.abs(time - new Date().getTime()) < 1) {
            return;
          }
          time = new Date().getTime();
          // 是否在剪切板
          if (e.isComposing) {
            return;
          }
          const characters: string = '';
          const defaultStr = String.raw`\`\\;\'\"<>`;
          const reg = new RegExp(String.raw`[${defaultStr}${characters}]`, 'g');
          ele.value = ele.value.replace(reg, '');
          ele.value = ele.value.replace(/\s+/g, '');
          // 过滤中文
          ele.value = ele.value.replace(/[^\x00-\xff]/g, '');

          ele.dispatchEvent(new Event('input'));
        };
        ele.oninput = handleInput;
        ele.onblur = handleInput;
        // 解决输入中文的问题
        ele.addEventListener('compositionend', (e: InputEvent) => {
          // 过滤中文
          ele.value = ele.value.replace(/[^\x00-\xff]/g, '');
          handleInput(e);
        });
      },
    },
  },
  setup(props, context) {
    const { proxy } = useCurrentInstance();
    const ruleForm = ref(ElForm);
    const dialogFormVisible = ref<boolean>(false);
    // dialogFormVisible.value = props.dialogAdd;
    const cannotEdit = ref<boolean>(false);
    const rows = ref<HouseholdNumberManagement.householdNumberListVO | null | undefined>();
    const energyList = ref<HouseholdNumberManagement.type[]>([]); // 体系
    const hostingAreaList = ref<HouseholdNumberManagement.type[]>([]); // 所属托管范围

    const associatedNodeList = ref<HouseholdNumberManagement.treeListVO[]>([]); // 关联节点
    const expandedKeys = ref<number[]>([]); // 默认展开节点
    const radioData = treeTypeList;
    const formLabelWidth = '100px';
    const addLoading = ref<boolean>(false); // 新增拦截
    const editLoading = ref<boolean>(false); // 新增拦截
    const tenant = getTenant();
    const objCommon = computed(() => {
      return {
        ...getTenant(),
      };
    });

    const ShowHostingAreaList = computed(() => {
      return props.ShowHostingAreaList;
    });

    const form = reactive<formType>({
      houseNumber: '',
      energyType: '01000',
      associatedNode: [],
      hostingArea: undefined,
      hostingAreaName: undefined,
      radioValue: '1',
    });
    // 表单校验
    const rules = {
      houseNumber: [{ required: true, message: '请输入户号', trigger: 'change' }],
      energyType: [{ required: true, message: '请选择能源类型', trigger: 'change' }],
    };
    // 区域、业态切换事件
    const treeRaidoChange = () => {
      queryAssociatedNodeList(form.energyType, form.radioValue);
    };
    // 能源类型 下拉框选项改变事件
    const energyTypeChange = (val: string) => {
      form.energyType = val;
      queryAssociatedNodeList(val, form.radioValue);
      form.associatedNode = [];
      queryHostingAreaList(val);
    };
    // 获取所属托管区域
    const queryHostingAreaList = async (param: any) => {
      try {
        const res = await HouseholdNumberManagementService.queryHostingAreaList(
          Object.assign(objCommon.value, { energyCode: param }),
        );
        if (res.code == 200 && res.success) {
          hostingAreaList.value = res.data.map((item: any) => {
            return (
              {
                name: item.areaName,
                code: item.areaId,
              } ?? []
            );
          });
        } else {
        }
      } catch (error) {}
    };

    // 获取关联节点 树
    const queryAssociatedNodeList = async (energyCode: string | undefined, treeType: string) => {
      try {
        const obj = {
          energyCode: energyCode,
          expandLevel: 2,
          tenantCode: tenant.tenantCode,
          tenantId: tenant.tenantId,
          treeType: treeType,
        };
        const res = await ProjectManageService.queryTreeByEnergyCode(obj);
        if (res && res.code === 200 && res.data.data !== null && res.data.expandTreeIds !== null) {
          associatedNodeList.value = res.data.data;
          expandedKeys.value = res.data.expandTreeIds;
          context.emit('queryAssociatedNodeListOK');
        } else {
          associatedNodeList.value = [];
          expandedKeys.value = [];
          context.emit('queryAssociatedNodeListOK');
        }
      } catch (error) {
        context.emit('queryAssociatedNodeListOK');
      }
    };
    // 区域、业态切换事件回调
    const queryAssociatedNodeListCallback = (energyCode: string, treeType: string) => {
      queryAssociatedNodeList(energyCode, treeType);
    };

    const hostingAreaChange = (val: string) => {
      form.hostingArea = val;
    };
    // 表单提交
    const onSubmit = async () => {
      let flag;
      //   验证表单规则
      ruleForm.value.validate((valid: boolean) => {
        if (valid) {
          flag = true;
        } else {
          return false;
        }
      });
      //   表单验证通过
      if (flag) {
        // 判断编辑情况
        if (rows.value) {
          if (editLoading.value) {
            return;
          }
          editLoading.value = true;
          const updateObj = {
            accountNumber: form.houseNumber,
            energyCode: form.energyType,
            hostingAreaId: Number(form.hostingArea),
            id: rows.value.id,
            treeId: form.associatedNode[0],
            ...getTenant(),
          };
          try {
            const res = await HouseholdNumberManagementService.updateHouseholdNumberList(updateObj);
            if (res.code == 200 && res.success) {
              context.emit('addOK');
              dialogFormVisible.value = false;
              editLoading.value = false;
              return proxy.$message.success(res.message);
            } else {
              editLoading.value = false;
              return proxy.$message.error('编辑失败, ' + res.message);
            }
          } catch (error) {
            editLoading.value = false;
            return proxy.$message.error('编辑失败');
          }
        }
        // 新增情况
        try {
          if (addLoading.value) {
            return;
          }
          addLoading.value = true;
          const addObj = {
            accountNumber: form.houseNumber,
            energyCode: form.energyType,
            hostingAreaId: form.hostingArea !== undefined ? Number(form.hostingArea) : null,
            ...getTenant(),
            treeId: form.associatedNode[0],
          };
          const res = await HouseholdNumberManagementService.addHouseholdNumberList(addObj);
          if (res.code == 200 && res.success) {
            context.emit('addOK');
            dialogFormVisible.value = false;
            addLoading.value = false;
            return proxy.$message.success(res.message);
          } else {
            addLoading.value = false;
            return proxy.$message.error('新增失败, ' + res.message);
          }
        } catch (error) {
          addLoading.value = false;
          return proxy.$message.error('新增失败');
        }
      }
    };
    // 表单取消
    const Cancel = () => {
      dialogFormVisible.value = false;
      ruleForm.value.resetFields();
      form.associatedNode = [];
      form.hostingArea = undefined;
      form.houseNumber = '';
      form.energyType =
        energyList.value.length > 0 && (rows.value === null || rows.value === undefined)
          ? energyList.value[0].code
          : undefined;
    };
    // 显示
    const show = () => {
      try {
        dialogFormVisible.value = true;
        ruleForm.value.clearValidate();
      } catch (error) {
        // console.log(error);
      }
    };
    // 所属托管区域下拉框清空事件
    const hostingAreaClear = () => {
      form.hostingArea = undefined;
    };
    // watch(
    //   () => props.energyList,
    //   (newValue: HouseholdNumberManagement.type[]) => {
    //     energyList.value = newValue;
    //     if (energyList.value.length > 0 && (rows.value === undefined || rows.value === null)) {
    //       form.energyType = energyList.value[0].code;
    //       console.log(111);

    //     } else if (energyList.value.length > 0 && rows.value) {
    //       form.energyType = rows.value.energyCode;
    //     } else {
    //       form.energyType = undefined;
    //     }
    //   }
    // );
    watch(
      () => props.num,
      () => {
        rows.value = props.rows;
        energyList.value = props.energyList;
        if (rows.value) {
          form.houseNumber = rows.value.accountNumber;
          form.energyType = rows.value.energyCode;
          form.associatedNode = rows.value.treeId !== null ? [rows.value.treeId] : [];
          form.hostingArea = rows.value.hostingAreaId !== null ? String(rows.value.hostingAreaId) : undefined;
          form.hostingAreaName = rows.value.hostingAreaName !== null ? String(rows.value.hostingAreaName) : undefined;
        }
        if (rows.value === null || rows.value === undefined) {
          form.associatedNode = [];
          form.hostingArea = undefined;
          form.hostingAreaName = '';
          form.houseNumber = '';
          form.energyType =
            energyList.value.length > 0 && (rows.value === null || rows.value === undefined)
              ? energyList.value[0].code
              : undefined;
        }
      },
    );
    return {
      dialogFormVisible,
      cannotEdit,
      rules,
      rows,
      formLabelWidth,
      form,
      energyList,
      associatedNodeList,
      hostingAreaList,
      ruleForm,
      expandedKeys,
      radioData,
      ShowHostingAreaList,
      onSubmit,
      Cancel,
      show,
      treeRaidoChange,
      energyTypeChange,
      queryHostingAreaList,
      queryAssociatedNodeList,
      queryAssociatedNodeListCallback,
      hostingAreaClear,

      hostingAreaChange,
    };
  },
});
