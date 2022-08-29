import { ref } from 'vue';
/*
 * @Descrption: 大数据量表格
 * @Author: wanzp
 * @Date: 2022-08-20 20:44:00
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2022-08-28 13:05:42
 */
import { defineComponent, onMounted } from 'vue';

import { ElTableV2 } from 'element-plus';

import { TableVO } from './virtualized-table-el.api';

const column = [
  'id',
  'name',
  'age',

  'date',
  'time',
  'type',

  'content',
  'money',
  'bill',
  'billDate',
  'billYear',
  'billMonth',

  'day',
  'test',
  'text',

  'editing',
];

export default defineComponent({
  name: 'SurelyTable',
  components: {
    'el-table-v2': ElTableV2,
  },
  setup() {
    const columns = column.map((item, index) => {
      return {
        dataKey: item,
        key: 'column-' + index,
        title: item,
        width: 150,
      };
    });

    let data = ref<TableVO[]>([]);

    const generateData = (count: number) => {
      let l = [];
      for (let key = 0; key < count; key++) {
        l.push({
          id: key,
          name: `name_${key}`,
          age: key,

          date: `date_${key}`,
          time: `time_${key}`,
          type: `type_${key}`,

          content: `content_${key}`,
          money: key,
          bill: `bill_${key}`,
          billDate: `billDate_${key}`,
          billYear: `billYear_${key}`,
          billMonth: `billMonth_${key}`,

          day: `day_${key}`,
          test: `test_${key}`,
          text: `text_${key}`,

          editing: false,
        });
      }

      return l;
    };

    data.value = generateData(1000);

    const generateColumns = (length = 10, prefix = 'column-', props?: any) =>
      Array.from({ length }).map((_, columnIndex) => ({
        ...props,
        key: `${prefix}${columnIndex}`,
        dataKey: `${prefix}${columnIndex}`,
        title: `Column ${columnIndex}`,
        width: 150,
      }));
    console.log(generateColumns(10));
    // 插入
    const insertColumn = () => {
      const l: TableVO[] = generateData(20);

      data.value.splice(0, 0, ...l);
    };

    return {
      data,
      columns,
      insertColumn,
    };
  },
});
