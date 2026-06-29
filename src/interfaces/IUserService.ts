import { UserData } from "./IUserRepository";

export interface CreateUserInput {
  name: string;
  email: string;
  age: number;
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
  age?: number;
}

export interface IUserService {
  findAll(): Promise<UserData[]>;
  findById(id: string): Promise<UserData>;
  create(data: CreateUserInput): Promise<UserData>;
  update(id: string, data: UpdateUserInput): Promise<UserData>;
  delete(id: string): Promise<UserData>;
}
