<template>
  <div class="demo-progress">
    <te-progress type="circle" :percentage="0" />
    <te-progress type="circle" :percentage="25" />
    <te-progress type="circle" :percentage="100" status="success" />
    <te-progress type="circle" :percentage="70" status="warning" />
    <te-progress type="circle" :percentage="50" status="exception" />
  </div>
</template>
<style scoped>
.demo-progress .te-progress--line {
  margin-bottom: 15px;
  width: 350px;
}
.demo-progress .te-progress--circle {
  margin-right: 15px;
}
</style>
