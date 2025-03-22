import { signInSchema, SignInData } from "../types/auth-types";
import { getUserByEmail } from "../repository/user-repository";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const signIn = async (data: SignInData) => {
  const { email, password } = signInSchema.parse(data);
  const user = await getUserByEmail(email);
  if (!user) {
    throw new Error("Usuário não encontrado.");
  }
  if (user.deletedAt) {
    throw new Error("Esta conta foi desativada e não pode ser utilizada.");
  }
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error("Senha incorreta");
  }
  
  const token = jwt.sign(user, process.env.JWT_SECRET!, { expiresIn: '1d' });
  return {token, ...user};
};

