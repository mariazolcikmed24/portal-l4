// Default Google Analytic Types for GTM
export interface EcommerceItem {
  item_id: string;
  item_name: string;
  price: number;
  item_brand?: string;
  item_category?: string;
  item_category2?: string;
  item_category3?: string;
  item_category4?: string;
  item_category5?: string;
  quantity?: number;
}

export interface Ecommerce {
  transaction_id?: string;
  value: number;
  currency: string;
  tax?: number;
  shipping?: number;
  items: EcommerceItem[];
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
    }
  | {
      event: "form_step_submit";
      step_name: string;
      step_number: number;
      form_name: "e_zwolnienie";
      // Parametry biznesowe (opcjonalne, zależne od kroku)
      leave_type?: string;
      symptom_category?: string;
      symptom_duration?: string;
      has_chronic?: boolean;
      has_attachments?: boolean;
      takes_meds?: boolean;
    }
  | {
      event: "sign_up";
      method: string;
    }
  | {
      event: "add_payment_info";
      ecommerce: Ecommerce;
    };
