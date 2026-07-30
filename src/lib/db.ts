import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import fs from 'fs';
import path from 'path';

// Manual .env loading fallback for workspace path resolution safety
if (!process.env.DATABASE_URL) {
  try {
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      content.split(/\r?\n/).forEach((line) => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const idx = trimmed.indexOf('=');
          if (idx !== -1) {
            const key = trimmed.substring(0, idx).trim();
            const val = trimmed.substring(idx + 1).trim();
            process.env[key] = val;
          }
        }
      });
    }
  } catch (e) {
    console.error('Failed to manually load env file:', e);
  }
}

const globalForPrisma = global as unknown as { prisma: PrismaClient | undefined };

const createPrismaClient = () => {
  const url = process.env.DATABASE_URL || '';
  const isLocal = url.includes('localhost') || 
                  url.includes('127.0.0.1') || 
                  url.includes('host.docker.internal');
                  
  const cleanUrl = url.split('?')[0];
                  
  const pool = new pg.Pool({
    connectionString: isLocal ? url : cleanUrl,
    ssl: isLocal ? false : { rejectUnauthorized: false },
  });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
};

const getPrisma = (): PrismaClient => {
  if (globalForPrisma.prisma && (globalForPrisma.prisma as any).company) {
    return globalForPrisma.prisma;
  }
  const client = createPrismaClient();
  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = client;
  }
  return client;
};

export const prisma = getPrisma();
