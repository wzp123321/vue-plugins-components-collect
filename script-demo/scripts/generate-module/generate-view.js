import { mkdirSync } from 'fs'
import { join } from 'node:path'
import { createFileIfNotExists, projectRoot, camelToPascal, getRelativePath } from './utils.js'

/**
 * 生成 constant.ts 文件
 * @param {string} moduleName - 模块名称
 * @param {Array<{label: string, field: string, type?: string}>} searchFields - 搜索条件配置
 * @param {Object} tableConfig - 表格配置
 * @param {Object} otherFeatures - 其他功能配置
 * @returns {string} constant.ts 文件内容
 */
export function generateConstantFile(moduleName, searchFields = [], tableConfig = {}, otherFeatures = {}) {
  const pascalName = camelToPascal(moduleName)
  
  // 生成 SEARCH_PARAMS
  const searchParamsFields = searchFields
    .filter(f => f.type !== 'dateRange')
    .map(f => `  ${f.field}: '',`)
    .join('\n')
  
  const dateRangeFields = searchFields
    .filter(f => f.type === 'dateRange')
    .map(f => `  ${f.field}Start: '',
  ${f.field}End: '',`)
    .join('\n')
  
  const searchParams = `export const SEARCH_PARAMS = {
  searchValue: '',${searchParamsFields ? `\n${searchParamsFields}` : ''}${dateRangeFields ? `\n${dateRangeFields}` : ''}
}`

  // 生成 TABLE_PARAMS
  const tableParams = `export const TABLE_PARAMS = {
  tableCode: '${moduleName}',
}`

  // 生成 DEFAULT_FORM_DATA
  const defaultFormData = `export const DEFAULT_FORM_DATA = {
  id: '',
}`

  // 生成 IMPORT_TEMP_CODE
  const importTempCode = `export const IMPORT_TEMP_CODE = ''`

  return `/**
 * 搜索相关参数
 * @example searchValue搜索框输入的key,其余字段根据接口定义
 * @description key根据业务服务提供更改
 */
${searchParams}

/**
 * 表格相关参数
 * @description tableCode表格code
 */
${tableParams}

/**
 * 表单默认数据
 */
${defaultFormData}

/**
 * 导入模板代码
 */
${importTempCode}
`
}

/**
 * 生成 useBtnHandles.ts 文件
 * @param {string} moduleName - 模块名称
 * @param {string} moduleTitle - 模块标题
 * @param {Object} pageConfig - 页面配置
 * @param {boolean} needDelete - 是否需要删除功能
 * @returns {string} useBtnHandles.ts 文件内容
 */
export function generateUseBtnHandles(moduleName, moduleTitle, pageConfig = {}, needDelete = true) {
  const apiImportPath = `@/apis/${moduleName}`
  const pascalName = camelToPascal(moduleName)
  
  const operateBtns = []
  
  // 查看按钮
  if (pageConfig.detail) {
    if (pageConfig.detail === 'page') {
      operateBtns.push(`    {
      buttonName: '查看',
      value: 'view',
      handler: (row: ListRow) => {
        router.push({
          path: '/${moduleName}/detail',
          query: {
            id: row.id,
          },
        });
      },
    },`)
    } else {
      operateBtns.push(`    {
      buttonName: '查看',
      value: 'view',
      handler: (row: ListRow) => {
        if (detailRef.value) {
          detailRef.value.detailId = row.id;
          detailRef.value.detailVisible = true;
        }
      },
    },`)
    }
  }
  
  // 编辑按钮
  if (pageConfig.edit) {
    if (pageConfig.edit === 'page') {
      operateBtns.push(`    {
      buttonName: '编辑',
      value: 'edit',
      handler: (row: ListRow) => {
        router.push({
          path: '/${moduleName}/edit',
          query: {
            id: row.id,
          },
        });
      },
    },`)
    } else {
      operateBtns.push(`    {
      buttonName: '编辑',
      value: 'edit',
      handler: (row: ListRow) => {
        if (editFormRef.value) {
          editFormRef.value.editId = row.id;
          editFormRef.value.formVisible = true;
        }
      },
    },`)
    }
  }
  
  // 删除按钮
  if (needDelete) {
    operateBtns.push(`    {
      buttonName: '删除',
      value: 'delete',
      showBtnPop: true,
      buttonColor: '#f5222d',
      pop: {
        cancel: '取消',
        confirm: '确认',
        tip: '删除后将无法恢复，确定要删除吗？',
      },
      handler: async (row: ListRow) => {
        try {
          const res = await deleteData(row.id);
          if (res.errcode === SUCCESS_CODE) {
            TeMessage.success('操作成功');
            tableRef.value.query();
            selectList.value = selectList.value.filter(
              (item: ListRow) => item.id !== row.id,
            );
            clearSelection();
          }
        } catch (error) {
          console.log('删除失败', error);
        }
      },
    },`)
  }
  
  const imports = [
    `import { isFunction } from 'lodash-es';`,
    pageConfig.add && (pageConfig.add === 'dialog' || pageConfig.add === 'drawer') ? `import CreateForm from '../modules/createForm.vue';` : '',
    pageConfig.edit && (pageConfig.edit === 'dialog' || pageConfig.edit === 'drawer') ? `import EditForm from '../modules/editForm.vue';` : '',
    pageConfig.detail && (pageConfig.detail === 'dialog' || pageConfig.detail === 'drawer') ? `import Detail from '../modules/detail.vue';` : '',
    `import { Ref, ref } from 'vue';`,
    `import { TeModuleTable } from '@tiansu/ts-web-package';`,
    (pageConfig.add === 'page' || pageConfig.edit === 'page' || pageConfig.detail === 'page') ? `import { useRouter } from 'vue-router';` : '',
    `import { SUCCESS_CODE } from '@/constant';`,
    `import { TeMessage } from '@tiansu/element-plus';`,
    `import { deleteData } from '@/apis/${moduleName}';`,
    `import { ListRow } from '@/apis/${moduleName}/index.api';`,
  ].filter(Boolean)
  
  const routerInit = (pageConfig.add === 'page' || pageConfig.edit === 'page' || pageConfig.detail === 'page')
    ? `  const router = useRouter();`
    : ''
  
  const refs = []
  if (pageConfig.add && (pageConfig.add === 'dialog' || pageConfig.add === 'drawer')) {
    refs.push(`  const createFormRef = ref<InstanceType<typeof CreateForm>>();`)
  }
  if (pageConfig.edit && (pageConfig.edit === 'dialog' || pageConfig.edit === 'drawer')) {
    refs.push(`  const editFormRef = ref<InstanceType<typeof EditForm>>();`)
  }
  if (pageConfig.detail && (pageConfig.detail === 'dialog' || pageConfig.detail === 'drawer')) {
    refs.push(`  const detailRef = ref<InstanceType<typeof Detail>>();`)
  }
  
  return `${imports.join('\n')}

export default (tableRef: Ref<InstanceType<typeof TeModuleTable>>) => {
${routerInit}
${refs.join('\n')}
  const selectList = ref<ListRow[]>([]);
  const exportShow = ref(false);
  
  // 清除全选选中
  const clearSelection = () => {
    if (selectList.value.length === 0) {
      tableRef.value.clearSelection();
    }
  };
  
  // 操作按钮
  const operateBtns = [
${operateBtns.join('\n')}
  ];
  
  // 导出
  const exportFile = async () => {
    exportShow.value = true;
  };

  /**
   * 操作按钮handle
   */
  const operateRow = (data: { row: ListRow; value: string }) => {
    const currentHander = operateBtns.find(
      (item) => item.value === data.value,
    )?.handler;
    if (isFunction(currentHander)) {
      currentHander(data.row);
    }
  };
  
  return {
    operateRow,
    operateBtns,
    createFormRef,
    editFormRef,
    exportFile,
    exportShow,
    selectList,
    clearSelection,
  };
};
`
}

