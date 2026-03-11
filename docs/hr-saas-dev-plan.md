# 人力资源发薪 SaaS 平台 - 第一阶段开发计划

> 开发周期：第一阶段（不包含发薪模块和小程序端）
>
> 技术栈：Node.js + NestJS + Prisma + MySQL + Redis + Vue3 + Element Plus
>
> 技术方案版本：v3.0（ORM: Prisma，多租户: 显式传递，无充值审核流程）

---

## 执行规则（AI 必读）

1. **严格按任务编号顺序执行**，每个开发任务完成后，必须先通过对应的验证任务，再继续下一个任务
2. **每个任务开始前**，先列出本任务将新增/修改的文件清单，再开始写代码
3. **验证任务**以"操作步骤 + 期望结果"为准，所有期望结果全部符合，才算验证通过
4. **完成标志**：每个任务末尾标注"✅ 任务 X.X 完成"后，等待下一条指令，不自行跳到下一任务
5. **遇到歧义**：优先参考人力资源发薪SaaS平台完整技术方案V3.0,路径：docs\hr-saas-technical-spec.md，其次提问确认，不自行假设。
6. **数据库验证方式**：
   - Windows PowerShell 环境：编写临时 `prisma/verify.ts` 脚本使用 PrismaClient 查询，执行 `npx ts-node prisma/verify.ts`，验证完成后删除脚本
   - Linux 环境：可直接使用 `npx prisma db execute --schema=./prisma/schema.prisma --stdin <<< "SQL语句"`
   - 后续所有验证任务中涉及直接执行 SQL 查询的步骤，统一替换为"使用临时 verify.ts 脚本验证"的描述，并在每条验证步骤后注明 Windows/Linux 的对应方式
7. **Prisma 字段命名规则**：schema.prisma 中使用下划线命名（如 tenant_id），但 Prisma Client 在 TypeScript 代码中自动转换为驼峰命名（如 tenantId）。所有业务代码、脚本、测试中操作 Prisma 模型时，必须使用驼峰格式，不得使用下划线格式。
8. **Windows 下 prisma generate 报 EPERM 错误的处理方式**：这是 Windows 文件锁定问题，每次遇到时不要反复重试，立即停下来，用中文提示用户在 PowerShell 中手动执行以下三条命令后再继续：
   ```
   taskkill /IM node.exe /F
   Remove-Item "node_modules\.prisma\client\*.tmp*" -Force
   Remove-Item "node_modules\.prisma\client\query_engine-windows.dll.node" -Force
   ```
9. **前后端目录隔离**：后端 tsconfig.json 和 tsconfig.build.json 的 exclude 数组必须包含 "frontend"，防止后端编译器扫描前端代码导致类型错误。
10. **集成启动验证**：每个任务的验证步骤中，凡是涉及启动服务的，必须从项目根目录执行 npm run start:dev，不能分目录单独启动，确保后端编译器不会扫描到前端代码。
11. **列表接口 DTO 完整性要求**：所有列表查询接口的 DTO 必须包含完整的筛选参数，参照技术方案接口列表中的查询参数列定义。前端搜索框用到的每个参数，后端 DTO 中必须有对应字段，否则 `forbidNonWhitelisted: true` 会拦截请求返回 1001 错误。

---

## 任务总览

| 编号 | 任务名称 | 类型 |
|------|---------|------|
| 1.1 / 1.2 | 项目初始化和环境搭建 | 基础设施 |
| 2.1 / 2.2 | Prisma 数据建模 + 初始数据 | 基础设施 |
| 3.1 / 3.2 | 认证模块（JWT + 登录） | 基础设施 |
| 4.1 / 4.2 | 权限模块（RBAC） | 基础设施 |
| 5.1 / 5.2 | 多租户数据隔离 | 基础设施 |
| 6.1 / 6.2 | 用户账号模块 | 核心业务 |
| 7.1 / 7.2 | 企业管理模块 | 核心业务 |
| 8.1 / 8.2 | 项目管理模块 | 核心业务 |
| 9.1 / 9.2 | 员工管理模块 | 核心业务 |
| 10.1 / 10.2 | 文件模块（OSS） | 核心业务 |
| 11.1 / 11.2 | 账户与充值模块 | 核心业务 |
| 12.1 / 12.2 | 资金流水模块 | 核心业务 |
| 13.1 / 13.2 | 日志与错误处理 | 交付物 |
| 14.1 / 14.2 | Swagger 文档与接口收尾 | 交付物 |
| 15.1 / 15.2 | Web 端前端开发 | 交付物 |
| 16.1 / 16.2 | 部署与测试 | 交付物 |

---

## 阶段一：基础设施

---

### 任务 1.1 — 项目初始化和环境搭建

**本任务将创建/修改的文件：**
- `package.json`
- `src/main.ts`
- `src/app.module.ts`
- `prisma/schema.prisma`（空结构，下一任务完善）
- `.env` / `.env.example`
- `src/common/` 目录结构

**开发内容：**

1. 使用 NestJS CLI 初始化项目（`nest new`）
2. 安装依赖：
   ```
   @nestjs/config @nestjs/jwt @nestjs/passport
   passport passport-jwt
   prisma @prisma/client
   ioredis
   bcrypt @types/bcrypt
   class-validator class-transformer
   ```
