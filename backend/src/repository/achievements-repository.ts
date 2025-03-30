import prisma from '../connection/prisma-client'

export const getAchievementByName = async (name: string) => {
  return await prisma.achievements.findFirst({ where: { name } })
}