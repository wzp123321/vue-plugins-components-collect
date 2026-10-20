<template>
  <div class="demo-progress">
    <te-progress :text-inside="true" :stroke-width="26" :percentage="70" />
    <te-progress
      :text-inside="true"
      :stroke-width="24"
      :percentage="100"
      status="success"
    />
    <te-progress
      :text-inside="true"
      :stroke-width="22"
      :percentage="80"
      status="warning"
    />
    <te-progress
      :text-inside="true"
      :stroke-width="20"
      :percentage="50"
      status="exception"
    />
  </div>
</template>

<style scoped>
.demo-progress .te-progress--line {
  margin-bottom: 15px;
  width: 350px;
}
</style>
