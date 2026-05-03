import { defineConfig } from 'prisma/config';
import 'dotenv/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: process.env.postgresql://neondb_owner:npg_OcDdJZK56TrE@ep-falling-glade-annwof6w-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require!,
  },
});