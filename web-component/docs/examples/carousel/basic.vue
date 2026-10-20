<template>
	<div class="block text-center">
		<span class="demonstration">Switch when indicator is hovered (default)</span>
		<te-carousel height="150px">
			<te-carousel-item v-for="item in 4" :key="item">
				<h3 class="small justify-center" text="2xl">{{ item }}</h3>
			</te-carousel-item>
		</te-carousel>
	</div>
	<div class="block text-center" m="t-4">
		<span class="demonstration">Switch when indicator is clicked</span>
		<te-carousel trigger="click" height="150px">
			<te-carousel-item v-for="item in 4" :key="item">
				<h3 class="small justify-center" text="2xl">{{ item }}</h3>
			</te-carousel-item>
		</te-carousel>
	</div>
</template>

<style scoped>
	.demonstration {
		color: var(--te-text-color-secondary);
	}

	.te-carousel__item h3 {
		color: #475669;
		opacity: 0.75;
		line-height: 150px;
		margin: 0;
		text-align: center;
	}

	.te-carousel__item:nth-child(2n) {
		background-color: #99a9bf;
	}

	.te-carousel__item:nth-child(2n + 1) {
		background-color: #d3dce6;
	}
</style>
