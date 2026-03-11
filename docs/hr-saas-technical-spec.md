# 人力资源发薪 SaaS 平台完整技术方案

**技术栈：Node.js + NestJS + MySQL + Redis + 微信小程序**

**文档版本：v3.0**（ORM 切换为 Prisma，多租户实现方案重构，权限矩阵修正）

---

## 开发阶段划分

> ⚠️ 本项目分为两个阶段开发：
>
> **第一阶段（当前）**：登录权限、企业管理、项目管理、员工管理、账户管理（充值）
> - 不包含发薪模块
> - 不包含小程序端
>
> **第二阶段**：发薪引擎模块、微信小程序端

---

## 需求描述

开发一套人力资源发薪 SaaS 平台，主要用户角色是：服务商（平台管理员）、特约商户（企业）、员工（企业的发薪对象）。

主要功能是服务商运营该平台；平台管理员添加维护企业信息和企业管理员信息后，企业通过平台进行项目管理、员工管理、企业自身账户管理、发薪操作；员工完成签约企业后，可通过平台发薪功能获得薪资。

**具体功能列表：**

- **企业管理**：公司列表、创建公司和公司管理员、启停公司、查看公司详情和公司联系人、查看公司内部数据（项目、账户余额、充值流水、发薪流水）。角色权限：平台管理员。
- **企业基本信息**：公司账号管理（账号的增删改查和权限配置，包括登录密码和支付密码维护、启停管理）。角色权限：平台管理员、企业管理员。
- **项目管理**：项目的增删改查；项目包括项目名称、人数上限、驻厂负责人、财务负责人、项目二维码（用于员工注册及资料填报签约）；项目启停。角色权限：企业管理员。
- **员工管理**：员工的增删改查；员工信息包括姓名、身份证号、手机号、录入时间、所属项目、状态（待上岗、在职、离职待支付、离职、辞退、开除）、紧急联系人、紧急联系人电话、身份证照片正反面。
- **账户管理**：账户余额查询、充值申请、充值记录查询。
- **发薪操作**：项目发薪（选择项目、选择员工、设置金额）提交发薪、发薪预览、发薪验证（支付密码输入）；发薪流水；发薪日志（发薪列表、时间、操作人）；发薪限额配置（单笔总金额、单笔单人金额）；发薪服务对接（微信微工卡，MVP 不做）。

---

# 一、项目定位

## 1.1 平台角色

| 角色 | 说明 |
|------|------|
| 服务商（平台管理员） | 负责运营平台，管理企业 |
| 企业管理员 | 管理企业内部项目、员工、发薪 |
| 员工 | 通过微信小程序签约项目并接收薪资 |

---

# 二、总体架构设计

采用：

> ✅ 模块化单体架构（Modular Monolith）
> ✅ 单数据库 + 逻辑多租户隔离（tenant_id）
> ✅ 公有云部署（腾讯云 / 阿里云）
> ✅ 微信小程序作为员工端

---

## 2.1 系统架构图（逻辑结构）

```
客户端层
├─ 平台管理端（Web）
├─ 企业管理端（Web）
└─ 员工端（微信小程序）

后端 API 层（NestJS）
├─ 认证模块（AuthModule）
├─ 用户账号模块（UserModule）
├─ 租户 / 企业模块（CompanyModule）
├─ 项目模块（ProjectModule）
├─ 员工模块（EmployeeModule）
├─ 账户 / 资金模块（AccountModule）
├─ 充值模块（RechargeModule）
├─ 发薪引擎模块（PayrollModule）【第二阶段】
└─ 审计日志模块（AuditModule）

基础设施层
├─ MySQL 8
├─ Redis
├─ 对象存储（腾讯云 COS / 阿里云 OSS）
└─ Nginx
```

---

# 三、技术栈说明

## 3.1 后端

| 技术 | 版本 | 说明 |
|------|------|------|
| Node.js | 20+ | 运行环境 |
| NestJS | 10+ | 主框架，模块化、DI、装饰器完善 |
| Prisma | 5+ | ORM，类型安全、迁移工具成熟 |
| MySQL | 8.0 | 主数据库，金融事务支持好 |
| Redis | 7+ | 缓存 + Token 黑名单 |
| JWT | — | 登录认证（access_token + refresh_token） |
| bcrypt | — | 密码加密（登录密码、支付密码） |
| class-validator | — | 参数校验 |
| AsyncLocalStorage | Node 内置 | 请求上下文传递（用于 tenant_id 注入） |

> ✅ **选用 Prisma 的理由：**
> - **类型安全**：Prisma Client 根据 schema 自动生成完整 TypeScript 类型，IDE 自动补全覆盖所有查询
> - **迁移工具成熟**：`prisma migrate` 自动生成 SQL 迁移文件，版本可追溯，适合有资金流水的生产系统
> - **Schema 即文档**：`schema.prisma` 集中定义所有表结构，比 TypeORM 装饰器分散在各 Entity 文件更易维护
> - **与 NestJS 集成良好**：通过 `PrismaService` 封装注入，使用方式与 NestJS DI 体系完全兼容

