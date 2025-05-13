import { GraphQLClient } from "graphql-request";

// API URL from environment variable
const API_URL =
  process.env.NEXT_PUBLIC_GRAPH_API_URL ||
  "https://api.studio.thegraph.com/query/110790/onlypens/version/latest";

// API key from environment variable (only available server-side)
const API_KEY = process.env.GRAPH_API_KEY;

// Create headers with API key if available (will only be available server-side)
const createHeaders = () => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (API_KEY) {
    headers["Authorization"] = `Bearer ${API_KEY}`;
  }

  return headers;
};

// Create a server-side GraphQL client
export const serverGraphClient = new GraphQLClient(API_URL, {
  headers: createHeaders(),
});

// Function to execute GraphQL queries on the server
export async function executeGraphQuery<TData>(
  query: string,
  variables?: Record<string, unknown>
): Promise<TData> {
  try {
    const data = await serverGraphClient.request<TData>({
      document: query,
      variables: variables || {},
    });
    return data;
  } catch (error) {
    console.error("GraphQL query error:", error);
    throw error;
  }
}
