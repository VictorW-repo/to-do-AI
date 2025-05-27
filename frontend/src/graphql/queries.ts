import { gql } from '@apollo/client';

// Fragment for todo fields - removing category since it's not in your schema
export const TODO_FRAGMENT = gql`
  fragment TodoFields on Todo {
    id
    title
    description
    status
    priority
    dueDate
    isAiGenerated
    createdAt
    updatedAt
    completedAt
  }
`;

// Query to get all todos
export const GET_TODOS = gql`
  query GetTodos($includeCompleted: Boolean = true, $limit: Int = 100, $offset: Int = 0) {
    todos(includeCompleted: $includeCompleted, limit: $limit, offset: $offset) {
      ...TodoFields
    }
  }
  ${TODO_FRAGMENT}
`;

// Query to get a single todo by ID
export const GET_TODO = gql`
  query GetTodo($id: Int!) {
    todo(id: $id) {
      ...TodoFields
    }
  }
  ${TODO_FRAGMENT}
`;

// Types for query responses
export interface Todo {
  id: number;
  title: string;
  description: string | null;
  status: 'PENDING' | 'COMPLETED';
  priority: number;
  dueDate: string | null;
  isAiGenerated: boolean;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
}

export interface GetTodosResponse {
  todos: Todo[];
}

export interface GetTodoResponse {
  todo: Todo | null;
}

export interface GetTodosVariables {
  includeCompleted?: boolean;
  limit?: number;
  offset?: number;
}

export interface GetTodoVariables {
  id: number;
}