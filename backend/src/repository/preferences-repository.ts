import prisma from "../connection/prisma-client";

export const getUserPreferences = async (id: string) => {
  return await prisma.preferences.findMany({ 
    where: { userId: id }, 
    include: { type: { select: { name: true, description : true}} }, 
    omit: { id: true, userId: true }
  });
} 

export const getSingleUserPreference = async (id: string, typeId: string) => {
  return await prisma.preferences.findFirst({ where: { userId: id, typeId } });
 }

export const defineUserPreference = async (id: string, activityTypeId : string) => {
  return await prisma.preferences.create({
    data: {
      userId: id,
      typeId: activityTypeId
    }
  })
};