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
