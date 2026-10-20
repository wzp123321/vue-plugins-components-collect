<template>
  <div>
    <te-link :underline="false">Without Underline</te-link>
    <te-link>With Underline</te-link>
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
