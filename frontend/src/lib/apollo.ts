import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

// API endpoints
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
const GRAPHQL_HTTP_URL = `${API_URL}/graphql`;

// HTTP link for queries and mutations
const httpLink = new HttpLink({
  uri: GRAPHQL_HTTP_URL,
});

// Create the Apollo Client instance
export const apolloClient = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
    },
  },
  connectToDevTools: process.env.NODE_ENV !== 'production',
});

// Apollo Client type for TypeScript
export type ApolloClientType = typeof apolloClient;