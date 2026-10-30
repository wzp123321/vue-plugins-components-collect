<!--
 * 场景上下文：@visactor/vtable 上的「常见 BI 数据录入」场景，能力面对齐站内 vxe 录入台
 *   （pages/form-enhance/excel-data-entry-vxe），但走 VTable 原生能力，不重写 Excel 仿真层。
 * 技术组合：Vue3 <script setup> + @visactor/vtable 1.26.x + @visactor/vtable-editors 1.26.x
 *          + ExcelJS（导入导出）+ file-saver + Element Plus
 * 模块划分（./bi-entry/*）：
 *   schema.ts        数据契约（列/行/规则/字典/工具）
 *   useBiColumns     列结构增删改、显隐/冻结/分组、列模板、列宽分配
 *   useBiValidation  声明式校验（必填/范围/整数/长度/正则/唯一/跨列/服务端）
 *   useBiQuery       全局搜索、每列筛选、多列排序、查询 chips、分页
 *   useBiHistory     撤销重做（结构快照 + 单元格增量）
 *   useBiActions     行操作、批量填充、序列填充、演示/压测数据、提交
 *   useBiIO          Excel 导入 / 三档导出
 * 本文件负责：VTable 实例与事件接线、键盘流、填充柄、右键菜单、全部 UI。
 * 踩坑落点：见 .workbuddy/memory/MEMORY.md「接缝本」
 -->
<template>
  <div class="vt-bi" @keydown.esc="closeOverlays">
    <!-- ===================== 工具栏 ===================== -->
    <div class="vt-bi__toolbar bi-toolbar">
      <div class="vt-bi__group">
        <el-tooltip content="新增行（追加到末尾）" placement="bottom">
          <el-button :icon="Plus" size="small" @click="onAddRow" />
        </el-tooltip>
        <el-tooltip content="在当前行下方插入" placement="bottom">
          <el-button :icon="Bottom" size="small" @click="onInsertRow" />
        </el-tooltip>
        <el-tooltip content="删除选中行" placement="bottom">
          <el-button
            type="danger"
            plain
            :icon="Delete"
            size="small"
            :disabled="selectedCount === 0"
            @click="onDeleteSelected"
          />
        </el-tooltip>
        <el-tooltip content="复制选中行" placement="bottom">
          <el-button :icon="CopyDocument" size="small" :disabled="selectedCount === 0" @click="onDuplicate" />
        </el-tooltip>
      </div>

      <el-divider direction="vertical" />

      <div class="vt-bi__group">
        <el-tooltip content="新增列" placement="bottom">
          <el-button :icon="Grid" size="small" @click="openAddCol" />
        </el-tooltip>
        <el-tooltip content="列设置 / 列模板" placement="bottom">
          <el-button :icon="Setting" size="small" @click="colDrawer = true" />
        </el-tooltip>
        <el-tooltip content="合并选中区域" placement="bottom">
          <el-button :icon="FullScreen" size="small" :disabled="!hasSelection" @click="mergeSelection" />
        </el-tooltip>
        <el-tooltip content="取消全部合并" placement="bottom">
          <el-button :icon="Aim" size="small" @click="clearMerges" />
        </el-tooltip>
      </div>

      <el-divider direction="vertical" />

      <div class="vt-bi__group">
        <el-tooltip :content="`撤销${undoLabel ? '：' + undoLabel : ''} (Ctrl+Z)`" placement="bottom">
          <el-button :icon="RefreshLeft" size="small" :disabled="!canUndo" @click="onUndo" />
        </el-tooltip>
        <el-tooltip :content="`重做${redoLabel ? '：' + redoLabel : ''} (Ctrl+Y)`" placement="bottom">
          <el-button :icon="RefreshRight" size="small" :disabled="!canRedo" @click="onRedo" />
        </el-tooltip>
      </div>

      <el-divider direction="vertical" />

      <div class="vt-bi__group">
        <el-input
          v-model="query.searchText.value"
          size="small"
          clearable
          :prefix-icon="Search"
          placeholder="搜索全部字段…"
          class="vt-bi__search"
        />
        <el-tooltip content="查找替换 (Ctrl+F)" placement="bottom">
          <el-button :icon="Aim" size="small" :type="findVisible ? 'primary' : 'info'" plain @click="toggleFind" />
        </el-tooltip>
        <el-tooltip content="筛选 / 排序" placement="bottom">
          <el-button :icon="Filter" size="small" :type="query.filters.value.length ? 'primary' : 'info'" plain @click="queryDrawer = true" />
        </el-tooltip>
      </div>

      <el-divider direction="vertical" />

      <div class="vt-bi__group">
        <el-tooltip content="导入 Excel（覆盖当前数据）" placement="bottom">
          <el-button :icon="Upload" size="small" @click="importExcel" />
        </el-tooltip>
        <el-dropdown trigger="click" @command="onExportCommand">
          <el-button :icon="Download" size="small" />
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="all">导出 Excel（全部 {{ records.length }} 行）</el-dropdown-item>
              <el-dropdown-item command="result">导出 Excel（当前结果 {{ processedRows.length }} 行）</el-dropdown-item>
              <el-dropdown-item command="csv">导出 CSV（当前结果）</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>

      <el-divider direction="vertical" />

      <div class="vt-bi__group">
        <el-tooltip content="删除空行（业务列全空）" placement="bottom">
          <el-button :icon="DocumentDelete" size="small" plain @click="onRemoveEmpty" />
        </el-tooltip>
        <el-tooltip content="去重（整行相同只留首行）" placement="bottom">
          <el-button :icon="DocumentCopy" size="small" plain @click="onRemoveDup" />
        </el-tooltip>
        <el-tooltip content="清空全部数据" placement="bottom">
          <el-button :icon="Close" size="small" plain @click="onClearAll" />
        </el-tooltip>
        <el-tooltip content="保存本地草稿 / 恢复示例数据" placement="bottom">
          <el-button :icon="Files" size="small" plain @click="saveDraft" />
        </el-tooltip>
        <el-tooltip content="重置为示例数据" placement="bottom">
          <el-button :icon="Refresh" size="small" plain @click="resetDraft" />
        </el-tooltip>
      </div>

      <el-divider direction="vertical" />

      <el-tooltip content="提交（mock 服务端校验）" placement="bottom">
        <el-button type="success" :icon="SelectIcon" size="small" :loading="submitting" @click="onSubmit">提交</el-button>
      </el-tooltip>

      <el-divider direction="vertical" />

      <div class="vt-bi__group">
        <el-dropdown trigger="click" @command="onPresetCommand">
          <el-button size="small" plain type="primary">
            数据
            <el-icon class="el-icon--right"><ArrowDown /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="preset">预制 500 行演示数据</el-dropdown-item>
              <el-dropdown-item v-for="n in GEN_SIZES" :key="n" :command="n" divided>
                压测：生成 {{ genLabel(n) }} 行
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>

      <el-divider direction="vertical" />

      <div class="vt-bi__group">
        <el-dropdown trigger="click" @command="onViewCommand">
          <el-button size="small">
            {{ query.viewMode.value === 'virtual' ? '虚拟滚动' : '分页' }}
            <el-icon class="el-icon--right"><ArrowDown /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="virtual">虚拟滚动</el-dropdown-item>
              <el-dropdown-item command="paged">分页</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <el-tooltip content="列汇总条" placement="bottom">
          <el-switch v-model="showSummary" size="small" inline-prompt active-text="汇" inactive-text="汇" />
        </el-tooltip>
        <el-tooltip content="条件格式（数值列数据条）" placement="bottom">
          <el-switch v-model="conditionalOn" size="small" inline-prompt active-text="条" inactive-text="条" />
        </el-tooltip>
        <el-tooltip content="批量填充 / 清空列" placement="bottom">
          <el-button :icon="Operation" size="small" :type="fillVisible ? 'primary' : 'info'" plain @click="fillVisible = !fillVisible" />
        </el-tooltip>
        <el-tooltip content="校验面板" placement="bottom">
          <el-badge :value="errorCount" :hidden="errorCount === 0" type="danger" class="vt-bi__badge">
            <el-button :icon="Warning" size="small" @click="errDrawer = true" />
          </el-badge>
        </el-tooltip>
        <el-tooltip content="快捷键帮助 (F1)" placement="bottom">
          <el-button :icon="QuestionFilled" size="small" plain @click="helpVisible = true" />
        </el-tooltip>
      </div>

      <input ref="fileInput" type="file" accept=".xlsx,.xls" class="vt-bi__file" @change="onFileChange" />
    </div>

    <!-- ===================== 查询 chips ===================== -->
    <div v-if="chips.length" class="vt-bi__chips">
      <span class="vt-bi__chips-label">查询条件</span>
      <el-tag
        v-for="c in chips"
        :key="c.key"
        :type="chipTagType(c.kind)"
        closable
        size="small"
        @close="c.remove()"
      >
        {{ c.label }}
      </el-tag>
      <el-button size="small" text type="primary" @click="query.clearAllQuery()">清空全部</el-button>
    </div>

    <!-- ===================== 查找替换条 ===================== -->
    <div v-if="findVisible" class="vt-bi__bar">
      <el-input v-model="findText" size="small" placeholder="查找内容" class="vt-bi__bar-input" @keyup.enter="findNext" />
      <span class="vt-bi__bar-count">{{ findIndexLabel }}</span>
      <el-button size="small" :icon="ArrowUp" @click="findPrev" />
      <el-button size="small" :icon="ArrowDown" @click="findNext" />
      <el-input v-model="replaceText" size="small" placeholder="替换为" class="vt-bi__bar-input" />
      <el-button size="small" :disabled="!hasMatches" @click="replaceCurrent">替换</el-button>
      <el-button size="small" type="primary" plain :disabled="!hasMatches" @click="replaceAll">全部替换</el-button>
      <el-button size="small" text :icon="Close" @click="findVisible = false" />
    </div>

    <!-- ===================== 批量填充条 ===================== -->
    <div v-if="fillVisible" class="vt-bi__bar">
      <span class="vt-bi__bar-label">列</span>
      <el-select v-model="fillField" size="small" placeholder="选择列" class="vt-bi__bar-select">
        <el-option v-for="c in visibleCols" :key="c.field" :label="c.label" :value="c.field" />
      </el-select>
      <el-input v-model="fillValue" size="small" placeholder="填入值" class="vt-bi__bar-input" />
      <el-select v-model="fillScope" size="small" class="vt-bi__bar-select">
        <el-option label="选区" value="selected" />
        <el-option label="当前结果" value="result" />
        <el-option label="全部" value="all" />
      </el-select>
      <el-button size="small" type="primary" @click="doBatchFill">填充</el-button>
      <el-button size="small" @click="doBatchClear">清空该列</el-button>
      <span class="vt-bi__bar-hint">选区模式先拖拽框选；数字列只接受数值</span>
    </div>

    <!-- ===================== 表格 ===================== -->
    <div ref="tableRef" class="vt-bi__table bi-panel"></div>

    <!-- ===================== 列汇总 ===================== -->
    <div v-if="showSummary" class="vt-bi__summary">
      <span class="vt-bi__summary-title">汇总（当前结果）</span>
      <span v-for="s in summaryItems" :key="s.field" class="vt-bi__summary-item">
        <b>{{ s.label }}</b>
        合计 {{ s.sum }} · 均值 {{ s.avg }} · 最大 {{ s.max }} · 最小 {{ s.min }} · {{ s.count }} 项
      </span>
      <span v-if="!summaryItems.length" class="vt-bi__summary-item">当前结果没有可统计的数值列</span>
    </div>

    <!-- ===================== 分页 ===================== -->
    <div v-if="query.viewMode.value === 'paged'" class="vt-bi__pager">
      <el-pagination
        v-model:current-page="query.page.value"
        v-model:page-size="query.pageSize.value"
        :total="processedRows.length"
        :page-sizes="[50, 100, 200, 500]"
        layout="total, sizes, prev, pager, next"
        size="small"
        background
      />
    </div>

    <!-- ===================== 状态栏 ===================== -->
    <div class="vt-bi__status bi-statusbar">
      <span class="vt-bi__status-pos sb-item pos">{{ posLabel }}</span>
      <span class="sb-item">行数 <b>{{ displayRows.length }}</b>/{{ records.length }}</span>
      <span class="sb-item">改动 <b :class="{ 'c-warn': dirtyCount > 0 }">{{ dirtyCount }}</b></span>
      <span class="sb-item">选中 <b :class="{ 'c-ok': selectedCount > 0 }">{{ selectedCount }}</b></span>
      <span class="sb-item">错误 <b :class="{ 'c-danger': errorCount > 0 }">{{ errorCount }}</b></span>
      <template v-if="activeStats">
        <span class="sb-sep" />
        <span class="sb-item">{{ activeColLabel }}：</span>
        <span class="sb-item">计数 <b>{{ activeStats.count }}</b></span>
        <span class="sb-item">求和 <b>{{ activeStats.sum }}</b></span>
        <span class="sb-item">平均 <b>{{ activeStats.avg }}</b></span>
        <span class="sb-item">最大 <b>{{ activeStats.max }}</b></span>
        <span class="sb-item">最小 <b>{{ activeStats.min }}</b></span>
      </template>
      <template v-if="selectionStats">
        <span class="sb-sep" />
        <span class="sb-item">选区：</span>
        <span class="sb-item">计数 <b>{{ selectionStats.count }}</b></span>
        <span class="sb-item">求和 <b>{{ selectionStats.sum }}</b></span>
        <span class="sb-item">平均 <b>{{ selectionStats.avg }}</b></span>
        <span class="sb-item">最大 <b>{{ selectionStats.max }}</b></span>
        <span class="sb-item">最小 <b>{{ selectionStats.min }}</b></span>
      </template>
      <span class="sb-tip">
        F1 快捷键 · 拖右下角方块填充（双击填到底）· Ctrl+D 向下 / Ctrl+R 向右填充 · 右键菜单
      </span>
    </div>

    <!-- ===================== 右键菜单 ===================== -->
    <div v-if="menu.show" class="vt-bi__menu" :style="{ left: `${menu.x}px`, top: `${menu.y}px` }">
      <div class="vt-bi__menu-item" @click="menuAct('copy')">复制</div>
      <div class="vt-bi__menu-item" @click="menuAct('paste')">粘贴</div>
      <div class="vt-bi__menu-sep" />
      <div class="vt-bi__menu-item" @click="menuAct('insertUp')">在上方插入行</div>
      <div class="vt-bi__menu-item" @click="menuAct('insertDown')">在下方插入行</div>
      <div class="vt-bi__menu-sep" />
      <div class="vt-bi__menu-item" @click="menuAct('clear')">清空内容</div>
      <div class="vt-bi__menu-item danger" @click="menuAct('deleteRow')">删除本行</div>
    </div>

    <!-- ===================== 校验抽屉 ===================== -->
    <el-drawer v-model="errDrawer" title="校验未通过" size="420px">
      <el-empty v-if="!errorItems.length" description="没有校验错误" :image-size="80" />
      <div v-else class="vt-bi__errlist">
        <div v-for="e in errorItems" :key="e.key" class="vt-bi__errrow" @click="jumpToError(e)">
          <span class="vt-bi__errrow-pos">第 {{ e.rowNo }} 行</span>
          <span class="vt-bi__errrow-label">{{ e.label }}</span>
          <span class="vt-bi__errrow-msg">{{ e.msg }}</span>
        </div>
      </div>
    </el-drawer>

    <!-- ===================== 列设置抽屉 ===================== -->
    <el-drawer v-model="colDrawer" title="列设置" size="560px">
      <div class="vt-bi__colebar">
        <el-select v-model="newColType" size="small" class="vt-bi__coleselect">
          <el-option v-for="(l, t) in typeLabel" :key="t" :label="l" :value="t" />
        </el-select>
        <el-button size="small" type="primary" :icon="Plus" @click="onAddCol">新增列</el-button>
        <el-button size="small" plain @click="onSaveTemplate">存为模板</el-button>
        <el-select v-model="tplPick" size="small" placeholder="加载模板" class="vt-bi__coleselect" @change="onLoadTemplate">
          <el-option v-for="t in templates" :key="t.name" :label="t.name" :value="t.name" />
        </el-select>
        <el-button size="small" plain :disabled="!tplPick" @click="onRemoveTemplate">删除模板</el-button>
      </div>

      <el-table :data="cols" size="small" border height="calc(100% - 56px)">
        <el-table-column label="列名" min-width="120">
          <template #default="{ row }">
            <el-input v-model="row.label" size="small" @change="onColMetaChange" />
          </template>
        </el-table-column>
        <el-table-column label="类型" width="94">
          <template #default="{ row }">
            <el-select v-model="row.type" size="small" @change="onColTypeChange(row as unknown as BiCol)">
              <el-option v-for="(l, t) in typeLabel" :key="t" :label="l" :value="t" />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column label="可见" width="60" align="center">
          <template #default="{ row }">
            <el-switch v-model="row.visible" size="small" @change="rebuild" />
          </template>
        </el-table-column>
        <el-table-column label="冻结" width="60" align="center">
          <template #default="{ row }">
            <el-switch v-model="row.frozen" size="small" @change="rebuild" />
          </template>
        </el-table-column>
        <el-table-column label="序" width="86" align="center">
          <template #default="{ $index }">
            <el-button size="small" text :icon="ArrowUp" :disabled="$index === 0" @click="onMoveCol($index, -1)" />
            <el-button size="small" text :icon="ArrowDown" :disabled="$index === cols.length - 1" @click="onMoveCol($index, 1)" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="128" align="center">
          <template #default="{ row }">
            <el-button size="small" text type="primary" @click="openColConfig(row as unknown as BiCol)">配置</el-button>
            <el-button size="small" text type="danger" @click="onRemoveCol(row as unknown as BiCol)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-drawer>

    <!-- ===================== 单列配置（校验规则 / 跨列规则） ===================== -->
    <el-dialog v-model="colConfigVisible" title="列配置" width="640px" append-to-body>
      <el-form v-if="editingCol" label-width="96px" size="small" class="vt-bi__ruleform">
        <el-form-item label="列名">
          <el-input v-model="editingCol.label" />
        </el-form-item>
        <el-form-item v-if="editingCol.type === 'select'" label="可选项">
          <el-select v-model="editingCol.options" multiple filterable allow-create default-first-option placeholder="回车新增选项" class="vt-bi__full">
            <el-option v-for="o in editingCol.options ?? []" :key="o" :label="o" :value="o" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="editingCol.type === 'date'" label="显示格式">
          <el-select v-model="editingCol.dateFormat" class="vt-bi__full">
            <el-option label="YYYY-MM-DD" value="YYYY-MM-DD" />
            <el-option label="YYYY/MM/DD" value="YYYY/MM/DD" />
            <el-option label="MM-DD" value="MM-DD" />
          </el-select>
        </el-form-item>
        <el-form-item label="表头分组">
          <el-input v-model="editingCol.group" placeholder="同名的连续列会合并成父表头" />
        </el-form-item>
        <el-form-item label="必填">
          <el-switch v-model="editingCol.required" />
        </el-form-item>
        <el-form-item v-if="editingCol.type === 'number'" label="数值规则">
          <div class="vt-bi__ruleline">
            <el-input-number v-model="rulesDraft.min" :controls="false" placeholder="最小" size="small" />
            <el-input-number v-model="rulesDraft.max" :controls="false" placeholder="最大" size="small" />
            <el-checkbox v-model="rulesDraft.integer">整数</el-checkbox>
          </div>
        </el-form-item>
        <el-form-item label="长度限制">
          <div class="vt-bi__ruleline">
            <el-input-number v-model="rulesDraft.minLen" :controls="false" :min="0" placeholder="最小长度" size="small" />
            <el-input-number v-model="rulesDraft.maxLen" :controls="false" :min="0" placeholder="最大长度" size="small" />
          </div>
        </el-form-item>
        <el-form-item label="正则">
          <div class="vt-bi__ruleline">
            <el-input v-model="rulesDraft.pattern" placeholder="正则源（不带斜杠），如 ^\d{6}$" />
            <el-input v-model="rulesDraft.patternMsg" placeholder="不匹配时的提示" />
          </div>
        </el-form-item>
        <el-form-item label="唯一">
          <el-checkbox v-model="rulesDraft.unique">整列不可重复</el-checkbox>
        </el-form-item>
        <el-form-item label="跨列规则">
          <div class="vt-bi__crosslist">
            <div v-for="(r, i) in crossDraft" :key="i" class="vt-bi__crossrow">
              <el-select v-model="r.kind" size="small" class="vt-bi__crosskind">
                <el-option label="≥ 参照列" value="gte" />
                <el-option label="≤ 参照列" value="lte" />
                <el-option label="= 参照列" value="eq" />
                <el-option label="参照列非空时必填" value="requiredIf" />
              </el-select>
              <el-select v-model="r.other" size="small" placeholder="参照列" class="vt-bi__crossother">
                <el-option v-for="c in cols.filter((x) => x.field !== editingCol?.field)" :key="c.field" :label="c.label" :value="c.field" />
              </el-select>
              <el-input v-model="r.msg" size="small" placeholder="提示文案" />
              <el-button size="small" text type="danger" :icon="Delete" @click="crossDraft.splice(i, 1)" />
            </div>
            <el-button size="small" text type="primary" :icon="Plus" @click="crossDraft.push({ kind: 'gte', other: '', msg: '' })">
              添加跨列规则
            </el-button>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button size="small" @click="colConfigVisible = false">取消</el-button>
        <el-button size="small" type="primary" @click="applyColConfig">保存</el-button>
      </template>
    </el-dialog>

    <!-- ===================== 筛选 / 排序抽屉 ===================== -->
    <el-drawer v-model="queryDrawer" title="筛选 / 排序" size="420px">
      <div class="vt-bi__querybox">
        <el-select v-model="queryField" size="small" placeholder="选择列" class="vt-bi__coleselect">
          <el-option v-for="c in visibleCols" :key="c.field" :label="c.label" :value="c.field" />
        </el-select>
        <el-button size="small" @click="query.cycleSort(queryField, true)" :disabled="!queryField">按此列排序</el-button>
      </div>

      <template v-if="queryCol">
        <div class="vt-bi__querysub">{{ queryCol.label }} · 筛选</div>
        <template v-if="queryCol.type === 'number'">
          <div class="vt-bi__querybox">
            <el-input-number v-model="filterDraft.min" :controls="false" size="small" placeholder="最小值" />
            <el-input-number v-model="filterDraft.max" :controls="false" size="small" placeholder="最大值" />
            <el-button size="small" type="primary" @click="applyFilter">应用</el-button>
            <el-button size="small" @click="clearFilterOf(queryField)">清除</el-button>
          </div>
        </template>
        <template v-else>
          <el-select v-model="filterDraft.values" multiple filterable allow-create size="small" placeholder="选择或输入取值" class="vt-bi__full">
            <el-option v-for="v in distinctValues" :key="v" :label="v" :value="v" />
          </el-select>
          <div class="vt-bi__querybox">
            <el-button size="small" type="primary" @click="applyFilter">应用</el-button>
            <el-button size="small" @click="clearFilterOf(queryField)">清除</el-button>
          </div>
        </template>
      </template>

      <el-divider>当前条件</el-divider>
      <el-empty v-if="!chips.length" description="没有筛选或排序条件" :image-size="60" />
      <div v-else class="vt-bi__querylist">
        <el-tag v-for="c in chips" :key="c.key" size="small" closable @close="c.remove()">{{ c.label }}</el-tag>
      </div>
    </el-drawer>

    <!-- ===================== 快捷键帮助 ===================== -->
    <el-dialog v-model="helpVisible" title="快捷键与操作" width="620px" append-to-body>
      <el-table :data="HELP_ROWS" size="small" border>
        <el-table-column prop="key" label="快捷键" width="180" />
        <el-table-column prop="desc" label="作用" />
      </el-table>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, shallowRef, watch } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  Aim,
  ArrowDown,
  ArrowUp,
  Bottom,
  Close,
  CopyDocument,
  Delete,
  DocumentCopy,
  DocumentDelete,
  Download,
  Files,
  Filter,
  FullScreen,
  Grid,
  Operation,
  Plus,
  QuestionFilled,
  Refresh,
  RefreshLeft,
  RefreshRight,
  Search,
  Select as SelectIcon,
  Setting,
  Upload,
  Warning,
} from '@element-plus/icons-vue';
import { ListTable, register, themes, type ColumnsDefine } from '@visactor/vtable';
import { DateInputEditor, InputEditor, ListEditor } from '@visactor/vtable-editors';
import { useThemeStore } from '@/store/modules/useThemeStore';
import {
  emptyValueFor,
  isBlank,
  isMetaField,
  makeEmptyRow,
  numOf,
  renderDate,
  round2,
  tagColor,
  tsName,
  typeLabel,
  type BiCol,
  type BiRow,
  type ColRule,
  type ColType,
  type CrossRule,
} from './bi-entry/schema';
import { ROWNO_WIDTH, SELECT_WIDTH, allocWidths, groupColumns, useBiColumns } from './bi-entry/useBiColumns';
import { useBiValidation, type ErrItem } from './bi-entry/useBiValidation';
import { useBiQuery } from './bi-entry/useBiQuery';
import { useBiHistory } from './bi-entry/useBiHistory';
import { useBiActions } from './bi-entry/useBiActions';
import { useBiIO } from './bi-entry/useBiIO';

defineOptions({ name: 'VtBiEntry' });

interface CellStyleArg {
  col: number;
  row: number;
  value?: unknown;
}

interface CellChangeArg {
  col: number;
  row: number;
  rawValue?: string | number;
}

interface CheckboxArg {
  col: number;
  row: number;
  checked: boolean;
}

interface CellRange {
  start: { col: number; row: number };
  end: { col: number; row: number };
}

// ============================ 基础状态（必须早于组合式函数：回调里要用） ============================
const themeStore = useThemeStore();
const tableRef = ref<HTMLElement>();
const fileInput = ref<HTMLInputElement>();
let table: ListTable | null = null;

/** 统计口径的刷新触发器：record 内部字段变化不改数组引用，需要 tick 让 computed 重算 */
const statsTick = ref(0);
const tickDep = () => statsTick.value;

