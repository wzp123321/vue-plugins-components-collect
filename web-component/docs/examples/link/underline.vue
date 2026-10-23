<template>
  <div>
    <te-link :underline="false">Without Underline</el-link>
    <el-link>With Underline</el-link>
  </div>
</template>
<style scoped>
.te-link {
  margin-right: 8px;
}
.te-link .te-icon--right.te-icon {
  vertical-align: text-bottom;
}
</style>
