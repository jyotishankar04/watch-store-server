import { PrismaClient } from "@prisma/client";

const prismaClientSingleton = () => {
  return new PrismaClient(
    process.env.NODE_ENV === "production"
      ? {
          log: ["query", "info", "warn", "error"],
        }
      : undefined
  );
};

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma: ReturnType<typeof prismaClientSingleton> =
  globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma;
