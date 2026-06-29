import { IUserService } from "../interfaces/IUserService";
import { UserService } from "../services/user.service";
import { UserRepository } from "../repositories/user.repository";

export interface Context {
  userService: IUserService;
}

export async function createContext(): Promise<Context> {
  const userRepository = new UserRepository();
  const userService = new UserService(userRepository);

  return { userService };
}
