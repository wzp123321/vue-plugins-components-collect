<template>
	<span @click="open">32321321321</span>
</template>

<script lang="ts" setup>
	import { getCurrentInstance, ref } from "vue";
	const instance = getCurrentInstance();
	let a = ref(1);
	console.log(321321);

	const open = () => {
		a.value++;
		if (a.value < 5) return;
		console.log(a.value);

		instance?.proxy?.$forceUpdate();
	};
</script>
