<template>
  <div class="company-list">
    <el-card>
      <!-- 搜索区 -->
      <div class="search-bar">
        <el-form :inline="true" :model="searchForm">
          <el-form-item label="企业名称">
            <el-input v-model="searchForm.name" placeholder="请输入企业名称" clearable />
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
        <el-button type="primary" @click="handleAdd">新增企业</el-button>
      </div>

      <!-- 表格 -->
      <el-table :data="tableData" border stripe v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="企业名称" min-width="150" />
        <el-table-column prop="shortName" label="简称" min-width="100" />
        <el-table-column prop="contactName" label="联系人" width="100" />
        <el-table-column prop="contactPhone" label="联系电话" width="130" />
        <el-table-column prop="contactEmail" label="邮箱" min-width="150" />
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
      :title="isEdit ? '编辑企业' : '新增企业'"
      width="600px"
      @close="handleDialogClose"
    >
      <el-form ref="formRef" :model="form" :rules="formRules" label-width="100px">
        <el-form-item label="企业名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入企业名称" />
        </el-form-item>
        <el-form-item label="企业简称" prop="shortName">
          <el-input v-model="form.shortName" placeholder="请输入企业简称" />
        </el-form-item>
        <el-form-item label="联系人" prop="contactName">
          <el-input v-model="form.contactName" placeholder="请输入联系人" />
        </el-form-item>
        <el-form-item label="联系电话" prop="contactPhone">
          <el-input v-model="form.contactPhone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="邮箱" prop="contactEmail">
          <el-input v-model="form.contactEmail" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="地址" prop="address">
          <el-input v-model="form.address" placeholder="请输入地址" />
        </el-form-item>
        <template v-if="!isEdit">
          <el-divider>管理员信息</el-divider>
          <el-form-item label="管理员账号" prop="adminUsername">
            <el-input v-model="form.adminUsername" placeholder="请输入管理员账号" />
          </el-form-item>
          <el-form-item label="管理员密码" prop="adminPassword">
            <el-input v-model="form.adminPassword" type="password" placeholder="请输入管理员密码" show-password />
          </el-form-item>
          <el-form-item label="管理员姓名" prop="adminRealName">
            <el-input v-model="form.adminRealName" placeholder="请输入管理员姓名" />
          </el-form-item>
          <el-form-item label="管理员手机" prop="adminPhone">
            <el-input v-model="form.adminPhone" placeholder="请输入管理员手机" />
          </el-form-item>
        </template>
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
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance } from 'element-plus'
import { getCompanyList, createCompany, updateCompany, changeCompanyStatus, type Company } from '@/api/company'

const searchForm = reactive({
  name: '',
  status: ''
})

const tableData = ref<Company[]>([])
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
  shortName: '',
  contactName: '',
  contactPhone: '',
  contactEmail: '',
  address: '',
  adminUsername: '',
  adminPassword: '',
  adminRealName: '',
  adminPhone: ''
})

const formRules = {
  name: [{ required: true, message: '请输入企业名称', trigger: 'blur' }],
  adminUsername: [{ required: true, message: '请输入管理员账号', trigger: 'blur' }],
  adminPassword: [{ required: true, message: '请输入管理员密码', trigger: 'blur' }]
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
    const res: any = await getCompanyList({
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

const handleEdit = (row: Company) => {
  isEdit.value = true
  Object.assign(form, row)
  dialogVisible.value = true
}

const handleDialogClose = () => {
  formRef.value?.resetFields()
  Object.assign(form, {
    id: 0,
    name: '',
    shortName: '',
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    address: '',
    adminUsername: '',
    adminPassword: '',
    adminRealName: '',
    adminPhone: ''
  })
}

const handleSubmit = async () => {
  await formRef.value?.validate()
  submitLoading.value = true
  try {
    if (isEdit.value) {
      await updateCompany(form.id, {
        name: form.name,
        shortName: form.shortName,
        contactName: form.contactName,
        contactPhone: form.contactPhone,
        contactEmail: form.contactEmail,
        address: form.address
      })
      ElMessage.success('编辑成功')
    } else {
      await createCompany({
        name: form.name,
        shortName: form.shortName,
        contactName: form.contactName,
        contactPhone: form.contactPhone,
        contactEmail: form.contactEmail,
        address: form.address,
        adminUsername: form.adminUsername,
        adminPassword: form.adminPassword,
        adminRealName: form.adminRealName,
        adminPhone: form.adminPhone
      })
      ElMessage.success('新增成功')
    }
    dialogVisible.value = false
    loadData()
  } finally {
    submitLoading.value = false
  }
}

const handleToggleStatus = async (row: Company) => {
  const newStatus = row.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
  const action = newStatus === 'ACTIVE' ? '启用' : '停用'
  await ElMessageBox.confirm(`确认${action}该企业？`, '提示', { type: 'warning' })
  await changeCompanyStatus(row.id, newStatus)
  ElMessage.success(`${action}成功`)
  loadData()
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.company-list {
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
