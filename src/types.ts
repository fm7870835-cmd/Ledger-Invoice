export type InvoiceStatus = 'Needs Review' | 'Confirmed' | 'Exported' | 'Paid' | 'Overdue' | 'Pending';

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  line_total: number;
  unsure?: boolean;
}

export interface Invoice {
  id: string;
  vendor_name: string;
  vendor_initials?: string;
  customer_name?: string;
  shop_logo?: string;
  invoice_number: string;
  invoice_date: string;
  due_date: string;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  currency: string;
  status: InvoiceStatus;
  line_items: LineItem[];
  low_confidence_fields?: string[];
  preview_url?: string;
  file_name?: string;
  file_size_kb?: number;
  created_at: string;
  confirmed_at?: string;
  exported_at?: string;
}

export type PlanTier = 'Starter' | 'Growth' | 'Professional' | 'Unlimited';

export interface UserProfile {
  name: string;
  email: string;
  role: string;
  account_id: string;
  timezone: string;
  plan: PlanTier;
  invoices_processed_this_month: number;
  monthly_limit: number;
  billing_cycle_reset_days: number;
  payment_card_last4: string;
  payment_card_exp: string;
  shop_name?: string;
  shop_logo?: string;
  shop_phone?: string;
  shop_address?: string;
}

export interface ExtractionResult {
  vendor_name: string;
  invoice_number: string;
  invoice_date: string;
  due_date: string;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  currency: string;
  line_items: Array<{
    description: string;
    quantity: number;
    unit_price: number;
    line_total: number;
    unsure?: boolean;
  }>;
  low_confidence_fields: string[];
}
