// Default Google Analytic Types for GTM
export interface EcommerceItem {
  item_id: string;
  item_name: string;
  price: number;
  item_brand?: string;
  item_category?: string;
  quantity?: number;
}

export type AnalyticsEvent =
  | {
      event: "view_item";
      ecommerce: {
        currency: string;
        value: number;
        items: EcommerceItem[];
      };
    }
  | {
      event: "add_to_cart";
      ecommerce: {
        currency: string;
        value: number;
        items: EcommerceItem[];
      };
    }
  | {
      event: "view_cart";
      ecommerce: {
        currency: string;
        value: number;
        items: EcommerceItem[];
      };
    }
  | {
      event: "begin_checkout";
      ecommerce: {
        currency: string;
        value: number;
        items: EcommerceItem[];
      };
    }
  | {
      event: "purchase";
      ecommerce: {
        transaction_id: string;
        value: number;
        currency: string;
        tax?: number;
        shipping?: number;
        items: EcommerceItem[];
      };
    }
  | {
      event: "custom_interaction";
      label: string;
      category: string;
    }
  | {
      event: "payment_failed";
      error_type: string;
      order_id: string;
    };
