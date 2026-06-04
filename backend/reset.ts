import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('asdf1234', 12);
  
  await prisma.user.upsert({
    where: { email: 'aaaa@gmail.com' },
    update: { password: hashedPassword },
    create: {
      name: 'Aaaaa',
      email: 'aaaa@gmail.com',
      phone: '8888999912',
      password: hashedPassword,
    }
  });

  console.log("Password reset successfully for aaaa@gmail.com -> asdf1234");
}

main().catch(console.error).finally(() => prisma.$disconnect());
