import { defineComponent, computed, onMounted, PropType } from 'vue';
export default defineComponent({
  name: 'RankTable',
  props: {
    tableData: {
      // 数据源
      type: Array as PropType<EnergyConsumptionRankModule.TableListItem[]>,
      default: [],
    },
    sortValue: {
      // 排序状态， 1. 降序 2.升序
      type: Number,
      default: 1,
    },
    tableColumnTitle: {
      type: String,
      default: '',
    },
  },
  setup(props) {
    const sortData = computed(() => {
      return props.tableData?.filter((item) => {
        return item?.value !== null && item?.value !== undefined;
      });
    });
    const columnTitle = computed(() => {
      return props.tableColumnTitle;
    });
    const perWidthSet = (
      item: EnergyConsumptionRankModule.TableListItem,
      sortData: EnergyConsumptionRankModule.TableListItem[],
      index: number,
    ) => {
      if (props.sortValue === 1) {
        if (index === 0) {
          if (item.value === 0) {
            return '0%';
          } else {
            return '100%';
          }
        } else {
          const v = item.value;
          const m = sortData[0].value;
          if (m === 0) {
            return '0%';
          } else {
            return (v / m) * 100 + '%';
          }
        }
      } else {
        // 升序
        if (sortData?.length === 0) {
          return;
        } else {
          const v = item.value;
          const valueList: number[] = [];
          sortData.forEach((item: EnergyConsumptionRankModule.TableListItem) => {
            if (item.value !== null) {
              valueList.push(item.value);
            }
          });
          const maxVal: any = [...valueList].pop();
          if (valueList.length === 0) {
            return '0%';
          }
          //  else if (valueList.length === 1) {
          //   return '100%';
          // }
          else if (valueList.length > 0) {
            if (index <= valueList.length - 1) {
              return (v / maxVal) * 100 + '%';
            } else {
              return '0%';
            }
          }
        }
        // if (index === sortData.length - 1) {
        //   if (sortData[sortData.length - 1].value === 0) {
        //     return '0%';
        //   } else {
        //     return '100%';
        //   }
        // } else {
        //   const v = item.value;
        //   const m = sortData[sortData.length - 1].value;
        //   if (m === 0) {
        //     return '0%';
        //   } else {
        //     return (v / m) * 100 + '%';
        //   }
        // }
      }
    };
    return {
      sortData,
      columnTitle,
      perWidthSet,
    };
  },
});
