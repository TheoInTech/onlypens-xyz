import NextAuth from "next-auth";
import { authOptions } from "@/lib/authOptions";

// Create auth handler with options
const handler = NextAuth(authOptions);

// Export handler functions for app router
export { handler as GET, handler as POST };