3. 配置 `@nestjs/config`，读取 `.env` 文件
4. 配置 Prisma，初始化 `prisma/schema.prisma`（datasource + generator 部分）
5. 配置 Redis 连接（封装 `RedisModule`）
6. 设计项目目录结构：
   ```
   src/
   ├── modules/
   │   ├── auth/
   │   ├── user/
   │   ├── company/
   │   ├── project/
   │   ├── employee/
   │   ├── account/
   │   ├── recharge/
   │   ├── transaction/
   │   └── file/
   ├── common/
   │   ├── decorators/
   │   ├── guards/
   │   ├── filters/
   │   ├── interceptors/
   │   └── prisma/
   └── main.ts
   ```
7. 配置 `.env.example`（包含所有必需变量，值为占位符）：
   ```
   DATABASE_URL=mysql://hr_saas_db:4ra6WWKBYXqdf1oy@mysql6.sqlpub.com:3311/hr_saas
   REDIS_HOST=101.43.66.156
   REDIS_PORT=6379
   REDIS_PASSWORD=Mj2018xj
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRES_IN=1h
   JWT_REFRESH_EXPIRES_IN=7d
   CORS_ORIGIN=http://localhost:5173
   OSS_ACCESS_KEY=
   OSS_SECRET_KEY=
   OSS_BUCKET=
   OSS_REGION=
   OSS_ENDPOINT=
   ```
8. **配置 CORS**：在 `main.ts` 中添加跨域配置（必须放在 `app.listen()` 之前）：
   ```typescript
   app.enableCors({
     origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
     methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
     allowedHeaders: ['Content-Type', 'Authorization'],
     credentials: true,
   });
   ```

---

### 任务 1.2 — 验证：项目初始化和环境搭建

| # | 操作 | 期望结果 |
|---|------|---------|
| 1 | 运行 `npm run start:dev` | 控制台无报错，显示 NestJS 启动成功，端口监听正常 |
| 2 | 检查 MySQL 连接 | 控制台输出 Prisma 连接成功（无 `Can't connect` 错误） |
| 3 | 检查 Redis 连接 | RedisModule 初始化日志无报错 |
| 4 | 检查目录结构 | `src/modules/` 下各模块目录存在 |
| 5 | 检查环境变量 | `.env.example` 包含全部必需变量，`.env` 不提交到 Git（已写入 `.gitignore`） |
| 6 | 用浏览器访问前端页面，打开开发者工具 Network 面板，确认 OPTIONS 预检请求返回 200，无 CORS 报错 | OPTIONS 请求返回 200，Response Headers 包含 `Access-Control-Allow-Origin` |

**✅ 完成标志：** 以上 6 项全部通过，等待下一条指令。

---

### 任务 2.1 — Prisma 数据建模 + 初始数据

**本任务将创建/修改的文件：**
- `prisma/schema.prisma`（完整版）
- `prisma/migrations/`（自动生成）
- `prisma/seed.ts`

**开发内容：**

1. 在 `schema.prisma` 中定义以下枚举：
   - `Role`: `PLATFORM_ADMIN`, `COMPANY_ADMIN`
   - `UserStatus`: `ACTIVE`, `DISABLED`
   - `CompanyStatus`: `ACTIVE`, `INACTIVE`
   - `ProjectStatus`: `ACTIVE`, `INACTIVE`
   - `EmployeeStatus`: `PENDING`, `ACTIVE`, `PENDING_EXIT`, `RESIGNED`, `FIRED`, `DISMISSED`
   - `AccountStatus`: `ACTIVE`, `FROZEN`
   - `RechargeStatus`: `PENDING`, `COMPLETED`
   - `TransactionType`: `RECHARGE`, `PAYROLL`, `REFUND`
   - `TransactionDirection`: `IN`, `OUT`

2. 定义以下模型（字段严格对照技术方案 v3.0 第五章）：
   - `User`（含 tenant_id 可为 null，登录密码、支付密码独立字段）
   - `Company`（不含 tenant_id）
   - `Project`（含 capacity、site_manager、finance_manager 等字段）
   - `Employee`（含 emergency_contact、emergency_phone）
   - `Account`（一公司一条，balance 为 Decimal）
   - `RechargeOrder`（status: PENDING/COMPLETED，无审核字段）
   - `TransactionRecord`（含 direction、reference_id、operator_id）
   - `PayrollLimitConfig`（发薪限额配置，第一阶段建表备用）

3. 配置必要索引（参照技术方案 5.3～5.7 的索引说明）

4. 执行 `npx prisma migrate dev --name init`

5. 编写 `prisma/seed.ts`：
   - 创建默认平台管理员账号
   - username: `admin`，密码: `Admin@123456`（bcrypt 加密后存储）
   - role: `PLATFORM_ADMIN`，tenant_id: null

6. 执行 `npx prisma db seed`

---

### 任务 2.2 — 验证：Prisma 数据建模 + 初始数据

