<template>
  <div class="teacher-page">
    <header class="teacher-page__head">
      <div>
        <h3 class="teacher-page__title">教师信息管理</h3>
        <p class="teacher-page__desc">
          契约先行（interface-contract v2）落地的 CRUD：逻辑删除、version 乐观锁、工号唯一、删除前引用检查。
        </p>
      </div>
      <div class="teacher-page__perm">
        <span class="teacher-page__perm-label">演练权限</span>
        <el-switch v-model="canEdit" active-text="teacher:edit" inactive-text="teacher:view" />
      </div>
    </header>

    <div class="teacher-page__toolbar">
      <el-input
        v-model="keywordInput"
        class="teacher-page__search"
        placeholder="按姓名搜索（输入停止 500ms 后自动查询）"
        clearable
      />
      <el-select v-model="subject" class="teacher-page__select" placeholder="学科" clearable>
        <el-option v-for="s in SUBJECT_OPTIONS" :key="s" :label="s" :value="s" />
      </el-select>
      <el-select v-model="status" class="teacher-page__select" placeholder="在职状态" clearable>
        <el-option label="在职" value="on" />
        <el-option label="离职" value="off" />
      </el-select>
      <el-button v-if="canEdit" type="primary" @click="openCreate">新增教师</el-button>
    </div>

    <p v-if="errorMsg" class="teacher-page__error">
      {{ errorMsg }}
      <el-button link type="primary" @click="load">重试</el-button>
    </p>

    <el-table v-loading="loading" :data="list" class="teacher-page__table" row-key="id">
      <el-table-column prop="name" label="姓名" min-width="90" />
      <el-table-column prop="code" label="工号" min-width="100" />
      <el-table-column prop="phone" label="手机号" min-width="130" />
      <el-table-column prop="subject" label="学科" min-width="80" />
      <el-table-column label="在职状态" min-width="90">
        <template #default="{ row }">
          <el-tag :type="row.status === 'on' ? 'success' : 'info'" size="small">
            {{ row.status === 'on' ? '在职' : '离职' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="hireDate" label="入职日期" min-width="110" />
      <el-table-column v-if="canEdit" label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
          <el-button link type="danger" @click="onDelete(row)">删除</el-button>
        </template>
      </el-table-column>
      <template #empty>
        <el-empty description="没有找到匹配的教师" />
      </template>
    </el-table>

    <el-pagination
      v-model:current-page="page"
      v-model:page-size="size"
      class="teacher-page__pager"
      :total="total"
      :page-sizes="[20, 50, 100]"
      layout="total, sizes, prev, pager, next, jumper"
    />

    <el-dialog
      v-model="dialogVisible"
      :title="mode === 'create' ? '新增教师' : '编辑教师'"
      width="480px"
      :close-on-click-modal="false"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="88px">
        <el-form-item label="姓名" prop="name">
          <el-input v-model="form.name" maxlength="32" placeholder="1-32 个字符" />
        </el-form-item>
        <el-form-item label="工号" prop="code">
          <el-input
            v-model="form.code"
            :disabled="mode === 'edit'"
            maxlength="16"
            placeholder="4-16 位字母或数字"
            @blur="onCodeBlur"
          />
          <p v-if="codeError" class="teacher-page__field-error">{{ codeError }}</p>
          <p v-else-if="mode === 'edit'" class="teacher-page__field-tip">工号不可变更</p>
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" maxlength="11" placeholder="11 位手机号" />
        </el-form-item>
        <el-form-item label="学科" prop="subject">
          <el-select v-model="form.subject" placeholder="请选择学科">
            <el-option v-for="s in SUBJECT_OPTIONS" :key="s" :label="s" :value="s" />
          </el-select>
        </el-form-item>
        <el-form-item label="入职日期" prop="hireDate">
          <el-date-picker
            v-model="form.hireDate"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="选择日期"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="teacher-page__footer">
          <el-button
            v-if="mode === 'edit'"
            link
            type="warning"
            @click="simulateConcurrentEdit(editingId)"
          >
            模拟他人修改（验证 AC-10 乐观锁）
          </el-button>
          <span class="teacher-page__footer-spacer" />
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submit">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus';

import {
  ContractError,
  checkCode,
  createTeacher,
  deleteTeacher,
  fetchReferences,
  fetchTeacher,
  fetchTeachers,
  mockPerms,
  simulateConcurrentEdit,
  updateTeacher,
} from './mock-api';
import { SUBJECT_OPTIONS, type Teacher, type TeacherListQuery } from './types';

defineOptions({ name: 'TeacherManage' });

const route = useRoute();
const router = useRouter();

const list = ref<Teacher[]>([]);
const total = ref(0);
const loading = ref(false);
const errorMsg = ref('');

// 筛选条件（宿主在 URL query，翻页不丢筛选、可分享可回退）
const keywordInput = ref('');
const keyword = ref('');
const subject = ref('');
const status = ref('');
const page = ref(1);
const size = ref(20);

const canEdit = ref(true);
watch(canEdit, (v) => {
  mockPerms.edit = v;
});

const dialogVisible = ref(false);
const mode = ref<'create' | 'edit'>('create');
const editingId = ref('');
const codeError = ref('');
const formRef = ref<FormInstance>();
const form = reactive({ name: '', code: '', phone: '', subject: '', hireDate: '' });

const rules: FormRules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  code: [
    { required: true, message: '请输入工号', trigger: 'blur' },
    { pattern: /^[A-Za-z0-9]{4,16}$/, message: '4-16 位字母或数字', trigger: 'blur' },
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1\d{10}$/, message: '手机号格式不正确', trigger: 'blur' },
  ],
  subject: [{ required: true, message: '请选择学科', trigger: 'change' }],
  hireDate: [{ required: true, message: '请选择入职日期', trigger: 'change' }],
};

