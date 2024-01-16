import { defineComponent, onMounted, reactive, ref, computed } from 'vue';
import { ElForm, ElDialog } from 'element-plus';
import { useRoute } from 'vue-router';

// config
import { pageSizesArray } from '@/config/index';
// utils
import { useCommonController } from '@/utils/use-common-controller';
import message from '@/utils/message';
import { getTenant } from '@/utils/index';

import AddAndEditDialog from './compotents/hnm-add-update-dialog.vue';
import HouseholdNumberManagementService from './services/household-number-management.service';
import CommonService from '../../service/pkg/index';

interface formInlineType {
  energyType: string | undefined;
  search: string;
}
interface energyType {
  code: string;
  name: string;
  unit?: string;
}
interface type {
  code: string;
  name: string;
}
interface paramsType {
  lastModified: number;
  lastModifiedDate: any;
  name: string;
  size: number;
  type: string;
  webkitRelativePath: string;
}
export default defineComponent({
  name: 'householdNumberManagement',
  components: { AddAndEditDialog },
  setup() {
    const { proxy } = useCommonController();
    const route = useRoute();
    const clearFile = ref(); //获取导入input框ref
    const pageNum = ref<number>(1);
    const pageSize = ref<number>(pageSizesArray[0]);
    const total = ref<number>(0);
    let fileName: any; //文件名称
    const energyList = ref<energyType[]>([]); // 体系
    const tableData = ref<HouseholdNumberManagement.householdNumberListVO[]>([]);
    const loading = ref<boolean>(true);
    const householdNumberTableRef = ref(ElForm);
    const rows = ref<HouseholdNumberManagement.householdNumberListVO | null>();
    const addDialogRef = ref(ElDialog);
    const hostingAreaList = ref<HouseholdNumberManagement.type[]>([]); // 所属托管范围
    const downLoadLoading = ref(false); // 下载loading
    const formInline = reactive<formInlineType>({
      energyType: '' || undefined,
      search: '',
    });
    const importErrorVisible = ref<boolean>(false); // 导入错误弹框显示隐藏
    const uploadLoading = ref(false); // 上传loading
    const errorDataList = ref<HouseholdNumberManagement.errorDataListType[]>([]);
    const num = ref<number>(0);
    const tenant = getTenant();
    const objCommon = computed(() => {
      return {
        energyCode: formInline.energyType,
        ...getTenant(),
      };
    });
    const onPageSizeChange = (value: number) => {
      pageSize.value = value;
      pageNum.value = 1;
      queryHostingAreaList();
      getList();
    };
    const onCurrentChange = (value: number) => {
      pageNum.value = value;
      queryHostingAreaList();
      getList();
    };
    // 搜索
    const onSearch = () => {
      pageNum.value = 1;
      pageSize.value = pageSizesArray[0];
      queryHostingAreaList();
      getList();
    };
    // 重置
    const onReset = () => {
      formInline.search = '';
      formInline.energyType = '';
      onSearch();
    };
    // 能源类型清空事件
    const energyTypeClear = () => {
      formInline.energyType = '';
    };
    // 获取能源类型
    const queryEnergyList = async () => {
      try {
        const url = '/baseHead/queryEnergyType';
        const res = await CommonService.queryBaseHead(objCommon.value, url);
        if (res.code == 200 && res.success) {
          energyList.value = res.data || [];
        } else {
        }
      } catch (error) {}
    };
    // 获取列表
    const getList = async () => {
      try {
        loading.value = true;
        const obj = {
          accountNumber: formInline.search,
          energyCode: formInline.energyType,
          orders: [
            {
              asc: true,
              column: '',
            },
          ],
          pageNum: pageNum.value,
          pageSize: pageSize.value,
          searchCount: true,
          ...getTenant(),
        };
        const res = await HouseholdNumberManagementService.queryHouseholdNumberList(obj);
        if (res && res.code == 200 && res.success) {
          loading.value = false;
          tableData.value = res.data.list || [];
          total.value = res.data.total;
        } else {
          loading.value = false;
          // return proxy.$message.error(res.message);
        }
      } catch (error) {
        loading.value = false;
        // console.log('error------------', error);
      }
    };
    // 新增按钮事件
    const addHouseholdNumber = () => {
      rows.value = null;
      num.value++;
      queryEnergyList();
      addDialogRef.value.queryHostingAreaList(energyList.value[0].code);
      addDialogRef.value.queryAssociatedNodeList(energyList.value.length > 0 ? energyList.value[0].code : '', '1');
    };
    // 导入按钮事件 自动触发点击input框
    const uploadTemplate = () => {
      clearFile.value.dispatchEvent(new MouseEvent('click'));
    };
    // 打开文件资源 选择文件
    const getFile = async (event: any) => {
      fileName = event.target.files[0];
      if (fileName != undefined) {
        const file_typename = fileName.name.substring(fileName.name.lastIndexOf('.'));
        if (file_typename === '.xlsx' || file_typename === '.xls' || file_typename === '.xlsm') {
          importData(fileName);
        } else {
          alert('请选择正确的文件类型！');
        }
      }
    };
    const importData = async (params: paramsType) => {
      if (uploadLoading.value) {
        return;
      }
      uploadLoading.value = true;
      const messageInstance = message.loading('正在导入');
      const form: any = new FormData(); // FormData 对象
      form.append('file', params); // 文件对象
      form.append('tenantCode', tenant.tenantCode); // 文件对象
      form.append('tenantId', tenant.tenantId + ''); // 文件对象
      const res = await HouseholdNumberManagementService.upload(form);
      if (res && res.data === null && res.success && res.code === 200) {
        importErrorVisible.value = false;
        uploadLoading.value = false;
        onSearch();
        proxy.$message.success(res.message);
      } else if (res && res.data === null && !res.success && res.code === 500) {
        importErrorVisible.value = false;
        uploadLoading.value = false;
        proxy.$message.error(res.message);
      } else if (res && res.data.length > 0 && res.success && res.code === 200) {
        errorDataList.value = res.data || [];
        importErrorVisible.value = true;
        uploadLoading.value = false;
        // proxy.$message.error(res.message);
      } else {
        importErrorVisible.value = false;
        uploadLoading.value = false;
        proxy.$message.error(res.message);
      }
      messageInstance.close();
      clearFile.value.value = null;
    };
    // 编辑按钮事件
    const editHouseholdNumber = (item: HouseholdNumberManagement.householdNumberListVO) => {
      rows.value = item;
      num.value++;
      queryEnergyList();
      addDialogRef.value.queryHostingAreaList(item.energyCode);
      addDialogRef.value.queryAssociatedNodeList(item.energyCode, '1');
    };
    const queryAssociatedNodeListOK = () => {
      addDialogRef.value.show();
    };
    // 删除按钮事件
    const deleteHouseholdNumber = async (val: number) => {
      try {
        // const obj = {
        //   id: val,
        // };
        const res = await HouseholdNumberManagementService.deleteHouseholdNumber(val);
        if (res && res.code === 200) {
          proxy.$message.success(res.message || '删除成功！');
          queryHostingAreaList();
          getList();
        } else {
          proxy.$message.error(res.message || '删除失败！');
        }
      } catch (error) {
        proxy.$message.error('删除失败！');
      }
    };

    // 下载
    const download = async () => {
      await downloadAsync(objCommon.value, '/tenantAccount/template/download');
    };
    // 下载方法
    const downloadAsync = async (params: any, url: string) => {
      if (downLoadLoading.value) {
        return;
      }
      downLoadLoading.value = true;
      await CommonService.getFileStreamDownload(
        params,
        url,
        '下载',
        () => {
          downLoadLoading.value = false;
        },
        () => {
          downLoadLoading.value = false;
        },
      );
    };

    // 导入模板错误弹框关闭事件
    const errorDialogClose = () => {
      importErrorVisible.value = false;
    };

    // 获取所属托管区域
    const queryHostingAreaList = async () => {
      try {
        const url = '/tenantAccount/hostingAreaListByEnergyCode';
        // const url = '/baseHead/queryHostingScopeExcludeWholeArea';
        const res = await CommonService.queryBaseHead(objCommon.value, url);
        if (res.code == 200 && res.success) {
          hostingAreaList.value = res.data || [];
        } else {
        }
      } catch (error) {}
    };

    onMounted(async () => {
      await queryEnergyList();
      await queryHostingAreaList();
      await getList();
    });
    return {
      clearFile,
      formInline,
      energyList,
      householdNumberTableRef,
      pageNum,
      pageSize,
      total,
      tableData,
      loading,
      pageSizesArray,
      rows,
      addDialogRef,
      downLoadLoading,
      importErrorVisible,
      errorDataList,
      hostingAreaList,
      uploadLoading,
      num,
      onSearch,
      onReset,
      addHouseholdNumber,
      uploadTemplate,
      onPageSizeChange,
      onCurrentChange,
      editHouseholdNumber,
      deleteHouseholdNumber,
      getList,
      getFile,
      energyTypeClear,
      download,
      errorDialogClose,
      queryAssociatedNodeListOK,
    };
  },
});
