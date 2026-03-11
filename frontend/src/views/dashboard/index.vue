<template>
  <div>
    <el-card>
      <template #header>欢迎使用 HR SaaS 发薪系统</template>
      <p>当前用户：{{ userStore.userInfo?.realName }}</p>
      <p>角色：{{ userStore.userInfo?.role }}</p>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '@/store/user'
const userStore = useUserStore()
</script>