function msgOf(e: unknown): string {
  if (e instanceof ContractError) return e.message;
  return e instanceof Error ? e.message : '未知错误';
}

/** IF-1 列表 */
async function load() {
  loading.value = true;
  errorMsg.value = '';
  const query: TeacherListQuery = {
    keyword: keyword.value,
    subject: subject.value,
    status: status.value as TeacherListQuery['status'],
    page: page.value,
    size: size.value,
  };
  try {
    const res = await fetchTeachers(query);
    list.value = res.list;
    total.value = res.total;
  } catch (e) {
    list.value = [];
    total.value = 0;
    errorMsg.value = `列表加载失败：${msgOf(e)}`;
  } finally {
    loading.value = false;
  }
}

function syncFromUrl() {
  const q = route.query;
  keywordInput.value = (q.keyword as string) ?? '';
  keyword.value = keywordInput.value;
  subject.value = (q.subject as string) ?? '';
  status.value = (q.status as string) ?? '';
  page.value = Number(q.page) || 1;
  size.value = Number(q.size) || 20;
}

function pushUrl() {
  router.replace({
    query: {
      keyword: keyword.value || undefined,
      subject: subject.value || undefined,
      status: status.value || undefined,
      page: page.value === 1 ? undefined : String(page.value),
      size: size.value === 20 ? undefined : String(size.value),
    },
  });
}

onMounted(() => {
  syncFromUrl();
  load();
});

// 搜索防抖 500ms（AC-2）
let timer: ReturnType<typeof setTimeout> | undefined;
watch(keywordInput, (v) => {
  clearTimeout(timer);
  timer = setTimeout(() => {
    keyword.value = v;
  }, 500);
});

watch([keyword, subject, status, size], () => {
  if (page.value !== 1) page.value = 1;
  else pushUrl();
});
watch(page, () => pushUrl());
watch(
  () => route.query,
  () => {
    load();
  },
);

function resetForm() {
  form.name = '';
  form.code = '';
  form.phone = '';
  form.subject = '';
  form.hireDate = '';
  codeError.value = '';
  formRef.value?.clearValidate();
}

function openCreate() {
  mode.value = 'create';
  editingId.value = '';
  resetForm();
  dialogVisible.value = true;
}

const versionRef = ref(0);

