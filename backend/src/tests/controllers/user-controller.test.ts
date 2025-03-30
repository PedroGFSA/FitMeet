import { describe, expect, test, jest } from "@jest/globals";
import request from "supertest";
import express, { json } from "express";
import errorHandler from "../../middlewares/error-handler";
import HttpStatus from "../../enum/httpStatus";
import HttpResponseError from "../../errors/HttpResponseError";
import userRouter from "../../routes/user-routes";
import { DefinePreferencesData, definePreferencesSchema } from "../../types/user-types";

const server = express();
server.use(json());
server.use(userRouter);
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
  deletedAt: null,
  achievements: [],
};

const mockUserDeactivated = {
  token: "token2",
  id: "2",
  name: "pedro",
  email: "pedro@gmail.com",
  cpf: "22137195459",
  password: "123456",
  avatar: "avatar",
  xp: 0,
  level: 1,
  deletedAt: "2023-10-01T00:00:00.000Z",
  achievements: [],
};

jest.mock("jsonwebtoken", () => ({
  verify: jest.fn((token: string) => {
    if (token === "token") {
      return { id: "1" };
    } else if (token === "token2") {
      return { id: "2" };
    } else {
      throw new HttpResponseError(HttpStatus.UNAUTHORIZED, "Token inválido.");
    }
  }),
}))

jest.mock("../../services/user-service", () => ({
  getUserService: jest.fn((userId: string) => {
    if (userId === "1") {
      return mockUser;
    } else if (userId === "2") {
      return mockUserDeactivated;
    } else {
      throw new HttpResponseError(HttpStatus.NOT_FOUND, "Usuário não encontrado.");
    }
  }),
  getUserPreferencesService: jest.fn(() => {
    return [ {"typeId": "123", "typeName": "teste", "typeDescription": "Testes unitários"} ];
  }),
  defineUserPreferencesService: jest.fn((userId: string, preferences: DefinePreferencesData) => {
    if (preferences.includes("321")) {
      throw new HttpResponseError(HttpStatus.BAD_REQUEST, "Um ou mais IDs informados são inválidos.");
    } else if (!Array.isArray(preferences) || !preferences.every((value) => typeof value === "string")) {
      throw new HttpResponseError(HttpStatus.BAD_REQUEST, "Informe os campos obrigatórios corretamente.");
    } else if ( userId === '1'){
      return;
    } else {
      return;
    }
  }),
  updateUserAvatarService: jest.fn(() => mockUser),
  updateUserService: jest.fn(() => mockUser),
  deactivateUserService: jest.fn(() => {}),
}));

describe("user-controller", () => {
  describe("GET /user", () => {
    test("should return 200 and user data if authenticated", async () => {
      const response = await request(server)
        .get("/user")
        .set("Authorization", `Bearer ${mockUser.token}`);

      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body).toEqual(mockUser);
    });

    test("should return 401 if no token is provided", async () => {
      const response = await request(server).get("/user");

      expect(response.body).toEqual({
        error: "Autenticação necessária."
      })
      expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    });

    test("should return 401 if the token provided is invalid", async () => {
      const response = await request(server).get("/user").set("Authorization", `Bearer teste`);;

      expect(response.body).toEqual({
        error: "Autenticação necessária."
      })
      expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    });

    test("should return 403 if the user has been deactivated", async () => {
      const response = await request(server).get("/user").set("Authorization", `Bearer token2`);;

      expect(response.body).toEqual({
        error: "Esta conta foi desativada e não pode ser utilizada."
      })
      expect(response.status).toBe(HttpStatus.FORBIDDEN);
    });
  })

  describe("GET /user/preferences", () => {
    test("should return 200 and an array of preferences if authenticated", async () => {
      const response = await request(server)
        .get("/user/preferences")
        .set("Authorization", `Bearer ${mockUser.token}`);

      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body).toEqual([{"typeId": "123", "typeName": "teste", "typeDescription": "Testes unitários"}]);
    })
  })

  describe("POST /user/preferences/define", () => {
    test("should return 400 if theres is one or more invalid typeId", async () => {
      const response = await request(server)
        .post("/user/preferences/define")
        .set("Authorization", `Bearer ${mockUser.token}`)
        .send([
          "321",
          "456",
          "789"
        ]);

      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
      expect(response.body).toEqual({
        error: "Um ou mais IDs informados são inválidos."
      })
    })

    test("should return 200 if theres user is authenticated and preferences are valid", async () => {
      const response = await request(server)
        .post("/user/preferences/define")
        .set("Authorization", `Bearer ${mockUser.token}`)
        .send([
          "123",
          "456",
          "789"
        ]);

      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body).toEqual({
        message: "Preferências atualizadas com sucesso."
      })
    })

    test("should return 400 if preferences are in a invalid format", async () => {
      const response = await request(server)
        .post("/user/preferences/define")
        .set("Authorization", `Bearer ${mockUser.token}`)
        .send([1]);

      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
      expect(response.body).toEqual({
        error: "Informe os campos obrigatórios corretamente."
      })
    })
  })
})