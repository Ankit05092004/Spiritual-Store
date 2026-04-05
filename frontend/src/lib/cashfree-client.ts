export const loadCashfreeScript = () => {
  return new Promise((resolve) => {
    // Return early if already loaded
    if (window.Cashfree) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    // Ensure we load the v3 script
    script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
    script.async = true;

    script.onload = () => {
      resolve(true);
    };

    script.onerror = () => {
      resolve(false);
    };

    document.body.appendChild(script);
  });
};
