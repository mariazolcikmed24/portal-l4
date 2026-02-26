import { AnalyticsEvent } from "../types/analytics";

declare global {
  interface Window {
    dataLayer: any[];
  }
}

export const useDataLayer = () => {
  const pushEvent = (payload: AnalyticsEvent) => {
    // Initialize dataLayer if it doesn't exist
    window.dataLayer = window.dataLayer || [];

    // clearing the previous ecommerce object before sending a new one
    if ("ecommerce" in payload) {
      window.dataLayer.push({ ecommerce: null });
    }

    window.dataLayer.push(payload);
  };

  return { pushEvent };
};
