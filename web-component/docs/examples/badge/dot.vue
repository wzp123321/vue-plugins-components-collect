<template>
	<te-badge is-status class="item" type="data1">query</el-badge>
	<te-badge is-dot class="item">
		<te-button class="share-button" :icon="Share" type="primary" />
	</el-badge>
</template>

<script lang="ts" setup>
	import { Share } from "@element-plus/icons-vue";
</script>

<style scoped>
	.item {
		margin-top: 10px;
		margin-right: 40px;
	}
</style>
