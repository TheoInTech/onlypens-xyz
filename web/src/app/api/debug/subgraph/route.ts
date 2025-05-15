import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { request as graphqlRequest } from "graphql-request";

// Subgraph URL and headers configuration
const SUBGRAPH_URL = process.env.SUBGRAPH_URL!;
const GRAPH_API_KEY = process.env.THE_GRAPH_API_KEY!;

// Headers for authorization if API key is available
const headers = GRAPH_API_KEY
  ? { Authorization: `Bearer ${GRAPH_API_KEY}` }
  : undefined;

/**
 * POST /api/debug/subgraph
 * Direct query to the subgraph for debugging purposes
 * Body should contain:
 * - query: GraphQL query string
 * - variables: query variables
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication - only allow authenticated users with admin access
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token || !token.sub) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: "Unauthorized. Please sign in.",
        },
        { status: 401 }
      );
    }

    // Restrict to specific addresses for security (replace with your admin addresses)
    const adminAddresses = [
      "0xD86a2dAF5f2C38C5d5ea5cd0A5789E1b52Ac97fE", // Your wallet address from the logs
    ].map((addr) => addr.toLowerCase());

    const userAddress = token.sub.toLowerCase();
    const isAdmin = adminAddresses.includes(userAddress);

    if (!isAdmin) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: "Debug API restricted to admin users.",
        },
        { status: 403 }
      );
    }

    // Check if subgraph URL is configured
    if (!SUBGRAPH_URL) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: "Subgraph URL is not configured.",
        },
        { status: 500 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Validate request
    if (!body.query) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: "Missing required 'query' field.",
        },
        { status: 400 }
      );
    }

    // Execute the query
    const result = await graphqlRequest(
      SUBGRAPH_URL,
      body.query,
      body.variables || {},
      headers
    );

    // Return the result
    return NextResponse.json({
      success: true,
      data: result,
      error: null,
    });
  } catch (error) {
    console.error("Error querying subgraph:", error);
    return NextResponse.json(
      {
        success: false,
        data: null,
        error:
          error instanceof Error ? error.message : "Failed to query subgraph",
      },
      { status: 500 }
    );
  }
}
