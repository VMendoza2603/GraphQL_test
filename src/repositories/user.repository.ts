import { UserModel, IUserDocument, Rol } from "../models/User.model";
import type { CreateUserInput, ListUsersInput, UpdateUserInput } from "../services/user.validation";

export interface UserData {
  id: string;
  name: string;
  email: string;
  age: number;
  role: Rol;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPage {
  items: UserData[];
  total: number;
  page: number;
  totalPages: number;
}

export interface UserStats {
  total: number;
  edadPromedio: number;
  porRol: { role: Rol; total: number }[];
}

function toUserData(doc: IUserDocument): UserData {
  return {
    id: doc._id.toString(),
    name: doc.name,
    email: doc.email,
    age: doc.age,
    role: doc.role,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

// Escapa caracteres especiales: la búsqueda es literal (sin inyección de regex ni ReDoS)
const escapeRegex = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const SORT = {
  NOMBRE: { name: 1 },
  EDAD: { age: 1 },
  RECIENTES: { createdAt: -1 },
} as const;

export class UserRepository {
  async findPage({ page, limit, search, role, orderBy }: ListUsersInput): Promise<UserPage> {
    const filter: Record<string, unknown> = {};
    if (search) {
      const pattern = new RegExp(escapeRegex(search), "i");
      filter.$or = [{ name: pattern }, { email: pattern }];
    }
    if (role) filter.role = role;

    const [docs, total] = await Promise.all([
      UserModel.find(filter)
        .sort({ ...SORT[orderBy], _id: 1 })
        .skip((page - 1) * limit)
        .limit(limit),
      UserModel.countDocuments(filter),
    ]);
    return { items: docs.map(toUserData), total, page, totalPages: Math.max(1, Math.ceil(total / limit)) };
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
    return toUserData(await UserModel.create(data));
  }

  async update(id: string, data: UpdateUserInput): Promise<UserData | null> {
    const doc = await UserModel.findByIdAndUpdate(id, data, { returnDocument: "after", runValidators: true });
    return doc ? toUserData(doc) : null;
  }

  async delete(id: string): Promise<UserData | null> {
    const doc = await UserModel.findByIdAndDelete(id);
    return doc ? toUserData(doc) : null;
  }

  async stats(): Promise<UserStats> {
    const [resumen, porRol] = await Promise.all([
      UserModel.aggregate([{ $group: { _id: null, total: { $sum: 1 }, edadPromedio: { $avg: "$age" } } }]),
      UserModel.aggregate([{ $group: { _id: "$role", total: { $sum: 1 } } }, { $sort: { total: -1 } }]),
    ]);
    return {
      total: resumen[0]?.total ?? 0,
      edadPromedio: Math.round((resumen[0]?.edadPromedio ?? 0) * 10) / 10,
      porRol: porRol.map((r) => ({ role: r._id, total: r.total })),
    };
  }
}
