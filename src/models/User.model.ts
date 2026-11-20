import { Schema, model, Document } from "mongoose";

export const ROLES = ["ESTUDIANTE", "DOCENTE", "ADMINISTRATIVO"] as const;
export type Rol = (typeof ROLES)[number];

export interface IUserDocument extends Document {
  name: string;
  email: string;
  age: number;
  role: Rol;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUserDocument>(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    age: { type: Number, required: true, min: 0, max: 150 },
    role: { type: String, enum: ROLES, default: "ESTUDIANTE" },
  },
  { timestamps: true }
);

userSchema.index({ role: 1 });
userSchema.index({ createdAt: -1 });

export const UserModel = model<IUserDocument>("User", userSchema);
