import { postRequest } from '@/services/request';
import { EDaarLogType } from '../../data-abnomal-alarm-rules.api';
import { defineComponent, watch, nextTick, reactive, toRefs } from 'vue';
import useCurrentInstance from '@/utils/use-current-instance';
import abnomalAlarmRulesService from '@/pages/data-abnomal-alarm-rules/service/data-abnomal-alarm-rules.service';
import { pageSizes } from '@/config/index';

interface logState {
  visible: boolean;
  logTable: any;
  currentPage: number;
  pageSize: number;
  pageSizes: any;
  total: number;
  loading: boolean;
}

export default defineComponent({
  name: 'readLogDialog',
  props: {
    queryUrl: {
      type: String,
      default: '',
    },
    id: {
      type: Number,
      default: 0,
    },
    abnormalType: {
      type: String,
      default: '',
    },
    thresholdType: {
      type: String,
      default: '',
    },
    energyCode: {
      type: String,
      default: '',
    },
  },
  components: {},
  setup(props) {
    const { proxy } = useCurrentInstance();
    const logState = reactive<logState>({
      visible: false,
      logTable: [],
      currentPage: 1,
      pageSize: 10,
      pageSizes,
      total: 0,
      loading: false,
    });
    watch(
      () => logState.visible,
      (newVal, oldVal) => {
        if (newVal != false) {
          nextTick(() => {
            queryAlarmLogList();
          });
        }
      },
      {
        immediate: true,
      },
    );

    // 查询日志
    const queryAlarmLogList = async () => {
      try {
        if (logState.currentPage == null && logState.pageSize == null) {
          logState.currentPage = 1;
          logState.pageSize = 10;
        }
        let logParams: { [key: string]: any } = props.abnormalType
          ? {
              abnormalType: Number(props.abnormalType),
              thresholdType: Number(props.thresholdType),
              energyCode: props.energyCode,
              orders: [
                {
                  asc: null,
                  column: null,
                },
              ],
              pageNum: logState.currentPage,
              pageSize: logState.pageSize,
            }
          : {
              id: props.id,
              orders: [
                {
                  asc: null,
                  column: null,
                },
              ],
              pageNum: logState.currentPage,
              pageSize: logState.pageSize,
            };

        logState.loading = true;
        const res = await postRequest(props.queryUrl, logParams);
        if (res.success) {
          logState.logTable = [];
          res.data.list.forEach(function(e: any, index: any) {
            logState.logTable.push({
              id: e.id,
              createTime: e.createTime,
              description: e.description,
            });
          });

          logState.total = res.data.total;
          logState.currentPage = res.data.pageNum;
          logState.pageSize = res.data.pageSize;
        } else {
          if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
            return proxy.$message.error(res.message);
          }
          logState.logTable = [];
        }
      } catch (error) {
        logState.logTable = [];
        proxy.$message.error(error.message);
      } finally {
        logState.loading = false;
      }
    };
    /**
     * 打开弹框重置数据
     */
    const show = () => {
      logState.visible = true;
      handleSizeChange(10, 1);
    };
    //分页函数
    const handleSizeChange = (val: any, status: number) => {
      logState.currentPage = 1;
      logState.pageSize = val;
      if (status !== 1) {
        queryAlarmLogList();
      }
    };
    const handleCurrentChange = (val: any) => {
      logState.currentPage = Math.floor(val);
      queryAlarmLogList();
    };

    return {
      ...toRefs(logState),
      abnomalAlarmRulesService,
      show,
      handleSizeChange,
      handleCurrentChange,
    };
  },
});