/**
 * 生成 comp.vue 组件文件
 * @returns {string} comp.vue 文件内容
 */
export function generateCompFile() {
  return `<template>
  <div class="comp-container">组件示例</div>
</template>
<script lang="ts" setup></script>

<style lang="scss" scoped>
.comp-container {
  width: 100%;
  height: 100%;
}
</style>
`
}

/**
 * 生成简单的列表页面
 * @param {string} moduleName - 模块名称
 * @param {string} moduleTitle - 模块标题
 * @param {Object} pageConfig - 页面配置 {add: 'dialog'|'drawer'|'page'|null, edit: ..., detail: ...}
 * @param {boolean} needDelete - 是否需要删除功能
 * @param {Array<{label: string, field: string, type?: string}>} searchFields - 搜索条件配置
 * @param {Object} tableConfig - 表格配置 {showIndexColumn: boolean, enableSelection: boolean, enableBatchDelete: boolean}
 * @param {Object} otherFeatures - 其他功能配置 {enableExport: boolean, enableImport: boolean}
 * @returns {string} 列表页面内容
 */
export function generateListView(
  moduleName,
  moduleTitle,
  pageConfig = {},
  needDelete = true,
  searchFields = [],
  tableConfig = { showIndexColumn: false, enableSelection: false, enableBatchDelete: false },
  otherFeatures = { enableExport: false, enableImport: false },
) {
  const pascalName = camelToPascal(moduleName)
  const apiImportPath = `@/apis/${moduleName}`

  const hasAddModal = pageConfig.add === 'dialog' || pageConfig.add === 'drawer'
  const hasEditModal =
    pageConfig.edit === 'dialog' || pageConfig.edit === 'drawer'
  const hasPageJump =
    pageConfig.add === 'page' ||
    pageConfig.edit === 'page' ||
    pageConfig.detail === 'page'

  const dialogImports = []
  if (hasAddModal)
    dialogImports.push(`import CreateForm from './modules/createForm.vue'`)
  if (hasEditModal)
    dialogImports.push(`import EditForm from './modules/editForm.vue'`)
  // 只在详情是弹窗或抽屉形式时才导入 Detail 组件
  if (pageConfig.detail && pageConfig.detail !== 'page')
    dialogImports.push(`import Detail from './modules/detail.vue'`)

  // 根据配置决定需要的导入
  const extraImports = []
  if (otherFeatures.enableExport) {
    extraImports.push(`import ExportButton from '@/components/exportButton/index.vue'`)
  }
  if (otherFeatures.enableImport) {
    extraImports.push(`import ImportButton from '@/components/importButton/index.vue'`)
  }

  const imports = [
    `import { ref, watch } from 'vue'`,
    `import { TeTableButtonGroup, TeModuleTable, ColSettingBtn } from '@tiansu/ts-web-package'`,
    `import { SEARCH_PARAMS, TABLE_PARAMS${otherFeatures.enableImport ? ', IMPORT_TEMP_CODE' : ''} } from './constant.ts'`,
    `import { updateTableColumns } from '@/apis/common'`,
    `import { getList, getTableColumns } from '@/apis/${moduleName}/index.ts'`,
    `import useOperateBtns from './hooks/useBtnHandles.ts'`,
    `import { ListRow } from '@/apis/${moduleName}/index.api.ts'`,
    `import { useTable } from '@/hooks/useTable.ts'`,
    ...(otherFeatures.enableImport ? [`import ImportButton from '@/components/importButton/index.vue'`] : []),
    ...(otherFeatures.enableExport ? [`import ExportButton from '@/components/exportButton/index.vue'`] : []),
    ...dialogImports,
  ].filter(Boolean)

  // 日期范围字段处理
  const dateRangeFields = searchFields.filter(f => f.type === 'dateRange')
  const dateRangeVars = dateRangeFields.map(f => {
    const fieldName = f.field
    return `const ${fieldName}Range = ref<[string, string] | undefined>(undefined);`
  }).join('\n')
  
  const dateRangeHandlers = dateRangeFields.map(f => {
    const fieldName = f.field
    const capitalized = fieldName.charAt(0).toUpperCase() + fieldName.slice(1)
    return `// 处理日期范围变化 - ${f.label}
const handleDateRangeChange${capitalized} = (val: [string, string] | null) => {
  if (val && val.length === 2) {
    queryParams.value.${fieldName}Start = val[0] || '';
    queryParams.value.${fieldName}End = val[1] || '';
    ${fieldName}Range.value = val;
  } else {
    queryParams.value.${fieldName}Start = '';
    queryParams.value.${fieldName}End = '';
    ${fieldName}Range.value = undefined;
  }
};`
  }).join('\n\n')
  
  const dateRangeWatchers = dateRangeFields.map(f => {
    const fieldName = f.field
    return `watch(
  () => [queryParams.value.${fieldName}Start, queryParams.value.${fieldName}End],
  ([start, end]) => {
    if (start && end) {
      ${fieldName}Range.value = [start, end];
    } else {
      ${fieldName}Range.value = undefined;
    }
  },
);`
  }).join('\n\n')

  // 弹窗/抽屉模板（如果需要）
  let modalTemplates = ''
  if (hasAddModal) {
    const componentTag = pageConfig.add === 'dialog' ? 'te-dialog' : 'te-drawer'
    const sizeAttr = pageConfig.add === 'dialog' ? 'width="680px"' : 'size="960"'
    modalTemplates += `    <${componentTag}
      v-model="createFormVisible"
      title="新增${moduleTitle}"
      ${sizeAttr}
      :close-on-click-modal="false"
    >
      <CreateForm
        ref="createFormRef"
        @success="handleCreateSuccess"
        @cancel="createFormVisible = false"
      />
    </${componentTag}>\n`
  }
  
  if (hasEditModal) {
    const componentTag = pageConfig.edit === 'dialog' ? 'te-dialog' : 'te-drawer'
    const sizeAttr = pageConfig.edit === 'dialog' ? 'width="680px"' : 'size="960"'
    modalTemplates += `    <${componentTag}
      v-model="editFormVisible"
      title="编辑${moduleTitle}"
      ${sizeAttr}
      :close-on-click-modal="false"
    >
      <EditForm
        ref="editFormRef"
        :edit-id="editId"
        @success="handleEditSuccess"
        @cancel="editFormVisible = false"
      />
    </${componentTag}>\n`
  }
  
  if (pageConfig.detail && pageConfig.detail !== 'page') {
    const componentTag = pageConfig.detail === 'dialog' ? 'te-dialog' : 'te-drawer'
    const sizeAttr = pageConfig.detail === 'dialog' ? 'width="620px"' : 'size="820"'
    modalTemplates += `    <${componentTag}
      v-model="detailRef?.detailVisible"
      title="${moduleTitle}详情"
      ${sizeAttr}
      :close-on-click-modal="false"
    >
      <Detail :id="detailRef?.detailId" @cancel="detailRef?.detailVisible = false" />
    </${componentTag}>\n`
  }

  const needsOperationColumn =
    pageConfig.add || pageConfig.edit || pageConfig.detail || needDelete

  const template = `<template>
  <div class="${moduleName}-container">
    <te-tablebar
      placeholder="请输入关键字搜索"
      v-model="queryParams.searchValue"
      :hiddenMoreSearch="false"
      @onReset="reset"
      @onQuery="queryAll"
      @onRefresh="refresh"
      @input="queryAll"
      maxlength="200"
      show-word-limit
    >
      <template #header>
        <section class="header-opterate">
          ${pageConfig.add ? `<te-button type="primary" @click="create">新增</te-button>` : ''}
          ${otherFeatures.enableImport ? `<import-button
            importUrl="/api/import"
            :templateCode="IMPORT_TEMP_CODE"
            :import-param="{
              type: IMPORT_TEMP_CODE,
            }"
            templateFileName="${moduleTitle}"
            @success="query"
          ></import-button>` : ''}
          ${otherFeatures.enableExport ? `<export-button
            :selectedCount="selectList.length || 0"
            :params="queryParams"
            :allCount="totalAll"
            fileName="${moduleTitle}"
          ></export-button>` : ''}
        </section>
      </template>
      <template #suffix>
        <ColSettingBtn
          class="btn"
          v-model="tableColumnData"
          :save-param="TABLE_PARAMS"
          :save-api="updateTableColumns"
        >
        </ColSettingBtn>
      </template>
      <template #searchList>
        ${
          searchFields.length > 0
            ? `<te-row :gutter="8" class="row-container">
          ${searchFields
            .map((field) => {
              const fieldType = field.type || 'text'
              if (fieldType === 'dateRange') {
                return `<te-col :span="8">
            <div class="common-searchbox">
              <span class="common-label">${field.label}</span>
              <te-date-picker
                v-model="${field.field}Range"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                value-format="YYYY-MM-DD"
                class="search-date-picker"
                @change="handleDateRangeChange${field.field.charAt(0).toUpperCase() + field.field.slice(1)}"
              ></te-date-picker>
            </div>
          </te-col>`
              } else if (fieldType === 'select') {
                return `<te-col :span="8">
            <div class="common-searchbox">
              <span class="common-label">${field.label}</span>
              <te-select
                v-model="queryParams.${field.field}"
                placeholder="请选择${field.label}"
                clearable
                class="search-select"
              >
                <!-- 下拉选项需要根据实际业务配置 -->
                <te-option label="选项1" value="1" />
                <te-option label="选项2" value="2" />
              </te-select>
            </div>
          </te-col>`
              } else {
                return `<te-col :span="8">
            <div class="common-searchbox">
              <span class="common-label">${field.label}</span>
              <te-input
                v-model="queryParams.${field.field}"
                placeholder="请输入${field.label}"
                class="search-select"
              ></te-input>
            </div>
          </te-col>`
              }
            })
            .join('\n          ')}
        </te-row>`
            : ''
        }
      </template>
      <template #footer>
        <div class="footer"></div>
      </template>
    </te-tablebar>

    <te-module-table
      ref="tableRef"
      is-flex
      :request-api="getList"
      :allCount="totalAll"
      :initParam="queryParams"
      :request-column-api="getTableColumns"
      :columnCallback="requestColumnCallBack"
      :data-callback="requestDataCallBack"
      :initColumnParam="TABLE_PARAMS"
      showOperationColumn
      :showIndexColumn="${tableConfig.showIndexColumn ? 'true' : 'false'}"
      :showSelectColumn="${tableConfig.enableSelection ? 'true' : 'false'}"
      @selection-change="handleSelectionChanged"
    >
      <template #operation="{ row }">
        <TeTableButtonGroup
          @operate="operateRow"
          :row="row"
          :tableButton="operateBtns"
        ></TeTableButtonGroup>
      </template>
    </te-module-table>
${modalTemplates}  </div>
</template>`

  // 生成响应式变量定义
  const reactiveVars = []
  if (hasAddModal) {
    reactiveVars.push('const createFormVisible = ref(false);')
  }
  if (hasEditModal) {
    reactiveVars.push('const editFormVisible = ref(false);')
    reactiveVars.push('const editId = ref<string | number | undefined>(undefined);')
  }
  
  // 生成 create 函数
  const createFunction = hasAddModal
    ? `// 新增函数
const create = () => {
  createFormVisible.value = true;
  createFormRef.value?.open?.();
};`
    : pageConfig.add === 'page'
    ? `// 新增函数
const create = () => {
  router.push({
    path: '/${moduleName}/create',
  });
};`
    : ''
  
  // 生成 watch 监听器
  const watchStatements = []
  if (hasEditModal) {
    watchStatements.push(`// 监听 editFormRef 的 editId 变化
watch(
  () => editFormRef.value?.editId,
  (id) => {
    editId.value = id;
  },
);

// 监听 editFormRef 的 formVisible 变化
watch(
  () => editFormRef.value?.formVisible,
  (visible) => {
    editFormVisible.value = visible ?? false;
  },
);`)
  }
  if (hasAddModal) {
    watchStatements.push(`// 监听 createFormRef 的 formVisible 变化
watch(
  () => createFormRef.value?.formVisible,
  (visible) => {
    createFormVisible.value = visible ?? false;
  },
);`)
  }
  
  // 生成成功处理函数
  const successHandlers = []
  if (hasAddModal) {
    successHandlers.push(`// 处理新增成功
const handleCreateSuccess = () => {
  query();
  createFormVisible.value = false;
};`)
  }
  if (hasEditModal) {
    successHandlers.push(`// 处理编辑成功
const handleEditSuccess = () => {
  query();
  editFormVisible.value = false;
};`)
  }
  
  // 生成 useOperateBtns 解构
  const useOperateBtnsDestructure = hasAddModal || hasEditModal
    ? `const { operateBtns, operateRow${hasAddModal ? ', createFormRef' : ''}${hasEditModal ? ', editFormRef' : ''}, selectList } = useOperateBtns(tableRef);`
    : `const { operateBtns, operateRow, selectList } = useOperateBtns(tableRef);`
  
  const script = `<script lang="ts" setup>
${imports.join('\n')}

const {
  totalAll,
  tableColumnData,
  requestColumnCallBack,
  handleSelectionChanged,
  requestDataCallBack,
  tableRef,
  queryAll,
  refresh,
  queryParams,
  reset,
  query,
} = useTable<ListRow, typeof SEARCH_PARAMS>(SEARCH_PARAMS);
${useOperateBtnsDestructure}

${dateRangeVars ? `${dateRangeVars}\n` : ''}${reactiveVars.length > 0 ? `${reactiveVars.join('\n')}\n` : ''}${createFunction ? `${createFunction}\n\n` : ''}${dateRangeHandlers ? `${dateRangeHandlers}\n\n` : ''}${dateRangeWatchers ? `// 监听查询参数变化，同步日期范围选择器
${dateRangeWatchers}

