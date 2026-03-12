# HR SaaS 发薪系统

企业级人力资源薪资管理平台。

## 技术栈

- **后端**: NestJS + Prisma + MySQL + Redis
- **前端**: Vue 3 + Vite + Pinia + Element Plus

## 项目结构

```
pro_HRM/
├── src/                    # NestJS 后端源码
│   ├── modules/            # 功能模块
│   ├── common/             # 公共组件
│   └── prisma/             # 数据库模型
├── frontend/               # Vue 3 前端
│   ├── src/
│   │   ├── api/            # API 接口
│   │   ├── components/     # 组件
│   │   ├── layout/         # 布局
│   │   ├── router/         # 路由
│   │   ├── store/          # 状态管理
│   │   └── views/          # 页面
│   └── vite.config.ts
├── prisma/                 # Prisma schema
└── docs/                   # 开发文档
```

## 快速开始

### 后端启动

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run start:dev
```

后端服务运行在 http://localhost:3000

### 前端启动

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

前端服务运行在 http://localhost:5173

## 功能模块

| 模块 | 说明 |
|------|------|
| 企业管理 | 平台管理员管理入驻企业 |
| 充值管理 | 平台管理员确认充值到账 |
| 项目管理 | 企业管理员管理施工项目 |
| 员工管理 | 企业管理员管理项目工人 |
| 账户管理 | 企业管理员查看余额、充值、流水 |

## 角色权限

- **PLATFORM_ADMIN**: 平台管理员 - 管理系统所有企业
- **COMPANY_ADMIN**: 企业管理员 - 管理本企业项目/员工/账户

## API 文档

启动后端后访问: http://localhost:3000/api/docs

## 开发文档

详细开发规范见 `docs/` 目录:

- `frontend-rebuild.md` - 前端重建指南
- `ui-design-spec.md` - UI 设计规范
- `troubleshooting-sop.md` - 问题排查手册
