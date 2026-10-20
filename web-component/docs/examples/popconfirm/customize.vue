<template>
	<te-popconfirm width="220" confirm-button-text="OK" cancle-button-text="No, Thanks" :icon="InfoFilled" icon-color="#626AEF" title="Are you sure to delete this?">
		<template #reference>
			<te-button>Delete</te-button>
		</template>
	</te-popconfirm>
</template>

<script setup lang="ts">
	import { InfoFilled } from "@element-plus/icons-vue";
</script>
