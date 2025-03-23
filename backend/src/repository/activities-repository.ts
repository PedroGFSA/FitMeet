import prisma from "../connection/prisma-client";

export const getActivitiesPaginated = async (skip: number, take: number, typeId? : string, orderBy?: string, order?: string) => {
  const totalActivities = await prisma.activities.count({ where: { deletedAt: null } });
  const page = Math.ceil(skip / take) + 1;
  const pageSize = take;
  const totalPages = Math.ceil(totalActivities / take);
  const previous = page > 1 ? page - 1 : null;
  const next = page < totalPages ? page + 1 : null;
  const orderConfig = orderBy ? { [orderBy]: order?.toLowerCase() } : undefined
  const activities = await prisma.activities.findMany({
    where: { deletedAt: null, type: typeId },
    skip: (page - 1) * take,
    take: take,
    orderBy: orderConfig 
  });

  return { page, pageSize, totalActivities, totalPages, previous, next, activities };
};

export const getAllActivities = async (typeId?: string, orderBy?: string, order?: string ) => {
  const orderConfig = orderBy ? { [orderBy]: order?.toLowerCase() } : undefined
  return await prisma.activities.findMany({ 
    where: { deletedAt: null, type: typeId }, 
    orderBy: orderConfig
  });
};