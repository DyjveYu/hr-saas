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
