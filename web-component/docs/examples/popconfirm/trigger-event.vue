<template>
	<te-popconfirm confirm-button-text="Yes" cancle-button-text="No" :icon="InfoFilled" icon-color="#626AEF" title="Are you sure to delete this?" @confirm="confirmEvent" @cancel="cancelEvent">
		<template #reference>
			<te-button>Delete</te-button>
		</template>
	</te-popconfirm>
</template>

<script setup lang="ts">
	import { InfoFilled } from "@element-plus/icons-vue";

	const confirmEvent = () => {
		console.log("confirm!");
	};
	const cancelEvent = () => {
		console.log("cancel!");
	};
</script>
