<template>
	<div class="filter-header">
		<span>{{ column.label }}</span>
		<te-popover ref="filterPop" popper-class="popover-headerFilter" placement="bottom-end" :width="'auto'" trigger="click" @hide="hide">
			<template #reference>
				<div class="filter-area">
					<img class="filter" v-if="checkedFilterItem.length > 0" style="transform: translate(0, -2px); cursor: pointer; margin-left: 4px" src="./../assets/img/filter-filled-active.svg" alt="筛选" />
					<img
						class="filter"
						v-else
						:style="{ color: checkedFilterItem.length > 0 ? '#0e6dfa' : '#909399' }"
						style="transform: translate(0, -2px); cursor: pointer; margin-left: 4px"
						src="./../assets/img/filter-filled.svg"
						alt="筛选" />
				</div>
			</template>

			<div v-if="filterList.length > 0">
				<te-checkbox v-if="filterList.length > 5" v-model="checkAll" :indeterminate="isIndeterminate" @change="handleCheckAllChange">全选</el-checkbox>

				<div class="divider" v-if="filterList.length > 9"></div>

				<div class="wrap-div" :class="filterList.length > 5 ? 'wrap1' : 'wrap2'">
					<te-checkbox-group v-model="checkedFilterItem" @change="handlecheckedFilterItemChange">
						<te-checkbox v-for="item in filterList" :key="item.id" :label="item.id">{{ item.name }}</el-checkbox>
					</el-checkbox-group>
				</div>

				<div class="filter-action" v-if="filterList.length > 0">
					<!-- 添加动态class用于重置时清除筛选条件 -->
					<te-button @click="reset" text>重置</el-button>
					<te-button @click="confirm" :disabled="checkedFilterItem.length === 0" type="primary" text>确定</el-button>
				</div>
			</div>
			<div class="noData" v-else>
				<span>暂无筛选项</span>
			</div>
		</el-popover>
	</div>
</template>
<script lang="tsx" setup name="FilterHeader">
	import { watch, ref, inject } from "vue";
	interface FilterObjType {
		key: string; // 当前筛选列对应的prop
		value: string[]; // 选中的值
	}

	// 弹窗ref
	const filterPop = ref<any>();

	// 判断是否操作过选项决定是否刷新列表
	const selectChanged = ref<boolean>(false);

	const props = defineProps({
		filterList: {
			type: Object,
			default: () => {
				return [];
			},
		},
		column: {
			type: Object,
			default: () => {
				return {};
			},
		},
	});

	const filterList = ref<any>();
	const column = ref<any>();
	const checkAll = ref(false);
	const isIndeterminate = ref(false);
	const checkedFilterItem = ref<string[]>([]);

	const handleCheckAllChange = (val: boolean) => {
		checkedFilterItem.value = val
			? filterList.value.map((item: any) => {
					return item.id;
			  })
			: [];
		isIndeterminate.value = false;
		selectChanged.value = true;
	};

	const handlecheckedFilterItemChange = (value: string[]) => {
		const checkedCount = value.length;
		checkAll.value = checkedCount === filterList.value.length;
		isIndeterminate.value = checkedCount > 0 && checkedCount < filterList.value.length;
		selectChanged.value = true;
	};

	const sendFilterData: any = inject("sendFilterData");

	/**
	 * @description 确定, 传值并关闭pop
	 */
	const confirm = () => {
		filterPop.value?.hide();
	};

	/**
	 * @description 重置, 传值并关闭pop
	 */
	const reset = () => {
		checkAll.value = false;
		isIndeterminate.value = false;
		checkedFilterItem.value = [];
		selectChanged.value = true;
		filterPop.value?.hide();
	};

	/**
	 * @description 隐藏时传递数据
	 */
	const hide = () => {
		sendData();
		selectChanged.value = false;
	};

	/**
	 * @description 传递数据方法
	 */
	const sendData = () => {
		selectChanged.value &&
			filterList.value.length > 0 &&
			sendFilterData({
				key: column.value.filterProp || column.value.prop,
				value: checkedFilterItem.value,
			} as FilterObjType);
	};

	watch(
		() => props.filterList,
		(val) => {
			filterList.value = JSON.parse(JSON.stringify(val));

			filterList.value.forEach((item: any) => {
				if (item?.checked) {
					checkedFilterItem.value.push(item.id);
				}
			});
		},
		{ deep: true, immediate: true }
	);

	watch(
		() => props.column,
		(val) => {
			column.value = val;
		},
		{ deep: true, immediate: true }
	);
</script>

<style lang="less">
	.popover-headerFilter {
		padding: 8px 0 !important;
		max-width: 188px;

		.te-checkbox {
			height: 32px;
			line-height: 32px;
			padding: 0 20px;
			display: block;

			.te-checkbox__label {
				overflow: hidden;
				white-space: nowrap;
				text-overflow: ellipsis;
				max-width: 138px;
			}
		}

		.divider {
			height: 1px;
			width: 100%;
			background-color: var(--te-border-color-divider);
		}

		.wrap-div {
			display: flex;
			flex-direction: column;
			max-height: 288px;
			overflow-y: scroll;
			overflow-x: hidden;
		}

		.wrap1 {
			padding-left: 10px;
		}

		.filter-action {
			padding-top: 8px;
			border-top: 1px solid var(--te-border-color-divider);
			text-align: center;
		}

		.noData {
			text-align: center;
			color: var(--te-text-color-palceholder);
		}
	}
</style>

<style lang="less" scoped>
	.filter-header {
		display: inline-block;
		.filter-area {
			width: 20px;
			height: 20px;
			display: inline-block;
			.filter {
				vertical-align: middle;
			}
		}
	}
</style>