` : ''}${watchStatements.length > 0 ? `${watchStatements.join('\n\n')}\n\n` : ''}${successHandlers.length > 0 ? `${successHandlers.join('\n\n')}` : ''}
</script>`

  const style = `<style lang="scss" scoped>
.${moduleName}-container {
  width: 100%;
  height: 100%;

  .header-opterate {
    display: flex;
    gap: 12px;
  }
  .footer {
    height: 8px;
  }

  :deep(.te-module-table) {
    width: 100% !important;
  }

  :deep(.el-table) {
    width: 100% !important;
  }
}

.row-container {
  padding: 0 24px;
  margin: -12px 0;
  .common-searchbox {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    margin: 12px 0;
    .common-label {
      margin-right: 12px;
      font-size: 14px;
      text-align: right;
      width: 100px;
      flex-shrink: 0; /* 禁止收缩 */
      flex-grow: 0; /* 禁止放大 */
    }

    .search-select,
    .search-date-picker {
      width: 100%;
      min-width: 120px;
    }
  }
}
</style>`

  return `${template}

${script}

${style}`
}
/**
 * 生成新增页面（弹窗/抽屉形式）
 * @param {string} moduleName - 模块名称
 * @param {string} moduleTitle - 模块标题
 * @param {string} interactionType - 交互形式 dialog/drawer
 * @param {Array} formFields - 表单字段配置
 * @returns {string} 新增页面内容
 */
