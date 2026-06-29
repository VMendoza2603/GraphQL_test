import { AppError } from "../errors/AppError";
import { ErrorCodes } from "../errors/errorCodes";

export function validateCreateUserInput(data: {
  name: string;
  email: string;
  age: number;
}): void {
  const errors: string[] = [];

  if (!data.name || data.name.trim().length === 0) {
    errors.push("El nombre es obligatorio");
  }

  if (!data.email || data.email.trim().length === 0) {
    errors.push("El email es obligatorio");
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push("El email no tiene un formato válido");
  }

  if (data.age == null || typeof data.age !== "number") {
    errors.push("La edad es obligatoria y debe ser un número");
  } else if (data.age < 0 || data.age > 150) {
    errors.push("La edad debe estar entre 0 y 150");
  }

  if (errors.length > 0) {
    throw new AppError(
      errors.join(". "),
      ErrorCodes.VALIDATION_ERROR,
      400
    );
  }
}

export function validateUpdateUserInput(data: {
  name?: string;
  email?: string;
  age?: number;
}): void {
  const errors: string[] = [];

  if (data.name !== undefined && data.name.trim().length === 0) {
    errors.push("El nombre no puede estar vacío");
  }

  if (data.email !== undefined) {
    if (data.email.trim().length === 0) {
      errors.push("El email no puede estar vacío");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.push("El email no tiene un formato válido");
    }
  }

  if (data.age !== undefined && (data.age < 0 || data.age > 150)) {
    errors.push("La edad debe estar entre 0 y 150");
  }

  if (errors.length > 0) {
    throw new AppError(
      errors.join(". "),
      ErrorCodes.VALIDATION_ERROR,
      400
    );
  }
}