---

## 3.2 前端

### Web 端（平台 + 企业）

- Vue 3 + Vite
- Element Plus
- **框架**：基于 vue-element-plus-admin（https://github.com/kailong321200875/vue-element-plus-admin）
  - Layout 组件路径：`frontend/src/layout/`
  - 基础样式路径：`frontend/src/styles/`

### 员工端

- 微信小程序原生开发

---

# 四、多租户设计（逻辑隔离）

采用：

> 单数据库 + tenant_id 字段隔离

---

## 4.1 设计原则

所有核心业务表必须包含 `tenant_id BIGINT NOT NULL`。

所有查询必须自动附加 `WHERE tenant_id = 当前企业ID`。

---

## 4.2 tenant_id 设计说明

> ⚠️ tenant_id = company_id（公司 ID）

| 表名 | tenant_id 说明 |
|------|----------------|
| company | **不需要** tenant_id（自身即为租户，是 tenant_id 的来源） |
| user | **需要** tenant_id（企业账号属于某个公司；平台管理员 tenant_id 为 NULL 或 0） |
| project | **需要** tenant_id，关联所属公司 |
| employee | **需要** tenant_id（员工属于公司，可暂时不属于某个项目） |
| account | **需要** tenant_id（企业账户，一个公司一个账户） |
| recharge_order | **需要** tenant_id（充值申请单） |
| transaction_record | **需要** tenant_id（资金流水） |
| payroll_limit_config | **需要** tenant_id（发薪限额配置） |
| payroll_order | **需要** tenant_id（发薪记录） |
| payroll_detail | **不需要**，从 payroll_order 关联 |

**注意：** employee 表保留 tenant_id，是因为员工可能暂时不属于任何项目，但仍属于公司员工。

---

## 4.3 实现方式

**放弃 TypeORM Subscriber 全局注入方案，改用 Prisma 显式传参方案。**

> ⚠️ **为什么不用全局自动注入：**
> TypeORM Subscriber 的全局 `beforeInsert` 钩子依赖 `AsyncLocalStorage` 隐式传递 tenant_id，在异步链路中容易丢失上下文（如嵌套事务、异步回调、队列消费），且对开发者不透明，出现多租户数据串漏时排查困难。
> Prisma 没有等价的全局 Subscriber 机制，也不推荐用 Prisma Middleware 做这件事（同样有隐式风险）。
> **金融类系统的多租户隔离，显式优于隐式，安全性更高，可审计性更强。**

### 推荐方案：Service 层显式传递 tenant_id

tenant_id 从 JWT 解析后挂载到 Request 对象，Controller 提取后显式传给 Service，Service 在每次 Prisma 查询中明确带入 `where: { tenant_id }` 条件。

```typescript
// 1. JWT 解析后挂载到 req.user（在 AuthGuard 中完成）
// req.user = { userId: 1, tenantId: 5, role: 'COMPANY_ADMIN' }

// 2. Controller 提取当前租户
@Get('/projects')
@UseGuards(AuthGuard, RolesGuard)
@Roles('COMPANY_ADMIN')
async getProjects(@CurrentUser() user: JwtPayload) {
  return this.projectService.findAll(user.tenantId);
}

// 3. Service 显式带入 tenant_id
@Injectable()
export class ProjectService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: number) {
    return this.prisma.project.findMany({
      where: { tenant_id: tenantId },  // 显式，不依赖任何隐式注入
    });
  }

  async create(tenantId: number, dto: CreateProjectDto) {
    return this.prisma.project.create({
      data: { ...dto, tenant_id: tenantId },
    });
  }
}
```

### 防护兜底：PrismaService 封装租户查询工具方法

为避免开发者遗忘 tenant_id，在 `PrismaService` 中封装带租户约束的工厂方法，作为第二道防线：

```typescript
// prisma.service.ts
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }

  // 返回预绑定 tenant_id 的 Prisma 扩展实例（可选使用）
  forTenant(tenantId: number) {
    return this.$extends({
      query: {
        $allModels: {
          async findMany({ args, query }) {
            args.where = { ...args.where, tenant_id: tenantId };
            return query(args);
          },
          async findFirst({ args, query }) {
            args.where = { ...args.where, tenant_id: tenantId };
            return query(args);
          },
          async create({ args, query }) {
            args.data = { ...args.data as object, tenant_id: tenantId };
            return query(args);
          },
        },
      },
    });
  }
}
```

使用方式：

```typescript
// Service 中使用 forTenant 扩展，自动附加 tenant_id
async findAll(tenantId: number) {
  const tenantPrisma = this.prisma.forTenant(tenantId);
  return tenantPrisma.project.findMany(); // 自动附加 WHERE tenant_id = ?
}
```

> **两种方式可混用：**
> - 简单 CRUD：推荐直接在 `where` 中显式写 tenant_id，最直观
> - 复杂 Service：可使用 `forTenant()` 减少重复，但需确保每个请求创建新实例，不跨请求复用

---

# 五、数据库设计（完整数据字典）

