import { withSentryConfig } from "@sentry/nextjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Puedes dejar otras opciones de Next.js aquí, pero NO el bloque "webpack"
  images: {
    domains: ["res.cloudinary.com"],
  },
};

export default withSentryConfig(nextConfig, {
  org: "takito",
  project: "sentry-museo",
  silent: !process.env.CI,
  widenClientFileUpload: true,
  disableLogger: true,
  automaticVercelMonitors: true,
});
