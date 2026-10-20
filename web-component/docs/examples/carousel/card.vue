<template>
	<te-carousel :interval="4000" type="card" height="200px">
		<te-carousel-item v-for="item in 6" :key="item">
			<h3 text="2xl" justify="center">{{ item }}</h3>
		</te-carousel-item>
	</te-carousel>
</template>

<style scoped>
	.te-carousel__item h3 {
		color: #475669;
		opacity: 0.75;
		line-height: 200px;
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