## 5.1 用户账号表（user）

> 存储所有可登录用户，包括平台管理员和企业管理员。

| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT PK AUTO_INCREMENT | 主键 |
| tenant_id | BIGINT NULL | 所属公司 ID；平台管理员为 NULL |
| username | VARCHAR(64) NOT NULL UNIQUE | 登录账号 |
| password | VARCHAR(128) NOT NULL | 登录密码（bcrypt 加密） |
| payment_password | VARCHAR(128) NULL | 支付密码（bcrypt 加密，仅企业管理员有） |
| role | ENUM('PLATFORM_ADMIN','COMPANY_ADMIN') | 角色 |
| real_name | VARCHAR(32) | 真实姓名 |
| phone | VARCHAR(20) | 手机号 |
| status | ENUM('ACTIVE','DISABLED') DEFAULT 'ACTIVE' | 账号状态 |
| last_login_at | DATETIME NULL | 最后登录时间 |
| login_fail_count | INT DEFAULT 0 | 连续登录失败次数 |
| locked_until | DATETIME NULL | 账号锁定截止时间 |
| created_at | DATETIME DEFAULT NOW() | 创建时间 |
| updated_at | DATETIME ON UPDATE NOW() | 更新时间 |

> **说明：**
> - 登录密码和支付密码均存储在此表，独立字段，独立 bcrypt 加密。
> - 平台管理员 tenant_id 为 NULL，查询时需特殊处理。
> - payment_password 仅企业管理员（COMPANY_ADMIN）使用，用于发薪确认。

---

## 5.2 公司表（company）

> 自身即为租户，不含 tenant_id 字段。

| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT PK AUTO_INCREMENT | 主键（即 tenant_id） |
| name | VARCHAR(128) NOT NULL | 公司名称 |
| short_name | VARCHAR(64) | 公司简称 |
| status | ENUM('ACTIVE','INACTIVE') DEFAULT 'ACTIVE' | 启用/停用 |
| contact_name | VARCHAR(32) | 主要联系人姓名 |
| contact_phone | VARCHAR(20) | 主要联系人电话 |
| contact_email | VARCHAR(128) | 主要联系人邮箱 |
| address | VARCHAR(256) | 公司地址 |
| created_by | BIGINT | 创建人（平台管理员 user.id） |
| created_at | DATETIME DEFAULT NOW() | 创建时间 |
| updated_at | DATETIME ON UPDATE NOW() | 更新时间 |

---

## 5.3 项目表（project）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT PK AUTO_INCREMENT | 主键 |
| tenant_id | BIGINT NOT NULL | 所属公司 ID |
| name | VARCHAR(128) NOT NULL | 项目名称 |
| capacity | INT NULL | 项目人数上限 |
| site_manager | VARCHAR(32) | 驻厂负责人姓名 |
| site_manager_phone | VARCHAR(20) | 驻厂负责人电话 |
| finance_manager | VARCHAR(32) | 财务负责人姓名 |
| finance_manager_phone | VARCHAR(20) | 财务负责人电话 |
| status | ENUM('ACTIVE','INACTIVE') DEFAULT 'ACTIVE' | 项目状态 |
| qr_code_url | VARCHAR(512) NULL | 项目二维码图片 OSS 地址 |
| qr_code_token | VARCHAR(128) NULL | 二维码关联 Token（用于员工扫码识别项目） |
| created_by | BIGINT | 创建人 user.id |
| created_at | DATETIME DEFAULT NOW() | 创建时间 |
| updated_at | DATETIME ON UPDATE NOW() | 更新时间 |

> **索引：** `INDEX idx_tenant (tenant_id)`

---

## 5.4 员工表（employee）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT PK AUTO_INCREMENT | 主键 |
| tenant_id | BIGINT NOT NULL | 所属公司 ID |
| project_id | BIGINT NULL | 所属项目（可为空，表示待分配） |
| name | VARCHAR(32) NOT NULL | 姓名 |
| id_card | VARCHAR(18) NOT NULL | 身份证号（建议加密存储） |
| phone | VARCHAR(20) NOT NULL | 手机号 |
| status | ENUM('PENDING','ACTIVE','PENDING_EXIT','RESIGNED','FIRED','DISMISSED') DEFAULT 'PENDING' | 员工状态 |
| emergency_contact | VARCHAR(32) | 紧急联系人姓名 |
| emergency_phone | VARCHAR(20) | 紧急联系人电话 |
| id_card_front_url | VARCHAR(512) NULL | 身份证正面 OSS 地址 |
| id_card_back_url | VARCHAR(512) NULL | 身份证背面 OSS 地址 |
| openid | VARCHAR(128) NULL | 微信 openid（第二阶段使用） |
| remark | VARCHAR(256) NULL | 备注 |
| created_by | BIGINT | 录入人 user.id |
| created_at | DATETIME DEFAULT NOW() | 录入时间 |
| updated_at | DATETIME ON UPDATE NOW() | 更新时间 |

