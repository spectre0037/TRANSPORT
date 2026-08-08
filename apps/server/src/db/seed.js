import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { db } from './index.js';
import { users } from './schema.js';
import { eq } from 'drizzle-orm';

const seedAccounts = [
  {
    email: 'xpresstaleem@gmail.com',
    password: 'AdminPassword123!',
    fullName: 'TaleemXpress Admin',
    phone: '+923000000000',
    preferredCity: 'Lahore',
    role: 'admin',
    isEmailVerified: true,
  },
  {
    email: 'student@giki.edu.pk',
    password: 'StudentPassword123!',
    fullName: 'Test Student',
    phone: '+923111111111',
    preferredCity: 'Islamabad/Rawalpindi',
    role: 'student',
    isEmailVerified: true,
  },
];

async function seed() {
  console.log('🌱 Seeding database...');

  for (const account of seedAccounts) {
    const [existing] = await db.select().from(users).where(eq(users.email, account.email));

    if (existing) {
      console.log(`  ✓ ${account.email} already exists (id: ${existing.id})`);
      continue;
    }

    const passwordHash = await bcrypt.hash(account.password, parseInt(process.env.BCRYPT_ROUNDS));
    const [user] = await db.insert(users).values({
      email: account.email,
      passwordHash,
      fullName: account.fullName,
      phone: account.phone,
      preferredCity: account.preferredCity,
      role: account.role,
      isEmailVerified: account.isEmailVerified,
    }).returning();

    console.log(`  ✓ Created ${account.email} (${account.role}) - id: ${user.id}`);
  }

  console.log('🌱 Seeding complete!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed error:', err);
  process.exit(1);
});
