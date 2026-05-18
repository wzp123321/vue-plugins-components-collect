<template>
  <div class="indexeddb-page">
    <h5>IndexedDB — 浏览器本地数据库</h5>
    <p class="page-desc">
      IndexedDB 是浏览器内置的 NoSQL 数据库，可存储大量结构化数据，支持事务、索引和游标查询。 存储上限通常为磁盘空间的
      50%，远超 localStorage（5MB）。
    </p>

    <!-- 状态栏 -->
    <el-card style="margin-bottom: 16px">
      <div class="status-bar">
        <div class="status-item">
          <span class="status-dot" :class="dbConnected ? 'connected' : 'disconnected'"></span>
          <span>数据库状态：{{ dbConnected ? '已连接' : '未连接' }}</span>
        </div>
        <div class="status-item">
          📦 数据库名：
          <code>idb-demo</code>
        </div>
        <div class="status-item">
          🗂 对象仓库：
          <code>products</code>
        </div>
        <div class="status-item">
          📊 记录数：
          <b>{{ recordCount }}</b>
        </div>
        <el-button size="small" @click="initDB" :loading="dbLoading">
          {{ dbConnected ? '重新连接' : '初始化 DB' }}
        </el-button>
      </div>
    </el-card>

    <el-row :gutter="16" style="margin-bottom: 16px">
      <!-- CRUD 操作 -->
      <el-col :span="14">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>⚙️ CRUD 操作</span>
              <el-button-group>
                <el-button size="small" @click="activeOp = 'add'" :type="activeOp === 'add' ? 'primary' : ''">
                  新增
                </el-button>
                <el-button size="small" @click="activeOp = 'update'" :type="activeOp === 'update' ? 'primary' : ''">
                  更新
                </el-button>
                <el-button size="small" @click="activeOp = 'delete'" :type="activeOp === 'delete' ? 'danger' : ''">
                  删除
                </el-button>
                <el-button size="small" @click="activeOp = 'query'" :type="activeOp === 'query' ? 'success' : ''">
                  查询
                </el-button>
              </el-button-group>
            </div>
          </template>

          <!-- 新增表单 -->
          <div v-if="activeOp === 'add'" class="op-form">
            <el-form :model="form" label-width="80px" size="small">
              <el-form-item label="商品名称"><el-input v-model="form.name" placeholder="如：苹果" /></el-form-item>
              <el-form-item label="价格（元）">
                <el-input-number v-model="form.price" :min="0" :precision="2" />
              </el-form-item>
              <el-form-item label="库存"><el-input-number v-model="form.stock" :min="0" /></el-form-item>
              <el-form-item label="分类">
                <el-select v-model="form.category">
                  <el-option label="水果" value="fruit" />
                  <el-option label="蔬菜" value="vegetable" />
                  <el-option label="饮品" value="drink" />
                  <el-option label="零食" value="snack" />
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="addRecord" :disabled="!dbConnected">添加记录</el-button>
                <el-button @click="addBatchRecords" :disabled="!dbConnected">批量添加 5 条</el-button>
              </el-form-item>
            </el-form>
          </div>

          <!-- 更新 -->
          <div v-if="activeOp === 'update'" class="op-form">
            <el-form label-width="80px" size="small">
              <el-form-item label="记录 ID"><el-input-number v-model="updateId" :min="1" /></el-form-item>
              <el-form-item label="新价格">
                <el-input-number v-model="updatePrice" :min="0" :precision="2" />
              </el-form-item>
              <el-form-item label="新库存"><el-input-number v-model="updateStock" :min="0" /></el-form-item>
              <el-form-item>
                <el-button type="warning" @click="updateRecord" :disabled="!dbConnected">更新记录</el-button>
              </el-form-item>
            </el-form>
          </div>

          <!-- 删除 -->
          <div v-if="activeOp === 'delete'" class="op-form">
            <el-form label-width="80px" size="small">
              <el-form-item label="记录 ID"><el-input-number v-model="deleteId" :min="1" /></el-form-item>
              <el-form-item>
                <el-button type="danger" @click="deleteRecord" :disabled="!dbConnected">删除记录</el-button>
                <el-button type="danger" plain @click="clearAll" :disabled="!dbConnected">清空全部</el-button>
              </el-form-item>
            </el-form>
          </div>

          <!-- 查询 -->
          <div v-if="activeOp === 'query'" class="op-form">
            <el-form label-width="80px" size="small">
              <el-form-item label="按 ID 查">
                <el-input-number v-model="queryId" :min="1" style="width: 120px" />
                <el-button style="margin-left: 8px" @click="queryById" :disabled="!dbConnected">查询</el-button>
              </el-form-item>
              <el-form-item label="按分类查">
                <el-select v-model="queryCategory" clearable placeholder="全部">
                  <el-option label="水果" value="fruit" />
                  <el-option label="蔬菜" value="vegetable" />
                  <el-option label="饮品" value="drink" />
                  <el-option label="零食" value="snack" />
                </el-select>
                <el-button style="margin-left: 8px" @click="queryByCategory" :disabled="!dbConnected">
                  按分类查
                </el-button>
              </el-form-item>
              <el-form-item>
                <el-button type="success" @click="queryAll" :disabled="!dbConnected">查询全部</el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-card>
      </el-col>

      <!-- 操作日志 -->
      <el-col :span="10">
        <el-card style="height: 100%">
          <template #header>
            <div class="card-header">
              <span>📋 操作日志</span>
              <el-button size="small" @click="opLogs = []">清空</el-button>
            </div>
          </template>
          <div class="op-log-box">
            <div v-for="(log, i) in opLogs" :key="i" class="op-log-item">
              <span class="log-time">{{ log.time }}</span>
              <el-tag :type="log.status === 'ok' ? 'success' : 'danger'" size="small">{{ log.status }}</el-tag>
              <span class="log-msg">{{ log.msg }}</span>
            </div>
            <div v-if="!opLogs.length" class="empty-tip">暂无日志</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 数据列表 -->
    <el-card style="margin-bottom: 16px">
      <template #header>
        <div class="card-header">
          <span>📊 数据列表（{{ tableData.length }} 条）</span>
          <el-button size="small" type="primary" plain @click="queryAll" :disabled="!dbConnected">刷新</el-button>
        </div>
      </template>
      <el-table :data="tableData" border size="small" max-height="300">
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="name" label="商品名" />
        <el-table-column prop="price" label="价格（¥）" width="100">
          <template #default="{ row }">¥{{ row.price?.toFixed(2) }}</template>
        </el-table-column>
        <el-table-column prop="stock" label="库存" width="80" />
        <el-table-column prop="category" label="分类" width="90">
          <template #default="{ row }">
            <el-tag size="small">{{ categoryMap[row.category] || row.category }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="160" />
        <el-table-column label="操作" width="100">
          <template #default="{ row }">
            <el-button size="small" type="danger" link @click="deleteById(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 源码 -->
    <el-card>
      <template #header><span>📝 封装实现（Promise 化 IndexedDB）</span></template>
      <pre class="code-block">{{ idbCode }}</pre>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';

defineOptions({ name: 'IndexedDBDemo' });

interface Product {
  id?: number;
  name: string;
  price: number;
  stock: number;
  category: string;
  createdAt: string;
}

const DB_NAME = 'idb-demo';
const DB_VERSION = 1;
const STORE_NAME = 'products';

let db: IDBDatabase | null = null;
const dbConnected = ref(false);
const dbLoading = ref(false);
const recordCount = ref(0);
const tableData = ref<Product[]>([]);
const opLogs = ref<{ time: string; status: string; msg: string }[]>([]);
const activeOp = ref('add');

const categoryMap: Record<string, string> = {
  fruit: '🍎 水果',
  vegetable: '🥦 蔬菜',
  drink: '🧃 饮品',
  snack: '🍪 零食',
};

// 表单
const form = ref({ name: '苹果', price: 9.9, stock: 100, category: 'fruit' });
const updateId = ref(1);
const updatePrice = ref(0);
const updateStock = ref(0);
const deleteId = ref(1);
const queryId = ref(1);
const queryCategory = ref('');

function getTime() {
  const d = new Date();
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`;
}

function log(msg: string, status = 'ok') {
  opLogs.value.unshift({ time: getTime(), status, msg });
  if (opLogs.value.length > 20) opLogs.value.pop();
}

// 打开数据库
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
        store.createIndex('category', 'category', { unique: false });
        store.createIndex('name', 'name', { unique: false });
      }
    };
    req.onsuccess = (e) => resolve((e.target as IDBOpenDBRequest).result);
    req.onerror = (e) => reject((e.target as IDBOpenDBRequest).error);
  });
}

// 增
function add(data: Omit<Product, 'id'>): Promise<number> {
  return new Promise((resolve, reject) => {
    const tx = db!.transaction(STORE_NAME, 'readwrite');
    const req = tx.objectStore(STORE_NAME).add(data);
    req.onsuccess = () => resolve(req.result as number);
    req.onerror = () => reject(req.error);
  });
}

// 删
function remove(id: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db!.transaction(STORE_NAME, 'readwrite');
    const req = tx.objectStore(STORE_NAME).delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

// 改
function update(data: Product): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db!.transaction(STORE_NAME, 'readwrite');
    const req = tx.objectStore(STORE_NAME).put(data);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

// 查全部
function getAll(): Promise<Product[]> {
  return new Promise((resolve, reject) => {
    const tx = db!.transaction(STORE_NAME, 'readonly');
    const req = tx.objectStore(STORE_NAME).getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

// 查单个
function getById(id: number): Promise<Product | undefined> {
  return new Promise((resolve, reject) => {
    const tx = db!.transaction(STORE_NAME, 'readonly');
    const req = tx.objectStore(STORE_NAME).get(id);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

// 按索引查
function getByIndex(indexName: string, value: string): Promise<Product[]> {
  return new Promise((resolve, reject) => {
    const tx = db!.transaction(STORE_NAME, 'readonly');
    const idx = tx.objectStore(STORE_NAME).index(indexName);
    const req = idx.getAll(value);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

// 清空
function clearStore(): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db!.transaction(STORE_NAME, 'readwrite');
    const req = tx.objectStore(STORE_NAME).clear();
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

async function initDB() {
  dbLoading.value = true;
  try {
    db = await openDB();
    dbConnected.value = true;
    await queryAll();
    log('数据库连接成功');
    ElMessage.success('IndexedDB 连接成功');
  } catch (e) {
    log(`连接失败：${e}`, 'error');
    ElMessage.error('数据库连接失败');
  } finally {
    dbLoading.value = false;
  }
}

async function addRecord() {
  if (!form.value.name) return ElMessage.warning('请输入商品名称');
  try {
    const id = await add({ ...form.value, createdAt: new Date().toLocaleString() });
    log(`新增成功 ID=${id}，商品：${form.value.name}`);
    ElMessage.success(`添加成功，ID = ${id}`);
    await queryAll();
  } catch (e) {
    log(`新增失败：${e}`, 'error');
  }
}

const batchItems = [
  { name: '香蕉', price: 5.5, stock: 200, category: 'fruit' },
  { name: '西红柿', price: 3.8, stock: 150, category: 'vegetable' },
  { name: '可乐', price: 4.0, stock: 50, category: 'drink' },
  { name: '薯片', price: 12.9, stock: 80, category: 'snack' },
  { name: '橙子', price: 8.8, stock: 120, category: 'fruit' },
];

async function addBatchRecords() {
  try {
    for (const item of batchItems) {
      await add({ ...item, createdAt: new Date().toLocaleString() });
    }
    log('批量添加 5 条成功');
    ElMessage.success('批量添加成功');
    await queryAll();
  } catch (e) {
    log(`批量添加失败：${e}`, 'error');
  }
}

async function updateRecord() {
  try {
    const record = await getById(updateId.value);
    if (!record) return ElMessage.warning(`ID=${updateId.value} 不存在`);
    record.price = updatePrice.value;
    record.stock = updateStock.value;
    await update(record);
    log(`更新成功 ID=${updateId.value}`);
    ElMessage.success('更新成功');
    await queryAll();
  } catch (e) {
    log(`更新失败：${e}`, 'error');
  }
}

async function deleteRecord() {
  try {
    await remove(deleteId.value);
    log(`删除 ID=${deleteId.value}`);
    ElMessage.success('删除成功');
    await queryAll();
  } catch (e) {
    log(`删除失败：${e}`, 'error');
  }
}

async function deleteById(id: number) {
  try {
    await remove(id);
    log(`删除 ID=${id}`);
    await queryAll();
  } catch (e) {
    log(`删除失败：${e}`, 'error');
  }
}

async function clearAll() {
  try {
    await ElMessageBox.confirm('确定清空所有数据吗？', '警告', { type: 'warning' });
    await clearStore();
    log('清空全部数据');
    ElMessage.success('已清空');
    await queryAll();
  } catch {}
}

async function queryAll() {
  if (!db) return;
  const data = await getAll();
  tableData.value = data;
  recordCount.value = data.length;
  log(`查询全部，共 ${data.length} 条`);
}

async function queryById() {
  const record = await getById(queryId.value);
  if (record) {
    tableData.value = [record];
    log(`查询 ID=${queryId.value} 成功`);
  } else {
    tableData.value = [];
    log(`ID=${queryId.value} 不存在`, 'error');
    ElMessage.warning('未找到该记录');
  }
}

async function queryByCategory() {
  if (!queryCategory.value) return queryAll();
  const data = await getByIndex('category', queryCategory.value);
  tableData.value = data;
  log(`按分类「${queryCategory.value}」查询，共 ${data.length} 条`);
}

onMounted(initDB);
onUnmounted(() => {
  db?.close();
  db = null;
});

const idbCode = `// utils/idb.ts — 封装 Promise 化 IndexedDB
class IndexedDBHelper {
  private db: IDBDatabase | null = null;
  
  constructor(
    private dbName: string,
    private version: number,
    private stores: { name: string; keyPath: string; indexes?: string[] }[]
  ) {}
  
  async open(): Promise<void> {
    this.db = await new Promise((resolve, reject) => {
      const req = indexedDB.open(this.dbName, this.version);
      req.onupgradeneeded = (e) => {
        const db = (e.target as IDBOpenDBRequest).result;
        this.stores.forEach(({ name, keyPath, indexes }) => {
          if (!db.objectStoreNames.contains(name)) {
            const store = db.createObjectStore(name, { keyPath, autoIncrement: true });
            indexes?.forEach(idx => store.createIndex(idx, idx));
          }
        });
      };
      req.onsuccess = e => resolve((e.target as IDBOpenDBRequest).result);
      req.onerror = e => reject((e.target as IDBOpenDBRequest).error);
    });
  }
  
  private tx(store: string, mode: IDBTransactionMode = 'readonly') {
    return this.db!.transaction(store, mode).objectStore(store);
  }
  
  add<T>(store: string, data: T): Promise<IDBValidKey> {
    return new Promise((res, rej) => {
      const req = this.tx(store, 'readwrite').add(data);
      req.onsuccess = () => res(req.result);
      req.onerror = () => rej(req.error);
    });
  }
  
  getAll<T>(store: string): Promise<T[]> {
    return new Promise((res, rej) => {
      const req = this.tx(store).getAll();
      req.onsuccess = () => res(req.result);
      req.onerror = () => rej(req.error);
    });
  }
  
  // ... put / delete / clear / getByIndex 类似
  
  close() { this.db?.close(); }
}

// 使用
const idb = new IndexedDBHelper('myApp', 1, [
  { name: 'users', keyPath: 'id', indexes: ['email', 'name'] },
]);
await idb.open();
await idb.add('users', { name: 'Alice', email: 'alice@x.com' });
const users = await idb.getAll('users');`;
</script>

<style lang="less" scoped>
.indexeddb-page {
  padding: 20px;
  h5 {
    margin: 0 0 8px;
    font-size: 20px;
  }
  .page-desc {
    color: #666;
    font-size: 13px;
    margin-bottom: 20px;
    line-height: 1.7;
    code {
      background: #f5f5f5;
      padding: 2px 6px;
      border-radius: 3px;
    }
  }
}
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.status-bar {
  display: flex;
  align-items: center;
  gap: 24px;
  font-size: 13px;
  code {
    background: #f5f5f5;
    padding: 2px 6px;
    border-radius: 3px;
  }
  .status-item {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .status-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    &.connected {
      background: #67c23a;
    }
    &.disconnected {
      background: #f56c6c;
    }
  }
}
.op-form {
  padding: 8px 0;
}
.op-log-box {
  max-height: 300px;
  overflow-y: auto;
}
.op-log-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 5px 0;
  border-bottom: 1px solid #f5f5f5;
  font-size: 12px;
  .log-time {
    color: #bbb;
    font-family: monospace;
    min-width: 56px;
  }
  .log-msg {
    flex: 1;
    color: #333;
    word-break: break-all;
  }
}
.empty-tip {
  text-align: center;
  color: #ccc;
  padding: 20px 0;
  font-size: 12px;
}
.code-block {
  background: #1e1e1e;
  color: #cdd;
  border-radius: 6px;
  padding: 14px;
  font-size: 12px;
  font-family: monospace;
  line-height: 1.7;
  overflow-x: auto;
  white-space: pre;
  margin: 0;
}
</style>
