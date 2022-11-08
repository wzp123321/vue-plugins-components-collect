<template>
  <div>
      <div ref="ssDesigner" style="height:700px;width:100%;text-align: left;"></div>
  </div>
</template>

<script>

import { onMounted, ref} from "vue";
import "../../node_modules/@grapecity/spread-sheets/styles/gc.spread.sheets.excel2013white.css";
import "../../node_modules/@grapecity/spread-sheets-designer/styles/gc.spread.sheets.designer.min.css";
import "@grapecity/spread-sheets-designer-resources-cn";
import "@grapecity/spread-sheets-designer";
import GC from '@grapecity/spread-sheets'
import ExcelIO from '@grapecity/spread-excelio'

export default {
  name: 'Designer',
  props: {
  },
  setup(props, {emit}) {
    const ssDesigner = ref(null);
    onMounted(() => {
      var designer = new GC.Spread.Sheets.Designer.Designer(ssDesigner.value);
      emit("designerInitialized", designer);
    });
    return {
      ssDesigner
    };
  }
}
</script>