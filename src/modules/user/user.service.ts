import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateUserDto, UpdateUserDto, ChangePasswordDto, SetPaymentPasswordDto, ChangeStatusDto } from './dto/user.dto';
import * as bcrypt from 'bcrypt';
import type { User, UserStatus, Role } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  /**
   * 账号列表
   * PLATFORM_ADMIN 查所有，COMPANY_ADMIN 查本企业
   */
  async findAll(tenantId: number | null, role: string) {
    const where: any = {};

    // COMPANY_ADMIN 只能查看本企业的用户
    if (role === 'COMPANY_ADMIN' && tenantId !== null) {
      where.tenantId = tenantId;
    }
    // PLATFORM_ADMIN 查看所有（tenantId 为 null 也不需要额外过滤）

    return this.prisma.user.findMany({
      where,
      select: {
        id: true,
        username: true,
        role: true,
        realName: true,
        phone: true,
        status: true,
        tenantId: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * 创建账号
   */
  async create(createUserDto: CreateUserDto, currentUserTenantId: number | null, currentUserRole: string) {
    // username 唯一校验
    const existing = await this.prisma.user.findUnique({
      where: { username: createUserDto.username },
    });
    if (existing) {
      throw new BadRequestException({ code: 2010, message: '用户名已存在' });
    }

    // 密码加密
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // tenantId 处理
    let tenantId: number | undefined = createUserDto.tenantId;
    // COMPANY_ADMIN 只能创建本企业的用户
    if (currentUserRole === 'COMPANY_ADMIN') {
      if (createUserDto.tenantId && createUserDto.tenantId !== currentUserTenantId) {
        throw new ForbiddenException({ code: 1003, message: '无权限' });
      }
      tenantId = currentUserTenantId ?? undefined;
    }
    // PLATFORM_ADMIN 可以不指定 tenantId（创建平台管理员）
    if (currentUserRole === 'PLATFORM_ADMIN' && !tenantId && createUserDto.role === 'PLATFORM_ADMIN') {
      tenantId = undefined;
    }

    const user = await this.prisma.user.create({
      data: {
        username: createUserDto.username,
        password: hashedPassword,
        role: createUserDto.role || 'COMPANY_ADMIN',
        realName: createUserDto.realName,
        phone: createUserDto.phone,
        tenantId,
      },
      select: {
        id: true,
        username: true,
        role: true,
        realName: true,
        phone: true,
        status: true,
        tenantId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  /**
   * 修改账号
   */
  async update(id: number, updateUserDto: UpdateUserDto, currentUserTenantId: number | null, currentUserRole: string) {
    await this.checkPermission(id, currentUserTenantId, currentUserRole);

    return this.prisma.user.update({
      where: { id },
      data: {
        realName: updateUserDto.realName,
        phone: updateUserDto.phone,
      },
      select: {
        id: true,
        username: true,
        role: true,
        realName: true,
        phone: true,
        status: true,
        tenantId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  /**
   * 删除账号（软删除）
   */
  async remove(id: number, currentUserTenantId: number | null, currentUserRole: string) {
    await this.checkPermission(id, currentUserTenantId, currentUserRole);

    return this.prisma.user.update({
      where: { id },
      data: { status: 'DISABLED' },
      select: {
        id: true,
        username: true,
        status: true,
      },
    });
  }

  /**
   * 修改登录密码
   */
  async changePassword(id: number, dto: ChangePasswordDto, currentUserTenantId: number | null, currentUserRole: string) {
    await this.checkPermission(id, currentUserTenantId, currentUserRole);

    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException({ code: 1002, message: '用户不存在' });
    }

    // 验证旧密码
    const isMatch = await bcrypt.compare(dto.oldPassword, user.password);
    if (!isMatch) {
      throw new BadRequestException({ code: 2001, message: '原密码错误' });
    }

    // 更新密码
    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);
    await this.prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });

    return { message: '密码修改成功' };
  }

  /**
   * 设置/修改支付密码
   * 仅 COMPANY_ADMIN 账号有效
   */
  async setPaymentPassword(id: number, dto: SetPaymentPasswordDto, currentUserTenantId: number | null, currentUserRole: string) {
    await this.checkPermission(id, currentUserTenantId, currentUserRole);

    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException({ code: 1002, message: '用户不存在' });
    }

    // 验证当前用户是否是 COMPANY_ADMIN
    if (user.role !== 'COMPANY_ADMIN') {
      throw new BadRequestException({ code: 2002, message: '只有企业管理员才能设置支付密码' });
    }

    // 加密支付密码
    const hashedPaymentPassword = await bcrypt.hash(dto.paymentPassword, 10);
    await this.prisma.user.update({
      where: { id },
      data: { paymentPassword: hashedPaymentPassword },
    });

    return { message: '支付密码设置成功' };
  }

  /**
   * 账号启停
   */
  async changeStatus(id: number, dto: ChangeStatusDto, currentUserTenantId: number | null, currentUserRole: string) {
    await this.checkPermission(id, currentUserTenantId, currentUserRole);

    return this.prisma.user.update({
      where: { id },
      data: { status: dto.status },
      select: {
        id: true,
        username: true,
        status: true,
      },
    });
  }

  /**
   * 权限检查
   */
  private async checkPermission(targetUserId: number, currentUserTenantId: number | null, currentUserRole: string) {
    const targetUser = await this.prisma.user.findUnique({ where: { id: targetUserId } });
    if (!targetUser) {
      throw new NotFoundException({ code: 1002, message: '用户不存在' });
    }

    if (currentUserRole === 'PLATFORM_ADMIN') {
      // PLATFORM_ADMIN 可以操作所有用户
      return;
    }

    if (currentUserRole === 'COMPANY_ADMIN') {
      // COMPANY_ADMIN 只能操作本企业的用户
      if (targetUser.tenantId !== currentUserTenantId) {
        throw new ForbiddenException({ code: 1003, message: '无权限操作其他企业的用户' });
      }
      return;
    }

    throw new ForbiddenException({ code: 1003, message: '无权限' });
  }
}
