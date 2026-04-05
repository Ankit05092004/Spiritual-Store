let loadingPromise: Promise<boolean> | null = null;

export const loadCashfreeScript = () => {
  if (window.Cashfree) {
    return Promise.resolve(true);
  }

  if (loadingPromise) {
    return loadingPromise;
  }

  loadingPromise = new Promise((resolve) => {
    const script = document.createElement("script");
    // Ensure we load the v3 script
    script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
    script.async = true;

    script.onload = () => {
      resolve(true);
    };

    script.onerror = () => {
      loadingPromise = null;
      resolve(false);
    };

    document.body.appendChild(script);
  });

  return loadingPromise;
};
