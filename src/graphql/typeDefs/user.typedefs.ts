export const userTypeDefs = `#graphql
  type User {
    id: ID!
    name: String!
    email: String!
    age: Int!
    createdAt: String!
    updatedAt: String!
  }

  input CreateUserInput {
    name: String!
    email: String!
    age: Int!
  }

  input UpdateUserInput {
    name: String
    email: String
    age: Int
  }

  type Query {
    usuarios: [User!]!
    usuario(id: ID!): User!
  }

  type Mutation {
    crearUsuario(data: CreateUserInput!): User!
    actualizarUsuario(id: ID!, data: UpdateUserInput!): User!
    eliminarUsuario(id: ID!): User!
  }
`;
