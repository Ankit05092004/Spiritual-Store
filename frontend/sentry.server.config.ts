// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN ?? "___DSN___",
  enabled: Boolean(process.env.SENTRY_DSN),

  environment: process.env.SENTRY_ENVIRONMENT ?? process.env.NODE_ENV,
  release: process.env.SENTRY_RELEASE,

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,

  // Attach local variable values to stack frames on server errors
  includeLocalVariables: true,

  // Enable logs to be sent to Sentry
  enableLogs: process.env.SENTRY_ENABLE_LOGS === "true",

  // Enable sending user PII (Personally Identifiable Information)
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#sendDefaultPii
  sendDefaultPii: process.env.SENTRY_SEND_DEFAULT_PII === "true",
});
