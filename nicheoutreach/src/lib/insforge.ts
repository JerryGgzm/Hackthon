import { createClient } from "@insforge/sdk";

function getInsforgeClient() {
  const baseUrl = process.env.INSFORGE_URL;
  if (!baseUrl) {
    throw new Error("INSFORGE_URL environment variable is not set");
  }

  const anonKey = process.env.INSFORGE_ANON_KEY;
  if (!anonKey) {
    throw new Error("INSFORGE_ANON_KEY environment variable is not set");
  }

  return createClient({
    baseUrl,
    anonKey,
    isServerMode: true,
  });
}

// Singleton for server-side usage
export const insforge = getInsforgeClient();
