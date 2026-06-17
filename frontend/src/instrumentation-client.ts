// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

// Client runtime can only read NEXT_PUBLIC_ env vars.
const sentryDsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
const parsedClientRate = parseFloat(
  process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE ?? "0",
);
const tracesSampleRate = Math.min(
  1,
  Math.max(0, Number.isFinite(parsedClientRate) ? parsedClientRate : 0),
);
const enableSentryLogs = process.env.NEXT_PUBLIC_SENTRY_ENABLE_LOGS === "true";
const sentryEnvironment =
  process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || process.env.NODE_ENV;

Sentry.init({
  dsn: sentryDsn,
  enabled: Boolean(sentryDsn),
  environment: sentryEnvironment,
  release: process.env.NEXT_PUBLIC_SENTRY_RELEASE,

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate,
  // Session Replay settings for user-facing apps
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  // Enable logs to be sent to Sentry
  enableLogs: enableSentryLogs,

  // Enable sending user PII (Personally Identifiable Information)
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#sendDefaultPii
  sendDefaultPii: process.env.NEXT_PUBLIC_SENTRY_SEND_DEFAULT_PII === "true",

  integrations: [Sentry.replayIntegration()],
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
