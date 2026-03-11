<template>
  <div class="app-wrapper">
    <Sidebar :is-collapse="isCollapse" />
    <div class="main-container" :class="{ collapse: isCollapse }">
      <Header :is-collapse="isCollapse" @toggle="toggleCollapse" />
      <div class="breadcrumb-bar">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item
            v-for="item in breadcrumbs"
            :key="item.path"
            :to="item.redirect ? undefined : { path: item.path }"
          >
            {{ item.meta?.title }}
          </el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <AppMain />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import Sidebar from './Sidebar.vue'
import Header from './Header.vue'
import AppMain from './AppMain.vue'

const isCollapse = ref(false)
const route = useRoute()

const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value
}

const breadcrumbs = computed(() => {
  return route.matched.filter(item => item.meta?.title)
})
</script>

<style scoped>
.app-wrapper {
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  margin-left: 220px;
  transition: margin-left 0.3s;
}

.main-container.collapse {
  margin-left: 64px;
}

.breadcrumb-bar {
  height: 40px;
  line-height: 40px;
  padding: 0 24px;
  background: #fff;
  border-bottom: 1px solid #e8eaec;
}
</style>
