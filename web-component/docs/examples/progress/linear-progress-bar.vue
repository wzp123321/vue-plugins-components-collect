<template>
  <div class="demo-progress">
    <te-progress :percentage="50" />
    <te-progress :percentage="100" :format="format" />
    <te-progress :percentage="100" status="success" />
    <te-progress :percentage="100" status="warning" />
    <te-progress :percentage="50" status="exception" />
  </div>
</template>

<script lang="ts" setup>
const format = (percentage) => (percentage === 100 ? 'Full' : `${percentage}%`)
</script>

<style scoped>
.demo-progress .te-progress--line {
  margin-bottom: 15px;
  width: 350px;
}
</style>
