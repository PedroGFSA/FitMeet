import prisma from "../connection/prisma-client";

export const getAllActivitiesUserParticipant = async (userId: string) => {
  return await prisma.activities.findMany({ 
    where: { ActivityParticipants: { some: { userId } }, deletedAt: null },
    include: { address: true }, 
  });
}

export const getAllActivityParticipants = async (activityId: string) => {
  return await prisma.activityParticipants.findMany({ 
    where: { activityId },
    select: {
      id: true,
      userId: true,
      approved: true,
      confirmedAt: true,
      user: {
        select: {
          name: true,
          avatar: true
        }
      }
    }
   });
}

export const checkIfAlreadySubcribed = async (activityId: string, userId: string) => {
  return await prisma.activityParticipants.findFirst({ where: { activityId, userId } });
}

export const subscribe = async (userId: string, activityId: string, approved: boolean) => {
  return await prisma.activityParticipants.create({ data: { activityId, userId, approved } });
}

export const getActivityParticipant = async (activityId: string, userId: string) => {
  return await prisma.activityParticipants.findFirst({ where: { activityId, userId } });
}

export const approveParticipantForActivity = async (id: string, approved: boolean) => {
  return await prisma.activityParticipants.update({ 
    where: {  id },
    data: { approved } 
  });
}

export const checkIn = async (id: string) => {
  const current = new Date();
  const date = new Date(current.getTime() - current.getTimezoneOffset() * 60000);
  return await prisma.activityParticipants.update({ where: { id }, data: { confirmedAt: date } });
}

export const unsubscribe = async (id: string) => {
  return await prisma.activityParticipants.delete({ where: { id } });
}