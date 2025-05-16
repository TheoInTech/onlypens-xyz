import { useQuery, useMutation } from "@tanstack/react-query";

interface GraphQLResponse<T> {
  data: T;
}

interface GraphQLError {
  error: string;
}

/**
 * Custom hook for executing GraphQL queries through our secure server endpoint
 */
export function useGraphQuery<
  TData,
  TVariables extends Record<string, unknown> = Record<string, unknown>,
>(
  queryKey: string[],
  query: string,
  variables?: TVariables,
  options?: {
    enabled?: boolean;
    refetchInterval?: number | false;
    staleTime?: number;
  }
) {
  return useQuery<TData>({
    queryKey,
    queryFn: async () => {
      const response = await fetch("/api/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query,
          variables,
        }),
      });

      const result = (await response.json()) as
        | GraphQLResponse<TData>
        | GraphQLError;

      if ("error" in result) {
        throw new Error(result.error);
      }

      return result.data;
    },
    ...options,
  });
}

/**
 * Custom hook for executing GraphQL mutations through our secure server endpoint
 */
export function useGraphMutation<
  TData,
  TVariables extends Record<string, unknown> = Record<string, unknown>,
>(
  query: string,
  options?: {
    onSuccess?: (data: TData) => void;
    onError?: (error: Error) => void;
  }
) {
  return useMutation<TData, Error, TVariables>({
    mutationFn: async (variables) => {
      const response = await fetch("/api/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query,
          variables,
        }),
      });

      const result = (await response.json()) as
        | GraphQLResponse<TData>
        | GraphQLError;

      if ("error" in result) {
        throw new Error(result.error);
      }

      return result.data;
    },
    ...options,
  });
}