const conditionalOn = ref(false);
const showSummary = ref(true);
const submitting = ref(false);
const helpVisible = ref(false);
const errDrawer = ref(false);
const colDrawer = ref(false);
const queryDrawer = ref(false);
const colConfigVisible = ref(false);
const findVisible = ref(false);
const fillVisible = ref(false);
const newColType = ref<ColType>('text');
const tplPick = ref('');

const activeCell = ref<{ col: number; row: number } | null>(null);
const selectionRect = ref<{ c0: number; r0: number; c1: number; r1: number } | null>(null);
const flashPos = ref<{ col: number; row: number } | null>(null);

const fillField = ref('');
const fillValue = ref('');
const fillScope = ref<'selected' | 'result' | 'all'>('result');

const queryField = ref('');
const filterDraft = reactive<{ values: string[]; min: number | null; max: number | null }>({
  values: [],
  min: null,
  max: null,
});

const menu = reactive({ show: false, x: 0, y: 0 });

/** 数值列当前最大值（条件格式数据条的分母） */
const colMaxMap = ref<Record<string, number>>({});
/** 已合并区域：合并是坐标态，重建表格后要重新应用 */
const mergeList = shallowRef<Array<{ c0: number; r0: number; c1: number; r1: number }>>([]);

const GEN_SIZES = [1000, 10000, 50000, 100000];
const genLabel = (n: number) => (n >= 10000 ? `${n / 10000}万` : `${n / 1000}k`);

