<template>
	<div class="layout-one-content-wrap">
		<slot>
			<router-view v-slot="scope" v-if="freshKey">
				<transition name="fade-transform" mode="out-in">
					<keep-alive :include="keepAlives">
						<component :is="scope?.Component" :key="computedKey(scope?.route)" />
					</keep-alive>
				</transition>
			</router-view>
		</slot>
	</div>
</template>
<script lang="ts" setup>
	import { ref, nextTick } from "vue";
	import type { LayoutContentProps } from "./types";
	// 用于刷新的key
	const freshKey = ref(true);
	const computedKey = (route?) => {
		const meta = route?.meta;
		const key = meta?.key ?? route?.path;
		return key;
	};
	/**
	 * 刷新当前组件
	 */
	const refreCurrentComponent = () => {
		freshKey.value = false;
		nextTick(() => {
			freshKey.value = true;
		});
	};

	withDefaults(defineProps<LayoutContentProps>(), {
		keepAlives: () => [],
	});
	defineExpose({
		refreCurrentComponent,
	});
</script>

<style scoped lang="scss">
	.layout-one-content-wrap,
	.Layout-one-content-root {
		background: var(--te-bg-color);
		height: 100%;
		padding: var(--te-space-20);
		overflow: auto;
		box-sizing: border-box;
		overflow-x: hidden;
	}

	/* fade-transform */
	.fade-transform-leave-active,
	.fade-transform-enter-active {
		transition: all 0.5s;
	}

	.fade-transform-enter {
		opacity: 0;
		transform: translateX(-30px);
	}

	.fade-transform-leave-to {
		opacity: 0;
		transform: translateX(30px);
	}
</style>
