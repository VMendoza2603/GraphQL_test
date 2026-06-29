export interface UserData {
  id: string;
  name: string;
  email: string;
  age: number;
  createdAt: Date;
  updatedAt: Date;
}

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

export interface IUserRepository {
  findAll(): Promise<UserData[]>;
  findById(id: string): Promise<UserData | null>;
  findByEmail(email: string): Promise<UserData | null>;
  create(data: CreateUserInput): Promise<UserData>;
  update(id: string, data: UpdateUserInput): Promise<UserData>;
  delete(id: string): Promise<UserData>;
}
