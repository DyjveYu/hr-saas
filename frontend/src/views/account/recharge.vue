<template>
  <div class="account-recharge">
    <el-card>
      <template #header>
        <span>充值申请</span>
      </template>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="充值金额" prop="amount">
          <el-input-number v-model="form.amount" :min="1" :precision="2" style="width: 300px" />
          <span class="amount-tip">元</span>
        </el-form-item>
        <el-form-item label="转账凭证">
          <el-input v-model="form.transferVoucherUrl" placeholder="请输入转账凭证图片URL（可选）" style="width: 300px" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="请输入备注（可选）" style="width: 300px" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" @click="handleSubmit">提交申请</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card style="margin-top: 20px">
      <template #header>
        <span>充值说明</span>
      </template>
      <div class="recharge-tips">
        <p>1. 提交充值申请后，请联系平台管理员确认充值到账</p>
        <p>2. 充值金额将实时到账您企业的账户余额</p>
        <p>3. 如有疑问，请联系平台客服</p>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, FormInstance } from 'element-plus'
import { createRecharge } from '@/api/recharge'

const formRef = ref<FormInstance>()
const loading = ref(false)

const form = reactive({
  amount: 0,
  transferVoucherUrl: '',
  remark: ''
})

const rules = {
  amount: [{ required: true, message: '请输入充值金额', trigger: 'blur' }]
}

const handleSubmit = async () => {
  await formRef.value?.validate()
  if (form.amount <= 0) {
    ElMessage.warning('请输入正确的充值金额')
    return
  }
  loading.value = true
  try {
    await createRecharge({
      amount: form.amount,
      transferVoucherUrl: form.transferVoucherUrl || undefined,
      remark: form.remark || undefined
    })
    ElMessage.success('充值申请已提交')
    formRef.value?.resetFields()
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.account-recharge {
  width: 100%;
}

.amount-tip {
  margin-left: 10px;
  color: #909399;
}

.recharge-tips {
  color: #606266;
  line-height: 2;
}
</style>
