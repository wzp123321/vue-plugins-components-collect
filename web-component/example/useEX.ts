import { ref, readonly } from "vue";

export default () => {
	const counter = ref(1);
	return {
		counter: readonly(counter),
	};
};
