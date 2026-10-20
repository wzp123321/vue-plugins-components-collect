<template>
	<te-select-sub-content
		clearable
		:placeholder="'请选择人员'"
		:selectOptions="testOptions"
		v-model="testValue"
		style="width: 300px"
		:propsMap="{
			id: 'id',
			label: 'name',
			subTextArr: 'path',
		}"
		@remoteMethod="testRemoteMethod">
	</te-select-sub-content>
</template>
<script setup lang="ts">
	import { TeSelectSubContent } from "@ts-web-package/components/lib/te-select-sub-content";
	import { ref, onMounted } from "vue";
	const testValue = ref("");
	const testOptions = ref<any>([]);

	onMounted(() => {
		testRemoteMethod();
	});

	const testRemoteMethod = () => {
		testOptions.value = [
			{
				id: "1000238794253616",
				name: "测试部门数据cll",
				path: ["台州市中心医院", "测试部门数据cll"],
			},
		];
	};
</script>
<script lang="ts">
	export default {
		name: "te-select-sub-content-demo",
	};
</script>
<style scoped lang="scss"></style>
