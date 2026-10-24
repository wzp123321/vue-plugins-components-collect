<!--
 * @Author: 钱胜华 qiansh@tiansu-china.com
 * @Date: 2024-02-26 16:04:50
 * @LastEditors: 钱胜华 qiansh@tiansu-china.com
 * @LastEditTime: 2024-03-21 13:45:16
 * @FilePath: \ts-web-package\packages\components\lib\te-dynamic-table\src\index.vue
 * @Description: 动态编辑表格组件
-->
<script setup lang="ts">
	import { TeForm, ElTable, TeTableColumn, TeFormItem, ElInput, ElInputNumber, ElDatePicker, ElSelect, ElOption, ElButton, ElIcon, ElTooltip, ElText } from "element-plus";
	import { Plus } from "@element-plus/icons-vue";
	import { ref, toRefs, watchSyncEffect, watch, watchEffect, watchPostEffect } from "vue";
	import { MODE, DynamicTableProps, TABLE_SIZE, EditType } from "./type";
	import { useDynamicTable } from "./hooks/useDynamicTable";

	// 属性与方法
	const props = withDefaults(defineProps<DynamicTableProps>(), {
		modelValue: [] as any,
		mode: MODE.EDIT,
		tableSize: TABLE_SIZE.LARGE,
		required: true,
		showIndex: false,
    showDragRow: false,
	});

	const emits = defineEmits(["update:modelValue", "addRow", "deleteRow"]);

	const { columns, mode, tableSize, showIndex, showDragRow } = toRefs(props);

	// 添加的数据是否达到了最大值
	const reachedMaxCount = ref<boolean>(false);
	const { formData, editFormRef, tableRef, tableHeight, dynamicStyle, refreshKey, handleAdd, handleDelete, resetTable, validateData, isColumnRequired } = useDynamicTable({ props, emits });

	watch(
		() => props.modelValue,
		(tableData) => {
			// 如果外部传入的数组为空，但又具有required属性的，还是要保留一行不可删除
			if (tableData.length === 0 && props.required) {
				editFormRef.value?.resetFields();
				formData.tableData = [{}];
			} else {
				formData.tableData = tableData;
			}
			emits("update:modelValue", formData.tableData);
		},
		{
			immediate: true,
		}
	);

	watchSyncEffect(() => {
		console.log(2);
		if (props.maxCount && formData.tableData?.length >= props.maxCount) {
			reachedMaxCount.value = true;
		} else {
			reachedMaxCount.value = false;
		}
	});

	defineExpose({
		editFormRef,
		tableRef,
		resetTable,
		validateData,
	});
</script>

<template>
	<section class="te-dynamic-table">
		<te-form :model="formData" ref="editFormRef">
			<te-table ref="tableRef" v-bind="$attrs" :data="formData.tableData" :border="true" :size="tableSize ?? TABLE_SIZE.DEFAULT" :maxHeight="tableHeight" :style="dynamicStyle" :key="refreshKey">
				<template v-if="mode === MODE.EDIT">
					<te-table-column type="sort" width="46" fixed="left" v-if="showDragRow" />
					<te-table-column type="index" width="69" label="序号" fixed="left" v-if="showIndex" />
					<te-table-column v-for="item in columns" :label="item.label" v-bind="item?.columnAttrs">
						<!-- 自定义头部，必填项前设置小红点 -->
						<template #header>
							<span class="column-header" :class="isColumnRequired(item.rules) ? 'is-required' : ''">
								{{ item.label }}
							</span>
							<!-- 头部插槽 -->
							<slot :name="`header-${item.prop}`"></slot>
						</template>
						<template #default="scope">
							<te-form-item :prop="`tableData.${scope.$index}.${item.prop}`" :rules="item?.rules" :key="item.key">
								<!-- 文本输入框 -->
								<te-input v-if="item.type === EditType.INPUT" class="cell-item" v-bind="item?.elementAttrs" v-model="scope.row[item.prop]" />

								<!-- 数字输入框 -->
								<te-input-number v-else-if="item.type === EditType.INPUT_NUMBER" class="cell-item" v-bind="item?.elementAttrs" v-model="scope.row[item.prop]" />

								<!-- 日期时间选择器 -->
								<te-date-picker v-else-if="item.type === EditType.DATA_PICKER" class="cell-item" v-bind="item?.elementAttrs" v-model="scope.row[item.prop]" />

								<!-- 下拉框 -->
								<te-select v-else-if="item.type === EditType.SELECT" class="cell-item" v-model="scope.row[item.prop]" v-bind="item?.elementAttrs">
									<te-option v-for="data in item?.dataSource" :key="data.value" :value="data.value" :label="data.label" />
								</el-select>

								<!-- slot方式自定义渲染 -->
								<slot v-else-if="item.type === EditType.SLOT" :name="item.prop" v-bind="scope" :key="item.prop"> </slot>

								<!-- 其他类型的type，直接渲染文字 -->
								<te-text v-else>
									{{ scope.row[item.prop] }}
								</el-text>
							</el-form-item>
						</template>
					</el-table-column>

					<!-- 操作列 -->
					<te-table-column width="76" label="操作" fixed="right">
						<template #default="scope">
							<te-button link type="primary" @click="handleDelete(scope)" :disabled="formData.tableData.length === 1 && required"> 删除 </el-button>
						</template>
					</el-table-column>
				</template>

				<!-- 预览模式可自定义渲染内容 -->
				<template v-else>
					<te-table-column v-for="item in columns" :key="item.prop" :prop="item.prop" :label="item.label" v-bind="item?.columnAttrs">
						<template #default="scope">
							<slot :name="item.prop" v-bind="scope" :key="item.prop">
								{{ scope.row[item.prop] }}
							</slot>
						</template>
					</el-table-column>
				</template>

				<!-- 6、空数据文本默认插槽 -->
				<template #empty>
					<div class="table-empty">
						<slot name="empty">
							<img src="../assets/img/no-data.svg" alt="暂无数据" />
							<div>暂无数据</div>
						</slot>
					</div>
				</template>
			</el-table>
		</el-form>
		<!-- 达到最大添加限制时不允许添加并提示 -->
		<template v-if="reachedMaxCount">
			<te-tooltip placement="top">
				<template #content v-if="reachedMaxCount"> 「最多添加{{ maxCount }}条数据」 </template>
				<te-button v-if="mode === MODE.EDIT" class="add-button" :size="tableSize ?? TABLE_SIZE.LARGE" disabled>
					<el-icon>
						<Plus />
					</el-icon>
					<span class="add-button-text">添加</span>
				</el-button>
			</el-tooltip>
		</template>
		<template v-else>
			<te-button v-if="mode === MODE.EDIT" @click="handleAdd" class="add-button" :size="tableSize ?? TABLE_SIZE.LARGE" :disabled="reachedMaxCount">
				<el-icon>
					<Plus />
				</el-icon>
				<span class="add-button-text">添加</span>
			</el-button>
		</template>
	</section>
