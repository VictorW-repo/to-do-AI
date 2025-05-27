import { gql } from '@apollo/client';
import { TODO_FRAGMENT } from './queries';
import type { Todo } from './queries';

// Mutation to create a new todo
export const CREATE_TODO = gql`
  mutation CreateTodo($input: CreateTodoInput!) {
    createTodo(input: $input) {
      todo {
        ...TodoFields
      }
    }
  }
  ${TODO_FRAGMENT}
`;

// Mutation to update an existing todo
export const UPDATE_TODO = gql`
  mutation UpdateTodo($input: UpdateTodoInput!) {
    updateTodo(input: $input) {
      todo {
        ...TodoFields
      }
    }
  }
  ${TODO_FRAGMENT}
`;

// Mutation to toggle todo status (complete/incomplete)
export const TOGGLE_TODO_STATUS = gql`
  mutation ToggleTodoStatus($id: Int!) {
    toggleTodoStatus(id: $id) {
      todo {
        ...TodoFields
      }
    }
  }
  ${TODO_FRAGMENT}
`;

// Mutation to delete a todo
export const DELETE_TODO = gql`
  mutation DeleteTodo($id: Int!) {
    deleteTodo(id: $id) {
      success
      id
    }
  }
`;

// New mutation for non-streaming todo generation
export const GENERATE_TODO_SUGGESTION = gql`
  mutation GenerateTodoSuggestion {
    generateTodoSuggestion {
      suggestion
    }
  }
`;

// Types for mutation inputs and responses
export interface CreateTodoInput {
  title: string;
  description?: string | null;
  priority?: number;
  dueDate?: string | null;
  isAiGenerated?: boolean;
}

export interface UpdateTodoInput {
  id: number;
  title?: string;
  description?: string | null;
  status?: 'PENDING' | 'COMPLETED';
  priority?: number;
  dueDate?: string | null;
}

export interface CreateTodoResponse {
  createTodo: {
    todo: Todo;
  };
}

export interface UpdateTodoResponse {
  updateTodo: {
    todo: Todo | null;
  };
}

export interface ToggleTodoStatusResponse {
  toggleTodoStatus: {
    todo: Todo | null;
  };
}

export interface DeleteTodoResponse {
  deleteTodo: {
    success: boolean;
    id: number | null;
  };
}

export interface GenerateTodoSuggestionResponse {
  generateTodoSuggestion: {
    suggestion: string;
  };
}