import prisma from "../connection/prisma-client";
import { CreateActivityData } from "../types/activities-type";

export const getAllTypes = async () => {
  return await prisma.activityTypes.findMany();
}

export const getActivitiesPaginated = async (page: number, pageSize: number, typeId? : string, orderBy?: string, order?: string) => {
  const totalActivities = await prisma.activities.count({ where: { deletedAt: null } });
  const skip = page * pageSize - pageSize;
  const take = pageSize;
  const totalPages = Math.ceil(totalActivities / take);
  const previous = page > 1 ? page - 1 : null;
  const next = page < totalPages ? page + 1 : null;
  const orderConfig = orderBy ? { [orderBy]: order?.toLowerCase() } : undefined
  const activities = await prisma.activities.findMany({
    where: { deletedAt: null, type: typeId },
    skip: skip,
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

export const getActivitiesCreatedByUser = async (userId: string, page: number, pageSize: number) => {
  const totalActivities = await prisma.activities.count({ where: { creatorId: userId, deletedAt: null } });
  const skip = page * pageSize - pageSize;
  const take = pageSize;
  const totalPages = Math.ceil(totalActivities / take);
  const previous = page > 1 ? page - 1 : null;
  const next = page < totalPages ? page + 1 : null;
  const activities = await prisma.activities.findMany({
    where: { creatorId: userId, deletedAt: null },
    skip: skip,
    take: take
  });

  return { page, pageSize, totalActivities, totalPages, previous, next, activities };
};

export const getAllActivitiesCreatedByUser = async (userId: string) => { 
  return await prisma.activities.findMany({ where: { creatorId: userId, deletedAt: null } });
}

// TODO: fix relationship of activityaddress and activities so it doesnt create an activityId column 
export const getActivitiesUserParticipant = async (userId: string, page: number, pageSize: number) => {
  const totalActivities = await prisma.activities.count({ where: { ActivityParticipants: { some: { userId } }, deletedAt: null } });
  const skip = page * pageSize - pageSize;
  const take = pageSize;
  const totalPages = Math.ceil(totalActivities / take);
  const previous = page > 1 ? page - 1 : null;
  const next = page < totalPages ? page + 1 : null;
  const activities = await prisma.activities.findMany({
    where: { ActivityParticipants: { some: { userId } }, deletedAt: null },
    skip: skip,
    take: take,
    include: { activityAddress: true },
    omit: { activityAddressId: true }
  });

  return { page, pageSize, totalActivities, totalPages, previous, next, activities };
}

export const getAllActivitiesUserParticipant = async (userId: string) => {
  return await prisma.activities.findMany({ 
    where: { ActivityParticipants: { some: { userId } }, deletedAt: null },
    include: { activityAddress: true }, 
    omit: { activityAddressId: true }
  });
}

// TODO: try to flatten the final object 
export const getAllActivityParticipants = async (activityId: string) => {
  return await prisma.activityParticipants.findMany({ 
    where: { activityId },
    select: {
      id: true,
      userId: true,
      approved: true,
      confirmedAt: true,
      Users: {
        select: {
          name: true,
          avatar: true
        }
      }
    }
   });
}

export const create = async (data: any) => {
  return await prisma.activities.create({ data });
}