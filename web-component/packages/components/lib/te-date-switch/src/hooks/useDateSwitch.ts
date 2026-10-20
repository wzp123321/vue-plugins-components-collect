/*
 * @Author: 钱胜华 qiansh@tiansu-china.com
 * @Date: 2024-01-18 11:39:09
 * @LastEditors: 钱胜华 qiansh@tiansu-china.com
 * @LastEditTime: 2024-03-21 17:20:43
 * @FilePath: \nts-eam-front\src\views\maintenance-management\maintenance-calendar\hooks\useDatePicker.ts
 * @Description: 日期选择器hooks
 */
import { Ref, SetupContext, computed, ref, watch } from "vue";
import {
  ActionTypeEnum,
  AddendType,
  AddendTypeEnum,
  DateSwitchEmits,
  DateSwitchProps,
  DateType,
  DateTypeEnum,
  MethodTypeEnum,
} from "../type";
import { dayjs } from "@tiansu/element-plus";
import { isFunction } from "lodash";

interface UseDateSwitchProps {
  type: Ref<DateType>;
  format: Ref<string>;
  forwardLimit: Ref<boolean>;
  props: DateSwitchProps;
  emits: SetupContext<DateSwitchEmits>["emit"];
}

export const useDateSwitch = ({
  type,
  format,
  forwardLimit,
  props,
  emits,
}: UseDateSwitchProps) => {
  // 当前日期
  const currentDate = ref<string>(props.modelValue);

  // 日期变更事件，根据type与传入的format格式化日期
  const changeDate = (addend: AddendType) => {
    if (!currentDate.value) return;
    try {
      const date =
        addend === AddendTypeEnum.PLUS_ONE
          ? dayjs(currentDate.value)
              .add(1, type.value === DateTypeEnum.DATE ? "day" : type.value)
              .format(format.value)
              .toString()
          : dayjs(currentDate.value)
              .subtract(
                1,
                type.value === DateTypeEnum.DATE ? "day" : type.value
              )
              .format(format.value)
              .toString();
      return date;
    } catch (err) {
      console.error(err);
    }
  };

  // 动态计算输入框的宽度
  const dynamicStyle = computed(() =>
    type.value === DateTypeEnum.DATE ? { width: "120px" } : { width: "84px" }
  );

  // 计算能否前进，如果已经是当年、当月、当日，则向后跳转的按钮置灰
  const canForward = computed(
    () =>
      // 不是当年、当月或当日，则可以向后跳转
      !(forwardLimit.value && dayjs().isSame(currentDate.value, type.value))
  );

  // 统一处理日期变化
  const handleDateChange = (actionType: ActionTypeEnum, dateValue: string) => {
    let date: string;
    const methodType = MethodTypeEnum[actionType];

    switch (actionType) {
      case ActionTypeEnum.FORWARD:
        date = changeDate(AddendTypeEnum.PLUS_ONE);
        break;
      case ActionTypeEnum.BACKWARD:
        date = changeDate(AddendTypeEnum.MINUS_ONE);
        break;
      case ActionTypeEnum.DATE_CHANGE:
        date = dateValue;
        break;
      default:
        date = "";
    }

    // 如果传入了自定义方法，就用自定义方法覆盖默认行为
    if (props[methodType] && isFunction(props[methodType])) {
      props[methodType](date);
      return;
    }

    emits("update:modelValue", date);

    actionType === ActionTypeEnum.DATE_CHANGE
      ? emits(ActionTypeEnum.DATE_CHANGE, date)
      : actionType === ActionTypeEnum.FORWARD
      ? emits(ActionTypeEnum.FORWARD, date)
      : emits(ActionTypeEnum.BACKWARD, date);
  };

  watch(
    () => props.modelValue,
    (value) => {
      currentDate.value = value;
    },
    {
      immediate: true,
    }
  );

  return {
    currentDate,
    dynamicStyle,
    canForward,
    changeDate,
    handleDateChange,
  };
};

