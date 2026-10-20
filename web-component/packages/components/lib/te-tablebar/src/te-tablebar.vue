<template>
	<div class="te-tablebar">
		<div class="tlws-header">
			<div class="header">
				<slot name="header"></slot>
			</div>
			<div v-if="$slots.input">
				<slot name="input"></slot>
			</div>
			<div v-else>
				<te-search class="searchInput" v-bind="$attrs" v-model="searchValue" @input="valueInput" />
			</div>
			<div class="tlws-header-more" v-if="!hiddenMoreSearch">
				<div class="tlws-header-more-btn" :class="{ 'tlws-header-more-btn-spread': isSpread }" @click="changeSpreadStatus">
					<span class="tit">更多搜索</span>
					<te-icon :style="{ transform: isSpread ? 'rotate(90deg)' : 'rotate(-90deg)' }">
						<d-arrow-left />
					</te-icon>
				</div>
				<div class="tlws-header-more-divider" v-if="isSpread"></div>
			</div>
			<slot name="suffix"></slot>
			<div class="tlws-header-refresh" @click="onRefresh">
				<te-icon><refresh-right /></te-icon>
			</div>
		</div>
		<transition>
			<div class="tlws-form" v-show="isSpread">
				<div class="tlws-form-con" ref="searchFormContainer">
					<slot name="searchList"></slot>
				</div>
				<div class="tlws-form-divider"></div>
				<div :class="tlwsFormBtnsIsColumn ? 'tlws-form-btns-column' : 'tlws-form-btns-row'">
					<te-button type="primary" @click="onQuery">查询</te-button>
					<te-button @click="onReset">重置</te-button>
				</div>
			</div>
		</transition>

		<div>
			<slot name="footer"> </slot>
		</div>
	</div>
</template>
<script lang="ts" setup>
	import { ref, Ref, nextTick, onUpdated, watch } from "vue";
	import { TeIcon, TeButton } from "@tiansu/element-plus";
	import { DArrowLeft, RefreshRight } from "@element-plus/icons-vue";
	import { TeSearch } from "../../te-search";

	const emits = defineEmits(["onQuery", "onReset", "onRefresh", "update:modelValue", "input"]);

	interface Props {
		modelValue: string;
		hiddenMoreSearch: boolean;
		hiddenSearchInput: boolean;
	}

	const props = withDefaults(defineProps<Props>(), {
		modelValue: "",
	});

	/**
	 * 展开true 收起false
	 */
	const isSpread = ref<boolean>(false);

	/**
	 * 搜索结果容器
	 */
	const searchFormContainer: Ref<HTMLElement | undefined> = ref();

	/**
	 * 查询、重置操作按钮是否垂直布局
	 */
	const tlwsFormBtnsIsColumn = ref(true);

	/**
	 * 查询、重置操作按钮垂直布局高度阈值
	 */
	const formBtnsColumnHeight = 50;

	onUpdated(() => {
		nextTick(() => {
			if (searchFormContainer.value?.children != null && isSpread.value) {
				// 搜索结果容器插槽高度
				let slotHeight = 0;
				for (const item of searchFormContainer.value?.children) {
					slotHeight += item.clientHeight;
				}
				tlwsFormBtnsIsColumn.value = slotHeight > formBtnsColumnHeight;
			}
		});
	});

	/**
	 *@description: 更改更多搜索展示、收起状态
	 *@date: 2023-06-05 14:15:16
	 */
	const changeSpreadStatus = () => {
		isSpread.value = !isSpread.value;
	};

	/**
	 *@description:查询
	 *@date: 2023-06-05 14:14:17
	 */
	const onQuery = () => {
		emits("onQuery");
	};

	/**
	 *@description:重置
	 *@date: 2023-06-05 14:14:17
	 */
	const onReset = () => {
		emits("onReset");
	};

	/**
	 *@description:刷新
	 *@date: 2023-06-05 14:14:38
	 */
	const onRefresh = () => {
		emits("onRefresh");
	};

	const searchValue = ref("");

	watch(
		() => props.modelValue,
		(val) => {
			searchValue.value = val;
		},
		{ deep: true, immediate: true }
	);

	const valueInput = (value: any) => {
		emits("update:modelValue", value);
		emits("input", value);
	};