| # | 操作 | 期望结果 | 验证方式 |
|---|------|---------|---------|
| 1 | 查看数据库，检查表列表 | 以下表全部存在：`users`, `companies`, `projects`, `employees`, `accounts`, `recharge_orders`, `transaction_records`, `payroll_limit_configs` | 使用临时 verify.ts 脚本验证：执行 `SHOW TABLES` 查询表列表 / Linux: `npx prisma db execute --schema=./prisma/schema.prisma --stdin <<< "SHOW TABLES;"` |
| 2 | 运行 `npx prisma generate` | 无报错，Prisma Client 生成成功 | 命令行直接验证 |
| 3 | 检查 `users` 表中初始数据 | 存在一条 username=`admin`、role=`PLATFORM_ADMIN` 的记录，password 字段为 bcrypt hash（非明文） | 使用临时 verify.ts 脚本验证：查询 users 表 / Linux: `npx prisma db execute --schema=./prisma/schema.prisma --stdin <<< "SELECT ..."` |
| 4 | 检查 `Account` 模型的 balance 字段类型 | 数据库中类型为 `DECIMAL`，非 `FLOAT` 或 `DOUBLE` | 使用临时 verify.ts 脚本验证：执行 `SHOW COLUMNS FROM accounts WHERE Field = 'balance'` / Linux: 同上 |
| 5 | 检查 `employees` 表 | 存在 `emergency_contact`、`emergency_phone` 字段 | 使用临时 verify.ts 脚本验证：执行 `SHOW COLUMNS FROM employees` / Linux: 同上 |
| 6 | 检查 `projects` 表 | 存在 `capacity`、`site_manager`、`finance_manager` 字段 | 使用临时 verify.ts 脚本验证：执行 `SHOW COLUMNS FROM projects` / Linux: 同上 |

**✅ 完成标志：** 以上 6 项全部通过，等待下一条指令。

---

### 任务 3.1 — 认证模块开发

**本任务将创建/修改的文件：**
- `src/modules/auth/auth.module.ts`
- `src/modules/auth/auth.service.ts`
- `src/modules/auth/auth.controller.ts`
- `src/modules/auth/strategies/jwt.strategy.ts`
- `src/modules/auth/dto/login.dto.ts`
- `src/common/decorators/current-user.decorator.ts`

**开发内容：**

1. **登录接口** `POST /api/auth/login`
   - 接收 `username` + `password`
   - 查询 user，校验账号是否存在
   - 检查 `locked_until`，若在锁定期内返回错误码 1006
   - bcrypt 比对密码
   - 失败：`login_fail_count + 1`；达到 5 次则设置 `locked_until = NOW() + 15分钟`，返回错误码 1006
   - 成功：重置 `login_fail_count = 0`，更新 `last_login_at`
   - 签发 `access_token`（有效期 1h，payload 含 `userId`、`tenantId`、`role`）
   - 签发 `refresh_token`（有效期 7d），存入 Redis，Key: `refresh:{userId}`
   - 返回两个 token

2. **登出接口** `POST /api/auth/logout`
   - 从 Header 提取 `access_token`
   - 将 token 加入 Redis 黑名单，Key: `blacklist:{jti}`，TTL = token 剩余有效期
   - 删除 Redis 中 `refresh:{userId}`

3. **刷新 Token 接口** `POST /api/auth/refresh`
   - 接收 `refresh_token`
   - 校验 Redis 中是否存在该 token
   - 有效则签发新 `access_token`，返回

4. **JWT Strategy**
   - 验证 `access_token` 有效性
   - 检查 token 是否在黑名单中（Redis 查询）
   - 将 payload（userId、tenantId、role）挂载到 `req.user`

5. **CurrentUser 装饰器**
   - `@CurrentUser()` 从 `req.user` 提取当前登录用户信息

---

### 任务 3.2 — 验证：认证模块

| # | 操作 | 期望结果 |
|---|------|---------|
| 1 | 用正确的 admin 账号密码调用 `POST /api/auth/login` | 返回 `{ code: 0, data: { access_token, refresh_token } }` |
| 2 | 用错误密码连续调用 5 次登录 | 第 5 次返回错误码 1006，提示账号已锁定 |
| 3 | 锁定后用正确密码登录 | 仍返回错误码 1006（锁定期内不允许登录） |
| 4 | 用有效 `access_token` 调用任意受保护接口 | 正常返回（不返回 401） |
| 5 | 调用 `POST /api/auth/logout` | 返回 `{ code: 0 }`；再用同一 token 访问受保护接口返回 401 |
| 6 | 用有效 `refresh_token` 调用 `POST /api/auth/refresh` | 返回新的 `access_token` |
| 7 | 用过期或伪造的 `access_token` 访问受保护接口 | 返回错误码 1004 |

**✅ 完成标志：** 以上 7 项全部通过，等待下一条指令。

---

### 任务 4.1 — 权限模块开发（RBAC）

**本任务将创建/修改的文件：**
- `src/common/decorators/roles.decorator.ts`
- `src/common/guards/roles.guard.ts`
- `src/common/guards/auth.guard.ts`

**开发内容：**

1. `@Roles(...roles)` 自定义装饰器，标记接口所需角色
2. `AuthGuard`：验证 JWT 有效性（调用 JWT Strategy）
3. `RolesGuard`：从 `req.user.role` 读取当前角色，与 `@Roles` 注解匹配；不匹配则返回错误码 1003
4. 组合使用方式：`@UseGuards(AuthGuard, RolesGuard)` + `@Roles('PLATFORM_ADMIN')`
5. 实现以下权限矩阵（参考技术方案 7.2）：

   | 功能 | PLATFORM_ADMIN | COMPANY_ADMIN |
   |------|:--------------:|:-------------:|
   | 公司管理 | ✅ | ❌ |
   | 账号管理 | ✅ | ✅（仅本企业） |
   | 项目管理 | ❌ | ✅ |
   | 员工管理 | ❌ | ✅ |
   | 充值申请 | ❌ | ✅ |
   | 发薪限额配置 | ✅ | ✅ |

