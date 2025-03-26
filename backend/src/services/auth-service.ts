import { signInSchema, SignInData } from "../types/auth-types";
import { getUserByEmail } from "../repository/user-repository";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import HttpResponseError from "../errors/HttpResponseError";
import HttpStatus from "../enum/httpStatus";

export const signIn = async (data: SignInData) => {
  const { email, password } = signInSchema.parse(data);
  const user = await getUserByEmail(email);
  if (!user) {
    throw new HttpResponseError(HttpStatus.NOT_FOUND, "Usuário não encontrado.");
  }
  if (user.deletedAt) {
    throw new HttpResponseError(HttpStatus.FORBIDDEN, "Esta conta foi desativada e não pode ser utilizada.");
  }
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new HttpResponseError(HttpStatus.UNAUTHORIZED, "Senha incorreta.");
  }
  
  const token = jwt.sign(user, process.env.JWT_SECRET!, { expiresIn: '1d' });
  return {token, ...user};
};