export function generateCreateForm(moduleName, moduleTitle, interactionType, formFields = []) {
  // 生成表单字段
  const formItems = formFields.length > 0
    ? formFields.map(field => {
        const rules = field.required
          ? `:rules="[
          {
            required: true,
            message: '请输入${field.label}',
            trigger: 'blur',
          },
        ]"`
          : ''
        
        let inputComponent = ''
        if (field.type === 'textarea') {
          inputComponent = `<te-input
                  v-model="formData.${field.field}"
                  type="textarea"
                  placeholder="请输入${field.label}"
                  :rows="3"
                />`
        } else if (field.type === 'select') {
          inputComponent = `<te-select
                  v-model="formData.${field.field}"
                  placeholder="请选择${field.label}"
                  clearable
                >
                  <!-- 下拉选项需要根据实际业务配置 -->
                  <te-option label="选项1" value="1" />
                </te-select>`
        } else {
          inputComponent = `<te-input
                  v-model="formData.${field.field}"
                  placeholder="请输入${field.label}"
                  clearable
                />`
        }
        
        return `        <te-col :span="12">
          <te-form-item label="${field.label}" prop="${field.field}" ${rules}>
            ${inputComponent}
          </te-form-item>
        </te-col>`
      }).join('\n')
    : `        <te-col :span="12">
          <te-form-item label="示例字段">
            <te-input
              v-model="formData.id"
              placeholder="请输入"
            />
          </te-form-item>
        </te-col>`
  
  // 生成默认表单数据
  const defaultFormData = formFields.length > 0
    ? formFields.map(f => `  ${f.field}: ${f.type === 'number' ? '0' : "''"},`).join('\n')
    : `  id: '',`
  
  return `<template>
  <div class="${moduleName}-form">
    <te-form ref="ruleFormRef" :model="formData" label-width="100px">
      <te-row :gutter="10">
${formItems}
      </te-row>
    </te-form>
  </div>
</template>
<script lang="ts" setup>
import { cloneDeep } from 'lodash-es';
import { ref } from 'vue';
import { DEFAULT_FORM_DATA } from '../constant.ts';

const emit = defineEmits(['success', 'cancel']);

const formData = ref<{ id?: string; name?: string; [key: string]: any }>(
  cloneDeep(DEFAULT_FORM_DATA),
);
const formVisible = ref(false);

// 打开表单
const open = () => {
  formData.value = cloneDeep(DEFAULT_FORM_DATA);
  formVisible.value = true;
};

// 提交表单
const handleSubmit = async () => {
  emit('success', formData.value);
  formVisible.value = false;
};

defineExpose({
  open,
  formData,
  handleSubmit,
  formVisible,
  cancel: () => {
    formVisible.value = false;
    emit('cancel');
  },
});
</script>

<style lang="scss" scoped>
.${moduleName}-form {
  width: 100%;
  height: 100%;
}
</style>
`
}

