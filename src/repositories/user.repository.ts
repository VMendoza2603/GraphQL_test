import { UserModel, IUserDocument } from "../models/User.model";
import { IUserRepository, UserData, CreateUserInput, UpdateUserInput } from "../interfaces/IUserRepository";

function toUserData(doc: IUserDocument): UserData {
  return {
    id: doc._id.toString(),
    name: doc.name,
    email: doc.email,
    age: doc.age,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export class UserRepository implements IUserRepository {
  async findAll(): Promise<UserData[]> {
    const docs = await UserModel.find().sort({ createdAt: -1 });
    return docs.map(toUserData);
  }

  async findById(id: string): Promise<UserData | null> {
    const doc = await UserModel.findById(id);
    return doc ? toUserData(doc) : null;
  }

  async findByEmail(email: string): Promise<UserData | null> {
    const doc = await UserModel.findOne({ email });
    return doc ? toUserData(doc) : null;
  }

  async create(data: CreateUserInput): Promise<UserData> {
    const doc = await UserModel.create(data);
    return toUserData(doc);
  }

  async update(id: string, data: UpdateUserInput): Promise<UserData> {
    const doc = await UserModel.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!doc) throw new Error("User not found");
    return toUserData(doc);
  }

  async delete(id: string): Promise<UserData> {
    const doc = await UserModel.findByIdAndDelete(id);
    if (!doc) throw new Error("User not found");
    return toUserData(doc);
  }
}
