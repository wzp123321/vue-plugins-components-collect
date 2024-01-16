/*
 * @Description: 文本编辑
 * @Author: zpwan
 * @Date: 2022-08-10 10:07:48
 * @Last Modified by: zpwan
 * @Last Modified time: 2022-09-08 14:03:30
 */
import { defineComponent, onMounted } from 'vue';

import textEditorService from './cd-t-cell-editor.service';

import { ElInput } from 'element-plus';

export default defineComponent({
  name: 'CdTableCellEditor',
  components: {
    'el-input': ElInput,
  },
  emits: ['editor'],
  setup(props, { emit }) {
    const textEditor = textEditorService;

    const keyDown = (e: KeyboardEvent) => {
      switch (e.keyCode) {
        case 66: //ctrl+B or ctrl+b
        case 73: //ctrl+I or ctrl+i
        case 85: //ctrl+U or ctrl+u
          e.preventDefault();
          break;
        case 13:
          // 禁用换行
          if (window.event) {
            window.event.returnValue = false;
          } else {
            e.preventDefault();
          }
          textEditor.keyEnter();
          emit('editor', (e.target as HTMLInputElement).value);
          break;
      }
    };

    const handleBlur = (e: InputEvent) => {
      emit('editor', (e.target as HTMLInputElement).value);
    };

    onMounted(() => {});

    return {
      textEditor,

      handleBlur,
      keyDown,
    };
  },
});