/**
 * 生成编辑页面（弹窗/抽屉形式）
 * @param {string} moduleName - 模块名称
 * @param {string} moduleTitle - 模块标题
 * @param {string} interactionType - 交互形式 dialog/drawer
 * @returns {string} 编辑页面内容
 */
export function generateEditForm(moduleName, moduleTitle, interactionType) {
  const componentTag = interactionType === 'dialog' ? 'te-dialog' : 'te-drawer'
  const sizeAttr =
    interactionType === 'dialog' ? 'width="600px"' : 'size="1200"'

  return `<template>
  <${componentTag}
    v-model="formVisible"
    ${sizeAttr}
    @close="reset"
  >
    <template #header>
      <h4 class="drawer-title">编辑${moduleTitle}</h4>
    </template>
    <template #default>
      <div
        v-loading="loading"
        class="form-container"
      >
        <te-form
          ref="formRef"
          :model="formData"
          label-width="100px"
        >
          <te-row>
            <te-col :span="24">
              <te-form-item
                label="名称"
                prop="name"
                :rules="[
                  {
                    required: true,
                    message: '请输入名称',
                    trigger: 'blur',
                  },
                ]"
              >
                <te-input
                  v-model="formData.name"
                  placeholder="请输入名称"
                  clearable
                />
              </te-form-item>
            </te-col>
          </te-row>
        </te-form>
      </div>
    </template>
    <template #footer>
      <div class="drawer-footer">
        <te-button @click="cancelClick">取消</te-button>
        <te-button
          type="primary"
          @click="confirm"
        >确定</te-button>
      </div>
    </template>
  </${componentTag}>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'
import { FormInstance } from '@tiansu/element-plus'
import { getDetail, editData } from '@/apis/${moduleName}'
import { message } from '@/utils/message'

const emit = defineEmits(['success', 'cancel'])

const props = defineProps<{
  editId?: string | number
}>()

const formRef = ref<FormInstance>()
const formVisible = ref(false)
const loading = ref(false)
const editId = ref<string | number | undefined>(props.editId)
const formData = ref({
  id: '',
  name: '',
})

// 获取详情
const fetchDetail = async (id: string | number) => {
  loading.value = true
  try {
    const res = await getDetail(id)
    if (res.errcode === '0' && res.data) {
      formData.value = {
        id: res.data.id ? String(res.data.id) : '',
        name: res.data.name ?? '',
      }
    }
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
}

// 监听 editId 变化
watch(
  () => props.editId,
  (id) => {
    editId.value = id
    if (id) {
      fetchDetail(id)
    }
  },
  { immediate: true },
)

// 重置
const reset = () => {
  formRef.value?.resetFields()
  formData.value = {
    id: '',
    name: '',
  }
}

// 提交
const confirm = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        const res = await editData(formData.value)
        if (res.errcode === '0') {
          message.success('提交成功')
          emit('success')
          formVisible.value = false
          reset()
        }
      } catch (error) {
        console.log(error)
      } finally {
        loading.value = false
      }
    }
  })
}

// 取消
const cancelClick = () => {
  formVisible.value = false
  emit('cancel')
}

// 暴露给父组件使用
defineExpose({
  formVisible,
  editId,
})
</script>

<style lang="scss" scoped>
.form-container {
  padding: 20px;
}
.drawer-title {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
}
.drawer-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
`
}

