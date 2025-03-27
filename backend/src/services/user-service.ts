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
import HttpResponseError from "../errors/HttpResponseError";
import HttpStatus from "../enum/httpStatus";
import { uploadImage } from "../connection/s3-client";

const uuid = z.string().uuid();

export const getUserService = async (id: string) => {
  uuid.parse(id);
  return await getUser(id);
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
  id: string,
  preferences: DefinePreferencesData
) => {
  // TODO: not allow duplicates and unexsisting types
  uuid.parse(id);
  definePreferencesSchema.parse(preferences);
  preferences.forEach(async (preference) => {
    await defineUserPreference(id, preference.typeId);
  });
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
  return await updateUser(id, data);
};

export const deactivateUserService = async (id: string) => {
  uuid.parse(id);
  const { deletedAt } = await getUser(id);
  if (deletedAt) {
    throw new HttpResponseError(HttpStatus.FORBIDDEN, "Esta conta foi desativada e não pode ser utilizada.");
  }
  const current = new Date();
  const date = new Date(current.getTime() - current.getTimezoneOffset() * 60000);
  return await deactivateUser(id, date);
};

export const registerUser = async (data: CreateUserData) => {
  createUserSchema.parse(data);
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
  const avatar = `${process.env.S3_ENDPOINT}/${process.env.BUCKET_NAME}/default-avatar.png`;
  return await createUser(data, avatar);
};