</template>

<style scoped lang="scss">
	:deep(.te-form-item) {
		height: 100%;
		margin-bottom: 0;
		transition: margin-bottom 0.2s;
		-moz-transition: margin-bottom 0.2s;
		/* Firefox 4 */
		-webkit-transition: margin-bottom 0.2s;
		/* Safari and Chrome */
		-o-transition: margin-bottom 0.2s;
		/* Opera */
	}

	// 表单的报错信息有边距，需要处理
	:deep(.te-form-item.is-error) {
		margin-bottom: var(--te-space-16);
		transition: margin-bottom 0.2s;
		-moz-transition: margin-bottom 0.2s;
		/* Firefox 4 */
		-webkit-transition: margin-bottom 0.2s;
		/* Safari and Chrome */
		-o-transition: margin-bottom 0.2s;
		/* Opera */
	}
	:deep(.te-table .te-table__cell) {
		font-weight: 400;
		color: rgba(96, 98, 102, 1);
		border: none;
		border-bottom: 1px solid rgba(235, 238, 245, 1);
	}

	:deep(.te-table th.te-table__cell.is-leaf) {
		border-bottom: 1px solid rgba(235, 238, 245, 1);
		border-right: 1px solid rgba(235, 238, 245, 1);
		border-left: none;
		color: rgba(144, 147, 153, 1);
		background-color: rgba(245, 247, 250, 1);
	}

	:deep(.te-table--border),
	:deep(.te-table .te-table__body) {
		border: none;
	}

	:deep(.te-table--border) {
		.te-popper {
			max-width: 400px;
			word-break: break-all;
		}
	}

	// 去除bale最后一行的线
	:deep(.te-table__border-left-patch),
	:deep(.te-table__inner-wrapper::before),
	:deep(.te-table__inner-wrapper::after),
	:deep(.te-table::before),
	:deep(.te-table--border::before),
	:deep(.te-table--border::after),
	:deep(.te-table__fixed-right::before),
	:deep(.te-table__fixed::before),
	:deep(.te-table--group::after) {
		display: none;
	}

	:deep(.te-table th.te-table__cell:last-child) {
		border-right: none;
	}

	// 表格内容区域不设置边框
	:deep(.te-table--enable-row-transition .te-table__body td.te-table__cell) {
		border-right: none !important;
	}

	.te-dynamic-table {
		background-color: var(--te-bg-color);

		.cell-item {
			width: 100% !important;
		}

		:deep(.te-date-editor) {
			width: 100%;
		}

		.column-header.is-required::before {
			content: "*";
			color: var(--te-color-danger);
			margin-right: var(--te-space-4);
		}

		.te-table__cell {
			box-sizing: border-box;
			display: flex;
			padding: var(--te-space-8) var(--te-space-16);
			align-items: center;
			gap: var(--te-space-8);
			align-self: stretch;
			color: var(--te-text-color-regular);
			font-style: normal;
			line-height: 22px;
		}

		.add-button {
			height: 40px;
			width: 100%;
			// border-style: dashed;
			margin-top: var(--te-space-12);

			.add-button-text {
				font-size: var(--te-font-size-b14);
				text-align: center;
				font-style: normal;
				line-height: 22px;
			}
		}
		// 解决表格数据为空时样式不居中问题(仅在element-plus中)
		.te-table__empty-block {
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);

			.table-empty {
				line-height: 30px;
			}
		}
	}
</style>