/**
 * 生成详情页面（弹窗/抽屉形式）
 * @param {string} moduleName - 模块名称
 * @param {string} moduleTitle - 模块标题
 * @param {string} interactionType - 交互形式 dialog/drawer
 * @returns {string} 详情页面内容
 */
export function generateDetailForm(moduleName) {
  return `<template>
  <div class="${moduleName}-detail-container">
    <te-descriptions
      class="delivery-description-custom"
      :column="3"
      border
      size="large"
    >
      <te-descriptions-item label="示例字段" label-class-name="cusLabel"
        >{{ detailInfo?.id || '-' }}</te-descriptions-item
      >
    </te-descriptions>
  </div>
</template>
<script lang="ts" setup>
import { DetailType } from '@/apis/${moduleName}/index.api';
import { PropType } from 'vue';

defineProps({
  detailInfo: {
    type: Object as PropType<DetailType>,
    default: () => ({}),
  },
});
</script>

<style lang="scss" scoped>
.${moduleName}-detail-container {
  width: 100%;
  height: 100%;
}
</style>
`
}

/**
 * 生成简单的新增页面（单独页面形式）
 * @param {string} moduleName - 模块名称
 * @param {string} moduleTitle - 模块标题
 * @returns {string} 新增页面内容
 */
export function generateAddPage(moduleName, moduleTitle) {
  const pascalName = camelToPascal(moduleName)
  return `<template>
  <div
    v-loading="loading"
    class="form-container"
  >
    <te-page-header
      @back="router.back()"
      :icon="ArrowLeft"
    >
      <template #content>
        <span class="page-title">新增${moduleTitle}</span>
      </template>
      <template #extra>
        <te-button
          type="primary"
          @click="handleSubmit"
          :loading="submitting"
        >保存</te-button>
      </template>
      <div class="main-content">
        <te-form
          ref="formRef"
          :model="formData"
          label-width="100px"
        >
          <te-row>
            <te-col :span="24">
              <te-form-item
                label="名称"
                prop="name"
                :rules="[
                  {
                    required: true,
                    message: '请输入名称',
                    trigger: 'blur',
                  },
                ]"
              >
                <te-input
                  v-model="formData.name"
                  placeholder="请输入名称"
                  clearable
                />
              </te-form-item>
            </te-col>
          </te-row>
        </te-form>
      </div>
    </te-page-header>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { ArrowLeft } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { FormInstance } from '@tiansu/element-plus'
import { createData } from '@/apis/${moduleName}'
import type { FormData } from '@/apis/${moduleName}/index.api'
import { message } from '@/utils/message'

defineOptions({
  name: '${pascalName}Add',
})

const router = useRouter()

// 表单引用
const formRef = ref<FormInstance>()

// 加载状态
const loading = ref(false)
const submitting = ref(false)

// 表单数据
const formData = ref<FormData>({
  name: '',
})

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  // 表单验证
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true
      try {
        const res = await createData(formData.value)
        // 处理响应结果
        if (res?.errcode === '0' || res?.data?.errcode === '0') {
          message.success('新增成功')
          // 延迟一下再返回，让用户看到成功提示
          setTimeout(() => {
            router.back()
          }, 500)
        } else {
          // 如果接口返回了错误信息，显示错误提示
          const errorMsg = res?.message || res?.data?.message || '新增失败，请重试'
          message.error(errorMsg)
        }
      } catch (error: any) {
        // 捕获异常并显示错误信息
        const errorMsg = error?.message || error?.response?.data?.message || '新增失败，请重试'
        message.error(errorMsg)
        console.error('新增失败:', error)
      } finally {
        submitting.value = false
      }
    }
  })
}
</script>

<style lang="scss" scoped>
.form-container {
  width: 100%;
  display: flex;
  flex-direction: column;

  .page-title {
    color: var(--te-text-color-primary, rgba(0, 0, 0, 0.85));
    font-family: var(--fontfamily, 'PingFang SC');
    font-weight: 600;
    font-size: 20px;
    line-height: 28px;
  }

  :deep(.is-contentful) {
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  :deep(.te-page-header__main) {
    flex: 1;
    height: 0;
  }

  .main-content {
    height: 100%;
    padding: 20px 0;
  }
}
</style>
`
}

