import { defineComponent } from 'vue';

import FormComponent from './ma-ad-form/ma-ad-form.vue';
import TableComponent from './ma-ad-table/ma-ad-table.vue';
import ToolbarComponent from './ma-ad-toolbar/ma-ad-toolbar.vue';

export default defineComponent({
  name: 'AnnualDetailsComponent',
  components: {
    'ma-ad-form': FormComponent,
    'ma-ad-table': TableComponent,
    'ma-ad-toolbar': ToolbarComponent,
  },
});
