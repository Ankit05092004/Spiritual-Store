// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

const sentryDsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;
const parsedRate = parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE ?? "0");
const safeParsedRate = Number.isNaN(parsedRate) ? 0 : parsedRate;
const tracesSampleRate = Math.min(1, Math.max(0, safeParsedRate));
const enableSentryLogs = process.env.SENTRY_ENABLE_LOGS === "true";

Sentry.init({
  dsn: sentryDsn,

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate,

  // Enable logs to be sent to Sentry
  enableLogs: enableSentryLogs,

  // Enable sending user PII (Personally Identifiable Information)
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#sendDefaultPii
  sendDefaultPii: process.env.SENTRY_SEND_DEFAULT_PII === "true",
});
