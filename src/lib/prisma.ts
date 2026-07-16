import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const prismaClientSingleton = () => {
  const connectionString = process.env.DATABASE_URL;
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
};

declare global {
  var globalPrisma: ReturnType<typeof prismaClientSingleton> | undefined;
}

const prisma = global.globalPrisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== "production") global.globalPrisma = prisma;
