<template>
	<div>
		<DragComponent mode="hor" leftIconTop="15px">
			<template #left-top>
				<div class="content1"></div>
			</template>
			<template #right-bottom>
				<div>
					<DragComponent mode="ver">
						<template #left-top>
							<div class="content2"></div>
						</template>
						<template #right-bottom>
							<div class="content3"></div>
						</template>
					</DragComponent>
				</div>
			</template>
		</DragComponent>
	</div>
</template>
<script lang="ts">
	import { defineComponent } from "vue";
	import DragComponent from "./index.vue";
	export default defineComponent({
		name: "",
		components: {
			DragComponent,
		},
		setup() {
			return {};
		},
	});
</script>

<style lang="less" scoped>
	.content1 {
		background: red;
	}

	.content2 {
		background: yellow;
	}

	.content3 {
		background: blue;
	}

	div {
		height: 100%;
	}
</style>
