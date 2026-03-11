# 前端迁移指南
# 迁移目标：vue-element-plus-admin 框架

> 执行前提：阅读完本文件后再开始执行，不得跳步。
> 每个步骤完成后让用户确认，用户确认后再继续下一步。
> 完成后按照 `docs/after-fix-update-docs.md` 更新相关文档。

---

## 项目目录说明

```
pro_HRM/                    ← 项目根目录
├── src/                    ← 后端 NestJS 代码，完全不动
├── frontend/               ← 前端独立目录
│   ├── src/                ← 前端 Vue 源码，迁移工作在此进行
│   │   ├── api/            ← 保留不动
│   │   ├── stores/         ← 保留不动
│   │   ├── views/          ← 保留不动（业务页面）
│   │   ├── router/         ← 需要适配新框架格式
│   │   └── ...
│   ├── package.json
│   └── vite.config.ts
└── ...
```

---

## 迁移策略

**只换布局壳子，保留所有业务代码。**

| 内容 | 操作 | 说明 |
|------|------|------|
| 后端 `src/` | ❌ 完全不动 | 与前端迁移无关 |
| `frontend/src/api/` | ❌ 完全不动 | 接口调用代码保留 |
| `frontend/src/stores/` | ❌ 完全不动 | 状态管理代码保留 |
| `frontend/src/views/` | ✅ 样式规范调整 | 业务逻辑不动，只调整样式 |
| `frontend/src/layout/` | ✅ 替换 | 用框架 Layout 组件替换 |
| `frontend/src/styles/` | ✅ 替换 | 用框架基础样式替换 |
| `frontend/src/router/` | ✅ 适配 | 路由格式适配新框架 |
| 登录页面 | ✅ 替换 | 替换为框架风格登录页 |

---

## 第一步：引入框架布局组件

**操作内容：**

从 `https://github.com/kailong321200875/vue-element-plus-admin` 复制以下内容：
- `src/layout/` → 复制到 `frontend/src/layout/`
- `src/styles/` → 复制到 `frontend/src/styles/`

安装框架所需的额外依赖包（根据框架 package.json 中有但本项目没有的依赖安装）。

**验证方式：**
- `frontend/src/layout/` 目录存在且包含框架的布局组件文件
- `npm install` 无报错
- `npm run dev` 启动无报错

**⏸ 暂停，让用户确认目录结构，确认后继续第二步。**

---

## 第二步：适配路由

**操作内容：**

将 `frontend/src/router/` 中的现有路由配置适配到框架的路由格式：

1. 保留所有现有路由路径和对应的 views 组件，不删除任何业务路由
2. 将路由挂载到框架 Layout 组件的内容区（children 路由）
3. 确保以下路由逻辑正常：
   - 未登录访问任意页面 → 跳转登录页
   - PLATFORM_ADMIN 登录 → 显示平台管理端菜单（企业管理、充值管理）
   - COMPANY_ADMIN 登录 → 显示企业管理端菜单（项目管理、员工管理、账户管理）
   - 无权限路由 → 跳转 403 页面或首页

**验证方式：**
- 用 PLATFORM_ADMIN 账号登录，左侧菜单显示企业管理、充值管理
- 用 COMPANY_ADMIN 账号登录，左侧菜单显示项目管理、员工管理、账户管理
- 未登录访问 `/` 自动跳转到登录页

**⏸ 暂停，让用户确认登录后的整体布局效果，确认后继续第三步。**

---

## 第三步：业务页面样式规范化

按照 `docs/ui-design-spec.md` 规范，逐页调整样式。

**每完成一个页面让用户确认，确认后再继续下一个页面。**

页面顺序：
1. 企业列表页
2. 新增/编辑企业弹窗
3. 企业详情页
4. 充值管理页
5. 项目列表页
6. 新增/编辑项目弹窗
7. 员工列表页
8. 新增/编辑员工弹窗
9. 账户管理页
10. 资金流水页

**每个页面的调整要求：**
- 搜索区：左对齐，使用 `el-card` 包裹，`shadow="never"`
- 表格：开启斑马纹（`stripe`）和边框（`border`），操作列 `fixed="right"`
- 分页：右对齐，显示总条数
- 状态标签：统一使用 `el-tag`，对照 `ui-design-spec.md` 第八章配色
- 新增按钮：右上角，`type="primary"`
- 删除操作：二次确认弹窗

---

## 第四步：修复已知问题

**4.1 数据库乱码问题**

检查并修复 MySQL 字符集：
- 确认数据库字符集为 `utf8mb4`
- Prisma 连接串添加字符集参数：
  ```
  DATABASE_URL="mysql://user:password@host:port/dbname?charset=utf8mb4"
  ```
- 如已有乱码数据，需要修复存量数据

**4.2 分页显示英文问题**

在 `frontend/src/main.ts` 中配置 Element Plus 中文语言包：
```typescript
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
app.use(ElementPlus, { locale: zhCn })
```

**4.3 表格操作列被截断问题**

所有列表页表格的操作列统一设置：
```vue
<el-table-column label="操作" fixed="right" width="150">
```

**验证方式：**
- 页面中所有中文内容正常显示，无乱码（◆◆◆）
- 分页器显示中文（共 X 条、条/页、前往）
- 所有表格操作列完整显示，不被截断

**⏸ 暂停，让用户确认，确认后继续第五步。**

---

## 第五步：更新文档

迁移全部完成后，更新以下文档：

**1. `docs/ui-design-spec.md`**
在文档顶部补充：
> 本项目前端基于 vue-element-plus-admin 框架（https://github.com/kailong321200875/vue-element-plus-admin）
> Layout 组件路径：`frontend/src/layout/`
> 基础样式路径：`frontend/src/styles/`

**2. `docs/technical-spec.md`**
前端技术栈章节补充 vue-element-plus-admin 框架说明。

**3. `docs/project-startup-checklist.md`**
在第二章"技术方案类"补充检查项：
> - [ ] 前端必须基于 vue-element-plus-admin 的 Layout 组件实现主布局，禁止从零搭建，布局组件路径为 `frontend/src/layout/`【开发计划】

**4. 按照 `docs/after-fix-update-docs.md` 的格式**
在 `project-startup-checklist.md` 第六章问题记录表中新增：

| 问题 | 原因 | 解决方案 | 应在哪个环节预防 |
|------|------|---------|----------------|
| 前端布局不稳定，反复出现空白和截断问题 | 从零搭建布局，没有使用成熟框架 | 强制使用 vue-element-plus-admin Layout 组件 | 开发计划阶段二 UI 确认 |

---

## 完成标志

以下全部通过，迁移完成：

- [ ] 登录页面使用框架风格
- [ ] 整体布局：左侧导航通顶，顶部栏在右侧
- [ ] 左侧导航可折叠
- [ ] PLATFORM_ADMIN 和 COMPANY_ADMIN 显示各自对应的菜单
- [ ] 所有业务页面样式符合 ui-design-spec.md 规范
- [ ] 表格操作列完整显示，不被截断
- [ ] 分页器显示中文
- [ ] 页面中无乱码数据
- [ ] 文档已更新

---

*文件版本：v1.0*
*配套文档：ui-design-spec.md · technical-spec.md · project-startup-checklist.md · after-fix-update-docs.md*
