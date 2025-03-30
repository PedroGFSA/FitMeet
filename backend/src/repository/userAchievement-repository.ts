import prisma from "../connection/prisma-client";

export const grantAchievement = async (userId: string, achievementId: string) => {
  return await prisma.userAchievements.create({
    data: { userId, achievementId },
  });
}

export const getUserAchievements = async (userId: string) => {
  const userAchievements = await prisma.userAchievements.findMany({
    where: { userId },
    include: { achievement: true },
  });
  const achievements : Array<any> = userAchievements.map((userAchievement) => {
    return {
      name: userAchievement.achievement.name,
      criterion: userAchievement.achievement.criterion
    };
  });
  return achievements;
};

export const getSingleUserAchievement = async (userId: string, achievementId: string) => {
  return await prisma.userAchievements.findFirst({
    where: { userId, achievementId },
  });
}