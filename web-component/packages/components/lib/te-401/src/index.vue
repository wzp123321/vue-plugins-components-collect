<template>
	<div class="no-auth-container">
		<te-empty description="您的账号暂未开通此应用的相关权限" :image="ImgUrl"> </el-empty>
	</div>
</template>

<script lang="ts" setup>
	import { TeEmpty } from "element-plus";
	import ImgUrl from "./img/empty.png";
</script>

<style scoped lang="scss">
	.no-auth-container {
		width: 100%;
		height: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
	}
</style>
