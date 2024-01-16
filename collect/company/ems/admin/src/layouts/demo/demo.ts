import { cloneDeep } from 'lodash';
import { defineComponent, computed, ref, onMounted } from 'vue';

export default defineComponent({
  setup() {
    const value1 = ref('');
    const onMonthChange = () => {
      const monthText = (
        document.getElementsByClassName(
          'el-date-picker__header-label'
        )[1] as HTMLElement
      ).innerText;
      (
        document.querySelector(
          '.el-picker-panel__icon-btn.el-date-picker__prev-btn.arrow-left'
        ) as HTMLElement
      ).removeAttribute('disabled');
      (
        document.querySelector(
          '.el-picker-panel__icon-btn.el-date-picker__next-btn.arrow-right'
        ) as HTMLElement
      ).removeAttribute('disabled');
      console.log(monthText);
      if (monthText === '1 月') {
        (
          document.querySelector(
            '.el-picker-panel__icon-btn.el-date-picker__prev-btn.arrow-left'
          ) as HTMLElement
        ).setAttribute('disabled', 'true');
      }
      if (monthText === '12 月') {
        (
          document.querySelector(
            '.el-picker-panel__icon-btn.el-date-picker__next-btn.arrow-right'
          ) as HTMLElement
        ).setAttribute('disabled', 'true');
      }
    };

    const onFocus = () => {
      onMonthChange();
      document
        .querySelector('.el-date-picker__header')
        ?.addEventListener('click', onMonthChange);
    };
    return {
      value1,
      onFocus,
    };
  },
});