/**
 * 生成简单的编辑页面（单独页面形式）
 * @param {string} moduleName - 模块名称
 * @param {string} moduleTitle - 模块标题
 * @returns {string} 编辑页面内容
 */
export function generateEditPage(moduleName, moduleTitle) {
  const pascalName = camelToPascal(moduleName)
  return `<template>
  <div
    v-loading="loading"
    class="form-container"
  >
    <te-page-header
      @back="router.back()"
      :icon="ArrowLeft"
    >
      <template #content>
        <span class="page-title">编辑${moduleTitle}</span>
      </template>
      <template #extra>
        <te-button
          type="primary"
          @click="handleSubmit"
          :loading="submitting"
        >保存</te-button>
      </template>
      <div class="main-content">
        <te-form
          ref="formRef"
          :model="formData"
          label-width="100px"
        >
          <te-row>
            <te-col :span="24">
              <te-form-item
                label="名称"
                prop="name"
                :rules="[
                  {
                    required: true,
                    message: '请输入名称',
                    trigger: 'blur',
                  },
                ]"
              >
                <te-input
                  v-model="formData.name"
                  placeholder="请输入名称"
                  clearable
                />
              </te-form-item>
            </te-col>
          </te-row>
        </te-form>
      </div>
    </te-page-header>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { ArrowLeft } from '@element-plus/icons-vue'
import { useRoute, useRouter } from 'vue-router'
import { FormInstance } from '@tiansu/element-plus'
import { getDetail, editData } from '@/apis/${moduleName}'
import type { FormData } from '@/apis/${moduleName}/index.api'
import { message } from '@/utils/message'

defineOptions({
  name: '${pascalName}Edit',
})

const route = useRoute()
const router = useRouter()

// 表单引用
const formRef = ref<FormInstance>()

// 加载状态
const loading = ref(false)
const submitting = ref(false)

// 表单数据
const formData = ref<FormData>({
  id: '',
  name: '',
})

// 获取详情
const fetchDetail = async () => {
  const id = route.query.id || route.params.id
  if (!id) {
    message.error('缺少必要参数')
    router.back()
    return
  }

  // 处理路由参数类型转换
  const idValue = Array.isArray(id) ? id[0] : id
  const idStr = typeof idValue === 'string' ? idValue : String(idValue)

  loading.value = true
  try {
    const res = await getDetail(idStr)
    if (res.errcode === '0' && res.data) {
      formData.value = {
        id: res.data.id ? String(res.data.id) : '',
        name: res.data.name ?? '',
      }
    } else {
      const errorMsg = res?.message || '获取详情失败'
      message.error(errorMsg)
    }
  } catch (error: any) {
    const errorMsg = error?.message || error?.response?.data?.message || '获取详情失败'
    message.error(errorMsg)
    console.error('获取详情失败:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchDetail()
})

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  // 表单验证
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true
      try {
        const res = await editData(formData.value)
        // 处理响应结果
        if (res?.errcode === '0' || res?.data?.errcode === '0') {
          message.success('编辑成功')
          // 延迟一下再返回，让用户看到成功提示
          setTimeout(() => {
            router.back()
          }, 500)
        } else {
          // 如果接口返回了错误信息，显示错误提示
          const errorMsg = res?.message || res?.data?.message || '编辑失败，请重试'
          message.error(errorMsg)
        }
      } catch (error: any) {
        // 捕获异常并显示错误信息
        const errorMsg = error?.message || error?.response?.data?.message || '编辑失败，请重试'
        message.error(errorMsg)
        console.error('编辑失败:', error)
      } finally {
        submitting.value = false
      }
    }
  })
}
</script>

<style lang="scss" scoped>
.form-container {
  width: 100%;
  display: flex;
  flex-direction: column;

  .page-title {
    color: var(--te-text-color-primary, rgba(0, 0, 0, 0.85));
    font-family: var(--fontfamily, 'PingFang SC');
    font-weight: 600;
    font-size: 20px;
    line-height: 28px;
  }

  :deep(.is-contentful) {
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  :deep(.te-page-header__main) {
    flex: 1;
    height: 0;
  }

  .main-content {
    height: 100%;
    padding: 20px 0;
  }
}
</style>
`
}

/**
 * 生成简单的详情页面（单独页面形式）
 * @param {string} moduleName - 模块名称
 * @param {string} moduleTitle - 模块标题
 * @returns {string} 详情页面内容
 */