> **索引：**
> - `INDEX idx_tenant (tenant_id)`
> - `INDEX idx_tenant_project (tenant_id, project_id)`
> - `UNIQUE idx_tenant_idcard (tenant_id, id_card)`（同一公司内身份证唯一）

---

## 5.5 企业账户表（account）

> 每个公司对应一条账户记录，在创建公司时自动创建。

| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT PK AUTO_INCREMENT | 主键 |
| tenant_id | BIGINT NOT NULL UNIQUE | 所属公司 ID（唯一，一公司一账户） |
| balance | DECIMAL(15,2) DEFAULT 0.00 | 当前余额（单位：元） |
| status | ENUM('ACTIVE','FROZEN') DEFAULT 'ACTIVE' | 账户状态 |
| created_at | DATETIME DEFAULT NOW() | 创建时间 |
| updated_at | DATETIME ON UPDATE NOW() | 更新时间 |

> **说明：**
> - 余额字段使用 `DECIMAL(15,2)` 而非 `FLOAT`，避免浮点精度问题。
> - 余额更新必须在事务中进行，配合乐观锁或行锁防止并发问题。

---

## 5.6 充值申请单（recharge_order）

> 企业发起充值申请，MVP 阶段采用线下转账模式，无需平台审核，由平台管理员在后台直接操作到账。

| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT PK AUTO_INCREMENT | 主键 |
| tenant_id | BIGINT NOT NULL | 所属公司 ID |
| order_no | VARCHAR(64) NOT NULL UNIQUE | 充值单号（业务唯一编号） |
| amount | DECIMAL(15,2) NOT NULL | 申请充值金额 |
| status | ENUM('PENDING','COMPLETED') DEFAULT 'PENDING' | 状态：待到账 / 已到账 |
| transfer_voucher_url | VARCHAR(512) NULL | 转账凭证截图 OSS 地址 |
| remark | VARCHAR(256) NULL | 申请备注 |
| created_by | BIGINT | 申请人 user.id |
| created_at | DATETIME DEFAULT NOW() | 申请时间 |
| updated_at | DATETIME ON UPDATE NOW() | 更新时间 |

> **充值流程说明：**
> 1. 企业管理员在平台提交充值申请，填写金额并上传转账凭证
> 2. 平台管理员在后台直接确认到账，系统自动为该企业账户增加余额
> 3. 同时写入 transaction_record 流水记录

---

## 5.7 资金流水表（transaction_record）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT PK AUTO_INCREMENT | 主键 |
| tenant_id | BIGINT NOT NULL | 所属公司 ID |
| type | ENUM('RECHARGE','PAYROLL','REFUND') NOT NULL | 交易类型 |
| amount | DECIMAL(15,2) NOT NULL | 交易金额（正数） |
| direction | ENUM('IN','OUT') NOT NULL | 资金方向：IN 入账，OUT 出账 |
| before_balance | DECIMAL(15,2) NOT NULL | 操作前余额 |
| after_balance | DECIMAL(15,2) NOT NULL | 操作后余额 |
| reference_id | BIGINT NULL | 关联业务单 ID（recharge_order.id 或 payroll_order.id） |
| reference_no | VARCHAR(64) NULL | 关联业务单号 |
| operator_id | BIGINT NULL | 操作人 user.id |
| remark | VARCHAR(256) NULL | 备注说明 |
| created_at | DATETIME DEFAULT NOW() | 记录时间 |

> **索引：**
> - `INDEX idx_tenant_type (tenant_id, type)`
> - `INDEX idx_tenant_created (tenant_id, created_at)`

---

## 5.8 发薪限额配置表（payroll_limit_config）

> 每个公司独立维护发薪限额，由平台管理员或企业管理员配置。

| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT PK AUTO_INCREMENT | 主键 |
| tenant_id | BIGINT NOT NULL UNIQUE | 所属公司 ID（一公司一条配置） |
| max_total_amount | DECIMAL(15,2) NOT NULL | 单笔发薪总金额上限 |
| max_per_person_amount | DECIMAL(15,2) NOT NULL | 单笔单人金额上限 |
| updated_by | BIGINT | 最后修改人 user.id |
| created_at | DATETIME DEFAULT NOW() | 创建时间 |
| updated_at | DATETIME ON UPDATE NOW() | 更新时间 |

---

## 5.9 发薪单表（payroll_order）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT PK AUTO_INCREMENT | 主键 |
| tenant_id | BIGINT NOT NULL | 所属公司 ID |
| order_no | VARCHAR(64) NOT NULL UNIQUE | 发薪单号（业务唯一编号） |
| project_id | BIGINT NOT NULL | 所属项目 |
| total_amount | DECIMAL(15,2) NOT NULL | 本次发薪总金额 |
| employee_count | INT NOT NULL | 发薪人数 |
| status | ENUM('DRAFT','PENDING_VERIFY','PROCESSING','PAID','FAILED','PARTIAL') DEFAULT 'DRAFT' | 发薪单状态 |
| idempotency_key | VARCHAR(128) NOT NULL UNIQUE | 幂等键（防重复提交） |
| operator_id | BIGINT NOT NULL | 操作人 user.id |
| verified_at | DATETIME NULL | 支付密码验证通过时间 |
| completed_at | DATETIME NULL | 完成时间 |
| remark | VARCHAR(256) NULL | 备注 |
| created_at | DATETIME DEFAULT NOW() | 创建时间 |
| updated_at | DATETIME ON UPDATE NOW() | 更新时间 |

