-- CreateTable
CREATE TABLE `users` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `tenant_id` BIGINT NULL,
    `username` VARCHAR(64) NOT NULL,
    `password` VARCHAR(128) NOT NULL,
    `payment_password` VARCHAR(128) NULL,
    `role` ENUM('PLATFORM_ADMIN', 'COMPANY_ADMIN') NOT NULL DEFAULT 'COMPANY_ADMIN',
    `real_name` VARCHAR(32) NULL,
    `phone` VARCHAR(20) NULL,
    `status` ENUM('ACTIVE', 'DISABLED') NOT NULL DEFAULT 'ACTIVE',
    `last_login_at` DATETIME(3) NULL,
    `login_fail_count` INTEGER NOT NULL DEFAULT 0,
    `locked_until` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_username_key`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `companies` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(128) NOT NULL,
    `short_name` VARCHAR(64) NULL,
    `status` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    `contact_name` VARCHAR(32) NULL,
    `contact_phone` VARCHAR(20) NULL,
    `contact_email` VARCHAR(128) NULL,
    `address` VARCHAR(256) NULL,
    `created_by` BIGINT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `projects` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `tenant_id` BIGINT NOT NULL,
    `name` VARCHAR(128) NOT NULL,
    `capacity` INTEGER NULL,
    `site_manager` VARCHAR(32) NULL,
    `site_manager_phone` VARCHAR(20) NULL,
    `finance_manager` VARCHAR(32) NULL,
    `finance_manager_phone` VARCHAR(20) NULL,
    `status` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    `qr_code_url` VARCHAR(512) NULL,
    `qr_code_token` VARCHAR(128) NULL,
    `created_by` BIGINT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `idx_tenant`(`tenant_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `employees` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `tenant_id` BIGINT NOT NULL,
    `project_id` BIGINT NULL,
    `name` VARCHAR(32) NOT NULL,
    `id_card` VARCHAR(18) NOT NULL,
    `phone` VARCHAR(20) NOT NULL,
    `status` ENUM('PENDING', 'ACTIVE', 'PENDING_EXIT', 'RESIGNED', 'FIRED', 'DISMISSED') NOT NULL DEFAULT 'PENDING',
    `emergency_contact` VARCHAR(32) NULL,
    `emergency_phone` VARCHAR(20) NULL,
    `id_card_front_url` VARCHAR(512) NULL,
    `id_card_back_url` VARCHAR(512) NULL,
    `openid` VARCHAR(128) NULL,
    `remark` VARCHAR(256) NULL,
    `created_by` BIGINT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `idx_tenant`(`tenant_id`),
    INDEX `idx_tenant_project`(`tenant_id`, `project_id`),
    UNIQUE INDEX `employees_tenant_id_id_card_key`(`tenant_id`, `id_card`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `accounts` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `tenant_id` BIGINT NOT NULL,
    `balance` DECIMAL(15, 2) NOT NULL DEFAULT 0,
    `status` ENUM('ACTIVE', 'FROZEN') NOT NULL DEFAULT 'ACTIVE',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `accounts_tenant_id_key`(`tenant_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `recharge_orders` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `tenant_id` BIGINT NOT NULL,
    `orderNo` VARCHAR(64) NOT NULL,
    `amount` DECIMAL(15, 2) NOT NULL,
    `status` ENUM('PENDING', 'COMPLETED') NOT NULL DEFAULT 'PENDING',
    `transfer_voucher_url` VARCHAR(512) NULL,
    `remark` VARCHAR(256) NULL,
    `created_by` BIGINT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `recharge_orders_orderNo_key`(`orderNo`),
    INDEX `idx_tenant`(`tenant_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `transaction_records` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `tenant_id` BIGINT NOT NULL,
    `transaction_type` ENUM('RECHARGE', 'PAYROLL', 'REFUND') NOT NULL,
    `amount` DECIMAL(15, 2) NOT NULL,
    `transaction_direction` ENUM('IN', 'OUT') NOT NULL,
    `before_balance` DECIMAL(15, 2) NOT NULL,
    `after_balance` DECIMAL(15, 2) NOT NULL,
    `reference_id` BIGINT NULL,
    `reference_no` VARCHAR(64) NULL,
    `operator_id` BIGINT NULL,
    `remark` VARCHAR(256) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `idx_tenant_type`(`tenant_id`, `transaction_type`),
    INDEX `idx_tenant_created`(`tenant_id`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payroll_limit_configs` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `tenant_id` BIGINT NOT NULL,
    `max_total_amount` DECIMAL(15, 2) NOT NULL,
    `max_per_person_amount` DECIMAL(15, 2) NOT NULL,
    `updated_by` BIGINT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `payroll_limit_configs_tenant_id_key`(`tenant_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payroll_orders` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `tenant_id` BIGINT NOT NULL,
    `orderNo` VARCHAR(64) NOT NULL,
    `project_id` BIGINT NOT NULL,
    `total_amount` DECIMAL(15, 2) NOT NULL,
    `employee_count` INTEGER NOT NULL,
    `status` ENUM('DRAFT', 'PENDING_VERIFY', 'PROCESSING', 'PAID', 'FAILED', 'PARTIAL') NOT NULL DEFAULT 'DRAFT',
    `idempotency_key` VARCHAR(128) NOT NULL,
    `operator_id` BIGINT NOT NULL,
    `verified_at` DATETIME(3) NULL,
    `completed_at` DATETIME(3) NULL,
    `remark` VARCHAR(256) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `payroll_orders_orderNo_key`(`orderNo`),
    UNIQUE INDEX `payroll_orders_idempotency_key_key`(`idempotency_key`),
    INDEX `idx_tenant_status`(`tenant_id`, `status`),
    INDEX `idx_tenant_created`(`tenant_id`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payroll_details` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `payroll_order_id` BIGINT NOT NULL,
    `employee_id` BIGINT NOT NULL,
    `amount` DECIMAL(15, 2) NOT NULL,
    `status` ENUM('PENDING', 'SUCCESS', 'FAILED') NOT NULL DEFAULT 'PENDING',
    `fail_reason` VARCHAR(256) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `idx_order`(`payroll_order_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `companies`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `companies` ADD CONSTRAINT `companies_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `projects` ADD CONSTRAINT `projects_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `companies`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `projects` ADD CONSTRAINT `projects_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `employees` ADD CONSTRAINT `employees_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `companies`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `employees` ADD CONSTRAINT `employees_project_id_fkey` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `employees` ADD CONSTRAINT `employees_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `accounts` ADD CONSTRAINT `accounts_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `companies`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `recharge_orders` ADD CONSTRAINT `recharge_orders_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `companies`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `recharge_orders` ADD CONSTRAINT `recharge_orders_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transaction_records` ADD CONSTRAINT `transaction_records_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `companies`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transaction_records` ADD CONSTRAINT `transaction_records_operator_id_fkey` FOREIGN KEY (`operator_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transaction_records` ADD CONSTRAINT `transaction_records_reference_id_fkey` FOREIGN KEY (`reference_id`) REFERENCES `recharge_orders`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payroll_orders` ADD CONSTRAINT `payroll_orders_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `companies`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payroll_orders` ADD CONSTRAINT `payroll_orders_project_id_fkey` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payroll_orders` ADD CONSTRAINT `payroll_orders_operator_id_fkey` FOREIGN KEY (`operator_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payroll_details` ADD CONSTRAINT `payroll_details_payroll_order_id_fkey` FOREIGN KEY (`payroll_order_id`) REFERENCES `payroll_orders`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payroll_details` ADD CONSTRAINT `payroll_details_employee_id_fkey` FOREIGN KEY (`employee_id`) REFERENCES `employees`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
