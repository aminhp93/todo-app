export const typeDefs = `#graphql
  type Todo {
    id: ID!
    title: String!
    completed: Boolean!
    categoryId: ID
    createdAt: String!
  }

  type DeleteTodoResult {
    message: String!
    todo: Todo!
  }

  type Query {
    todos: [Todo!]!
    todo(id: ID!): Todo
  }

  type Mutation {
    createTodo(title: String!, categoryId: ID): Todo!
    updateTodo(id: ID!, title: String, completed: Boolean): Todo!
    deleteTodo(id: ID!): DeleteTodoResult!
  }
`;
