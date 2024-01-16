import { reactive, ref, toRefs, onMounted, defineComponent } from 'vue';

import { pageSizesArray } from '@/config';
import { EHostMenuFlag, MENU_TYPE } from '@/config/enum';
import { projectStatusList, trusteeshipTypeList, riskRatingList, standardTypeList } from '../constant';

import { cloneDeep } from 'lodash';
import { useRouter } from 'vue-router';

import commonService from '../../../service/pkg/index';
import projectManageService from '../services/project-manage.service';
import { ProjectVO, SearchForm, IKeyValue, PmEPageUrl } from '../services/project-manage.api';
import { CommonEPageType } from '@/service/api';

import cryptoUtil from '@/utils/crypto';
import { FSetStorageData } from '@/utils/storage';

interface ProjectState {
  pageForm: SearchForm;
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
  projectName: string;
  area: string;
  hostingDate: string;
  hostingType: string;
  projectriskRating: string;
  benchmarkType: string;
  gainSharing: string;
  status: string;
  id: number;
  code: string;
}

const statuses = cloneDeep(projectStatusList);
statuses.unshift({
  code: '',
  name: '全部',
});

export default defineComponent({
  name: 'ProjectManage',
  setup() {
    const router = useRouter();

    const is_searching = ref<boolean>(false);
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
    // 查看按钮是否展示
    const viewBtnShowFlag = ref<boolean>(true);
    // 编辑按钮是否展示
    const editorBtnShowFlag = ref<boolean>(true);
    // 进入项目按钮权限
    const projectBtnShowFlag = ref<boolean>(true);

    // 头部表单提交
    const onSubmit = () => {
      projectState.pageForm.pageNum = 1;
      projectState.pageForm.pageSize = pageSizesArray[0];
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
      projectState.pageForm.pageNum = Math.floor(value);
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
        let params: SearchForm = {
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
        const res = await projectManageService.queryProjectList(params);
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

        console.warn('查询列表-------------->', error);
      } finally {
        projectState.loading = false;
        is_searching.value = false;
      }
    };
    // 数据处理
    const converter = (data: ProjectVO[]): ProjectListVO[] => {
      // 根据code获取name
      const getNameByCode = (list: IKeyValue[], code: string) => {
        if (!code) {
          return '--';
        }
        let name = '--';
        list.forEach((item) => {
          if (item.code === code) {
            name = item.name;
          }
        });
        return name;
      };
      return (
        data?.map((item: ProjectVO) => {
          return {
            projectName: item.name,
            area:
              !!item.province || !!item.city || !!item.district
                ? `${item.province ?? ''}${item.city ?? ''}${item.district ?? ''}`
                : '--',
            hostingDate:
              item?.hostingStartTime && item?.hostingEndTime
                ? `${item?.hostingStartTime}-${item?.hostingEndTime}`
                : '--',
            hostingType: item.hostingType ? getNameByCode(trusteeshipTypeList, item.hostingType) : '--',
            projectriskRating: item.riskRating ? getNameByCode(riskRatingList, item.riskRating) : '--',
            benchmarkType: item.benchmarkType ? getNameByCode(standardTypeList, item.benchmarkType) : '--',
            gainSharing: item.gainSharing ?? '--',
            status: item.status ? getNameByCode(projectStatusList, item.status) : '--',
            id: item.id,
            code: item.code,
            hostingEndTime: item?.hostingEndTime ?? '',
            hostingStartTime: item?.hostingStartTime ?? '',
          };
        }) ?? []
      );
    };
    /**
     * 页面跳转
     * @param type
     * @param tenantCode
     * @param tenantId
     * @param projectName
     */
    const onPageTo = (type: string, tenantCode: string, tenantId: number, projectName?: string) => {
      window.sessionStorage.setItem('TENANT_CODE', tenantCode);
      window.sessionStorage.setItem('TENANT_ID', tenantId + '');
      FSetStorageData('toc-project-name', projectName);
      console.log('%c✨✨跳转项目✨✨', 'font-size: 24px', tenantCode, tenantId);

      if (type !== 'portal') {
        router.push({
          path: `/home/projectManage/${type}`,
          query: {
            tenantCode: cryptoUtil.Encrypt(tenantCode),
            tenantId: cryptoUtil.Encrypt(tenantId.toString()),
          },
        });
      } else {
        const url = `/cloud-portal/terminal?tenantCode=${cryptoUtil.Encrypt(tenantCode)}&tenantId=${cryptoUtil.Encrypt(
          tenantId.toString(),
        )}&type=${MENU_TYPE.FEATURE}`;
        window.open(url);
      }
    };
    /**
     * 校验按钮权限
     */
    const mapButtonAuthority = async () => {
      try {
        const promiseArr = [
          commonService.checkHostingMenu({
            tenantCode: '',
            tenantId: 0,
            systemFlag: CommonEPageType.TOC页面,
            url: PmEPageUrl.查看页面,
            isDefaultUrl: '0',
            historyFlag: EHostMenuFlag.需要,
          }),
          commonService.checkHostingMenu({
            tenantCode: '',
            tenantId: 0,
            systemFlag: CommonEPageType.TOC页面,
            url: PmEPageUrl.编辑页面,
            isDefaultUrl: '0',
            historyFlag: EHostMenuFlag.不需要,
          }),
          commonService.checkHostingMenu({
            tenantCode: '',
            tenantId: 0,
            systemFlag: CommonEPageType.TOC页面,
            url: PmEPageUrl.项目级大屏,
            isDefaultUrl: '0',
            historyFlag: EHostMenuFlag.不需要,
          }),
        ];
        const resArr = await Promise.all(promiseArr);
        viewBtnShowFlag.value = resArr?.[0]?.data?.checkResult ?? true;
        editorBtnShowFlag.value = resArr?.[1]?.data?.checkResult ?? true;
        projectBtnShowFlag.value = resArr?.[2]?.data?.checkResult ?? true;
      } catch (error) {
        viewBtnShowFlag.value = false;
        editorBtnShowFlag.value = false;
        projectBtnShowFlag.value = false;
      }
    };
    /**
     * 初始化
     */
    onMounted(() => {
      mapButtonAuthority();
      onQuery();
    });

    return {
      ...toRefs(projectState),
      pageSizesArray,
      statuses,
      viewBtnShowFlag,
      editorBtnShowFlag,
      projectBtnShowFlag,

      onSubmit,
      onReset,
      onSizeChange,
      onPageChange,
      onPageTo,
    };
  },
});
