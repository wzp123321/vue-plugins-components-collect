<template>
  <te-badge :value="12" class="item">
    <el-button>comments</el-button>
  </el-badge>
  <te-badge :value="3" class="item">
    <el-button>replies</el-button>
  </el-badge>
  <te-badge :value="1" class="item" type="primary">
    <el-button>comments</el-button>
  </el-badge>
  <te-badge :value="2" class="item" type="warning">
    <el-button>replies</el-button>
  </el-badge>

  <te-dropdown trigger="click">
    <span class="te-dropdown-link">
      Click Me
      <te-icon class="te-icon--right"><caret-bottom /></el-icon>
    </span>
    <template #dropdown>
      <el-dropdown-menu>
        <te-dropdown-item class="clearfix">
          comments
          <te-badge class="mark" :value="12" />
        </el-dropdown-item>
        <te-dropdown-item class="clearfix">
          replies
          <te-badge class="mark" :value="3" />
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
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