const HELP_ROWS = [
  { key: '双击 / F2 / 直接键入', desc: '编辑单元格（直接键入会覆盖原值）' },
  { key: 'Enter / Tab', desc: '提交并向下 / 向右移动' },
  { key: '方向键 / Ctrl+方向键', desc: '移动活动单元格 / 跳到数据边界' },
  { key: 'PageUp / PageDown', desc: '翻一屏' },
  { key: 'Ctrl+C / Ctrl+V', desc: '复制选区（带蚂蚁线）/ 粘贴多格 TSV' },
  { key: 'Ctrl+D / Ctrl+R', desc: '首行向下填充 / 首列向右填充（数字等差、日期按天）' },
  { key: 'Ctrl+Z / Ctrl+Y', desc: '撤销 / 重做' },
  { key: 'Ctrl+F', desc: '查找替换' },
  { key: 'Ctrl+A', desc: '全选' },
  { key: 'Delete / Backspace', desc: '清空选区内单元格' },
  { key: '拖右下角方块 / 双击', desc: '拖拽填充 / 填到数据末行' },
  { key: '右键', desc: '复制 / 粘贴 / 插入行 / 清空 / 删除行' },
  { key: 'F1', desc: '打开本帮助' },
];

// ============================ 迟绑定钩子（打破「组合式函数 ↔ 表格刷新」的循环依赖） ============================
/** 结构变更后的收尾（重排统计、刷新表格），定义在后面再赋值 */
let onStructure: () => void = () => undefined;
let onCells: () => void = () => undefined;
let onRestored: () => void = () => undefined;
/** 点表头 → 打开该列配置：内部要调 openColConfig（定义在后面），同样后置赋值 */
let onHeaderCell: (col: number, row: number) => void = () => undefined;

// ============================ 数据与模块装配 ============================
const { cols, visibleCols, numberCols, labelOf, colOf, addCol, removeCol, updateCol, moveCol, resetCols, templates, loadTemplates, saveTemplate, removeTemplate, loadTemplate } =
  useBiColumns();

/** records：唯一真源。shallowRef —— 只有整体替换才触发视图同步，避免十万行深响应式追踪 */
const records = shallowRef<BiRow[]>([]);
const validation = useBiValidation(cols);
const { errors: errorItems, errorCount, errMap } = validation;
const query = useBiQuery(cols, records);
const { processedRows, displayRows } = query;

const historyApi = useBiHistory({
  getRows: () => records.value,
  setRows: (next) => {
    records.value = next;
  },
  getCols: () => cols.value,
  setCols: (next) => {
    cols.value = next;
  },
  afterRestore: () => onRestored(),
});

const { canUndo, canRedo, undoLabel, redoLabel } = historyApi;

const actions = useBiActions({
  rows: records,
  cols,
  activeCols: visibleCols,
  validation,
  history: historyApi,
  query,
  afterStructure: () => onStructure(),
  afterCells: () => onCells(),
});

const io = useBiIO({
  rows: records,
  activeCols: visibleCols,
  history: historyApi,
  validation,
  afterStructure: () => onStructure(),
});

// ============================ 列索引 ↔ 字段 ============================
/** 叶子列顺序（含前置「#」「选择」）：VTable 的 col 下标就是它的下标 */
const colFields = ref<string[]>(['rowNo', 'selected']);
const fieldAt = (col: number): string => colFields.value[col] ?? '';
const recordAt = (rowIndex: number): BiRow | undefined => displayRows.value[rowIndex];

