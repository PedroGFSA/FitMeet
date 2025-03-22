import prisma from "../connection/prisma-client";
import bcrypt from "bcryptjs";

export const getUser = async (id: string) => {
  return await prisma.users.findUnique({ where: { id, deletedAt: null }, include: { UserAchievements: true} });
};

export const getUserPreferences = async (id: string) => {
  return await prisma.users.findUnique({ where: { id, deletedAt: null } }).preferences();
} 

export const defineUserPreferences = async (id: string, preferences : any) => {
  return await prisma.users.update({
    where: { id, deletedAt: null },
    data: preferences,
  });
};

export const updateUserAvatar = async (id: string, avatar: string) => {
  return await prisma.users.update({
    where: { id, deletedAt: null },
    data: { avatar },
  });
};

export const updateUser = async (id: string, data: any) => {
  return await prisma.users.update({
    where: { id, deletedAt: null },
    data,
  });
};

export const deactivateUser = async (id: string) => {
  return await prisma.users.update({
    where: { id },
    data: { deletedAt: new Date().toISOString() },
  });
};

export const getUserByEmail = async (email: string) => {
  return await prisma.users.findUnique({ where: { email } });
};

export const getUserByCpf = async (cpf: string) => {
  return await prisma.users.findUnique({ where: { cpf } });
};

export const createUser = async (data: any) => {
  const password = await bcrypt.hash(data.password, 5);
  return await prisma.users.create({
    data: { ...data, password },
  });
}