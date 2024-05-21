import { PrismaClient } from "@prisma/client";

const prisma = global.prisma || PrismaClient();

export default prisma;