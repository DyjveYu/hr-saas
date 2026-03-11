import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // 创建平台管理员账号
  const hashedPassword = await bcrypt.hash('Admin@123456', 10);

  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: hashedPassword,
      role: 'PLATFORM_ADMIN',
      realName: '平台管理员',
      status: 'ACTIVE',
    },
  });

  console.log('Created platform admin user:', admin.username);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
