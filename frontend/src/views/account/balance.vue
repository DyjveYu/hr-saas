<template>
  <div class="account-balance">
    <el-row :gutter="20">
      <el-col :span="8">
        <el-card class="balance-card">
          <div class="balance-label">账户余额</div>
          <div class="balance-amount">¥{{ accountInfo.balance?.toLocaleString() || '0' }}</div>
          <div class="balance-status">
            <el-tag :type="accountInfo.status === 'ACTIVE' ? 'success' : 'danger'">
              {{ accountInfo.status === 'ACTIVE' ? '正常' : '冻结' }}
            </el-tag>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="info-card">
          <div class="info-item">
            <span class="info-label">账户ID：</span>
            <span class="info-value">{{ accountInfo.id || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">企业ID：</span>
            <span class="info-value">{{ accountInfo.tenantId || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">创建时间：</span>
            <span class="info-value">{{ formatDate(accountInfo.createdAt) }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">更新时间：</span>
            <span class="info-value">{{ formatDate(accountInfo.updatedAt) }}</span>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getAccountBalance } from '@/api/account'

const accountInfo = ref<any>({})

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
  try {
    const res: any = await getAccountBalance()
    accountInfo.value = res.data
  } catch (e) {
    console.error('加载账户信息失败', e)
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.account-balance {
  width: 100%;
}

.balance-card {
  text-align: center;
  padding: 20px;
}

.balance-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 16px;
}

.balance-amount {
  font-size: 32px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 16px;
}

.balance-status {
  margin-top: 10px;
}

.info-card {
  padding: 20px;
}

.info-item {
  margin-bottom: 12px;
  font-size: 14px;
}

.info-label {
  color: #909399;
}

.info-value {
  color: #303133;
}
</style>
