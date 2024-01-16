import { defineComponent, onMounted, ref, nextTick } from 'vue';
import { ElTree } from 'element-plus';
import { TreeKey } from 'element-plus/es/components/tree/src/tree.type';
import type { TableColumnCtx } from 'element-plus/es/components/table/src/table-column/defaults';
import useCurrentInstance from '@/utils/use-current-instance';
import energyMedicalReportConfig from '@/pages/energy-medical-report-config/service/energy-medical-report-config.service';
import { useStore } from 'vuex';
import CommonService from '@/services/common/common';
import { cloneDeep } from 'lodash';
import { Checked } from '@element-plus/icons-vue/dist/types';
interface systemType {
  general: string;
  systemTypeText: string;
  systemName: string;
  heatingModeText: string;
  regionType: string;
  systemLevel: string;
  systemType: string;
  heatingMode: string;
  id: number;
  coolingMode: string;
  systemLevelText: string;
  regionTypeText: string;
  coolingModeText: string;
}

interface configItemValueType {
  newValue: number;
  paramId: number;
}
interface editableTextType {
  newEditableText: string;
  id: number;
}
interface tableDataType {
  unit: string | undefined; //单位
  configItemValue: number | undefined; //配置项数值
  configObjects: null; //
  configItemSuffix: string | null; //电压合格率百分号
  objectsFlag: string | undefined; //操作 0不配置，1可配置
  editableText: string | undefined; //可编辑文案
  textExample: string | undefined; //文案示例
  id: number; //编辑文案
  paramName: string | undefined; //参数
  paramId: number; //编辑配置项数值
  configItem: string | undefined; //配置项
  judgmentBasis: string | undefined; //判断依据
}
interface SpanMethodProps {
  row: tableDataType;
  column: TableColumnCtx<tableDataType>;
  rowIndex: number;
  columnIndex: number;
}

interface paramsType {
  lastModified: number;
  lastModifiedDate: any;
  name: string;
  size: number;
  type: string;
  webkitRelativePath: string;
}
interface formType {
  formValue: number | undefined;
}

