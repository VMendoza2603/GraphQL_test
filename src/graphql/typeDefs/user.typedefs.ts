export const userTypeDefs = `#graphql
  "Rol del usuario dentro de la universidad"
  enum Rol {
    ESTUDIANTE
    DOCENTE
    ADMINISTRATIVO
  }

  enum OrdenUsuarios {
    NOMBRE
    EDAD
    RECIENTES
  }

  type User {
    id: ID!
    name: String!
    email: String!
    age: Int!
    role: Rol!
    createdAt: String!
    updatedAt: String!
  }

  "Resultado paginado"
  type UserPage {
    items: [User!]!
    total: Int!
    page: Int!
    totalPages: Int!
  }

  type ConteoPorRol {
    role: Rol!
    total: Int!
  }

  type Estadisticas {
    total: Int!
    edadPromedio: Float!
    porRol: [ConteoPorRol!]!
  }

  input CreateUserInput {
    name: String!
    email: String!
    age: Int!
    role: Rol
  }

  input UpdateUserInput {
    name: String
    email: String
    age: Int
    role: Rol
  }

  type Query {
    "Lista paginada con búsqueda por nombre o email (máximo 50 por página)"
    usuarios(page: Int = 1, limit: Int = 10, search: String, role: Rol, orderBy: OrdenUsuarios = RECIENTES): UserPage!
    usuario(id: ID!): User!
    estadisticas: Estadisticas!
  }

  type Mutation {
    crearUsuario(data: CreateUserInput!): User!
    actualizarUsuario(id: ID!, data: UpdateUserInput!): User!
    eliminarUsuario(id: ID!): User!
  }
`;
