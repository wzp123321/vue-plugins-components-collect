import { cloneDeep } from 'lodash';
import { ElForm } from 'element-plus';
import { defineComponent, ref, toRefs, onMounted, reactive } from 'vue';
import BuildingInformationService from './service/building-information-config.service';
import { useCommonController } from '../../utils/use-common-controller';
import { pageSizes, treeTypeList } from '../../config/index';
import { getTreeExpandKeys } from '../../utils/index';

interface buildingInfoState {
  queryParams: BuildingInformationModule.QueryParams;
  total: number;
  loading: boolean;
  isAddFlag: boolean;
  isReadFlag: boolean;
  submitLoading: boolean;
  BuildingInformationForm: BuildingInformationModule.BuildingInformationForm;
  BuildingInformationFormClone: BuildingInformationModule.BuildingInformationInfo;
  buildingTypeValue: string;
  buildingTypeOptions: any;

  coolingModeOptions: any;

  heatingModeOptions: any;
  treeList: TreeManageModule.TreeDetail[];
  expandKeys: number[];
  treeLoading: boolean;
  dialogVisible: boolean;
  dataSource: BuildingInformationModule.BuildingInformationInfo[];
}

export default defineComponent({
  name: 'buildingInformationConfig',
  setup() {
    let { proxy, treeType, getTreeWidthoutLocationList } = useCommonController();
    const buildingInfoState = reactive<buildingInfoState>({
      queryParams: {
        orders: [
          {
            asc: true,
            column: '',
          },
        ],
        searchCount: true,
        pageSize: pageSizes[0],
        pageNum: 1,
        name: '',
      },
      total: 0,
      loading: true,
      isAddFlag: false,
      isReadFlag: false,
      submitLoading: false,
      BuildingInformationForm: {
        id: 0,
        name: '',
        buildingYear: null,
        layers: null,
        treeId: [],
        treeType: 0,
        treeName: '',
        buildingType: '',
        buildingTypeText: '',
        address: '',
        area: null,
        airConditionedArea: null,
        heatingArea: null,
        coolingMode: '', //建筑空调系统形式
        heatingMode: '', //建筑采暖系统形式
        shapeCoefficient: null,
        structure: '',
        wallMaterial: '',
        wallWarmMode: '',
        curtainType: '',
        glassType: '',
        windowMaterialType: '',
      },
      BuildingInformationFormClone: {
        id: 0,
        name: '',
        buildingYear: null,
        layers: null,
        treeId: 0,
        treeName: '',
        treeType: 0,
        buildingType: '',
        buildingTypeText: '',
        address: '',
        area: null,
        airConditionedArea: null,
        heatingArea: null,
        coolingMode: '', //建筑空调系统形式
        heatingMode: '', //建筑采暖系统形式
        shapeCoefficient: null,
        structure: '',
        wallMaterial: '',
        wallWarmMode: '',
        curtainType: '',
        glassType: '',
        windowMaterialType: '',
      },

      buildingTypeValue: '',
      buildingTypeOptions: [],

      coolingModeOptions: [],

      heatingModeOptions: [],
      treeList: [],
      expandKeys: [],
      treeLoading: false,
      dialogVisible: false,
      dataSource: [],
    });
    const buildingInformationForm_copy = cloneDeep(buildingInfoState.BuildingInformationForm);
    let nums = ref<number>(1);
    const buildingInfoRef = ref(ElForm);
    const rules = {
      name: [
        {
          required: true,
          message: '请填写建筑名称,最大20字',
          trigger: ['change', 'blur'],
        },
      ],
      buildingYear: [
        {
          required: true,
          message: '必填项，只能是正整数',
          trigger: ['change', 'blur'],
        },
      ],
      treeId: [{ required: true, message: '请选择节点', trigger: ['change', 'blur'] }],
    };
    //建筑空调系统形式
    const queryCoolingModeOptions = async () => {
      try {
        const params = 'cooling_mode';
        const res = await BuildingInformationService.getBuidingTypeData(params);
        if (res.code == 200 && res.success) {
          buildingInfoState.coolingModeOptions = res.data || null;
        } else {
          buildingInfoState.coolingModeOptions = [];
        }
      } catch (error: any) {
        buildingInfoState.coolingModeOptions = [];
      }
    };
    //建筑采暖系统形式
    const queryHeatingModeOptions = async () => {
      try {
        const params = 'heating_mode';
        const res = await BuildingInformationService.getBuidingTypeData(params);
        if (res.code == 200 && res.success) {
          buildingInfoState.heatingModeOptions = res.data || null;
        } else {
          buildingInfoState.heatingModeOptions = [];
        }
      } catch (error: any) {
        buildingInfoState.heatingModeOptions = [];
      }
    };
    //建筑功能--数字字典
    const queryBuildingType = async () => {
      try {
        const params = 'building_type';
        const res = await BuildingInformationService.getBuidingTypeData(params);
        if (res.code == 200 && res.success) {
          buildingInfoState.buildingTypeOptions = res.data || null;
        } else {
          buildingInfoState.buildingTypeOptions = [];
        }
      } catch (error: any) {
        buildingInfoState.buildingTypeOptions = [];
      }
    };
    //查询--按钮
    const onSearch = () => {
      queryInitTabData();
    };
    /**
     * 查询建筑信息表格数据
     */
    const queryInitTabData = async () => {
      buildingInfoState.loading = true;
      try {
        const res = await BuildingInformationService.getInitTab(buildingInfoState.queryParams);
        if (res && res.code === 200 && res.success) {
          buildingInfoState.dataSource = [];
          if (res.data && res.data.list) {
            res.data.list.forEach(function (e: BuildingInformationModule.BuildingInformationInfo) {
              buildingInfoState.dataSource.push({
                id: e.id,
                address: e.address, //建筑地址
                airConditionedArea: e.airConditionedArea, //空调面积
                area: e.area, //各功能分区面积
                buildingType: e.buildingType, //建筑功能类型名称
                buildingTypeText: e.buildingTypeText,
                buildingYear: e.buildingYear, //建筑年代
                coolingMode: e.coolingMode, //制冷模式
                curtainType: e.curtainType, //建筑外帘类型
                glassType: e.glassType, //建筑玻璃类型
                heatingArea: e.heatingArea, //采暖面积
                heatingMode: e.heatingMode, //采暖模式
                layers: e.layers, //建筑层数
                name: e.name, //建筑名称
                shapeCoefficient: e.shapeCoefficient, //建筑体形系数
                structure: e.structure, //建筑结构形式
                treeId: e.treeId, //建筑关联的树节点ID
                treeName: e.treeName, //	树节点名称
                wallMaterial: e.wallMaterial, //建筑外墙材料
                wallWarmMode: e.wallWarmMode, //建筑外墙保温形式
                windowMaterialType: e.windowMaterialType, //窗框材料类型
                treeType: Number(e.treeType), //树节点类型
              });
            });
            buildingInfoState.total = res?.data?.total;
            buildingInfoState.loading = false;
          } else {
            buildingInfoState.dataSource = [];
            buildingInfoState.total = res?.data?.total ?? 0;
            buildingInfoState.loading = false;
          }
        } else {
          if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
            proxy.$message.error(res.message || '查询数据失败');
          }
          buildingInfoState.dataSource = [];
          buildingInfoState.total = 0;
          buildingInfoState.loading = false;
        }
      } catch (error) {
        proxy.$message.error('查询数据失败');
        buildingInfoState.dataSource = [];
        buildingInfoState.total = 0;
        buildingInfoState.loading = false;
      }
    };
    /**
     * 页面pageSize改变
     */
    const onPageSizeChange = (value: number) => {
      buildingInfoState.queryParams.pageSize = value;
      buildingInfoState.queryParams.pageNum = 1;
      queryInitTabData();
    };
    /**
     * 分页
     */
    const onCurrentChange = (value: number) => {
      buildingInfoState.queryParams.pageNum = Math.floor(value);
      queryInitTabData();
    };
    /**
     * 新增--按钮事件
     */
    const onAddDialogShow = () => {
      buildingInfoState.isAddFlag = true;
      nums.value++;
      //清空弹窗内容
      buildingInfoState.BuildingInformationForm = cloneDeep(buildingInformationForm_copy);
      buildingInfoState.buildingTypeValue = '';
      buildingInfoState.dialogVisible = true;
    };
    //树结构查找area、airConditionedArea
    let flatTreeData: any = [];
    const treeToList = (list: any, node: number) => {
      list.forEach((e: any) => {
        if (e.id == node) {
          flatTreeData = [];
          flatTreeData.push({
            area: e.area,
            airConditionedArea: e.airConditionedArea,
          });
          return;
        } else {
          e.childTree && e.childTree.length > 0 ? treeToList(e.childTree, node) : '';
        }
      });
    };
    //编辑--按钮事件
    const editBuildingInfo = async (item: BuildingInformationModule.BuildingInformationInfo, status: boolean) => {
      buildingInfoState.isReadFlag = status;
      buildingInfoState.BuildingInformationFormClone = cloneDeep(item);
      treeType.value = item.treeType;
      await onTreeTypeChange();
      await treeToList(buildingInfoState.treeList, item.treeId);
      buildingInfoState.BuildingInformationForm.area = flatTreeData?.[0]?.area;
      buildingInfoState.BuildingInformationForm.airConditionedArea = flatTreeData?.[0]?.airConditionedArea;
      //编辑+查看参数
      if (status) {
        //查看专用treeName
        buildingInfoState.BuildingInformationForm.treeName = item.treeName ? item.treeName : '-';
        buildingInfoState.BuildingInformationForm.name = item.name ? item.name : '-';
        buildingInfoState.BuildingInformationForm.buildingYear = item.buildingYear ? item.buildingYear : '-';
        buildingInfoState.BuildingInformationForm.layers = item.layers ? item.layers : '-';
        buildingInfoState.BuildingInformationForm.buildingType = item.buildingType ? item.buildingType : '-';

        buildingInfoState.BuildingInformationForm.buildingTypeText = item.buildingTypeText
          ? item.buildingTypeText
          : '-';
        buildingInfoState.BuildingInformationForm.address = item.address ? item.address : '-';
        buildingInfoState.BuildingInformationForm.heatingArea = item.heatingArea ? item.heatingArea : '-';
        buildingInfoState.BuildingInformationForm.shapeCoefficient = item.shapeCoefficient
          ? item.shapeCoefficient
          : '-';
        buildingInfoState.BuildingInformationForm.structure = item.structure ? item.structure : '-';
        buildingInfoState.BuildingInformationForm.wallMaterial = item.wallMaterial ? item.wallMaterial : '-';
        buildingInfoState.BuildingInformationForm.wallWarmMode = item.wallWarmMode ? item.wallWarmMode : '-';
        buildingInfoState.BuildingInformationForm.curtainType = item.curtainType ? item.curtainType : '-';
        buildingInfoState.BuildingInformationForm.glassType = item.glassType ? item.glassType : '-';
        buildingInfoState.BuildingInformationForm.windowMaterialType = item.windowMaterialType
          ? item.windowMaterialType
          : '-';
        buildingInfoState.buildingTypeValue = item.buildingType ? item.buildingType : '-';
        buildingInfoState.BuildingInformationForm.coolingMode = item.coolingMode ? item.coolingMode : '-';
        buildingInfoState.BuildingInformationForm.heatingMode = item.heatingMode ? item.heatingMode : '-';
      } else {
        buildingInfoState.BuildingInformationForm.id = item.id;
        buildingInfoState.BuildingInformationForm.name = item.name;
        buildingInfoState.BuildingInformationForm.buildingYear = item.buildingYear;
        buildingInfoState.BuildingInformationForm.layers = item.layers;
        buildingInfoState.BuildingInformationForm.treeId = [item.treeId];
        buildingInfoState.BuildingInformationForm.buildingType = item.buildingType;
        buildingInfoState.BuildingInformationForm.buildingTypeText = item.buildingTypeText;
        buildingInfoState.BuildingInformationForm.address = item.address;
        buildingInfoState.BuildingInformationForm.heatingArea = item.heatingArea;
        buildingInfoState.BuildingInformationForm.shapeCoefficient = item.shapeCoefficient;
        buildingInfoState.BuildingInformationForm.structure = item.structure;
        buildingInfoState.BuildingInformationForm.wallMaterial = item.wallMaterial;
        buildingInfoState.BuildingInformationForm.wallWarmMode = item.wallWarmMode;
        buildingInfoState.BuildingInformationForm.curtainType = item.curtainType;
        buildingInfoState.BuildingInformationForm.glassType = item.glassType;
        buildingInfoState.BuildingInformationForm.windowMaterialType = item.windowMaterialType;
        //内置select默认选中
        buildingInfoState.buildingTypeValue = item.buildingType;
        buildingInfoState.BuildingInformationForm.coolingMode = item.coolingMode;
        buildingInfoState.BuildingInformationForm.heatingMode = item.heatingMode;
      }

      buildingInfoState.isAddFlag = false;
      buildingInfoState.dialogVisible = true;
    };
    //删除
    const deleteBuildingInfo = async (id: number) => {
      proxy
        .$confirm('确认删除该条数据吗?', '删除数据', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        })
        .then(async () => {
          try {
            let formData = new FormData(); // FormData 对象
            formData.append('id', id.toString());
            const res = await BuildingInformationService.deleteBuildingInfo(formData);
            if (res && res.code === 200 && res.success) {
              proxy.$message.success('删除成功');
              queryInitTabData();
            } else {
              if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
                proxy.$message.error(res.message || '删除失败');
              }
            }
          } catch (error) {
            proxy.$message.error('删除失败');
          }
        });
    };
    /**
     * 新增、编辑弹窗关闭事件
     */
    const onBeforeClose = () => {
      buildingInfoState.dialogVisible = false;
      buildingInfoState.isReadFlag = false;
      buildingInfoRef.value.resetFields();
    };
    //重置
    const onCancel = async () => {
      buildingInfoState.dialogVisible = false;
    };
    // 树类型change
    const onTreeTypeChange = async () => {
      if (buildingInfoState.isAddFlag) {
        buildingInfoRef.value.validateField('treeId');
      }
      buildingInfoState.treeLoading = true;
      try {
        buildingInfoState.treeList = await getTreeWidthoutLocationList();
        buildingInfoState.expandKeys = getTreeExpandKeys<TreeManageModule.TreeDetail[]>(
          buildingInfoState.treeList,
          'id',
          'childTree',
        );
      } catch (error) {
        buildingInfoState.treeList = [];
      } finally {
        buildingInfoState.treeLoading = false;
      }
    };
    //树节点变化
    const onNodeClick = async () => {
      buildingInfoRef.value.validateField('treeId');
      const id: number[] = buildingInfoState.BuildingInformationForm.treeId;
      //查找area、airConditionedArea
      await treeToList(buildingInfoState.treeList, id?.[0]);
      buildingInfoState.BuildingInformationForm.area = flatTreeData?.[0]?.area;
      buildingInfoState.BuildingInformationForm.airConditionedArea = flatTreeData?.[0]?.airConditionedArea;
    };
    // 表单提交
    const onSubmit = () => {
      buildingInfoRef.value.validate((valid: boolean) => {
        if (valid) {
          if (buildingInfoState.isAddFlag) {
            getBuildingInfoCreate();
          } else {
            getBuildingInfoUpdate();
          }
        }
      });
    };
    //新增
    const getBuildingInfoCreate = async () => {
      if (buildingInfoState.submitLoading) {
        return;
      }
      const {
        name,
        buildingYear,
        layers,
        treeId,
        buildingType,
        address,
        heatingArea,
        coolingMode,
        heatingMode,
        shapeCoefficient,
        structure,
        wallMaterial,
        wallWarmMode,
        curtainType,
        glassType,
        windowMaterialType,
      } = buildingInfoState.BuildingInformationForm;
      buildingInfoState.submitLoading = true;
      try {
        const obj = {
          name,
          buildingYear,
          layers,
          treeId: treeId[0],
          buildingType: buildingInfoState.buildingTypeValue,
          address,
          heatingArea,
          coolingMode,
          heatingMode,
          shapeCoefficient,
          structure,
          wallMaterial,
          wallWarmMode,
          curtainType,
          glassType,
          windowMaterialType,
        };
        console.log('新增', obj);

        const res = await BuildingInformationService.addBuildingInfo(obj);
        if (res && res.code === 200 && res.data) {
          proxy.$message.success('新增成功');
          buildingInfoRef.value.resetFields();
          buildingInfoState.dialogVisible = false;
          queryInitTabData();
        } else {
          if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
            proxy.$message.error(res.message || '新增失败');
          }
        }
      } catch (error) {
        proxy.$message.error('新增失败');
      } finally {
        buildingInfoState.submitLoading = false;
      }
    };
    //编辑
    const getBuildingInfoUpdate = async () => {
      if (buildingInfoState.submitLoading) {
        return;
      }
      buildingInfoState.submitLoading = true;
      const {
        id,
        name,
        buildingYear,
        layers,
        treeId,
        buildingType,
        address,
        heatingArea,
        coolingMode,
        heatingMode,
        shapeCoefficient,
        structure,
        wallMaterial,
        wallWarmMode,
        curtainType,
        glassType,
        windowMaterialType,
      } = buildingInfoState.BuildingInformationForm;
      try {
        const obj = {
          id,
          name,
          buildingYear,
          layers,
          treeId: treeId[0],
          buildingType: buildingInfoState.buildingTypeValue,
          address,
          heatingArea,
          coolingMode,
          heatingMode,
          shapeCoefficient,
          structure,
          wallMaterial,
          wallWarmMode,
          curtainType,
          glassType,
          windowMaterialType,
        };
        const res = await BuildingInformationService.editBuildingInfo(obj);
        if (res && res.code === 200) {
          proxy.$message.success('修改成功');
          buildingInfoRef.value.resetFields();
          buildingInfoState.dialogVisible = false;
          queryInitTabData();
        } else {
          if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
            proxy.$message.error(res.message || '修改失败');
          }
        }
      } catch (error) {
        proxy.$message.error('修改失败');
      } finally {
        buildingInfoState.submitLoading = false;
      }
    };
    onMounted(async () => {
      try {
        queryInitTabData();
        queryBuildingType();
        queryCoolingModeOptions();
        queryHeatingModeOptions();
        buildingInfoState.treeList = await getTreeWidthoutLocationList();
        if (buildingInfoState.treeList?.length === 0) {
          buildingInfoState.expandKeys = [];
          return;
        }
        buildingInfoState.expandKeys = getTreeExpandKeys<TreeManageModule.TreeDetail[]>(
          buildingInfoState.treeList,
          'id',
          'childTree',
        );
      } catch (error) {
        buildingInfoState.expandKeys = [];
        buildingInfoState.treeList = [];
      }
    });

    return {
      ...toRefs(buildingInfoState),
      pageSizes,
      buildingInfoRef,
      treeTypeList,
      treeType,
      rules,
      nums,
      onSearch,
      onAddDialogShow,
      editBuildingInfo,
      deleteBuildingInfo,

      onBeforeClose,
      onPageSizeChange,
      onCurrentChange,
      onTreeTypeChange,
      onCancel,
      onSubmit,
      onNodeClick,
    };
  },
});
