// src/utils/analytics.ts

export function loadUmami() {
  // Only load analytics in production and if env vars are set
  if (
    import.meta.env.MODE === "production" &&
    import.meta.env.VITE_ANALYTICS_ENDPOINT &&
    import.meta.env.VITE_ANALYTICS_WEBSITE_ID
  ) {
    const script = document.createElement("script");
    script.defer = true;
    script.src = `${import.meta.env.VITE_ANALYTICS_ENDPOINT}/umami`;
    script.setAttribute("data-website-id", import.meta.env.VITE_ANALYTICS_WEBSITE_ID);
    document.body.appendChild(script);
  }
}
