# 前端重建指南
# 技术方案：Vue3 + Vite + Element Plus（不依赖任何 admin 框架）

> 版本：v2.0
> 替代文档：frontend-migration.md（已废弃、已删除）
> 核心原则：所有代码对 Claude Code 完全透明，不依赖任何框架内部机制

---

## 重建前必读

### 为什么不用 admin 框架

| 问题 | 原因 |
|------|------|
| 路由守卫冲突 | 框架内部路由机制对 Claude Code 不透明 |
| 权限系统复杂 | 框架权限体系和业务逻辑耦合深 |
| 调试困难 | 出问题无法准确定位是框架问题还是业务问题 |
| SOP 不可复用 | 框架版本升级或更换时经验无法迁移 |

### 本方案的核心优势

- 所有代码由 Claude Code 从零编写，完全掌控
- Layout、路由守卫、权限逻辑不超过 300 行，清晰透明
- 出问题能准确定位，一次修复不反复
- 可直接复用到下个项目，是 SOP 的基础

---

## 技术栈

```
Vue 3.4+
Vite 5+
Vue Router 4
Pinia 2
Element Plus 2.x
@element-plus/icons-vue
axios
```

不引入任何 admin 框架、不引入 mock 系统、不引入 i18n（本项目纯中文）。

---

**第二步：Git 提交当前状态**

```powershell
cd C:\yu\wwwwroot\pro_HRM
git add .
git commit -m "重建前端前备份：保存当前框架状态"
```

---

## 第一步：创建全新前端项目

> ⚠️ 执行前确认备份已完成，否则禁止执行此步骤

```powershell
# 删除现有前端
Remove-Item -Recurse -Force frontend

# 创建新项目
npm create vue@latest frontend
```

创建时选择：
- TypeScript：Yes
- Vue Router：Yes
- Pinia：Yes
- 其他全选 No

```powershell
cd frontend
npm install
npm install element-plus @element-plus/icons-vue axios
npm install -D sass
```

**验证：** `npm run dev` 能启动，看到 Vue 默认页面。

**⏸ 告诉我已完成，我确认后继续。**

---

## 第二步：项目基础配置

### 2.1 vite.config.ts

```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
})
```

### 2.2 src/main.ts

```typescript
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import router from './router'
import App from './App.vue'
import './styles/global.css'

const app = createApp(App)

// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(createPinia())
app.use(router)
app.use(ElementPlus, { locale: zhCn })
app.mount('#app')
```

### 2.3 src/styles/global.css

```css
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html,
body,
#app {
  height: 100%;
  width: 100%;
  overflow: hidden;
  font-size: 14px;
  color: #303133;
  background-color: #f0f2f5;
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-thumb {
  background: #c0c4cc;
  border-radius: 3px;
}
```

**⏸ 告诉我已完成，我确认后继续。**

---

## 第三步：Layout 组件

Layout 是整个前端的骨架，必须在所有业务页面之前完成。

### 文件结构

```
src/
└── layout/
    ├── index.vue          ← 主布局（组合左侧+顶部+内容区）
    ├── Sidebar.vue        ← 左侧导航
    ├── Header.vue         ← 顶部栏
    └── AppMain.vue        ← 内容区（router-view）
```

### layout/index.vue

```vue
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
```

### layout/Sidebar.vue

```vue
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
```

### layout/Header.vue

```vue
<template>
  <div class="header">
    <div class="header-left">
      <el-icon class="toggle-btn" @click="$emit('toggle')">
        <Fold v-if="!isCollapse" />
        <Expand v-else />
      </el-icon>
    </div>
    <div class="header-right">
      <el-dropdown @command="handleCommand">
        <div class="user-info">
          <el-avatar :size="32" class="avatar">
            {{ userStore.userInfo?.realName?.charAt(0) || 'U' }}
          </el-avatar>
          <span class="username">{{ userStore.userInfo?.realName || userStore.userInfo?.username }}</span>
          <el-icon><ArrowDown /></el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="logout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '@/store/user'
import { useRouter } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'

defineProps<{ isCollapse: boolean }>()
defineEmits(['toggle'])

const userStore = useUserStore()
const router = useRouter()

const handleCommand = async (command: string) => {
  if (command === 'logout') {
    await ElMessageBox.confirm('确认退出登录？', '提示', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    })
    userStore.logout()
    router.push('/login')
    ElMessage.success('已退出登录')
  }
}
</script>

<style scoped>
.header {
  height: 64px;
  background: #fff;
  border-bottom: 1px solid #e8eaec;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  flex-shrink: 0;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
}

.toggle-btn {
  font-size: 20px;
  cursor: pointer;
  color: #606266;
}

.toggle-btn:hover {
  color: #409eff;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
}

.user-info:hover {
  background: #f5f7fa;
}

.username {
  font-size: 14px;
  color: #303133;
}
</style>
```

### layout/AppMain.vue

