import { afterAll, beforeAll, beforeEach, describe, expect, test } from "vitest";
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../src/app";
import { connectDatabase, disconnectDatabase } from "../src/database/connection";
import { seedDatabase } from "../src/database/seed-data";

let mongo: MongoMemoryServer;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  await connectDatabase(mongo.getUri());
});
afterAll(async () => {
  await disconnectDatabase();
  await mongo.stop();
});
beforeEach(() => seedDatabase());

const gql = (query: string, variables?: Record<string, unknown>) =>
  request(app).post("/graphql").send({ query, variables });

const LIST = `query ($page: Int, $limit: Int, $search: String, $role: Rol, $orderBy: OrdenUsuarios) {
  usuarios(page: $page, limit: $limit, search: $search, role: $role, orderBy: $orderBy) {
    total page totalPages items { id name email age role }
  }
}`;
const CREATE = `mutation ($data: CreateUserInput!) { crearUsuario(data: $data) { id name email age role } }`;
const nuevo = { name: "Rosa Chávez", email: "rosa@universidad.edu.ec", age: 30, role: "DOCENTE" };

describe("Consultas", () => {
  test("lista paginada", async () => {
    const res = await gql(LIST, { limit: 5 });
    expect(res.body.errors).toBeUndefined();
    expect(res.body.data.usuarios).toMatchObject({ total: 14, page: 1, totalPages: 3 });
    expect(res.body.data.usuarios.items).toHaveLength(5);
  });

  test("filtra por rol y ordena por edad", async () => {
    const res = await gql(LIST, { role: "DOCENTE", orderBy: "EDAD", limit: 50 });
    const ages = res.body.data.usuarios.items.map((u: { age: number }) => u.age);
    expect(res.body.data.usuarios.items.every((u: { role: string }) => u.role === "DOCENTE")).toBe(true);
    expect(ages).toEqual([...ages].sort((a, b) => a - b));
  });

  test("la búsqueda es literal (sin inyección de regex)", async () => {
    const literal = await gql(LIST, { search: ".*" });
    const real = await gql(LIST, { search: "zambrano" });
    expect(literal.body.data.usuarios.total).toBe(0);
    expect(real.body.data.usuarios.total).toBe(1);
  });

  test("rechaza límites abusivos de paginación", async () => {
    const res = await gql(LIST, { limit: 100000 });
    expect(res.body.errors[0].extensions.code).toBe("VALIDATION_ERROR");
  });

  test("estadísticas por rol", async () => {
    const res = await gql("{ estadisticas { total edadPromedio porRol { role total } } }");
    const { total, porRol } = res.body.data.estadisticas;
    expect(total).toBe(14);
    expect(porRol.find((r: { role: string }) => r.role === "ESTUDIANTE").total).toBe(7);
  });

  test("usuario inexistente: USER_NOT_FOUND; ID mal formado: VALIDATION_ERROR", async () => {
    const missing = await gql('{ usuario(id: "507f1f77bcf86cd799439011") { id } }');
    const bad = await gql('{ usuario(id: "abc") { id } }');
    expect(missing.body.errors[0].extensions.code).toBe("USER_NOT_FOUND");
    expect(bad.body.errors[0].extensions.code).toBe("VALIDATION_ERROR");
  });
});

describe("Mutaciones", () => {
  test("crea, actualiza y elimina", async () => {
    const created = await gql(CREATE, { data: nuevo });
    const id = created.body.data.crearUsuario.id;
    const updated = await gql(
      `mutation ($id: ID!) { actualizarUsuario(id: $id, data: { age: 31 }) { age } }`,
      { id }
    );
    const removed = await gql(`mutation ($id: ID!) { eliminarUsuario(id: $id) { id } }`, { id });
    expect(updated.body.data.actualizarUsuario.age).toBe(31);
    expect(removed.body.data.eliminarUsuario.id).toBe(id);
  });

  test("normaliza el email y rechaza duplicados", async () => {
    await gql(CREATE, { data: { ...nuevo, email: "  ROSA@Universidad.edu.ec " } });
    const dup = await gql(CREATE, { data: nuevo });
    expect(dup.body.errors[0].extensions.code).toBe("USER_ALREADY_EXISTS");
  });

  test.each([
    ["edad negativa", { age: -1 }],
    ["edad decimal", { age: 20.5 }],
    ["email inválido", { email: "no-es-email" }],
    ["nombre vacío", { name: " " }],
  ])("rechaza %s", async (_, override) => {
    const res = await gql(CREATE, { data: { ...nuevo, ...override } });
    expect(res.body.errors).toBeDefined();
  });

  test("la edición también valida", async () => {
    const list = await gql(LIST, { limit: 1 });
    const id = list.body.data.usuarios.items[0].id;
    const res = await gql(`mutation ($id: ID!) { actualizarUsuario(id: $id, data: { age: 500 }) { age } }`, { id });
    expect(res.body.errors[0].extensions.code).toBe("VALIDATION_ERROR");
  });
});

describe("Seguridad y plataforma", () => {
  test("bloquea peticiones sin preflight (protección CSRF de Apollo)", async () => {
    const res = await request(app).get("/graphql?query={estadisticas{total}}");
    expect(res.status).toBe(400);
  });

  test("rechaza consultas demasiado grandes", async () => {
    const res = await gql(`{ estadisticas { total } } # ${"x".repeat(60 * 1024)}`);
    expect(res.status).toBe(413);
  });

  test("cabeceras de seguridad", async () => {
    const res = await request(app).get("/health");
    expect(res.headers["x-content-type-options"]).toBe("nosniff");
    expect(res.headers["x-powered-by"]).toBeUndefined();
    expect(res.body).toMatchObject({ status: "ok", database: "connected" });
  });

  test("el cron exige el secreto y restaura los datos", async () => {
    await gql(CREATE, { data: nuevo });
    const denied = await request(app).get("/api/cron/reset-demo").set("Authorization", "Bearer otro");
    const ok = await request(app).get("/api/cron/reset-demo").set("Authorization", "Bearer secreto-cron-pruebas");
    expect(denied.status).toBe(401);
    expect(ok.body.users).toBe(14);
  });
});
