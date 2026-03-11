# 项目启动检查清单
# NestJS + Prisma + Vue3 技术栈 · 问题规避库

> 使用方式：每个新项目在编写技术方案和开发计划之前，先过一遍本清单。
> 确认每一项都已在技术方案或开发计划中明确描述，再交给 Claude Code 执行。
> 
> 标注说明：
> - 【技术方案】= 需要在 hr-saas-technical-spec.md 中体现
> - 【开发计划】= 需要在 hr-saas-dev-plan.md 中体现
> - 【两者都要】= 两个文档都需要体现

---

## 一、运行环境类

### ✅ 1.1 开发环境确认
- [ ] 明确开发环境是 Windows / Mac / Linux【开发计划】
- [ ] Windows 环境需在计划中注明：PowerShell 不支持 `<<<` 语法，所有需要执行 SQL 的验证步骤改用 TypeScript 脚本验证【开发计划】
- [ ] Windows 环境需在计划中注明：`prisma generate` 前必须确保没有 Node 进程在运行，否则会出现 EPERM 文件锁错误【开发计划】

### ✅ 1.2 数据库环境确认
- [ ] 明确数据库是本地 / 云数据库【技术方案】
- [ ] 云数据库（无 root 权限）：`prisma migrate dev` 需要 shadow database 权限，云数据库通常不具备，需改用 `prisma db push` 或使用本地 Docker 开发【开发计划】
- [ ] 本地 Docker 开发：计划中说明 Docker 容器重启后需手动 `docker start`，不会自动启动【开发计划】
- [ ] 生产环境部署：使用 `prisma migrate deploy`，不需要 shadow database 权限【技术方案】

### ✅ 1.3 端口管理
- [ ] 明确前端、后端、数据库各占用哪些端口【开发计划】
- [ ] 计划中说明端口占用的处理方式（`taskkill /IM node.exe /F`）【开发计划】
- [ ] `package.json` 中添加 `kill-port` 脚本方便快速释放端口【开发计划】

---

## 二、技术方案类

### ✅ 2.1 跨域配置（CORS）
- [ ] 技术方案中明确说明需要配置 CORS【技术方案】
- [ ] 开发计划任务 1.1（项目初始化）中包含 CORS 配置步骤【开发计划】
- [ ] `.env.example` 中包含 `CORS_ORIGIN` 变量【开发计划】
- [ ] CORS 配置示例：
  ```typescript
  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });
  ```

### ✅ 2.2 接口参数完整性
- [ ] 技术方案 API 列表中，每个列表查询接口必须列出完整的查询参数（page、pageSize 以及所有筛选字段）【技术方案】
- [ ] 前端有搜索框的地方，后端 DTO 必须有对应的字段定义【两者都要】
- [ ] 参数格式模板：

  | 接口 | 方法 | 路径 | 查询参数 |
  |------|------|------|---------|
  | 列表接口 | GET | /api/xxx | page, pageSize, [业务筛选字段...] |

### ✅ 2.3 Prisma 字段命名规则
- [ ] 技术方案数据库字段用下划线命名（snake_case）【技术方案】
- [ ] 开发计划中说明：Prisma Client 在 TypeScript 代码中自动转为驼峰命名（camelCase），所有业务代码必须用驼峰格式【开发计划】
- [ ] 对照表示例：`tenant_id` → `tenantId`，`real_name` → `realName`，`created_at` → `createdAt`

### ✅ 2.4 前后端目录隔离
- [ ] 前端项目放在后端根目录的子目录中时，后端 `tsconfig.json` 和 `tsconfig.build.json` 的 `exclude` 必须包含前端目录名【开发计划】
- [ ] 验证步骤必须从项目根目录启动，不能分目录单独启动【开发计划】
- [ ] 开发计划验证清单中必须包含前后端功能集成测试（如点击退出登录按钮，调用后端接口并清除本地状态）【开发计划】

### ✅ 2.5 统一响应格式
- [ ] 技术方案中明确定义成功和失败的响应结构【技术方案】
- [ ] 开发计划中要求实现全局响应拦截器和异常过滤器【开发计划】
- [ ] 所有错误码在技术方案中列举完整，业务开发中不得使用未定义的错误码【技术方案】

### ✅ 2.6 支付密码归属
- [ ] 技术方案明确支付密码存储在哪张表的哪个字段【技术方案】
- [ ] 支付密码和登录密码独立 bcrypt 加密，独立字段【技术方案】