export default defineComponent({
  name: 'energyMedicalReportConfig',
  setup() {
    const store = useStore();
    const { proxy } = useCurrentInstance();
    let abnormal = ref<boolean>(true);
    let loading = ref<boolean>(true);
    let formValue = ref<string>(''); // 配置项input框的值
    let editFormValue = ref<string>(); // 编辑文案input框的值
    const tableData = ref<tableDataType[]>([]); // 表格绑定数据
    const configObjectsDialog = ref(false); //配置对象弹框
    const configTreeDialog = ref(false); //配置对象弹框
    const defaultProps = {
      children: 'childTree',
      label: 'treeName',
    };
    const energyTreeData = ref<any[]>([]);
    let tagData = ref<any>([]); // 获取得到的是选中的节点数据，渲染到tag中
    // 点击配置对象该行的数据
    let currentRowData: any = {};
    const treeRef = ref<InstanceType<typeof ElTree>>();

    const inputPower = () => {
      if (Number(formValue.value) < 0) {
        formValue.value = '';
      } else if (Number(formValue.value) > 1 && formValue.value?.indexOf('1') === 0) {
        formValue.value = '1';
      } else if (Number(formValue.value) > 1) {
        formValue.value = '';
      }
    };

    // 电压合格率配置项失去焦点事件
    const inputPressure = () => {
      if (Number(formValue.value) < 0) {
        formValue.value = '';
      } else if (Number(formValue.value) > 100) {
        formValue.value = formValue.value.substring(0, 2);
      } else if (formValue.value.substring(0, 3) === '100') {
        formValue.value = '100';
      }
    };

    // 合并单元格
    const objectSpanMethod = ({ row, column, rowIndex, columnIndex }: SpanMethodProps) => {
      if (
        columnIndex === 0 ||
        columnIndex === 1 ||
        columnIndex === 2 ||
        columnIndex === 3 ||
        columnIndex === 4 ||
        columnIndex === 8
      ) {
        if (rowIndex % 2 === 0) {
          return {
            rowspan: 2,
            colspan: 1,
          };
        } else {
          return {
            rowspan: 0,
            colspan: 0,
          };
        }
      }
    };
    // 获取能耗配置列表
    const getList = async () => {
      try {
        loading.value = true;
        const res = await energyMedicalReportConfig.getListUrl();
        console.log(res, '获取列表');
        if (res.code == 200 && res.success) {
          loading.value = false;
          tableData.value = res.data || [];
          // 给单元格数据追加isInputShow属性，控制input显示隐藏
          tableData.value.forEach((item) => {
            item['isInputShow'] = true; // 控制配置项数值input框显示与隐藏
            item['isEditInputShow'] = true; // 控制文案编辑input框显示与隐藏
          });
          // console.log('tableData:',tableData.value);
        } else {
          abnormal.value = false;
          loading.value = false;
        }
      } catch (error) {
        loading.value = false;
        abnormal.value = false;
        console.warn('error------------', error);
      }
    };
    nextTick(() => {});

    // 点击配置配置对象-
    const configObjects = (row: any) => {
      tagData.value = [];
      console.log('row', row);
      currentRowData = row;
      // 显示弹框
      configObjectsDialog.value = true;
      // 递归--数组对象configObj
      // getAllDataArray(energyTreeData.value,allDataArray)
      // 通过row.configObjects去判断得到选中的节点
      for (let i = 0; i < allDataArray.length; i++) {
        if (row.configObjects && row.configObjects.indexOf(allDataArray[i].id) > -1) {
          tagData.value.push(allDataArray[i]);
        }
      }
      console.log('tagData', tagData);
    };

    // 关闭配置对象弹框
    const onBeforeClose = () => {
      configObjectsDialog.value = false;
      // 重置数据
      tagData.value = [];
    };
    // 关闭树形结构弹框
    const onClose = () => {
      configTreeDialog.value = false;
      // 重置数据
    };
    // 点击选择-显示树形结构
    const showConfigTreeDialog = () => {
      // 显示弹框
      configTreeDialog.value = true;
      console.log('tagData.value', tagData.value);
      allChecked = [];
      for (let i = 0; i < tagData.value.length; i++) {
        allChecked.push(tagData.value[i].id);
      }

      nextTick(() => {
        treeRef.value!.setCheckedKeys(allChecked, false);
      });
    };

    let editFlag = 1; //判断是否有单元格在编辑状态
    let timer: any; // 定时器

    // 配置项编辑图标点击事件
    const onConfigItemImg = (row: any) => {
      // console.log('row',row);
      clearTimeout(timer);
      currentRowData = row;
      // editFlag 判断单元格是否在编辑状态0为编辑，1失去焦点时不编辑
      if (editFlag == 0) {
        return proxy.$message.error('请将先前的单元格编辑完成');
      }
      editFlag = 0;
      // 显示input
      row.isInputShow = false;
      // 把值赋值给input框
      formValue.value = Number(row.configItemValue).toFixed(2);
      // 自动获取焦点
      if (row.paramId !== 1) {
        let input_dom2 = <HTMLImageElement>document.querySelector(`.input_3_${row.id}:nth-child(2) .el-input__inner`);
        timer = setTimeout(() => {
          input_dom2.focus();
        }, 200);
      } else {
        let input_dom = <HTMLImageElement>document.querySelector(`.input_${row.id} .el-input__inner`);
        timer = setTimeout(() => {
          input_dom.focus();
        }, 200);
      }
      // console.log('config:',row);
      // console.log('tableData:',tableData);
    };

    // input框失去焦点事件-把数据传给后端配置项paramId，编辑文案id
    const onInputBlur = (val: any) => {
      clearTimeout(timer);
      if (val.paramId === 1 && formValue.value === '') {
        // 获取焦点
        let input_dom = <HTMLImageElement>document.querySelector(`.input_${val.id} .el-input__inner`);
        timer = setTimeout(() => {
          input_dom.focus();
        }, 0);
        proxy.$message.error('功率因数不能为空，请输入大于等于0，小于等于1的数值');
        return;
      }
      if (val.paramId === 2 && formValue.value === '') {
        let input_dom2 = <HTMLImageElement>document.querySelector(`.input_3_${val.id}:nth-child(2) .el-input__inner`);
        timer = setTimeout(() => {
          input_dom2.focus();
        }, 0);
        proxy.$message.error('电压合格率不能为空，请输入大于等于0，小于等于100的数值');
        return;
      }
      editFlag = 1;
      if (Number(formValue.value) !== val.configItemValue) {
        // 把数据发送给后端-
        let obj: any = {
          newValue: formValue.value,
          paramId: val.paramId,
        };
        updateConfig(obj);
      }
      val.isInputShow = true;
    };

    // 编辑文案编辑图标点击事件
    const onEditableTextImg = (row: any) => {
      console.log('文案', row);
      clearTimeout(timer);
      // editFlag 判断单元格是否在编辑状态0为编辑，1失去焦点时不编辑
      if (editFlag == 0) {
        return proxy.$message.error('请将先前的单元格编辑完成');
      }
      editFlag = 0;
      // 显示input
      row.isEditInputShow = false;
      // 把值赋值给input框
      editFormValue.value = row.editableText;
      // 自动获取焦点
      let input_edit = <HTMLImageElement>document.querySelector(`.el-input.input_2_${row.id} .el-input__inner`);
      timer = setTimeout(() => {
        input_edit.focus();
      }, 500);
    };

    // input框失去焦点事件-把数据传给后端配置项paramId，编辑文案id
    const onEditInputBurl = (val: any) => {
      clearTimeout(timer);
      if (editFormValue.value === '') {
        editFlag = 0;
        // 获取焦点
        let input_edit = <HTMLImageElement>document.querySelector(`.el-input.input_2_${val.id} .el-input__inner`);
        console.log(input_edit);
        timer = setTimeout(() => {
          input_edit.focus();
        }, 200);
        proxy.$message.error('可编辑文案不能为空');
        return;
      }
      editFlag = 1;
      if (editFormValue.value !== val.editableText) {
        // 把数据发送给后端-
        let obj: any = {
          newEditableText: editFormValue.value,
          id: val.id,
        };
        updateEdit(obj);
      }
      val.isEditInputShow = true;
    };

    // 配置项数值保存
    const updateConfig = async (form: configItemValueType) => {
      // console.log('form:',form);
      console.log('updatetable:', tableData);
      try {
        loading.value = true;
        const res = await energyMedicalReportConfig.updateConfigItemValueUrl(form);
        // console.log('updateConfig',res);
        if (res.code == 200 && res.success) {
          loading.value = false;
          proxy.$message.success(res.message);
          getList();
        } else {
          loading.value = false;
          if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
            proxy.$message.error(res.message || '保存失败');
          }
        }
      } catch (error) {
        console.log('updateConfig', error);

        loading.value = false;
        proxy.$message.error('保存失败');
      }
    };

    // 可编辑文案保存
    const updateEdit = async (form: editableTextType) => {
      // console.log('editform:',form);
      try {
        loading.value = true;
        const res = await energyMedicalReportConfig.updateEditableTextUrl(form);
        // console.log('updateEdit',res);

        if (res.code == 200 && res.success) {
          loading.value = false;
          proxy.$message.success(res.message);
          getList();
        } else {
          loading.value = false;
          if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
            proxy.$message.error(res.message || '保存失败');
          }
        }
      } catch (error) {
        loading.value = false;
        proxy.$message.error('保存失败');
      }
    };

    let energyTreeData_copy = ref<any>([]); //能耗体检报告配置选中的节点数组

    // 递归函数
    let allDataArray: any = []; //用来存放所有的数据
    // let dataArray:any = [];//从接口获取的数据
    const getAllDataArray = (dataArray: any, allDataArray: any) => {
      if (dataArray && dataArray.length > 0) {
        dataArray.forEach((data: any) => {
          allDataArray.push({
            id: data.id,
            treeName: data.treeName, //把你要的属性全弄进去
            parentIds: data.parentIds,
            parentId: data.parentId,
          });
          //递归调用
          getAllDataArray(data.childTree, allDataArray);
        });
      }
    };

    // 获取树形节点
    const getTreeData = async () => {
      try {
        let params = {
          treeType: 3,
        };
        const res = await CommonService.getEmsTreeInfo(params);
        console.log('energyTreeData', res);
        if (res.code == 200 && res.success) {
          // 树节点数据
          energyTreeData.value = res.data;
          // 递归得到一个数组对象
          getAllDataArray(res.data, allDataArray);
        } else {
          energyTreeData.value = [];
        }
      } catch (error) {
        energyTreeData.value = [];
      }
    };

    // tag删除
    const handleClose = (item: any) => {
      tagData.value.splice(tagData.value.indexOf(item), 1);
      console.log('tagData.value-----', tagData.value);
    };

    // 确定 --得到选中的节点
    const onSure = () => {
      // 选中节点的id-->allChecked
      console.log('onsure', allChecked);

      // 遍历id
      let checkedEnergy: any = [];
      allChecked.forEach((item) => {
        for (let i = 0; i < allDataArray.length; i++) {
          if (item === allDataArray[i].id) {
            checkedEnergy.push(allDataArray[i]);
          }
        }
      });
      // 把得到的数据赋值给tagData
      tagData.value = cloneDeep(checkedEnergy);
      configTreeDialog.value = false;
    };

    // 保存
    const onSave = async () => {
      console.log(tagData.value);

      // 关闭弹框
      configObjectsDialog.value = false;
      try {
        loading.value = true;
        let selectTreeId = [];
        for (let i = 0; i < tagData.value.length; i++) {
          selectTreeId.push(tagData.value[i].id);
        }
        // console.log('allChecked-----------',allChecked);//[]
        let newConfigObjectsString: string = selectTreeId.join(',');
        // 参数
        let obj = {
          newConfigObjects: newConfigObjectsString,
          paramId: currentRowData.paramId,
        };
        const res = await energyMedicalReportConfig.updateConfigUrl(obj);
        console.log('res', res);
        if (res.code == 200 && res.success) {
          loading.value = false;
          getList();
          return proxy.$message.success(res.message);
        } else {
          loading.value = false;
          if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
            return proxy.$message.error(res.message);
          }
        }
      } catch (error) {
        loading.value = false;
        console.log('error', error);
      }
    };
    let allChecked: TreeKey[] = []; //选中的节点id
    //节点选中状态发生变化时的回调
    const handleCheckChange = (data: any, checked: boolean, indeterminate: any) => {
      //获取所有选中的子节点id不包含半选状态的节点 start
      allChecked = treeRef.value!.getCheckedKeys(false);
      // console.log('allChecked',allChecked);
    };

    // 节点变化时获取所有选中状态的节点
    const getNodeId = (node: any, checkedNodes: any) => {
      allChecked = cloneDeep(checkedNodes.checkedKeys);
      if (checkedNodes.checkedKeys.length <= 20) {
        console.log(checkedNodes.checkedKeys);
        treeRef.value!.setCheckedKeys(allChecked, false);
      } else {
        if (allChecked.length > 20) {
          let newArr = allChecked.slice(0, 20);
          treeRef.value!.setCheckedKeys(newArr, false);
          proxy.$message.error('节点最多选择20个');
          return;
        }
        return;
      }
    };

    onMounted(async () => {
      await getList();
      await getTreeData();
    });

    return {
      abnormal,
      tableData,
      loading,
      getList,
      onInputBlur,
      objectSpanMethod,
      configObjects,
      configObjectsDialog,
      onBeforeClose,
      configTreeDialog,
      showConfigTreeDialog,
      formValue,
      onConfigItemImg,
      onEditableTextImg,
      onEditInputBurl,
      editFormValue,
      defaultProps,
      energyTreeData,
      energyTreeData_copy,
      handleClose,
      onSure,
      treeRef,
      tagData,
      onSave,
      handleCheckChange,
      getNodeId,
      onClose,
      inputPower,
      inputPressure,
    };
  },
});
