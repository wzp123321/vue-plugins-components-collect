<template>
  <div>
    <div m="b-2">
      <te-checkbox v-model="config.autoInsertSpace"
        >autoInsertSpace</te-checkbox
      >
    </div>

    <te-config-provider :button="config">
      <te-button>中文</te-button>
    </te-config-provider>
  </div>
</template>

<script lang="ts" setup>
import { reactive } from 'vue'

const config = reactive({
  autoInsertSpace: true,
})
</script>
