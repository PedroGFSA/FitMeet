import { describe, expect, test, jest } from "@jest/globals";
import express, { json } from "express";
import authRouter from "../../routes/auth-routes";
import errorHandler from "../../middlewares/error-handler";
import { signIn } from "../../services/auth-service";
import HttpStatus from "../../enum/httpStatus";
import bcrypt from "bcryptjs";

const server = express();
server.use(json());
server.use(authRouter);
server.use(errorHandler);

const mockUser = {
  token: "token",
  id: "1",
  name: "pedro",
  email: "pedro@gmail.com",
  cpf: "22137195459",
  password: bcrypt.hash("123456", 10),
  avatar: "avatar",
  xp: 0,
  level: 1,
  deletedAt: null,
  achievements: [],
};

const mockUserDeactivated = {
  token: "token",
  id: "1",
  name: "joao",
  email: "joao@gmail.com",
  cpf: "22137295459",
  password: "123456",
  avatar: "avatar",
  xp: 0,
  level: 1,
  deletedAt: "2025-03-29 02:59:51.872",
  achievements: [],
};


jest.mock("../../repository/user-repository", () => ({
  getUserByEmail: jest.fn((email: string) => {
    if (email === "pedro@gmail.com") {
      return mockUser;
    } else if (email === "joao@gmail.com") {
      return mockUserDeactivated;
    } else {
      return null;
    }
  }),
}));

jest.mock("bcryptjs", () => ({
  compare: jest.fn((password: string, hashedPassword: string) => {
    return password === "123456";
  }),
  hash: jest.fn((password: string) => {
    return "hashed";
  }),
}));

jest.mock("jsonwebtoken", () => ({
  sign: jest.fn(() => "token")
}));

describe("auth-service", () => {
  describe("signIn", () => {
    test("Should throw HttpResponseError not found when user with email does not exist", async () => {
      await expect(
        signIn({ email: "cleiton@gmail.com", password: "1234567" })
      ).rejects.toThrowError(
        expect.objectContaining({
          message: "Usuário não encontrado.",
          statusCode: HttpStatus.NOT_FOUND,
        })
      );
    });

    test("Should throw HttpResponseError forbidden when user is deactivated", async () => {
      await expect(
        signIn({ email: "joao@gmail.com", password: "1234567" })
      ).rejects.toThrowError(
        expect.objectContaining({
          message: "Esta conta foi desativada e não pode ser utilizada.",
          statusCode: HttpStatus.FORBIDDEN,
        })
      );
    });
    test("Should throw HttpResponseError unauthorized when password is incorrect", async () => {
      await expect(
        signIn({ email: mockUser.email, password: "1234567" })
      ).rejects.toThrowError(
        expect.objectContaining({
          message: "Senha incorreta.",
          statusCode: HttpStatus.UNAUTHORIZED,
        })
      );
    });
    test("Should return user token and data when user provides valid email and password", async () => {
      await expect(
        signIn({ email: mockUser.email, password: "123456" })
      ).resolves.toEqual(mockUser)
    });
  });
});