// ============================ 编辑器注册 ============================
const registeredEditors = new Set<string>();
const ensureEditors = () => {
  if (!registeredEditors.has('bi-input')) {
    register.editor('bi-input', new InputEditor());
    registeredEditors.add('bi-input');
  }
  if (!registeredEditors.has('bi-date')) {
    register.editor('bi-date', new DateInputEditor());
    registeredEditors.add('bi-date');
  }
  // 下拉列各注册一个 ListEditor：选项随列配置变化，每次重建重注册覆盖
  visibleCols.value
    .filter((c) => c.type === 'select')
    .forEach((c) => {
      register.editor(`bi-sel-${c.field}`, new ListEditor({ values: c.options ?? [] }));
      registeredEditors.add(`bi-sel-${c.field}`);
    });
};

const editorOf = (col: BiCol): string | undefined => {
  if (col.type === 'select') {
    return `bi-sel-${col.field}`;
  }
  if (col.type === 'date') {
    return 'bi-date';
  }
  if (col.type === 'number' || col.type === 'text') {
    return 'bi-input';
  }
  return undefined;
};

// ============================ 单元格样式 / 列构建 ============================
/** 单元格状态色：Canvas 每格都要用，不能逐格 getComputedStyle，建表时取一次缓存下来 */
const cellPalette = { errBg: '', errFg: '', flashBg: '' };

const cellStyle = (args: CellStyleArg) => {
  const field = fieldAt(args.col);
  const row = recordAt(args.row);
  const base: Record<string, unknown> = { fontFamily: 'inherit' };
  if (!row || isMetaField(field)) {
    return base;
  }
  const key = `${row.rowId}\u0001${field}`;
  if (errMap.has(key)) {
    return { ...base, bgColor: cellPalette.errBg, color: cellPalette.errFg };
  }
  if (flashPos.value && flashPos.value.col === args.col && flashPos.value.row === args.row) {
    return { ...base, bgColor: cellPalette.flashBg };
  }
  const col = colOf(field);
  if (col?.type === 'select' && col.options?.length) {
    const idx = col.options.indexOf(String(args.value ?? ''));
    if (idx >= 0) {
      const c = tagColor(idx, themeStore.isDark);
      return { ...base, bgColor: c.bg, color: c.fg };
    }
  }
  return base;
};

const buildColumns = (containerWidth: number): ColumnsDefine => {
  const widths = allocWidths(visibleCols.value, containerWidth || tableRef.value?.clientWidth || 1200);
  const widthOf = new Map<string, number>();
  visibleCols.value.forEach((c, i) => {
    widthOf.set(c.field, widths[i] ?? c.width);
  });

  const leaf = (c: BiCol): Record<string, unknown> => {
    const common: Record<string, unknown> = {
      field: c.field,
      title: c.label,
      width: widthOf.get(c.field),
      style: cellStyle,
    };
    if (c.type === 'number' && conditionalOn.value) {
      return {
        ...common,
        cellType: 'progressbar',
        min: c.rules?.min ?? 0,
        max: () => colMaxMap.value[c.field] ?? 100,
      };
    }
    if (c.type === 'date') {
      return { ...common, fieldFormat: (record: BiRow) => renderDate(record[c.field], c.dateFormat) };
    }
    return { ...common, editor: editorOf(c) };
  };

  // 表头分组：连续同名 group 聚成父表头；单列组退化为普通列
  const nodes = groupColumns(visibleCols.value)
    .map((g) => {
      if (!g.title) {
        const c = colOf(g.fields[0]);
        return c ? leaf(c) : null;
      }
      const children = g.fields
        .map((f) => colOf(f))
        .filter((c): c is BiCol => Boolean(c))
        .map((c) => leaf(c));
      return { title: g.title, columns: children };
    })
    .filter((x): x is Record<string, unknown> => Boolean(x));

  // 叶子顺序必须与 colFields 一致（col 下标 → 字段）
  colFields.value = ['rowNo', 'selected', ...visibleCols.value.map((c) => c.field)];

  const front: Array<Record<string, unknown>> = [
    { field: 'rowNo', title: '#', width: ROWNO_WIDTH, style: cellStyle },
    { field: 'selected', title: '', width: SELECT_WIDTH, cellType: 'checkbox', style: cellStyle },
  ];
  return [...front, ...nodes] as unknown as ColumnsDefine;
};

/** 冻结列数 = 前置两列 + 连续冻结的业务列 */
const frozenCount = () => {
  let n = 2;
  visibleCols.value.forEach((c) => {
    if (c.frozen && n === visibleCols.value.indexOf(c) + 2) {
      n += 1;
    }
  });
  return n;
};

const refreshColMax = () => {
  const map: Record<string, number> = {};
  numberCols.value.forEach((c) => {
    let max = -Infinity;
    processedRows.value.forEach((r) => {
      const n = numOf(r[c.field]);
      if (n !== null && n > max) {
        max = n;
      }
    });
    map[c.field] = Number.isFinite(max) && max > 0 ? max : 100;
  });
  colMaxMap.value = map;
};

// ============================ 数据同步 ============================
const syncData = (keepSelection = false) => {
  if (!table) {
    return;
  }
  const sel = keepSelection ? selectionRect.value : null;
  table.setRecords(displayRows.value);
  if (!sel) {
    return;
  }
  try {
    // ⚠️ selectCells 只接受 CellRange[]（不是四个数字），签名传错不报错但选区不生效
    table.selectCells([
      {
        start: { col: Math.min(sel.c0, sel.c1), row: Math.min(sel.r0, sel.r1) },
        end: { col: Math.max(sel.c0, sel.c1), row: Math.max(sel.r0, sel.r1) },
      },
    ]);
  } catch {
    // 结构已变化时选区可能越界，忽略
  }
};

// ============================ 填充（手柄 / Ctrl+D / Ctrl+R） ============================
let fillAnchor: { c0: number; r0: number; c1: number; r1: number } | null = null;

const coerce = (col: BiCol, raw: unknown, before: unknown): { value: unknown; reject: boolean } => {
  if (col.type === 'number') {
    if (isBlank(raw)) {
      return { value: null, reject: false };
    }
    const n = numOf(raw);
    return n === null ? { value: before, reject: true } : { value: n, reject: false };
  }
  if (col.type === 'date') {
    if (isBlank(raw)) {
      return { value: '', reject: false };
    }
    return { value: raw instanceof Date ? renderDate(raw) : String(raw), reject: false };
  }
  return { value: raw === null || raw === undefined ? '' : String(raw), reject: false };
};

const doFill = (dir: 'down' | 'up' | 'right' | 'left') => {
  const src = fillAnchor ?? selectionRect.value;
  const cur = selectionRect.value;
  if (!src || !cur) {
    ElMessage.info('先选中要填充的单元格区域');
    return;
  }
  if (dir === 'down' || dir === 'up') {
    const srcRows: string[] = [];
    for (let r = src.r0; r <= src.r1; r += 1) {
      const rec = recordAt(r);
      if (rec) {
        srcRows.push(rec.rowId);
      }
    }
    const targetRows: string[] = [];
    if (dir === 'down') {
      for (let r = src.r1 + 1; r <= cur.r1; r += 1) {
        const rec = recordAt(r);
        if (rec) {
          targetRows.push(rec.rowId);
        }
      }
    } else {
      for (let r = src.r0 - 1; r >= cur.r0; r -= 1) {
        const rec = recordAt(r);
        if (rec) {
          targetRows.push(rec.rowId);
        }
      }
    }
    const fields: string[] = [];
    for (let c = Math.min(src.c0, cur.c0); c <= Math.max(src.c1, cur.c1); c += 1) {
      const f = fieldAt(c);
      if (f && !isMetaField(f)) {
        fields.push(f);
      }
    }
    const n = actions.fillLinear({
      sourceRowIds: srcRows,
      targetRowIds: targetRows,
      fields,
      direction: dir,
      label: dir === 'down' ? '向下填充' : '向上填充',
    });
    ElMessage.success(n ? `已填充 ${n} 个单元格` : '没有需要填充的单元格');
    return;
  }

  // 横向填充：按行把源区各列的值循环铺到目标列；跨列类型不同，统一按目标列类型 coerce
  const patches: Array<{ rowId: string; field: string; before: unknown; after: unknown }> = [];
  for (let r = Math.min(src.r0, src.r1); r <= Math.max(src.r0, src.r1); r += 1) {
    const row = recordAt(r);
    if (row) {
      const srcFields: string[] = [];
      for (let c = src.c0; c <= src.c1; c += 1) {
        const f = fieldAt(c);
        if (f && !isMetaField(f)) {
          srcFields.push(f);
        }
      }
      const targetCols: number[] = [];
      if (dir === 'right') {
        for (let c = src.c1 + 1; c <= cur.c1; c += 1) {
          targetCols.push(c);
        }
      } else {
        for (let c = src.c0 - 1; c >= cur.c0; c -= 1) {
          targetCols.push(c);
        }
      }
      if (srcFields.length) {
        targetCols.forEach((c, i) => {
          const field = fieldAt(c);
          const col = colOf(field);
          if (!col || isMetaField(field)) {
            return;
          }
          const raw = row[srcFields[i % srcFields.length]];
          const { value, reject } = coerce(col, raw, row[field]);
          if (reject || row[field] === value) {
            return;
          }
          patches.push({ rowId: row.rowId, field, before: row[field], after: value });
          row[field] = value;
          row.changed = true;
        });
      }
    }
  }
  if (!patches.length) {
    ElMessage.info('没有需要填充的单元格');
    return;
  }
  historyApi.pushCells(dir === 'right' ? '向右填充' : '向左填充', patches);
  records.value = records.value.slice();
  validation.scanAll(records.value);
  tickDep();
  syncData(true);
  ElMessage.success(`已填充 ${patches.length} 个单元格`);
};

const onFillStart = () => {
  fillAnchor = selectionRect.value ? { ...selectionRect.value } : null;
};

const onFillEnd = (args?: { direction?: 'top' | 'bottom' | 'left' | 'right' }) => {
  let dir: 'down' | 'up' | 'right' | 'left' = 'down';
  if (args?.direction === 'top') {
    dir = 'up';
  } else if (args?.direction === 'left') {
    dir = 'left';
  } else if (args?.direction === 'right') {
    dir = 'right';
  }
  doFill(dir);
  fillAnchor = null;
};