---

### 任务 4.2 — 验证：权限模块

| # | 操作 | 期望结果 |
|---|------|---------|
| 1 | 用 `PLATFORM_ADMIN` token 访问公司管理接口 | 正常返回（不返回 403） |
| 2 | 用 `COMPANY_ADMIN` token 访问公司管理接口 | 返回错误码 1003 |
| 3 | 用 `COMPANY_ADMIN` token 访问项目管理接口 | 正常返回 |
| 4 | 用 `PLATFORM_ADMIN` token 访问项目管理接口 | 返回错误码 1003 |
| 5 | 未携带 token 访问任意受保护接口 | 返回错误码 1004 |

**✅ 完成标志：** 以上 5 项全部通过，等待下一条指令。

---

### 任务 5.1 — 多租户数据隔离

**本任务将创建/修改的文件：**
- `src/common/prisma/prisma.service.ts`
- `src/common/prisma/prisma.module.ts`

**开发内容：**

1. 封装 `PrismaService`（继承 `PrismaClient`，实现 `OnModuleInit`）
2. 实现 `PrismaService.forTenant(tenantId: number)` 扩展方法：
   - 使用 Prisma Client Extensions
   - 对 `findMany`、`findFirst`、`create`、`update`、`delete` 自动附加 `WHERE tenant_id = tenantId`
   - 不影响 `company` 表查询（company 表不含 tenant_id）
3. `PrismaModule` 设为全局模块（`@Global()`），在 `AppModule` 中导入一次即可全局使用
4. 在 Controller 中通过 `@CurrentUser()` 获取 `tenantId`，传递给 Service
5. Service 层统一使用显式传参方式，示例：
   ```typescript
   async findAll(tenantId: number) {
     return this.prisma.project.findMany({
       where: { tenant_id: tenantId },
     });
   }
   ```

---

### 任务 5.2 — 验证：多租户数据隔离

| # | 操作 | 期望结果 |
|---|------|---------|
| 1 | 用企业 A 的管理员 token 创建一个项目 | 项目 `tenant_id` 字段值等于企业 A 的 `company.id` |
| 2 | 用企业 B 的管理员 token 查询项目列表 | 返回列表中不含企业 A 的项目 |
| 3 | 用企业 B 的 token 直接请求企业 A 某个项目的详情接口 | 返回错误码 1002（资源不存在）或 1003（权限不足），不返回企业 A 的数据 |
| 4 | `PLATFORM_ADMIN`（tenant_id 为 null）查询公司列表 | 正常返回所有公司，不受 tenant_id 过滤影响 |

**✅ 完成标志：** 以上 4 项全部通过，等待下一条指令。

---

## 阶段二：核心业务模块

---

### 任务 6.1 — 用户账号模块

**本任务将创建/修改的文件：**
- `src/modules/user/user.module.ts`
- `src/modules/user/user.service.ts`
- `src/modules/user/user.controller.ts`
- `src/modules/user/dto/`

**开发内容：**

1. **账号列表** `GET /api/users`（PLATFORM_ADMIN 查所有，COMPANY_ADMIN 查本企业）
2. **创建账号** `POST /api/users`
   - 参数：username、password、role、real_name、phone、tenant_id（仅 PLATFORM_ADMIN 可指定）
   - 密码 bcrypt 加密（salt rounds = 10）
   - username 唯一校验，重复返回错误码 2010
3. **修改账号** `PATCH /api/users/:id`（real_name、phone）
4. **删除账号** `DELETE /api/users/:id`（软删除，设置 status = DISABLED）
5. **修改登录密码** `PATCH /api/users/:id/password`（需验证旧密码）
6. **设置/修改支付密码** `PATCH /api/users/:id/payment-password`（仅 COMPANY_ADMIN 账号有效）
7. **账号启停** `PATCH /api/users/:id/status`
8. **权限范围**：
   - PLATFORM_ADMIN：可操作所有账号
   - COMPANY_ADMIN：只能操作本企业（同 tenant_id）账号

---

### 任务 6.2 — 验证：用户账号模块

| # | 操作 | 期望结果 |
|---|------|---------|
| 1 | `POST /api/users` 创建企业管理员账号 | 返回新账号信息，password 字段不在响应中返回 |
| 2 | 用重复 username 再次创建 | 返回错误码 2010 |
| 3 | `PATCH /api/users/:id/password` 传入错误旧密码 | 返回失败提示，密码未变更 |
| 4 | `PATCH /api/users/:id/status` 设置为 DISABLED | 该账号调用登录接口返回错误码 1007 |
| 5 | COMPANY_ADMIN 尝试操作其他企业的账号 | 返回错误码 1003 或 1002 |
| 6 | `PATCH /api/users/:id/payment-password` 设置支付密码 | 返回成功；数据库中 payment_password 为 bcrypt hash（非明文） |

**✅ 完成标志：** 以上 6 项全部通过，等待下一条指令。

---

### 任务 7.1 — 企业管理模块