> **索引：**
> - `INDEX idx_tenant_status (tenant_id, status)`
> - `INDEX idx_tenant_created (tenant_id, created_at)`

---

## 5.10 发薪明细表（payroll_detail）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT PK AUTO_INCREMENT | 主键 |
| payroll_order_id | BIGINT NOT NULL | 所属发薪单 ID |
| employee_id | BIGINT NOT NULL | 员工 ID |
| amount | DECIMAL(15,2) NOT NULL | 本次发薪金额 |
| status | ENUM('PENDING','SUCCESS','FAILED') DEFAULT 'PENDING' | 明细状态 |
| fail_reason | VARCHAR(256) NULL | 失败原因 |
| created_at | DATETIME DEFAULT NOW() | 创建时间 |
| updated_at | DATETIME ON UPDATE NOW() | 更新时间 |

> **索引：** `INDEX idx_order (payroll_order_id)`

---

# 六、枚举常量定义

## 6.1 员工状态（employee.status）

| 值 | 说明 |
|----|------|
| PENDING | 待上岗（新录入，还未分配项目） |
| ACTIVE | 在职（正常在岗） |
| PENDING_EXIT | 离职待支付（已提交离职，等待最后一笔薪资发放） |
| RESIGNED | 离职 |
| FIRED | 辞退 |
| DISMISSED | 开除 |

## 6.2 项目状态（project.status）

| 值 | 说明 |
|----|------|
| ACTIVE | 启用 |
| INACTIVE | 停用 |

## 6.3 公司状态（company.status）

| 值 | 说明 |
|----|------|
| ACTIVE | 启用 |
| INACTIVE | 停用 |

## 6.4 用户账号状态（user.status）

| 值 | 说明 |
|----|------|
| ACTIVE | 正常 |
| DISABLED | 禁用 |

## 6.5 账户状态（account.status）

| 值 | 说明 |
|----|------|
| ACTIVE | 正常 |
| FROZEN | 冻结 |

## 6.6 充值单状态（recharge_order.status）

| 值 | 说明 |
|----|------|
| PENDING | 待到账 |
| COMPLETED | 已到账 |

## 6.7 交易类型（transaction_record.type）

| 值 | 说明 |
|----|------|
| RECHARGE | 充值 |
| PAYROLL | 发薪 |
| REFUND | 退款 |

## 6.8 发薪单状态（payroll_order.status）

| 值 | 说明 |
|----|------|
| DRAFT | 草稿（已创建，未验证） |
| PENDING_VERIFY | 待验证（等待支付密码确认） |
| PROCESSING | 处理中（验证通过，执行中） |
| PAID | 已完成（全部成功） |
| FAILED | 失败（全部失败） |
| PARTIAL | 部分成功 |

---

# 七、权限模型设计（RBAC）

## 7.1 角色定义

| 角色 | 说明 |
|------|------|
| PLATFORM_ADMIN | 平台管理员，管理企业，审核充值 |
| COMPANY_ADMIN | 企业管理员，管理本企业的项目、员工、发薪 |

## 7.2 权限矩阵

| 功能模块 | PLATFORM_ADMIN | COMPANY_ADMIN |
|----------|:--------------:|:-------------:|
| 公司列表 / 创建 / 启停 | ✅ | ❌ |
| 查看公司内部数据 | ✅ | ✅（仅本企业） |
| 账号管理（增删改查） | ✅ | ✅（仅本企业） |
| 项目管理 | ❌ | ✅ |
| 员工管理 | ❌ | ✅ |
| 充值申请 | ❌ | ✅ |
| 发薪操作 | ❌ | ✅ |
| 发薪限额配置 | ✅ | ✅ |

## 7.3 NestJS 实现方式

```typescript
// 使用自定义装饰器 + Guard
@Roles('COMPANY_ADMIN')
@UseGuards(AuthGuard, RolesGuard)
@Get('/projects')
async getProjects() { ... }
```

```typescript
// roles.guard.ts
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!requiredRoles) return true;
    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some(role => user.role === role);
  }
}
```

---

# 八、认证与安全设计

## 8.1 登录流程

1. 用户提交 `username` + `password`
2. 查询 user 表，验证账号是否存在
3. 检查登录失败次数，若超过 5 次且在锁定期内，返回锁定错误
4. bcrypt 比对密码
5. 比对失败：`login_fail_count + 1`，若达到 5 次则设置 `locked_until = NOW() + 15分钟`
6. 比对成功：重置 `login_fail_count = 0`，签发 JWT
7. 将 refresh_token 存入 Redis（Key: `refresh:{userId}`，TTL: 7天）

## 8.2 Token 设计

