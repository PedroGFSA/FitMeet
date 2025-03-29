import prisma from "../connection/prisma-client";

export const getTypeById = async (id: string) => {
  return await prisma.activityTypes.findUnique({ where: { id } });
}