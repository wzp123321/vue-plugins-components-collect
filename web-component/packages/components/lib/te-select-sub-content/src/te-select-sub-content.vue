<template>
  <div class="te-select-subContent">
    <te-select
      v-bind="$attrs"
      popper-class="tss-select"
      :popper-options="{
        modifiers: [{ name: 'computeStyles', options: { adaptive: false } }],
      }"
      filterable
      remote-show-suffix
      :filter-method="remoteMethod"
      v-model="selected"
      @visible-change="visibleChange"
    >
      <template #empty>
        <div class="tss-select-empty">暂无数据</div>
      </template>

      <template v-for="(index, name) in $slots" v-slot:[name]>
        <slot :name="name" />
      </template>

      <div
        class="tss-select-box"
        :class="showSubText ? 'tss-select-box-sub' : 'tss-select-box-noSub'"
      >
        <te-option
          v-for="item in renderOptions.slice(
            0,
            !renderAll ? renderRange : renderOptions.length,
          )"
          :key="item[propsMap?.id].toString()"
          :label="item[propsMap?.label]"
          :value="item[propsMap?.id]"
        >
          <div class="tss-sb-mainText" v-html="item.mainText"></div>
          <div v-if="showSubText && item.subEmpty" class="tss-sb-subTextArr">
            <span>-</span>
          </div>
          <div v-if="showSubText && !item.subEmpty" class="tss-sb-subTextArr">
            <template
              v-for="(ele, index) in item[propsMap.subTextArr] ?? []"
              :key="index"
            >
              <span v-if="ele.toString()" v-html="ele"></span>
              <span
                class="sb-text"
                v-if="
                  ele.toString() &&
                  item[propsMap.subTextArr] &&
                  item[propsMap.subTextArr][Number(index) + 1]
                "
                >/</span
              >
            </template>
          </div>
        </te-option>
      </div>
    </te-select>
  </div>
</template>
<script setup lang="ts">
import { ref, watch, computed, WritableComputedRef, onMounted } from 'vue';
import { TeSelect, TeOption } from '@tiansu/element-plus';
import { cloneDeep } from 'lodash';

// 抛出事件
const emits = defineEmits(['update:modelValue', 'remoteMethod']);

/**
 *@id : 选项的值
 *@label : 选项的标签
 *@mainText : 主标题
 *@subTextArr : 副标题数组，可选
 *@subEmpty : 副标题是否为空
 */
type selectOptionsType = {
  id: string;
  label: string;
  mainText: string;
  subTextArr?: string[];
  subEmpty: boolean;
};

declare interface selectOptionPropsMap {
  id: string;
  label: string;
  subTextArr: string;
}

/**
 *@selectOptions : select选项
 *@modelValue : 选中的值
 *@highlightSubText : 副标题是否高亮匹配关键字，可选
 */
type Props = {
  selectOptions: selectOptionsType[];
  modelValue: string;
  highlightSubText?: boolean;
  propsMap?: selectOptionPropsMap;
  renderAll?: boolean;
};

const props = withDefaults(defineProps<Props>(), {
  selectOptions: () => [],
  modelValue: '',
  highlightSubText: true,
  renderAll: false,
  propsMap: () => ({
    id: 'id',
    label: 'label',
    subTextArr: 'subTextArr',
  }),
});

// 接口获取的数据
const originOptions = ref<selectOptionsType[]>();
// 实际页面渲染的数据
const renderOptions = ref<selectOptionsType[]>([]);
// 展示条数
const renderRange = ref<number>(10);
// 下拉选择框dom
const dropDownSelectWrapDom = ref();
// 搜索关键字
const keyword = ref('');
// 是否展示副标题
const showSubText = ref<boolean>(false);

// 双向绑定选中的值
let selected: WritableComputedRef<string> = computed({
  get() {
    return props.modelValue;
  },
  set(val) {
    emits('update:modelValue', val);
  },
});

/**
 * @description:遍历选项数组，对关键字进行替换，高亮展示
 * @param  arr 输入的搜索关键词
 */
const setDataHighlight = (arr: selectOptionsType[]): selectOptionsType[] => {
  const cacheSet = new Set();
  let replaceString = `<span style='color:rgb(24, 144, 255)'>${keyword.value.trim()}</span>`;
  arr.forEach((item: selectOptionsType) => {
    item.mainText = item[props.propsMap.label];
    item.mainText = transformArrowChar(item.mainText?.toString());
    if (keyword.value) {
      const mainText = item.mainText
        .toString()
        ?.replaceAll(keyword.value, replaceString);
      if (mainText !== item.mainText) {
        cacheSet.add(item);
      }
      item.mainText = mainText;
    }
    if (
      props.highlightSubText &&
      item[props.propsMap.subTextArr] &&
      Array.isArray(item[props.propsMap.subTextArr])
    ) {
      item[props.propsMap.subTextArr] = item[props.propsMap.subTextArr].map(
        (ele) => {
          ele = transformArrowChar(ele?.toString());
          if (keyword.value) {
            const subText = ele
              ?.toString()
              ?.replaceAll(keyword.value, replaceString);
            if (subText !== ele) {
              cacheSet.add(item);
            }
            return subText;
          } else {
            return ele;
          }
        },
      );
    }
  });
  return Array.from(cacheSet);
};