| Token 类型 | 有效期 | 存储位置 |
|-----------|--------|---------|
| access_token | 1 小时 | 客户端（HTTP Header） |
| refresh_token | 7 天 | Redis（服务端） |

**登出操作：**
- 将 access_token 加入 Redis 黑名单（Key: `blacklist:{jti}`，TTL 与 token 剩余时间一致）
- 删除 Redis 中该用户的 refresh_token

## 8.3 密码安全

- 登录密码：bcrypt 加密，salt rounds = 10
- 支付密码：bcrypt 加密，salt rounds = 10，与登录密码独立字段
- 支付密码验证失败：不返回具体原因，统一返回"密码错误"（防暴力破解）
- 支付密码错误达到 5 次后，锁定账户 30 分钟

## 8.4 API 安全

- API 限流：每个 IP 每分钟最多 60 次请求（使用 Redis 计数器实现）
- 所有涉及资金操作的接口，额外验证 Content-Type 和请求来源
- CORS 配置：后端必须配置跨域资源共享，允许前端域名访问。开发环境允许 http://localhost:5173，生产环境配置为实际前端域名。NestJS 在 main.ts 中通过 app.enableCors() 配置，需放在 app.listen() 之前。

---

# 九、文件存储设计（OSS）

## 9.1 存储选型

推荐使用腾讯云 COS 或阿里云 OSS，与云服务器同平台，网络传输费用最低。

## 9.2 上传策略

采用**前端直传 + 后端签名**方式：

1. 前端请求后端获取预签名 URL（有效期 10 分钟）
2. 前端直接将文件上传至 OSS（不经过后端服务器，减少带宽占用）
3. 上传完成后，前端将 OSS 返回的文件 Key 传给后端保存

## 9.3 访问控制

> ⚠️ 身份证照片属于高度敏感个人信息，**不能使用公开 URL**。

- Bucket 设置为**私有读写**
- 前端展示时，后端根据请求权限动态生成带签名的临时访问 URL（有效期 5 分钟）
- 记录每次敏感文件的访问日志

## 9.4 文件目录规范

```
/{env}/
  /id-cards/{tenant_id}/{employee_id}/front.jpg
  /id-cards/{tenant_id}/{employee_id}/back.jpg
  /vouchers/{tenant_id}/{recharge_order_id}/voucher.jpg
  /qrcodes/{tenant_id}/{project_id}/qrcode.png
```

---

# 十、发薪引擎模块设计（第二阶段）

## 10.1 发薪流程状态机

```
DRAFT
  ↓（提交发薪）
PENDING_VERIFY
  ↓（输入支付密码验证通过）
PROCESSING
  ↓
PAID（全部成功）/ FAILED（全部失败）/ PARTIAL（部分成功）
```

## 10.2 发薪核心逻辑

```
BEGIN TRANSACTION

1. 校验支付密码（bcrypt 比对）
2. 校验发薪限额（单笔总额 <= max_total_amount，单人金额 <= max_per_person_amount）
3. 校验账户状态（ACTIVE）
4. 校验账户余额（balance >= total_amount）
5. 幂等校验（idempotency_key 是否已存在）

6. 更新发薪单状态为 PROCESSING
7. 插入发薪明细（每个员工一条）
8. 扣减企业余额（UPDATE account SET balance = balance - total_amount WHERE tenant_id = ? AND balance >= total_amount）
9. 写入资金流水（transaction_record）
10. 更新发薪单状态为 PAID / FAILED / PARTIAL

COMMIT
```

## 10.3 幂等控制

- 前端提交发薪时生成唯一 idempotency_key（UUID）
- 后端校验 payroll_order 表中 idempotency_key 是否已存在
- 若已存在，直接返回原发薪单结果，不重复执行

---

# 十一、微信小程序设计（第二阶段）

## 11.1 功能

- 微信登录（wx.login + openid 绑定）
- 扫码加入项目（扫描项目二维码）
- 填写并提交个人信息（身份信息签约）
- 查看发薪记录

## 11.2 微信登录流程

1. 小程序调用 `wx.login()` 获取 code
2. 后端用 code 调用微信接口获取 openid
3. 查询 employee 表是否有匹配 openid
4. 已绑定：直接签发 JWT
5. 未绑定：引导用户填写手机号或身份证号完成绑定

---

# 十二、API 设计规范

## 12.1 RESTful 规范

| 方法 | 用途 | 示例 |
|------|------|------|
| GET | 查询 | GET /api/companies |
| POST | 创建 | POST /api/companies |
| PATCH | 部分更新 | PATCH /api/companies/:id |
| DELETE | 软删除 | DELETE /api/companies/:id |

## 12.2 响应格式

```json
// 成功
{
  "code": 0,
  "message": "success",
  "data": {}
}

// 失败
{
  "code": 1001,
  "message": "参数错误：username 不能为空",
  "data": null
}
```

## 12.3 分页格式

```json
{
  "list": [],
  "total": 100,
  "page": 1,
  "pageSize": 20
}
```

## 12.4 验证管道配置

