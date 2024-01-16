import { defineComponent, computed, onMounted, PropType } from 'vue';
export default defineComponent({
  name: 'UnitRankTable',
  props: {
    tableData: {
      // 数据源
      type: Array as PropType<UnitAreaEnergyRankModule.TableListItem[]>,
      default: [],
    },
    sortValue: {
      // 排序状态， 1. 降序 2.升序
      type: Number,
      default: 1,
    },
  },
  setup(props) {
    const sortData = computed(() => {
      return props.tableData?.filter((item) => {
        return (
          item?.value !== null &&
          item?.value !== undefined &&
          item?.unitAreaValue !== null &&
          item?.unitAreaValue !== undefined &&
          item?.area !== null &&
          item?.area !== undefined
        );
      });
    });
    const unit = computed(() => {
      return props.tableData[0];
    });
    const perWidthSet = (
      item: UnitAreaEnergyRankModule.TableListItem,
      sortData: UnitAreaEnergyRankModule.TableListItem[],
      index: number,
    ) => {
      if (props.sortValue === 1) {
        if (index === 0) {
          if (item.unitAreaValue === 0 || item.unitAreaValue === null) {
            return '0%';
          } else {
            return '100%';
          }
        } else {
          const v = item.unitAreaValue;
          const m = sortData[0].unitAreaValue;
          if (m === 0 || m === null) {
            return '0%';
          } else {
            return (v / m) * 100 + '%';
          }
        }
      } else {
        if (sortData?.length === 0) {
          return;
        } else {
          const v = item.unitAreaValue;
          const unitAreaValueList: number[] = [];
          sortData.forEach((item: UnitAreaEnergyRankModule.TableListItem) => {
            if (item.unitAreaValue !== null) {
              unitAreaValueList.push(item.unitAreaValue);
            }
          });
          const maxVal: any = [...unitAreaValueList].pop();
          if (unitAreaValueList.length === 0) {
            return '0%';
          }
          // else if (unitAreaValueList.length === 1) {
          //   return '100%';
          // }
          else if (unitAreaValueList.length > 1) {
            if (index <= unitAreaValueList.length - 1) {
              return (v / maxVal) * 100 + '%';
            } else {
              return '0%';
            }
          }
        }
      }
    };
    return {
      sortData,
      unit,
      perWidthSet,
    };
  },
});
