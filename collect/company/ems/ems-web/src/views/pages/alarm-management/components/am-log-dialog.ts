import { defineComponent, ref, PropType } from 'vue';
export default defineComponent({
  name: 'logDialog',
  props: {
    logRows: {
      type: Array as PropType<AlarmModule.CommonObject[]>,
      default: []
    },
    dialogLog: {
      type: Boolean,
      default: false
    },
    logGenerationTime: {
      type: String,
      default: false
    }
  },
  setup(props) {
    const logRows = ref<AlarmModule.CommonObject[]>();
    logRows.value = props.logRows;
    const logGenerationTime: any = props.logGenerationTime;
    const dialogLogVisible = ref<boolean>(false);
    dialogLogVisible.value = props.dialogLog ? true : false;

    // 显示
    const show = async () => {
      dialogLogVisible.value = true;
    };
    // 关闭前初始化
    const onInitBeforeClose = () => {
      dialogLogVisible.value = false;
      logRows.value = [];
    };
    return {
      logRows,
      dialogLogVisible,
      logGenerationTime,
      onInitBeforeClose,
      close,
      show
    };
  }
});