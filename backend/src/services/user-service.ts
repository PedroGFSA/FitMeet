import {
  getUser,
  updateUser,
  updateUserAvatar,
  deactivateUser,
  getUserByEmail,
  createUser,
  getUserByCpf,
} from "../repository/user-repository";
import bcrypt from "bcryptjs";
import {
  CreateUserData,
  createUserSchema,
  definePreferencesSchema,
  DefinePreferencesData,
  updateUserAvatarSchema,
  UpdateUserAvatarData,
  updateUserSchema,
  UpdateUserData
} from "../types/user-types";
import z from "zod";
import HttpResponseError from "../errors/HttpResponseError";
import HttpStatus from "../enum/httpStatus";
import { uploadImage } from "../connection/s3-client";
import { getTypeById } from "../repository/activityTypes-repository";
import { defineUserPreference, getSingleUserPreference, getUserPreferences } from "../repository/preferences-repository";
import { getUserAchievements } from "../repository/userAchievement-repository";

const uuid = z.string().uuid();

export const getUserService = async (id: string) => {
  uuid.parse(id);
  const response: any = await getUser(id);
  delete response.deletedAt;
  const achievements = await getUserAchievements(id);
  response.achievements = achievements;
  return response;
};

export const getUserPreferencesService = async (id: string) => {
  uuid.parse(id);
  const preferences = await getUserPreferences(id) || [];
  const response = preferences.map((preference) => {
    return {
      typeId: preference.typeId,
      typeName: preference.type.name,
      typeDescription: preference.type.description,
    }
  });
  return response;
};

export const defineUserPreferencesService = async (
  userId: string,
  preferences: DefinePreferencesData
) => {
  uuid.parse(userId);
  preferences = definePreferencesSchema.parse(preferences);
  await Promise.all(preferences.map(async (typeId) => {
    const type = await getTypeById(typeId);
    if (!type) {
      throw new HttpResponseError(HttpStatus.BAD_REQUEST, "Um ou mais IDs informados são inválidos.");
    }
    const existingPreference = await getSingleUserPreference(userId, typeId);
    if (!existingPreference) {
      await defineUserPreference(userId, typeId);
    }
  }));
  return;
};

export const updateUserAvatarService = async (id: string, data?: Express.Multer.File) => {
  uuid.parse(id);
  if (!data) {
    throw new HttpResponseError(HttpStatus.BAD_REQUEST, "Informe os campos obrigatórios corretamente.");
  }
  if (data.mimetype !== "image/jpeg" && data.mimetype !== "image/png") {
    throw new HttpResponseError(HttpStatus.BAD_REQUEST, "A imagem deve ser um arquivo PNG ou JPG.");
  }
  const url = await uploadImage(data);
  return await updateUserAvatar(id, url);
};

export const updateUserService = async (id: string, data: UpdateUserData) => {
  uuid.parse(id);
  data = updateUserSchema.parse(data);
  if (data.email) {
    const possibleUserWithEmail = await getUserByEmail(data.email);
    if (possibleUserWithEmail) throw new HttpResponseError(HttpStatus.CONFLICT, "Já existe uma conta com esse email");
  }
  if (data.password) {
    data.password =  await bcrypt.hash(data.password, 10)
  }
  const response: any = await updateUser(id, data);
  delete response.deletedAt;
  return response;
};

export const deactivateUserService = async (id: string) => {
  uuid.parse(id);
  const user = await getUser(id);
  if (!user) {
    throw new HttpResponseError(HttpStatus.NOT_FOUND, "Usuário não encontrado.");
  }
  if (user.deletedAt) {
    throw new HttpResponseError(HttpStatus.FORBIDDEN, "Esta conta foi desativada e não pode ser utilizada.");
  }
  const current = new Date();
  const date = new Date(current.getTime() - current.getTimezoneOffset() * 60000);
  return await deactivateUser(id, date);
};

export const registerUser = async (data: CreateUserData) => {
  data = createUserSchema.parse(data);
  const possibleUserWithEmail = await getUserByEmail(data.email);
  if (possibleUserWithEmail) {
    throw new HttpResponseError(HttpStatus.CONFLICT, "O e-mail ou CPF informado já pertence a outro usuário.");
  }
  const possibleUserWithCpf = await getUserByCpf(data.cpf);
  if (possibleUserWithCpf) {
    throw new HttpResponseError(HttpStatus.CONFLICT, "O e-mail ou CPF informado já pertence a outro usuário.");
  }

  const encryptedPassword = await bcrypt.hash(data.password, 10);
  data.password = encryptedPassword;
  const avatar = `${process.env.S3_ENDPOINT}/${process.env.BUCKET_NAME}/default-avatar.jpg`;
  return await createUser(data, avatar);
};

export const updateUserXpAndLevel = async (userId: string, xp: number) => {
  const user = await getUser(userId);
  if (!user) {
    throw new HttpResponseError(HttpStatus.NOT_FOUND, "Usuário não encontrado.");
  }
  if (user.deletedAt) {
    throw new HttpResponseError(HttpStatus.FORBIDDEN, "Esta conta foi desativada e não pode ser utilizada.");
  }

  const maxXpPerLevel = process.env.DEFAULT_MAX_XP_PER_LEVEL ? parseInt(process.env.DEFAULT_MAX_XP_PER_LEVEL) : 500;
  const currentXp = user.xp;

  if (currentXp + xp > maxXpPerLevel) {
    const newLevel = user.level + 1;
    const newXp = (currentXp + xp) % maxXpPerLevel;
    await updateUser(userId, { level: newLevel, xp: newXp });
  } else if (currentXp + xp < maxXpPerLevel) {
    const newXp = currentXp + xp;
    await updateUser(userId, { xp: newXp });
  } else {
    await updateUser(userId, { level: user.level + 1, xp: 0 });
  }
}