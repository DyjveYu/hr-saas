# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a full-stack HR SaaS (Human Resource Management) payroll platform:

- **Backend**: NestJS-based API server
- **Frontend**: Vue 3 + Vite + Element Plus SPA

## Common Commands

### Backend

```bash
# Install dependencies
npm install

# Development
npm run start          # Run in production mode
npm run start:dev      # Run in watch mode (recommended for development)
npm run start:debug    # Run with debugging

# Build
npm run build          # Compile to dist/

# Linting
npm run lint           # Run ESLint with auto-fix

# Testing
npm run test           # Run unit tests
npm run test:watch     # Run tests in watch mode
npm run test:cov       # Run tests with coverage

# Database (Prisma)
npx prisma generate    # Generate Prisma client
npx prisma migrate dev  # Run migrations
npx prisma db push     # Push schema to database
npx prisma seed        # Run database seed
npx prisma studio      # Open Prisma Studio UI
```

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Development
npm run dev            # Start dev server (port 5173)

# Build
npm run build          # Build for production
npm run preview        # Preview production build

# Linting
npm run lint           # Run ESLint
```

## Architecture

### Backend (NestJS)

```
src/
├── app.module.ts           # Root module
├── main.ts                 # Application bootstrap
├── common/                 # Shared components
│   ├── prisma/             # Prisma service & module
│   ├── redis.module.ts     # Redis caching
│   ├── decorators/        # Custom decorators (currentUser, roles)
│   ├── guards/            # Auth & roles guards
│   ├── interceptors/      # Response, logging interceptors
│   ├── filters/          # HTTP exception filter
│   └── exceptions/        # Business exceptions
└── modules/                # Feature modules
    ├── auth/              # Authentication & JWT
    ├── user/              # User management
    ├── company/           # Company management
    ├── project/           # Project management
    ├── employee/          # Employee management
    ├── file/              # File upload
    ├── account/           # Company account balance
    ├── recharge/          # Recharge orders
    ├── transaction/       # Transaction records
    └── test/              # Test utilities
```

### Frontend (Vue 3)

```
frontend/
├── src/
│   ├── api/               # API requests
│   │   ├── request.ts     # Axios instance
│   │   ├── auth.ts        # Auth APIs
│   │   ├── company.ts     # Company APIs
│   │   ├── project.ts    # Project APIs
│   │   ├── employee.ts   # Employee APIs
│   │   ├── account.ts    # Account APIs
│   │   └── recharge.ts   # Recharge APIs
│   ├── components/         # Reusable components
│   ├── layout/             # Layout components
│   │   ├── index.vue       # Main layout
│   │   ├── Sidebar.vue     # Left navigation
│   │   ├── Header.vue      # Top header
│   │   └── AppMain.vue     # Content area
│   ├── router/             # Router config
│   │   ├── index.ts        # Routes & guards
│   │   └── menu.ts         # Menu config
│   ├── store/              # Pinia stores
│   │   └── user.ts         # User store
│   ├── styles/             # Global styles
│   │   └── global.css
│   ├── views/              # Page components
│   │   ├── login/          # Login page
│   │   ├── dashboard/      # Dashboard
│   │   ├── company/         # Company management
│   │   ├── recharge/       # Recharge management
│   │   ├── project/        # Project management
│   │   ├── employee/       # Employee management
│   │   └── account/        # Account management
│   ├── App.vue
│   └── main.ts
└── vite.config.ts
```

## Data Model (Prisma)

Key entities in `prisma/schema.prisma`:
- **User** - Authentication with roles (PLATFORM_ADMIN, COMPANY_ADMIN)
- **Company** - Business tenants
- **Project** - Projects under companies (with QR codes)
- **Employee** - Workers with status lifecycle (PENDING → ACTIVE → RESIGNED)
- **Account** - Company account balance
- **RechargeOrder** - Deposit requests
- **TransactionRecord** - Financial ledger
- **PayrollOrder/PayrollDetail** - Payroll processing

## API Design

- All APIs prefixed with `/api`
- Swagger docs available at `/api/docs`
- JWT Bearer authentication
- DTOs use class-validator for validation
- Global response interceptor wraps responses in `{ code, message, data }` format
- BigInt values serialized as strings (JSON compatibility)

## Configuration

Environment variables in `.env`:
- `DATABASE_URL` - MySQL connection
- `REDIS_HOST/PORT/PASSWORD` - Redis connection
- `JWT_SECRET` - JWT signing key
- `OSS_*` - Optional object storage config
- `PORT` - Server port (default 3000)
- `CORS_ORIGIN` - CORS allowed origins

## Key Patterns

1. **Service Layer**: Business logic in `*.service.ts` files
2. **DTOs**: Input validation in `dto/*.dto.ts` using class-validator
3. **Guards**: Role-based access control via `roles.guard.ts`
4. **Interceptors**: Global response wrapping and logging
5. **Prisma Transactions**: Use `prisma.$transaction` for atomic operations

## 开发环境说明

- 操作系统：Windows，PowerShell
- Git 认证：SSH 方式，本地 SSH key 已配置并添加到 GitHub
- 远端仓库：git@github.com:DyjveYu/hr-saas.git
- 推送时统一使用 SSH 地址，不使用 HTTPS，不需要 Token