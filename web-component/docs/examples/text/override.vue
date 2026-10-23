<template>
  <te-space direction="vertical">
    <el-text>span</el-text>
    <te-text tag="p">This is a paragraph.</el-text>
    <te-text tag="b">Bold</el-text>
    <te-text tag="i">Italic</el-text>
    <el-text>
      This is
      <te-text tag="sub" size="small">subscript</el-text>
    </el-text>
    <el-text>
      This is
      <te-text tag="sup" size="small">superscript</el-text>
    </el-text>
    <te-text tag="ins">Inserted</el-text>
    <te-text tag="del">Deleted</el-text>
    <te-text tag="mark">Marked</el-text>
  </te-space>
</template>