const onFillToEnd = () => {
  const src = fillAnchor ?? selectionRect.value;
  if (!src) {
    return;
  }
  const last = displayRows.value.length - 1;
  if (last <= src.r1) {
    return;
  }
  selectionRect.value = { ...src, r1: last };
  doFill('down');
  fillAnchor = null;
};

// ============================ 单元格 / 选区事件 ============================
const onCellChange = (args: CellChangeArg) => {
  const field = fieldAt(args.col);
  const row = recordAt(args.row);
  const col = colOf(field);
  if (!row || !col || isMetaField(field)) {
    return;
  }
  // ⚠️ change_cell_value 在 VTable 已把新值写进 record 之后才触发：
  //    这里读 row[field] 已是新值，旧值只能取事件自带的 rawValue。
  const before = args.rawValue;
  const { value, reject } = coerce(col, row[field], before);
  if (reject) {
    row[field] = before === undefined ? null : before;
    table?.updateCellContent(args.col, args.row);
    ElMessage.warning(`「${col.label}」只接受数字`);
    return;
  }
  row[field] = value;
  row.changed = true;
  table?.updateCellContent(args.col, args.row);

  historyApi.pushCells(`编辑「${col.label}」`, [{ rowId: row.rowId, field, before, after: value }]);
  validation.noteUniqueEdit(records.value, field, before, value);
  validation.setCellError(row, field);
  if (col.rules?.unique) {
    validation.revalidateColumn(records.value, field);
  }
  validation.dependentFields(field).forEach((f) => validation.setCellError(row, f));
  tickDep();
  table?.renderWithRecreateCells();
};

const onCheckboxChange = (args: CheckboxArg) => {
  const field = fieldAt(args.col);
  const row = recordAt(args.row);
  if (!row || isMetaField(field)) {
    return;
  }
  if (field === 'selected') {
    row.selected = args.checked;
  } else {
    row[field] = args.checked;
    row.changed = true;
  }
  tickDep();
  table?.renderWithRecreateCells();
};

const onClickCell = (args: { col: number; row: number; cellLocation?: string }) => {
  activeCell.value = { col: args.col, row: args.row };
  menu.show = false;
  // 点表头 = 配这一列，对齐 vxe 的 header-cell-click 与 Univer 的点列标。
  // ⚠️ CellLocation 的取值是 'columnHeader'（不是 'colHeader'），写错会静默失效。
  if (args.cellLocation === 'columnHeader') {
    onHeaderCell(args.col, args.row);
  }
};

const onSelectedChanged = (args?: { ranges?: CellRange[] }) => {
  const ranges = args?.ranges ?? [];
  if (!ranges.length) {
    selectionRect.value = null;
    return;
  }
  const c0 = Math.min(...ranges.map((r) => Math.min(r.start.col, r.end.col)));
  const c1 = Math.max(...ranges.map((r) => Math.max(r.start.col, r.end.col)));
  const r0 = Math.min(...ranges.map((r) => Math.min(r.start.row, r.end.row)));
  const r1 = Math.max(...ranges.map((r) => Math.max(r.start.row, r.end.row)));
  selectionRect.value = { c0, r0, c1, r1 };
  tickDep();
};

const onContextMenu = (args: { col: number; row: number; event?: Event }) => {
  const ev = args.event as MouseEvent | undefined;
  activeCell.value = { col: args.col, row: args.row };
  menu.x = ev?.clientX ?? 200;
  menu.y = ev?.clientY ?? 200;
  menu.show = true;
};

// ============================ 表格生命周期 ============================
/**
 * VTable 主题：色值从全局 --bi-* 读（assets/style/bi-entry.less 是唯一来源）。
 * Canvas 取不到 CSS 变量，只能取值后喂给 TableTheme，但"改一处三处生效"依然成立。
 */
const cssVar = (name: string, fallback: string): string => {
  const el = tableRef.value ?? document.documentElement;
  const v = getComputedStyle(el).getPropertyValue(name).trim();
  return v || fallback;
};

const buildTableTheme = () => {
  const dark = themeStore.isDark;
  const panel = cssVar('--bi-panel', dark ? '#16191f' : '#fff');
  const headBg = cssVar('--bi-head-bg', dark ? '#1a1e25' : '#f7f8fa');
  const text = cssVar('--bi-text', dark ? '#e6e8ec' : '#1d2129');
  const border = cssVar('--bi-border', dark ? '#272c35' : '#e5e7ec');
  const borderSoft = cssVar('--bi-border-soft', dark ? '#20242c' : '#eef0f4');
  const base = dark ? themes.DARK : themes.BRIGHT;
  // 与 vxe 版的 .cell-error / .cell-flash 同一套观感：淡色底 + 语义色字
  cellPalette.errBg = dark ? 'rgba(247, 101, 96, 0.18)' : 'rgba(245, 63, 63, 0.1)';
  cellPalette.errFg = cssVar('--bi-danger', '#f53f3f');
  cellPalette.flashBg = cssVar('--bi-primary-soft', dark ? '#1c2440' : '#eef2ff');
  return new themes.TableTheme(
    {
      underlayBackgroundColor: panel,
      // 字号与 vxe 版对齐（正文 13 / 表头 12.5），网格线用最淡一阶，
      // 表头字色用正文色而非次级色——表头是列标签，比正文更需要清晰
      defaultStyle: { color: text, bgColor: panel, borderColor: borderSoft, fontSize: 13 },
      headerStyle: {
        color: text,
        bgColor: headBg,
        borderColor: border,
        fontSize: 12.5,
        fontWeight: 600,
      },
      // 分组表头（多级表头的父行）必须单独配：不配就走 base 主题的深色组头，
      // 与自定义的浅色底拼在一起会「上深下浅」断层
      groupTitleStyle: {
        color: text,
        bgColor: headBg,
        borderColor: border,
        fontSize: 12.5,
        fontWeight: 600,
      },
      bodyStyle: { color: text, bgColor: panel, borderColor: borderSoft, fontSize: 13 },
      // 去掉内置主题的圆角与投影：外框由 .bi-panel 统一提供，避免「卡片套卡片」
      frameStyle: { borderColor: border, borderLineWidth: 0, cornerRadius: 0, shadowBlur: 0 },
    },
    base,
  );
};

/** 建表时容器宽度（0 表示容器还没尺寸，等 resize 里再补一次分配） */
let builtWidth = 0;

const rebuild = () => {
  ensureEditors();
  table?.release();
  const container = tableRef.value as HTMLElement | undefined;
  if (!container) {
    return;
  }
  builtWidth = container.clientWidth || 0;
  table = new ListTable({
    container,
    records: displayRows.value,
    columnResizeMode: 'all',
    frozenColCount: frozenCount(),
    theme: buildTableTheme(),
    editCellTrigger: 'doubleclick',
    excelOptions: { fillHandle: true },
    keyboardOptions: {
      moveFocusCellOnTab: true,
      editCellOnEnter: true,
      moveFocusCellOnEnter: true,
      moveEditCellOnArrowKeys: true,
      selectAllOnCtrlA: true,
      copySelected: true,
      showCopyCellBorder: true,
      pasteValueToCell: false,
      shiftMultiSelect: true,
      ctrlMultiSelect: true,
    },
    eventOptions: { preventDefaultContextMenu: true },
    columns: buildColumns(builtWidth),
  });
  table.on('change_cell_value', onCellChange);
  table.on('checkbox_state_change', onCheckboxChange);
  table.on('click_cell', onClickCell);
  table.on('selected_changed', onSelectedChanged);
  table.on('contextmenu_cell', onContextMenu);
  table.on('mousedown_fill_handle', onFillStart);
  table.on('drag_fill_handle_end', onFillEnd);
  table.on('dblclick_fill_handle', onFillToEnd);
  mergeList.value.forEach(({ c0, r0, c1, r1 }) => table?.mergeCells(c0, r0, c1, r1));
};

// 迟绑定钩子赋值：此刻所有函数已定义
onStructure = () => {
  tickDep();
  validation.scanAll(records.value);
  query.clampPage();
  syncData();
};
onCells = () => {
  tickDep();
  syncData(true);
};
onRestored = () => {
  tickDep();
  validation.scanAll(records.value);
  rebuild();
};

// ============================ 合并 ============================
const hasSelection = computed(() => {
  const s = selectionRect.value;
  return Boolean(s && (s.c1 > s.c0 || s.r1 > s.r0));
});

const mergeSelection = () => {
  const s = selectionRect.value;
  if (!s || !table) {
    return;
  }
  table.mergeCells(s.c0, s.r0, s.c1, s.r1);
  mergeList.value = [...mergeList.value, { ...s }];
  ElMessage.success('已合并选中区域');
};

const clearMerges = () => {
  if (!table) {
    return;
  }
  mergeList.value.forEach(({ c0, r0, c1, r1 }) => table?.unmergeCells(c0, r0, c1, r1));
  mergeList.value = [];
  ElMessage.success('已取消全部合并');
};

// ============================ 剪贴板 ============================
const selectionCells = (): Array<{ field: string; row: BiRow }> => {
  const s = selectionRect.value;
  if (!s) {
    return [];
  }
  const out: Array<{ field: string; row: BiRow }> = [];
  for (let r = Math.min(s.r0, s.r1); r <= Math.max(s.r0, s.r1); r += 1) {
    const row = recordAt(r);
    if (row) {
      for (let c = Math.min(s.c0, s.c1); c <= Math.max(s.c0, s.c1); c += 1) {
        const f = fieldAt(c);
        if (f && !isMetaField(f)) {
          out.push({ field: f, row });
        }
      }
    }
  }
  return out;
};

const copySelection = async () => {
  const s = selectionRect.value;
  if (!s) {
    ElMessage.info('先框选要复制的单元格');
    return;
  }
  const lines: string[] = [];
  for (let r = s.r0; r <= s.r1; r += 1) {
    const row = recordAt(r);
    if (row) {
      const cells: string[] = [];
      for (let c = s.c0; c <= s.c1; c += 1) {
        const f = fieldAt(c);
        cells.push(f && !isMetaField(f) ? String(row[f] ?? '') : '');
      }
      lines.push(cells.join('\t'));
    }
  }
  try {
    await navigator.clipboard.writeText(lines.join('\n'));
    ElMessage.success(`已复制 ${lines.length} 行`);
  } catch {
    ElMessage.warning('浏览器拒绝了剪贴板写入');
  }
};