```vue
<template>
  <div class="app-main">
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>

<style scoped>
.app-main {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  background: #f0f2f5;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
```

**⏸ 完成后告诉我，我确认后继续。**

---

## 第四步：菜单配置

### src/router/menu.ts

```typescript
export interface MenuItem {
  path: string
  meta: {
    title: string
    icon: string
  }
  roles?: string[]
  children?: {
    path: string
    meta: { title: string }
  }[]
}

export const menuConfig: MenuItem[] = [
  {
    path: '/company',
    meta: { title: '企业管理', icon: 'OfficeBuilding' },
    roles: ['PLATFORM_ADMIN'],
    children: [{ path: 'list', meta: { title: '企业列表' } }]
  },
  {
    path: '/recharge',
    meta: { title: '充值管理', icon: 'CreditCard' },
    roles: ['PLATFORM_ADMIN'],
    children: [{ path: 'list', meta: { title: '充值记录' } }]
  },
  {
    path: '/project',
    meta: { title: '项目管理', icon: 'List' },
    roles: ['COMPANY_ADMIN'],
    children: [{ path: 'list', meta: { title: '项目列表' } }]
  },
  {
    path: '/employee',
    meta: { title: '员工管理', icon: 'User' },
    roles: ['COMPANY_ADMIN'],
    children: [{ path: 'list', meta: { title: '员工列表' } }]
  },
  {
    path: '/account',
    meta: { title: '账户管理', icon: 'Wallet' },
    roles: ['COMPANY_ADMIN'],
    children: [
      { path: 'balance', meta: { title: '账户余额' } },
      { path: 'recharge', meta: { title: '充值申请' } },
      { path: 'transactions', meta: { title: '资金流水' } }
    ]
  }
]
```

---

## 第五步：路由配置

### src/router/index.ts

```typescript
import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@/layout/index.vue'
import { useUserStore } from '@/store/user'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/login/index.vue'),
      meta: { title: '登录', public: true }
    },
    {
      path: '/',
      component: Layout,
      redirect: '/dashboard',
      children: [
        {
          path: 'dashboard',
          name: 'Dashboard',
          component: () => import('@/views/dashboard/index.vue'),
          meta: { title: '首页' }
        },
        // 企业管理（平台管理员）
        {
          path: 'company/list',
          name: 'CompanyList',
          component: () => import('@/views/company/list.vue'),
          meta: { title: '企业列表', roles: ['PLATFORM_ADMIN'] }
        },
        // 充值管理（平台管理员）
        {
          path: 'recharge/list',
          name: 'RechargeList',
          component: () => import('@/views/recharge/list.vue'),
          meta: { title: '充值记录', roles: ['PLATFORM_ADMIN'] }
        },
        // 项目管理（企业管理员）
        {
          path: 'project/list',
          name: 'ProjectList',
          component: () => import('@/views/project/list.vue'),
          meta: { title: '项目列表', roles: ['COMPANY_ADMIN'] }
        },
        // 员工管理（企业管理员）
        {
          path: 'employee/list',
          name: 'EmployeeList',
          component: () => import('@/views/employee/list.vue'),
          meta: { title: '员工列表', roles: ['COMPANY_ADMIN'] }
        },
        // 账户管理（企业管理员）
        {
          path: 'account/balance',
          name: 'AccountBalance',
          component: () => import('@/views/account/balance.vue'),
          meta: { title: '账户余额', roles: ['COMPANY_ADMIN'] }
        },
        {
          path: 'account/recharge',
          name: 'AccountRecharge',
          component: () => import('@/views/account/recharge.vue'),
          meta: { title: '充值申请', roles: ['COMPANY_ADMIN'] }
        },
        {
          path: 'account/transactions',
          name: 'AccountTransactions',
          component: () => import('@/views/account/transactions.vue'),
          meta: { title: '资金流水', roles: ['COMPANY_ADMIN'] }
        }
      ]
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/dashboard'
    }
  ]
})

// 路由守卫
router.beforeEach((to, _from, next) => {
  const userStore = useUserStore()
  const token = userStore.token

  // 公开页面直接放行
  if (to.meta.public) {
    if (token && to.path === '/login') {
      next('/dashboard')
    } else {
      next()
    }
    return
  }

  // 未登录跳转登录页
  if (!token) {
    next(`/login?redirect=${to.path}`)
    return
  }

  // 角色权限检查
  const roles = to.meta.roles as string[] | undefined
  if (roles && !roles.includes(userStore.userInfo?.role || '')) {
    next('/dashboard')
    return
  }

  next()
})

export default router
```

---

## 第六步：状态管理

### src/store/user.ts

