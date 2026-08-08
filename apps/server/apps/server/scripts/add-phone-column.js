import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function migrate() {
  try {
    await sql`ALTER TABLE private_bookings ADD COLUMN IF NOT EXISTS phone varchar(20);`;
    console.log('✓ phone column added successfully');
  } catch (e) {
    console.error('Migration error:', e.message);
  }
  process.exit(0);
}

migrate();