</script>
<style lang="less" scoped>
	.te-tablebar {
		.tlws-header {
			display: flex;
			gap: 12px;
			height: 32px;

			.header {
				flex: 1;
			}

			.tlws-header-more {
				margin-left: auto;

				.tlws-header-more-btn {
					height: 32px;
					line-height: 32px;
					padding: 0 20px;
					min-width: 120px;
					border-radius: 4px;
					border: 1px solid rgba(220, 223, 230, 1);
					font-size: 14px;
					box-sizing: border-box;
					color: rgba(96, 98, 102, 1);
					cursor: pointer;

					span {
						padding-right: 8px;
						user-select: none;
						position: relative;
						top: -1px;
					}

					i {
						top: 1px;
					}
				}

				.tlws-header-more-btn:active {
					color: var(--te-color-primary) !important;
					border-color: var(--te-color-primary) !important;
					border-radius: 4px;
				}

				.tlws-header-more-btn:hover {
					color: var(--te-color-primary);
					border-color: var(--te-color-primary-light-7);
					background-color: var(--te-color-primary-light-9);
					outline: 0;
					border-radius: 4px;
				}

				.tlws-header-more-btn-spread {
					background-color: rgba(245, 245, 245, 1);
					border: 1px solid rgba(245, 245, 245, 1);
					border-radius: 4px 4px 0 0;
				}

				.tlws-header-more-divider {
					height: 8px;
					background: rgba(0, 0, 0, 0.04);
				}
			}

			.tlws-header-refresh {
				width: 32px;
				height: 32px;
				display: flex;
				align-items: center;
				cursor: pointer;
				box-sizing: border-box;
				border-radius: 4px;
				border: 1px solid rgba(220, 223, 230, 1);
				background: rgba(255, 255, 255, 1);

				i {
					margin: 0 auto;
					color: rgb(96, 98, 102);
				}
			}

			.tlws-header-refresh:hover {
				color: var(--te-color-primary);
				border-color: var(--te-color-primary-light-7);
				background-color: var(--te-color-primary-light-9);
				outline: 0;

				i {
					color: var(--te-color-primary);
				}
			}
			.tlws-header-refresh:active {
				border: 1px solid var(--te-color-primary);
				color: var(--te-color-primary);
			}
		}
		.tlws-form {
			width: 100%;
			display: flex;
			box-sizing: border-box;
			background-color: rgba(0, 0, 0, 0.04);
			padding: 20px 0;
			margin-top: 8px;

			.tlws-form-con {
				flex: 1;
			}

			.tlws-form-divider {
				width: 1px;
				margin: 0;
				background: rgba(0, 0, 0, 0.08);
			}

			.tlws-form-btns-column {
				display: flex;
				flex-direction: column;
				align-items: center;
				align-self: center;
				box-sizing: border-box;
				padding: 0 24px 0 24px;

				button:last-child {
					margin-top: 24px;
					margin-left: 0;
				}
			}

			.tlws-form-btns-row:extend(.tlws-form-btns-column) {
				flex-direction: row;
				padding: 0 24px 0 24px;
				display: flex;
				align-items: center;

				button:last-child {
					margin-left: 16px;
				}
			}
		}

		// /* 进入之前和离开后的样式 */
		.v-enter-from,
		.v-leave-to {
			opacity: 0;
		}

		/* 离开和进入过程中的样式 */
		.v-enter-active {
			/* 添加过渡动画 */
			transition: opacity 0.2s ease;
		}

		/* 进入之后和离开之前的样式 */
		.v-enter-to,
		.v-leave-from {
			opacity: 1;
		}
	}

	.searchInput {
		width: 280px;
	}
	.default-footer {
		height: 8px;
	}
</style>
