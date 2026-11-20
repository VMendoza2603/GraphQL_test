import { UserService } from "../../services/user.service";
import type { UserData } from "../../repositories/user.repository";

export interface Context {
  userService: UserService;
}

export const userResolvers = {
  Query: {
    usuarios: (_: unknown, args: Record<string, unknown>, { userService }: Context) => userService.list(args),
    usuario: (_: unknown, { id }: { id: string }, { userService }: Context) => userService.findById(id),
    estadisticas: (_: unknown, __: unknown, { userService }: Context) => userService.stats(),
  },

  Mutation: {
    crearUsuario: (_: unknown, { data }: { data: unknown }, { userService }: Context) => userService.create(data),
    actualizarUsuario: (_: unknown, { id, data }: { id: string; data: unknown }, { userService }: Context) =>
      userService.update(id, data),
    eliminarUsuario: (_: unknown, { id }: { id: string }, { userService }: Context) => userService.delete(id),
  },

  User: {
    createdAt: (user: UserData) => user.createdAt.toISOString(),
    updatedAt: (user: UserData) => user.updatedAt.toISOString(),
  },
};