const applyPasteText = (text: string) => {
  const anchor = activeCell.value;
  if (!anchor) {
    ElMessage.info('先点一个起始单元格');
    return 0;
  }
  const patches: Array<{ rowId: string; field: string; before: unknown; after: unknown }> = [];
  text
    .replace(/\r/g, '')
    .split('\n')
    .forEach((line, ri) => {
      const row = recordAt(anchor.row + ri);
      if (!row || !line) {
        return;
      }
      line.split('\t').forEach((cellText, ci) => {
        const field = fieldAt(anchor.col + ci);
        const col = colOf(field);
        if (!col || isMetaField(field)) {
          return;
        }
        const { value, reject } = coerce(col, cellText, row[field]);
        const before = row[field];
        if (reject || before === value) {
          return;
        }
        patches.push({ rowId: row.rowId, field, before, after: value });
        row[field] = value;
        row.changed = true;
      });
    });
  if (!patches.length) {
    return 0;
  }
  historyApi.pushCells('粘贴', patches);
  records.value = records.value.slice();
  validation.scanAll(records.value);
  tickDep();
  syncData(true);
  return patches.length;
};

const pasteFromClipboard = async () => {
  try {
    const text = await navigator.clipboard.readText();
    const n = applyPasteText(text);
    ElMessage.success(n ? `已粘贴 ${n} 个单元格` : '剪贴板内容无法写入当前区域');
  } catch {
    ElMessage.warning('浏览器拒绝了剪贴板读取');
  }
};

const clearSelectionCells = () => {
  const patches = selectionCells()
    .map(({ field, row }) => {
      const col = colOf(field);
      const before = row[field];
      const after = col ? emptyValueFor(col) : '';
      if (before === after) {
        return null;
      }
      row[field] = after;
      row.changed = true;
      return { rowId: row.rowId, field, before, after };
    })
    .filter((x): x is { rowId: string; field: string; before: unknown; after: unknown } => Boolean(x));
  if (!patches.length) {
    return;
  }
  historyApi.pushCells('清空选区', patches);
  records.value = records.value.slice();
  validation.scanAll(records.value);
  tickDep();
  syncData(true);
};

// ============================ 撤销 / 重做 ============================
const onUndo = () => {
  const label = historyApi.undo();
  if (label) {
    ElMessage.info(`撤销：${label}`);
  }
};

const onRedo = () => {
  const label = historyApi.redo();
  if (label) {
    ElMessage.info(`重做：${label}`);
  }
};

// ============================ 右键菜单动作 ============================
const menuAct = (act: string) => {
  menu.show = false;
  const cell = activeCell.value;
  if (act === 'copy') {
    copySelection().catch(() => undefined);
    return;
  }
  if (act === 'paste') {
    pasteFromClipboard().catch(() => undefined);
    return;
  }
  if (!cell) {
    return;
  }
  if (act === 'insertUp') {
    actions.insertRow(Math.max(0, cell.row - 1));
    return;
  }
  if (act === 'insertDown') {
    actions.insertRow(cell.row);
    return;
  }
  if (act === 'clear') {
    clearSelectionCells();
    return;
  }
  if (act === 'deleteRow') {
    const row = recordAt(cell.row);
    if (!row) {
      return;
    }
    const at = records.value.findIndex((r) => r.rowId === row.rowId);
    if (at < 0) {
      return;
    }
    const before = historyApi.snapshot('右键删除行');
    const next = records.value.slice();
    next.splice(at, 1);
    records.value = next;
    actions.renumber(records.value);
    historyApi.pushSnapshot(before);
    validation.scanAll(records.value);
    tickDep();
    syncData();
  }
};

// ============================ 键盘流 ============================
const isTypingTarget = (target: EventTarget | null): boolean => {
  const el = target as HTMLElement | null;
  if (!el) {
    return false;
  }
  const tag = el.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el.isContentEditable;
};

const onKeydown = (e: KeyboardEvent) => {
  if (e.key === 'F1') {
    e.preventDefault();
    helpVisible.value = true;
    return;
  }
  if (isTypingTarget(e.target)) {
    return;
  }
  const mod = e.ctrlKey || e.metaKey;
  const key = e.key.toLowerCase();
  const cell = activeCell.value;
  if (mod && key === 'f') {
    e.preventDefault();
    findVisible.value = true;
    return;
  }
  if (mod && key === 'z') {
    e.preventDefault();
    onUndo();
    return;
  }
  if (mod && key === 'y') {
    e.preventDefault();
    onRedo();
    return;
  }
  if (mod && key === 'd') {
    e.preventDefault();
    doFill('down');
    return;
  }
  if (mod && key === 'r') {
    e.preventDefault();
    doFill('right');
    return;
  }
  if (mod && key === 'c') {
    e.preventDefault();
    copySelection().catch(() => undefined);
    return;
  }
  if (mod && key === 'v') {
    e.preventDefault();
    pasteFromClipboard().catch(() => undefined);
    return;
  }
  if (e.key === 'Escape') {
    menu.show = false;
    return;
  }
  if (!cell) {
    return;
  }
  if (e.key === 'Delete' || e.key === 'Backspace') {
    e.preventDefault();
    clearSelectionCells();
    return;
  }
  if (e.key === 'F2') {
    e.preventDefault();
    table?.startEditCell(cell.col, cell.row);
    return;
  }
  if (e.key === 'PageDown' || e.key === 'PageUp') {
    e.preventDefault();
    const step = 20 * (e.key === 'PageDown' ? 1 : -1);
    const nextRow = Math.min(Math.max(cell.row + step, 0), Math.max(displayRows.value.length - 1, 0));
    table?.selectCell(cell.col, nextRow);
    activeCell.value = { col: cell.col, row: nextRow };
    table?.scrollToCell({ col: cell.col, row: nextRow });
    return;
  }
  if (e.key.length === 1 && !mod && !e.altKey) {
    e.preventDefault();
    table?.startEditCell(cell.col, cell.row, e.key);
  }
};

// ============================ 查找替换 ============================
const findText = ref('');
const replaceText = ref('');
const findIndex = ref(-1);

interface FindHit {
  row: number;
  col: number;
  field: string;
}

const findHits = shallowRef<FindHit[]>([]);

const computeFind = () => {
  const kw = findText.value.trim().toLowerCase();
  if (!kw) {
    findHits.value = [];
    findIndex.value = -1;
    return;
  }
  const hits: FindHit[] = [];
  displayRows.value.forEach((row, ri) => {
    colFields.value.forEach((field, ci) => {
      if (!isMetaField(field) && String(row[field] ?? '').toLowerCase().includes(kw)) {
        hits.push({ row: ri, col: ci, field });
      }
    });
  });
  findHits.value = hits;
  findIndex.value = hits.length ? 0 : -1;
};

const hasMatches = computed(() => findHits.value.length > 0);
const findIndexLabel = computed(() =>
  findHits.value.length ? `${findIndex.value + 1} / ${findHits.value.length}` : '无匹配',
);

const revealCell = (col: number, row: number) => {
  table?.scrollToCell({ col, row });
  table?.selectCell(col, row);
  activeCell.value = { col, row };
  flashPos.value = { col, row };
  window.setTimeout(() => {
    flashPos.value = null;
    table?.renderWithRecreateCells();
  }, 900);
};

const jumpToHit = (idx: number) => {
  const hit = findHits.value[idx];
  if (!hit) {
    return;
  }
  findIndex.value = idx;
  revealCell(hit.col, hit.row);
};

const findNext = () => {
  if (!findHits.value.length) {
    computeFind();
    return;
  }
  jumpToHit((findIndex.value + 1) % findHits.value.length);
};

const findPrev = () => {
  const n = findHits.value.length;
  if (!n) {
    return;
  }
  jumpToHit((findIndex.value - 1 + n) % n);
};

const toggleFind = () => {
  findVisible.value = !findVisible.value;
  if (findVisible.value) {
    computeFind();
  }
};

const replaceCurrent = () => {
  const hit = findHits.value[findIndex.value];
  if (!hit) {
    return;
  }
  const row = displayRows.value[hit.row];
  const col = colOf(hit.field);
  if (!row || !col) {
    return;
  }
  const before = row[hit.field];
  const { value } = coerce(col, replaceText.value, before);
  row[hit.field] = value;
  row.changed = true;
  historyApi.pushCells('替换', [{ rowId: row.rowId, field: hit.field, before, after: value }]);
  records.value = records.value.slice();
  validation.scanAll(records.value);
  tickDep();
  syncData(true);
  ElMessage.success('已替换当前项');
};

const replaceAll = () => {
  const kw = findText.value;
  if (!kw) {
    return;
  }
  const patches: Array<{ rowId: string; field: string; before: unknown; after: unknown }> = [];
  records.value.forEach((row) => {
    colFields.value.forEach((field) => {
      const col = colOf(field);
      if (!col || isMetaField(field)) {
        return;
      }
      const text = String(row[field] ?? '');
      if (!text.toLowerCase().includes(kw.toLowerCase())) {
        return;
      }
      const { value, reject } = coerce(col, text.replaceAll(kw, replaceText.value), row[field]);
      if (reject || value === row[field]) {
        return;
      }
      patches.push({ rowId: row.rowId, field, before: row[field], after: value });
      row[field] = value;
      row.changed = true;
    });
  });
  if (!patches.length) {
    ElMessage.info('没有可替换的内容（数字列只接受数值）');
    return;
  }
  historyApi.pushCells('全部替换', patches);
  records.value = records.value.slice();
  validation.scanAll(records.value);
  tickDep();
  syncData(true);
  ElMessage.success(`已替换 ${patches.length} 处`);
};

// ============================ 统计 ============================
interface NumAgg {
  count: number;
  sum: number;
  avg: number;
  min: number;
  max: number;
}
const emptyAgg = () => ({ count: 0, sum: 0, min: Infinity, max: -Infinity });
const finishAgg = (a: { count: number; sum: number; min: number; max: number }): NumAgg | null =>
  a.count ? { count: a.count, sum: round2(a.sum), avg: round2(a.sum / a.count), min: a.min, max: a.max } : null;

const selectedCount = computed(() => {
  tickDep();
  return records.value.filter((r) => r.selected).length;
});

const dirtyCount = computed(() => {
  tickDep();
  return records.value.filter((r) => r.changed).length;
});