```typescript
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

interface UserInfo {
  id: number
  username: string
  realName: string
  role: string
  tenantId?: number
}

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '')
  const userInfo = ref<UserInfo | null>(
    JSON.parse(localStorage.getItem('userInfo') || 'null')
  )

  const isLoggedIn = computed(() => !!token.value)

  const setToken = (t: string) => {
    token.value = t
    localStorage.setItem('token', t)
  }

  const setUserInfo = (info: UserInfo) => {
    userInfo.value = info
    localStorage.setItem('userInfo', JSON.stringify(info))
  }

  const logout = () => {
    token.value = ''
    userInfo.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
  }

  return { token, userInfo, isLoggedIn, setToken, setUserInfo, logout }
}, { persist: false })
```

---

## 第七步：API 配置

### src/api/request.ts

```typescript
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/store/user'
import router from '@/router'

const request = axios.create({
  baseURL: '/api',
  timeout: 10000
})

// 请求拦截：附加 token
request.interceptors.request.use(config => {
  const userStore = useUserStore()
  if (userStore.token) {
    config.headers.Authorization = `Bearer ${userStore.token}`
  }
  return config
})

// 响应拦截：统一错误处理
request.interceptors.response.use(
  response => response.data,
  error => {
    const status = error.response?.status
    const message = error.response?.data?.message || '请求失败'

    if (status === 401) {
      const userStore = useUserStore()
      userStore.logout()
      router.push('/login')
      ElMessage.error('登录已过期，请重新登录')
    } else {
      ElMessage.error(message)
    }

    return Promise.reject(error)
  }
)

export default request
```

### src/api/auth.ts

```typescript
import request from './request'

export const login = (data: { username: string; password: string }) =>
  request.post('/auth/login', data)

export const getUserInfo = () =>
  request.get('/auth/info')

export const logout = () =>
  request.post('/auth/logout')
```

---

## 第八步：登录页面

### src/views/login/index.vue

```vue
<template>
  <div class="login-page">
    <div class="login-card">
      <h2 class="login-title">HR SaaS 发薪系统</h2>
      <el-form ref="formRef" :model="form" :rules="rules" size="large">
        <el-form-item prop="username">
          <el-input
            v-model="form.username"
            placeholder="请输入用户名"
            :prefix-icon="User"
          />
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            :prefix-icon="Lock"
            show-password
            @keyup.enter="handleLogin"
          />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            class="login-btn"
            :loading="loading"
            @click="handleLogin"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import { login, getUserInfo } from '@/api/auth'
import { useUserStore } from '@/store/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const formRef = ref()
const loading = ref(false)
const form = ref({ username: '', password: '' })

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

const handleLogin = async () => {
  await formRef.value?.validate()
  loading.value = true
  try {
    const res: any = await login(form.value)
    // 兼容 access_token 和 accessToken 两种格式
    const token = res.data?.accessToken || res.data?.access_token
    userStore.setToken(token)

    const userRes: any = await getUserInfo()
    userStore.setUserInfo(userRes.data)

    ElMessage.success('登录成功')
    const redirect = route.query.redirect as string || '/dashboard'
    router.push(redirect)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f2f5;
}

.login-card {
  width: 400px;
  padding: 40px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.login-title {
  text-align: center;
  margin-bottom: 32px;
  font-size: 22px;
  color: #303133;
}

.login-btn {
  width: 100%;
}
</style>
```

---

## 第九步：验证布局

创建临时首页验证布局是否正常：

### src/views/dashboard/index.vue

```vue
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
```

**验证清单：**
- [ ] 登录页正常显示，样式整洁
- [ ] 用 PLATFORM_ADMIN 登录，跳转到首页，左侧显示：企业管理、充值管理
- [ ] 用 COMPANY_ADMIN 登录，跳转到首页，左侧显示：项目管理、员工管理、账户管理
- [ ] 左侧导航可折叠
- [ ] 顶部栏显示用户名，下拉有退出登录
- [ ] 面包屑显示当前页面路径
- [ ] 刷新页面不退出登录

**⏸ 验证全部通过后告诉我，再开始业务页面开发。**

---

## 第十步：业务页面开发规范

布局验证通过后，按以下顺序逐页开发，每页完成后验证再继续：

1. 企业管理列表页
2. 新增/编辑企业弹窗
3. 充值管理列表页
4. 项目管理列表页
5. 员工管理列表页
6. 账户余额页
7. 充值申请页
8. 资金流水页

每个列表页必须包含：搜索区、表格、分页，样式参照 `docs/ui-design-spec.md`。

---

## Git 提交规范

每完成一个步骤，执行一次提交：

```powershell
git add .
git commit -m "前端重建：完成[步骤名称]"
```

例如：
- `git commit -m "前端重建：完成Layout组件"`
- `git commit -m "前端重建：完成登录页面"`
- `git commit -m "前端重建：完成企业管理列表页"`

 

*文档版本：v2.0*
*替代：frontend-migration.md（v1.0，已废弃）*
*配套文档：ui-design-spec.md · technical-spec.md · troubleshooting-sop.md · after-fix-update-docs.md*
