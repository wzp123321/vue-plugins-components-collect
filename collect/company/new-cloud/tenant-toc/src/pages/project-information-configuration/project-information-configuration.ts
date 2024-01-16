import { reactive, ref, toRefs, onMounted, defineComponent } from 'vue';
import { ElDialog } from 'element-plus';
import { cloneDeep } from 'lodash';
import { useRouter } from 'vue-router';

import { pageSizesArray } from '@/config';
import { DicParams } from './constant/enum';
import { projectStatusList } from './constant';

import CommonService from '@/service/pkg/index';

import projectInformationConfigurationService from './services/project-information-configuration.service';

import PicEditDialog from './compontents/pic-edit-dialog.vue';

interface ProjectState {
  pageForm: ProjectInformationConfigurationList.SearchForm;
  total: number;
  loading: boolean;
  dataSource: ProjectListVO[];
}

/**
 * @param projectName 项目名
 * @param area 区域
 * @param hostingDate 托管日期
 * @param hostingType 托管类型
 * @param projectriskRating 项目风险评级
 * @param benchmarkType 基准类型
 * @param gainSharing 收益分享
 * @param status 状态
 * @param id ID
 * @param code 租户编码
 */
interface ProjectListVO {
  code: string;
  emsHost: string;
  emsVersion: string;
  fileName: string;
  id: number;
  name: string;
}

const statuses = cloneDeep(projectStatusList);
statuses.unshift({
  code: '',
  name: '全部',
});

export default defineComponent({
  name: 'ProjectManage',
  components: { PicEditDialog },
  setup() {
    const router = useRouter();

    const is_searching = ref<boolean>(false);
    const PicEditDialogRef = ref(ElDialog); // 弹框ref
    const rows = ref<ProjectInformationConfigurationList.ProjectVO>();
    const emsVersionList = ref<ProjectInformationConfigurationList.EmsVersionType[]>([]); // ems版本list
    const projectState = reactive<ProjectState>({
      pageForm: {
        orders: [
          {
            column: '',
            asc: true,
          },
        ],
        searchCount: true,
        projectName: '',
        status: statuses[0].code,
        pageNum: 1,
        pageSize: pageSizesArray[0],
      },
      total: 0,
      loading: true,
      dataSource: [],
    });

    // 头部表单提交
    const onSubmit = () => {
      onQuery();
    };
    // 重置
    const onReset = () => {
      projectState.pageForm.projectName = '';
      projectState.pageForm.status = '';
      projectState.pageForm.pageNum = 1;
      projectState.pageForm.pageSize = pageSizesArray[0];
      onQuery();
    };
    // 每页条数change
    const onSizeChange = (value: number) => {
      projectState.pageForm.pageNum = 1;
      projectState.pageForm.pageSize = value;
      onQuery();
    };
    // 分页
    const onPageChange = (value: number) => {
      projectState.pageForm.pageNum = value;
      onQuery();
    };
    // 查询列表
    const onQuery = async () => {
      if (is_searching.value) {
        return;
      }
      is_searching.value = true;
      projectState.loading = true;
      try {
        const { pageNum, pageSize, projectName, status, orders, searchCount } = projectState.pageForm;
        let params: ProjectInformationConfigurationList.SearchForm = {
          pageNum,
          pageSize,
          projectName,
          orders,
          searchCount,
        };
        if (status) {
          params = {
            ...params,
            status,
          };
        }
        const res = await projectInformationConfigurationService.queryProjectList(params);
        if (res && res.code === 200 && res.data) {
          projectState.dataSource = converter(res.data?.list) ?? [];
          projectState.total = res.data?.total || 0;
        } else {
          projectState.dataSource = [];
          projectState.total = 0;
        }
      } catch (error) {
        projectState.dataSource = [];
        projectState.total = 0;
      } finally {
        projectState.loading = false;
        is_searching.value = false;
      }
    };
    // 数据处理
    const converter = (data: ProjectInformationConfigurationList.ProjectVO[]): ProjectListVO[] => {
      return data.map((item: ProjectInformationConfigurationList.ProjectVO) => {
        return {
          code: item.code ?? '--',
          emsHost: item.emsHost ?? '--',
          emsVersion: item.emsVersion ?? '--',
          fileName: item.fileName ?? '--',
          id: item.id ?? '--',
          name: item.name ?? '--',
        };
      });
    };
    // 编辑
    const onEidt = (val: ProjectInformationConfigurationList.ProjectVO) => {
      rows.value = val;
      queryEmsVersion();
      PicEditDialogRef.value.querySingleTenantConfig(val.code, val.id, val.fileName);

      // querySingleTenantConfig(val);
    };
    // 编辑成功回调
    const picEditOK = () => {
      onQuery();
    };
    // 查询ems版本
    const queryEmsVersion = async () => {
      try {
        const res = await CommonService.queryDictionaryListByCode(DicParams.EMS_VERSION);
        if (res && res.code === 200 && res.success) {
          emsVersionList.value = res.data || [];
        } else {
        }
      } catch (error) {}
    };
    /**
     * 初始化
     */
    onMounted(() => {
      onQuery();
      // queryEmsVersion();
    });

    return {
      ...toRefs(projectState),
      pageSizesArray,
      statuses,
      PicEditDialogRef,
      rows,
      emsVersionList,
      onSubmit,
      onReset,
      onSizeChange,
      onPageChange,
      onEidt,
      picEditOK,
    };
  },
});
