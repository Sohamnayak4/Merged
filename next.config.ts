import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The share cards read their fonts from assets/ at request time. Nothing
  // imports those files, so tracing can't infer them and they'd be missing
  // from the serverless bundle — cards would silently fall back to a system
  // font in production only.
  outputFileTracingIncludes: {
    "/opengraph-image": ["./assets/**"],
    "/twitter-image": ["./assets/**"],
    "/[login]/opengraph-image": ["./assets/**"],
    "/[login]/twitter-image": ["./assets/**"],
  },
};

export default nextConfig;
