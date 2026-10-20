<template>
  <te-table-v2
    :columns="columns"
    :data="data"
    :width="700"
    :height="400"
    fixed
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

import type { Column } from '@tiansu/element-plus'

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
  },
]

const data = ref(Array.from({ length: 200 }).map(dataGenerator))
</script>
