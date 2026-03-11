<template>
  <div class="employee-list">
    <el-card>
      <!-- 搜索区 -->
      <div class="search-bar">
        <el-form :inline="true" :model="searchForm">
          <el-form-item label="员工姓名">
            <el-input v-model="searchForm.name" placeholder="请输入员工姓名" clearable />
          </el-form-item>
          <el-form-item label="项目">
            <el-select v-model="searchForm.projectId" placeholder="请选择项目" clearable>
              <el-option v-for="p in projectList" :key="p.id" :label="p.name" :value="p.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
              <el-option label="待上岗" value="PENDING" />
              <el-option label="在职" value="ACTIVE" />
              <el-option label="离职待支付" value="PENDING_EXIT" />
              <el-option label="离职" value="RESIGNED" />
              <el-option label="辞退" value="FIRED" />
              <el-option label="开除" value="DISMISSED" />
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
        <el-button type="primary" @click="handleAdd">新增员工</el-button>
      </div>

      <!-- 表格 -->
      <el-table :data="tableData" border stripe v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="姓名" width="100" />
        <el-table-column prop="idCard" label="身份证号" width="180" />
        <el-table-column prop="phone" label="手机号" width="130" />
        <el-table-column prop="projectId" label="项目" width="150">
          <template #default="{ row }">
            {{ getProjectName(row.projectId) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="emergencyContact" label="紧急联系人" width="100" />
        <el-table-column prop="emergencyPhone" label="紧急联系人电话" width="140" />
        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="success" link @click="handleAssignProject(row)">分配项目</el-button>
            <el-button
              :type="row.status === 'ACTIVE' ? 'warning' : 'success'"
              link
              @click="handleChangeStatus(row)"
            >
              变更状态
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
      :title="isEdit ? '编辑员工' : '新增员工'"
      width="600px"
      @close="handleDialogClose"
    >
      <el-form ref="formRef" :model="form" :rules="formRules" label-width="120px">
        <el-form-item label="姓名" prop="name">
          <el-input v-model="form.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="身份证号" prop="idCard">
          <el-input v-model="form.idCard" placeholder="请输入身份证号" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="紧急联系人" prop="emergencyContact">
          <el-input v-model="form.emergencyContact" placeholder="请输入紧急联系人" />
        </el-form-item>
        <el-form-item label="紧急联系人电话" prop="emergencyPhone">
          <el-input v-model="form.emergencyPhone" placeholder="请输入紧急联系人电话" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 分配项目弹窗 -->
    <el-dialog v-model="assignDialogVisible" title="分配项目" width="400px">
      <el-form label-width="80px">
        <el-form-item label="选择项目">
          <el-select v-model="assignForm.projectId" placeholder="请选择项目" style="width: 100%">
            <el-option v-for="p in projectList" :key="p.id" :label="p.name" :value="p.id" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="assignDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleAssignSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 变更状态弹窗 -->
    <el-dialog v-model="statusDialogVisible" title="变更状态" width="400px">
      <el-form label-width="80px">
        <el-form-item label="新状态">
          <el-select v-model="statusForm.status" placeholder="请选择状态" style="width: 100%">
            <el-option label="待上岗" value="PENDING" />
            <el-option label="在职" value="ACTIVE" />
            <el-option label="离职待支付" value="PENDING_EXIT" />
            <el-option label="离职" value="RESIGNED" />
            <el-option label="辞退" value="FIRED" />
            <el-option label="开除" value="DISMISSED" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="statusDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleStatusSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, FormInstance } from 'element-plus'
import { getEmployeeList, createEmployee, updateEmployee, changeEmployeeStatus, deleteEmployee, assignProject, type Employee } from '@/api/employee'
import { getProjectList } from '@/api/project'

const statusMap: Record<string, string> = {
  PENDING: '待上岗',
  ACTIVE: '在职',
  PENDING_EXIT: '离职待支付',
  RESIGNED: '离职',
  FIRED: '辞退',
  DISMISSED: '开除'
}

const statusTypeMap: Record<string, string> = {
  PENDING: 'info',
  ACTIVE: 'success',
  PENDING_EXIT: 'warning',
  RESIGNED: 'info',
  FIRED: 'danger',
  DISMISSED: 'danger'
}

const searchForm = reactive({
  name: '',
  projectId: undefined as number | undefined,
  status: ''
})

const tableData = ref<Employee[]>([])
const loading = ref(false)
const projectList = ref<{ id: number; name: string }[]>([])

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const dialogVisible = ref(false)
const assignDialogVisible = ref(false)
const statusDialogVisible = ref(false)
const isEdit = ref(false)
const submitLoading = ref(false)
const formRef = ref<FormInstance>()

const form = reactive({
  id: 0,
  name: '',
  idCard: '',
  phone: '',
  emergencyContact: '',
  emergencyPhone: '',
  remark: ''
})

const assignForm = reactive({
  id: 0,
  projectId: undefined as number | undefined
})

const statusForm = reactive({
  id: 0,
  status: ''
})

const formRules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  idCard: [{ required: true, message: '请输入身份证号', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入手机号', trigger: 'blur' }]
}

const getStatusText = (status: string) => statusMap[status] || status
const getStatusType = (status: string) => statusTypeMap[status] || 'info'

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

const getProjectName = (projectId?: number) => {
  if (!projectId) return '-'
  const project = projectList.value.find(p => p.id === projectId)
  return project?.name || '-'
}

const loadProjects = async () => {
  try {
    const res: any = await getProjectList({ page: 1, pageSize: 1000 })
    projectList.value = res.data.list
  } catch (e) {
    console.error('加载项目列表失败', e)
  }
}

const loadData = async () => {
  loading.value = true
  try {
    const res: any = await getEmployeeList({
      name: searchForm.name || undefined,
      projectId: searchForm.projectId,
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
  searchForm.projectId = undefined
  searchForm.status = ''
  handleSearch()
}

const handleAdd = () => {
  isEdit.value = false
  dialogVisible.value = true
}

const handleEdit = (row: Employee) => {
  isEdit.value = true
  Object.assign(form, row)
  dialogVisible.value = true
}

const handleDialogClose = () => {
  formRef.value?.resetFields()
  Object.assign(form, {
    id: 0,
    name: '',
    idCard: '',
    phone: '',
    emergencyContact: '',
    emergencyPhone: '',
    remark: ''
  })
}

const handleSubmit = async () => {
  await formRef.value?.validate()
  submitLoading.value = true
  try {
    if (isEdit.value) {
      await updateEmployee(form.id, {
        name: form.name,
        phone: form.phone,
        emergencyContact: form.emergencyContact,
        emergencyPhone: form.emergencyPhone,
        remark: form.remark
      })
      ElMessage.success('编辑成功')
    } else {
      await createEmployee({
        name: form.name,
        idCard: form.idCard,
        phone: form.phone,
        emergencyContact: form.emergencyContact,
        emergencyPhone: form.emergencyPhone,
        remark: form.remark
      })
      ElMessage.success('新增成功')
    }
    dialogVisible.value = false
    loadData()
  } finally {
    submitLoading.value = false
  }
}

const handleAssignProject = (row: Employee) => {
  assignForm.id = row.id
  assignForm.projectId = row.projectId
  assignDialogVisible.value = true
}

const handleAssignSubmit = async () => {
  if (!assignForm.projectId) {
    ElMessage.warning('请选择项目')
    return
  }
  await assignProject(assignForm.id, assignForm.projectId)
  ElMessage.success('分配成功')
  assignDialogVisible.value = false
  loadData()
}

const handleChangeStatus = (row: Employee) => {
  statusForm.id = row.id
  statusForm.status = row.status
  statusDialogVisible.value = true
}

const handleStatusSubmit = async () => {
  if (!statusForm.status) {
    ElMessage.warning('请选择状态')
    return
  }
  await changeEmployeeStatus(statusForm.id, statusForm.status)
  ElMessage.success('状态变更成功')
  statusDialogVisible.value = false
  loadData()
}

const handleDelete = async (row: Employee) => {
  await ElMessageBox.confirm('确认删除该员工？删除后无法恢复。', '警告', { type: 'error' })
  await deleteEmployee(row.id)
  ElMessage.success('删除成功')
  loadData()
}

onMounted(() => {
  loadProjects()
  loadData()
})
</script>

<style scoped>
.employee-list {
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
