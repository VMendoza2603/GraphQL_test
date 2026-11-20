import { UserModel } from "../models/User.model";

const usuarios = [
  ["Ana Lucía Torres", 21, "ESTUDIANTE"],
  ["Bryan Zambrano", 23, "ESTUDIANTE"],
  ["Carla Moreira", 20, "ESTUDIANTE"],
  ["Daniel Vera", 24, "ESTUDIANTE"],
  ["Elena Cedeño", 22, "ESTUDIANTE"],
  ["Fernando Macías", 19, "ESTUDIANTE"],
  ["Gabriela Ponce", 25, "ESTUDIANTE"],
  ["Hugo Andrade", 45, "DOCENTE"],
  ["Isabel Loor", 38, "DOCENTE"],
  ["Jorge Villacís", 52, "DOCENTE"],
  ["Karla Intriago", 41, "DOCENTE"],
  ["Luis Alvarado", 34, "ADMINISTRATIVO"],
  ["María José Salazar", 29, "ADMINISTRATIVO"],
  ["Nicolás Quiroz", 47, "ADMINISTRATIVO"],
] as const;

const toEmail = (name: string) =>
  name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .split(" ")
    .filter((p) => p.length > 2)
    .slice(0, 2)
    .join(".") + "@universidad.edu.ec";

// Restaura los datos de ejemplo. Lo usan `npm run seed` y el cron diario de Vercel.
export async function seedDatabase() {
  await UserModel.deleteMany({});
  await UserModel.insertMany(usuarios.map(([name, age, role]) => ({ name, email: toEmail(name), age, role })));
  return { users: usuarios.length };
}
