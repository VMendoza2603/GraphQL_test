import { Schema, model, Document } from "mongoose";

export interface IUserDocument extends Document {
  name: string;
  email: string;
  age: number;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUserDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    age: { type: Number, required: true, min: 0, max: 150 },
  },
  { timestamps: true }
);

export const UserModel = model<IUserDocument>("User", userSchema);
