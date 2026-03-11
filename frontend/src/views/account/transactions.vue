<template>
  <div class="account-transactions">
    <el-card>
      <!-- 搜索区 -->
      <div class="search-bar">
        <el-form :inline="true" :model="searchForm">
          <el-form-item label="交易类型">
            <el-select v-model="searchForm.type" placeholder="请选择类型" clearable>
              <el-option label="充值" value="RECHARGE" />
              <el-option label="发薪" value="PAYROLL" />
              <el-option label="退款" value="REFUND" />
            </el-select>
          </el-form-item>
          <el-form-item label="资金方向">
            <el-select v-model="searchForm.direction" placeholder="请选择方向" clearable>
              <el-option label="入账" value="IN" />
              <el-option label="出账" value="OUT" />
            </el-select>
          </el-form-item>
          <el-form-item label="日期">
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="YYYY-MM-DD"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">查询</el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 表格 -->
      <el-table :data="tableData" border stripe v-loading="loading">
        <el-table-column prop="id" label="流水号" width="100" />
        <el-table-column prop="type" label="交易类型" width="100">
          <template #default="{ row }">
            {{ getTypeText(row.type) }}
          </template>
        </el-table-column>
        <el-table-column prop="direction" label="方向" width="80">
          <template #default="{ row }">
            <el-tag :type="row.direction === 'IN' ? 'success' : 'danger'">
              {{ row.direction === 'IN' ? '入账' : '出账' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="amount" label="金额" width="140">
          <template #default="{ row }">
            <span :class="{ 'amount-in': row.direction === 'IN', 'amount-out': row.direction === 'OUT' }">
              {{ row.direction === 'IN' ? '+' : '-' }}¥{{ row.amount.toLocaleString() }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="balanceAfter" label="账户余额" width="140">
          <template #default="{ row }">
            ¥{{ row.balanceAfter?.toLocaleString() || '0' }}
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="150" />
        <el-table-column prop="createdAt" label="交易时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { getTransactionList, type Transaction } from '@/api/account'

const typeMap: Record<string, string> = {
  RECHARGE: '充值',
  PAYROLL: '发薪',
  REFUND: '退款'
}

const searchForm = reactive({
  type: '',
  direction: ''
})

const dateRange = ref<[string, string] | null>(null)

const tableData = ref<Transaction[]>([])
const loading = ref(false)

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const getTypeText = (type: string) => typeMap[type] || type

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
    const res: any = await getTransactionList({
      type: searchForm.type || undefined,
      direction: searchForm.direction || undefined,
      startDate: dateRange.value?.[0],
      endDate: dateRange.value?.[1],
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
  searchForm.type = ''
  searchForm.direction = ''
  dateRange.value = null
  handleSearch()
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.account-transactions {
  width: 100%;
}

.search-bar {
  margin-bottom: 16px;
}

.pagination {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}

.amount-in {
  color: #67C23A;
  font-weight: bold;
}

.amount-out {
  color: #F56C6C;
  font-weight: bold;
}
</style>
