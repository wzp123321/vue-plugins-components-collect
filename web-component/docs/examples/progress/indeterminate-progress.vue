<template>
  <div class="demo-progress">
    <te-progress :percentage="50" :indeterminate="true" />
    <te-progress :percentage="100" :format="format" :indeterminate="true" />
    <te-progress
      :percentage="100"
      status="success"
      :indeterminate="true"
      :duration="5"
    />
    <te-progress
      :percentage="100"
      status="warning"
      :indeterminate="true"
      :duration="1"
    />
    <te-progress :percentage="50" status="exception" :indeterminate="true" />
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
