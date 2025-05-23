import prisma from "../connection/prisma-client";
import { CreateActivityData } from "../types/activities-type";

export const getAllTypes = async () => {
  return await prisma.activityTypes.findMany();
}

export const getPreferredTypesFromUser = async (userId: string) => {
  const types = await prisma.preferences.findMany({
    where: { userId },
    select: { typeId: true },
  });
  const preferredTypes = types.map((type) => type.typeId);
  return preferredTypes;
}

export const getActivitiesPaginated = async (types: Array<string>, page: number, pageSize: number, orderBy?: string, order?: string) => {
  const typeConfig = types.length > 0 ? { in: types } : undefined
  const totalActivities = await prisma.activities.count({ where: { deletedAt: null, completedAt: null, typeId: typeConfig } });
  const skip = page * pageSize - pageSize;
  const take = pageSize;
  const totalPages = Math.ceil(totalActivities / take);
  const previous = page > 1 ? page - 1 : null;
  const next = page < totalPages ? page + 1 : null;
  const orderConfig = orderBy ? { [orderBy]: order?.toLowerCase() } : undefined
  const activities = await prisma.activities.findMany({
    where: { deletedAt: null, completedAt: null, typeId: typeConfig },
    skip: skip,
    take: take,
    include: { 
      address: { omit: { activityId: true, id: true } },
      creator: { select: {id: true, name: true, avatar: true} },
      type: { select: { name: true } },
    },
    orderBy: orderConfig,
    omit: { creatorId: true, typeId: true, deletedAt: true, confirmationCode: true },
  });

  return { page, pageSize, totalActivities, totalPages, previous, next, activities };
};

export const getAllActivities = async (types: Array<string>, orderBy?: string, order?: string ) => {
  const orderConfig = orderBy ? { [orderBy]: order?.toLowerCase() } : undefined
  const typeConfig = types.length > 0 ? { in: types } : undefined
  return await prisma.activities.findMany({ 
    where: { deletedAt: null, completedAt: null, typeId: typeConfig }, 
    include: { 
      address: { omit: { activityId: true, id: true } }, 
      creator: { select: {id: true, name: true, avatar: true} },
      type: { select: { name: true } },
    },
    orderBy: orderConfig,
    omit: { creatorId: true, typeId: true, deletedAt: true, confirmationCode: true },
  });
};

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
      type: { select: { name: true } },
      _count: { select: { ActivityParticipants: true } }
    },
    skip: skip,
    take: take,
    omit: { creatorId: true, typeId: true, deletedAt: true },
  });
  // Cria um novo campo participantCount no json para retornar a quantidade de participantes e remove o campo _count criado pelo prisma
  const activities = result.map((activity) => {
    const parsedActivity : any = { 
      ...activity, 
      type: activity.type.name,
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
      _count: { select: { ActivityParticipants: true } },
      type: { select: { name: true } },
    },
    omit: { creatorId: true, typeId: true, deletedAt: true },
   });
  const activities = result.map((activity) => {
    const parsedActivity : any = { 
      ...activity, 
      type: activity.type.name,
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
      type: { select: { name: true } }, 
      creator: { select: {id: true, name: true, avatar: true} },
      _count: { select: { ActivityParticipants: true } }
    },
    omit: { creatorId: true, deletedAt: true, confirmationCode: true, typeId: true },
  });
  const activities = result.map((activity) => {
    const parsedActivity : any = { 
      ...activity, 
      type: activity.type.name,
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
      type: { select: { name: true } }, 
      creator: { select: {id: true, name: true, avatar: true} },
      _count: { select: { ActivityParticipants: true } }
    },
    omit: { creatorId: true, deletedAt: true, confirmationCode: true, typeId: true },
  });
  const activities = result.map((activity) => {
    const parsedActivity : any = { 
      ...activity, 
      type: activity.type.name,
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
    include: { 
      address: { omit: { activityId: true, id: true } },
      creator: { select: {id: true, name: true, avatar: true} },
      type: { select: { name: true } },
     },
     omit: { creatorId: true, typeId: true, deletedAt: true },
  });
  const parsedActivity : any = { 
    ...activity, 
    type: activity.type.name,
  };
  return parsedActivity;
};

export const getActivityById = async (id: string) => {
  return await prisma.activities.findUnique({ where: { id, deletedAt: null } });
}

export const update = async (id: string, data: any) => {
  const address = data.address ? { update: { latitude: data.address.latitude, longitude: data.address.longitude } } : undefined;
  const activity = await prisma.activities.update({ 
    where: { id, deletedAt: null }, 
    include: { 
      address: { omit: { activityId: true, id: true }}, 
      creator: {select: {id: true, name: true, avatar: true}},
      type: { select: { name: true } },
    }, 
    omit: { creatorId: true, typeId: true, deletedAt: true },
    data: {...data, address}
  });
  const parsedActivity : any = { 
    ...activity, 
    type: activity.type.name,
  };
  return parsedActivity;
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

export const checkIfConcludedAny = async (userId: string) => {
  return await prisma.activities.findFirst({ where: { creatorId: userId, completedAt: { not: null } } });
};