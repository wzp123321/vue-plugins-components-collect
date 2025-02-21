import { ref } from 'vue';

export const useDialogOpen = () => {
  // 开关
  const visible = ref(false);
  const setVisible = (value: boolean) => {
    visible.value = value;
  };

  return {
    visible,
    setVisible,
  };
};