**本任务将创建/修改的文件：**
- `src/modules/company/company.module.ts`
- `src/modules/company/company.service.ts`
- `src/modules/company/company.controller.ts`
- `src/modules/company/dto/`

**开发内容：**

1. **公司列表** `GET /api/companies`（分页，仅 PLATFORM_ADMIN）
2. **创建公司** `POST /api/companies`（仅 PLATFORM_ADMIN）
   - 创建 company 记录
   - 同时自动创建对应 account 记录（balance = 0，status = ACTIVE）
3. **公司详情** `GET /api/companies/:id`（含联系人信息）
4. **编辑公司** `PATCH /api/companies/:id`（联系人信息等）
5. **启停公司** `PATCH /api/companies/:id/status`（PLATFORM_ADMIN）
6. **查看公司内部数据** `GET /api/companies/:id/overview`
   - 返回：项目数量、账户余额、最近充值流水（最近 5 条）

---

### 任务 7.2 — 验证：企业管理模块

| # | 操作 | 期望结果 |
|---|------|---------|
| 1 | `POST /api/companies` 创建公司 | 返回公司信息；数据库 `accounts` 表同时新增一条该公司的账户记录，balance = 0 |
| 2 | `GET /api/companies`（分页） | 返回 `{ list, total, page, pageSize }` 格式 |
| 3 | `PATCH /api/companies/:id/status` 设为 INACTIVE | 该公司管理员登录后调用任意业务接口，返回错误码 2009 |
| 4 | COMPANY_ADMIN 访问 `GET /api/companies` | 返回错误码 1003 |
| 5 | `GET /api/companies/:id/overview` | 返回项目数量、账户余额、最近充值流水字段 |

**✅ 完成标志：** 以上 5 项全部通过，等待下一条指令。

---

### 任务 8.1 — 项目管理模块

**本任务将创建/修改的文件：**
- `src/modules/project/project.module.ts`
- `src/modules/project/project.service.ts`
- `src/modules/project/project.controller.ts`
- `src/modules/project/dto/`

**开发内容：**

1. **项目列表** `GET /api/projects`（分页、支持按名称筛选，COMPANY_ADMIN 仅查本企业）
2. **创建项目** `POST /api/projects`
   - 字段：name、capacity、site_manager、site_manager_phone、finance_manager、finance_manager_phone
   - 自动生成 `qr_code_token`（UUID）
   - `qr_code_url` 暂为空（等文件模块完成后补充二维码图片生成）
3. **项目详情** `GET /api/projects/:id`
4. **编辑项目** `PATCH /api/projects/:id`
5. **项目启停** `PATCH /api/projects/:id/status`
6. **删除项目** `DELETE /api/projects/:id`（软删除）

---

### 任务 8.2 — 验证：项目管理模块

| # | 操作 | 期望结果 |
|---|------|---------|
| 1 | `POST /api/projects` 创建项目 | 返回项目信息，`tenant_id` = 当前登录企业 ID，`qr_code_token` 为非空 UUID |
| 2 | `GET /api/projects`（分页） | 返回 `{ list, total, page, pageSize }` 格式，只含本企业项目 |
| 3 | `PATCH /api/projects/:id/status` 设为 INACTIVE | 返回成功；`GET /api/projects/:id` 返回 status = INACTIVE |
| 4 | PLATFORM_ADMIN 访问 `GET /api/projects` | 返回错误码 1003 |
| 5 | 企业 B 的管理员请求企业 A 的项目详情 | 返回错误码 1002 |

**✅ 完成标志：** 以上 5 项全部通过，等待下一条指令。

---

### 任务 9.1 — 员工管理模块

**本任务将创建/修改的文件：**
- `src/modules/employee/employee.module.ts`
- `src/modules/employee/employee.service.ts`
- `src/modules/employee/employee.controller.ts`
- `src/modules/employee/dto/`

**开发内容：**

1. **员工列表** `GET /api/employees`（分页，支持按姓名/项目/状态筛选）
2. **创建员工** `POST /api/employees`
   - 字段：name、id_card、phone、project_id（可为空）、emergency_contact、emergency_phone
   - 同一企业内 id_card 唯一校验
   - 默认 status = PENDING
3. **员工详情** `GET /api/employees/:id`
4. **编辑员工** `PATCH /api/employees/:id`
5. **删除员工** `DELETE /api/employees/:id`（软删除，status = DISMISSED）
6. **变更员工状态** `PATCH /api/employees/:id/status`
   - 允许的状态流转：
     - PENDING → ACTIVE（分配项目上岗）
     - ACTIVE → PENDING_EXIT（申请离职）
     - PENDING_EXIT → RESIGNED（完成离职）
     - ACTIVE / PENDING_EXIT → FIRED（辞退）
     - ACTIVE → DISMISSED（开除）
   - 不符合流转规则的状态变更返回参数错误
7. **分配项目** `PATCH /api/employees/:id/project`（指定 project_id）

---

### 任务 9.2 — 验证：员工管理模块

