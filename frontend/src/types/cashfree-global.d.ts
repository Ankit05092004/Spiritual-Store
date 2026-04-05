import type { CashfreeFactory } from "./cashfree";

declare global {
  interface Window {
    Cashfree?: CashfreeFactory;
  }
}

export {};