const transformArrowChar = (val?: string) => {
  return val?.replaceAll('<', '&lt').replaceAll('>', '&gt');
};

/**
 * @description: 判断是否有副标题,每一项都没有副标题的话，则不展示
 * @param  arr 选项数组
 */
const hasSubTextArr = (arr: selectOptionsType[]) => {
  return arr.some((item) => {
    return (
      item[props.propsMap.subTextArr] &&
      item[props.propsMap.subTextArr].length > 0
    );
  });
};

/**
 * @description: 如果副标题数组每一项都为空的话，则展示横杠
 * @param  arr 选项数组
 */
const checkSubEmpty = (arr: selectOptionsType[]) => {
  for (const item of arr) {
    if (
      item[props.propsMap.subTextArr] &&
      Array.isArray(item[props.propsMap.subTextArr]) &&
      item[props.propsMap.subTextArr].length > 0
    ) {
      item.subEmpty = item[props.propsMap.subTextArr].every((ele) => {
        return !ele.toString();
      });
    } else {
      item.subEmpty = true;
    }
  }
};
/**
 * 过滤匹配到的数据
 */
const filterData = () => {
  renderOptions.value = cloneDeep(originOptions.value);
  showSubText.value = hasSubTextArr(renderOptions.value);
  checkSubEmpty(renderOptions.value);
  const filterOpts = setDataHighlight(renderOptions.value);
  if (filterOpts.length) {
    renderOptions.value = filterOpts;
  }
};
watch(
  () => props.selectOptions,
  (val) => {
    originOptions.value = cloneDeep(val);
    filterData();
  },
  { immediate: true },
);

/**
 * @param {string} query 输入的搜索关键词
 * @description:滚动监听函数，距离底部10的时候，选项选择范围+10
 */
const remoteMethod = (query: string) => {
  keyword.value = transformArrowChar(query);
  filterData();
  emits('remoteMethod', query);
};

/**
 * @description:滚动监听函数，距离底部10的时候，选项选择范围+10
 */
const scrollAddEventFn = (e: Event) => {
  const self = e.target as HTMLDivElement;
  if (self.scrollHeight - self.scrollTop <= self.clientHeight + 10) {
    renderRange.value += 10;
  }
};

/**
 * @description:在数据渲染完之后的回调，关闭后移除监听
 */
const visibleChange = (isShow: boolean) => {
  let timer;
  if (isShow) {
    /* 初始化滚动监听 （由于 dom 渲染未完成，所以需要开启一个 timeout 实现监听） */
    const parentDom = document.querySelectorAll(
      '.te-select-dropdown__wrap.te-scrollbar__wrap.te-scrollbar__wrap--hidden-default',
    ) as NodeListOf<HTMLDivElement>;
    timer = setTimeout(() => {
      parentDom.forEach((e: HTMLDivElement, idx: number) => {
        if (
          (e.querySelector('.tss-select-box') as HTMLDivElement)?.children
            ?.length >= 0
        ) {
          dropDownSelectWrapDom.value = parentDom[idx];
          if (!props.renderAll) {
            dropDownSelectWrapDom.value.addEventListener(
              'scroll',
              scrollAddEventFn,
              false,
            );
          }
        }
      });
    }, 0);
  } else {
    if (!props.renderAll) {
      dropDownSelectWrapDom.value.removeEventListener(
        'scroll',
        scrollAddEventFn,
        false,
      );
    }
    timer && clearTimeout(timer);
  }
};
</script>

<style lang="less" scoped>
.tss-select {
  .tss-select-empty {
    height: 56px;
    line-height: 56px;
    text-align: center;
    color: lightgrey;
  }

  .tss-select-box {
    .te-select-dropdown__wrap {
      max-height: 400px;
    }

    .te-select-dropdown__item + .te-select-dropdown__item {
      margin-top: 0;
    }
  }

  .tss-select-box-sub {
    .te-select-dropdown__item {
      height: 52px;
      padding: 5px 20px 5px 20px;
      line-height: 0;

      .tss-sb-mainText {
        width: 100%;
        display: inline-block;
        height: 22px;
        line-height: 22px;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .tss-sb-subTextArr {
        height: 20px;
        color: rgb(168, 171, 178);
        overflow: hidden;
        display: flex;
        position: relative;
        font-size: 12px;
        line-height: 20px;
      }
    }
  }

  .tss-select-box-noSub {
    .te-select-dropdown__item {
      .tss-sb-mainText {
        width: 100%;
        display: inline-block;
        height: 22px;
        line-height: 22px;
      }
    }
  }
}
</style>