| # | 操作 | 期望结果 |
|---|------|---------|
| 1 | `POST /api/employees` 创建员工 | 返回员工信息，status = PENDING，tenant_id = 当前企业 |
| 2 | 用相同 id_card 再次创建员工 | 返回参数错误（同一企业身份证唯一） |
| 3 | `PATCH /api/employees/:id/status` 将 PENDING 改为 RESIGNED | 返回错误（不符合状态流转规则） |
| 4 | `PATCH /api/employees/:id/status` 将 PENDING 改为 ACTIVE | 返回成功 |
| 5 | 分页查询，按 status=ACTIVE 筛选 | 只返回 status 为 ACTIVE 的员工 |
| 6 | 企业 B 管理员访问企业 A 的员工详情 | 返回错误码 1002 |

**✅ 完成标志：** 以上 6 项全部通过，等待下一条指令。

---

### 任务 10.1 — 文件模块（OSS）

**本任务将创建/修改的文件：**
- `src/modules/file/file.module.ts`
- `src/modules/file/file.service.ts`
- `src/modules/file/file.controller.ts`

**开发内容：**

1. **获取上传凭证** `POST /api/files/presign`
   - 接收：`fileType`（id_card_front / id_card_back / voucher / qrcode）、`bizId`（关联业务 ID）
   - 返回：预签名 PUT URL（有效期 10 分钟）、文件 Key
   - 文件 Key 命名规范：`/{env}/{fileType}/{tenant_id}/{bizId}/{timestamp}.{ext}`

2. **获取私有文件访问 URL** `GET /api/files/signed-url`
   - 接收：`fileKey`
   - 校验当前用户是否有权限访问该文件（身份证照片只有本企业管理员可访问）
   - 返回：带签名的临时访问 URL（有效期 5 分钟）
   - 记录访问日志（文件 key、访问人、访问时间）

3. **项目二维码生成**
   - 完善任务 8.1 中遗留的 `qr_code_url`
   - 创建项目时，使用 `qr_code_token` 生成二维码图片，上传至 OSS，将 URL 写回 `project.qr_code_url`

> **注意**：若 OSS 环境未配置，文件模块可在本地模式下运行（返回模拟 URL），不阻塞其他模块开发。

---

### 任务 10.2 — 验证：文件模块

| # | 操作 | 期望结果 |
|---|------|---------|
| 1 | `POST /api/files/presign`（fileType = id_card_front） | 返回预签名 URL 和 fileKey，URL 包含有效的 OSS 签名参数 |
| 2 | 用返回的预签名 URL 直接 PUT 一张图片 | OSS 接收成功（HTTP 200） |
| 3 | `GET /api/files/signed-url?fileKey=xxx` | 返回带签名的临时访问 URL；用该 URL 可直接在浏览器访问图片 |
| 4 | 企业 B 管理员请求企业 A 员工的身份证照片 signed-url | 返回权限错误 |
| 5 | 创建一个新项目后检查 `qr_code_url` 字段 | 字段非空，值为 OSS 上的图片地址 |

**✅ 完成标志：** 以上 5 项全部通过，等待下一条指令。

---

### 任务 11.1 — 账户与充值模块

**本任务将创建/修改的文件：**
- `src/modules/account/account.module.ts`
- `src/modules/account/account.service.ts`
- `src/modules/account/account.controller.ts`
- `src/modules/recharge/recharge.module.ts`
- `src/modules/recharge/recharge.service.ts`
- `src/modules/recharge/recharge.controller.ts`
- `src/modules/recharge/dto/`

**开发内容：**

**账户部分：**
1. **账户余额查询** `GET /api/account/balance`（COMPANY_ADMIN 查本企业）
2. **账户状态管理** `PATCH /api/account/status`（PLATFORM_ADMIN 可冻结/解冻）

**充值部分：**
3. **创建充值申请** `POST /api/recharge-orders`（COMPANY_ADMIN）
   - 字段：amount、transfer_voucher_url（OSS 文件 Key）、remark
   - 生成唯一 order_no（格式：`RC{yyyyMMdd}{8位随机数}`）
   - 校验：同一企业已有 PENDING 状态的申请时，不允许重复提交
   - 默认 status = PENDING

4. **平台管理员确认充值到账** `PATCH /api/recharge-orders/:id/complete`（PLATFORM_ADMIN）
   - 将 recharge_order.status 改为 COMPLETED
   - 在事务中：`account.balance += amount`
   - 写入 transaction_record（type=RECHARGE, direction=IN）

5. **充值记录列表** `GET /api/recharge-orders`（分页）
   - COMPANY_ADMIN：只查本企业记录
   - PLATFORM_ADMIN：可查所有，支持按 tenant_id 筛选

---

### 任务 11.2 — 验证：账户与充值模块

| # | 操作 | 期望结果 |
|---|------|---------|
| 1 | `GET /api/account/balance` | 返回 `{ balance: "0.00", status: "ACTIVE" }` |
| 2 | `POST /api/recharge-orders` 提交充值申请（amount=10000） | 返回充值单信息，status=PENDING，order_no 符合格式 |
| 3 | 同一企业再次提交充值申请（已有 PENDING 记录） | 返回错误（重复提交） |
| 4 | PLATFORM_ADMIN 调用 `PATCH /api/recharge-orders/:id/complete` | 返回成功；再查余额返回 `balance: "10000.00"`；`transaction_records` 表新增一条 type=RECHARGE、direction=IN 的记录 |
| 5 | `PATCH /api/account/status` 冻结账户后，查询余额 | 返回 `status: "FROZEN"` |
| 6 | COMPANY_ADMIN 访问其他企业的充值记录 | 返回错误码 1003 或 1002 |

