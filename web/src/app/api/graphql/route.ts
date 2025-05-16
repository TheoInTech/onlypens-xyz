import { NextResponse } from "next/server";
import { executeGraphQuery } from "@/lib/graph-client";

// Define the expected request body type
interface GraphQLRequestBody {
  query: string;
  variables?: Record<string, unknown>;
}

// POST handler for GraphQL requests
export async function POST(request: Request) {
  try {
    // Parse request body
    const body = (await request.json()) as GraphQLRequestBody;
    const { query, variables } = body;

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    // Execute the GraphQL query using our secure server-side client
    const data = await executeGraphQuery(query, variables);

    // Return the response
    return NextResponse.json({ data });
  } catch (error) {
    console.error("GraphQL API route error:", error);
    return NextResponse.json(
      { error: "Failed to execute GraphQL query" },
      { status: 500 }
    );
  }
}