### ✅ 2.7 验证管道与查询参数
- [ ] 技术方案中说明 ValidationPipe 配置（whitelist, transform, forbidNonWhitelisted）【技术方案】
- [ ] 技术方案接口列表中列出所有查询参数，前端每个筛选字段都必须在 DTO 中定义【技术方案】
- [ ] 枚举类型查询参数使用 @Transform 处理空字符串【开发计划】
- [ ] 开发计划中新增规则：列表接口 DTO 必须包含完整筛选参数【开发计划】

### ✅ 2.8 日志配置
- [ ] 技术方案 14.2 节详细说明 winston 配置，包括格式定义和 metadata 使用方式【技术方案】
- [ ] 使用 `winston.format.metadata()` 收集自定义字段，在 `printf` 中从 `info.metadata` 读取【技术方案】
- [ ] 接口日志拦截器中使用 metadata 传递自定义字段（module、method、path 等）【开发计划】

### ✅ 2.9 前端 UI 布局
- [ ] 前端必须基于 vue-element-plus-admin 的 Layout 组件实现主布局，禁止从零搭建，布局组件路径为 `frontend/src/layout/`【开发计划】
- [ ] 技术方案中详细说明 vue-element-plus-admin 布局结构（左侧导航通顶，顶部栏在右侧不通顶）【技术方案】
- [ ] App.vue 主布局设置 `layout-container: height:100vh; width:100vw`【开发计划】
- [ ] 列表页面容器设置 `flex:1; overflow:hidden` 撑满内容区【开发计划】
- [ ] 表格列设置 `min-width` 允许自动伸展，避免固定 `width`【开发计划】
- [ ] 搜索表单设置 `text-align:left` 保证左对齐【开发计划】

### ✅ 2.10 前端环境配置
- [ ] package.json 中 dev 命令必须使用 `--mode dev`，不能使用 `--mode base`【技术方案】
- [ ] .env.dev 中 `VITE_API_BASE_PATH=/api` 必须配置正确的 API 前缀【技术方案】
- [ ] .env.dev 中 `VITE_USE_MOCK=false` 必须关闭 mock 数据【技术方案】
- [ ] 启动前端后验证：浏览器 Network 标签中请求路径应包含 `/api` 前缀【开发计划】

---

## 三、开发计划类

### ✅ 3.1 验证任务设计标准
- [ ] 每个验证任务必须是"具体操作 + 期望结果"格式，不能只写"功能正常"【开发计划】
- [ ] 涉及浏览器的验证，必须说明用浏览器测试（不能只用 curl 或 Postman）【开发计划】
- [ ] 涉及跨租户的验证，必须用两个不同企业账号分别测试【开发计划】
- [ ] 涉及权限的验证，必须用无权限账号测试拒绝场景（不能只测通过场景）【开发计划】

### ✅ 3.2 任务依赖关系
- [ ] 每个任务开始前列出"依赖哪些已完成的任务"【开发计划】
- [ ] 每个任务列出"本任务将新增/修改的文件清单"【开发计划】
- [ ] 每个任务末尾有明确的完成标志，Claude Code 完成后停下等待指令【开发计划】

### ✅ 3.3 数据库验证方式（Windows 专项）
- [ ] 所有需要查询数据库的验证步骤，Windows 环境改用临时 `verify.ts` 脚本【开发计划】
- [ ] 验证脚本执行完成后必须删除【开发计划】
- [ ] Linux 环境可直接使用 `prisma db execute` 命令【开发计划】

### ✅ 3.4 集成测试覆盖
- [ ] 最终验证任务必须包含完整的前后端集成测试，从浏览器发起请求【开发计划】
- [ ] 集成测试覆盖完整业务流程（如：登录 → 创建企业 → 充值 → 查看余额）【开发计划】
- [ ] 集成测试覆盖多租户隔离场景【开发计划】

---

## 四、安全设计类

### ✅ 4.1 敏感信息保护
- [ ] 所有敏感字段（密码、身份证号）不在 API 响应中返回【技术方案】
- [ ] OSS 私有 Bucket，身份证照片不使用公开 URL【技术方案】
- [ ] `.env` 文件加入 `.gitignore`，不提交到代码仓库【开发计划】

### ✅ 4.2 接口安全
- [ ] 所有接口（除登录）都需要 JWT 验证【技术方案】
- [ ] 涉及资金操作的接口额外验证支付密码【技术方案】
- [ ] API 限流配置（Redis 计数器）【技术方案】

