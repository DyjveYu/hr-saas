<template>
  <div class="project-list">
    <el-card>
      <!-- 搜索区 -->
      <div class="search-bar">
        <el-form :inline="true" :model="searchForm">
          <el-form-item label="项目名称">
            <el-input v-model="searchForm.name" placeholder="请输入项目名称" clearable />
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
              <el-option label="启用" value="ACTIVE" />
              <el-option label="停用" value="INACTIVE" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">查询</el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 操作栏 -->
      <div class="toolbar">
        <el-button type="primary" @click="handleAdd">新增项目</el-button>
      </div>

      <!-- 表格 -->
      <el-table :data="tableData" border stripe v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="项目名称" min-width="150" />
        <el-table-column prop="capacity" label="人数上限" width="100" />
        <el-table-column prop="siteManager" label="现场负责人" width="120" />
        <el-table-column prop="siteManagerPhone" label="现场负责人电话" width="140" />
        <el-table-column prop="financeManager" label="财务负责人" width="120" />
        <el-table-column prop="financeManagerPhone" label="财务负责人电话" width="140" />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 'ACTIVE' ? 'success' : 'danger'">
              {{ row.status === 'ACTIVE' ? '启用' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button
              :type="row.status === 'ACTIVE' ? 'danger' : 'success'"
              link
              @click="handleToggleStatus(row)"
            >
              {{ row.status === 'ACTIVE' ? '停用' : '启用' }}
            </el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadData"
          @current-change="loadData"
        />
      </div>
    </el-card>

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑项目' : '新增项目'"
      width="600px"
      @close="handleDialogClose"
    >
      <el-form ref="formRef" :model="form" :rules="formRules" label-width="120px">
        <el-form-item label="项目名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入项目名称" />
        </el-form-item>
        <el-form-item label="人数上限" prop="capacity">
          <el-input-number v-model="form.capacity" :min="1" :max="10000" />
        </el-form-item>
        <el-form-item label="现场负责人" prop="siteManager">
          <el-input v-model="form.siteManager" placeholder="请输入现场负责人" />
        </el-form-item>
        <el-form-item label="现场负责人电话" prop="siteManagerPhone">
          <el-input v-model="form.siteManagerPhone" placeholder="请输入现场负责人电话" />
        </el-form-item>
        <el-form-item label="财务负责人" prop="financeManager">
          <el-input v-model="form.financeManager" placeholder="请输入财务负责人" />
        </el-form-item>
        <el-form-item label="财务负责人电话" prop="financeManagerPhone">
          <el-input v-model="form.financeManagerPhone" placeholder="请输入财务负责人电话" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, FormInstance } from 'element-plus'
import { getProjectList, createProject, updateProject, changeProjectStatus, deleteProject, type Project } from '@/api/project'

const searchForm = reactive({
  name: '',
  status: ''
})

const tableData = ref<Project[]>([])
const loading = ref(false)

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const dialogVisible = ref(false)
const isEdit = ref(false)
const submitLoading = ref(false)
const formRef = ref<FormInstance>()

const form = reactive({
  id: 0,
  name: '',
  capacity: undefined as number | undefined,
  siteManager: '',
  siteManagerPhone: '',
  financeManager: '',
  financeManagerPhone: ''
})

const formRules = {
  name: [{ required: true, message: '请输入项目名称', trigger: 'blur' }]
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const loadData = async () => {
  loading.value = true
  try {
    const res: any = await getProjectList({
      name: searchForm.name || undefined,
      status: searchForm.status || undefined,
      page: pagination.page,
      pageSize: pagination.pageSize
    })
    tableData.value = res.data.list
    pagination.total = res.data.total
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.page = 1
  loadData()
}

const handleReset = () => {
  searchForm.name = ''
  searchForm.status = ''
  handleSearch()
}

const handleAdd = () => {
  isEdit.value = false
  dialogVisible.value = true
}

const handleEdit = (row: Project) => {
  isEdit.value = true
  Object.assign(form, row)
  dialogVisible.value = true
}

const handleDialogClose = () => {
  formRef.value?.resetFields()
  Object.assign(form, {
    id: 0,
    name: '',
    capacity: undefined,
    siteManager: '',
    siteManagerPhone: '',
    financeManager: '',
    financeManagerPhone: ''
  })
}

const handleSubmit = async () => {
  await formRef.value?.validate()
  submitLoading.value = true
  try {
    if (isEdit.value) {
      await updateProject(form.id, {
        name: form.name,
        capacity: form.capacity,
        siteManager: form.siteManager,
        siteManagerPhone: form.siteManagerPhone,
        financeManager: form.financeManager,
        financeManagerPhone: form.financeManagerPhone
      })
      ElMessage.success('编辑成功')
    } else {
      await createProject({
        name: form.name,
        capacity: form.capacity,
        siteManager: form.siteManager,
        siteManagerPhone: form.siteManagerPhone,
        financeManager: form.financeManager,
        financeManagerPhone: form.financeManagerPhone
      })
      ElMessage.success('新增成功')
    }
    dialogVisible.value = false
    loadData()
  } finally {
    submitLoading.value = false
  }
}

const handleToggleStatus = async (row: Project) => {
  const newStatus = row.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
  const action = newStatus === 'ACTIVE' ? '启用' : '停用'
  await ElMessageBox.confirm(`确认${action}该项目？`, '提示', { type: 'warning' })
  await changeProjectStatus(row.id, newStatus)
  ElMessage.success(`${action}成功`)
  loadData()
}

const handleDelete = async (row: Project) => {
  await ElMessageBox.confirm('确认删除该项目？删除后无法恢复。', '警告', { type: 'error' })
  await deleteProject(row.id)
  ElMessage.success('删除成功')
  loadData()
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.project-list {
  width: 100%;
}

.search-bar {
  margin-bottom: 16px;
}

.toolbar {
  margin-bottom: 16px;
}

.pagination {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>
