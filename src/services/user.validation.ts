import { z } from "zod";
import { ROLES } from "../models/User.model";
import { AppError } from "../errors/AppError";
import { ErrorCodes } from "../errors/errorCodes";

const name = z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres").max(100, "El nombre es demasiado largo");
const email = z.string().trim().toLowerCase().pipe(z.email("El email no tiene un formato válido").max(254));
const age = z.number().int("La edad debe ser un entero").min(0, "La edad debe estar entre 0 y 150").max(150, "La edad debe estar entre 0 y 150");
const role = z.enum(ROLES);

export const objectId = z.string().regex(/^[a-f\d]{24}$/i, "ID inválido");

export const createUserSchema = z.object({ name, email, age, role: role.optional() });
export const updateUserSchema = z
  .object({ name, email, age, role })
  .partial()
  .refine((d) => Object.keys(d).length > 0, "No hay campos para actualizar");

export const listUsersSchema = z.object({
  page: z.number().int().min(1).max(10000).default(1),
  limit: z.number().int().min(1, "El límite mínimo es 1").max(50, "El límite máximo es 50").default(10),
  search: z.string().trim().max(100).optional(),
  role: role.optional(),
  orderBy: z.enum(["NOMBRE", "EDAD", "RECIENTES"]).default("RECIENTES"),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type ListUsersInput = z.infer<typeof listUsersSchema>;

// Convierte la validación de zod en un error GraphQL con código VALIDATION_ERROR
export function parse<T>(schema: z.ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new AppError(result.error.issues.map((i) => i.message).join(". "), ErrorCodes.VALIDATION_ERROR, 400);
  }
  return result.data;
}
