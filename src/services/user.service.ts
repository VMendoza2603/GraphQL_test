import { AppError } from "../errors/AppError";
import { ErrorCodes } from "../errors/errorCodes";
import { UserRepository, UserData, UserPage, UserStats } from "../repositories/user.repository";
import { createUserSchema, listUsersSchema, objectId, parse, updateUserSchema } from "./user.validation";

const notFound = (id: string) => new AppError(`Usuario con id '${id}' no encontrado`, ErrorCodes.USER_NOT_FOUND, 404);
const duplicated = (email: string) =>
  new AppError(`Ya existe un usuario con el email '${email}'`, ErrorCodes.USER_ALREADY_EXISTS, 409);

export class UserService {
  constructor(private readonly repo: UserRepository = new UserRepository()) {}

  list(args: unknown): Promise<UserPage> {
    return this.repo.findPage(parse(listUsersSchema, args ?? {}));
  }

  async findById(rawId: string): Promise<UserData> {
    const id = parse(objectId, rawId);
    const user = await this.repo.findById(id);
    if (!user) throw notFound(id);
    return user;
  }

  async create(input: unknown): Promise<UserData> {
    const data = parse(createUserSchema, input);
    if (await this.repo.findByEmail(data.email)) throw duplicated(data.email);
    return this.repo.create(data);
  }

  async update(rawId: string, input: unknown): Promise<UserData> {
    const id = parse(objectId, rawId);
    const data = parse(updateUserSchema, input);
    if (data.email) {
      const existing = await this.repo.findByEmail(data.email);
      if (existing && existing.id !== id) throw duplicated(data.email);
    }
    const user = await this.repo.update(id, data);
    if (!user) throw notFound(id);
    return user;
  }

  async delete(rawId: string): Promise<UserData> {
    const id = parse(objectId, rawId);
    const user = await this.repo.delete(id);
    if (!user) throw notFound(id);
    return user;
  }

  stats(): Promise<UserStats> {
    return this.repo.stats();
  }
}
