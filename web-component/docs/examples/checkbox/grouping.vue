<template>
  <te-checkbox-group v-model="checkList">
    <te-checkbox label="Option A" />
    <te-checkbox label="Option B" />
    <te-checkbox label="Option C" />
    <te-checkbox label="disabled" disabled />
    <te-checkbox label="selected and disabled" disabled />
  </te-checkbox-group>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const checkList = ref(['selected and disabled', 'Option A'])
</script>