NestJS 全局验证管道配置直接影响前后端集成，配置如下：

```typescript
// main.ts
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,        // 自动剥离非 DTO 定义的属性
    transform: true,        // 自动将请求数据转换为 DTO 类型
    forbidNonWhitelisted: true, // 如果请求包含 DTO 未定义的属性，抛出验证错误
  }),
);
```

### 配置影响说明

| 配置项 | 值 | 影响 |
|--------|-----|------|
| whitelist | true | DTO 中未定义的属性会被自动剥离 |
| forbidNonWhitelisted | true | 请求包含 DTO 未定义属性时返回 1001 错误 |
| transform | true | 自动转换类型（如字符串 "1" 转数字 1） |

### 查询参数空字符串处理

前端搜索框不选时可能传空字符串（如 `name=`），但枚举类型验证器不接受空值。解决方案：

```typescript
import { Transform } from 'class-transformer';

export class QueryCompanyDto {
  @IsEnum(CompanyStatus)
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  status?: CompanyStatus;
}
```

### 接口查询参数规范

**重要**：技术方案接口列表中必须列出所有查询参数，前端每个搜索字段都必须在 DTO 中有对应定义。

## 12.5 接口命名规范（部分示例）

| 接口 | 方法 | 路径 | 查询参数 |
|------|------|------|----------|
| 登录 | POST | /api/auth/login | - |
| 登出 | POST | /api/auth/logout | - |
| 刷新 Token | POST | /api/auth/refresh | - |
| 公司列表 | GET | /api/companies | page, pageSize, name, status |
| 创建公司 | POST | /api/companies | - |
| 公司详情 | GET | /api/companies/:id | - |
| 编辑公司 | PATCH | /api/companies/:id | - |
| 启停公司 | PATCH | /api/companies/:id/status | - |
| 项目列表 | GET | /api/projects | page, pageSize, name, status |
| 创建项目 | POST | /api/projects | - |
| 项目详情 | GET | /api/projects/:id | - |
| 编辑项目 | PATCH | /api/projects/:id | - |
| 员工列表 | GET | /api/employees | page, pageSize, name, status, projectId |
| 创建员工 | POST | /api/employees | - |
| 员工详情 | GET | /api/employees/:id | - |
| 编辑员工 | PATCH | /api/employees/:id | - |
| 获取 OSS 上传凭证 | POST | /api/files/presign | - |
| 账户余额查询 | GET | /api/account/balance | - |
| 充值记录列表 | GET | /api/recharge-orders | page, pageSize, status, tenantId（仅平台管理员） |
| 创建充值申请 | POST | /api/recharge-orders | - |
| 资金流水列表 | GET | /api/transactions | page, pageSize, type, direction, startDate, endDate |
| 创建发薪单 | POST | /api/payroll-orders | - |
| 发薪单列表 | GET | /api/payroll-orders | - |
| 发薪限额配置查询 | GET | /api/payroll-limit-config | - |
| 更新发薪限额配置 | PATCH | /api/payroll-limit-config | - |

---

# 十三、错误码体系

## 13.1 系统错误码

| 错误码 | 说明 |
|--------|------|
| 0 | 成功 |
| 1000 | 系统错误 |
| 1001 | 参数错误 |
| 1002 | 资源不存在 |
| 1003 | 权限不足 |
| 1004 | 认证失败（Token 无效） |
| 1005 | Token 过期 |
| 1006 | 账号已锁定，请稍后重试 |
| 1007 | 账号已禁用 |

## 13.2 业务错误码

| 错误码 | 说明 |
|--------|------|
| 2001 | 账户余额不足 |
| 2002 | 支付密码错误 |
| 2003 | 账户已冻结 |
| 2004 | 项目已停用 |
| 2005 | 员工不存在 |
| 2006 | 超出发薪限额 |
| 2007 | 重复提交（幂等拦截） |
| 2009 | 公司已停用 |
| 2010 | 用户名已存在 |

---

# 十四、日志规范

## 14.1 日志级别

| 级别 | 使用场景 |
|------|----------|
| ERROR | 错误堆栈、未捕获异常 |
| WARN | 业务警告（如余额不足、多次密码错误） |
| INFO | 关键业务节点（登录、充值、发薪、审核） |
| DEBUG | 开发调试信息（生产环境关闭） |

## 14.2 日志格式

### 控制台与文件输出

使用 winston 进行日志管理，输出到控制台和文件：

- 控制台：彩色输出，便于开发调试
- `logs/app.log`：所有 INFO 及以上级别日志
- `logs/error.log`：仅 ERROR 级别日志

### 日志格式

```
[时间] [级别] [模块] [请求方法] [请求路径] [错误码] [错误信息]
2026-03-09 10:00:00 [INFO] [HTTP] POST /api/auth/login -
2026-03-09 10:05:00 [ERROR] [HTTP] POST /api/payroll/create code:400 message:余额不足
```

### 字段说明

