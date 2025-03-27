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
    where: { deletedAt: null, typeId: typeId },
    skip: skip,
    take: take,
    include: { 
      address: { omit: { activityId: true, id: true } },
      creator: { select: {id: true, name: true, avatar: true} },
    },
    orderBy: orderConfig 
  });

  return { page, pageSize, totalActivities, totalPages, previous, next, activities };
};

export const getAllActivities = async (typeId?: string, orderBy?: string, order?: string ) => {
  const orderConfig = orderBy ? { [orderBy]: order?.toLowerCase() } : undefined
  return await prisma.activities.findMany({ 
    where: { deletedAt: null, typeId: typeId }, 
    include: { address: { omit: { activityId: true, id: true } }, creator: { select: {id: true, name: true, avatar: true} }},
    orderBy: orderConfig
  });
};

// TODO: return type name instead of id
export const getActivitiesCreatedByUser = async (userId: string, page: number, pageSize: number) => {
  const totalActivities = await prisma.activities.count({ where: { creatorId: userId, deletedAt: null } });
  const skip = page * pageSize - pageSize;
  const take = pageSize;
  const totalPages = Math.ceil(totalActivities / take);
  const previous = page > 1 ? page - 1 : null;
  const next = page < totalPages ? page + 1 : null;
  const result = await prisma.activities.findMany({
    where: { creatorId: userId, deletedAt: null },
    include: { 
      address: { omit: { activityId: true, id: true }}, 
      creator: { select: { id: true, name: true, avatar: true}},
      _count: { select: { ActivityParticipants: true } }
    },
    skip: skip,
    take: take,
  });
  // Cria um novo campo participantCount no json para retornar a quantidade de participantes e remove o campo _count criado pelo prisma
  const activities = result.map((activity) => {
    const parsedActivity : any = { 
      ...activity, 
      participantCount: activity._count.ActivityParticipants 
    };
    delete parsedActivity._count;
    return parsedActivity;
  });
  return { page, pageSize, totalActivities, totalPages, previous, next, activities };
};

export const getAllActivitiesCreatedByUser = async (userId: string) => { 
  const result = await prisma.activities.findMany({ 
    where: { creatorId: userId, deletedAt: null },
    include: { 
      address: { omit: { activityId: true, id: true }}, 
      creator: { select: { id: true, name: true, avatar: true}}, 
      _count: { select: { ActivityParticipants: true } }
    },
   });
  const activities = result.map((activity) => {
    const parsedActivity : any = { 
      ...activity, 
      participantCount: activity._count.ActivityParticipants 
    };
    delete parsedActivity._count;
    return parsedActivity;
  });
  return activities;  
}

export const getActivitiesUserParticipant = async (userId: string, page: number, pageSize: number) => {
  const totalActivities = await prisma.activities.count({ where: { ActivityParticipants: { some: { userId } }, deletedAt: null } });
  const skip = page * pageSize - pageSize;
  const take = pageSize;
  const totalPages = Math.ceil(totalActivities / take);
  const previous = page > 1 ? page - 1 : null;
  const next = page < totalPages ? page + 1 : null;
  const result = await prisma.activities.findMany({
    where: { ActivityParticipants: { some: { userId } }, deletedAt: null },
    skip: skip,
    take: take,
    include: { 
      address: { omit: { activityId: true, id: true } }, 
      creator: { select: {id: true, name: true, avatar: true} },
      _count: { select: { ActivityParticipants: true } }
    },
    omit: { creatorId: true }
  });
  const activities = result.map((activity) => {
    const parsedActivity : any = { 
      ...activity, 
      participantCount: activity._count.ActivityParticipants 
    };
    delete parsedActivity._count;
    return parsedActivity;
  });

  return { page, pageSize, totalActivities, totalPages, previous, next, activities };
}

export const getAllActivitiesUserParticipant = async (userId: string) => {
  const result = await prisma.activities.findMany({ 
    where: { ActivityParticipants: { some: { userId } }, deletedAt: null },
    include: { 
      address: { omit: { activityId: true, id: true } }, 
      creator: { select: {id: true, name: true, avatar: true} },
      _count: { select: { ActivityParticipants: true } }
    },
    omit: {creatorId: true} 
  });
  const activities = result.map((activity) => {
    const parsedActivity : any = { 
      ...activity, 
      participantCount: activity._count.ActivityParticipants 
    };
    delete parsedActivity._count;
    return parsedActivity;
  });
  return activities;
}

export const create = async (data: any) => {
  const activity = await prisma.activities.create({
    data: {
      title: data.title,
      description: data.description,
      typeId: data.typeId,
      image: data.image,
      scheduledDate: data.scheduledDate,
      private: data.private,
      creatorId: data.creatorId,
      confirmationCode: data.confirmationCode,
      address: {
        create: {
          latitude: data.address.latitude,
          longitude: data.address.longitude,
        },
      },
    },
  });
  return activity;
};

export const getActivityById = async (id: string) => {
  return await prisma.activities.findUnique({ where: { id, deletedAt: null } });
}

export const update = async (id: string, data: any) => {
  return await prisma.activities.update({ 
    where: { id }, 
    include: { address: { omit: { activityId: true, id: true }}, creator: {select: {id: true, name: true, avatar: true}} }, 
    omit: { creatorId: true }, 
    data 
  });
}

export const concludeActivity = async (id: string) => {
  const current = new Date();
  const date = new Date(current.getTime() - current.getTimezoneOffset() * 60000);
  return await prisma.activities.update({ where: { id }, data: { completedAt:  date} });
}

export const deleteById = async (id: string) => {
  const current = new Date();
  const date = new Date(current.getTime() - current.getTimezoneOffset() * 60000);
  return await prisma.activities.update({ where: { id }, data: { deletedAt: date } });
}