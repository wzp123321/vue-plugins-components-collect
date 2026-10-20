<template>
  <te-table-v2
    :columns="columns"
    :data="data"
    :row-class="rowClass"
    :width="700"
    :height="400"
  />
</template>

<script lang="tsx" setup>
import { ref } from 'vue'
import dayjs from 'dayjs'
import {
  TeButton,
  TeIcon,
  TeTag,
  TeTooltip,
  TableV2FixedDir,
} from '@tiansu/element-plus'
import { Timer } from '@element-plus/icons-vue'

import type { Column, RowClassNameGetter } from '@tiansu/element-plus'

let id = 0

const dataGenerator = () => ({
  id: `random-id-${++id}`,
  name: 'Tom',
  date: '2020-10-1',
})

const columns: Column<any>[] = [
  {
    key: 'date',
    title: 'Date',
    dataKey: 'date',
    width: 150,
    fixed: TableV2FixedDir.LEFT,
    cellRenderer: ({ cellData: date }) => (
      <TeTooltip content={dayjs(date).format('YYYY/MM/DD')}>
        {
          <span class="flex items-center">
            <TeIcon class="mr-3">
              <Timer />
            </TeIcon>
            {dayjs(date).format('YYYY/MM/DD')}
          </span>
        }
      </TeTooltip>
    ),
  },
  {
    key: 'name',
    title: 'Name',
    dataKey: 'name',
    width: 150,
    align: 'center',
    cellRenderer: ({ cellData: name }) => <TeTag>{name}</TeTag>,
  },
  {
    key: 'operations',
    title: 'Operations',
    cellRenderer: () => (
      <>
        <TeButton size="small">Edit</TeButton>
        <TeButton size="small" type="danger">
          Delete
        </TeButton>
      </>
    ),
    width: 150,
    align: 'center',
    flexGrow: 1,
  },
]

const data = ref(Array.from({ length: 200 }).map(dataGenerator))

const rowClass = ({ rowIndex }: Parameters<RowClassNameGetter<any>>[0]) => {
  if (rowIndex % 10 === 5) {
    return 'bg-red-100'
  } else if (rowIndex % 10 === 0) {
    return 'bg-blue-200'
  }
  return ''
}
</script>
