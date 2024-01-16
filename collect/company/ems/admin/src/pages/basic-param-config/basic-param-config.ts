import { cloneDeep } from 'lodash';
import { defineComponent, onMounted, reactive, toRefs } from 'vue';
// components
import { ElMessageBox } from 'element-plus';
// config
import { pageSizes } from '@/config/index';
// utils
import useCurrentInstance from '@/utils/use-current-instance';
// index
import basicParamConfigService from '@/pages/basic-param-config/service/basic-param-config.service';
// components
import AddAndEditDialog from './bpc-add-edit-dialog/bpc-add-edit-dialog.vue';

interface BasicParamConfigState {
  // 采样类型列表
  energylList: any[];
  seasonList: any[];
  // 查询分页
  queryParams: BasicParamConfigModule.QueryParams;
  dataSource: BasicParamConfigModule.BasicParamConfigInfo[];
  basicParamConfigDetail: BasicParamConfigModule.BasicParamConfigInfo;
  basicParam: boolean;
  // 总条数
  total: number;
  loading: boolean;
  isAddFlag: boolean;
  dialogOpen: boolean;
  nums: number;
}

export default defineComponent({
  components: {
    AddAndEditDialog,
  },
  setup() {
    // 提示信息
    const { proxy } = useCurrentInstance();
    // 获取采样类型方法
    const basicParamConfigState = reactive<BasicParamConfigState>({
      // 采样名称列表
      energylList: [],
      // 季节列表
      seasonList: [],
      queryParams: {
        // 能源编码
        energyCode: '',
        pageNum: 1,
        pageSize: pageSizes[0],
        orders: [
          {
            asc: true,
            column: '',
          },
        ],
        searchCount: true,
      },
      // 列表详情
      dataSource: [],
      basicParam: false,
      total: 0,
      loading: true,
      isAddFlag: false,
      basicParamConfigDetail: {
        alarmLower: 0,
        alarmUpper: 0,
        comfortableLower: 0,
        comfortableUpper: 0,
        energyCode: '', // 能源编码
        energyCodeName: '', // 能源名称
        id: 0,
        seasonId: 0,
        seasonName: '',
        weight: 0,
      },
      dialogOpen: false,
      nums: 1,
    });

    // 新增
    const onAddDialogShow = async () => {
      // 季节
      await getSeasonList();
      basicParamConfigState.isAddFlag = true;
      basicParamConfigState.dialogOpen = true;
      basicParamConfigState.nums++;
    };

    // 修改
    const onEnergyCodeUpdate = async (item: BasicParamConfigModule.BasicParamConfigInfo) => {
      // 季节
      await getSeasonList();
      basicParamConfigState.basicParamConfigDetail = item;
      basicParamConfigState.isAddFlag = false;
      basicParamConfigState.dialogOpen = true;
      basicParamConfigState.nums++;
    };

    // 页码改变
    const onPageSizeChange = (value: number) => {
      basicParamConfigState.queryParams.pageSize = value;
      basicParamConfigState.queryParams.pageNum = 1;
      getBasicParamConfigList();
    };

    // 分页
    const onCurrentChange = (value: number) => {
      basicParamConfigState.queryParams.pageNum = Math.floor(value);
      getBasicParamConfigList();
    };

    // 删除
    const onEnergyCodeDelete = (item: number) => {
      ElMessageBox.confirm('确认删除数据?', '删除数据', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(async () => {
          const params = {
            id: item,
          };
          try {
            const res = await basicParamConfigService.getBasicParamConfigDelete(params);
            if (res.code == 200 && res.success) {
              getBasicParamConfigList();
              proxy.$message.success('删除成功');
            } else {
              if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
                proxy.$message.error(res.message || '操作失败');
              }
            }
          } catch (error) {
            proxy.$message.error('操作失败');
          }
        })
        .catch(() => {});
    };

    // 重置
    const onReset = () => {
      basicParamConfigState.queryParams.pageNum = 1;
      basicParamConfigState.queryParams.pageSize = pageSizes[0];
      basicParamConfigState.queryParams.energyCode = basicParamConfigState.energylList[0].code;
      getBasicParamConfigList();
    };

    // 获取列表
    const getBasicParamConfigList = async () => {
      try {
        basicParamConfigState.loading = true;
        const params = cloneDeep(basicParamConfigState.queryParams);
        if (params.energyCode === 0) {
          params.energyCode = '';
        }
        const res = await basicParamConfigService.getBasicParamConfigList(params);
        // console.log(res);
        if (res.code == 200 && res.success) {
          basicParamConfigState.loading = false;
          basicParamConfigState.dataSource = res.data.list || [];
          basicParamConfigState.total = res.data.total;
          basicParamConfigState.basicParam = false;
        } else {
          basicParamConfigState.loading = false;
          basicParamConfigState.basicParam = false;
          if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
            proxy.$message.error(res.message);
          }
        }
      } catch (error) {
        basicParamConfigState.loading = false;
        basicParamConfigState.basicParam = true;
        console.log(error);
      }
    };

    // 采样名称
    const getEnergyList = () => {
      basicParamConfigState.energylList = [
        { code: '', name: '所有采样' },
        { code: 'N1000', name: '温度' },
        { code: 'N2000', name: '湿度' },
        { code: 'N6000', name: '二氧化碳' },
        { code: 'N7000', name: 'PM2.5' },
        { code: 'N8000', name: '一氧化碳' },
      ];
      basicParamConfigState.queryParams.energyCode = basicParamConfigState.energylList[0].code;
    };

    // 获取季节
    const getSeasonList = async () => {
      try {
        const res = await basicParamConfigService.getSeasonList();
        // console.log(res);
        if (res.code == 200 && res.success) {
          basicParamConfigState.seasonList = res.data;
        } else {
          if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
            proxy.$message.error('获取季节失败');
          }
        }
      } catch (err) {
        console.log(err);
        // proxy.$message.error('获取季节失败');
      }
    };
    /**
     * 初始化
     */
    onMounted(async () => {
      // 采样类型-能源名称
      getEnergyList();
      await getBasicParamConfigList();
    });
    return {
      ...toRefs(basicParamConfigState),
      getBasicParamConfigList,
      onAddDialogShow,
      onEnergyCodeUpdate,
      onPageSizeChange,
      onCurrentChange,
      getEnergyList,
      onEnergyCodeDelete,
      onReset,
      pageSizes,
    };
  },
});
