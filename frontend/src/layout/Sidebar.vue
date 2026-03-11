<template>
  <div class="sidebar" :class="{ collapse: isCollapse }">
    <div class="logo">
      <span v-if="!isCollapse" class="logo-title">HR SaaS</span>
      <span v-else class="logo-icon">HR</span>
    </div>
    <el-menu
      :default-active="activeMenu"
      :collapse="isCollapse"
      :collapse-transition="false"
      background-color="#001529"
      text-color="#c0c4cc"
      active-text-color="#ffffff"
      router
    >
      <template v-for="item in menuList" :key="item.path">
        <!-- 有子菜单 -->
        <el-sub-menu v-if="item.children && item.children.length > 1" :index="item.path">
          <template #title>
            <el-icon><component :is="item.meta?.icon" /></el-icon>
            <span>{{ item.meta?.title }}</span>
          </template>
          <el-menu-item
            v-for="child in item.children"
            :key="child.path"
            :index="`${item.path}/${child.path}`"
          >
            {{ child.meta?.title }}
          </el-menu-item>
        </el-sub-menu>
        <!-- 只有一个子菜单，直接显示 -->
        <el-menu-item
          v-else
          :index="item.children?.[0] ? `${item.path}/${item.children[0].path}` : item.path"
        >
          <el-icon><component :is="item.meta?.icon" /></el-icon>
          <template #title>{{ item.meta?.title }}</template>
        </el-menu-item>
      </template>
    </el-menu>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/store/user'
import { menuConfig } from '@/router/menu'

defineProps<{ isCollapse: boolean }>()

const route = useRoute()
const userStore = useUserStore()

const activeMenu = computed(() => route.path)

const menuList = computed(() => {
  const role = userStore.userInfo?.role
  return menuConfig.filter(item => !item.roles || item.roles.includes(role!))
})
</script>

<style scoped>
.sidebar {
  width: 220px;
  height: 100vh;
  background-color: #001529;
  flex-shrink: 0;
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  transition: width 0.3s;
  z-index: 1000;
  overflow-y: auto;
  overflow-x: hidden;
}

.sidebar.collapse {
  width: 64px;
}

.logo {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 18px;
  font-weight: bold;
  border-bottom: 1px solid #002140;
}

.el-menu {
  border-right: none;
}
</style>
