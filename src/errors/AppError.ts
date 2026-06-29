import { GraphQLError } from "graphql";

export class AppError extends GraphQLError {
  constructor(message: string, code: string, statusCode: number = 400) {
    super(message, {
      extensions: {
        code,
        statusCode,
      },
    });
  }
}