**✅ 完成标志：** 以上 6 项全部通过，等待下一条指令。

---

### 任务 12.1 — 资金流水模块

**本任务将创建/修改的文件：**
- `src/modules/transaction/transaction.module.ts`
- `src/modules/transaction/transaction.service.ts`
- `src/modules/transaction/transaction.controller.ts`

**开发内容：**

1. **资金流水列表** `GET /api/transactions`（分页）
   - COMPANY_ADMIN：只查本企业
   - PLATFORM_ADMIN：可查所有，支持按 tenant_id 筛选
   - 支持筛选参数：type（RECHARGE / PAYROLL / REFUND）、direction（IN / OUT）、时间范围
   - 返回字段：id、type、direction、amount、before_balance、after_balance、reference_no、operator_id、remark、created_at

2. **流水详情** `GET /api/transactions/:id`

> 注意：transaction_record 的写入由 account.service 和（第二阶段）payroll.service 负责，此模块只做查询。

---

### 任务 12.2 — 验证：资金流水模块

| # | 操作 | 期望结果 |
|---|------|---------|
| 1 | 完成一笔充值到账后，查询 `GET /api/transactions` | 返回包含该充值流水记录，before_balance 和 after_balance 准确 |
| 2 | 按 `type=RECHARGE` 筛选 | 只返回充值类型的流水 |
| 3 | 按时间范围筛选 | 只返回该时间段内的流水 |
| 4 | `GET /api/transactions/:id` 查看单条详情 | 返回完整字段，含 before_balance、after_balance |
| 5 | COMPANY_ADMIN 查询其他企业的流水 | 返回错误码 1003 或 1002 |

**✅ 完成标志：** 以上 5 项全部通过，等待下一条指令。

---

## 阶段三：交付物

---

### 任务 13.1 — 日志与错误处理

**本任务将创建/修改的文件：**
- `src/common/filters/http-exception.filter.ts`
- `src/common/interceptors/response.interceptor.ts`
- `src/common/interceptors/logging.interceptor.ts`
- `src/common/exceptions/business.exception.ts`

**开发内容：**

1. **统一响应格式拦截器**（ResponseInterceptor）
   - 成功：`{ code: 0, message: "success", data: ... }`
   - 所有 Controller 返回值自动包装

2. **全局异常过滤器**（HttpExceptionFilter）
   - 捕获所有异常，统一返回 `{ code, message, data: null }`
   - 业务异常（BusinessException）：返回自定义 code + message
   - 系统异常：返回错误码 1000，不暴露堆栈信息给客户端
   - 生产环境 ERROR 级别日志记录堆栈

3. **BusinessException 类**
   - `new BusinessException(2001, '账户余额不足')`
   - 对应技术方案第 13 章全部错误码

4. **操作日志记录**
   - 对以下操作记录 INFO 日志（含操作人 ID、时间、关键参数）：
     - 用户登录 / 登出
     - 公司创建 / 启停
     - 账号创建 / 禁用 / 密码修改
     - 充值申请创建 / 充值确认到账

---

### 任务 13.2 — 验证：日志与错误处理

| # | 操作 | 期望结果 |
|---|------|---------|
| 1 | 调用任意成功接口 | 响应格式为 `{ code: 0, message: "success", data: ... }` |
| 2 | 调用不存在的接口路径 | 返回 `{ code: 1000, message: "...", data: null }`，不暴露堆栈 |
| 3 | 触发余额不足场景 | 返回 `{ code: 2001, message: "账户余额不足", data: null }` |
| 4 | 执行登录操作 | 控制台输出 INFO 日志，含操作人 ID 和时间 |
| 5 | 执行充值确认到账操作 | 控制台输出 INFO 日志，含金额和操作人 ID |

**✅ 完成标志：** 以上 5 项全部通过，等待下一条指令。

---

### 任务 14.1 — Swagger 文档与接口收尾

**本任务将创建/修改的文件：**
- `src/main.ts`（Swagger 配置）
- 各模块 DTO 补充 `@ApiProperty` 装饰器
- 各 Controller 补充 `@ApiTags`、`@ApiOperation`、`@ApiBearerAuth` 装饰器

**开发内容：**

1. 集成 `@nestjs/swagger`，配置 Swagger UI（路径：`/api/docs`）
2. 所有接口补充：
   - `@ApiTags`（模块分组）
   - `@ApiOperation`（接口说明）
   - `@ApiBearerAuth`（标注需要 JWT）
   - `@ApiResponse`（标注常见响应码）
3. 所有 DTO 补充 `@ApiProperty` 装饰器（含字段说明、示例值）
4. 全局补充分页参数 DTO（page、pageSize）的 class-validator 校验

---

### 任务 14.2 — 验证：Swagger 文档与接口收尾

| # | 操作 | 期望结果 |
|---|------|---------|
| 1 | 访问 `http://localhost:3000/api/docs` | Swagger UI 正常展示，包含所有模块分组 |
| 2 | 在 Swagger UI 中测试登录接口 | 能正常获取 token 并在后续接口中使用 |
| 3 | 检查所有接口是否有 `@ApiOperation` 说明 | 无缺失 |
| 4 | 传入非法分页参数（pageSize=-1） | 返回 class-validator 校验错误，错误码 1001 |

