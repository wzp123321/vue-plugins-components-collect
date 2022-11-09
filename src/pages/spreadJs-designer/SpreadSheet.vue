<template>
  <div>
    <button @click="load($event)">加载</button>
    <button @click="update($event)">更新</button>
    <SpreadSheets v-on:workbookInitialized="workbookInitialized"></SpreadSheets>
  </div>
</template>

<script>
import SpreadSheets from '../../components/SpreadSheets.vue'
import { ref } from 'vue'
import axios from 'axios'
import GC from '@grapecity/spread-sheets'
import ExcelIO from '@grapecity/spread-excelio'

export default {
  name: 'App',
  components: {
    SpreadSheets,
  },
  setup() {
    axios.defaults.baseURL = 'http://localhost:8088'
    let workbook = undefined
    let templateJSON = undefined

    let workbookInitialized = (wb) => {
      workbook = wb
    }

    let load = (e) => {
      let formData = new FormData()
      formData.append('fileName', 'path')
      axios
        .post('spread/loadTemplate', formData, {
          responseType: 'json',
        })
        .then((response) => {
          if (response) {
            alert('加载成功')
            templateJSON = response.data
            workbook.fromJSON(templateJSON)
          }
        })
        .catch((response) => {
          alert('错误')
        })
    }

    let update = (e) => {
      let spreadJSON = JSON.stringify(workbook.toJSON())
      let formData = new FormData()
      formData.append('jsonString', spreadJSON)
      formData.append('fileName', 'fileName')
      axios
        .post('spread/updateTemplate', formData)
        .then((response) => {
          if (response) {
            alert('更新成功')
          }
        })
        .catch((response) => {
          alert('错误')
        })
    }

    return {
      workbookInitialized,
      load,
      update,
    }
  },
}
</script>
