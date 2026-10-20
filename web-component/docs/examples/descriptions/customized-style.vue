<template>
  <te-descriptions title="Customized style list" :column="3" border>
    <te-descriptions-item
      label="Username"
      label-align="right"
      align="center"
      label-class-name="my-label"
      class-name="my-content"
      width="150px"
      >kooriookami</te-descriptions-item
    >
    <te-descriptions-item label="Telephone" label-align="right" align="center"
      >18100000000</te-descriptions-item
    >
    <te-descriptions-item label="Place" label-align="right" align="center"
      >Suzhou</te-descriptions-item
    >
    <te-descriptions-item label="Remarks" label-align="right" align="center">
      <te-tag size="small">School</te-tag>
    </te-descriptions-item>
    <te-descriptions-item label="Address" label-align="right" align="center"
      >No.1188, Wuzhong Avenue, Wuzhong District, Suzhou, Jiangsu
      Province</te-descriptions-item
    >
  </te-descriptions>
</template>
<style scoped>
.my-label {
  background: var(--te-color-success-light-9);
}
.my-content {
  background: var(--te-color-danger-light-9);
}
</style>
