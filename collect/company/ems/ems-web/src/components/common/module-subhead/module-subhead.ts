import { defineComponent } from 'vue';
export default defineComponent({
  name: 'ModuleSubhead',
  props: {
    title: {
      // 标题名称
      type: String,
      default: ''
    }
  }
});
