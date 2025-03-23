import {
  getUser,
  getUserPreferences,
  defineUserPreference,
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

const uuid = z.string().uuid();

export const getUserService = async (id: string) => {
  uuid.parse(id);
  return await getUser(id);
};

export const getUserPreferencesService = async (id: string) => {
  uuid.parse(id);
  const preferences = await getUserPreferences(id) || [];
  return preferences;
};

export const defineUserPreferencesService = async (
  id: string,
  preferences: DefinePreferencesData
) => {
  // TODO: not allow duplicates
  uuid.parse(id);
  definePreferencesSchema.parse(preferences);
  preferences.forEach(async (preference) => {
    await defineUserPreference(id, preference.typeId);
  });
  return;
};

export const updateUserAvatarService = async (id: string, data: UpdateUserAvatarData) => {
  uuid.parse(id);
  updateUserAvatarSchema.parse(data); 
  return await updateUserAvatar(id, data.avatar);
};

export const updateUserService = async (id: string, data: UpdateUserData) => {
  uuid.parse(id);
  updateUserSchema.parse(data);
  if (data.email) {
    const possibleUserWithEmail = await getUserByEmail(data.email);
    if (possibleUserWithEmail) throw new Error("Já existe uma conta com esse email");
  }
  if (data.password) {
    data.password =  await bcrypt.hash(data.password, 10)
  }
  return await updateUser(id, data);
};

export const deactivateUserService = async (id: string) => {
  uuid.parse(id);
  const { deletedAt } = await getUser(id);
  if (deletedAt) {
    throw new Error("Esta conta foi desativada e não pode ser utilizada.");
  }
  const current = new Date();
  const date = new Date(current.getTime() - current.getTimezoneOffset() * 60000);
  return await deactivateUser(id, date);
};

export const registerUser = async (data: CreateUserData) => {
  createUserSchema.parse(data);
  const possibleUserWithEmail = await getUserByEmail(data.email);
  if (possibleUserWithEmail) {
    throw new Error("Já existe uma conta com esse email");
  }
  const possibleUserWithCpf = await getUserByCpf(data.cpf);
  if (possibleUserWithCpf) {
    throw new Error("Já existe uma conta com esse cpf");
  }

  const encryptedPassword = await bcrypt.hash(data.password, 10);
  data.password = encryptedPassword;

  return await createUser(data);
};
