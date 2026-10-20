<template>
  <te-dropdown size="large" split-button type="primary">
    Large
    <template #dropdown>
      <te-dropdown-menu>
        <te-dropdown-item>Action 1</te-dropdown-item>
        <te-dropdown-item>Action 2</te-dropdown-item>
        <te-dropdown-item>Action 3</te-dropdown-item>
        <te-dropdown-item>Action 4</te-dropdown-item>
      </te-dropdown-menu>
    </template>
  </te-dropdown>

  <te-dropdown split-button type="primary">
    Default
    <template #dropdown>
      <te-dropdown-menu>
        <te-dropdown-item>Action 1</te-dropdown-item>
        <te-dropdown-item>Action 2</te-dropdown-item>
        <te-dropdown-item>Action 3</te-dropdown-item>
        <te-dropdown-item>Action 4</te-dropdown-item>
      </te-dropdown-menu>
    </template>
  </te-dropdown>

  <te-dropdown size="small" split-button type="primary">
    Small
    <template #dropdown>
      <te-dropdown-menu>
        <te-dropdown-item>Action 1</te-dropdown-item>
        <te-dropdown-item>Action 2</te-dropdown-item>
        <te-dropdown-item>Action 3</te-dropdown-item>
        <te-dropdown-item>Action 4</te-dropdown-item>
      </te-dropdown-menu>
    </template>
  </te-dropdown>
</template>
<style scoped>
.example-showcase .te-dropdown + .te-dropdown {
  margin-left: 15px;
}
</style>