const posLabel = computed(() => {
  const cell = activeCell.value;
  if (!cell) {
    return '未选中单元格';
  }
  const row = recordAt(cell.row);
  const field = fieldAt(cell.col);
  let colLabel = labelOf(field);
  if (field === 'rowNo') {
    colLabel = '行号';
  } else if (field === 'selected') {
    colLabel = '选择';
  }
  return `${colLabel} · 第 ${row ? records.value.indexOf(row) + 1 : cell.row + 1} 行`;
});

const activeColLabel = computed(() => {
  const field = fieldAt(activeCell.value?.col ?? -1);
  return field ? labelOf(field) : '';
});

const activeStats = computed<NumAgg | null>(() => {
  tickDep();
  const field = fieldAt(activeCell.value?.col ?? -1);
  const col = colOf(field);
  if (!col || col.type !== 'number') {
    return null;
  }
  const acc = emptyAgg();
  processedRows.value.forEach((r) => {
    const n = numOf(r[field]);
    if (n !== null) {
      acc.count += 1;
      acc.sum += n;
      if (n < acc.min) {
        acc.min = n;
      }
      if (n > acc.max) {
        acc.max = n;
      }
    }
  });
  return finishAgg(acc);
});

const selectionStats = computed<NumAgg | null>(() => {
  tickDep();
  const s = selectionRect.value;
  if (!s) {
    return null;
  }
  const acc = emptyAgg();
  for (let r = Math.min(s.r0, s.r1); r <= Math.max(s.r0, s.r1); r += 1) {
    const row = recordAt(r);
    if (row) {
      for (let c = Math.min(s.c0, s.c1); c <= Math.max(s.c0, s.c1); c += 1) {
        const field = fieldAt(c);
        const col = colOf(field);
        if (col && col.type === 'number') {
          const n = numOf(row[field]);
          if (n !== null) {
            acc.count += 1;
            acc.sum += n;
            if (n < acc.min) {
              acc.min = n;
            }
            if (n > acc.max) {
              acc.max = n;
            }
          }
        }
      }
    }
  }
  return finishAgg(acc);
});

const summaryItems = computed(() => {
  tickDep();
  return numberCols.value
    .filter((c) => c.visible)
    .map((c) => {
      const acc = emptyAgg();
      processedRows.value.forEach((r) => {
        const n = numOf(r[c.field]);
        if (n !== null) {
          acc.count += 1;
          acc.sum += n;
          if (n < acc.min) {
            acc.min = n;
          }
          if (n > acc.max) {
            acc.max = n;
          }
        }
      });
      const agg = finishAgg(acc);
      return agg ? { field: c.field, label: c.label, ...agg } : null;
    })
    .filter((x): x is { field: string; label: string } & NumAgg => x !== null);
});

const chips = computed(() => query.chips.value);
const queryCol = computed(() => colOf(queryField.value));
const distinctValues = computed(() => (queryField.value ? query.distinctValues(queryField.value) : []));

const chipType = (kind: 'search' | 'filter' | 'sort'): 'info' | 'warning' | 'success' => {
  if (kind === 'search') {
    return 'info';
  }
  return kind === 'filter' ? 'warning' : 'success';
};

const applyFilter = () => {
  if (!queryField.value) {
    return;
  }
  if (queryCol.value?.type === 'number') {
    query.setFilter(queryField.value, { values: [], min: filterDraft.min, max: filterDraft.max });
  } else {
    query.setFilter(queryField.value, { values: filterDraft.values, min: null, max: null });
  }
  ElMessage.success('筛选已应用');
};

const clearFilterOf = (field: string) => {
  query.clearFilter(field);
};

// ============================ 工具栏动作 ============================
const positionOfActive = () => {
  const cell = activeCell.value;
  if (!cell) {
    return records.value.length - 1;
  }
  const row = recordAt(cell.row);
  return row ? records.value.findIndex((r) => r.rowId === row.rowId) : cell.row;
};

const onAddRow = () => {
  actions.addRow();
  ElMessage.success('已新增行');
};

const onInsertRow = () => {
  actions.insertRow(positionOfActive());
  ElMessage.success('已插入行');
};

const onDeleteSelected = () => {
  const n = actions.deleteSelected();
  ElMessage.success(n ? `已删除 ${n} 行` : '没有选中行');
};

const onDuplicate = () => {
  const n = actions.duplicateSelected();
  ElMessage.success(n ? `已复制 ${n} 行` : '没有选中行');
};

const onRemoveEmpty = () => {
  const n = actions.removeEmptyRows();
  ElMessage.success(n ? `已删除 ${n} 个空行` : '没有空行');
};

const onRemoveDup = () => {
  const n = actions.removeDuplicateRows();
  ElMessage.success(n ? `已去除 ${n} 个重复行` : '没有重复行');
};

const onClearAll = async () => {
  try {
    await ElMessageBox.confirm('清空后可用撤销恢复，确定继续？', '清空全部数据', { type: 'warning' });
  } catch {
    return;
  }
  actions.clearAll();
  ElMessage.success('已清空');
};

const doBatchFill = () => {
  if (!fillField.value) {
    ElMessage.warning('先选择要填充的列');
    return;
  }
  const col = colOf(fillField.value);
  if (!col) {
    return;
  }
  const { value, reject } = coerce(col, fillValue.value, '');
  if (reject) {
    ElMessage.warning('该列只接受数值');
    return;
  }
  const ids = new Set(selectionCells().map((c) => c.row.rowId));
  const n = actions.batchFill(fillField.value, value, fillScope.value, ids);
  ElMessage.success(n ? `已填充 ${n} 行` : '作用域内没有可填充的行');
};

const doBatchClear = () => {
  if (!fillField.value) {
    ElMessage.warning('先选择要清空的列');
    return;
  }
  const ids = new Set(selectionCells().map((c) => c.row.rowId));
  const n = actions.batchClearCol(fillField.value, fillScope.value, ids);
  ElMessage.success(n ? `已清空 ${n} 行` : '作用域内没有可清空的行');
};

const onPresetCommand = (cmd: string | number) => {
  if (cmd === 'preset') {
    actions.presetData(500);
    ElMessage.success('已生成 500 行演示数据');
    return;
  }
  if (typeof cmd === 'number') {
    actions.genData(cmd);
    ElMessage.success(`已生成 ${cmd.toLocaleString()} 行`);
  }
};

const onViewCommand = (cmd: string | number) => {
  if (cmd === 'virtual' || cmd === 'paged') {
    query.viewMode.value = cmd;
  }
};

const onExportCommand = (cmd: string) => {
  if (cmd === 'all') {
    io.exportRows(records.value, '全部').catch(() => ElMessage.error('导出失败'));
    return;
  }
  if (cmd === 'result') {
    io.exportRows(processedRows.value, '结果').catch(() => ElMessage.error('导出失败'));
    return;
  }
  if (cmd === 'csv') {
    io.exportCsv(processedRows.value, '结果');
  }
};

const importExcel = () => fileInput.value?.click();

const onFileChange = (e: Event) => {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  input.value = '';
  if (!file) {
    return;
  }
  io.importExcel(file, 'replace')
    .then((res) => {
      if (res.ok) {
        ElMessage.success(`已导入 ${res.count} 行`);
      } else {
        ElMessage.error(res.reason);
      }
    })
    .catch(() => ElMessage.error('导入失败，请确认文件格式'));
};

const onSubmit = () => {
  submitting.value = true;
  window.setTimeout(() => {
    const res = actions.submit();
    submitting.value = false;
    if (res.ok) {
      ElMessage.success('提交成功（mock 服务端已接收）');
      tickDep();
      return;
    }
    errDrawer.value = true;
    ElMessage.error(`提交失败：${res.errors} 处校验未通过`);
  }, 400);
};

// ============================ 列设置 ============================
const editingCol = ref<BiCol | null>(null);
const rulesDraft = reactive<ColRule>({});
const crossDraft = ref<CrossRule[]>([]);

const openAddCol = () => {
  const before = historyApi.snapshot('新增列');
  addCol(newColType.value);
  historyApi.pushSnapshot(before);
  validation.scanAll(records.value);
  rebuild();
  ElMessage.success('已新增列');
};

const onAddCol = () => openAddCol();

const onRemoveCol = (col: BiCol) => {
  const before = historyApi.snapshot('删除列');
  removeCol(col.field);
  historyApi.pushSnapshot(before);
  validation.scanAll(records.value);
  rebuild();
};

const onMoveCol = (index: number, dir: -1 | 1) => {
  const target = cols.value[index];
  if (!target) {
    return;
  }
  moveCol(target.field, dir);
  rebuild();
};

const onColMetaChange = () => {
  validation.scanAll(records.value);
  rebuild();
};

const onColTypeChange = (col: BiCol) => {
  records.value.forEach((r) => {
    const v = r[col.field];
    if (col.type === 'number') {
      r[col.field] = numOf(v);
    } else {
      r[col.field] = v === null || v === undefined ? '' : String(v);
    }
  });
  validation.scanAll(records.value);
  rebuild();
};

const openColConfig = (col: BiCol) => {
  editingCol.value = col;
  Object.assign(rulesDraft, {
    min: col.rules?.min,
    max: col.rules?.max,
    integer: col.rules?.integer,
    minLen: col.rules?.minLen,
    maxLen: col.rules?.maxLen,
    pattern: col.rules?.pattern,
    patternMsg: col.rules?.patternMsg,
    unique: col.rules?.unique,
  });
  crossDraft.value = (col.cross ?? []).map((r) => ({ ...r }));
  colConfigVisible.value = true;
};

/**
 * 点表头 → 打开该列配置（三套录入台统一入口；vxe 走 header-cell-click，
 * Univer 走「点列标后的整列选中」信号，这里直接拿 click_cell 的 cellLocation）。
 *
 * col 下标含前置的「#」「选择」两列，必须先用 fieldAt 反查真实字段；
 * 分组表头是多行结构，只有最后一行是叶子行——父表头横跨多列，
 * 无法判定要配哪一列，直接忽略。
 */
const headerRowCount = computed(() => (groupColumns(visibleCols.value).some((g) => g.title) ? 2 : 1));

onHeaderCell = (col: number, row: number) => {
  if (row !== headerRowCount.value - 1) {
    return;
  }
  const field = fieldAt(col);
  if (!field || isMetaField(field)) {
    return;
  }
  const target = cols.value.find((c) => c.field === field);
  if (target) {
    openColConfig(target);
  }
};

