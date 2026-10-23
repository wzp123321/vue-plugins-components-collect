<template>
  <te-text class="w-100px" truncated>Self element set width 100px</el-text>
  <el-row>
    <te-col :span="4">
      <te-text truncated>Squeezed by parent element</el-text>
    </el-col>
  </el-row>
</template>