---

## 五、部署类

### ✅ 5.1 环境变量
- [ ] `.env.example` 包含所有必需变量，值为占位符【开发计划】
- [ ] 生产环境变量清单与开发环境分开说明【技术方案】
- [ ] 不同环境的 CORS_ORIGIN 配置说明【技术方案】

### ✅ 5.2 数据库迁移
- [ ] 开发环境：`prisma migrate dev`【开发计划】
- [ ] 生产部署：`prisma migrate deploy`（不需要 shadow database）【开发计划】
- [ ] 迁移文件纳入 Git 版本控制【开发计划】

---

## 六、本项目（HR SaaS）已记录的特有问题

> 以下是本项目开发过程中实际遇到的问题，下次同类项目直接参考。

| 问题 | 原因 | 解决方案 | 应在哪个环节预防 |
|------|------|---------|----------------|
| CORS 预检请求返回 1002 | 技术方案未包含 CORS 配置 | main.ts 中 enableCors() | 技术方案 8.4 节 |
| 列表接口 name 参数报 1001 | 计划未定义完整查询参数，forbidNonWhitelisted 拦截 | DTO 补充筛选字段 | 技术方案接口列表 + 开发计划规则 |
| 枚举参数空字符串报 1001 | 前端传空字符串，枚举验证器不接受 | DTO 使用 @Transform 转空字符串为 undefined | 技术方案验证管道配置 |
| prisma generate EPERM | Windows 文件锁，Node 进程未关闭 | 手动 taskkill + 删除 tmp 文件 | 开发计划执行规则 |
| shadow database 权限不足 | 云数据库无建库权限 | 本地 Docker 开发 | 环境规划阶段 |
| Prisma 驼峰命名错误 | 计划未说明字段命名转换规则 | 代码统一用驼峰 | 开发计划执行规则 |
| 后端编译扫描前端代码 | tsconfig 未排除 frontend 目录 | exclude 添加 frontend | 开发计划任务 1.1 |
| 端口被占用 | 上次进程未正常退出 | taskkill + kill-port 脚本 | 开发计划执行规则 |
| Winston 日志格式为空 | winston metadata 格式未正确解析自定义字段 | 使用 format.metadata() 收集字段，在 printf 中从 info.metadata 读取 | 技术方案 14.2 节 |
| 退出登录功能无效 | 前端点击退出后未调用后端接口和清除本地状态 | App.vue 的 handleCommand 中调用 userStore.logout() 并使用 router.push 跳转 | 开发计划前后端集成测试 |
| 前端页面布局未撑满屏幕 | 主布局容器未设置 100vh/100vw，el-container 未设置 flex: 1 | App.vue 设置 layout-container: height:100vh; width:100vw，列表页设置 flex:1 + overflow:hidden | UI 设计规范 |
| 表格列宽未自适应 | 给列设置了固定 width 未设置 min-width | 表格列设置 min-width 允许自动伸展 | UI 设计规范 |
| 搜索条件居中显示 | el-form 未设置左对齐 | el-form 设置 text-align:left | UI 设计规范 |
| 前端布局不稳定，反复出现空白和截断问题 | 从零搭建布局，没有使用成熟框架 | 强制使用 vue-element-plus-admin Layout 组件 | 开发计划阶段二 UI 确认 |
| 前端登录 404，请求未到达后端 | package.json dev 命令使用 --mode base，加载了错误的 .env.base（VITE_API_BASE_PATH 为空，VITE_USE_MOCK=true） | dev 命令改为 --mode dev，确保加载 .env.dev | 开发计划前端初始化 |

---

## 使用流程

```
新项目启动
    ↓
1. 编写需求文档
    ↓
2. 对照本清单第一、二章，完善技术方案
    ↓
3. 对照本清单第三章，完善开发计划
    ↓
4. 对照本清单第四、五章，检查安全和部署
    ↓
5. 将技术方案 + 开发计划 + 本清单放入 docs/ 目录
    ↓
6. 启动 Claude Code，发送开场指令
```

---

*版本：v1.0 | 基于 HR SaaS 第一阶段开发经验整理*
*技术栈：NestJS + Prisma + MySQL + Redis + Vue3 + Element Plus*
*适用环境：Windows PowerShell 开发 + 腾讯云/阿里云生产部署*
