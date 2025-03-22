import {
  getUser,
  getUserPreferences,
  defineUserPreferences,
  updateUser,
  updateUserAvatar,
  deactivateUser,
  getUserByEmail,
  createUser,
  getUserByCpf,
} from "../repository/user-repository";
import bcrypt from "bcryptjs";
import { CreateUserData, createUserSchema } from "../types/user-types";
import z from "zod";

const uuid = z.string().uuid();

export const getUserService = async (id: string) => {
  uuid.parse(id);
  return await getUser(id);
};

export const getUserPreferencesService = async (id: string) => {
  uuid.parse(id);
  return await getUserPreferences(id);
};

// dúvida sobre o body da requisição
export const defineUserPreferencesService = async (
  id: string,
  preferences: any
) => {
  uuid.parse(id);
  return await defineUserPreferences(id, preferences);
};

export const updateUserAvatarService = async (id: string, avatar: string) => {
  uuid.parse(id);
  return await updateUserAvatar(id, avatar);
};

export const updateUserService = async (id: string, data: any) => {
  uuid.parse(id);
  return await updateUser(id, data);
};

export const deactivateUserService = async (id: string) => {
  uuid.parse(id);
  return await deactivateUser(id);
};

export const registerUser = async (data: CreateUserData) => {
  createUserSchema.parse(data);
  let possibleUser = await getUserByEmail(data.email);
  if (possibleUser) {
    throw new Error("Já existe uma conta com esse email");
  }
  possibleUser = await getUserByCpf(data.cpf);
  if (possibleUser) {
    throw new Error("Já existe uma conta com esse cpf");
  }

  const encryptedPassword = await bcrypt.hash(data.password, 10);
  data.password = encryptedPassword;

  return await createUser(data);
};
