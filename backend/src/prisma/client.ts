import { PrismaClient } from '@prisma/client';
import { config } from '../config/env.js';

// Polyfill BigInt serialization to prevent JSON.stringify crashes
(BigInt.prototype as any).toJSON = function () {
  return Number(this);
};

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

export const prisma =
  global.__prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: config.databaseUrl,
      },
    },
    log: config.env === 'development' ? ['warn', 'error'] : ['error'],
  });

if (config.env !== 'production') {
  global.__prisma = prisma;
}