/** 打开编辑前先拉详情，拿到最新 version（AC-10 乐观锁前提） */
async function openEdit(row: Teacher) {
  mode.value = 'edit';
  editingId.value = row.id;
  resetForm();
  try {
    const latest = await fetchTeacher(row.id);
    form.name = latest.name;
    form.code = latest.code;
    form.phone = latest.phone;
    form.subject = latest.subject;
    form.hireDate = latest.hireDate;
    versionRef.value = latest.version;
    dialogVisible.value = true;
  } catch (e) {
    ElMessage.error(msgOf(e));
    load();
  }
}

/** IF-6 工号失焦实时查重 */
async function onCodeBlur() {
  codeError.value = '';
  if (!form.code.trim()) return;
  try {
    const { exists } = await checkCode(form.code, mode.value === 'edit' ? editingId.value : undefined);
    if (exists) codeError.value = '工号已存在';
  } catch {
    /* 查重失败不阻断，提交时仍会由后端唯一索引兜底 */
  }
}

async function submit() {
  const ok = await formRef.value?.validate().catch(() => false);
  if (!ok) return;
  if (codeError.value) {
    ElMessage.error(codeError.value);
    return;
  }
  try {
    if (mode.value === 'create') {
      await createTeacher({ ...form });
      ElMessage.success('新增成功');
    } else {
      await updateTeacher(editingId.value, { ...form, version: versionRef.value });
      ElMessage.success('保存成功');
    }
    dialogVisible.value = false;
    load();
  } catch (e) {
    const text = msgOf(e);
    ElMessage.error(text);
    if (e instanceof ContractError && e.code === 'E_DUPLICATE_CODE') codeError.value = text;
    if (e instanceof ContractError && (e.code === 'E_VERSION_CONFLICT' || e.code === 'E_NOT_FOUND')) {
      dialogVisible.value = false;
      load();
    }
  }
}

/** 点删除 → IF-5a 引用检查 → 确认框带引用数 → IF-5 逻辑删除（AC-5） */
async function onDelete(row: Teacher) {
  let warn = '删除后不可恢复。';
  try {
    const refs = await fetchReferences(row.id);
    if (refs.courseCount > 0) {
      warn = `该教师名下还有 ${refs.courseCount} 门课程、${refs.lessonCount} 条排课记录，删除后不可恢复。`;
    }
  } catch {
    /* 引用检查失败：降级为通用确认框，不阻断删除 */
  }
  try {
    await ElMessageBox.confirm(warn, `确认删除「${row.name}」？`, {
      type: 'warning',
      confirmButtonText: '确认删除',
      cancelButtonText: '取消',
    });
  } catch {
    return;
  }
  try {
    await deleteTeacher(row.id);
    ElMessage.success('已删除');
  } catch (e) {
    ElMessage.error(msgOf(e));
  }
  load();
}
</script>

<style lang="less" scoped>
.teacher-page {
  padding: 20px 24px 32px;

  &__head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 16px;
  }

  &__title {
    margin: 0 0 6px;
    font-size: 18px;
    font-weight: 600;
    color: var(--ai-text);
  }

  &__desc {
    margin: 0;
    max-width: 720px;
    font-size: 13px;
    line-height: 1.6;
    color: var(--ai-text-dim);
  }

  &__perm {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    gap: 10px;
    padding: 8px 12px;
    border: 1px solid var(--ai-border);
    border-radius: var(--ai-radius-md);
    background: var(--ai-surface);
  }

  &__perm-label {
    font-size: 12px;
    color: var(--ai-text-mute);
  }

  &__toolbar {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-bottom: 14px;
  }

  &__search {
    width: 280px;
  }

  &__select {
    width: 130px;
  }

  &__error {
    margin: 0 0 12px;
    font-size: 13px;
    color: #f87171;
  }

  &__table {
    width: 100%;
    border: 1px solid var(--ai-border);
    border-radius: var(--ai-radius-md);
    overflow: hidden;
  }

  &__pager {
    margin-top: 14px;
    justify-content: flex-end;
  }

  &__field-error {
    margin: 4px 0 0;
    font-size: 12px;
    line-height: 1.4;
    color: #f87171;
  }

  &__field-tip {
    margin: 4px 0 0;
    font-size: 12px;
    color: var(--ai-text-mute);
  }

  &__footer {
    display: flex;
    align-items: center;
  }

  &__footer-spacer {
    flex: 1;
  }
}
</style>
