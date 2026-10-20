<template>
	<div class="container">
		<te-layout-drag leftIconTop="15px">
			<template #left-top>
				<div class="content1"></div>
			</template>
			<template #right-bottom>
				<div style="word-break: break-all">
					<te-layout-drag mode="ver">
						<template #left-top>
							<div class="content2"></div>
						</template>
						<template #right-bottom>
							<div class="content3"></div>
						</template>
					</te-layout-drag>
				</div>
			</template>
		</te-layout-drag>
	</div>
</template>
<script lang="ts" setup>
	import { TeLayoutDrag } from "@ts-web-package/components/lib/te-layout-drag";
</script>

<style lang="less" scoped>
	.container {
		height: 600px;
	}
	.content1 {
		background: rgb(59, 160, 233);
	}

	.content2 {
		background: rgb(125, 188, 234);
	}

	.content3 {
		background: rgb(59, 160, 233);
	}

	div {
		height: 100%;
	}
</style>
