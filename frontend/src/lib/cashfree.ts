export interface CashfreeOrderResponse {
  cf_order_id: string;
  order_id: string;
  order_amount: number;
  order_currency: string;
  payment_session_id: string;
  order_status: string;
}

export interface CashfreeVerificationResponse {
  order_id: string;
  order_amount: number;
  order_currency: string;
  order_status: string;
  payment_status: "SUCCESS" | "FAILED" | "PENDING";
}

const getCashfreeHeaders = () => {
  // If we're not in the "production" environment variable, use the sandbox credentials
  // Ensure your .env has CASHFREE_CLIENT_ID and CASHFREE_CLIENT_SECRET
  if (!process.env.CASHFREE_CLIENT_ID || !process.env.CASHFREE_CLIENT_SECRET) {
    throw new Error(
      "Missing Cashfree API credentials in environment variables.",
    );
  }

  return {
    "x-client-id": process.env.CASHFREE_CLIENT_ID,
    "x-client-secret": process.env.CASHFREE_CLIENT_SECRET,
    "x-api-version": "2023-08-01",
    "Content-Type": "application/json",
    Accept: "application/json",
  };
};

const getCashfreeBaseUrl = () => {
  return process.env.CASHFREE_ENV === "production"
    ? "https://api.cashfree.com/pg"
    : "https://sandbox.cashfree.com/pg";
};

// Gets the absolute URL handling localhost vs Vercel
export const getAppUrl = () => {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/$/, "")}`;
  }
  return "http://localhost:3000";
};

export const normalizeCustomerPhone = (phone: string) => {
  const numeric = phone.replace(/\D/g, "");

  if (numeric.length === 12 && numeric.startsWith("91")) {
    const normalized = numeric.substring(2);
    if (/^\d{10}$/.test(normalized)) {
      return normalized;
    }
  }

  if (/^\d{10}$/.test(numeric)) {
    return numeric;
  }

  throw new Error("Invalid customer phone number");
};

const normalizeReturnPath = (returnPath: string) => {
  const trimmed = returnPath.trim();
  if (
    !trimmed.startsWith("/") ||
    trimmed.startsWith("//") ||
    trimmed.includes(":")
  ) {
    throw new Error("Invalid return path");
  }

  return trimmed;
};

export async function createCashfreeOrder({
  orderId,
  amount,
  currency = "INR",
  customerDetails,
  returnPath,
}: {
  orderId: string;
  amount: number;
  currency?: string;
  customerDetails: {
    customerId: string;
    customerPhone: string;
    customerEmail?: string;
    customerName?: string;
  };
  returnPath: string; // e.g. /orders
}) {
  const url = `${getCashfreeBaseUrl()}/orders`;
  const appUrl = getAppUrl();
  const returnUrl = `${appUrl}${normalizeReturnPath(returnPath)}`;

  const payload = {
    order_id: orderId,
    order_amount: amount,
    order_currency: currency,
    customer_details: {
      customer_id: customerDetails.customerId,
      customer_phone: normalizeCustomerPhone(customerDetails.customerPhone),
      ...(customerDetails.customerEmail
        ? { customer_email: customerDetails.customerEmail }
        : {}),
      ...(customerDetails.customerName
        ? { customer_name: customerDetails.customerName }
        : {}),
    },
    order_meta: {
      return_url: returnUrl,
    },
  };

  const response = await fetch(url, {
    method: "POST",
    headers: getCashfreeHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let data: any = {};
    try {
      data = await response.json();
    } catch {
      // Ignore malformed error payloads from Cashfree.
    }
    const message =
      data.message || JSON.stringify(data.type || data.error || data);
    throw new Error(`Cashfree create order failed: ${message}`);
  }

  const data = await response.json();
  return data as CashfreeOrderResponse;
}

export async function verifyCashfreePayment(
  orderId: string,
): Promise<CashfreeVerificationResponse> {
  // Direct server-to-server verification via Cashfree Payments API using order ID.
  const url = `${getCashfreeBaseUrl()}/orders/${encodeURIComponent(orderId)}`;

  const response = await fetch(url, {
    method: "GET",
    headers: getCashfreeHeaders(),
  });

  if (!response.ok) {
    let data: any = {};
    try {
      data = await response.json();
    } catch {
      // Ignore malformed error payloads from Cashfree.
    }
    throw new Error(
      `Payment verification failed: ${data.message || "Unknown error"}`,
    );
  }
  const data = await response.json();

  const paymentStatus =
    data.order_status === "PAID"
      ? "SUCCESS"
      : data.order_status === "ACTIVE"
        ? "PENDING"
        : "FAILED";

  return {
    order_id: data.order_id,
    order_amount: data.order_amount,
    order_currency: data.order_currency,
    order_status: data.order_status,
    payment_status: paymentStatus,
  };
}
