import { gql } from '@apollo/client';

// This file is kept for backward compatibility but the subscription is deprecated

// GraphQL subscription for AI-generated todo suggestions - DEPRECATED
export const GENERATE_TODO_SUBSCRIPTION = gql`
  subscription GenerateTodo {
    generateTodo {
      token
    }
  }
`;

// Type definitions for subscription response
export interface GenerateTodoToken {
  token: string;
}

export interface GenerateTodoSubscriptionResponse {
  generateTodo: GenerateTodoToken;
}

// Note: Use the GENERATE_TODO_SUGGESTION mutation from mutations.ts instead