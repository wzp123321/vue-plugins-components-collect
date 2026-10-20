<!--
 * @Author: yanghui yanghui@tiansu-china.com
 * @Date: 2024-03-14 09:31:05
 * @LastEditors: yanghui yanghui@tiansu-china.com
 * @LastEditTime: 2024-09-11 14:59:20
 * @Description: 
-->
<template>
	<te-select-v2
	  popper-class="te-select-sub-content-v2"
	  v-model="selectedValue"
	  v-bind="$attrs"
	  :item-height="54"
	  :options="renderedOptions"
	  filterable
	  remote
	  :remote-method="debouncedRemoteMethod"
	  :height="270"
	  :loading="isLoading"
	  @change="onValueChange"
	  @visible-change="handleVisibilityChange"
	  :popper-append-to-body="false"
	  :scrollbar-always-on="false"
	  :no-data-text="'暂无数据'"
	>
	  <template #default="{ item }">
		<div style="height: 100%">
		  <div class="title">
			<span v-html="item[textProps.mainText]"></span>
		  </div>
		  <div class="subText">
			<template v-if="Array.isArray(item[textProps.subText])">
			  <template v-for="(ele, index) in item[textProps.subText] ?? []" :key="index">
				<template v-if="index < item[textProps.subText]?.length - 1">
				  <span v-html="ele"></span>
				  <span>/</span>
				</template>
				<template v-else>
				  <span v-html="ele"></span>
				</template>
			  </template>
			  <template v-if="!item[textProps.subText]?.length">
				<span>-</span>
			  </template>
			</template>
			<template v-else>
			  <span v-html="item[textProps.subText]" />
			</template>
		  </div>
		</div>
	  </template>
	</te-select-v2>
  </template>
  <script lang="ts" setup>
  import { ref, watch, useAttrs, onUnmounted } from 'vue'
  import PinYinMatch from 'pinyin-match'
  import lodash from 'lodash'
  import { TeSelectV2 } from '@tiansu/element-plus'
  
  const attrs = useAttrs()
  
  interface TextPropsType {
	mainText: string
	subText: string
  }
  
  interface PropsType {
	modelValue: string | undefined
	data: Array<Record<string, unknown>>
	filterKeysArr: string[]
	textProps?: TextPropsType
	highlightSubText?: boolean
  }
  
  /**
   * 加载状态标志，默认为 false
   */
  const isLoading = ref<boolean>(false)
  
  /**
   * 定义用于抛出事件的变量
   */
  const emitEvents = defineEmits(['update:modelValue', 'change'])
  
  /**
   * 存储原始选项数据的响应式变量
   */
  const originalOptions = ref<Array<Record<string, unknown>>>([])
  
  /**
   * 存储实际渲染选项数据的响应式变量
   */
  const renderedOptions = ref<Array<Record<string, unknown>>>([])
  
  /**
   * 控制列表显示状态的标志，默认为 false
   */
  const isListVisible = ref<boolean>(false)
  
  /**
   * 存储选中值的响应式变量
   */
  const selectedValue = ref<string | undefined>()
  
  /**
   * 定义组件的属性
   * @param {string | undefined} modelValue - 模型值
   * @param {Array<Record<string, unknown>>} array data - 数据
   * @param  filterKeysArr - 过滤键数组
   */
  const props = withDefaults(defineProps<PropsType>(), {
	modelValue: undefined,
	data: () => [],
	filterKeysArr: () => [],
	textProps: () => ({
	  mainText: 'mainText',
	  subText: 'subText'
	}),
	highlightSubText: true
  })
  
  /**
   * 构建索引的函数
   * @param {Array<Record<string, unknown>>} data - 数据
   * @param {string} key - 索引的键
   * @param {Map<string, Record<string, unknown>[]>} index - 索引存储的 Map
   */
  const buildIndex = (
	data: Array<Record<string, unknown>>,
	key: string,
	index: Map<string, Record<string, unknown>[]>
  ) => {
	data.reduce((_index, item) => {
	  const value = item[key]
	  if (!_index.has(value as string)) {
		_index.set(value as string, [])
	  }
	  _index.get(value as string)?.push(item)
	  return _index
	}, index)
  }
  
  /**
   * 初始化数据的函数
   * @param {PropsType} props - 组件属性
   */
  const initData = (props: PropsType) => {
	const { data } = props
  
	const mainTextIndex = new Map<string, Record<string, unknown>[]>()
	const subTextIndex = new Map<string, Record<string, unknown>[]>()
  
	buildIndex(data, 'label', mainTextIndex)
	buildIndex(data, 'subShowText', subTextIndex)
  
	return { mainTextIndex, subTextIndex }
  }
  
  /**
   * 监听 props.modelValue 的变化
   */
  watch(
	() => props.modelValue,
	(newValue) => {
	  try {
		selectedValue.value = newValue
	  } catch (error) {
		console.error('处理 modelValue 变化时出错:', error)
	  }
	},
	{ deep: true, immediate: true }
  )
  
  /**
   * 监听 props.modelValue 的变化
   */
  watch(
	() => props.data,
	(newValue) => {
	  try {
		originalOptions.value = newValue
		renderedOptions.value = newValue
		renderedOptions.value.forEach((item: any) => {
		  item.label = item[props.textProps.mainText]
		})
	  } catch (error) {
		console.error('处理 data 变化时出错:', error)
	  }
	},
	{ deep: true, immediate: true }
  )
  
  /**
   * 根据给定的数组和 ID 查找对应的项
   * @param {Array<Record<string, unknown>>} array - 要查找的数组
   * @param {string} id - 要匹配的 ID
   * @returns {Record<string, unknown>} 找到的项，如果未找到则返回空对象
   */
  const findItemById = (array: Array<Record<string, unknown>>, id: string): Record<string, unknown> => {
	try {
	  const valueKey = attrs['value-key'] ?? 'id'
	  return array.find((item: Record<string, unknown>) => item[valueKey as string] === id) || {}
	} catch (error) {
	  console.error('查找项时出错:', error)
	  return {}
	}
  }
  
  /**
   * 处理值变化的函数
   * @param {string} newValue - 新的值
   */
  const onValueChange = (newValue: string) => {
	// 首先查找原始选项中对应的值
	const foundItem = findItemById(originalOptions.value, newValue)
	emitEvents('update:modelValue', newValue)
	emitEvents('change', foundItem)
  }
  
  /**
   * 检查查询是否有效
   * @param {string} query - 要检查的查询字符串
   * @returns {boolean} 如果查询不为空且经过修剪后的类型为字符串，则返回 true，否则返回 false
   */
  const isValidQuery = (query: string): boolean => {
	return query.trim() !== '' && typeof query.trim() === 'string'
  }
  
  /**
   * 创建替换字符串
   * @param {string} query - 输入的查询字符串
   * @returns {string} 包含查询字符串并带有特定样式的替换字符串
   */
  const createReplaceString = (query: string): string => {
	return `<span style='color:var(--te-color-primary)'>${query.trim()}</span>`
  }
  
  /**
   * 模拟延迟
   * @returns {Promise<void>} 一个在指定时间后完成的 Promise
   */
  const simulateDelay = async (): Promise<void> => {
	return new Promise((resolve) => setTimeout(resolve, 500))
  }
  
  /**
   * 模糊匹配函数
   * @param {string} query - 输入的查询字符串
   * @param {Map<string, Record<string, unknown>[]>} mainTextIndex - mainText 索引
   * @param {Map<string, Record<string, unknown>[]>} subTextIndex - subText 索引
   * @returns {Record<string, unknown>[]} 匹配的项
   */
  const fuzzyMatchInIndex = (
	query: string,
	mainTextIndex: Map<string, Record<string, unknown>[]>,
	subTextIndex: Map<string, Record<string, unknown>[]>
  ): Record<string, unknown>[] => {
	const foundItems: Record<string, unknown>[] = []
	const addedItemIds = new Set<string>()
  
	const valueKey = attrs['value-key'] ?? 'id'
  
	// 合并两个索引的键值对为一个数组
	const allEntries = [...mainTextIndex.entries(), ...subTextIndex.entries()]
  
	for (const [key, keyValue] of allEntries) {
	  for (const item of keyValue) {
		const subText = item[props.textProps.subText]
		const searchFields = [
		  item[props.textProps.mainText],
		  // 遍历 subText 数组的每个元素进行匹配
		  ...(Array.isArray(subText) ? subText.map((subTextItem) => (subTextItem ? subTextItem.toString() : '')) : []),
		  // 遍历过滤键数组，获取对应的值添加到搜索字段数组
		  ...props.filterKeysArr.map((key) => (item[key] ? item[key].toString() : ''))
		]
  
		const matchField = (field: string) => {
		  if (typeof field === 'string') {
			return PinYinMatch.match(field, query)
		  }
		  return false
		}
  
		if (
		  searchFields.some((field) => matchField(field as string)) &&
		  !addedItemIds.has(item[valueKey as string] as string)
		) {
		  foundItems.push(item)
		  addedItemIds.add(item[valueKey as string] as string)
		}
	  }
	}
	return foundItems
  }
  /**
   * 优化后的过滤选项方法，使用索引加快搜索
   * @param {string} query - 用于过滤的查询字符串
   * @param {Map<string, Record<string, unknown>[]>} mainTextIndex - 主文本索引
   * @param {Map<string, Record<string, unknown>[]>} subTextIndex - 子文本索引
   * @returns {Array<Record<string, unknown>>} 过滤后的选项数组
   */
  const filterOptions = (
	query: string,
	mainTextIndex: Map<string, Record<string, unknown>[]>,
	subTextIndex: Map<string, Record<string, unknown>[]>
  ): Array<Record<string, unknown>> => {
	return fuzzyMatchInIndex(query, mainTextIndex, subTextIndex)
  }
  
  /**
   * 处理过滤后的选项
   * @param {Array<Record<string, unknown>>} filteredOptions - 过滤后的选项数组
   * @param {string} query - 原始查询字符串
   * @param {boolean} highlightSubText - 是否高亮子文本
   * @returns {Array<Record<string, unknown>>} 处理后的选项数组
   */
  const processFilteredOptions = (
	filteredOptions: Array<Record<string, unknown>>,
	query: string,
	highlightSubText: boolean
  ): Array<Record<string, unknown>> => {
	return filteredOptions.map((item: any) => ({
	  ...item,
	  // 对主要文本和子文本进行字符串替换
	  [props.textProps?.mainText]: (item[props.textProps?.mainText] as string).replaceAll(
		query,
		createReplaceString(query)
	  ),
	  // 只有当 subText 是数组时才进行字符串替换
	  [props.textProps?.subText]: Array.isArray(item[props.textProps?.subText])
		? (item[props.textProps?.subText] as string[]).map((subTextItem) =>
			highlightSubText ? subTextItem?.toString().replaceAll(query, createReplaceString(query)) : subTextItem
		  )
		: item[props.textProps?.subText]
	}))
  }
  
  /**
   * 远程搜索方法
   * @param {string} query - 输入的搜索关键词
   */
  const remoteMethod = async (query: string) => {
	// 检查查询是否有效
	if (!isValidQuery(query)) {
	  // 如果查询无效，将渲染选项设置为原始选项并直接返回
	  renderedOptions.value = originalOptions.value
	  return
	}
  
	// 设置加载状态为真，表示正在进行搜索操作
	isLoading.value = true
  
	try {
	  const { mainTextIndex, subTextIndex } = initData(props)
	  // 模拟延迟，可能用于模拟网络请求的等待时间
	  await simulateDelay()
	  // 过滤原始选项，获取符合条件的选项
	  const filteredOptions = filterOptions(query, mainTextIndex, subTextIndex)
	  // 对过滤后的选项进行处理，进行字符串替换
	  renderedOptions.value = processFilteredOptions(filteredOptions, query, props.highlightSubText)
	} catch (error) {
	  // 捕获并打印搜索过程中出现的错误
	  console.error('执行搜索操作时出错:', error)
	} finally {
	  // 加载状态设置为假
	  isLoading.value = false
	}
  }
  
  /**
   * 使用 lodash 的 debounce
   * 延迟 500 毫秒执行 remoteMethod 方法
   */
  const debouncedRemoteMethod = lodash.debounce(remoteMethod, 500) // 500 毫秒防抖延迟
  
  /**
   * 处理可见性变化的回调函数
   * @param {boolean} isVisible - 是否显示
   */
  const handleVisibilityChange = (isVisible: boolean) => {
	try {
	  isListVisible.value = isVisible
	  if (isVisible) {
		renderedOptions.value = originalOptions.value
	  }
	} catch (error) {
	  console.error('处理可见性变化时出错:', error)
	}
  }
  
	// 封装设置虚拟滚动条显示状态的函数
	const setVirtualScrollbarDisplay = (displayStyle: string) => {
		const virtualScrollbars = document.querySelectorAll('.te-virtual-scrollbar')
		virtualScrollbars.forEach((scrollbar: any) => {
			scrollbar.style.display = displayStyle
		})
	}
  
  const handleLengthChange = (newLength: number) => {
	let intervalFunction = () => {
	  if (newLength <= 5) {
		setVirtualScrollbarDisplay('none')
	  } else {
		setVirtualScrollbarDisplay('block')
	  }
	}
  
	// 使用 setTimeout 替代 setInterval 避免重复定时器的堆积
	let timerId = setTimeout(() => {
	  intervalFunction()
	  timerId = setTimeout(intervalFunction, 500)
	}, 500)
  
	// 清除之前的定时器
	if (window['timerId']) {
	  clearTimeout(window['timerId'])
	}
	window['timerId'] = timerId
  }
  
  watch(() => renderedOptions.value.length, handleLengthChange)
  
  // 在组件销毁时清除定时器（如果组件是 Vue 组件）
  onUnmounted(() => {
	if (window['timerId']) {
	  clearTimeout(window['timerId'])
	}
  })
  </script>
  
  <style lang="less" scoped>
  .title {
	height: 24px;
	line-height: 24px;
	width: 100%;
	display: flex;
	white-space: nowrap; /* 确保文本在一行内显示 */
	overflow: hidden; /* 隐藏溢出的内容 */
	text-overflow: ellipsis; /* 使用省略号表示溢出的文本 */
  }
  .subText {
	font-size: 13px;
	height: 20px;
	line-height: 20px;
	width: 100%;
	font-size: 12px;
	color: rgb(168, 171, 178);
	white-space: nowrap; /* 确保文本在一行内显示 */
	overflow: hidden; /* 隐藏溢出的内容 */
	text-overflow: ellipsis; /* 使用省略号表示溢出的文本 */
  }
  </style>
  
  <style lang="less">
  .te-select-sub-content-v2 {
	.sub-select-empty {
	  height: 56px;
	  line-height: 56px;
	  text-align: center;
	  color: lightgrey;
	}
	.te-select-dropdown__list {
	  height: auto !important;
	  max-height: 270px;
	}
	.te-select-dropdown {
	  .te-select-dropdown__option-item {
		padding: 5px 16px 5px 16px;
		box-sizing: border;
	  }
	}
  
	.te-virtual-scrollbar {
	  overflow: auto;
	  height: auto;
	  top: 0;
	  bottom: 0 ;
	}
  
	.te-select-dropdown__option-item.is-selected {
	  background: var(--te-bg-color-secondary, rgba(238, 240, 243, 1));
	  font-weight: 600;
	}
  }
  </style>
  
  