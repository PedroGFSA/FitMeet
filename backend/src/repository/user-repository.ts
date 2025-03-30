import prisma from "../connection/prisma-client";


export const getUser = async (id: string) => {
  return await prisma.users.findUnique({ where: { id }, include: { achievements: { include: { achievement: true } } } });
};

export const updateUserAvatar = async (id: string, avatar: string) => {
  return await prisma.users.update({
    where: { id, deletedAt: null },
    data: { avatar },
    select: { avatar: true },
  });
};

export const updateUser = async (id: string, data: any) => {
  return await prisma.users.update({
    where: { id, deletedAt: null },
    data,
    omit: { deletedAt: true }
  });
};

export const deactivateUser = async (id: string, deletedAt: Date) => {
  return await prisma.users.update({
    where: { id },
    data: { deletedAt: deletedAt.toISOString() },
  });
};

export const getUserByEmail = async (email: string) => {
  return await prisma.users.findUnique({ where: { email }, include: { achievements: true } });
};

export const getUserByCpf = async (cpf: string) => {
  return await prisma.users.findUnique({ where: { cpf } });
};

export const createUser = async (data: any, avatar: string) => {
  return await prisma.users.create({
    data: {...data, avatar},
  });
}
