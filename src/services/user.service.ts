import { UserData } from "../interfaces/IUserRepository";
import { IUserRepository } from "../interfaces/IUserRepository";
import { IUserService, CreateUserInput, UpdateUserInput } from "../interfaces/IUserService";
import { AppError } from "../errors/AppError";
import { ErrorCodes } from "../errors/errorCodes";
import {
  validateCreateUserInput,
  validateUpdateUserInput,
} from "../validations/user.validation";

export class UserService implements IUserService {
  constructor(private readonly userRepository: IUserRepository) {}

  async findAll(): Promise<UserData[]> {
    return this.userRepository.findAll();
  }

  async findById(id: string): Promise<UserData> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new AppError(
        `Usuario con id '${id}' no encontrado`,
        ErrorCodes.USER_NOT_FOUND,
        404
      );
    }
    return user;
  }

  async create(data: CreateUserInput): Promise<UserData> {
    validateCreateUserInput(data);

    const existing = await this.userRepository.findByEmail(data.email);
    if (existing) {
      throw new AppError(
        `Ya existe un usuario con el email '${data.email}'`,
        ErrorCodes.USER_ALREADY_EXISTS,
        409
      );
    }

    return this.userRepository.create(data);
  }

  async update(id: string, data: UpdateUserInput): Promise<UserData> {
    await this.findById(id);
    validateUpdateUserInput(data);

    if (data.email) {
      const existing = await this.userRepository.findByEmail(data.email);
      if (existing && existing.id !== id) {
        throw new AppError(
          `Ya existe un usuario con el email '${data.email}'`,
          ErrorCodes.USER_ALREADY_EXISTS,
          409
        );
      }
    }

    return this.userRepository.update(id, data);
  }

  async delete(id: string): Promise<UserData> {
    await this.findById(id);
    return this.userRepository.delete(id);
  }
}