**✅ 完成标志：** 以上 4 项全部通过，等待下一条指令。

---

### 任务 15.1 — Web 端前端开发

**本任务将创建独立前端项目，目录：`frontend/`**

**开发内容：**

1. Vue3 + Vite 项目初始化，集成 Element Plus、Pinia、Vue Router
2. 配置 Axios 请求拦截器（自动携带 token，处理 401 自动跳转登录）
3. 路由权限控制（根据角色展示不同菜单）

**平台管理端页面（PLATFORM_ADMIN 可见）：**
- 登录页面
- 企业列表页（分页、搜索、启停操作）
- 创建企业页（含创建企业管理员账号）
- 企业详情页（含内部数据统计）
- 充值管理页（查看充值申请列表、确认到账操作）

**企业管理端页面（COMPANY_ADMIN 可见）：**
- 登录页面（与平台管理端共用）
- 项目管理页（列表、创建、编辑、启停）
- 员工管理页（列表、创建、状态变更、详情）
- 账户管理页（余额展示、充值申请、充值记录）
- 资金流水页（流水列表、筛选）

---

### 任务 15.2 — 验证：Web 端前端

| # | 操作 | 期望结果 |
|---|------|---------|
| 1 | 在项目根目录执行 npm run start:dev，确认启动无报错 | 编译成功（Found 0 errors），服务启动在 3000 端口 |
| 2 | PLATFORM_ADMIN 登录 | 成功跳转平台管理端首页，菜单显示企业管理、充值管理 |
| 3 | COMPANY_ADMIN 登录 | 成功跳转企业管理端首页，菜单显示项目、员工、账户 |
| 4 | COMPANY_ADMIN 直接访问企业管理路由 | 前端路由守卫拦截，跳转至无权限提示页 |
| 5 | 创建一个企业（完整表单） | 提交成功，企业列表刷新，新企业出现在列表中 |
| 6 | 企业管理员提交充值申请 | 充值记录页出现 PENDING 状态的记录 |
| 7 | 平台管理员确认充值到账 | 充值记录状态变为 COMPLETED；企业账户余额刷新后增加 |
| 8 | Token 过期后访问任意页面 | 自动跳转登录页，提示登录已过期 |

**✅ 完成标志：** 以上 8 项全部通过，等待下一条指令。

---

### 任务 16.1 — 部署与测试

**开发内容：**

1. 编写 `Dockerfile`（后端）和 `docker-compose.yml`（含 MySQL、Redis、NestJS 后端、Nginx）
2. 编写 `nginx.conf`：
   - 前端静态文件服务
   - `/api/` 反向代理至后端
   - HTTPS 配置（SSL 证书路径占位）
3. 生产环境 `.env.production` 模板
4. 核心模块单元测试：
   - AuthService（登录、锁定逻辑）
   - AccountService（余额更新事务）
5. 集成测试（e2e）：
   - 完整充值流程（申请 → 到账 → 余额变更 → 流水记录）
   - 多租户隔离（企业 A 数据不泄露给企业 B）
6. 日志自动化配置：
   - 安装 winston，配置 NestJS 日志同时输出到控制台和 `logs/app.log`，ERROR 级别单独输出到 `logs/error.log`
   - 日志格式：时间、级别、模块、请求方法、请求路径、错误码、错误信息
   - `logs/` 目录加入 `.gitignore`
   - `package.json` 添加脚本 `"watch-errors": "tail -f logs/error.log"`
7. 测试期错误分析流程：
   - 前端测试触发报错后，对 Claude Code 说"分析最新错误"
   - Claude Code 自动读取 `logs/error.log` 最新内容
   - 完成分析修复后，按照 `docs/after-fix-update-docs.md` 的步骤要求更新相关文档
   - 检查全项目是否存在同类问题，有则一并修复

---

### 任务 16.2 — 验证：部署与测试

| # | 操作 | 期望结果 |
|---|------|---------|
| 1 | `docker-compose up` | 所有容器启动成功，无报错 |
| 2 | 访问 `https://域名/` | 前端页面正常加载，HTTPS 证书有效 |
| 3 | 访问 `https://域名/api/docs` | Swagger UI 正常 |
| 4 | 运行单元测试 `npm run test` | 全部通过，无失败用例 |
| 5 | 运行集成测试 `npm run test:e2e` | 充值流程、多租户隔离测试全部通过 |
| 6 | 触发一个接口报错，确认 `logs/error.log` 中出现对应的错误记录，格式正确 | 错误日志包含时间、级别、模块、请求方法、请求路径、错误码、错误信息 |

**✅ 完成标志：** 以上 6 项全部通过，第一阶段开发完成。

---

## 执行顺序

```
任务 1.1 → 1.2
任务 2.1 → 2.2
任务 3.1 → 3.2
任务 4.1 → 4.2
任务 5.1 → 5.2
任务 6.1 → 6.2
任务 7.1 → 7.2
任务 8.1 → 8.2
任务 9.1 → 9.2
任务 10.1 → 10.2
任务 11.1 → 11.2
任务 12.1 → 12.2
任务 13.1 → 13.2
任务 14.1 → 14.2
任务 15.1 → 15.2
任务 16.1 → 16.2
```

---

*计划版本：v2.0 | 对应技术方案：v3.0*