export function generateDetailPage(moduleName, moduleTitle) {
  const pascalName = camelToPascal(moduleName)
  return `<template>
  <div
    v-loading="loading"
    class="form-container"
  >
    <te-page-header
      @back="router.back()"
      :icon="ArrowLeft"
    >
      <template #content>
        <span class="page-title">${moduleTitle}详情</span>
      </template>
      <div class="main-content">
        <!-- 在这里添加你的详情内容 -->
        <div v-if="detailData">
          <p>详情数据：{{ detailData }}</p>
        </div>
      </div>
    </te-page-header>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { ArrowLeft } from '@element-plus/icons-vue'
import { useRoute, useRouter } from 'vue-router'
import { getDetail } from '@/apis/${moduleName}'

defineOptions({
  name: '${pascalName}Detail',
})

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const detailData = ref<any>({})

// 获取详情
const fetchDetail = async () => {
  const id = route.query.id || route.params.id
  if (id) {
    // 处理路由参数类型转换
    const idValue = Array.isArray(id) ? id[0] : id
    const idStr = typeof idValue === 'string' ? idValue : String(idValue)
    loading.value = true
    try {
      const res = await getDetail(idStr)
      if (res.errcode === '0' && res.data) {
        detailData.value = res.data
      }
    } catch (error) {
      console.log(error)
    } finally {
      loading.value = false
    }
  }
}

onMounted(() => {
  fetchDetail()
})
</script>

<style lang="scss" scoped>
.form-container {
  width: 100%;
  display: flex;
  flex-direction: column;

  .page-title {
    color: var(--te-text-color-primary, rgba(0, 0, 0, 0.85));
    font-family: var(--fontfamily, 'PingFang SC');
    font-weight: 600;
    font-size: 20px;
    line-height: 28px;
  }

  :deep(.is-contentful) {
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  :deep(.te-page-header__main) {
    flex: 1;
    height: 0;
  }

  .main-content {
    height: 100%;
    padding: 20px 0;
  }
}
</style>
`
}

/**
 * 创建视图相关文件
 * @param {string} viewDir - 视图目录路径
 * @param {string} moduleName - 模块名称
 * @param {string} moduleTitle - 模块标题
 * @param {Object} pageConfig - 页面配置 {add: 'dialog'|'drawer'|'page'|null, edit: ..., detail: ...}
 * @param {boolean} needDelete - 是否需要删除功能
 * @param {Array<{label: string, field: string}>} searchFields - 搜索条件配置
 */
export function createViewFiles(
  viewDir,
  moduleName,
  moduleTitle,
  pageConfig = {},
  needDelete = true,
  searchFields = [],
  tableConfig = { showIndexColumn: false, enableSelection: false, enableBatchDelete: false },
  otherFeatures = { enableExport: false, enableImport: false },
  formFields = { add: [], edit: [] },
) {
  // 创建视图目录
  mkdirSync(viewDir, { recursive: true })
  console.log(`✅ 创建View目录: ${getRelativePath(viewDir)}`)

  // 创建 constant.ts 文件
  createFileIfNotExists(
    join(viewDir, 'constant.ts'),
    generateConstantFile(moduleName, searchFields, tableConfig, otherFeatures),
    '常量文件',
  )

  // 创建 hooks 目录和 useBtnHandles.ts
  const hooksDir = join(viewDir, 'hooks')
  mkdirSync(hooksDir, { recursive: true })
  createFileIfNotExists(
    join(hooksDir, 'useBtnHandles.ts'),
    generateUseBtnHandles(moduleName, moduleTitle, pageConfig, needDelete),
    '按钮操作 hooks',
  )

  // 创建 components 目录和 comp.vue
  const componentsDir = join(viewDir, 'components')
  mkdirSync(componentsDir, { recursive: true })
  createFileIfNotExists(
    join(componentsDir, 'comp.vue'),
    generateCompFile(),
    '组件示例',
  )

  // 创建modules目录（所有新增、编辑、详情页面都放在这里）
  const modulesDir = join(viewDir, 'modules')
  const hasPages = Object.values(pageConfig).some((type) => type !== null)
  if (hasPages) {
    mkdirSync(modulesDir, { recursive: true })
  }

  // 创建列表页（主页面）
  createFileIfNotExists(
    join(viewDir, 'index.vue'),
    generateListView(
      moduleName,
      moduleTitle,
      pageConfig,
      needDelete,
      searchFields,
      tableConfig,
      otherFeatures,
    ),
    '列表页面',
  )

  // 根据选择创建页面（所有页面都放在 modules 目录下）
  if (pageConfig.add) {
    if (pageConfig.add === 'dialog' || pageConfig.add === 'drawer') {
      createFileIfNotExists(
        join(modulesDir, 'createForm.vue'),
        generateCreateForm(moduleName, moduleTitle, pageConfig.add, formFields.add || []),
        '新增表单组件',
      )
    } else if (pageConfig.add === 'page') {
      createFileIfNotExists(
        join(modulesDir, 'add.vue'),
        generateAddPage(moduleName, moduleTitle),
        '新增页面',
      )
    }
  }

  if (pageConfig.edit) {
    if (pageConfig.edit === 'dialog' || pageConfig.edit === 'drawer') {
      createFileIfNotExists(
        join(modulesDir, 'editForm.vue'),
        generateEditForm(moduleName, moduleTitle, pageConfig.edit),
        '编辑表单组件',
      )
    } else if (pageConfig.edit === 'page') {
      createFileIfNotExists(
        join(modulesDir, 'edit.vue'),
        generateEditPage(moduleName, moduleTitle),
        '编辑页面',
      )
    }
  }

  if (pageConfig.detail) {
    if (pageConfig.detail === 'dialog' || pageConfig.detail === 'drawer') {
      createFileIfNotExists(
        join(modulesDir, 'detail.vue'),
        generateDetailForm(moduleName),
        '详情组件',
      )
    } else if (pageConfig.detail === 'page') {
      createFileIfNotExists(
        join(modulesDir, 'detail.vue'),
        generateDetailPage(moduleName, moduleTitle),
        '详情页面',
      )
    }
  }
}
