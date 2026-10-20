<template>
  <te-page-header>
    <template #breadcrumb>
      <te-breadcrumb separator="/">
        <te-breadcrumb-item :to="{ path: './page-header.html' }">
          homepage
        </te-breadcrumb-item>
        <te-breadcrumb-item
          ><a href="./page-header.html">route 1</a></te-breadcrumb-item
        >
        <te-breadcrumb-item>route 2</te-breadcrumb-item>
      </te-breadcrumb>
    </template>
    <template #content>
      <span class="text-large font-600 mr-3"> Title </span>
    </template>
  </te-page-header>
</template>
