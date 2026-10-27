<template>
	<button @click="send">发送</button>
</template>

<script lang="ts">
	import { defineComponent, provide } from "vue";
	import { createStorage, TENANT_INFO_KEY, webScoketInit, messageSend } from "@zpackage/tools";
	// import { createStorage, TENANT_INFO_KEY } from "@zpackage/tools";
	import { stoageKey } from "./utils";
	const stoage = createStorage("sessionStorage");
	console.log(TENANT_INFO_KEY);

	export default defineComponent({
		name: "App",
		setup() {
			webScoketInit({
				url: "ws://localhost:8282",
				onmessage(msg) {
					console.log("msg", JSON.parse(msg.data));
				},
			});
			const send = () => {
				messageSend({
					a: 111,
				});
			};

			provide(stoageKey, stoage);
			return {
				send,
			};
		},
	});
</script>

<style>
	#app {
		font-family: Avenir, Helvetica, Arial, sans-serif;
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
		text-align: center;
		color: #2c3e50;
		margin-top: 60px;
	}
</style>
