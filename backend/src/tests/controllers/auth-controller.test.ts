import { describe, expect, test, jest } from "@jest/globals";
import request from "supertest";
import express, { json } from "express";
import authRouter from "../../routes/auth-routes";
import errorHandler from "../../middlewares/error-handler";
import { SignInData } from "../../types/auth-types";
import HttpStatus from "../../enum/httpStatus";
import HttpResponseError from "../../errors/HttpResponseError";
import { CreateUserData, createUserSchema } from "../../types/user-types";

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
  password: "123456",
  avatar: "avatar",
  xp: 0,
  level: 1,
  achievements: [],
};

jest.mock("../../services/auth-service", () => ({
  signIn: jest.fn((data: SignInData) => {
    if (!data.password || !data.email) {
      throw new HttpResponseError(
        HttpStatus.BAD_REQUEST,
        "Informe os campos obrigatórios corretamente."
      );
    } else if (data.email === "algumacoisaai@gmail.com") {
      throw new HttpResponseError(
        HttpStatus.NOT_FOUND,
        "Usuário não encontrado."
      );
    } else if (data.email === "deactivated@gmail.com") {
      throw new HttpResponseError(
        HttpStatus.FORBIDDEN,
        "Esta conta foi desativada e não pode ser utilizada."
      );
    } else if (data.password !== mockUser.password) {
      throw new HttpResponseError(HttpStatus.UNAUTHORIZED, "Senha incorreta.");
    } else {
      return mockUser;
    }
  }),
}));

jest.mock("../../services/user-service", () => ({
  registerUser: jest.fn((data: CreateUserData) => {
    data = createUserSchema.parse(data);
    if (data.email === "joao@gmail.com") {
      throw new HttpResponseError(
        HttpStatus.CONFLICT,
        "O e-mail ou CPF informado já pertence a outro usuário."
      );
    } else if (data.cpf === "11123943211") {
      throw new HttpResponseError(
        HttpStatus.CONFLICT,
        "O e-mail ou CPF informado já pertence a outro usuário."
      );
    } else {
      return mockUser;
    }
  }),
}));

describe("auth-controller", () => {
  describe("POST /auth/sign-in", () => {
    test("Should return 200 when user provides email and password", async () => {
      const response = await request(server).post("/auth/sign-in").send({
        email: "pedro@gmail.com",
        password: "123456",
      });
      expect(response.body).toEqual(mockUser);
      expect(response.status).toBe(HttpStatus.OK);
    });

    test("Should return 400 when user provides invalid email or password", async () => {
      const response = await request(server).post("/auth/sign-in").send({
        email: "pedro@gmail.com",
      });
      expect(response.body).toEqual({
        error: "Informe os campos obrigatórios corretamente.",
      });
      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    });

    test("Should return 404 when user is not found", async () => {
      const response = await request(server).post("/auth/sign-in").send({
        email: "algumacoisaai@gmail.com",
        password: "asdklcdasd",
      });
      expect(response.body).toEqual({ error: "Usuário não encontrado." });
      expect(response.status).toBe(HttpStatus.NOT_FOUND);
    });

    test("Should return 403 when user is deactivated", async () => {
      const response = await request(server).post("/auth/sign-in").send({
        email: "deactivated@gmail.com",
        password: "asdklcdasd",
      });
      expect(response.body).toEqual({
        error: "Esta conta foi desativada e não pode ser utilizada.",
      });
      expect(response.status).toBe(HttpStatus.FORBIDDEN);
    });

    test("Should return 401 when user is deactivated", async () => {
      const response = await request(server).post("/auth/sign-in").send({
        email: "pedro@gmail.com",
        password: "asdklcdasd",
      });
      expect(response.body).toEqual({ error: "Senha incorreta." });
      expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    });
  });

  describe("POST /auth/register", () => {
    test("Should return 201 when user registers successfully", async () => {
      const response = await request(server).post("/auth/register").send({
        name: "pedro",
        email: "pedro@gmail.com",
        cpf: "41304191029",
        password: "123456",
      });
      expect(response.body).toEqual({ message: "Usuário criado com sucesso." });
      expect(response.status).toBe(HttpStatus.CREATED);
    });

    test("Should return 400 when user provides invalid data", async ()=> {
      const response = await request(server).post("/auth/register").send({
        name: "joao",
        email: "joao@gmail.com",
        password: "123456",
      });
      expect(response.body).toEqual({ error: "Informe os campos obrigatórios corretamente." });
      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    })
    test("Should return 409 when user provides an email that already belongs to another user", async () => {
      const response = await request(server).post("/auth/register").send({
        name: "joao",
        email: "joao@gmail.com",
        cpf: "11123943211",
        password: "123456",
      });
      expect(response.body).toEqual({ error: "O e-mail ou CPF informado já pertence a outro usuário." });
      expect(response.status).toBe(HttpStatus.CONFLICT);
    })
    test("Should return 409 when user provides a CPF that already belongs to another user", async () => {
      const response = await request(server).post("/auth/register").send({
        name: "teste",
        email: "teste@gmail.com",
        cpf: "11123943211",
        password: "123456",
      });
      expect(response.body).toEqual({ error: "O e-mail ou CPF informado já pertence a outro usuário." });
      expect(response.status).toBe(HttpStatus.CONFLICT);
    })
  });
});
