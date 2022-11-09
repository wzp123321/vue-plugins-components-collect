<template>
  <div>
    <div ref="ssHost" style="height:700px;width:100%;text-align: left;"></div>
  </div>
</template>

<script>
import { onMounted, ref} from "vue";
import "../../node_modules/@grapecity/spread-sheets/styles/gc.spread.sheets.excel2013white.css"
import GC from "@grapecity/spread-sheets"

export default {
  name: 'SpreadSheets',
  props: {
  },
  setup(props, {emit}) {
    const ssHost = ref(null);
    onMounted(() => {
      var workbook = new GC.Spread.Sheets.Workbook(ssHost.value);
      emit("workbookInitialized", workbook)
    });
    return {
      ssHost
    };
  }
}
</script>