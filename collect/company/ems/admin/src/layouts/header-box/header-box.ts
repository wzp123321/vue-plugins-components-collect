import { FGetSessionStorageData } from '@/utils/token';
import { defineComponent, computed, ref, onMounted } from 'vue';

import { useStore } from 'vuex';

export default defineComponent({
  name: 'HeaderBox',
  setup() {
    const store = useStore();

    const userName = ref<string>('');

    const tenantVO = computed(() => {
      return store?.getters?.tenantVO;
    });

    onMounted(() => {
      userName.value = FGetSessionStorageData('ems-username') as string;
    });

    return {
      tenantVO,
      userName,
    };
  },
});
