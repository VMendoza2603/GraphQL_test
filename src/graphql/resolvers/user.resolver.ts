import { IUserService } from "../../interfaces/IUserService";

export const userResolvers = {
  Query: {
    usuarios: async (
      _: unknown,
      __: unknown,
      context: { userService: IUserService }
    ) => {
      return context.userService.findAll();
    },
    usuario: async (
      _: unknown,
      args: { id: string },
      context: { userService: IUserService }
    ) => {
      return context.userService.findById(args.id);
    },
  },

  Mutation: {
    crearUsuario: async (
      _: unknown,
      args: { data: { name: string; email: string; age: number } },
      context: { userService: IUserService }
    ) => {
      return context.userService.create(args.data);
    },
    actualizarUsuario: async (
      _: unknown,
      args: { id: string; data: { name?: string; email?: string; age?: number } },
      context: { userService: IUserService }
    ) => {
      return context.userService.update(args.id, args.data);
    },
    eliminarUsuario: async (
      _: unknown,
      args: { id: string },
      context: { userService: IUserService }
    ) => {
      return context.userService.delete(args.id);
    },
  },
};
