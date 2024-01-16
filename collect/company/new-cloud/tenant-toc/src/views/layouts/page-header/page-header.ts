import { defineComponent } from 'vue';
import { FGetCookie } from '@/core/token';

export default defineComponent({
  name: 'TenantHeader',
  setup() {
    const userName = FGetCookie('realName');

    return {
      userName,
    };
  },
});