| 字段 | 说明 |
|------|------|
| 时间 | 格式：YYYY-MM-DD HH:mm:ss |
| 级别 | ERROR / WARN / INFO / DEBUG |
| 模块 | 如 HTTP、Auth、Account、Employee 等 |
| 请求方法 | GET / POST / PUT / DELETE 等 |
| 请求路径 | 请求的 URL 路径 |
| 错误码 | HTTP 状态码或业务错误码 |
| 错误信息 | 错误描述文字 |

### Winston 配置要点

```typescript
// src/common/logger/logger.config.ts
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.metadata({ fillExcept: ['message', 'level', 'timestamp', 'service'] }),
  winston.format.printf((info) => {
    // 读取 metadata 中的自定义字段
    const meta = info.metadata || {};
    return `${timestamp} [${level}] [${module}] ${method} ${url} code:${errorCode} message:${errorMessage}`;
  }),
);
```

## 14.3 必须记录的操作日志

- 用户登录 / 登出
- 登录失败（记录失败次数）
- 公司创建 / 启停
- 账号创建 / 禁用 / 密码修改
- 充值申请创建
- 发薪单创建 / 确认 / 完成 / 失败（包含金额）
- 限额配置变更
- 敏感文件访问（身份证照片）

---

# 十五、部署方案

## 15.1 推荐架构（腾讯云 / 阿里云）

| 组件 | 规格建议 | 说明 |
|------|----------|------|
| 云服务器 ECS | 2 核 4G | 运行 NestJS 应用 |
| MySQL RDS | 1 核 2G（初期） | 托管数据库，自动备份 |
| Redis | 1G（初期） | 缓存 + Token 管理 |
| 对象存储 COS/OSS | 按量计费 | 文件存储 |
| Nginx | 同 ECS | 反向代理 + HTTPS |

## 15.2 部署流程

1. Docker 容器化部署（NestJS 打包为 Docker 镜像）
2. 使用 PM2 或 Node Cluster 管理进程
3. HTTPS 配置（Let's Encrypt 或云厂商 SSL 证书）
4. Nginx 配置反向代理，统一入口

## 15.3 环境变量管理

敏感配置（数据库密码、Redis 密码、JWT Secret、OSS 密钥）通过环境变量注入，不写入代码仓库。

```bash
# .env.production 示例（存储在服务器，不上传 Git）
DB_HOST=mysql6.sqlpub.com:3311
DB_PASSWORD=xxx
REDIS_PASSWORD=xxx
JWT_SECRET=xxx
OSS_ACCESS_KEY=xxx
OSS_SECRET_KEY=xxx
```

---

# 十六、第一阶段开发清单

> ⚠️ 第一阶段不包含发薪模块和小程序端

## 需完成的模块

- **认证模块**：登录、登出、Token 刷新、登录保护、RBAC 权限守卫
- **用户账号模块**：账号增删改查、密码修改、支付密码设置、登录失败锁定
- **企业管理模块**：公司增删改查、启停、创建企业管理员账号
- **项目管理模块**：项目增删改查、启停、二维码生成
- **员工管理模块**：员工增删改查、状态管理、身份证照片上传
- **账户模块**：余额查询
- **充值模块**：充值申请、充值记录查询
- **文件模块**：OSS 预签名 URL 生成、敏感文件临时访问 URL 生成
- **多租户基础设施**：TenantContext、TenantSubscriber、租户隔离中间件

## 数据库初始化

- 通过 `prisma migrate dev` 自动生成并执行建表 SQL
- 初始化平台管理员账号（通过 `prisma db seed` 脚本执行）
- 所有表结构变更通过 `prisma migrate` 管理，迁移文件纳入 Git 版本控制

---

# 十七、后续扩展路径（第二阶段及以后）

当业务规模增长时的扩展路线：

1. **发薪引擎独立**：将发薪模块拆为独立微服务，引入消息队列（RabbitMQ）异步处理
2. **读写分离**：MySQL 主从复制，读库分担查询压力
3. **容器化编排**：Docker + Kubernetes
4. **微信微工卡对接**：发薪服务与微信微工卡 API 对接
5. **报表统计模块**：发薪汇总、员工收入统计、企业消费分析

---

# 最终架构总结

| 设计决策 | 选择 | 理由 |
|----------|------|------|
| 架构模式 | 模块化单体 | 当前规模合适，避免过度工程化 |
| 多租户隔离 | 单库 + tenant_id | 开发简单，满足当前需求 |
| 认证方式 | JWT + Redis 黑名单 | 支持登出，安全可控 |
| 密码加密 | bcrypt（登录 + 支付独立） | 行业标准，独立字段增加安全性 |
| 文件存储 | OSS 私有 Bucket + 预签名 | 敏感信息不可公开访问 |
| 充值方式 | 线下转账 + 平台直接到账 | MVP 阶段无审核流程，平台管理员直接操作确认 |
| ORM | Prisma | 类型安全、迁移工具成熟、Schema 集中管理，适合金融类系统 |
| 余额字段类型 | DECIMAL(15,2) | 避免浮点精度问题 |

---

*文档版本：v3.0 | 最后更新：2026年*
