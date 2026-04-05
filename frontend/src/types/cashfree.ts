export interface CashfreeCheckoutOptions {
  paymentSessionId: string;
  redirectTarget?: string;
}

export interface CashfreeCheckoutResult {
  error?: unknown;
  paymentDetails?: unknown;
}

export interface CashfreeInstance {
  checkout(options: CashfreeCheckoutOptions): Promise<CashfreeCheckoutResult>;
}

export interface CashfreeFactory {
  (options: { mode: string }): CashfreeInstance;
}
