<template>
  <te-badge :value="12" class="item">
    <te-button>comments</te-button>
  </te-badge>
  <te-badge :value="3" class="item">
    <te-button>replies</te-button>
  </te-badge>
  <te-badge :value="1" class="item" type="primary">
    <te-button>comments</te-button>
  </te-badge>
  <te-badge :value="2" class="item" type="warning">
    <te-button>replies</te-button>
  </te-badge>

  <te-dropdown trigger="click">
    <span class="te-dropdown-link">
      Click Me
      <te-icon class="te-icon--right"><caret-bottom /></te-icon>
    </span>
    <template #dropdown>
      <te-dropdown-menu>
        <te-dropdown-item class="clearfix">
          comments
          <te-badge class="mark" :value="12" />
        </te-dropdown-item>
        <te-dropdown-item class="clearfix">
          replies
          <te-badge class="mark" :value="3" />
        </te-dropdown-item>
      </te-dropdown-menu>
    </template>
  </te-dropdown>
</template>

<script lang="ts" setup>
import { CaretBottom } from '@element-plus/icons-vue'
</script>

<style scoped>
.item {
  margin-top: 10px;
  margin-right: 40px;
}

.te-dropdown {
  margin-top: 1.1rem;
}
</style>