const applyColConfig = () => {
  const col = editingCol.value;
  if (!col) {
    return;
  }
  const rules: ColRule = {};
  const keys: Array<keyof ColRule> = ['min', 'max', 'integer', 'minLen', 'maxLen', 'pattern', 'patternMsg', 'unique'];
  keys.forEach((k) => {
    const v = rulesDraft[k];
    if (v !== undefined && v !== null && v !== '') {
      (rules as Record<string, unknown>)[k] = v;
    }
  });
  updateCol(col.field, {
    rules,
    cross: crossDraft.value.filter((r) => r.other),
    label: col.label,
    type: col.type,
    options: col.options,
    dateFormat: col.dateFormat,
    group: col.group,
    required: col.required,
  });
  colConfigVisible.value = false;
  validation.scanAll(records.value);
  rebuild();
};

const onSaveTemplate = async () => {
  try {
    const res = await ElMessageBox.prompt('模板名（只保存列结构，不含数据）', '存为列模板', {
      inputPlaceholder: '例如：销售录入标准',
    });
    if (saveTemplate(res.value)) {
      ElMessage.success('已保存模板');
    }
  } catch {
    // 取消
  }
};

const onLoadTemplate = (name: string) => {
  if (!name) {
    return;
  }
  const before = historyApi.snapshot(`应用列模板「${name}」`);
  if (!loadTemplate(name)) {
    return;
  }
  historyApi.pushSnapshot(before);
  records.value = records.value.map((r) => {
    const next = makeEmptyRow(cols.value);
    cols.value.forEach((c) => {
      next[c.field] = r[c.field] ?? emptyValueFor(c);
    });
    next.rowId = r.rowId;
    next.selected = r.selected;
    next.changed = true;
    return next;
  });
  validation.scanAll(records.value);
  rebuild();
  ElMessage.success(`已应用模板「${name}」`);
};

const onRemoveTemplate = () => {
  if (!tplPick.value) {
    return;
  }
  removeTemplate(tplPick.value);
  tplPick.value = '';
  ElMessage.success('已删除模板');
};

// ============================ 草稿 ============================
const DRAFT_KEY = 'vtable-bi-entry:draft:v2';

const saveDraft = () => {
  localStorage.setItem(DRAFT_KEY, JSON.stringify({ cols: cols.value, rows: records.value, ts: tsName() }));
  ElMessage.success('已保存本地草稿');
};

const resetDraft = async () => {
  try {
    await ElMessageBox.confirm('将清空本地草稿并恢复示例数据，确定？', '重置', { type: 'warning' });
  } catch {
    return;
  }
  localStorage.removeItem(DRAFT_KEY);
  resetCols();
  actions.presetData(500);
  loadTemplates();
  ElMessage.success('已恢复示例数据');
};

const loadDraft = () => {
  const raw = localStorage.getItem(DRAFT_KEY);
  if (!raw) {
    return false;
  }
  try {
    const data = JSON.parse(raw) as { cols?: BiCol[]; rows?: BiRow[] };
    if (Array.isArray(data.cols) && data.cols.length) {
      cols.value = data.cols;
    }
    if (Array.isArray(data.rows) && data.rows.length) {
      records.value = data.rows.map((r, i) => ({ ...r, rowNo: i + 1 }));
      return true;
    }
  } catch {
    return false;
  }
  return false;
};

// ============================ 错误跳转 ============================
const jumpToError = (e: ErrItem) => {
  const idx = displayRows.value.findIndex((r) => r.rowId === e.rowId);
  if (idx >= 0) {
    const col = colFields.value.indexOf(e.field);
    if (col >= 0) {
      revealCell(col, idx);
    }
    return;
  }
  // 该行被筛选挡住：清掉筛选后再定位
  query.clearAllQuery();
  nextTick(() => {
    const at = displayRows.value.findIndex((r) => r.rowId === e.rowId);
    const col = colFields.value.indexOf(e.field);
    if (at >= 0 && col >= 0) {
      revealCell(col, at);
    }
  });
};

// ============================ 生命周期 ============================
const onGlobalClick = () => {
  menu.show = false;
};

const closeOverlays = () => {
  menu.show = false;
  colConfigVisible.value = false;
};

onMounted(() => {
  loadTemplates();
  if (!loadDraft()) {
    actions.presetData(500);
  } else {
    validation.scanAll(records.value);
    tickDep();
  }
  rebuild();
  if (conditionalOn.value) {
    refreshColMax();
  }
  window.addEventListener('keydown', onKeydown);
  window.addEventListener('click', onGlobalClick);
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown);
  window.removeEventListener('click', onGlobalClick);
  table?.release();
  table = null;
});

watch(
  () => displayRows.value,
  () => {
    if (!table) {
      return;
    }
    table.setRecords(displayRows.value);
    query.clampPage();
    if (conditionalOn.value) {
      refreshColMax();
    }
  },
  { flush: 'post' },
);

watch(conditionalOn, () => {
  refreshColMax();
  rebuild();
});

watch(
  () => themeStore.isDark,
  () => rebuild(),
);

watch(findText, computeFind);

watch(
  () => cols.value.map((c) => `${c.field}:${c.type}:${c.visible ? 1 : 0}:${c.frozen ? 1 : 0}:${c.label}`).join('|'),
  () => rebuild(),
);

// 模板里用到的事件类型判断
const chipTagType = chipType;

/** 父页面（tabs 场景）从隐藏变可见后调用：Canvas 在 display:none 里初始化会得到 0 尺寸 */
const resize = () => {
  if (!table) {
    return;
  }
  table.resize();
  // 首次挂载在隐藏的 tab 里时容器宽为 0，列宽只能按最小宽兜底 → 表格填不满面板。
  // 容器一有宽度就按真实宽度重算一次列宽（此时才谈得上"撑满"）。
  const w = tableRef.value?.clientWidth ?? 0;
  if (w > 0 && Math.abs(w - builtWidth) > 4) {
    rebuild();
  }
};

defineExpose({ resize });
</script>

<style lang="less" scoped>
.vt-bi {
  width: 100%;
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;

  /* 骨架见全局 .bi-toolbar；此处只留主组件内的微调 */

  &__group {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  &__search {
    width: 170px;
  }

  &__file {
    display: none;
  }

  &__badge {
    display: inline-flex;

    :deep(.el-badge__content) {
      top: 6px;
    }
  }

  &__chips {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
    padding: 2px 4px;
  }

  &__chips-label {
    font-size: 12px;
    color: var(--bi-sub);
  }

  &__bar {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
    padding: 6px 8px;
    border: 1px dashed var(--bi-border);
    border-radius: var(--bi-radius, 10px);
  }

  &__bar-label,
  &__bar-hint {
    font-size: 12px;
    color: var(--bi-sub);
  }

  &__bar-input {
    width: 150px;
  }

  &__bar-select {
    width: 130px;
  }

  &__bar-count {
    font-size: 12px;
    color: var(--bi-sub);
    min-width: 56px;
    text-align: center;
  }

  // 表格区：边框/圆角/底色/阴影/撑满都来自 .bi-panel（全局 bi-entry.less），此处只补宽度
  &__table {
    width: 100%;
  }

  &__summary {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    gap: 14px;
    flex-wrap: wrap;
    padding: 4px 8px;
    font-size: 12px;
    color: var(--bi-sub);
    border-top: 1px solid var(--bi-border);
  }

  &__summary-title {
    color: var(--bi-sub);
  }

  &__pager {
    flex: 0 0 auto;
    display: flex;
    justify-content: flex-end;
    padding: 2px 0;
  }

  // 状态栏：骨架见 .bi-statusbar（全局 bi-entry.less），此处只留 VTable 专有的定位数字样式
  &__status {
    margin-top: 0;
  }

  &__status-pos {
    font-weight: 650;
  }

  &__sep {
    width: 1px;
    height: 12px;
    background: var(--bi-border);
  }

  &__menu {
    position: fixed;
    z-index: 3000;
    min-width: 168px;
    padding: 4px;
    background: var(--el-bg-color-overlay, #fff);
    border: 1px solid var(--el-border-color-light, #e4e7ed);
    border-radius: var(--ai-radius-sm);
    box-shadow: 0 6px 20px rgb(0 0 0 / 12%);
  }

  &__menu-item {
    padding: 6px 10px;
    font-size: 13px;
    border-radius: var(--ai-radius-xs);
    cursor: pointer;

    &:hover {
      background: var(--el-fill-color-light, #f5f7fa);
    }

    &.danger {
      color: var(--bi-danger);
    }
  }

  &__menu-sep {
    height: 1px;
    margin: 4px 2px;
    background: var(--el-border-color-lighter, #ebeef5);
  }

  &__errlist {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  &__errrow {
    display: flex;
    gap: 8px;
    align-items: baseline;
    padding: 6px 8px;
    font-size: 12px;
    border: 1px solid var(--el-border-color-lighter, #ebeef5);
    border-radius: var(--ai-radius-xs);
    cursor: pointer;

    &:hover {
      border-color: var(--el-color-primary, #409eff);
    }
  }

  &__errrow-pos {
    color: var(--el-text-color-secondary, #909399);
    flex: 0 0 auto;
  }

  &__errrow-label {
    font-weight: 600;
    flex: 0 0 auto;
  }

  &__errrow-msg {
    color: var(--bi-danger);
  }

  &__colebar {
    display: flex;
    gap: 8px;
    align-items: center;
    flex-wrap: wrap;
    margin-bottom: 10px;
  }

  &__coleselect {
    width: 150px;
  }

  &__ruleform {
    max-height: 60vh;
    overflow: auto;
  }

  &__ruleline {
    display: flex;
    gap: 8px;
    align-items: center;
    width: 100%;

    > * {
      flex: 1;
    }
  }

  &__crosslist {
    width: 100%;
  }

  &__crossrow {
    display: flex;
    gap: 6px;
    align-items: center;
    margin-bottom: 6px;
  }

  &__crosskind {
    width: 150px;
    flex: 0 0 auto;
  }

  &__crossother {
    width: 140px;
    flex: 0 0 auto;
  }

  &__querybox {
    display: flex;
    gap: 8px;
    align-items: center;
    flex-wrap: wrap;
    margin-bottom: 10px;
  }

  &__querysub {
    margin: 6px 0;
    font-size: 12px;
    color: var(--el-text-color-secondary, #909399);
  }

  &__querylist {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  &__full {
    width: 100%;
  }
}
</style>
